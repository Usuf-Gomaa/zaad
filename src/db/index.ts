import Dexie, { type Table } from "dexie";
import { writesFrozen, trackTransaction } from "../pwa/write-barrier";
export type Category = { id: string; name: string };
export type Dua = {
  id: string;
  categoryId: string;
  text: string;
  notes: string;
  pinned: boolean;
  order: number;
  origin: "personal";
  updatedAt: number;
};
export type Task = {
  id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  category: string;
  done: boolean;
  archived: boolean;
  order: number;
};
export type Trip = { id: string; title: string; startedAt: string };
export type Progress = {
  id: string;
  tripId: string;
  stepId: string;
  done: boolean;
};
export type Preference = { id: string; value: string };
export class ZaadDB extends Dexie {
  duas!: Table<Dua>;
  duaDrafts!: Table<Dua>;
  categories!: Table<Category>;
  tasks!: Table<Task>;
  trips!: Table<Trip>;
  progress!: Table<Progress>;
  preferences!: Table<Preference>;
  schemaMeta!: Table<{ id: string; version: number }>;
  constructor(name = "zaad") {
    super(name);
    this.use({
      stack: "dbcore",
      name: "zaad-commit-barrier",
      create: (down) => ({
        ...down,
        transaction(stores, mode, options) {
          if (mode === "readwrite" && writesFrozen())
            throw Error("update.locked");
          const tx = down.transaction(stores, mode, options);
          if (mode === "readwrite") trackTransaction(tx as IDBTransaction);
          return tx;
        },
      }),
    });
    this.version(1).stores({
      duas: "id,categoryId,order",
      duaDrafts: "id",
      categories: "id",
      tasks: "id,date,order",
      trips: "id",
      progress: "id,tripId",
      preferences: "id",
      schemaMeta: "id",
    });
    this.version(2)
      .stores({ tasks: "id,date,order,category" })
      .upgrade((tx) =>
        tx
          .table("tasks")
          .toCollection()
          .modify((t) => {
            t.category ??= "شخصي";
          }),
      );
  }
}
export const db = new ZaadDB();
export const uid = () => crypto.randomUUID();
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export async function seed() {
  await db.transaction(
    "rw",
    db.categories,
    db.trips,
    db.schemaMeta,
    async () => {
      if (!(await db.categories.count()))
        await db.categories.bulkPut(
          [
            "لنفسي",
            "لأهلي",
            "لأصحابي",
            "لسائر المسلمين والمسلمات والأمة الإسلامية",
            "لأمواتي وأموات المسلمين",
          ].map((name, i) => ({ id: String(i), name })),
        );
      if (!(await db.trips.count()))
        await db.trips.put({
          id: "first",
          title: "رحلتي الأولى",
          startedAt: "",
        });
      await db.schemaMeta.put({ id: "schema", version: 2 });
    },
  );
}
// Serialize snapshots. A failed transaction never reports a successful save.
export class SaveQueue {
  private tail: Promise<unknown> = Promise.resolve();
  enqueue(work: () => Promise<unknown>) {
    const result = this.tail.catch(() => {}).then(work);
    this.tail = result;
    return result;
  }
  async drain() {
    let last: Promise<unknown>;
    do {
      last = this.tail;
      await last;
    } while (last !== this.tail);
  }
}
export const saves = new SaveQueue();
export function saveDraft(dua: Dua) {
  return saves.enqueue(() =>
    db.transaction("rw", db.duas, db.duaDrafts, async () => {
      await db.duaDrafts.put(dua);
      await db.duas.put(dua);
    }),
  );
}
const tables = [
  "duas",
  "duaDrafts",
  "categories",
  "tasks",
  "trips",
  "progress",
  "preferences",
] as const;
export async function exportBackup() {
  await saves.drain();
  return db.transaction(
    "r",
    tables.map((t) => db.table(t)),
    async () => ({
      format: "zaad",
      version: 2,
      exportedAt: new Date().toISOString(),
      data: Object.fromEntries(
        await Promise.all(
          tables.map(async (t) => [t, await db.table(t).toArray()]),
        ),
      ),
    }),
  );
}
const str = (x: unknown, max = 100000): x is string =>
  typeof x === "string" && x.length <= max;
