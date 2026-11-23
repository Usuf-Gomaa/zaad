# Test plan

## V2 protected editorial experience

Unit coverage includes raw attachment fingerprint/stable-ID mapping, all 50 paragraphs plus the retained du'a ID, unchanged historical excerpt metadata, zero new checks/approvals/grades/translations, audience/completeness categories, legacy feedback history, exact entered name/note/decision persistence, failed-write retry, unchanged user v2 backup data and formula-safe CSV/exact JSON.

Browser tests scan every v2 summary/full body and fingerprint out of public JS/worker assets, reject client-flag/query bypasses, and exercise the separate private review artifact on 4180. They test non-local Host/POST rejection, acknowledgement/banner, full rite text, every FAQ draft answer/detail, candidate evidence with no fabricated quotation, optional named feedback, per-record/bulk exports, English UI/original Arabic content, offline deep reload, restoration and 375px overflow. The historical checked excerpt is tested through explicit earlier-version comparison, not treated as current evidence.

The pretest build script creates public update and private review fixtures without changing `dist/`. All earlier personal autosave, migrations/backups, bilingual offline and real safe-worker-update tests remain in the suite. See REVIEW_V2_IMPLEMENTATION_REPORT.md for final results/manual gaps. No physical Safari/device or network-authenticated staging review is implied.

## Milestone 0.2.0 additions

`npm run i18n:check` validates static UI/catalog/source/validation labels before every build. Unit/component coverage now includes switching language while typing exact Arabic/English/emoji/whitespace text, v2 language preference validation and old backup restoration, independent English publication gating, approved synthetic bilingual FAQ rendering, origin write leases, actual transaction aborts and pending/failed update checkpoints. Synthetic approvals are test fixtures only, never real content.

Browser scenarios additionally cover both offline locales/manifests, no raw Arabic UI labels on English public screens (excluding the language self-name), all six screens at 320px, searchable categorized FAQ with withheld answers, older v2 backup restoration retaining language and personal text, and two actual worker releases. Update checks cover cancellation, confirmation with a pending long Arabic draft, version change/reload, exact recovery, multi-window rejection and retry. The update harness runs only in tests on 4176. See MILESTONE_0_2_REPORT.md for final counts and manual gaps.

## Unit and component checks

Content-pack coverage additionally tests deterministic pack IDs, preserved source namespaces/provenance, zero real approvals/phantom hadith grades, separate source-check/approval transitions, evidence/school/dispute publication requirements, gender filtering, public suppression of all drafts, offline local excerpt rendering without fetch, evidence rejection of accidental draft props, one-tap du'a shortcuts, and v2 data/backup preservation while editorial feedback lives separately.

`npm test`: exact Unicode writes across connection reopen; 30 serialized edits; durable drafts; backup roundtrip; malformed, oversized and broken-reference rejection without data loss; scoped trip reset; queue recovery; v1-to-v2 migration; unreviewed publication gate; unmount flush before debounce; save failure and retry UI.

## Production browser checks

The suite also starts a development server on 5175. It confirms production `/review` is absent, query parameters cannot enable it, draft summaries/editorial database/test-reviewer fixtures are absent from built JS, and development preview requires acknowledgement. It checks gender/shared content, offline evidence opening after the dev workspace has loaded, feedback persistence/export and 320px layout. Development mode itself has no offline cold-launch support/service worker; production offline launch is covered by the original scenario.

`npm run build`, then `npm run test:e2e` (Chromium installed; see README). Browser tests use built production files, wait for worker control, disable network, hard reload, navigate every core feature, preserve a long Arabic draft without Save, create/check tasks, persist stage tracking, switch gender presentation, download a backup, clear with confirmation and restore Unicode. Responsive checks verify no document overflow at 320/375/430px and save screenshots under `test-results/`.

## Manual release checks

Real iOS/Android installation and OS relaunch, eviction behavior, physical sunlight readability, screen-reader Arabic pronunciation and keyboard dialog behavior. Test storage full/private-mode errors; multiple tabs editing the same note (currently last committed writer wins); offline first install is unsupported. Verify deployed CSP/headers and update with a pending draft. There is no live prayer dataset and no published legal content to certify.

No test can establish religious correctness or guarantee an OS will finish a transaction after killing the app. Content release requires independent human review.
