import { it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { ReviewFeedback } from "../features/review/ReviewFeedback";
import { editorialDb, feedbackSaves } from "../features/review/review-db";
import { reviewRecords } from "../content/review-v2/records";
import {
  reviewEdition,
  reviewPackSha256,
} from "../content/review-v2/source-identity";
import { reviewCsv, reviewExport, csvCell } from "../features/review/exports";
import { applyLanguage } from "../i18n";
import { db, seed, exportBackup } from "../db";
beforeEach(async () => {
  applyLanguage("ar");
  await editorialDb.feedback.clear();
  await seed();
});
afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  await feedbackSaves.drain().catch(() => {});
  applyLanguage("ar");
});
it("preserves legacy feedback, accepts only reviewer-entered identity/decision and never grants approval", async () => {
  const before = await exportBackup();
  await editorialDb.feedback.put({
    id: "A01",
    note: "ملاحظة أصلية 🌿",
    updatedAt: 1,
  });
  render(<ReviewFeedback record={reviewRecords[0]} />);
  fireEvent.click(screen.getByText("ملاحظة المراجع — A01"));
  await waitFor(() =>
    expect(screen.getByLabelText("ملاحظة تحريرية — A01")).toHaveValue(
      "ملاحظة أصلية 🌿",
    ),
  );
  expect(screen.getByLabelText("اسم المراجع — A01")).toHaveValue("");
  expect(screen.getByLabelText("رأي المراجع — A01")).toHaveValue("");
  fireEvent.change(screen.getByLabelText("اسم المراجع — A01"), {
    target: { value: "اسم كتبه المراجع بنفسه" },
  });
  fireEvent.change(screen.getByLabelText("رأي المراجع — A01"), {
    target: { value: "agree" },
  });
  fireEvent.change(screen.getByLabelText("ملاحظة تحريرية — A01"), {
    target: { value: 'تحتاج مطابقة المصدر\nملاحظة عربية "🌿"  ' },
  });
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent(
      "حُفظت ملاحظة المراجعة",
    ),
  );
  const stored = await editorialDb.feedback.get("A01");
  expect(stored?.decision).toBe("agree");
  expect(stored?.reviewerName).toBe("اسم كتبه المراجع بنفسه");
  expect(stored?.edition).toBe(reviewEdition);
  expect(stored?.history).toEqual([{ note: "ملاحظة أصلية 🌿", updatedAt: 1 }]);
  expect(editorialDb.verno).toBe(1);
  expect(db.verno).toBe(2);
  expect((await exportBackup()).data).toEqual(before.data);
  expect(reviewRecords[0].reviewStatus).toBe("needs_review");
  expect(reviewRecords[0].reviewedBy).toBeNull();
});
it("reports feedback save failure and retries without claiming saved", async () => {
  const put = vi
    .spyOn(editorialDb.feedback, "put")
    .mockRejectedValueOnce(Error("quota"));
  render(<ReviewFeedback record={reviewRecords[0]} />);
  fireEvent.click(screen.getByText("ملاحظة المراجع — A01"));
  fireEvent.change(screen.getByLabelText("ملاحظة تحريرية — A01"), {
    target: { value: "لا تفقد هذه الملاحظة" },
  });
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent(
      "تعذر حفظ ملاحظة المراجعة",
    ),
  );
  expect(screen.getByLabelText("ملاحظة تحريرية — A01")).toHaveValue(
    "لا تفقد هذه الملاحظة",
  );
  put.mockRestore();
  fireEvent.click(screen.getByText("إعادة حفظ الملاحظة"));
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent(
      "حُفظت ملاحظة المراجعة",
    ),
  );
});
it("keeps feedback tied to the exact pack and does not reuse a decision when wording changes under the same edition", async () => {
  await editorialDb.feedback.put({
    id: "A01",
    edition: reviewEdition,
    sourcePackSha256: "EARLIER PACK",
    note: "ملاحظة عن النص السابق",
    reviewerName: "اسم سابق أدخله صاحبه",
    decision: "agree",
    updatedAt: 1,
  });
  render(<ReviewFeedback record={reviewRecords[0]} />);
  fireEvent.click(screen.getByText("ملاحظة المراجع — A01"));
  await waitFor(() =>
    expect(screen.getByLabelText("ملاحظة تحريرية — A01")).toHaveValue(
      "ملاحظة عن النص السابق",
    ),
  );
  expect(screen.getByLabelText("اسم المراجع — A01")).toHaveValue("");
  expect(screen.getByLabelText("رأي المراجع — A01")).toHaveValue("");
  fireEvent.change(screen.getByLabelText("ملاحظة تحريرية — A01"), {
    target: { value: "ملاحظة عن النص الحالي" },
  });
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent(
      "حُفظت ملاحظة المراجعة",
    ),
  );
  const current = await editorialDb.feedback.get("A01");
  expect(current?.sourcePackSha256).toBe(reviewPackSha256);
  expect(current?.decision).toBeUndefined();
  expect(current?.history?.[0].sourcePackSha256).toBe("EARLIER PACK");
  expect(current?.history?.[0].reviewerName).toBe("اسم سابق أدخله صاحبه");
});
it("exports complete record provenance and exact JSON feedback with formula-safe CSV", () => {
  const feedback = [
    {
      id: "A01",
      edition: reviewEdition,
      sourcePackSha256: reviewPackSha256,
      decision: "research" as const,
      reviewerName: "=FORMULA()",
      note: '"ملاحظة"\n🌿 ',
      updatedAt: 1,
    },
  ];
  const result = reviewExport([reviewRecords[0]], feedback);
  expect(result.records).toHaveLength(1);
  expect(result.feedback[0].note).toBe(feedback[0].note);
  expect(result.records[0].sourceCoverageConfirmed).toBe(false);
  expect(result.records[0].reviewedBy).toBeNull();
  const csv = reviewCsv([reviewRecords[0]], feedback);
  expect(csv.startsWith("\uFEFF")).toBe(true);
  expect(csv).toContain("'=FORMULA()");
  expect(csv).toContain('""ملاحظة""');
  expect(csv).toContain("NOT GRANTED BY FEEDBACK");
  expect(csvCell("  @payload")).toBe('"\'  @payload"');
});
