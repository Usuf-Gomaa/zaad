# Religious editorial policy

V2 review material remains a separate unapproved overlay. All source pointers are candidates; R1–R6 general reading is a statement in the supplied draft, not a new verification by this integration. No scientific checking/translation/approval is inherited by revised wording. The earlier A01 excerpt remains historical only. See REVIEWER_HANDOFF.md for current review states and unresolved questions.

Reviewer feedback uses optional self-entered names and agree/revise/research decisions solely as local editorial comments. It never sets source_checked, scholarly_approved, checkedBy, reviewedBy, a grade or confirmed claim coverage. The protected environment is loopback-only with acknowledgement and persistent warnings; it is not a network-authenticated public staging site. Never upload the private build or feedback exports publicly.

The bilingual FAQ milestone adds a separate English religious-content gate, detailed FAQ field requirements and disabled future Hajj namespace. See CONTENT_AUTHORING.md. Translating UI/question headings is not scholarly approval of an answer. All original records and source checks retain their previous review status; no new religious approval or English Qur'an/hadith meaning has been invented.

No public normative content is approved in this build. Stage names are organizational labels from the specification, and checkbox labels are personal tracking statements, not legal verdicts.

The registry preserves master-spec IDs S01/S03 and adds pack IDs S1–S5 without collisions. S1–S5 were visited on 2026-11-23; page existence is separate from exact source checking and scholarly approval. One short A01/S1 excerpt was checked and is available only in development editorial preview. All whole records remain needs_review. No hadith wording, grade, distance or classification is generated from memory.

To release a rule, a qualified named reviewer must check exact wording, evidence type, exact citation, source link, established grading if applicable, audience, school attribution, differences of opinion, classification, review date and reviewer. `src/content/schema.ts` records these fields. `publicationIssues`/`isPublished` require scholarly_approved, named reviewer/qualifications/date, full sourceCoverageConfirmed, checked exact evidence, registered matching source URLs/types, school scope for legal classifications and sourced dispute views when applicable. Both UI and Vite build use the gate. Tests use clearly synthetic reviewer fixtures, never real approvals. Human identity/qualification validation remains an editorial responsibility; field presence is not proof of credentials.

## Review workflow

1. Run `npm run dev`, open `/review`, and explicitly acknowledge the warning. Drafts are not accessible in production, including via query parameters. This workspace is an editorial tool, not an alternate public guide.
2. Examine each record's source mapping, exact locators, audience, wording and claim coverage. Record feedback in the separate local `zaad-editorial` database and export it. These notes never change approvals, user du'as or the user's backup format.
3. Source checking must cover all assertions, not merely a short quotation. Set exact checked evidence/checker/date and confirm coverage before applying the pure `transitionReview(...,'source_checked')` function in an editorial change. Source_checked never makes a record publicly visible.
4. Obtain real named qualified review, record qualifications/date, school scope and disputed views. The approval transition requires prior source_checked. There is no browser self-approval/publish button. An approved record that is later edited needs renewed source and scholarly review; do not retain stale approval metadata.
5. Review the source-control change and put only genuinely approved records in `src/content/published.ts`. Preserve stable record IDs and stage progress IDs. Run all checks and `npm run content:status`. The build fails if that release list contains incomplete/unapproved records. Do not deploy without explicit approval.

Source text excerpts must stay short, accurate and contextual. No record's absence of dispute details implies consensus. All current `disputed` values are placeholders meaning classification needs review, not a verified finding that every issue is disputed. The source registry tracks page visits; only evidence entries track exact textual checks. See RELIGIOUS_CONTENT_STATUS.md for current counts and blockers.

Unreviewed material stays in the editorial queue. The app must never derive penalties, invalidity or automatic tahallul from checkboxes. Cases involving omissions, bleeding, incapacity, uncertainty and compensation go to qualified scholars. Practical planning suggestions must remain clearly separate from obligations and recommendations.
