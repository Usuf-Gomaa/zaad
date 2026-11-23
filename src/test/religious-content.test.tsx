import { afterEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReligiousContent } from "../features/umrah/ReligiousContent";
import { EvidenceSheet } from "../components/EvidenceSheet";
import { draftRecords } from "../content/drafts";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("never exposes normative drafts publicly, including their titles and evidence text", () => {
  render(
    <MemoryRouter>
      <ReligiousContent
        stageId="prepare"
        gender="women"
        records={draftRecords}
      />
    </MemoryRouter>,
  );
  expect(screen.getByText("المحتوى العلمي قيد المراجعة")).toBeVisible();
  expect(screen.queryByText(draftRecords[0].summaryAr)).not.toBeInTheDocument();
  expect(screen.queryByText(draftRecords[2].titleAr)).not.toBeInTheDocument();
  cleanup();
  render(<EvidenceSheet record={draftRecords[0]} close={() => {}} />);
  expect(
    screen.getByText("هذا السجل غير منشور ولا يعرض قبل الاعتماد."),
  ).toBeVisible();
  expect(
    screen.queryByText(draftRecords[0].evidence[0].exactArabicText!),
  ).not.toBeInTheDocument();
});
it("shows checked local excerpt and verification boundaries offline without fetching", () => {
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockRejectedValue(Error("offline"));
  render(<EvidenceSheet record={draftRecords[0]} editorial close={() => {}} />);
  const dialog = screen.getByRole("dialog");
  expect(
    within(dialog).getByText(draftRecords[0].evidence[0].exactArabicText!),
  ).toBeVisible();
  expect(within(dialog).getByText(/ليس مراجعاً شرعياً/)).toBeVisible();
  expect(within(dialog).getByText(/تغطية الأدلة لكل ادعاءات/)).toBeVisible();
  expect(fetch).not.toHaveBeenCalled();
});
it("does not manufacture hadith grade or quotation from registry metadata", () => {
  render(
    <EvidenceSheet
      record={draftRecords.find((r) => r.id === "E02")}
      editorial
      close={() => {}}
    />,
  );
  expect(
    screen.getByText("لم تسجل درجة حديث مستقلة؛ لا تستنتج من اسم الموقع."),
  ).toBeVisible();
  expect(document.querySelector("blockquote")).toBeNull();
});
it("preview gender filter preserves shared records and only changes relevant annotations", () => {
  const { rerender } = render(
    <MemoryRouter>
      <ReligiousContent
        stageId="prepare"
        gender="women"
        records={draftRecords}
        editorial
      />
    </MemoryRouter>,
  );
  expect(screen.getByText("لباس المرأة وتغطية الوجه")).toBeVisible();
  expect(screen.queryByText("لباس الرجل ووسائل التثبيت")).toBeNull();
  expect(screen.getByText("الاستعداد والنظافة")).toBeVisible();
  rerender(
    <MemoryRouter>
      <ReligiousContent
        stageId="prepare"
        gender="men"
        records={draftRecords}
        editorial
      />
    </MemoryRouter>,
  );
  expect(screen.getByText("لباس الرجل ووسائل التثبيت")).toBeVisible();
  expect(screen.queryByText("لباس المرأة وتغطية الوجه")).toBeNull();
  expect(screen.getByText("الاستعداد والنظافة")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "الأدلة وحالة المراجعة — A02" }),
  );
  expect(screen.getByRole("dialog")).toBeVisible();
});
it("keeps a one-tap personal dua shortcut on tawaf and sai", () => {
  for (const stageId of ["tawaf", "sai"] as const) {
    render(
      <MemoryRouter>
        <ReligiousContent stageId={stageId} gender="all" />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("link", { name: "افتح دعواتي الآن" }),
    ).toHaveAttribute("href", "/duas");
    cleanup();
  }
});
