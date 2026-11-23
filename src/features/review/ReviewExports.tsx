import { useState } from "react";
import type { ReligiousRecord } from "../../content/schema";
import { t, useLanguage } from "../../i18n";
import { editorialDb, feedbackSaves } from "./review-db";
import { downloadReview, reviewCsv, reviewExport } from "./exports";
export function ReviewExports({ records }: { records: ReligiousRecord[] }) {
  useLanguage();
  const [message, setMessage] = useState("");
  async function exportAll(format: "json" | "csv") {
    try {
      await feedbackSaves.drain();
      const feedback = await editorialDb.feedback.toArray();
      downloadReview(
        format === "json"
          ? JSON.stringify(reviewExport(records, feedback), null, 2)
          : reviewCsv(records, feedback),
        format === "json"
          ? "zaad-editorial-feedback.json"
          : "zaad-editorial-feedback.csv",
        format === "json" ? "application/json" : "text/csv;charset=utf-8",
      );
      setMessage("جهز ملف المراجعة؛ لم تتغير أي حالة اعتماد.");
    } catch {
      setMessage("تعذر تصدير الملاحظات");
    }
  }
  return (
    <section className="card">
      <h2>{t("review.export.title")}</h2>
      <p>{t("review.export.private")}</p>
      <div className="actions">
        <button onClick={() => void exportAll("json")}>
          {t("تصدير ملاحظات المراجعة")}
        </button>
        <button onClick={() => void exportAll("csv")}>
          {t("review.export.csv")}
        </button>
      </div>
      <p role="status">{t(message)}</p>
    </section>
  );
}
