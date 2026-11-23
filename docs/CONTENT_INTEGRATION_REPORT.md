# Religious content pack v1 — integration report

Date: 2026-11-23. Integrated `ZAAD_RELIGIOUS_CONTENT_PACK_v1.md` into the existing application. No deployment was performed.

## What changed

- Added a versioned typed religious-content model with deterministic IDs, stage/audience/category, legal class and school scope, exact evidence and checking provenance, dispute views, contextual applicability, qualified-review metadata and independent checklist eligibility.
- Imported all 34 A01–F04 rite drafts, 16 FAQ skeletons, one optional Qur'anic du'a candidate and 14 separate correction flags. Whole content records remain `needs_review`; no reviewer identity or approval date was invented. No hadith grade was manufactured.
- Added S1–S5 with pack provenance and recorded page visits; preserved the old S01/S03 namespace. One short A01/S1 excerpt was matched to its source and stored with explicitly Codex-assisted checking metadata. Its record remains unapproved and does not assert full source coverage.
- Replaced the placeholder evidence dialog with a reusable offline evidence viewer: source/locator/type, checked local quotations, checking provenance, reviewer/qualifications/date, legal scope, dispute information and publication blockers. External source links are supplementary and require an explicit click; the viewer makes no fetch requests.
- Added ordered stage-content cards, shared versus gender-specific records and selected-audience annotations. Only approved content is eligible for the public guide. Added one-tap personal du'a links to tawaf and sa'i, and a separate optional reviewed supplication collection (empty until approval).
- Added development-only `/review`: explicit warning acknowledgement, stage/gender/status filters, evidence inspection, blocker diagnostics, correction flags, local feedback persistence and separate JSON feedback export. No browser self-approval or publish control exists. Filters/notes never alter review status.
- Added a strict publication gate shared by renderer and production build. It requires scholarly approval, named reviewer/qualifications/date, checked exact evidence matched to registered sources, confirmed coverage of every claim, school scope and sourced disputed positions where relevant. Source_checked is not approval. Draft modules, editorial DB/workspace and test-only reviewer fixtures are excluded from production JS, verified by browser tests.
- Added `npm run content:status`, generating `docs/RELIGIOUS_CONTENT_STATUS.md` directly from actual content records. Updated README, architecture, policy, test plan and review queue; retained the original implementation report as historical.

## Data preservation check

The `zaad` IndexedDB schema remains version 2. No stores were replaced, no migrations added, and no user data reset. Existing category, task, du'a/draft, preference, trip and stage progress formats remain intact. The six stage IDs remain `prepare`, `ihram`, `tawaf`, `after`, `sai`, `finish`. Backups remain format `zaad`/version 2.

New religious IDs are content identifiers, not progress rows. All draft `actionableChecklist` flags are false; no historical stage completion is expanded into inferred rite completion. Gender choice changes presentation only. The existing checklist never issues religious validity, penalty or tahallul decisions.

Editorial feedback lives only in a separate development-only `zaad-editorial` IndexedDB, outside pilgrim backups and clearing operations. A regression test compares complete user backup data before and after content imports/editorial writes, reopens the existing v2 DB, then restores the original v2 backup and verifies exact equality. Original offline notes/planner/checklist/backup browser scenarios still pass. Tests use isolated browser profiles and do not clear the user's browser data.

## Build check

`npm run build` — passed. Strict TypeScript, content-publication gate, Vite production build and Workbox precache generation. 18 precache entries, ~696.87 KiB. Normative drafts are absent from production assets, not merely hidden in the DOM.

## Unit and component checks

`npm test` — **4 test files, 21 tests passed**. Existing autosave, write-queue failure recovery, migration, backup and checklist rollback tests remain passing. New coverage includes pack IDs/counts, source provenance, real-record review invariants, approval/source-check separation, evidence and legal-scope gates, no fabricated grades, audience filtering/shared content, public draft suppression, offline verified-excerpt display without fetch, and data/backup compatibility.

