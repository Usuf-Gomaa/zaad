import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { t, useLanguage } from "../../i18n";
import { useUpdateGuard } from "../../pwa/useUpdateGuard";
import type { ReligiousRecord } from "../../content/schema";
import {
  reviewEdition,
  reviewPackSha256,
} from "../../content/review-v2/source-identity";
import {
  editorialDb,
  feedbackSaves,
  saveFeedback,
  type Feedback,
} from "./review-db";
import { downloadReview, reviewCsv, reviewExport } from "./exports";
export function ReviewFeedback({ record }: { record: ReligiousRecord }) {
  useLanguage();
  const stored = useLiveQuery(
    () => editorialDb.feedback.get(record.id),
    [record.id],
  );
  const [values, setValues] = useState({
      note: "",
      reviewerName: "",
      decision: "",
    }),
    [dirty, setDirty] = useState(false),
    [status, setStatus] = useState(""),
    [error, setError] = useState(false);
  const revision = useRef(0),
    latest = useRef(values);
  useUpdateGuard(error);
  useEffect(() => {
    if (!dirty) {
      const next = {
        note: stored?.note || "",
        reviewerName:
          stored?.edition === reviewEdition &&
          stored.sourcePackSha256 === reviewPackSha256
            ? stored.reviewerName || ""
            : "",
        decision:
          stored?.edition === reviewEdition &&
          stored.sourcePackSha256 === reviewPackSha256
            ? stored.decision || ""
            : "",
      };
      latest.current = next;
      setValues(next);
    }
  }, [stored, dirty]);
  async function save(next: typeof values) {
    const current = ++revision.current;
    setStatus("جارٍ حفظ ملاحظة المراجعة");
    setError(false);
    try {
      await saveFeedback({
        id: record.id,
        ...next,
        decision: next.decision
          ? (next.decision as Feedback["decision"])
          : undefined,
        updatedAt: Date.now(),
        edition: reviewEdition,
        sourcePackSha256: reviewPackSha256,
      });
      if (current === revision.current) setStatus("حُفظت ملاحظة المراجعة");
    } catch {
      if (current === revision.current) {
        setStatus("تعذر حفظ ملاحظة المراجعة؛ انسخها وأعد المحاولة");
        setError(true);
      }
    }
  }
  function change(patch: Partial<typeof values>) {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setValues(next);
    setDirty(true);
    void save(next);
  }
  async function exportOne(format: "json" | "csv") {
    try {
      await feedbackSaves.drain();
      const note = await editorialDb.feedback.get(record.id);
      const rows = note ? [note] : [];
      downloadReview(
        format === "json"
          ? JSON.stringify(reviewExport([record], rows), null, 2)
          : reviewCsv([record], rows),
        `zaad-review-${record.id}.${format}`,
        format === "json" ? "application/json" : "text/csv;charset=utf-8",
      );
    } catch {
      setError(true);
      setStatus("تعذر تصدير الملاحظات");
    }
  }
  return (
    <details className="review-feedback">
      <summary>
        {t("review.feedback")} — {record.id}
      </summary>
      <p>{t("review.feedback.only")}</p>
      {stored &&
        (stored.edition !== reviewEdition ||
          stored.sourcePackSha256 !== reviewPackSha256) && (
          <p className="notice">{t("review.legacy.feedback")}</p>
        )}
      <label>
        {t("review.decision")}
        <select
          aria-label={t("review.decision.id", { id: record.id })}
          value={values.decision}
          onChange={(e) => change({ decision: e.target.value })}
        >
          <option value="">{t("review.decision.none")}</option>
          {["agree", "revise", "research"].map((value) => (
            <option value={value} key={value}>
              {t(`review.decision.${value}`)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t("review.name")}
        <input
          maxLength={200}
          dir="auto"
          value={values.reviewerName}
          aria-label={t("review.name.id", { id: record.id })}
          onChange={(e) => change({ reviewerName: e.target.value })}
        />
      </label>
      <label>
        {t("review.note", { id: record.id })}
        <textarea
          dir="auto"
          maxLength={10000}
          aria-label={t("review.note", { id: record.id })}
          value={values.note}
          onChange={(e) => change({ note: e.target.value })}
        />
      </label>
      <p role="status">{t(status)}</p>
      <button onClick={() => void save(values)}>
        {t("إعادة حفظ الملاحظة")}
      </button>
      <div className="actions">
        <button onClick={() => void exportOne("json")}>
          {t("review.export.one.json")}
        </button>
        <button onClick={() => void exportOne("csv")}>
          {t("review.export.one.csv")}
        </button>
      </div>
      {stored?.history?.length ? (
        <details>
          <summary>{t("review.history")}</summary>
          {stored.history.map((item, i) => (
            <p key={i} dir="auto">
              {item.edition || t("review.legacy.edition")} · {item.note}
            </p>
          ))}
        </details>
      ) : null}
    </details>
  );
}
