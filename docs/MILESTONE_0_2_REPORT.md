# ZAAD 0.2.0 — bilingual FAQ and safe updates

Implemented in the existing `D:\zad` project on 2026-11-23. No project recreation, user-data reset, backend or deployment. This report supersedes earlier implementation reports for the new features; those reports remain historical.

## Delivered application behavior

The existing four primary screens remain, with Arabic/English labels, forms, errors, installation/offline guidance, backup messages and release notes. The selected language updates HTML lang/dir (Arabic RTL, English LTR), document title and install manifest. Both catalogs/manifests are local and cached. Language selection uses the existing preferences table and an optional tiny startup mirror. It rerenders the same editor without remounting or translating stored text. Original notes/du'as, Unicode and whitespace remain unchanged. Only untouched seeded category/trip labels are localized for display; custom names stay original.

`/faq` is a dedicated searchable, categorized Umrah jurisprudence FAQ, separate from `/support` app help. The 16 existing FAQ IDs supply bilingual non-normative question headings. The renderer supports concise approved answers, detailed context, legal scope/classification, disputed positions, evidence and review status. No actual answers are approved: the public page shows a withholding notice and methodology rather than draft rulings. `/review/faq` preserves development-only opt-in draft inspection. No home-screen FAQ wall or extra primary navigation item was introduced.

Religious data remains separate from components. Records have stable IDs, Umrah namespace metadata, optional detailed explanations and independently reviewed English mappings. Original Arabic quotations render explicitly as Arabic/RTL. Optional English meanings require their own checking provenance; none were invented or marked verified. The existing publication gate remains strict, adds detailed FAQ completeness and rejects disabled Hajj content. English publication additionally requires independent named qualified review of the translation. Hajj has a reserved, disabled namespace and no public rites.

The PWA now has a version/build display, bilingual What's New, update checks and availability notice, explicit confirmation and a non-destructive activation protocol. It pauses editing, flushes drafts/blur-based edits, waits for queued writes and actual IndexedDB commits, rejects unresolved errors/new-entry forms, then obtains a short-lived origin write lease. A two-phase worker handshake and repeated window check refuse activation when other windows exist. A pre-commit timeout cannot later activate an update after editing resumes. After COMMIT, editing stays paused until the confirmed controller-change reload. Worker cache cleanup never deletes IndexedDB. App version, deterministic build ID, content edition and DB version are independent.

## Data integrity and compatibility

IndexedDB remains **version 2**, with the same tables, indexes and v1-to-v2 migration. Backup format remains **zaad/version 2**. There is no new schema migration. The existing personal progress IDs remain prepare/ihram/tawaf/after/sai/finish, and draft microsteps never create inferred progress.

The only new persistent preference is language=ar/en in the existing table. Old v2 backups without language restore successfully while retaining the current language selection. New v2 backups validate the new key. Old pre-0.2 binaries may reject that additive key; forward import into obsolete clients is not promised. All existing preservation, Unicode, atomic restore, migration and trip-isolation tests still pass.

The temporary localStorage update lease is coordination metadata only: a short-lived random ownership token, expiry and target build ID. It is not a device ID, analytics or personal content, and is not transmitted or backed up. If this coordination storage is unavailable, in-place updating is refused rather than bypassing the write barrier.

## Build check

`npm run build` — passed. This includes `prebuild` translation coverage, strict TypeScript, the religious publication gate, Vite production output and injectManifest worker generation. Output: `dist/`; 18 precache entries, approximately 740 KiB. Main JS approximately 464 KiB / 149 KiB gzip. The app serves no external font/content dependency.

## Unit and component tests

`npm test` — **6 files, 30 tests passed**.

Existing coverage remains: serialized rapid Arabic edits/durable drafts, failure/retry, navigation flush, checkbox rollback, migration, backups, scoped resets, religious-source provenance and publication gating.

New coverage verifies:

- Language switch during pending editing retains exact personal Arabic/English/emoji/whitespace text and original notes; RTL/LTR and save labels change correctly.
- v2 language preference validation, pre-language backup restore and no schema increment.
- All 16 FAQ IDs match the existing foundation, bilingual search and draft-answer suppression.
- Independent English approval requirements and positive rendering of **synthetic TEST ONLY** approved FAQ fixtures with concise/detail/evidence views. No test approval exists in real content or production assets.
- Hajj namespace rejection, original Arabic quotation direction and no fabricated English meanings.
- Pending-write barriers, failed flushes, unresolved input guards, frozen transaction rejection, a foreign-window lease and actual transaction aborts even if the initiating caller catches the failure.

