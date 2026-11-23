import { build } from 'vite';
process.env.ZAAD_REVIEW_BUILD = '1';
process.env.ZAAD_STAGING_BUILD = '1';
await build({ build: { outDir: '.staging-dist' } });
