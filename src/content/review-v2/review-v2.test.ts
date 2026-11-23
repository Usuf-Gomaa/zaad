/// <reference types="node" />
import { it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  reviewParagraphs,
  reviewPackFile,
  reviewPackSha256,
  candidateSources,
} from "./pack-data";
import {
  reviewRecords,
  legacyRecords,
  reviewRites,
  reviewFaqs,
  reviewSources,
} from "./records";
import { isPublished, publicationIssues } from "../publication";
import { publishedRecords } from "../published";
it("imports the exact provided pack with complete stable-ID coverage and retained earlier records", () => {
  expect(
    createHash("sha256").update(readFileSync(reviewPackFile)).digest("hex"),
  ).toBe(reviewPackSha256);
  expect(reviewRecords.map((r) => r.id)).toEqual(
    legacyRecords.map((r) => r.id),
  );
  expect(reviewRites).toHaveLength(34);
  expect(reviewFaqs).toHaveLength(16);
  expect(reviewParagraphs).toHaveLength(50);
  expect(legacyRecords[0].provenance.file).toBe(
    "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md",
  );
  expect(legacyRecords[0].evidence[0].verified).toBe(true);
  for (const paragraph of reviewParagraphs) {
    const record = reviewRecords.find((r) => r.id === paragraph.id)!;
    expect(record.summaryAr).toBe(paragraph.summaryAr);
    expect(record.detailsAr).toBe(paragraph.detailsAr);
    expect(record.provenance.file).toBe(reviewPackFile);
    expect(record.editorialReview?.researchNotesAr.length).toBeGreaterThan(0);
  }
});
it("never transfers historical source checks, grades, reviewer identities or translations to v2", () => {
  expect(publishedRecords).toEqual([]);
  for (const record of reviewRecords) {
    expect(record.reviewStatus).toBe("needs_review");
    expect(record.sourceCoverageConfirmed).toBe(false);
    expect(record.reviewedBy).toBeNull();
    expect(record.reviewedAt).toBeNull();
    expect(record.translations?.en).toBeUndefined();
    expect(record.actionableChecklist).toBe(false);
    expect(isPublished(record, reviewSources)).toBe(false);
    expect(publicationIssues(record, reviewSources).length).toBeGreaterThan(0);
    for (const e of record.evidence) {
      expect(e.verified).toBe(false);
      expect(e.checkedBy).toBeNull();
      expect(e.checkedAt).toBeNull();
      expect(e.exactArabicText).toBeNull();
      expect(e.hadithGrade).toBeNull();
      expect(e.englishMeaning).toBeUndefined();
    }
  }
  expect(candidateSources.map((s) => s.id)).toEqual([
    "R1",
    "R2",
    "R3",
    "R4",
    "R5",
    "R6",
    "R7",
    "R8",
  ]);
  expect(candidateSources.every((s) => s.visitedAt === null)).toBe(true);
  expect(candidateSources.find((s) => s.id === "R7")?.url).toBe("");
  expect(
    reviewRecords.find((r) => r.id === "FAQ14")?.evidence[0].sourceId,
  ).toBe("S4");
});
it("distinguishes prepared text, research briefs and missing exact prayer text without calling any approved", () => {
  expect(
    reviewRecords.filter((r) => r.editorialReview?.bodyStatus === "drafted"),
  ).toHaveLength(43);
  expect(
    reviewRecords.filter(
      (r) => r.editorialReview?.bodyStatus === "research_only",
    ),
  ).toHaveLength(7);
  expect(
    reviewRecords
      .filter((r) => r.editorialReview?.bodyStatus === "text_pending")
      .map((r) => r.id),
  ).toEqual(["DUA-Q2-201"]);
  expect(reviewRecords.find((r) => r.id === "A04")?.gender).toBe("all");
  expect(reviewRecords.find((r) => r.id === "A05")?.gender).toBe("all");
  expect(reviewRecords.find((r) => r.id === "B05")?.gender).toBe("women");
  expect(reviewRecords.find((r) => r.id === "C06")?.gender).toBe("men");
});