## Browser and offline tests

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='D:\zad\.playwright'
npm run test:e2e
```

**7 browser scenarios pass in Chromium**. The suite runs against production 4173, development 5175 and an isolated update harness 4176. The pretest script builds `.test-release/` solely to exercise a different real worker build. No harness endpoint or test fixture is part of `dist/`.

Verified scenarios:

1. Existing offline shell/hard reload, long Arabic draft navigation/reopening, task completion, stage persistence, gender/shared content, separate trip reset and Unicode export/restore.
2. Existing 320/375/430px public layout checks.
3. Production excludes draft summaries, checked draft quotation, editorial DB/workspace and synthetic reviewer identities; no `/review` or query bypass.
4. Development opt-in, audience filters, offline local evidence opening after modules load, isolated feedback persistence/export and 320px review layout.
5. English public UI contains no untranslated Arabic labels except the language's self-name; all six public screens and the English installation manifest work offline.
6. Language switching during exact personal-text editing, offline reload with persisted language, RTL/LTR, FAQ search and evidence methodology; both FAQ screenshots, 320px English screens, and a real UI restore of a pre-language v2 backup preserve language and personal text.
7. Two actual waiting-worker releases: explicit cancellation, confirmed update with a pending long Arabic draft, build/version change and exact recovery, refusal with a second open window, then successful retry after closing it. No automatic reload occurs on cancellation or rejection.

The monitored original/offline/editorial scenarios continue to show no third-party requests. Update tests use same-origin asset/worker requests and a test-runner-only local release switch; production contains no backend endpoint.

## Dependency audit

`npm audit --cache D:\zad\.npm-cache` — **0 vulnerabilities**. Workbox precaching/routing are now explicit runtime build dependencies already present in the lockfile's toolchain; no analytics SDK or tracking code was introduced.

## Translation and content status checks

`npm run i18n:check` — passed; static UI calls and source/validation labels have catalog entries. It also runs before production builds.

`npm run content:status` — regenerates [RELIGIOUS_CONTENT_STATUS.md](RELIGIOUS_CONTENT_STATUS.md): **51 needs_review records, 51 blocked, 0 approved/public normative records, 14 separate correction flags, 0 approved English religious translations and 0 verified English meanings**. The one previously checked short Arabic excerpt remains editorial-only and does not approve its record. No reviewer identities, religious approvals, grades, translations or new source checks were fabricated.

## Visual and manual verification limits

Screenshots generated under `test-results/`: faq-ar-320.png, faq-en-320.png, review-320.png and existing day/More captures at 320/375/430px. The English 320px FAQ screenshot was visually inspected for LTR order, layout, typography, clear pending-answer labels and separation from app support. Arabic direction and mobile overflow are covered by browser checks; physical Arabic screen-reader and real-device review remain manual.

Not verified on physical Android/iPhone/Safari: installation/relaunch, native picker localization, sunlight/contrast perception, full screen-reader behavior, background/process termination, eviction and deployed CDN/HTTPS headers. The first upgrade from the **old 0.1** worker also remains a manual rollout check: Saved → backup → close all ZAAD windows → reopen online. Its old activation command is intentionally not accepted by the new worker. Do not clear site data to upgrade.

No web application can guarantee a pending transaction after OS force termination or survive explicit browser clearing/uninstall/eviction. Updates are checked during online opening/resumption or explicit checking; no arrival while offline or closed is claimed. Keep backups. Qualified religious/content/English translation review remains outstanding.

## Main files and handoff

- UI/catalogs: `src/i18n/`, `LanguageSelect.tsx`, localized existing components, `FaqPage.tsx`, `SupportPage.tsx` and the development `ReviewFaqPage.tsx`.
- Content: schema, localization gate, namespace registry and `umrah/faq-index.ts`; existing draft/source IDs and statuses preserved.
- Updates: `src/pwa/sw.ts`, `write-barrier.ts`, `lifecycle.ts`, `UpdatePanel.tsx`, `useUpdateGuard.ts`, `src/release.ts`, Vite build ID/worker configuration and English manifest.
- Data: commit-level middleware, stable queue drain and additive validated language preference in `src/db/index.ts`; no schema replacement.
- Verification: new i18n/lifecycle tests, bilingual/update browser suite, translation checker, isolated test release builder/server and generated content status.

Read [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md), [UPDATES_AND_VERSIONING.md](UPDATES_AND_VERSIONING.md) and [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md) before future Umrah/Hajj changes. Deploy only `dist/` after explicit authorization. No deployment or publication was performed.
