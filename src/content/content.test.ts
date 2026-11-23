import { it, expect } from "vitest";
import { draftRecords } from "./drafts";
import { faqDrafts } from "./faq-drafts";
import { supplicationDrafts } from "./supplication-drafts";
import { publishedRecords } from "./published";
import { sources } from "./sources";
import { stages } from "./stages";
import {
  isPublished,
  publicationIssues,
  visibleRecords,
  evidenceIssues,
} from "./publication";
import { transitionReview } from "./review";
import type { ReligiousRecord } from "./schema";
// Synthetic fixture: never part of any app content/library/production source.
export function approvedFixture(): ReligiousRecord {
  return {
    ...structuredClone(draftRecords[0]),
    id: "TEST-ONLY",
    summaryAr: "نص اختباري فقط",
    legalClass: "not_applicable",
    reviewStatus: "scholarly_approved",
    reviewedBy: "TEST REVIEWER ONLY",
    reviewerQualifications: "TEST ONLY",
    reviewedAt: "2026-11-23",
    sourceCoverageConfirmed: true,
    evidence: [
      {
        ...draftRecords[0].evidence[0],
        exactArabicText: "مقتطف اختباري محلي",
        verified: true,
        checkedBy: "TEST CHECKER",
        checkedAt: "2026-11-23",
      },
    ],
  };
}
it("imports every deterministic pack ID without touching stage identifiers", () => {
  expect(draftRecords).toHaveLength(34);
  expect(faqDrafts).toHaveLength(16);
  expect(supplicationDrafts).toHaveLength(1);
  expect(stages.map((s) => s.id)).toEqual([
    "prepare",
    "ihram",
    "tawaf",
    "after",
    "sai",
    "finish",
  ]);
  expect(draftRecords.map((r) => r.id)).toEqual([
    "A01",
    "A02",
    "A03",
    "A04",
    "A05",
    "A06",
    "B01",
    "B02",
    "B03",
    "B04",
    "B05",
    "B06",
    "B07",
    "C01",
    "C02",
    "C03",
    "C04",
    "C05",
    "C06",
    "C07",
    "C08",
    "D01",
    "D02",
    "D03",
    "D04",
    "E01",
    "E02",
    "E03",
    "E04",
    "E05",
    "F01",
    "F02",
    "F03",
    "F04",
  ]);
});
it("keeps every actual draft hidden and every previous stage progress independent", () => {
  const records = [...draftRecords, ...faqDrafts, ...supplicationDrafts];
  expect(visibleRecords(records)).toEqual([]);
  expect(publishedRecords).toEqual([]);
  for (const r of records) {
    expect(r.reviewStatus).toBe("needs_review");
    expect(r.reviewedBy).toBeNull();
    expect(r.reviewedAt).toBeNull();
    expect(r.actionableChecklist).toBe(false);
    expect(r.sourceCoverageConfirmed).toBe(false);
    expect(r.provenance.file).toBe("ZAAD_RELIGIOUS_CONTENT_PACK_v1.md");
  }
});
it("retains source namespace, pack provenance, exact locators and no phantom grades", () => {
  expect(new Set(sources.map((s) => s.id)).size).toBe(7);
  expect(sources.map((s) => s.id)).toEqual([
    "S1",
    "S2",
    "S3",
    "S4",
    "S5",
    "S01",
    "S03",
  ]);
  for (const r of [...draftRecords, ...faqDrafts, ...supplicationDrafts])
    for (const e of r.evidence) {
      expect(sources.some((s) => s.id === e.sourceId && s.url === e.url)).toBe(
        true,
      );
      expect(e.hadithGrade).toBeNull();
      expect(e.gradeCitation).toBeNull();
      if (e.verified) {
        expect(e.checkedAt).toBe("2026-11-23");
        expect(e.locator).not.toContain("يحتاج تحققاً");
      }
    }
});
it("requires approval, evidence, provenance of checks and scope independently", () => {
  const approved = approvedFixture();
  expect(isPublished(approved)).toBe(true);
  for (const status of [
    "needs_review",
    "source_checked",
    "correction_required",
  ] as const)
    expect(isPublished({ ...approved, reviewStatus: status })).toBe(false);
  for (const key of [
    "reviewedBy",
    "reviewedAt",
    "reviewerQualifications",
  ] as const)
    expect(isPublished({ ...approved, [key]: null })).toBe(false);
  expect(isPublished({ ...approved, evidence: [] })).toBe(false);
  expect(isPublished({ ...approved, sourceCoverageConfirmed: false })).toBe(
    false,
  );
  expect(
    isPublished({ ...approved, legalClass: "sunnah", legalSchoolScope: null }),
  ).toBe(false);
  expect(
    evidenceIssues({ ...approved.evidence[0], url: "https://wrong.example/" }),
  ).not.toHaveLength(0);
  expect(
    evidenceIssues({ ...approved.evidence[0], verified: false }),
  ).not.toHaveLength(0);
  expect(
    evidenceIssues({
      ...approved.evidence[0],
      hadithGrade: "invented",
      gradeCitation: null,
    }),
  ).not.toHaveLength(0);
  expect(
    publicationIssues({
      ...approved,
      disputes: [{ labelAr: "test", summaryAr: "test", evidence: [] }],
    }),
  ).not.toHaveLength(0);
});
it("cannot promote a source visit or quote alone to religious approval", () => {
  expect(() => transitionReview(draftRecords[0], "source_checked")).toThrow();
  expect(() =>
    transitionReview(draftRecords[0], "scholarly_approved"),
  ).toThrow();
  const sourceChecked = transitionReview(
    { ...approvedFixture(), reviewStatus: "needs_review" },
    "source_checked",
  );
  expect(isPublished(sourceChecked)).toBe(false);
  expect(
    transitionReview(sourceChecked, "scholarly_approved").reviewStatus,
  ).toBe("scholarly_approved");
  expect(
    transitionReview(sourceChecked, "correction_required").reviewStatus,
  ).toBe("correction_required");
});
it("gender selection retains shared content and filters only particular annotations", () => {
  const shared = draftRecords
    .filter((r) => r.gender === "all")
    .map((r) => r.id);
  const women = visibleRecords(draftRecords, "women", true).map((r) => r.id);
  const men = visibleRecords(draftRecords, "men", true).map((r) => r.id);
  expect(shared.every((id) => women.includes(id) && men.includes(id))).toBe(
    true,
  );
  expect(women).toContain("A03");
  expect(women).not.toContain("A02");
  expect(men).toContain("A02");
  expect(men).not.toContain("A03");
});
