import { build } from "vite";
export async function buildReview() {
  process.env.ZAAD_REVIEW_BUILD = "1";
  process.env.ZAAD_STAGING_BUILD = '0';
  await build({ build: { outDir: ".review-dist" } });
}
await buildReview();
