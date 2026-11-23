# Public release readiness — ZAAD 0.4.0

Prepared on 23 November 2026. **No deployment performed or authorized.** Software preparation does not authorize religious publication. All 51 religious records remain needs_review; zero normative records are in the public release. Source observations are partial research, not qualified approval. Public FAQ topics and review notices remain separate from app support; draft answers are available only in private builds.

## Completed implementation

- Integrated the v2.1 addendum as five claim-level source observations for B02, DUA-Q2-201, FAQ14/F04 and F01, covering four retrieved source pages. The 51 stable IDs, base Arabic paragraphs, original historical evidence and private feedback history are retained. The combined reviewer identity includes both source-document hashes. English research descriptions are not approved religious translations. Exact complete liturgical wording, grades and qualified approvals were not invented.
- Version 0.4.0 and bilingual release notes are independent of public religious edition 1.1.0, private review edition 2.1.0-draft and database versions. The public UI remains Arabic/English with RTL/LTR and locally persisted language; user-authored text is not translated. Both public language bundles/fonts are local and precached.
- User IndexedDB remains **v2**, backup format v2 and editorial database v1. No user data was reset, migrated or opened in an existing browser profile. Current tests cover old-backup restoration and exact personal-draft preservation; tests run in isolated browser profiles/fake databases. No account, subscription, advertisement, tracking, analytics or application backend was introduced.
- Public worker activation still requires explicit confirmation, drained writes and the existing two-phase handshake/write lease; other open windows block activation. No new skipWaiting-on-install or automatic reload was added. Cache cleanup does not delete IndexedDB. Offline/closed devices do not receive immediate updates; checks require an open/running app and a reachable server.
- Public and review artifacts are separate. Public build-time and independent post-build publication scans reject draft paragraphs, source observations, fingerprints and editorial database code. Remote `.staging-dist/` has whole-origin authentication, no-store headers and no registered draft worker; `.review-dist/` remains trusted local offline review only.
- `hosting/Caddyfile` supplies automatic HTTPS configuration, HSTS, CSP, nosniff, restricted permissions, referrer policy, read-only methods, missing-asset 404s, SPA routes and separate cache policies. Public HTML/worker/manifests revalidate; content-hashed `/assets/` are immutable. No CDN or access logging is enabled. Review errors and authenticated responses are private/no-store with noindex and Authorization variance.

## Verification results

### Build checks

`npm run build` passed translation checking, strict TypeScript, public gate and Vite/Workbox generation. Public precache: 20 entries, approximately 752 KiB. `npm run staging:build` passed with a private marker, no service worker and no HTML manifest link. The local reviewer build also passed and retains offline precaching. Test-fixture versions are not deployment artifacts; rebuild normal artifacts before owner approval.

### Content checks

`npm run sources:identity` and `npm run content:status` passed. Counts: 51 IDs, 34 rites, 16 FAQs, one supplication candidate; 43 narrative drafts, seven research briefs, one exact prayer pending. Five partial observations/four pages; all 51 records blocked, no qualified or English approvals. The generated [matrix](RELIGIOUS_EVIDENCE_MATRIX.md) records limitations and itemized outstanding work.

### Translation checks

`npm run i18n:check` passed. Both UI catalogs contain the added source-state, staging and release-note messages. This verifies catalog presence, not linguistic or scholarly correctness. Religious English remains withheld/pending; original Arabic quotations are preserved without a fabricated meaning translation.

### Unit checks

`npm test` passed: **39 tests, nine files**. Includes original persistence/backup/publication/language/update tests, source-document hash binding and addendum scope/export checks. Feedback does not grant approval; error/retry and changed-source history behavior remain tested.

### Browser checks

