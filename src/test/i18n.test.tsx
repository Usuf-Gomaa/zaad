import { it, expect, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { applyLanguage, t } from "../i18n";
import { selectLanguage } from "../i18n/preferences";
import { LanguageSelect } from "../components/LanguageSelect";
import { DuaEditor } from "../main";
import { db, seed, exportBackup, restoreBackup, type Dua } from "../db";
import { FaqPage } from "../features/faq/FaqPage";
import { draftRecords } from "../content/drafts";
import { faqDrafts } from "../content/faq-drafts";
import { isPublishedInLocale } from "../content/localization";
import { faqIndex } from "../content/umrah/faq-index";
beforeEach(async () => {
  applyLanguage("ar");
  await db.transaction("rw", db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await seed();
});
afterEach(() => {
  cleanup();
  applyLanguage("ar");
  localStorage.removeItem("zaad-language");
});
it("switches language while typing without remounting or changing original du’a text", async () => {
  const dua: Dua = {
    id: "bilingual",
    categoryId: "0",
    text: "",
    notes: "ملاحظة أصلية Original",
    pinned: false,
    order: 1,
    origin: "personal",
    updatedAt: 1,
  };
  await db.duas.put(dua);
  render(
    <>
      <LanguageSelect />
      <DuaEditor initial={dua} close={() => {}} />
    </>,
  );
  const original = "دعاء بلا ترجمة 🌿 with exact spaces  ";
  fireEvent.change(screen.getByLabelText("نص الدعاء"), {
    target: { value: original },
  });
  fireEvent.change(screen.getByLabelText("اللغة"), { target: { value: "en" } });
  await screen.findByLabelText("Du’a text");
  expect(document.documentElement.dir).toBe("ltr");
  expect(screen.getByLabelText("Du’a text")).toHaveValue(original);
  expect(screen.getByLabelText("Private notes")).toHaveValue(dua.notes);
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("Saved"),
  );
  expect((await db.duas.get(dua.id))?.text).toBe(original);
  expect((await db.duaDrafts.get(dua.id))?.text).toBe(original);
  await selectLanguage("ar");
  expect(document.documentElement.dir).toBe("rtl");
  expect(screen.getByLabelText("نص الدعاء")).toHaveValue(original);
});
it("keeps v2 format, restores pre-language backups and validates language values", async () => {
  const old = await exportBackup();
  await selectLanguage("en");
  await restoreBackup(JSON.stringify(old));
  expect(db.verno).toBe(2);
  expect((await db.preferences.get("language"))?.value).toBe("en");
  const current = await exportBackup();
  expect(current.version).toBe(2);
  (current.data.preferences as { id: string; value: string }[]).find(
    (p) => p.id === "language",
  )!.value = "unsafe";
  await expect(restoreBackup(JSON.stringify(current))).rejects.toThrow();
  expect((await db.preferences.get("language"))?.value).toBe("en");
  expect(t("إعداد غير صالح")).toBe("Invalid preference");
});
it("supports bilingual searchable categorized question topics without publishing draft answers", () => {
  applyLanguage("en");
  render(
    <MemoryRouter>
      <FaqPage records={faqDrafts} />
    </MemoryRouter>,
  );
  expect(document.querySelectorAll("[data-faq-id]")).toHaveLength(16);
  fireEvent.change(screen.getByLabelText("Search Umrah questions"), {
    target: { value: "wheelchair" },
  });
  expect(document.querySelectorAll("[data-faq-id]")).toHaveLength(1);
  expect(
    screen.getByText(
      "Answer awaiting review; no unapproved ruling is displayed.",
    ),
  ).toBeVisible();
  expect(screen.queryByText(faqDrafts[11].summaryAr)).toBeNull();
  expect(faqIndex.map((f) => f.id)).toEqual(faqDrafts.map((f) => f.id));
});
it("requires independent English content review even when an Arabic record has approval", () => {
  const fixture = {
    ...structuredClone(draftRecords[0]),
    legalClass: "not_applicable" as const,
    reviewStatus: "scholarly_approved" as const,
    reviewedBy: "TEST ONLY",
    reviewerQualifications: "TEST ONLY",
    reviewedAt: "2026-11-23",
    sourceCoverageConfirmed: true,
  };
  expect(isPublishedInLocale(fixture, "ar")).toBe(true);
  expect(isPublishedInLocale(fixture, "en")).toBe(false);
  fixture.translations = {
    en: {
      title: "Test",
      summary: "Test only",
      details: "Test only",
      steps: [],
      legalSchoolScope: null,
      applicability: null,
      disputes: [],
      genderNotes: [],
      reviewStatus: "source_checked",
      reviewedBy: null,
      reviewerQualifications: null,
      reviewedAt: null,
      sourceCoverageConfirmed: false,
    },
  };
  expect(isPublishedInLocale(fixture, "en")).toBe(false);
});
it("renders independently approved bilingual FAQ fixtures with concise detail and evidence views", () => {
  const fixture = {
    ...structuredClone(draftRecords[0]),
    id: "FAQ01",
    category: "faq" as const,
    namespace: "umrah" as const,
    legalClass: "not_applicable" as const,
    summaryAr: "اختبار مختصر فقط",
    detailsAr: "اختبار تفصيلي فقط",
    reviewStatus: "scholarly_approved" as const,
    reviewedBy: "TEST ONLY",
    reviewerQualifications: "TEST ONLY",
    reviewedAt: "2026-11-23",
    sourceCoverageConfirmed: true,
  };
  fixture.evidence[0].exactArabicText = "نص اختباري فقط";
  fixture.translations = {
    en: {
      title: "Test topic",
      summary: "Test concise answer only",
      details: "Test detailed explanation only",
      steps: [],
      legalSchoolScope: null,
      applicability: null,
      disputes: [],
      genderNotes: [],
      reviewStatus: "scholarly_approved",
      reviewedBy: "TEST TRANSLATION REVIEWER ONLY",
      reviewerQualifications: "TEST ONLY",
      reviewedAt: "2026-11-23",
      sourceCoverageConfirmed: true,
    },
  };
  expect(isPublishedInLocale(fixture, "en")).toBe(true);
  expect(isPublishedInLocale({ ...fixture, namespace: "hajj" }, "en")).toBe(
    false,
  );
  applyLanguage("en");
  render(
    <MemoryRouter>
      <FaqPage records={[fixture]} />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Search Umrah questions"), {
    target: { value: "miqat" },
  });
  expect(screen.getByText("Test concise answer only")).toBeVisible();
  fireEvent.click(screen.getByText("Explanation and context"));
  expect(screen.getByText("Test detailed explanation only")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Evidence and review methodology" }),
  );
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.getByText("نص اختباري فقط")).toHaveAttribute("dir", "rtl");
});
