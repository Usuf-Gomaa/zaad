import { draftRecords } from "../drafts.ts";
import { faqDrafts } from "../faq-drafts.ts";
import { supplicationDrafts } from "../supplication-drafts.ts";
import { sources } from "../sources.ts";
import type { Evidence, ReligiousRecord } from "../schema";
import {
  candidateSources,
  reviewPackFile,
  reviewParagraphs,
  duaPlanAr,
} from "./pack-data.ts";
import { reviewEdition } from "./source-identity.ts";
import { addendumSources, sourceObservations } from "./source-addendum.ts";
export const legacyRecords = [
  ...draftRecords,
  ...faqDrafts,
  ...supplicationDrafts,
];
export const reviewSources = [...sources, ...candidateSources, ...addendumSources];
function candidate(id: string): Evidence {
  const source = reviewSources.find((s) => s.id === id);
  if (!source) throw Error(`Unknown candidate source ${id}`);
  const observation = Object.values(sourceObservations).flat().find(s => s.sourceId === id);
  return {
    sourceId: id,
    locator: observation?.locator || (
      id === "R7"
        ? "البقرة 2:158، 2:201، 2:196 — إحالات مرشحة من المسودة؛ لم يحدد موضع الاستدلال لكل ادعاء بعد."
        : `${id} — مرجع مرشح من المسودة؛ الموضع والنص والسياق لم يقابلوا بعد.`),
    exactArabicText: null,
    url: source.url,
    evidenceType: source.kind,
    verified: false,
    checkedBy: null,
    checkedAt: null,
    hadithGrade: null,
    gradeCitation: null,
  };
}
export const reviewRecords: ReligiousRecord[] = legacyRecords.map((base) => {
  const paragraph = reviewParagraphs.find((p) => p.id === base.id);
  if (!paragraph && base.id !== "DUA-Q2-201")
    throw Error(`Missing v2 overlay ${base.id}`);
  const ids = [...(paragraph?.candidateIds || ["R7"])];
  if (base.id === "FAQ14") ids.push("S4");
  for (const observation of sourceObservations[base.id] || []) ids.push(observation.sourceId);
  const evidence = [...new Set(ids)].map(candidate);
  const audience = paragraph?.audienceAr || "للجميع";
  return {
    ...base,
    sourceObservations: sourceObservations[base.id] || [],
    titleAr: paragraph?.titleAr || base.titleAr,
    summaryAr: paragraph?.summaryAr || base.summaryAr,
    detailsAr: paragraph?.detailsAr || duaPlanAr,
    gender: audience === "رجال" ? "men" : audience === "نساء" ? "women" : "all",
    stepsAr: [],
    genderNotes: [],
    evidence,
    disputes: [],
    translations: undefined,
    reviewStatus: "needs_review",
    sourceCoverageConfirmed: false,
    reviewedBy: null,
    reviewerQualifications: null,
    reviewedAt: null,
    actionableChecklist: false,
    provenance: {
      file: reviewPackFile,
      section: paragraph?.id.startsWith("FAQ") ? "3" : paragraph ? "2" : "4",
      recordId: base.id,
    },
    editorialReview: {
      edition: reviewEdition,
      bodyStatus: paragraph?.bodyStatus || "text_pending",
      audienceAr: audience,
      researchNotesAr: paragraph?.researchNotesAr || [
        "النص القرآني والرسم والسياق والمصدر والترجمة لم تقابل؛ لا يدرج نص من الذاكرة.",
      ],
      referenceNotesAr: paragraph?.referenceNotesAr || [
        "R7 مرجع أولي؛ يلزم اختيار مصحف موثق.",
      ],
      englishTranslation: "pending",
    },
    editorialNotes: [
      "نص تحريري من المسودة v2؛ ليس اقتباساً محققاً أو فتوى معتمدة.",
      "لم ينتقل فحص أي مقتطف من النسخة السابقة إلى ادعاءات النص الجديد.",
    ],
  };
});
export const reviewRites = reviewRecords.filter((r) =>
  /^[A-F]\d{2}$/.test(r.id),
);
export const reviewFaqs = reviewRecords.filter((r) => r.id.startsWith("FAQ"));