`npm run test:e2e` passed: **10 Chromium tests**, final run 19.3 seconds. Covers public publication/bypass protection, bilingual offline and exact drafts while switching language, older backup restoration, trip/checklist persistence, responsive widths, protected local review and all FAQs, development review feedback, real safe worker updates/multiple windows, and authenticated network-only Caddy staging with per-record observations and persisted feedback. The staging test confirms the “Online review” label and zero worker/cache registrations. Local test origins use 4173/4176/4180/4280/4281/5175; none uses existing user profiles. The 375px staging source/feedback screenshot was visually inspected; physical-device and assistive-technology review remain open.

### Security and hosting checks

`npm run security:check` passed static host-policy and staging-artifact checks. `npm run hosting:test` passed **20 real-Caddy loopback scenarios** using official Caddy 2.11.9, archive checked against the publisher's SHA-512 checksum. Tests cover anonymous/wrong/correct authentication, every protected resource class including errors, missing assets, read-only methods, SPA routing, public immutable asset caching and worker revalidation. Configuration adaptation/validation passed. Local listeners use HTTP on loopback only; this does **not** validate public TLS, DNS, a proxy perimeter or credential delivery.

`npm audit --cache D:\zad\.npm-cache` passed: **0 vulnerabilities** at validation time. npm audit covers the Node dependency graph, not the operating system, Caddy package, hosting provider or future advisories.

### Publication-gate checks

`npm run publication:check` passed: all 51 IDs preserved and blocked, no private text/observations/fingerprints/editorial DB in public output, no public review marker. The build has an additional generated-bundle scan. Public browser routing rejects URL/client-flag access to review. The currently-zero publication allowlist must only be revised deliberately after genuine qualified review.

## Exact authorized deployment process — future owner action

These are instructions for a Linux/Caddy host, not executed commands. Obtain explicit approval of the provider/cost, domains, access policy and exact tested build IDs first. Keep the existing public scheme/host/port if already used: browser IndexedDB is origin-scoped. A new custom domain cannot automatically see data on an old origin. Where a move is necessary, let users export a backup from the old origin and explicitly restore at the new origin; do not claim DNS transfers local data.

1. Follow the server, DNS A/AAAA, firewall, protected environment and maintained Caddy setup in [review staging](REVIEWER_STAGING_DEPLOYMENT.md). Use HTTPS on port 443, redirect port 80, configure domain ownership and ensure ACME reachability/certificate storage. No query credentials, public bucket or preview server. For public-only hosting, omit the reviewer site block rather than pointing it at the public artifact. Do not expose drafts while staging credentials are incomplete.
2. On the trusted release machine run `npm ci`, `npm run build`, `npm test`, `npm run staging:build`, `npm run content:status`, `npm run i18n:check`, `npm run publication:check`, `npm run security:check`, `npm run hosting:test`, `npm run test:e2e` and `npm audit`. Browser tests build fixtures; afterwards rerun normal `npm run review:build` and `npm run staging:build` if handing off those private artifacts. Retain `dist/` from the tested public build and record the footer build ID, lockfile and source hashes. Archive each artifact separately with checksums; do not expose the archives publicly.
3. After authorization, upload **only public `dist/` contents** to `/srv/zaad/public/releases/<unique-release-id>/`. Never upload the repository, source drafts, private builds, tests, `.tools`, node_modules, backups or reviewer exports. Public and review release trees must remain separate.
4. Keep previous public content-hashed assets available for already-open or older installed clients. For an update, copy earlier **public** `assets/` into the new public release with no overwrites/deletion, then run the publication scan on the assembled artifact before switching it live. Do not merge private assets. Retain old releases and asset versions under an explicit owner retention plan; deleting assets used by an old client can break lazy loading. Do not replace the new index/worker/manifest with older files.
5. Validate Caddy configuration with the actual protected service environment. Atomically switch the public root on the same filesystem:

```sh
ln -s /srv/zaad/public/releases/<unique-release-id> /srv/zaad/public/current.next
mv -Tf /srv/zaad/public/current.next /srv/zaad/public/current
```

