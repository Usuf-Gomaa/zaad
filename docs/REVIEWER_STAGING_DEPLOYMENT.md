# Authenticated reviewer staging — ZAAD 0.4.0

Prepared configuration, not a deployment. The owner must authorize hosting, domains, invited reviewers and the access policy before any upload or DNS change. Public religious publication remains blocked independently.

## Security boundary

Use a **new, dedicated HTTPS origin** for `.staging-dist/`, separate from the public app and all previous offline review origins. `hosting/Caddyfile` protects every review path with Caddy HTTP Basic authentication: HTML, lazy chunks, marker, assets, missing resources and SPA routes. There is no anonymous object-storage URL or alternate origin. Use a current maintained Caddy release (local validation used 2.11.9). No app accounts, backend, feedback upload or analytics are introduced. The invitation credential is an infrastructure access credential; provide a unique strong secret per invited scholar/site instance and rotate/revoke after review. For simultaneous individualized revocation, use separate authenticated instances or extend the server-side credential list; do not share one password across reviewers.

Basic authentication must only be used over HTTPS. The browser stores/reuses its credential; ZAAD's “Lock draft viewing” only hides text and is not logout. Closing all review windows/private browsing sessions and revoking the server credential are the practical access controls. An authenticated person can copy text or export it; authentication cannot recall already viewed material. A stronger organization identity gateway with MFA can replace Basic authentication if required, but it must cover every path and origin, and must be validated independently. No gateway is claimed configured here.

Remote staging intentionally has **no service worker or install manifest**. Responses use `private, no-store`, `Vary: Authorization`, noindex/noarchive, and CSP `worker-src 'none'`. The build disables worker registration. This prevents the app deliberately precaching drafts beyond authentication. Feedback still stays in local IndexedDB, and downloads contain private drafts. An already-open page or copied/exported notes cannot be remotely erased. This is not a DRM or device-management solution.

Never reuse an origin that previously installed the offline review PWA: its existing worker could serve cached content before any server authentication or headers are reached. Use a new hostname. Do not wipe IndexedDB or send Clear-Site-Data as a workaround. Local offline review remains available through `npm run review` on 127.0.0.1:4180 for trusted-device use; do not expose that port or upload `.review-dist/` remotely.

## Reproducible preparation (local Windows)

```powershell
npm ci
npm run sources:identity
npm run i18n:check
npm run build
npm run staging:build
npm run content:status
npm test
npm run publication:check
npm run security:check
npm run hosting:test
$env:PLAYWRIGHT_BROWSERS_PATH='D:\zad\.playwright'
npm run test:e2e
npm audit
```

Node 22.19+ is required by the existing TypeScript-aware scripts. `hosting:test` and the browser staging test require a verified Caddy executable at `.tools/caddy/caddy.exe`, or `CADDY_BIN` set to its absolute path. Install the official release for the test machine, compare its archive with the publisher's checksums (2.11.9 publishes SHA-512), and extract locally. Do not commit the binary or test-generated configuration. See [official releases](https://github.com/caddyserver/caddy/releases) and [Basic authentication documentation](https://caddyserver.com/docs/caddyfile/directives/basic_auth). Test-only credentials in the loopback test helper must never be used remotely. The helper uses only 127.0.0.1 ports 4280/4281 and stops Caddy after tests.

The staging marker must report `privateReview=true`, `authenticatedStaging=true`, `publicDistribution=false`, `offlineDraftCache=false`. There must be no `.staging-dist/sw.js` or manifest link in its HTML. Public `dist/` must pass the independent publication scan. Record the version/build ID and the two source-document hashes in the handoff. The owner should retain an immutable archive and checksums of each tested artifact.

## Owner-approved server setup — commands are instructions, not executed

