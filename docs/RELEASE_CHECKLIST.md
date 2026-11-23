# Release checklist — ZAAD 0.4.0

## Current owner release decisions

- [ ] Review [public readiness](PUBLIC_RELEASE_READINESS.md), [authenticated staging](REVIEWER_STAGING_DEPLOYMENT.md), [evidence matrix](RELIGIOUS_EVIDENCE_MATRIX.md) and [content update workflow](POST_LAUNCH_CONTENT_UPDATE_WORKFLOW.md).
- [ ] Confirm all 51 stable IDs remain needs_review, no qualified/English approval is invented, and five addendum observations remain partial.
- [ ] Run sources:identity, i18n:check, content:status, build, test, staging:build, publication:check, security:check, hosting:test, test:e2e and npm audit. Caddy/browser harness uses ports 4280/4281 in addition to existing test ports.
- [ ] Verify the remote reviewer artifact has no worker or install manifest and uses a fresh dedicated origin. Authenticate every path, including chunks and errors. Never upload `.review-dist/` remotely.
- [ ] Owner approves provider/cost, exact artifact IDs, domains, credential/invitation policy, operational-log retention and rollback target before deployment. No deployment or invitations are authorized yet.
- [ ] After authorization, validate real DNS/TLS, anonymous/wrong/correct access, direct-origin exposure, cache policy, mobile reviewer access and physical-device install/offline/update behavior. Local tests do not establish these live conditions.

Prior version checklist sections below retain applicable data/update checks; current source status is in the v2.1 matrix.

## V2 review handoff (app 0.3.0)

- [ ] Generate the v2 handoff/status and verify attachment SHA/ID coverage: `npm run content:status`.
- [ ] Verify 34 rite/16 FAQ narratives and DUA-Q2-201, candidate refs, research briefs and English-pending labels in `/review` and `/review/faq`.
- [ ] Test agree/revise/research, optional self-entered name, legacy feedback history, failed-write retry and local single/bulk JSON/CSV.
- [ ] Confirm `npm run build` outputs only public `dist/` with no v2 text or review marker/chunks. Use `.review-dist/` only for private local review; never deploy it publicly.
- [ ] Test private offline cold reload via `npm run review`, then language switching and feedback persistence. Loopback server must reject non-local Host requests and POSTs.
- [ ] Run the complete unit/browser/audit suite; browser tests additionally require port **4180** free. Do not clear the user's browser data to run tests.
- [ ] Obtain real qualified claim/source/translation review before changing any scientific status or public release list. Feedback agreement is not approval.

No deployment is authorized. Prior checklist items below remain applicable to public releases and data/update safety.

No deployment/publication is authorized by this implementation request.

## Automated checks

- [ ] `npm ci` with the checked-in lockfile on the release machine.
- [ ] `npm run i18n:check` — all static UI/catalog entries present.
- [ ] `npm run content:status` — review actual counts and missing approvals.
- [ ] `npm test` — persistence, migration, backups, publication, translations, update barriers.
- [ ] `npm run build` — strict TypeScript, UI message coverage, religious publication gate, production assets/worker.
- [ ] Set PLAYWRIGHT_BROWSERS_PATH as in README; `npm run test:e2e`. Ports 4173, 5175 and 4176 must be free.
- [ ] `npm audit` — inspect all findings, including build/test tooling.

Browser suite ports: production **4173**, development **5175**, update harness **4176**. The pretest script creates `.test-release/` only for simulating a new worker version. Do not publish the harness, endpoints or fixture artifacts.

## Religious integrity

- [ ] Public UI contains no unapproved answers, classifications, disputes or unverified English meanings. The 16 FAQ topics are navigation only; all 51 whole records currently remain blocked.
- [ ] Exact Arabic quotations unchanged; no fabricated grades/reviewer identities/dates.
- [ ] Actual qualified approval recorded before adding a normative record to published.ts; independent English review checked where applicable.
- [ ] Production has no review route, draft bundle or query-parameter bypass. Hajj remains disabled until separately reviewed and implemented.

## Data and update safety

- [ ] Back up a real existing profile before release testing; do not clear it.
- [ ] Confirm database version 2 and unchanged IDs/data across upgrade, both languages, draft typing and older v2 restore.
- [ ] Test cancellation, failed/quota-blocked saving, waiting updates, new task/category entries and multiple windows. No activation while saves are pending/failed.
- [ ] Exercise first upgrade from the old 0.1 client: Saved, backup, close all ZAAD windows, reopen online. Do not clear site data.
- [ ] Check crash/interruption recovery and expiring update lease on target browsers. A delayed post-COMMIT update must keep editing paused.
- [ ] Do not promise closed/offline update delivery or survival after uninstall/eviction.

## Manual UX and hosting checks

- [ ] Real Android install/offline relaunch and Safari/iPhone Add to Home Screen in both languages.
- [ ] Physical screen readers, keyboard focus, 200% text/zoom, dark theme, sunlight contrast, safe-area navigation and dialog focus return.
- [ ] Header language control, accessible names, native file/date/time picker behavior under device locale, original personal text/direction unchanged.
- [ ] Correct HTTPS/CSP/no-cache headers, both manifests, root scope, atomic precache deployment, previous hashed asset retention and SPA deep links.
- [ ] Review host logging/privacy policy, brand/domain availability and explicit deployment approval.

See MILESTONE_0_2_REPORT.md for completed checks and remaining unverified items. This checklist is a release process, not evidence that all manual checks have been completed.
