import { isEditorialEnvironment, isAuthenticatedStaging } from "./content/editorial-mode";
// localized-ui
import { t as tr, useLanguage, getLanguage } from "./i18n";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import {
  BookOpen,
  CalendarDays,
  Footprints,
  Settings,
  Plus,
  WifiOff,
  ShieldCheck,
} from "lucide-react";
import { LanguageSelect } from "./components/LanguageSelect";
import { initializeLanguage } from "./i18n/preferences";
import { categoryLabel, tripLabel } from "./i18n/user-labels";
import { UpdatePanel } from "./pwa/UpdatePanel";
import { useUpdateGuard } from "./pwa/useUpdateGuard";
import { registerUpdateGuard } from "./pwa/write-barrier";
import { FaqPage } from "./features/faq/FaqPage";
import { SupportPage } from "./features/support/SupportPage";
import {
  db,
  seed,
  uid,
  today,
  saveDraft,
  saves,
  exportBackup,
  restoreBackup,
  type Dua,
  type Task,
} from "./db";
import { stages } from "./content/stages";
import { EvidenceSheet as Evidence } from "./components/EvidenceSheet";
import { ReligiousContent } from "./features/umrah/ReligiousContent";
import { SupplicationLibrary } from "./features/duas/SupplicationLibrary";
import type { Gender } from "./content/schema";
const ReviewWorkspace = isEditorialEnvironment
  ? React.lazy(() => import("./features/review/ReviewWorkspace"))
  : null;
import "./styles/app.css";
import "@fontsource/noto-naskh-arabic/arabic-400.css";
import "@fontsource/noto-naskh-arabic/arabic-700.css";
const ReviewFaqPage = isEditorialEnvironment
  ? React.lazy(() => import("./features/review/ReviewFaqPage"))
  : null;
