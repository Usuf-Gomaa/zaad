// Test artifacts only. This is not a deployment or a public release.
import { build } from "vite";
process.env.ZAAD_BUILD_ID = "update-test-next";
process.env.ZAAD_REVIEW_BUILD = "0";
await build({ build: { outDir: ".test-release" } });
process.env.ZAAD_BUILD_ID = "review-test-private";
await import("./build-review.mjs");
process.env.ZAAD_BUILD_ID = 'staging-test-private';
await import('./build-staging.mjs');