Use a supported Linux host with a maintained official Caddy package, a non-root service account, read-only release directories, persistent Caddy certificate storage and firewall rules allowing inbound 80/443 only (plus restricted administrative SSH). No directly exposed preview/dev/object-storage server. Caddy normally obtains and renews HTTPS certificates and redirects HTTP to HTTPS for configured public DNS names; DNS and reachable challenge ports must be correct. See [automatic HTTPS prerequisites](https://caddyserver.com/docs/automatic-https).

1. Choose two distinct owned names, for example `app.example.org` and a **fresh** `review.example.org`. Set A records to the host; add AAAA only if IPv6 is configured and reachable. Keep any existing public ZAAD origin unchanged to preserve its browser storage. Do not enable a CDN cache for review. If a proxy/CDN is required, it must preserve Authorization and explicitly bypass cache on every review path, including errors; retest anonymously through every route to origin.
2. Build on the trusted workstation. After approval, transfer **only** the `.staging-dist/` contents to `/srv/zaad/review/releases/<unique-release-id>/`, over authenticated SSH/SFTP. Never transfer the repository, source Markdown, `.review-dist/`, node_modules, test artifacts, credentials or personal backups. The publicly reachable root is never the parent releases directory.
3. Install `hosting/Caddyfile` as `/etc/caddy/Caddyfile`. Populate a root-controlled service EnvironmentFile (not in the web root/repository), based on `hosting/environment.example`. Set `ZAAD_PUBLIC_DOMAIN`, `ZAAD_REVIEW_DOMAIN`, `ZAAD_REVIEW_USER`, and an actual bcrypt `ZAAD_REVIEW_PASSWORD_HASH`. Generate the hash interactively with `caddy hash-password`; do not pass a real password in a shell argument/history. The example placeholder is not a working credential. Restrict the environment file to the service/root and do not print or log it. Reload the service environment with the package's systemd override before starting/restarting Caddy.
4. Validate with that environment available: `caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`. Do not serve until validation passes and both release roots exist. Caddy also needs the public root from [public readiness](PUBLIC_RELEASE_READINESS.md); omit the public site block if setting up reviewer-only hosting rather than pointing it at a private artifact.
5. Atomically set the review symlink on the same filesystem, replacing `<unique-release-id>` with an actual immutable directory:

```sh
ln -s /srv/zaad/review/releases/<unique-release-id> /srv/zaad/review/current.next
mv -Tf /srv/zaad/review/current.next /srv/zaad/review/current
```

For an update, retain earlier content-hashed review assets in the new release if existing open sessions may still request their lazy chunks. Copy from the prior **review** assets directory only; never mix review and public assets. The marker/index must always come from the new tested release. No server path contains browser feedback; changing the symlink does not touch IndexedDB.

6. Start/reload the managed service only after explicit deployment authorization. Open ports/DNS only as authorized. Keep Caddy's administration endpoint local; access logs are not enabled by this configuration. Operational/error logs and the host/network still see connection metadata; the owner must choose retention/access policy. Do not enable credential/body logging. Configure monitoring of TLS/service health without personal analytics.

## Mandatory live acceptance before inviting a scholar

Use a clean browser profile without prior workers and test both direct origin and any edge/proxy:

- HTTP redirects to HTTPS; valid certificate/domain/renewal and HSTS are correct. No insecure content.
- `curl -I https://review.example.org/review` returns 401 with `WWW-Authenticate`, `Cache-Control: private, no-store` and no draft body. Test `/index.html`, `/review/faq`, every real `/assets/*.js`, `/review-build.json`, missing files and encoded/normalized paths. Wrong credentials must fail. No unauthenticated bucket or fallback host may expose the same files.
- `curl -I -u <reviewer-user> https://review.example.org/review/faq` prompts for a password and returns 200. Do not put the password into the command. Check CSP, no-store, Vary, noindex, nosniff and referrer policy. Authentication succeeds in the scholar's actual mobile browser; no logs contain their secret.
- Authenticated `/missing.js` and `/sw.js` return 404; POST returns 405. The fresh browser has zero service-worker registrations/caches for this origin. Offline reload must fail to fetch the draft rather than bypass authentication. Existing in-memory content and local feedback can remain on the device.
- Inspect all 34 rites/16 FAQs, five partial-source observations, Arabic/English interface, source links, unapproved warnings, mobile layout, note persistence and JSON/CSV exports. English religious translations are still pending. External evidence links require internet.
- Rotate/revoke the credential and verify a fresh request fails; test credentials from other reviewers/instances do not unlock this one. No claim is made that revocation erases viewed text or downloads.

These live public-DNS/TLS, identity-delivery and actual scholar-device checks have **not** been performed. Local real-Caddy tests cover authentication/routing/cache directives, and Chromium covers the staging UI with zero worker/cache registrations; that is not proof of the eventual host's perimeter.

## Reviewer invitations, updates and rollback

Share the approved HTTPS URL and username, then the secret through a separate secure channel chosen by the owner. Do not send invitations automatically. Tell the scholar notes are local and must be exported securely back to the owner; there is no feedback collection backend.

Before updates ask active reviewers to wait for Saved and export. Build a new immutable staging artifact, run checks, archive it, switch the symlink atomically, then ask for a deliberate reload after saving. No automatic refresh is introduced. The combined source-document fingerprint prevents earlier feedback agreement/name from being silently reused after an addendum/content change.

To roll back, point `current.next` at the previous **staging** release and atomically rename it over `current`; validate the version/marker and repeat authentication checks. Keep the same HTTPS origin and credential policy. Do not clear client storage, downgrade database versions or replace staging with the offline private artifact. Feedback history is retained locally; full exports should be kept before and after rollback. Revoke access after review, retaining exports securely per the owner's retention policy.
