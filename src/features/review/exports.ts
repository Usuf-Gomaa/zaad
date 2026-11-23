import type { ReligiousRecord } from "../../content/schema";
import { publicationIssues } from "../../content/publication";
import {
  reviewEdition,
  reviewPackFile,
  reviewPackSha256,
  sourceDocuments,
} from "../../content/review-v2/source-identity";
import { reviewSources } from "../../content/review-v2/records";
import type { Feedback } from "./review-db";
export function reviewExport(records: ReligiousRecord[], feedback: Feedback[]) {
  return {
    format: "zaad-editorial-feedback",
    version: 2,
    edition: reviewEdition,
    exportedAt: new Date().toISOString(),
    warning:
      "UNAPPROVED EDITORIAL DRAFT. Reviewer feedback is not scholarly approval. Contains private reviewer-entered feedback; do not publish.",
    sourcePack: { file: reviewPackFile, sha256: reviewPackSha256, fingerprintMethod: 'SHA256(JSON.stringify(sourceDocuments))', sourceDocuments },
    records: records.map((record) => ({
      ...record,
      blockers: publicationIssues(record, reviewSources),
    })),
    sources: reviewSources.filter((source) =>
      records.some((record) =>
        record.evidence.some((e) => e.sourceId === source.id),
      ),
    ),
    feedback: feedback.filter((note) =>
      records.some((record) => record.id === note.id),
    ),
  };
}
// Quote every CSV cell and neutralize spreadsheet formula execution. JSON retains exact original text.
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^\s*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function reviewCsv(records: ReligiousRecord[], feedback: Feedback[]) {
  const header = [
    "record_id",
    "edition",
    "title_ar",
    "text_state",
    "review_status",
    "feedback_edition",
    "feedback_source_pack_sha256",
    "decision",
    "reviewer_name",
    "reviewer_note",
    "updated_at",
    "candidate_source_ids",
    "outstanding_verification",
    "scholarly_approval",
    "partial_source_observations",
    "source_observation_limits",
  ];
  return (
    "\uFEFF" +
    [
      header,
      ...records.map((record) => {
        const note = feedback.find((f) => f.id === record.id);
        return [
          record.id,
          reviewEdition,
          record.titleAr,
          record.editorialReview?.bodyStatus,
          record.reviewStatus,
          note?.edition || "",
          note?.sourcePackSha256 || "",
          note?.edition === reviewEdition &&
          note.sourcePackSha256 === reviewPackSha256
            ? note.decision
            : "",
          note?.edition === reviewEdition &&
          note.sourcePackSha256 === reviewPackSha256
            ? note.reviewerName
            : "",
          note?.note,
          note?.updatedAt,
          record.evidence.map((e) => e.sourceId).join("; "),
          record.editorialReview?.researchNotesAr.join("\n"),
          "NOT GRANTED BY FEEDBACK",
          JSON.stringify(record.sourceObservations || []),
          record.sourceObservations?.map(s => s.limits.ar + '\n' + s.limits.en).join('\n'),
        ];
      }),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")
  );
}
export function downloadReview(text: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
