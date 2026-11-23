# Safe PWA updates and versioning

Current app version is 0.4.0; private review edition is 2.1.0-draft; public religious edition remains 1.1.0 and IndexedDB/backups remain v2. The protocol below is unchanged for public/local offline builds. Authenticated remote staging deliberately has no worker or offline draft cache; wait for Saved/export before deliberate reload. Use [public readiness](PUBLIC_RELEASE_READINESS.md) for current hosting, atomic rollout and rollback and [review staging](REVIEWER_STAGING_DEPLOYMENT.md) for the separate access boundary. The 0.2.0 references below describe the original protocol milestone.

## Version boundaries

Application version: package.json (`0.2.0` for this milestone). Content edition: `src/content/schema.ts` (`1.1.0`). IndexedDB schema and backup format remain **2**. These numbers are independent. A content/UI release does not justify incrementing or replacing the user database.

Vite injects the app version and a deterministic build ID (version plus a short source/asset/config/lockfile hash). The ID is common to the release, not a user/device identifier. `ZAAD_BUILD_ID` is reserved for unique CI/test release IDs; never reuse an override for different artifacts. `src/release.ts` points to bilingual release-note message IDs. Keep both locales complete.

## Activation protocol

1. The app registers the root-scope worker on HTTPS/localhost. It checks on opening/online resumption and offers a manual check. It never claims that a new release downloads while offline or while the app is closed.
2. A downloaded worker waits. There is no unconditional install-time skipWaiting, auto refresh, or legacy SKIP_WAITING handler.
3. The user explicitly confirms the update. The app pauses interactions, blurs existing edit fields, flushes debounced du'a drafts, drains the serialized save queue, checks unresolved errors/new-entry forms and waits for actual readwrite IndexedDB transactions to complete.
4. A commit-level Dexie middleware blocks new writes during activation. A short-lived same-origin localStorage lease also protects newly opened tabs. It contains only an ephemeral coordination token, expiry and target build ID; it is never transmitted, tracked, included in backups or used as a device identifier. Personal data remains in IndexedDB. If a lease cannot be acquired, in-place activation is refused.
5. The worker checks that the requesting window is the only open window on that origin. Multiple windows are conservatively rejected, even if another window appears idle. The prepared worker sends READY with its build ID. Only after recording that target does the frozen client send COMMIT. The worker checks windows again before activation.
6. Pre-commit timeout or rejection leaves the worker waiting and restores editing. After COMMIT, the client stays frozen until controller change reloads it; it must not resume editing on a timer while activation could still occur. The target build clears the temporary lease on load. If a page/process disappears, its lease expires rather than locking storage forever.

The service worker only manages same-origin app asset caches and navigation fallback. It imports no user database module and never deletes IndexedDB, notes, tasks, trips or preferences. Both language catalogs and manifests are local/precache assets. No external font/content API is needed.

## First upgrade from the older 0.1 client

The old client only understands the older update message. The new worker intentionally does not accept an unsafe legacy activation request. For the first upgrade: wait for Saved, export a backup, close **all** ZAAD browser/PWA windows, then reopen online. The waiting worker can activate after the old clients close. Do not clear site data or IndexedDB. This legacy-client/physical-device rollout remains a manual release check; automated update testing starts from the new safe protocol.

## Hosting contract

- HTTPS, origin-root deployment, SPA fallback to index.html. Do not cache a missing JS/font response as HTML.
- Serve sw.js without long-lived HTTP caching; register uses updateViaCache=none. HTML and both manifests must revalidate. Hashed assets may be immutable.
- Publish one complete immutable build atomically. Never publish HTML/worker before all their precache assets exist. Retain previous hashed assets during rollout so an installing or still-running older shell can finish requests.
- Preserve origin and worker scope. IndexedDB belongs to its origin; changing domain/port does not migrate notes. Export before an intentional origin move.
- Apply `_headers` or equivalent CSP/security policy on the actual host; worker cache cleanup is not site-data clearing. Do not add Clear-Site-Data headers or deploy scripts that delete IndexedDB.
- Deploy only `dist/`, never `.test-release/`, `e2e/`, source/editorial files, local feedback databases, caches or test harness endpoints.

## Verification boundaries

Chromium tests exercise two actual worker builds on a local test origin, explicit cancellation/confirmation, pending Arabic drafts, reload/data recovery, multi-window rejection and retry. Unit tests exercise pending-write barriers, failed saves, frozen write refusal and backward backup compatibility. The harness is local-only and not an application backend.

OS process termination, storage eviction, Safari/iOS installation/background behavior, deployed CDN headers and a physical legacy-client rollout still need manual verification. No web app can guarantee a transaction after forced OS termination or preserve data after explicit browser clearing/uninstall. Keep backups. If opening during another update, wait for it to finish and retry; do not erase storage to resolve a temporary update pause.
