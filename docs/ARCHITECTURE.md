# Architecture and persistence

## V2 editorial overlay (app 0.3.0)

`src/content/review-v2/pack-data.ts` is deterministically imported from the supplied Markdown, with its raw-byte SHA-256 and complete stable-ID coverage. `records.ts` overlays all 50 supplied rite/FAQ narratives onto the retained legacy records; DUA-Q2-201 receives the v2 research plan without invented exact text. Earlier datasets and verified-excerpt metadata are unchanged and inspectable separately. No checking/approval is inherited by revised claims. All 51 effective review records remain needs_review with unconfirmed coverage; prepared narrative/research/text-pending metadata does not imply religious approval.

The public build explicitly sets `__EDITORIAL_REVIEW__=false`. Development or the deliberately separate private build may expose review routes; `ReviewShell` requires acknowledgement and maintains a persistent warning. Public generation checks for leaked v2 text, and browser tests scan every current record/pack fingerprint. Private output is `.review-dist/` with a marker and review installation manifests; the read-only runner accepts loopback/local Host GET/HEAD only on 4180. This is local isolation, not remote authentication. No public staging/hosting is created.

The guide and FAQ accept private render tools/reference registries through props; they never import the overlay or feedback data into public components. R1–R8 are review-only candidate metadata, not new direct checks. Source dialogs distinguish unchecked v2 pointers from the historical A01/S1 checked excerpt, which appears only through explicit previous-version comparison.

`zaad` remains schema v2; `zaad-editorial` remains schema v1 with optional decision/name/edition/source-fingerprint/history fields. First editing a legacy feedback row preserves its earlier snapshot. Reviewer names/decisions are not prefilled across editions or changed source fingerprints and never flow into scientific approval metadata. JSON/CSV exports are local; JSON preserves exact feedback/history, CSV neutralizes formula cells. Feedback uses the same serialized save queue as drafts, so language changes, internal navigation and safe updates wait for review writes too. Existing write barriers and activation protocol are retained.

## Bilingual FAQ and update milestone (0.2.0)

The current design extends the prior content integration without replacing the project or database. `src/i18n/` provides bundled UI catalogs, named interpolation, reactive locale subscriptions and separate preference persistence. HTML lang/dir, title and install manifest follow the selected locale. Interface changes rerender the same editors and never rewrite personal text. Untouched built-in labels may be localized for display; custom/renamed records remain original. `preferences.language` uses the existing table/index; no schema migration is introduced.

`src/content/umrah/faq-index.ts` exposes only non-normative bilingual topic headings/categories. `/faq` supports search and future approved concise/detail/classification/dispute records; `/support` is separate app help. English religious text and evidence meaning require independent verification/review metadata, not UI translation. The public release currently has zero approved answers or English religious translations. `namespaces.ts` reserves disabled Hajj. See CONTENT_AUTHORING.md.

The worker now uses injectManifest, local precache/navigation routing and a confirmed two-phase activation protocol. `write-barrier.ts` observes actual IndexedDB readwrite completion/abort, drains queues, checks unsaved forms/errors and freezes further transactions. A short-lived origin lease protects newly opened tabs; the worker refuses multiple windows. All user storage remains v2 and cache operations never delete IndexedDB. `UPDATES_AND_VERSIONING.md` supersedes the simpler initial worker description below and explains the first upgrade from legacy clients.

App version, deterministic release build ID, religious content edition and DB/backup version are separate. `UpdatePanel` provides availability, confirmation and bilingual What's New. Automatic checks occur only during online opening/resumption; this is not a background push service.

## Religious content pack v1

Versioned types live in `src/content/schema.ts`; 34 stable A01–F04 rite records, 16 FAQ skeletons, one du'a candidate and correction flags are bundled only by the development lazy-loaded review workspace. Source IDs S1–S5 are distinct from preserved S01/S03. Public content is explicitly listed in `published.ts` (currently empty). Renderer and Vite build share a strict metadata/evidence publication gate. Source_checked is never treated as scholarly_approved.

