# ZAAD 0.4.0 reviewer handoff

مسودة للمراجعة الشرعية — غير معتمدة للنشر

Review edition 2.1.0-draft. All 34 rites, all 16 FAQ answers and DUA-Q2-201 are browsable with full supplied Arabic, gender/stage filters, evidence references, research notes and earlier-version comparisons. Research completeness: 43 narrative drafts, seven research briefs, one exact prayer pending. None is approved. English UI is available; religious English translations remain pending.

## Start and trust boundary

- Local offline review: npm run review, then http://127.0.0.1:4180/review. The loopback runner is not remote authentication.
- Invited remote review: use only the authenticated network-only staging artifact and [deployment runbook](REVIEWER_STAGING_DEPLOYMENT.md), after owner approval. Never upload .review-dist or expose the dev server.
- Public dist never includes these drafts. No deployment has been performed.

## Workflow

1. Acknowledge the persistent unapproved-content warning. Browse the six rite stages or searchable FAQ; use the record view for all 51 IDs and the du'a candidate.
2. Read full context and research notes. Inspect evidence. Five affected records additionally show limited source observations, checker identity/method/date, claim rationale, opinion scope and exceptions. All remain needs_review.
3. Inspect earlier-version evidence separately. Earlier checks do not automatically transfer to new wording. Disputed classifications are provisional; resolve actual positions with their own evidence rather than treating placeholders as unanimous or fully researched.
4. Open per-record Reviewer feedback. Type your own name optionally, choose a decision if desired, enter exact notes, wait for Saved and retry any error. No feedback action grants approval or fills qualified reviewer fields.
5. Export individual or bulk JSON/CSV. JSON contains exact notes/history, full records, source documents, fingerprint, observations and blockers. CSV includes current feedback and observations, with spreadsheet formula protection. Exports contain private drafts/names; deliver securely to the project owner through an agreed channel. Nothing is uploaded automatically.
6. When either source document changes, prior notes persist but old decisions/names are not reused. Saving archives the previous feedback snapshot. Export before clearing browser data, changing device/origin or closing a staging session.

Feedback is local IndexedDB, editorial database v1; user database v2 and backup v2 remain unchanged. Queue/error/update guards protect writes. Forced termination, storage eviction or manual browser clearing cannot be guaranteed recoverable. Remote staging is network-only and requires a fresh dedicated origin with no prior draft service worker; browser credential revocation cannot erase already viewed text, exports or notes.

See [evidence matrix](RELIGIOUS_EVIDENCE_MATRIX.md), [content status](RELIGIOUS_CONTENT_STATUS.md), [release readiness](PUBLIC_RELEASE_READINESS.md), and [future updates](POST_LAUNCH_CONTENT_UPDATE_WORKFLOW.md). No qualified approvals, hadith grades or English verification were fabricated.
