import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { publishedRecords } from "./src/content/published";
import { publicationIssues } from "./src/content/publication";
import pkg from "./package.json";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import {
  reviewParagraphs,
  reviewPackSha256,
  duaPlanAr,
} from "./src/content/review-v2/pack-data";
import { sourceDocuments, reviewPackSha256 as reviewFingerprint, reviewEdition } from './src/content/review-v2/source-identity';
import { sourceObservations } from './src/content/review-v2/source-addendum';
const editorialBuild = process.env.ZAAD_REVIEW_BUILD === "1";
const stagingBuild = process.env.ZAAD_STAGING_BUILD === '1';
if (stagingBuild && !editorialBuild) throw Error('Staging requires the private reviewer build');
const digest = createHash("sha256");
function fingerprint(dir: string) {
  for (const file of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const path = `${dir}/${file.name}`;
    if (file.isDirectory()) fingerprint(path);
    else if (!path.includes("/test/") && !path.includes(".test."))
      digest.update(path).update(readFileSync(path));
  }
}
fingerprint("src");
fingerprint("public");
digest.update(readFileSync("package-lock.json"));
digest.update(readFileSync("vite.config.ts"));
const releaseId =
  process.env.ZAAD_BUILD_ID ||
  `${pkg.version}+${digest.digest("hex").slice(0, 12)}${stagingBuild ? '-staging' : editorialBuild ? "-review" : ""}`;
export default defineConfig({
  build: { outDir: stagingBuild ? '.staging-dist' : editorialBuild ? ".review-dist" : "dist" },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_ID__: JSON.stringify(releaseId),
    __EDITORIAL_REVIEW__: JSON.stringify(editorialBuild),
    __AUTHENTICATED_STAGING__: JSON.stringify(stagingBuild),
  },
  plugins: [
    {
      name: "zaad-content-publication-gate",
      apply: "build",
      buildStart() {
        for (const record of publishedRecords) {
          const issues = publicationIssues(record);
          if (issues.length)
            this.error(
              `Religious content ${record.id} is not publishable: ${issues.join("; ")}`,
            );
        }
      },
      generateBundle(_, bundle) {
        if (editorialBuild) {
          this.emitFile({
            type: "asset",
            fileName: "review-build.json",
            source: JSON.stringify({
              privateReview: true,
              edition: reviewEdition,
              sourcePackSha256: reviewFingerprint,
              sourceDocuments,
              authenticatedStaging: stagingBuild,
              offlineDraftCache: !stagingBuild,
              publicDistribution: false,
            }),
          });
          if (!stagingBuild) this.emitFile({
            type: "asset",
            fileName: "review-manifest-en.webmanifest",
            source: JSON.stringify({
              name: "ZAAD Review — Unapproved draft",
              short_name: "ZAAD Review",
              lang: "en",
              dir: "ltr",
              start_url: "/review",
              display: "standalone",
              background_color: "#f6f3eb",
              theme_color: "#123f35",
              icons: [
                {
                  src: "/icons/icon-192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "/icons/icon-512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "any maskable",
                },
              ],
            }),
          });
          return;
        }
        const forbidden = [
          reviewPackSha256,
          reviewFingerprint,
          duaPlanAr,
          ...Object.values(sourceObservations).flat().flatMap(s => [s.claim.ar, s.claim.en, s.rationale.ar, s.rationale.en, s.limits.ar, s.limits.en, s.quotationAr || '']).filter(Boolean),
          ...reviewParagraphs.flatMap((record) => [
            record.summaryAr,
            record.detailsAr,
          ]),
        ];
        for (const output of Object.values(bundle)) {
          const text =
            output.type === "chunk"
              ? output.code
              : typeof output.source === "string"
                ? output.source
                : "";
          if (forbidden.some((value) => text.includes(value)))
            this.error(
              `Unapproved v2 review content leaked into public asset ${output.fileName}`,
            );
        }
      },
    },
    react(),
    VitePWA({
      disable: stagingBuild,
      strategies: "injectManifest",
      srcDir: "src/pwa",
      filename: "sw.ts",
      injectRegister: false,
      registerType: "prompt",
      includeAssets: [
        "icons/*.svg",
        "FONT-LICENSE.txt",
        "manifest-en.webmanifest",
      ],
      manifest: {
        name: editorialBuild ? "زاد — مسودة المراجعة" : "زاد | رفيق رحلتك",
        short_name: editorialBuild ? "زاد مراجعة" : "زاد",
        lang: "ar",
        dir: "rtl",
        start_url: editorialBuild ? "/review" : "/",
        display: "standalone",
        background_color: "#f6f3eb",
        theme_color: "#123f35",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,woff,woff2,png,webmanifest}"],
      },
    }),
  ],
});