export function validateBackup(raw: unknown) {
  const b = raw as {
    format?: unknown;
    version?: unknown;
    data?: Record<string, unknown>;
  };
  if (!b || b.format !== "zaad" || b.version !== 2 || !b.data)
    throw Error("صيغة النسخة غير مدعومة");
  const data = b.data;
  for (const t of tables) {
    if (!Array.isArray(data[t]) || (data[t] as unknown[]).length > 20000)
      throw Error("جدول غير صالح");
    const ids = new Set();
    for (const item of data[t] as Record<string, unknown>[]) {
      if (!item || !str(item.id, 200) || ids.has(item.id))
        throw Error("معرّف غير صالح أو مكرر");
      ids.add(item.id);
      const x = item;
      const valid =
        t === "duas" || t === "duaDrafts"
          ? str(x.text) &&
            str(x.notes) &&
            str(x.categoryId, 200) &&
            typeof x.pinned === "boolean" &&
            x.origin === "personal" &&
            Number.isFinite(x.order) &&
            Number.isFinite(x.updatedAt)
          : t === "categories"
            ? str(x.name, 200)
            : t === "tasks"
              ? str(x.title, 1000) &&
                str(x.details) &&
                str(x.date, 10) &&
                str(x.time, 5) &&
                str(x.category, 200) &&
                typeof x.done === "boolean" &&
                typeof x.archived === "boolean" &&
                Number.isFinite(x.order)
              : t === "trips"
                ? str(x.title, 200) && str(x.startedAt, 30)
                : t === "progress"
                  ? str(x.tripId, 200) &&
                    str(x.stepId, 200) &&
                    typeof x.done === "boolean"
                  : str(x.value, 1000);
      if (!valid) throw Error("بيانات غير صالحة");
    }
  }
  if (
    !(data.categories as unknown[]).length ||
    !(data.trips as unknown[]).length
  )
    throw Error("تصنيف ورحلة مطلوبان");
  const fields: Record<string, string[]> = {
    duas: [
      "id",
      "categoryId",
      "text",
      "notes",
      "pinned",
      "order",
      "origin",
      "updatedAt",
    ],
    duaDrafts: [
      "id",
      "categoryId",
      "text",
      "notes",
      "pinned",
      "order",
      "origin",
      "updatedAt",
    ],
    tasks: [
      "id",
      "title",
      "details",
      "date",
      "time",
      "category",
      "done",
      "archived",
      "order",
    ],
    categories: ["id", "name"],
    trips: ["id", "title", "startedAt"],
    progress: ["id", "tripId", "stepId", "done"],
    preferences: ["id", "value"],
  };
  for (const t of tables)
    for (const x of data[t] as Record<string, unknown>[])
      if (Object.keys(x).some((k) => !fields[t].includes(k)))
        throw Error("حقول غير معروفة");
  const ids = (t: string) =>
    new Set((data[t] as { id: string }[]).map((x) => x.id));
  for (const d of [...(data.duas as Dua[]), ...(data.duaDrafts as Dua[])])
    if (!ids("categories").has(d.categoryId)) throw Error("تصنيف مفقود");
  for (const p of data.progress as Progress[])
    if (
      !ids("trips").has(p.tripId) ||
      !["prepare", "ihram", "tawaf", "after", "sai", "finish"].includes(
        p.stepId,
      ) ||
      p.id !== `${p.tripId}:${p.stepId}`
    )
      throw Error("متابعة غير صالحة");
  for (const p of data.preferences as Preference[])
    if (!(
      (p.id === "onboarding" && p.value === "seen") ||
      (p.id === "language" && ["ar", "en"].includes(p.value)) ||
      (p.id === "theme" && ["light", "dark"].includes(p.value)) ||
      (p.id === "scale" && ["18px", "21px", "24px"].includes(p.value)) ||
      (p.id === "trip" && ids("trips").has(p.value))
    ))
      throw Error("إعداد غير صالح");
  return data;
}
export async function restoreBackup(text: string) {
  if (new Blob([text]).size > 10 * 1024 * 1024)
    throw Error("الحد الأقصى ١٠ ميغابايت");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw Error("backup.invalidJson");
  }
  const data = validateBackup(raw);
  await db.transaction(
    "rw",
    tables.map((t) => db.table(t)),
    async () => {
      const language = await db.preferences.get("language");
      for (const t of tables) {
        await db.table(t).clear();
        await db
          .table(t)
          .bulkPut(
            (data[t] as Record<string, unknown>[]).map((x) => ({ ...x })),
          );
      }
      if (
        language &&
        !(data.preferences as Preference[]).some((p) => p.id === "language")
      )
        await db.preferences.put(language);
    },
  );
}
