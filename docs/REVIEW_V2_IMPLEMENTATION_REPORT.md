# ZAAD 0.3.0 — v2 editorial review implementation

Completed 23 November 2026. No deployment or publication was performed.

## Implemented experience

Imported the supplied `ZAAD_RELIGIOUS_CONTENT_V2_REVIEW_DRAFT.md` into a separate, versioned review overlay. All 34 rite IDs, 16 FAQ IDs and the existing supplication candidate ID are preserved. The attachment SHA-256 is `9105c42ffdecf34fc45a68ea62902985cdeccb22097cfb93f0e7b1011901624e`.

The private reader provides stage, audience and status filters; searchable, categorized FAQ answers; full Arabic context; candidate references; outstanding verification notes; earlier-version comparisons; and persistent unapproved-content warnings. The Arabic/English interface remains available offline. Arabic religious drafts remain Arabic in the English interface with a translation-pending notice.

Per-record feedback supports reviewer-entered names, decisions and exact notes, reliable save/retry, single-record and bulk JSON/CSV downloads, and historical feedback. Feedback is bound to both edition and attachment fingerprint. Changing the source does not silently reuse an earlier reviewer name or agreement. Feedback does not change scholarly approval or publication status. CSV formula prefixes are neutralized; JSON retains full feedback history.

## Publication and protection

Public builds explicitly compile out the editorial environment and enforce a generated-bundle draft-content scan. Browser tests independently scan public output and verify that client flags or route URLs cannot enable the drafts. Private artifacts live in `.review-dist/`, separate from `dist/`.

Run `npm run review`, then open http://127.0.0.1:4180/review. The read-only runner binds to loopback, checks Host/socket locality and requires a private artifact marker. This is workstation isolation, **not authenticated remote hosting**. Do not expose the port or distribute the private artifact publicly. The warning acknowledgement is a viewing safeguard, not authentication.

## Religious content status

All 51 effective records remain `needs_review`: 43 prepared narrative drafts, seven research briefs and one exact supplication text pending. All 50 supplied rite/FAQ paragraphs are browsable; these editorial text states do not imply religious completeness. There are zero approved normative records, zero new direct evidence checks and zero approved English religious translations. No reviewer approval, hadith grade, source check or translation verification was invented.

Outstanding work includes independent checks of candidate R1–R8, selecting/checking the R7 Qur'an source, rechecking the FAQ14 legacy source, exact quotation/context coverage, disputed positions and legal classifications, the nine supplied scholarly questions, and specialist English translation review. Historical evidence is labelled separately and does not validate the revised claims. See [content status](RELIGIOUS_CONTENT_STATUS.md), [comparison](RELIGIOUS_V2_COMPARISON.md) and [reviewer handoff](REVIEWER_HANDOFF.md).

## Data and update integrity

The user database remains IndexedDB v2 and backup format v2. The separate editorial database remains version 1; new feedback fields are optional. No production-origin browser data was opened, copied, reset or migrated. Personal notes, duas, drafts, categories, tasks, trips, checklist progress and preferences retain their existing storage paths and IDs.

Editorial saves use the existing shared pending-write queue, so navigation, language changes and update checkpoints wait for writes. The existing explicit, coordinated PWA activation protocol remains intact. Service-worker cache cleanup does not delete IndexedDB. Updates require a reachable server and a running/opened application; offline or closed devices do not receive an update immediately.

## npm run build

Passed: translation completeness checks, TypeScript compilation, public production build and publication gate. Public precache contains 20 entries, approximately 749 KiB. The normal private review build also passed with the separate review manifest and source fingerprint marker. A dev-only Node type dependency was added; no runtime service was introduced.

## npm test

Passed: 8 files, **37 tests**. Coverage includes strict publication and translation gates, exact imported ID/text/fingerprint coverage, unverified candidate evidence, feedback failure/retry/history/source binding, JSON/CSV export, IndexedDB v2 and older backup compatibility, local language persistence, and pending-write coordination.

## npm run test:e2e

Passed: **9 browser tests**; final Playwright result is `passed` with no failed tests. Coverage includes public draft exclusion, protected private guide and all 16 FAQ answers, offline cold reload, RTL/LTR switching and language changes while writing, feedback persistence and export, responsive layouts, existing personal-data flows and backup restoration, and safe update behavior with pending writes/multiple windows. Private runner invalid-Host and unsupported-method rejection were also exercised. Tests use isolated browser profiles, not existing user data.

The private 375px screenshot was visually inspected: original Arabic, bilingual interface, warning, evidence/research states and feedback controls render without horizontal overflow. Automated checks also cover the existing 320/375/430px layouts.

## npm audit

Passed: **0 vulnerabilities** reported by the final `npm audit --cache D:\zad\.npm-cache`. This is the audit result at validation time, not a guarantee against future advisories.

## Remaining unverified and release conditions

Religious correctness, source sufficiency, scholarly approval and English meaning translations remain unverified and block publication. Real iOS/Safari installation, operating-system background/eviction behavior and manual assistive-technology review were not established by Chromium automation. No authenticated remote review deployment was built or tested; the supplied runner is local only. Existing real user data was deliberately not used as a test fixture.

Use [the release checklist](RELEASE_CHECKLIST.md) before a future authorized release. Follow [content authoring](CONTENT_AUTHORING.md) for stable IDs, Umrah/Hajj namespaces, independent evidence checks and explicit publication approval. Never deploy `.review-dist/` as the public app. Export reviewer feedback before clearing browser storage; JSON/CSV downloads contain private draft text and reviewer-entered information.
