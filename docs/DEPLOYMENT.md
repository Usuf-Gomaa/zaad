# Static deployment

Current 0.4.0 deployment instructions supersede the historical notes below: [public readiness](PUBLIC_RELEASE_READINESS.md) and [authenticated reviewer staging](REVIEWER_STAGING_DEPLOYMENT.md). `hosting/Caddyfile` provides the tested public/review routing, headers and whole-origin authentication configuration. `.staging-dist/` is network-only and requires a fresh dedicated authenticated HTTPS origin; `.review-dist/` remains trusted local offline review only. No deployment is authorized or performed.

The v2 editorial handoff is **not** a deployment request. `.review-dist/`, supplied Markdown, feedback exports and the loopback runner are private review materials and must not be uploaded to public hosting. Default public builds compile review mode off; private builds default to their own output directory and include a private marker. The review runner is read-only and loopback-only, not an authenticated remote staging service. Obtain explicit authorization and design access control separately before any network-hosted review environment.

For 0.2.0, follow [UPDATES_AND_VERSIONING.md](UPDATES_AND_VERSIONING.md) and [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). Do not deploy without explicit authorization. Deploy only `dist/`, never `.test-release/` or the local test server. Preserve origin/IndexedDB and both language manifests, publish assets atomically, retain old hashed assets during rollout and do not send Clear-Site-Data. The first legacy-client upgrade requires closing all saved/backed-up ZAAD windows; do not clear site storage.

1. Run `npm ci`, `npm test`, `npm run build`, and the browser checks documented in README.
2. Deploy only `dist/` to an HTTPS static host at the domain root. Configure SPA fallback to `/index.html`. `_redirects` and `_headers` are supplied for compatible static hosts; copy equivalent settings for other hosts.
3. Serve `sw.js` with no-cache. Do not apply immutable caching to HTML, manifest or service-worker entry. Hashed asset files may use long-lived immutable caching. Keep deploys atomic so clients can retrieve all precache entries.
4. Verify manifest, icon URLs, CSP headers, deep-link reloads, install and offline launch after `navigator.serviceWorker.ready`. Test a real Android and iPhone Safari. Test a deployed version update while a draft exists and verify data afterward.
5. Before public release, review religious-content scope, brand/domain availability, host logging/privacy policy and free-tier quotas. No hosting account is selected or live deployment performed by this implementation request.

There are no secrets, server endpoints, telemetry or databases to configure. App code fetches only same-origin application assets and service-worker updates. External religious links open only after an explicit click. Static host access logging is outside app control and must be assessed separately.

Browser data is origin-scoped: changing the deployment domain will not migrate local notes. Export before moving origins. Service-worker updates do not delete IndexedDB; browser eviction/clearing/uninstall can. Do not describe iOS storage as guaranteed.
