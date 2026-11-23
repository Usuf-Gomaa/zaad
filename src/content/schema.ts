export type StageId =
  "prepare" | "ihram" | "tawaf" | "after" | "sai" | "finish";
export type Gender = "all" | "men" | "women";
export type ReviewStatus =
  | "needs_review"
  | "source_checked"
  | "scholarly_approved"
  | "correction_required";
export type LegalClass =
  | "pillar"
  | "obligation"
  | "sunnah"
  | "recommended"
  | "permitted"
  | "disliked"
  | "prohibited"
  | "disputed"
  | "not_applicable";
export type Source = {
  id: string;
  title: string;
  url: string;
  kind: "quran" | "hadith" | "fatwa" | "official_guide";
  provenance: string;
  visitedAt: string | null;
  accessNote: string;
};
export type Evidence = {
  englishMeaning?: {
    text: string;
    sourceUrl: string;
    verified: boolean;
    checkedBy: string;
    checkedAt: string;
  };
  sourceId: string;
  locator: string;
  exactArabicText: string | null;
  url: string;
  evidenceType: Source["kind"];
  verified: boolean;
  checkedBy: string | null;
  checkedAt: string | null;
  hadithGrade: string | null;
  gradeCitation: string | null;
};
export type ReligiousRecord = {
  sourceObservations?: SourceObservation[];
  editorialReview?: {
    edition: string;
    bodyStatus: "drafted" | "research_only" | "text_pending";
    audienceAr: string;
    researchNotesAr: string[];
    referenceNotesAr: string[];
    englishTranslation: "pending";
  };
  namespace?: "umrah" | "hajj";
  detailsAr?: string;
  translations?: {
    en?: {
      title: string;
      summary: string;
      details: string;
      steps: string[];
      legalSchoolScope: string | null;
      applicability: string | null;
      disputes: { id: string; label: string; summary: string }[];
      genderNotes: { gender: "men" | "women"; text: string }[];
      reviewStatus: ReviewStatus;
      reviewedBy: string | null;
      reviewerQualifications: string | null;
      reviewedAt: string | null;
      sourceCoverageConfirmed: boolean;
    };
  };
  applicabilityAr: string | null;
  id: string;
  stageId: StageId | null;
  order: number;
  titleAr: string;
  summaryAr: string;
  stepsAr: string[];
  gender: Gender;
  category: "instruction" | "ruling" | "dhikr" | "dua" | "faq" | "caution";
  legalClass: LegalClass;
  legalSchoolScope: string | null;
  evidence: Evidence[];
  disputes: {
    id?: string;
    labelAr: string;
    summaryAr: string;
    evidence: Evidence[];
  }[];
  genderNotes: { gender: "men" | "women"; textAr: string }[];
  reviewStatus: ReviewStatus;
  reviewedBy: string | null;
  reviewerQualifications: string | null;
  sourceCoverageConfirmed: boolean;
  reviewedAt: string | null;
  lastEdited: string;
  actionableChecklist: boolean;
  provenance: { file: string; section: string; recordId: string };
  editorialNotes: string[];
};
export const contentVersion = "1.1.0";

// Editorial retrieval observations never satisfy the publication gate or qualified review.
export type SourceObservation = {
  id: string;
  sourceId: string;
  claim: { ar: string; en: string };
  rationale: { ar: string; en: string };
  limits: { ar: string; en: string };
  opinionScope: { ar: string; en: string };
  locator: string;
  quotationAr: string | null;
  sourceExists: true;
  status: "partial_source_check";
  completeClaimCoverage: false;
  qualifiedApproval: false;
  checkedAt: string;
  checkedBy: string;
  method: string;
  provenanceFile: string;
};
