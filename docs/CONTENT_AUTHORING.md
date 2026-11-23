# Adding and reviewing Umrah/Hajj content

## V2 review import and handoff

The current review edition is a separate `2.0.0-draft` overlay, not an update to the public release list. `npm run review:import` checks the supplied file's 34 rite/16 FAQ IDs, extracts concise/full supplied narrative, candidate references and research notes, and writes the comparison document and generated data. It leaves earlier datasets untouched. Source status/quotation/grade/reviewer fields are deliberately reset for the revised claims; an earlier checked excerpt cannot establish new coverage.

Read REVIEWER_HANDOFF.md for all per-record questions and the definition of text completeness: 43 prepared narratives, 7 research briefs and one exact du'a text pending, all unapproved. The private reader shows the Arabic original in either UI language instead of inventing English religious translations. General source reading reported in the attachment is not independently asserted as a new check.

`npm run review` provides loopback-only offline-capable review with a persistent warning, optional self-entered feedback identity, agree/revise/research, histories and local JSON/CSV. None of these choices can promote content. Do not publish the private artifact, drafts or reviewer exports. The public build defaults review mode off and retains strict metadata/text-leak tests. An eventual approved release requires a deliberate, qualified review and updated release allowlist/tests; never turn on the private flag as a shortcut to publication.

## Structure and stable identifiers

- `src/content/schema.ts`: content/evidence/review types and edition. Religious content stays outside UI components.
- `src/content/umrah/faq-index.ts`: bilingual **question headings and categories only**, FAQ01–FAQ16 from the supplied draft pack. This is public navigation copy, not normative answers.
- `drafts.ts`, `faq-drafts.ts`, `supplication-drafts.ts`, `corrections.ts`: editorial material, imported exclusively by development-only review routes. Preserve original A01–F04/FAQ01–FAQ16 identifiers and provenance.
- `published.ts`: explicit release allowlist, currently empty. Both renderer and build apply `publicationIssues` before showing normative content. Extract approved records into individual release content modules; do not import an entire draft collection and select an array element, because that can pull other drafts into the production bundle. Production bundle tests must continue to pass.
- `localization.ts`: separate English publication gate. `namespaces.ts`: active Umrah and **disabled, empty Hajj** namespace. Existing records specify namespace=umrah; omitted namespace is treated as Umrah for compatibility. Hajj has no public module or rites.

Do not change the six existing personal progress IDs, infer microstep completion from stage checkboxes, or overwrite personal content with curated content. Content IDs never become user progress silently. No new persistent ritual IDs were introduced by this milestone.

For future Hajj, add its own stage types/data under a separate namespace, choose stable namespace-prefixed record/stage identifiers, add source/review tests and deliberately design trip/backup compatibility before enabling it. Do not reuse Umrah IDs to imply completed Hajj rites. Add appropriate translations and actual reviewed content before changing the namespace's enabled flag. The current publication gate rejects disabled Hajj records.

## FAQ authoring

Keep the public question index synchronized with the 16 foundation IDs. Add concise answer in summaryAr and full context in detailsAr; FAQ publication requires detailed text as well as evidence/approval. Assign the actual legal class and scope after review. Record disputed views with stable view IDs, accurate summaries and checked evidence. Do not manufacture a one-size-fits-all fatwa for missed rites, bleeding, doubts, incapacity or fidyah. Existing drafts have no approved answers: the public page displays only question headings, categories, review notices and methodology.

## Arabic source and English meaning integrity

Original Arabic Qur'an/hadith quotations stay byte-for-byte in `Evidence.exactArabicText` and render lang=ar/dir=rtl in either interface language. Do not run them, user text or religious content through the UI translator.

An optional `englishMeaning` needs exact text, an independently checked translation source URL, checker/date and verified=true. The evidence viewer displays an English meaning only when those fields are present and checked. No English meaning was created or verified in this milestone. Website titles/UI labels are not English translations of religious proofs.

For an English religious record, fill `translations.en`: title, concise/detailed text, steps, school scope, contextual applicability, stable-ID disputed views and audience annotations. Source checking is separate from qualified approval. The English mapping requires its own named qualified reviewer, qualifications, date, confirmed claim coverage and scholarly_approved status, in addition to the Arabic record passing the original gate. A translated phrase is not approved merely because its Arabic counterpart is approved. Missing/unapproved English religious text is withheld; development preview labels the original Arabic as an unapproved draft.

No actual English religious translations have been approved. All 51 original records remain needs_review and all reviewer/approval fields remain unassigned. Do not copy synthetic TEST ONLY reviewer data from tests into content.

## Workflow

1. Add/edit a draft with provenance, stable ID, namespace, date of the actual edit and needs_review status. Changes to previously approved claims require renewed source/scholarly/translation review.
2. Open each primary source and check exact locator, text and context. Record real checking identity/date; a page visit is not claim coverage. Never invent hadith grades or references. Keep excerpts short and lawful.
3. Confirm evidence covers every assertion, classify the real school/opinion scope and document disputed positions. Use the existing source-check transition; it does not publish anything.
4. Obtain genuine named qualified review and, separately, English translation review. Browser feedback and filters cannot grant approval.
5. Run `npm run dev`, open `/review` or `/review/faq`, and acknowledge the preview warning. Inspect both audiences/locales and evidence. Export local feedback separately; it never enters pilgrim backups.
6. Put only approved records in `published.ts`; regenerate `npm run content:status`, run all checks and review the diff. Seek explicit deployment authorization before any publication.

## UI translations

`src/i18n/en.ts` contains legacy Arabic source-message IDs (gettext style). `messages.ts` keeps Arabic/English pairs for new semantic IDs. `t()` interpolates named parameters; use `useLanguage()` for reactive components. Both catalogs are bundled, never downloaded. Run `npm run i18n:check`; it also runs before a production build. Preserve user-authored text as data, including whitespace, Unicode, names, renamed categories and custom task labels. Only unchanged built-in seed labels are localized for display.

Language is an ar/en entry in the existing preferences table, with an optional tiny localStorage startup mirror. Schema/backup format remain 2. Old backups without a language entry restore successfully while retaining the current language preference. Updated backups remain v2 but include a new preference key; an obsolete pre-0.2 importer may reject that new key, so do not promise forward compatibility with old binaries.
# Current source integration and future publication

For v2.1 use [the evidence matrix](RELIGIOUS_EVIDENCE_MATRIX.md) and [post-launch workflow](POST_LAUNCH_CONTENT_UPDATE_WORKFLOW.md). `npm run sources:identity` fingerprints the base draft and source addendum together; `npm run content:status` regenerates current counts, handoff and matrix. Structured partial source observations never grant complete claim coverage or scholarly approval. Public promotion must be deliberate, genuinely reviewed and separate from private review/export tooling. All 51 IDs and current database/backup versions remain stable.