## Browser and offline checks

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='D:\zad\.playwright'
npm run test:e2e
```

**4 tests passed (18.6s final run)** in Chromium against production port 4173 and development port 5175.

- Original offline long Arabic autosave/navigation/reload/reopen, task/checklist persistence, separate trip/reset isolation and backup/restore scenario passes.
- Public source metadata viewer opens while offline and exposes no draft quotations. All four public routes have no document overflow at 320/375/430px.
- Production has no `/review` route or query-parameter bypass. Built JS has no actual draft summaries, checked draft excerpt, editorial DB name or synthetic test-reviewer identity.
- Development preview requires warning acknowledgement; women/men filters retain shared cards and change only relevant guidance. A checked local excerpt opens with network disabled. Editorial feedback survives reload and exports separately. No third-party requests occurred in either monitored scenario.

The development suite found an unstable exact textarea label after loading a stored note; data was intact. An explicit accessible label fixed the issue, and all scenarios were rerun successfully.

Screenshots: `test-results/review-320.png`, `test-results/zaad-day-{320,375,430}.png`, `test-results/zaad-{320,375,430}.png`. The 320px editorial screenshot was visually inspected for Arabic flow, warning visibility, cards, filters and feedback controls. Physical screen-reader/Android/iPhone verification remains manual.

Development mode has no service worker: offline evidence testing there happens after loading its modules. Production offline launch remains covered separately by the installed service-worker scenario. Future approved evidence is bundled with the app and needs no external fetch.

## Dependency audit

`npm audit --cache D:\zad\.npm-cache` — **found 0 vulnerabilities**. No dependencies were added or upgraded by this integration.

## Current release gaps

There are **zero approved/public normative records**. All **51 content records remain blocked**, with **14 additional correction flags**. See the generated [status inventory](RELIGIOUS_CONTENT_STATUS.md) for exact IDs and missing-source lists, and [editorial policy](CONTENT_EDITORIAL_POLICY.md) for the approval workflow.

Remaining religious work includes full claim/source coverage, exact quotations/locators/context, all hadith details, school classifications and disputes, gender-specific qualifications/exceptions, the 16 FAQ answers and Qur'anic orthography/application. One checked excerpt and five visited pages do not complete those tasks. Review requires an actual named qualified reviewer; the app can validate metadata presence, not a person's identity or credentials.

No draft guidance or quotations have been released publicly. Reviewed supplications stay empty, and draft microsteps do not become user progress. No personal notes, planner data or editorial feedback are sent to a server. Authentication, analytics, aggregate counters, external media, cloud notes and Hajj remain disabled. Browser eviction/force-termination/iOS storage caveats from README continue to apply.

## Local use and next release

`npm run dev`, then open `/review` and acknowledge the warning to inspect drafts. `npm run content:status` regenerates the inventory. Use `npm run preview` to inspect the public production build after building. The browser tests require ports 4173 and 5175 free.

Do not deploy without explicit approval. Before a religious-content release, obtain source and qualified scholarly review, update only approved records in `src/content/published.ts`, regenerate the status report and rerun all checks. Preserve stable progress IDs and v2 backups.

## Main files

Content: `src/content/schema.ts`, `drafts.ts`, `faq-drafts.ts`, `supplication-drafts.ts`, `corrections.ts`, `sources.ts`, `published.ts`, `publication.ts`, `review.ts`, `stages.ts`.

UI: `src/components/EvidenceSheet.tsx`, `src/features/umrah/ReligiousContent.tsx`, `src/features/duas/SupplicationLibrary.tsx`, `src/features/review/ReviewWorkspace.tsx`, `src/features/review/review-db.ts`; integration in `src/main.tsx` and styles.

Validation: `vite.config.ts`, `src/content/content.test.ts`, `src/test/religious-content.test.tsx`, `src/db/db.test.ts`, `src/test/setup.ts`, `e2e/religious-content.spec.ts`, `e2e/offline.spec.ts`, `playwright.config.ts`, `scripts/content-status.mjs` and the new package script.
