export type ReviewParagraph = {
  id: string;
  titleAr: string;
  audienceAr: string;
  summaryAr: string;
  detailsAr: string;
  candidateIds: string[];
  referenceNotesAr: string[];
  researchNotesAr: string[];
  bodyStatus: "drafted" | "research_only";
};
