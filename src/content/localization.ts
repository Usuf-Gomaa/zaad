import type { ReligiousRecord } from "./schema";
import { isPublished } from "./publication";
export function isPublishedInLocale(
  record: ReligiousRecord,
  locale: "ar" | "en",
) {
  if (!isPublished(record)) return false;
  if (locale === "ar") return true;
  const en = record.translations?.en;
  return (
    !!en &&
    en.reviewStatus === "scholarly_approved" &&
    !!en.reviewedBy?.trim() &&
    !!en.reviewerQualifications?.trim() &&
    !!en.reviewedAt &&
    /^\d{4}-\d{2}-\d{2}$/.test(en.reviewedAt) &&
    en.sourceCoverageConfirmed &&
    !!en.title.trim() &&
    !!en.summary.trim() &&
    !!en.details.trim() &&
    en.steps.length === record.stepsAr.length &&
    en.disputes.length === record.disputes.length &&
    en.genderNotes.length === record.genderNotes.length &&
    record.disputes.every(
      (view) =>
        !!view.id &&
        en.disputes.some(
          (tr) => tr.id === view.id && tr.label.trim() && tr.summary.trim(),
        ),
    )
  );
}
export function localizedReligious(
  record: ReligiousRecord,
  locale: "ar" | "en",
) {
  if (locale === "en") return record.translations?.en;
  return {
    title: record.titleAr,
    summary: record.summaryAr,
    details: record.detailsAr || "",
    steps: record.stepsAr,
    legalSchoolScope: record.legalSchoolScope,
    applicability: record.applicabilityAr,
    disputes: record.disputes.map((d, i) => ({
      id: d.id || String(i),
      label: d.labelAr,
      summary: d.summaryAr,
    })),
    genderNotes: record.genderNotes.map((n) => ({
      gender: n.gender,
      text: n.textAr,
    })),
  };
}