function App() {
  useLanguage();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [navError, setNavError] = useState(""),
    [online, setOnline] = useState(navigator.onLine),
    [locked, setLocked] = useState(false),
    [cached, setCached] = useState(false);
  const prefs = useLiveQuery(() => db.preferences.toArray(), []);
  useEffect(() => {
    seed()
      .then(initializeLanguage)
      .then(() => setReady(true))
      .catch((error: unknown) =>
        setError(
          error instanceof Error && error.message === "update.locked"
            ? "update.locked"
            : "تعذر فتح التخزين. تحقق من مساحة الجهاز وإعدادات المتصفح ثم أعد المحاولة.",
        ),
      );
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme =
      prefs?.find((p) => p.id === "theme")?.value || "light";
    document.documentElement.style.fontSize =
      prefs?.find((p) => p.id === "scale")?.value || "18px";
  }, [prefs]);
  async function guardNavigation(e: React.MouseEvent) {
    const link = (e.target as HTMLElement).closest("a");
    if (
      !link ||
      link.target ||
      !link.getAttribute("href")?.startsWith("/") ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    e.preventDefault();
    window.dispatchEvent(new Event("zaad:flush"));
    try {
      await saves.drain();
      setNavError("");
      navigate(link.getAttribute("href")!);
    } catch {
      setNavError("تعذر حفظ الدعاء. انسخ النص ثم أعد المحاولة.");
    }
  }
  return (
    <>
      <div inert={locked} aria-busy={locked} onClickCapture={guardNavigation}>
        <header>
          <NavLink className="brand" to="/">
            {tr(" زاد")}
            <span>{tr("رفيق رحلتك")}</span>
          </NavLink>
          <span className="connection">
            {online ? <ShieldCheck size={17} /> : <WifiOff size={17} />}{" "}
            {!online
              ? tr("دون اتصال")
              : isAuthenticatedStaging
                ? tr('staging.connection')
              : cached
                ? tr("جاهز دون اتصال")
                : tr("جارٍ تجهيز العمل دون اتصال")}
          </span>
          <LanguageSelect />
        </header>
        <main>
          {ready && prefs && !prefs.some((p) => p.id === "onboarding") && (
            <aside className="notice">
              <h2>{tr("مرحباً بك في زاد")}</h2>
              <p>
                {tr(
                  " دعواتك وخطتك محفوظة على هذا الجهاز. انتظر \u00ABتم الحفظ\u00BB واحتفظ بنسخة احتياطية. متابعة المناسك شخصية والمحتوى العلمي قيد المراجعة. ",
                )}
              </p>
              <button
                onClick={() => {
                  void db.preferences
                    .put({ id: "onboarding", value: "seen" })
                    .catch(() => setNavError("تعذر حفظ الإعداد"));
                }}
              >
                {tr(" تخطي التعريف ")}
              </button>
            </aside>
          )}
          {navError && <p role="alert">{tr(navError)}</p>}
          {error ? (
            <div>
              <p role="alert">{tr(error)}</p>
              <button onClick={() => location.reload()}>
                {tr("common.retry")}
              </button>
            </div>
          ) : !ready ? (
            <p>{tr("جارٍ فتح دفترك\u2026")}</p>
          ) : (
            <Routes>
              <Route path="/" element={<Day />} />
              <Route path="/duas" element={<Duas />} />
              <Route path="/umrah" element={<Umrah />} />
              <Route path="/more" element={<More />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/support" element={<SupportPage />} />
              {isEditorialEnvironment && ReviewFaqPage && (
                <Route
                  path="/review/faq"
                  element={
                    <React.Suspense
                      fallback={<p>{tr("جارٍ فتح مساحة المراجعة…")}</p>}
                    >
                      <ReviewFaqPage />
                    </React.Suspense>
                  }
                />
              )}
              {isEditorialEnvironment && ReviewWorkspace && (
                <Route
                  path="/review"
                  element={
                    <React.Suspense
                      fallback={<p>{tr("جارٍ فتح مساحة المراجعة\u2026")}</p>}
                    >
                      <ReviewWorkspace />
                    </React.Suspense>
                  }
                />
              )}
              <Route
                path="*"
                element={
                  <p>
                    {tr(" الصفحة غير موجودة ")}
                    <NavLink to="/">{tr("العودة ليومي")}</NavLink>
                  </p>
                }
              />
            </Routes>
          )}
        </main>
        <nav className="bottom" aria-label={tr("التنقل الرئيسي")}>
          {[
            ["/", tr("يومي"), CalendarDays],
            ["/duas", tr("دعواتي"), BookOpen],
            ["/umrah", tr("مناسك العمرة"), Footprints],
            ["/more", tr("المزيد"), Settings],
          ].map(([path, label, Icon]) => (
            <NavLink key={String(path)} to={String(path)} end>
              {React.createElement(Icon, { size: 22 })}
              {String(label)}
            </NavLink>
          ))}
        </nav>
      </div>
      <UpdatePanel onLock={setLocked} onReady={setCached} />
    </>
  );
}
export function PersistedCheckbox({
  checked,
  save,
}: {
  checked: boolean;
  save: (done: boolean) => Promise<unknown>;
}) {
  useLanguage();
  const [value, setValue] = useState(checked),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => setValue(checked), [checked]);
  useUpdateGuard(!!error);
  return (
    <>
      <input
        type="checkbox"
        checked={value}
        disabled={busy}
        onChange={async (e) => {
          const next = e.target.checked;
          setValue(next);
          setBusy(true);
          setError("");
          try {
            await save(next);
          } catch {
            setValue(checked);
            setError("تعذر الحفظ؛ حاول مجدداً");
          } finally {
            setBusy(false);
          }
        }}
      />
      {busy && <small role="status">{tr("جارٍ الحفظ")}</small>}
      {error && <small role="alert">{tr(error)}</small>}
    </>
  );
}
function useAction() {
  const [error, setError] = useState("");
  useUpdateGuard(!!error);
  return {
    error,
    run: async (fn: () => Promise<unknown>) => {
      try {
        await fn();
        setError("");
      } catch {
        setError("تعذر الحفظ. احتفظ بنسخة من النص وحاول مجدداً.");
      }
    },
  };
}
function Intro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  useLanguage();
  return (
    <section className="intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{children}</p>
    </section>
  );
}
function Day() {
  useLanguage();
  const [date, setDate] = useState(today()),
    [title, setTitle] = useState(""),
    [time, setTime] = useState(""),
    [category, setCategory] = useState(""),
    [archive, setArchive] = useState(false);
  const tasks =
    useLiveQuery(() => db.tasks.orderBy("order").toArray(), []) || [];
  const a = useAction();
  useEffect(
    () =>
      registerUpdateGuard("new-task", () => {
        if (title.trim()) throw Error("update.blockedForm");
      }),
    [title],
  );
  const visible = tasks.filter(
    (t) => t.date === date && t.archived === archive,
  );
  async function move(t: Task, delta: number) {
    const other = visible[visible.indexOf(t) + delta];
    if (other)
      await db.transaction("rw", db.tasks, async () => {
        await db.tasks.update(t.id, { order: other.order });
        await db.tasks.update(other.id, { order: t.order });
      });
  }
  return (
    <>
      <Intro
        eyebrow={new Intl.DateTimeFormat(getLanguage(), {
          dateStyle: "full",
        }).format(new Date())}
        title={tr("يومك، على مهل")}
      >
        {tr(" رتّب ما يعينك في رحلتك. خطتك مرنة، ولك أن تبدأ بصفحة فارغة. ")}
      </Intro>
      <div className="grid">
        <section className="card">
          <div className="section-head">
            <h2>{tr("خطة اليوم")}</h2>
            <label>
              {tr(" التاريخ ")}
              <input
                aria-label={tr("تاريخ الخطة")}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
          <p>
            {visible.filter((t) => t.done).length}
            {tr(" من ")}
            {visible.length}
            {tr(" مهام شخصية مكتملة ")}
          </p>
          <progress
            max={visible.length || 1}
            value={visible.filter((t) => t.done).length}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim())
                void a.run(async () => {
                  await db.tasks.put({
                    id: uid(),
                    title: title.trim(),
                    details: "",
                    date,
                    time,
                    category,
                    done: false,
                    archived: false,
                    order: Date.now(),
                  });
                  setTitle("");
                });
            }}
          >
            <label>
              {tr(" مهمة جديدة ")}
              <input
                required
                onInvalid={(e) =>
                  e.currentTarget.setCustomValidity(tr("validation.required"))
                }
                onInput={(e) => e.currentTarget.setCustomValidity("")}
                maxLength={1000}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={tr("مثلاً: تجهيز حقيبة الرحلة")}
              />
            </label>
            <div className="inline">
              <label>
                {tr(" وقت اختياري ")}
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </label>
              <label>
                {tr(" التصنيف ")}
                <input
                  maxLength={200}
                  value={category}
                  placeholder={tr("شخصي")}
                  onChange={(e) => setCategory(e.target.value)}
                  list="categories"
                />
              </label>
              <datalist id="categories">
                {[tr("شخصي"), tr("سفر"), tr("راحة"), tr("تجهيز")].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </datalist>
              <button className="primary" aria-label={tr("إضافة مهمة")}>
                <Plus size={20} />
                {tr(" إضافة ")}
              </button>
            </div>
          </form>
          <button onClick={() => setArchive(!archive)}>
            {archive ? tr("عرض الخطة") : tr("عرض الأرشيف")}
          </button>
          {!visible.length && (
            <p className="empty">
              {tr("مساحة ليومك. أضف أول مهمة حين تكون مستعداً.")}
            </p>
          )}
          {visible.map((t, i) => (
            <article className="task" key={t.id}>
              <label className="check">
                <PersistedCheckbox
                  checked={t.done}
                  save={(done) => db.tasks.update(t.id, { done })}
                />
                <span className={t.done ? "done" : ""}>
                  {t.time && <small>{t.time} · </small>}
                  {t.title}
                  <small>{t.category}</small>
                </span>
              </label>
              <details>
                <summary>{tr("تعديل المهمة")}</summary>
                <label>
                  {tr(" العنوان ")}
                  <input
                    defaultValue={t.title}
                    onBlur={(e) =>
                      void a.run(() =>
                        db.tasks.update(t.id, { title: e.target.value }),
                      )
                    }
                  />
                </label>
                <label>
                  {tr(" ملاحظات ")}
                  <textarea
                    defaultValue={t.details}
                    onBlur={(e) =>
                      void a.run(() =>
                        db.tasks.update(t.id, { details: e.target.value }),
                      )
                    }
                  />
                </label>
                <label>
                  {tr(" الوقت ")}
                  <input
                    type="time"
                    defaultValue={t.time}
                    onBlur={(e) =>
                      void a.run(() =>
                        db.tasks.update(t.id, { time: e.target.value }),
                      )
                    }
                  />
                </label>
                <label>
                  {tr(" التصنيف ")}
                  <input
                    defaultValue={t.category}
                    onBlur={(e) =>
                      void a.run(() =>
                        db.tasks.update(t.id, { category: e.target.value }),
                      )
                    }
                  />
                </label>
                <button
                  disabled={i === 0}
                  onClick={() => void a.run(() => move(t, -1))}
                >
                  {tr(" تقديم ")}
                </button>
                <button
                  disabled={i === visible.length - 1}
                  onClick={() => void a.run(() => move(t, 1))}
                >
                  {tr(" تأخير ")}
                </button>
                <button
                  onClick={() =>
                    void a.run(() =>
                      db.tasks.update(t.id, { archived: !t.archived }),
                    )
                  }
                >
                  {archive ? tr("استعادة") : tr("أرشفة")}
                </button>
              </details>
            </article>
          ))}
          <p role="alert">{tr(a.error)}</p>
        </section>
        <aside className="card accent">
          <BookOpen />
          <h2>{tr("دعوة تحملها معك")}</h2>
          <p>
            {tr("كلماتك، وأسماء من تحب، في دفتر خاص محفوظ على هذا الجهاز.")}
          </p>
          <NavLink className="button" to="/duas">
            {tr(" افتح دعواتي ")}
          </NavLink>
          <hr />
          <h3>{tr("متابعة مستقلة للمناسك")}</h3>
          <p>{tr("مهامك اليومية منفصلة عن تسجيل مراحل رحلتك.")}</p>
          <NavLink to="/umrah">{tr("انتقل إلى مراحل العمرة")}</NavLink>
        </aside>
      </div>
    </>
  );
}
function Duas() {
  useLanguage();
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [],
    duas = useLiveQuery(() => db.duas.orderBy("order").toArray(), []) || [];
  const [selected, setSelected] = useState<string>(),
    [search, setSearch] = useState(""),
    [cat, setCat] = useState("all"),
    [newCategory, setNewCategory] = useState("");
  const a = useAction();
  useEffect(
    () =>
      registerUpdateGuard("new-category", () => {
        if (newCategory.trim()) throw Error("update.blockedForm");
      }),
    [newCategory],
  );
  const dua = duas.find((d) => d.id === selected);
  return (
    <>
      <Intro eyebrow={tr("دفترك الخاص")} title={tr("دعواتي")}>
        {tr(" لك، ولمن تحب. اكتب بحرية؛ تحفظ كلماتك تلقائياً على هذا الجهاز. ")}
      </Intro>
      <SupplicationLibrary />
      <div className="grid dua-grid">
        <section className="card">
          <button
            className="primary"
            onClick={() =>
              void a.run(async () => {
                const id = uid();
                await db.duas.put({
                  id,
                  categoryId: categories[0].id,
                  text: "",
                  notes: "",
                  pinned: false,
                  order: Date.now(),
                  origin: "personal",
                  updatedAt: Date.now(),
                });
                setSelected(id);
              })
            }
          >
            <Plus size={20} />
            {tr(" دعاء جديد ")}
          </button>
          <label>
            {tr(" ابحث في دعواتك ")}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            {tr(" التصنيف ")}
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="all">{tr("كل الدعوات")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCategory.trim())
                void a.run(async () => {
                  await db.categories.put({
                    id: uid(),
                    name: newCategory.trim(),
                  });
                  setNewCategory("");
                });
            }}
          >
            <label>
              {tr(" تصنيف جديد ")}
              <input
                maxLength={200}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </label>
            <button>{tr("إضافة تصنيف")}</button>
          </form>
          {categories.map((c) => (
            <details key={c.id}>
              <summary>{categoryLabel(c)}</summary>
              <label>
                {tr(" اسم التصنيف ")}
                <input
                  defaultValue={categoryLabel(c)}
                  maxLength={200}
                  onBlur={(e) => {
                    if (e.target.value.trim())
                      void a.run(() =>
                        db.categories.update(c.id, {
                          name: e.target.value.trim(),
                        }),
                      );
                  }}
                />
              </label>
            </details>
          ))}
          <div className="dua-list">
            {[...duas]
              .sort(
                (a, b) =>
                  Number(b.pinned) - Number(a.pinned) || a.order - b.order,
              )
              .filter(
                (d) =>
                  (cat === "all" || cat === d.categoryId) &&
                  (d.text + d.notes).includes(search),
              )
              .map((d) => (
                <button
                  className={selected === d.id ? "selected" : ""}
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                >
                  {d.pinned ? "★ " : ""}
                  {d.text.slice(0, 70) || "دعاء جديد"}
                  <small>
                    {categories.find((c) => c.id === d.categoryId)
                      ? categoryLabel(
                          categories.find((c) => c.id === d.categoryId)!,
                        )
                      : ""}
                  </small>
                </button>
              ))}
          </div>
          <p role="alert">{tr(a.error)}</p>
        </section>
        {dua ? (
          <DuaEditor
            key={dua.id}
            initial={dua}
            close={() => setSelected(undefined)}
          />
        ) : (
          <section className="card empty">
            <BookOpen size={42} />
            <h2>{tr("مساحة للدعاء")}</h2>
            <p>{tr("اختر دعاءً أو ابدأ دعاءً جديداً.")}</p>
            <p>
              {tr(
                "لا تتضمن هذه النسخة أدعية منسوبة إلى النبي \uFDFA قبل مراجعتها.",
              )}
            </p>
          </section>
        )}
      </div>
    </>
  );
}
export function DuaEditor({
  initial,
  close,
}: {
  initial: Dua;
  close: () => void;
}) {
  useLanguage();
  const [dua, setDua] = useState(initial),
    [status, setStatus] = useState("تم الحفظ"),
    [focus, setFocus] = useState(false);
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const latest = useRef(initial),
    revision = useRef(0),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dirty = useRef(false);
  const flush = () => {
    clearTimeout(timer.current);
    if (!dirty.current) return;
    dirty.current = false;
    const snapshot = { ...latest.current },
      r = revision.current;
    void saveDraft(snapshot)
      .then(() => {
        if (r === revision.current) setStatus("تم الحفظ");
      })
      .catch(() => {
        dirty.current = true;
        setStatus("تعذر الحفظ");
      });
  };
  useEffect(() => {
    const hide = () => flush();
    window.addEventListener("pagehide", hide);
    window.addEventListener("zaad:flush", hide);
    document.addEventListener("visibilitychange", hide);
    return () => {
      flush();
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("zaad:flush", hide);
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  function change(p: Partial<Dua>) {
    const next = { ...latest.current, ...p, updatedAt: Date.now() };
    latest.current = next;
    setDua(next);
    revision.current++;
    dirty.current = true;
    setStatus("جارٍ الحفظ");
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 300);
  }
  return (
    <section className={`card editor ${focus ? "focus" : ""}`}>
      <div className="section-head">
        <span className="badge">{tr("دعاء شخصي")}</span>
        <span role="status" className={status === "تعذر الحفظ" ? "error" : ""}>
          {tr(status)}
        </span>
      </div>
      <label>
        {tr(" التصنيف ")}
        <select
          value={dua.categoryId}
          onChange={(e) => change({ categoryId: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {tr(" نص الدعاء ")}
        <textarea
          dir="auto"
          aria-label={tr("نص الدعاء")}
          className="prayer"
          maxLength={100000}
          value={dua.text}
          onChange={(e) => change({ text: e.target.value })}
          onBlur={flush}
          placeholder={tr("اللهم\u2026")}
        />
      </label>
      <label>
        {tr(" ملاحظات خاصة ")}
        <textarea
          maxLength={100000}
          aria-label={tr("ملاحظات خاصة")}
          dir="auto"
          value={dua.notes}
          onChange={(e) => change({ notes: e.target.value })}
          onBlur={flush}
        />
      </label>
      <div className="actions">
        <button onClick={() => change({ pinned: !dua.pinned })}>
          {dua.pinned ? tr("إلغاء التثبيت") : tr("تثبيت")}
        </button>
        <button onClick={() => change({ order: Date.now() * -1 })}>
          {tr(" تقديم للقائمة ")}
        </button>
        <button onClick={() => setFocus(!focus)}>
          {focus ? tr("إنهاء التركيز") : tr("وضع التركيز")}
        </button>
        <button
          onClick={() => {
            void navigator.clipboard
              .writeText(dua.text)
              .catch(() => setStatus("تعذر النسخ"));
          }}
        >
          {tr(" نسخ ")}
        </button>
        <button onClick={() => window.print()}>{tr("طباعة")}</button>
        {status === "تعذر الحفظ" && (
          <button onClick={flush}>{tr("إعادة الحفظ")}</button>
        )}
        <button
          className="danger"
          onClick={() => {
            if (confirm(tr("حذف هذا الدعاء نهائياً؟"))) {
              clearTimeout(timer.current);
              flush();
              void saveDraft(latest.current)
                .then(() =>
                  db.transaction("rw", db.duas, db.duaDrafts, async () => {
                    await db.duas.delete(dua.id);
                    await db.duaDrafts.delete(dua.id);
                  }),
                )
                .then(close)
                .catch(() => setStatus("تعذر الحفظ"));
            }
          }}
        >
          {tr(" حذف ")}
        </button>
      </div>
    </section>
  );
}
function Umrah() {
  useLanguage();
  const trips = useLiveQuery(() => db.trips.toArray(), []) || [],
    prefs = useLiveQuery(() => db.preferences.get("trip"), []);
  const tripId = prefs?.value || trips[0]?.id || "first";
  const progress =
    useLiveQuery(
      () => db.progress.where("tripId").equals(tripId).toArray(),
      [tripId],
    ) || [];
  const [stage, setStage] = useState(0),
    [audience, setAudience] = useState<Gender>("all"),
    [evidence, setEvidence] = useState(false);
  const a = useAction();
  const trip = trips.find((t) => t.id === tripId);
  return (
    <>
      <Intro eyebrow={tr("رحلة خطوة بخطوة")} title={tr("مراحل العمرة")}>
        {tr(
          " متابعة شخصية مستقلة لكل رحلة. التأشير هنا لا يحكم بصحة النسك أو اكتماله شرعاً. ",
        )}
      </Intro>
      <aside className="notice">
        {tr(
          " هذا دليل تعليمي، وليس فتوى شخصية. في الحالات الخاصة أو عند الشك في صحة النسك، اسأل أهل العلم. ",
        )}
      </aside>
      <section className="card">
        <div className="inline">
          <label>
            {tr(" الرحلة ")}
            <select
              aria-label={tr("الرحلة")}
              value={tripId}
              onChange={(e) =>
                void a.run(() =>
                  db.preferences.put({ id: "trip", value: e.target.value }),
                )
              }
            >
              {trips.map((t) => (
                <option value={t.id} key={t.id}>
                  {tripLabel(t)}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              const title = prompt(tr("اسم الرحلة الجديدة"));
              if (title?.trim())
                void a.run(async () => {
                  const id = uid();
                  await db.trips.put({
                    id,
                    title: title.slice(0, 200),
                    startedAt: "",
                  });
                  await db.preferences.put({ id: "trip", value: id });
                });
            }}
          >
            {tr(" رحلة جديدة ")}
          </button>
          <label>
            {tr(" موعد الرحلة ")}
            <input
              aria-label={tr("موعد الرحلة")}
              type="datetime-local"
              value={trip?.startedAt || ""}
              onChange={(e) =>
                void a.run(() =>
                  db.trips.update(tripId, { startedAt: e.target.value }),
                )
              }
            />
          </label>
          <label>
            {tr(" عرض اختياري ")}
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as Gender)}
            >
              <option value="all">{tr("المشترك")}</option>
              <option value="women">{tr("للنساء")}</option>
              <option value="men">{tr("للرجال")}</option>
            </select>
          </label>
        </div>
        <p>
          {progress.filter((p) => p.done).length}
          {tr(" من ٦ مراحل مؤشّر عليها")}
        </p>
        <progress max={6} value={progress.filter((p) => p.done).length} />
        <button
          onClick={() => {
            if (
              confirm(
                tr(
                  "تصفير متابعة هذه الرحلة فقط؟ لن تُحذف الدعوات أو الرحلات الأخرى.",
                ),
              )
            )
              void a.run(() =>
                db.progress.where("tripId").equals(tripId).delete(),
              );
          }}
        >
          {tr(" تصفير متابعة الرحلة ")}
        </button>
      </section>
      <div className="grid stages">
        <section className="card stage-list" aria-label={tr("المراحل")}>
          {stages.map((s, i) => (
            <button
              key={s.id}
              className={stage === i ? "selected" : ""}
              onClick={() => setStage(i)}
            >
              <span>{i + 1}</span>
              {tr(s.title)}
              {progress.some((p) => p.stepId === s.id && p.done) && " ✓"}
            </button>
          ))}
        </section>
        <section className="card">
          <span className="eyebrow">
            {tr("المرحلة ")}
            {stage + 1}
            {tr(" من ٦")}
          </span>
          <h2>{tr(stages[stage].title)}</h2>
          <NavLink className="button" to="/faq">
            {tr("faq.title")}
          </NavLink>
          <p>{tr(stages[stage].note)}</p>
          <label className="check ritual">
            <PersistedCheckbox
              key={`${tripId}:${stages[stage].id}`}
              checked={progress.some(
                (p) => p.stepId === stages[stage].id && p.done,
              )}
              save={(done) =>
                db.progress.put({
                  id: `${tripId}:${stages[stage].id}`,
                  tripId,
                  stepId: stages[stage].id,
                  done,
                })
              }
            />
            {tr(" سجّلت انتهاء متابعتي لهذه المرحلة ")}
          </label>
          <ReligiousContent
            key={`${stages[stage].id}:${audience}`}
            stageId={stages[stage].id}
            gender={audience}
          />
          <button onClick={() => setEvidence(true)}>
            {tr(" حالة الأدلة والمراجعة ")}
          </button>
          <div className="actions">
            <button disabled={stage === 0} onClick={() => setStage(stage - 1)}>
              {tr(" السابق ")}
            </button>
            <button disabled={stage === 5} onClick={() => setStage(stage + 1)}>
              {tr(" التالي ")}
            </button>
          </div>
        </section>
      </div>
      <p role="alert">{tr(a.error)}</p>
      {evidence && <Evidence close={() => setEvidence(false)} />}
    </>
  );
}
function More() {
  useLanguage();
  const prefs = useLiveQuery(() => db.preferences.toArray(), []) || [];
  const [message, setMessage] = useState(""),
    [evidence, setEvidence] = useState(false),
    [persist, setPersist] = useState("");
  const a = useAction();
  async function backup() {
    const b = await exportBackup();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(b, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `zaad-${today()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("تم تجهيز النسخة للتنزيل. تحقق من حفظ الملف.");
  }
  return (
    <>
      <Intro eyebrow={tr("على جهازك، ولك وحدك")} title={tr("المزيد")}>
        {tr(" إعدادات بسيطة، ووضوح في الخصوصية والمصادر. ")}
      </Intro>
      <div className="grid">
        <section className="card">
          <h2>{tr("النسخ الاحتياطي")}</h2>
          <p>
            {tr(
              " احفظ نسخة دورية. قد تُحذف البيانات عند إزالة التطبيق أو مسح المتصفح أو إخلاء النظام للمساحة. ",
            )}
          </p>
          <button className="primary" onClick={() => void a.run(backup)}>
            {tr(" تصدير نسخة JSON ")}
          </button>
          <label className="file-picker">
            {tr(" استعادة نسخة (تستبدل البيانات الحالية) ")}
            <span className="button">{tr("file.choose")}</span>
            <input
              type="file"
              aria-label={tr("استعادة نسخة (تستبدل البيانات الحالية)")}
              accept="application/json,.json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (file.size > 10 * 1024 * 1024)
                    throw Error("الحد الأقصى ١٠ ميغابايت");
                  const text = await file.text();
                  if (
                    confirm(
                      tr(
                        "استبدال جميع البيانات بهذه النسخة؟ صدّر بياناتك الحالية أولاً.",
                      ),
                    )
                  ) {
                    await restoreBackup(text);
                    setMessage("تمت الاستعادة");
                  }
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : tr("تعذرت الاستعادة"),
                  );
                }
                e.target.value = "";
              }}
            />
          </label>
          <p role="status">{tr(message)}</p>
          <button
            onClick={() => {
              void navigator.storage
                ?.persist?.()
                .then((granted) =>
                  setPersist(
                    granted
                      ? tr("تم منح التخزين المستمر")
                      : tr(
                          "لم يمنح المتصفح التخزين المستمر؛ احتفظ بنسخة احتياطية.",
                        ),
                  ),
                );
            }}
          >
            {tr(" طلب الاحتفاظ بالتخزين ")}
          </button>
          <p role="status">{tr(persist)}</p>
          <button
            className="danger"
            onClick={() => {
              if (
                confirm(tr("حذف كل بيانات زاد المحلية نهائياً؟ صدّر نسخة أولاً."))
              )
                void a.run(async () => {
                  await db.transaction("rw", db.tables, async () => {
                    for (const t of db.tables) await t.clear();
                  });
                  await seed();
                  setMessage("حُذفت البيانات المحلية");
                });
            }}
          >
            {tr(" مسح البيانات المحلية ")}
          </button>
        </section>
        <section className="card">
          {isEditorialEnvironment && (
            <p>
              <NavLink to="/review">
                {tr(" مساحة المراجعة التحريرية (تطوير فقط) ")}
              </NavLink>
            </p>
          )}
          <h2>{tr("المظهر والقراءة")}</h2>
          <label>
            {tr(" حجم النص ")}
            <select
              value={prefs.find((p) => p.id === "scale")?.value || "18px"}
              onChange={(e) =>
                void a.run(() =>
                  db.preferences.put({ id: "scale", value: e.target.value }),
                )
              }
            >
              <option value="18px">{tr("عادي")}</option>
              <option value="21px">{tr("كبير")}</option>
              <option value="24px">{tr("كبير جداً")}</option>
            </select>
          </label>
          <label>
            {tr(" المظهر ")}
            <select
              value={prefs.find((p) => p.id === "theme")?.value || "light"}
              onChange={(e) =>
                void a.run(() =>
                  db.preferences.put({ id: "theme", value: e.target.value }),
                )
              }
            >
              <option value="light">{tr("فاتح")}</option>
              <option value="dark">{tr("داكن")}</option>
            </select>
          </label>
          <h2>{tr("التثبيت ودون الاتصال")}</h2>
          <p>
            {tr(
              " بعد فتح التطبيق أول مرة واكتمال تحميله، تعمل الشاشات والبيانات المحلية دون اتصال. جرّب فتحه في وضع الطيران قبل السفر. ",
            )}
          </p>
          <p>
            {tr(
              " Android: من قائمة المتصفح اختر \u00ABتثبيت التطبيق\u00BB أو \u00ABإضافة إلى الشاشة الرئيسية\u00BB. iPhone: في Safari اختر مشاركة ثم \u00ABإضافة إلى الشاشة الرئيسية\u00BB. ",
            )}
          </p>
          <p>
            {tr(
              " التثبيت والتخزين يعتمدان على المتصفح والنظام. الروابط الخارجية وحدها تحتاج اتصالاً. ",
            )}
          </p>
        </section>
        <section className="card">
          <h2>{tr("خصوصيتك")}</h2>
          <p>
            {tr(
              " لا حسابات ولا إعلانات ولا تحليلات ولا عدادات. الدعوات والخطة تبقى في IndexedDB على هذا الجهاز. لا تُرسل نصوصك إلى خادم. قد يسجل مستضيف الموقع طلبات ملفات التطبيق وفق سياسته. ",
            )}
          </p>
          <h2>{tr("عن زاد")}</h2>
          <p>
            {tr(
              " مبادرة تعليمية مستقلة وغير رسمية. ليست خدمة تصاريح أو جهة إفتاء. الحج غير متاح في هذه النسخة. ",
            )}
          </p>
          <button onClick={() => setEvidence(true)}>
            {tr(" المصادر ومنهج المراجعة ")}
          </button>
        </section>
        <section className="card">
          <h2>{tr("faq.title")}</h2>
          <p>{tr("faq.intro")}</p>
          <NavLink className="button" to="/faq">
            {tr("faq.title")}
          </NavLink>
          <hr />
          <h2>{tr("support.title")}</h2>
          <NavLink className="button" to="/support">
            {tr("support.open")}
          </NavLink>
        </section>
      </div>
      <p role="alert">{tr(a.error)}</p>
      {evidence && <Evidence close={() => setEvidence(false)} />}
    </>
  );
}
const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
