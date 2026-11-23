import { afterEach, beforeEach, it, expect, vi } from "vitest";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { DuaEditor, PersistedCheckbox } from "../main";
import { db, seed, type Dua } from "../db";
const dua: Dua = {
  id: "component",
  categoryId: "0",
  text: "",
  notes: "",
  origin: "personal",
  pinned: false,
  order: 1,
  updatedAt: 1,
};
it("rolls checklist feedback back when a durable write fails", async () => {
  render(
    <label>
      مرحلة تجريبية
      <PersistedCheckbox
        checked={false}
        save={async () => {
          throw Error("quota");
        }}
      />
    </label>,
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "مرحلة تجريبية" }));
  await screen.findByRole("alert");
  expect(screen.getByRole("checkbox")).not.toBeChecked();
  expect(screen.getByRole("checkbox")).toBeEnabled();
});
beforeEach(async () => {
  await seed();
  await db.duas.put(dua);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("flushes exact pending text when navigating away before debounce", async () => {
  const view = render(<DuaEditor initial={dua} close={() => {}} />);
  fireEvent.change(screen.getByLabelText("نص الدعاء"), {
    target: { value: "يا رب احفظ أهلي 🌿" },
  });
  expect(screen.getByRole("status")).toHaveTextContent("جارٍ الحفظ");
  view.unmount();
  await waitFor(async () =>
    expect((await db.duas.get(dua.id))?.text).toBe("يا رب احفظ أهلي 🌿"),
  );
});
it("shows failed save rather than saved and retries", async () => {
  const put = vi
    .spyOn(db.duaDrafts, "put")
    .mockRejectedValueOnce(Error("quota"));
  render(<DuaEditor initial={dua} close={() => {}} />);
  fireEvent.change(screen.getByLabelText("نص الدعاء"), {
    target: { value: "اختبار" },
  });
  fireEvent.blur(screen.getByLabelText("نص الدعاء"));
  await screen.findByText("تعذر الحفظ");
  expect(screen.getByRole("status")).not.toHaveTextContent("تم الحفظ");
  put.mockRestore();
  fireEvent.click(screen.getByText("إعادة الحفظ"));
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("تم الحفظ"),
  );
});
