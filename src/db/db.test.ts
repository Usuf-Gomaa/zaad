import { beforeEach, afterAll, describe, it, expect } from "vitest";
import {
  db,
  seed,
  saveDraft,
  exportBackup,
  restoreBackup,
  SaveQueue,
  ZaadDB,
  type Dua,
} from "./index";
const dua: Dua = {
  id: "test",
  categoryId: "0",
  text: "دعاء عربي 🌿",
  notes: "ملاحظات",
  origin: "personal",
  pinned: false,
  order: 1,
  updatedAt: 1,
};
beforeEach(async () => {
  await db.transaction("rw", db.tables, async () => {
    for (const t of db.tables) await t.clear();
  });
  await seed();
});
afterAll(() => db.close());
describe("durable local data", () => {
  it("preserves v2 user data and backup format while editorial feedback stays separate", async () => {
    await saveDraft(dua);
    await db.progress.put({
      id: "first:prepare",
      tripId: "first",
      stepId: "prepare",
      done: true,
    });
    await db.tasks.put({
      id: "kept-task",
      title: "مهمة قديمة",
      details: "تفاصيل",
      date: "2026-11-23",
      time: "",
      category: "شخصي",
      done: true,
      archived: false,
      order: 1,
    });
    await db.preferences.put({ id: "theme", value: "dark" });
    const before = await exportBackup();
    const { editorialDb, saveFeedback, feedbackSaves } =
      await import("../features/review/review-db");
    await saveFeedback({ id: "A01", note: "مراجعة منفصلة", updatedAt: 1 });
    await feedbackSaves.drain();
    await import("../content/published");
    await import("../content/drafts");
    db.close();
    await db.open();
    const after = await exportBackup();
    expect(after.version).toBe(2);
    expect(db.verno).toBe(2);
    expect(after.data).toEqual(before.data);
    await restoreBackup(JSON.stringify(before));
    expect((await exportBackup()).data).toEqual(before.data);
    expect((await editorialDb.feedback.get("A01"))?.note).toBe("مراجعة منفصلة");
    await editorialDb.delete();
  });
  it("keeps exact rapid edits and drafts through a connection reopen", async () => {
    await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        saveDraft({ ...dua, text: `${dua.text} ${i}` }),
      ),
    );
    db.close();
    await db.open();
    expect((await db.duas.get("test"))?.text).toBe("دعاء عربي 🌿 29");
    expect((await db.duaDrafts.get("test"))?.text).toBe("دعاء عربي 🌿 29");
  });
  it("roundtrips Unicode backups atomically", async () => {
    await saveDraft(dua);
    const backup = JSON.stringify(await exportBackup());
    await db.duas.clear();
    await restoreBackup(backup);
    expect(await db.duas.get("test")).toEqual(dua);
  });
  it("rejects malformed, foreign-key broken and oversized backups without changing data", async () => {
    await saveDraft(dua);
    await expect(restoreBackup("{")).rejects.toThrow();
    const backup = await exportBackup();
    (backup.data.duas as Dua[])[0].categoryId = "missing";
    await expect(restoreBackup(JSON.stringify(backup))).rejects.toThrow();
    await expect(restoreBackup(" ".repeat(11 * 1024 * 1024))).rejects.toThrow();
    expect(await db.duas.get("test")).toEqual(dua);
  });
  it("keeps trip resets scoped", async () => {
    await saveDraft(dua);
    await db.progress.bulkPut([
      { id: "a", tripId: "first", stepId: "prepare", done: true },
      { id: "b", tripId: "other", stepId: "prepare", done: true },
    ]);
    await db.progress.where("tripId").equals("first").delete();
    expect(await db.progress.get("b")).toBeDefined();
    expect(await db.duas.get("test")).toEqual(dua);
  });
  it("continues queued writes after failure", async () => {
    const queue = new SaveQueue();
    await expect(
      queue.enqueue(async () => {
        throw Error("disk full");
      }),
    ).rejects.toThrow();
    let wrote = false;
    await queue.enqueue(async () => {
      wrote = true;
    });
    expect(wrote).toBe(true);
  });
  it("migrates v1 task categories", async () => {
    const name = "migration-test";
    const old = new ZaadDB(name);
    await old.delete();
    const { default: Dexie } = await import("dexie");
    const v1 = new Dexie(name);
    v1.version(1).stores({
      duas: "id,categoryId,order",
      duaDrafts: "id",
      categories: "id",
      tasks: "id,date,order",
      trips: "id",
      progress: "id,tripId",
      preferences: "id",
      schemaMeta: "id",
    });
    await v1.table("tasks").put({ id: "old", title: "ماء" });
    v1.close();
    const newer = new ZaadDB(name);
    expect((await newer.tasks.get("old"))?.category).toBe("شخصي");
    await newer.delete();
  });
});
