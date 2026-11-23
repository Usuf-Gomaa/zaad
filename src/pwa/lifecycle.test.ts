import { it, expect, afterEach, vi } from "vitest";
import {
  prepareUpdate,
  freezeWrites,
  releaseUpdate,
  writesFrozen,
  registerUpdateGuard,
} from "./write-barrier";
import { db, seed } from "../db";
afterEach(() => {
  freezeWrites(false);
  localStorage.removeItem("zaad-update-lease");
});
it("refuses new transactions from a different window lease", async () => {
  await seed();
  localStorage.setItem(
    "zaad-update-lease",
    JSON.stringify({
      owner: "TEST OTHER WINDOW",
      expires: Date.now() + 15000,
      target: "TEST NEXT RELEASE",
    }),
  );
  await expect(
    db.preferences.put({ id: "theme", value: "dark" }),
  ).rejects.toThrow("update.locked");
  expect(() => freezeWrites(true)).toThrow("update.tabs");
});
it("blocks activation when an actual transaction aborts even if its caller catches the error", async () => {
  await seed();
  const lock = vi.fn();
  await expect(
    prepareUpdate(async () => {
      await db
        .transaction("rw", db.preferences, async () => {
          await db.preferences.put({ id: "theme", value: "dark" });
          throw Error("TEST ABORT");
        })
        .catch(() => {});
    }, lock),
  ).rejects.toThrow("update.failed");
  expect(writesFrozen()).toBe(false);
});
it("waits for pending work before freezing and never clears IndexedDB", async () => {
  await seed();
  await db.preferences.put({ id: "theme", value: "dark" });
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const lock = vi.fn();
  const prepare = prepareUpdate(() => pending, lock);
  expect(writesFrozen()).toBe(false);
  finish();
  await prepare;
  expect(writesFrozen()).toBe(true);
  await expect(
    db.preferences.put({ id: "theme", value: "light" }),
  ).rejects.toThrow("update.locked");
  expect((await db.preferences.get("theme"))?.value).toBe("dark");
  releaseUpdate(lock);
  expect(writesFrozen()).toBe(false);
});
it("does not freeze or proceed after failed draft persistence or an unsaved form guard", async () => {
  const lock = vi.fn();
  await expect(
    prepareUpdate(async () => {
      throw Error("quota");
    }, lock),
  ).rejects.toThrow("quota");
  expect(writesFrozen()).toBe(false);
  expect(lock).toHaveBeenLastCalledWith(false);
  const remove = registerUpdateGuard("test", () => {
    throw Error("update.blockedForm");
  });
  await expect(prepareUpdate(async () => {}, lock)).rejects.toThrow(
    "update.blockedForm",
  );
  remove();
  expect(writesFrozen()).toBe(false);
});