Use a unique release directory and ensure `current.next` is not an old pending operation. First deployment must have its root prepared before serving. Static artifact switching needs no client storage change. Restart/reload the managed server only where configuration/environment changes require it, after authorization.

6. Validate live HTTPS/security headers, SPA `/faq` and `/support`, missing JS 404, actual hashed assets immutable, worker JavaScript MIME/no-cache, both manifests/icons, installability, and a fresh offline cold reload. Confirm no draft chunks or complete draft answers are public. Recheck all paths through any CDN; public worker/HTML/manifests must not be stuck behind immutable caching. Review must always bypass shared caches and require authentication.
7. From the previous version and a backed-up test profile, create unsaved drafts, wait/confirm update behavior, verify other windows block activation, then save and explicitly activate. Check exact notes/duas, categories, tasks, trips, checklist progress, language and backups after refresh. No forced activation, unregister/clear-storage script or Clear-Site-Data header is part of deployment. Confirm actual iOS/Android behavior separately.

## Rollback and update workflow

Retain the last known-good **public** artifact and its assets. Point `current.next` to that directory, atomically rename to `current`, verify footer/build ID and rerun routing/header/publication checks. Do not roll back by deploying a reviewer artifact or clearing browser data. A rollback is another available worker version, not an immediate remote replacement of already-running/offline clients; users still save and explicitly confirm activation. No database downgrade is needed because this release retains schema v2. Keep personal backups and old releases; do not erase IndexedDB to solve cache problems.

For an application change, increment app version, update both release-note languages, rebuild and retest. For religious changes, follow [the post-launch content workflow](POST_LAUNCH_CONTENT_UPDATE_WORKFLOW.md) and retain genuine claim-level qualified review. An approved app release can still contain zero normative records. Offline installed copies/exports of earlier content cannot be recalled immediately by a rollback.

## Remaining unverified / owner approval required

- **Religious:** complete claim coverage, all fourteen correction flags, comparative disputed views, chosen exact Qur'an/hadith text, actual qualified reviewer identity/qualifications/date and independent English review remain open. The four observed pages do not approve the guide. No religious record may be promoted from this work alone.
- **Live infrastructure:** no provider selected/provisioned, DNS changed, public certificate issued, custom domain or proxy tested, real credential generated/distributed, scholar invited or deployment performed. The owner must authorize these choices and costs, the data-retention/access policy, secure invitation/export channel and exact release/rollback target.
- **Manual devices/accessibility:** actual scholar-device authentication, mobile Safari/Android installation, physical OS termination/eviction and full screen-reader/linguistic review remain unverified. Chromium automation and local Caddy are narrower evidence.
- **Privacy:** app personal content/feedback remains local, but browser storage/export files and host connection/error logs can contain sensitive information. No analytics are added; the owner still must set operational-log retention and infrastructure access policies. Basic authentication is access control, not protection from a reviewer copying already-authorized text.

## Final validation record

Normal prepared artifact IDs (not deployed): public `0.4.0+8fc7ce2af6e2`, local offline review `0.4.0+8fc7ce2af6e2-review`, authenticated network-only staging `0.4.0+8fc7ce2af6e2-staging`. Per-file SHA-256 hashes and sizes are recorded in [the artifact inventory](RELEASE_ARTIFACTS_0_4_0.json). Rebuilding after changes invalidates this inventory; generate/review new checksums before authorizing an upload. The normal-artifact security/publication/real-Caddy checks also passed after rebuilding.

Final observed results: public build passed; 39 unit tests passed; all ten browser tests passed; content/translation/publication/static-security checks passed; 20 real-Caddy hosting scenarios passed; npm audit reported zero vulnerabilities. A first staging browser run failed because its expected save-message label was incorrect; the corrected full suite passed. Normal private artifacts are rebuilt separately from test fixture IDs for handoff. No deployment, DNS change, invitation or user-data reset occurred.