`EvidenceSheet` displays locally stored citations, verified short quotations, checking provenance, scholarly review metadata, classification/scope and disputes. It does not fetch external content; links are supplementary, explicit and network-dependent. Unverified quotations/grades are not rendered. Production rejects draft record props even if accidentally supplied to the viewer.

Stage IDs and all existing pilgrim IndexedDB tables/version 2/backups are unchanged by this integration. Religious microstep IDs are independent content IDs, not automatically converted to trip progress; all draft actionableChecklist flags are false. Existing stage checkboxes retain their meaning. Gender filtering retains shared records and adds only selected audience records/annotations after publication (or within explicit development preview). Tawaf and sa'i include a one-tap du'a shortcut. The optional reviewed library does not insert into personal categories or du'as.

Editorial feedback uses a separate development-only `zaad-editorial` IndexedDB and JSON export. It never mutates source review status, pilgrim data or backups. It is not cloud storage, a credential verification service or a publication tool. `npm run content:status` uses Node 22's TypeScript stripping to generate the status document from actual files.

React 19 + TypeScript + Vite, React Router, Lucide, Dexie/useLiveQuery. Components currently share `src/main.tsx`; data and content have separate modules. CSS provides accessible RTL layout with no runtime CDN.

Dexie database `zaad`: duas, duaDrafts, categories, tasks, trips, progress, preferences, schemaMeta. v1 establishes the stores; v2 adds task category indexing and migrates missing category to شخصي. No eventOutbox because counters are disabled.

Each editor update immediately changes in-memory text, sets saving state and schedules a 300ms write. Blur, route unmount, visibility change and pagehide flush the latest snapshot. A shared promise queue serializes writes so older snapshots cannot finish after newer ones. Each transaction atomically writes both the working du'a and its durable draft. A revision token prevents an old completion from falsely marking newer edits saved. Errors retain the in-memory text and offer retry. Backup export waits for queued writes. No promise of persistence before commit or after forced OS shutdown.

Internal link navigation and update refresh dispatch a flush and await the write queue before leaving. This closes the navigation-followed-by-reload race found in production browser testing. Failed navigation-time saves leave the editor mounted. Checkboxes give immediate feedback, disable repeated input while committing, and roll back on failed writes. Offline readiness is shown only after service-worker readiness.

Backups carry `format=zaad`, `version=2`, ISO export time and seven data tables. Import limits size to 10 MiB and each table to 20,000 rows, validates field types, finite numbers, unique IDs, foreign keys, progress IDs/stages, preference values and known fields. Validation precedes an all-table replacement transaction. Failed validation or failed transactions leave existing records intact. Import is treated as text; no HTML rendering or script evaluation.

PWA: Workbox-generated service worker with root navigation fallback and hashed asset precache. Prompt updates; refresh only after the user sees save confirmation. Updates do not open/delete/upgrade IndexedDB. No runtime remote caching. Host CSP and security headers live in `public/_headers`; hosts that do not interpret that file need equivalent configuration.

Noto Naskh Arabic 400/700 is bundled from Fontsource with SIL OFL license copied to public. Local PNG/SVG icons are original simple geometry.
# 0.4.0 architecture note

The v2.1 source addendum is a private structured overlay (`source-addendum.ts`) linked to five stable records. `sourceObservations` captures bounded claims, exact locators, automated-check identity/method/date, scope and limits separately from legacy `Evidence.verified` and qualified approval. No user-schema change: IndexedDB v2, backups v2, editorial DB v1. `source-identity.ts` binds reviewer feedback to both source-document hashes.

`ZAAD_STAGING_BUILD=1` requires editorial mode and produces `.staging-dist/` with a separate build ID, no worker registration and no installed draft cache. Caddy authenticates the entire fresh remote reviewer origin. Public `dist/` remains gated; trusted local `.review-dist/` retains offline support. Static policy checks and real Caddy loopback tests are separate from live-host TLS/DNS validation. See `REVIEWER_STAGING_DEPLOYMENT.md` and `PUBLIC_RELEASE_READINESS.md` for exact boundaries and rollout/rollback instructions.
