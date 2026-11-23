import { useState } from "react";
import { NavLink } from "react-router-dom";
import { t, useLanguage } from "../../i18n";
import { stages } from "../../content/stages";
import type { Gender, ReligiousRecord, StageId } from "../../content/schema";
import {
  reviewRecords,
  reviewRites,
  reviewSources,
} from "../../content/review-v2/records";
import {
  reviewerQuestions,
} from "../../content/review-v2/pack-data";
import { reviewEdition } from "../../content/review-v2/source-identity";
import { corrections } from "../../content/corrections";
import { ReligiousContent } from "../umrah/ReligiousContent";
import { EvidenceSheet } from "../../components/EvidenceSheet";
import { ReviewShell } from "./ReviewShell";
import { ReviewExports } from "./ReviewExports";
import { ReviewRecordPanel } from "./ReviewRecordPanel";
import { statusLabels } from "../../content/publication";
function Workspace() {
  useLanguage();
  const [stage, setStage] = useState<StageId>("prepare"),
    [gender, setGender] = useState<Gender>("all"),
    [view, setView] = useState("guide"),
    [status, setStatus] = useState("all"),
    [recordId, setRecordId] = useState("A01"),
    [proof, setProof] = useState<ReligiousRecord>();
  const record = reviewRecords.find((r) => r.id === recordId)!;
  return (
    <>
      <section className="intro">
        <span className="eyebrow">{reviewEdition}</span>
        <h1>{t("مساحة المراجعة التحريرية")}</h1>
        <p>{t("review.complete.intro")}</p>
      </section>
      <ReviewExports records={reviewRecords} />
      <section className="card">
        <h2>{t("review.reading")}</h2>
        <p>{t("review.counts")}</p>
        <div className="inline">
          <label>
            {t("review.view")}
            <select
              aria-label={t("review.view")}
              value={view}
              onChange={(e) => setView(e.target.value)}
            >
              <option value="guide">{t("review.guide")}</option>
              <option value="records">{t("review.all.records")}</option>
            </select>
          </label>
          {view === "guide" ? (
            <>
              <label>
                {t("مرحلة المعاينة")}
                <select
                  aria-label={t("مرحلة المعاينة")}
                  value={stage}
                  onChange={(e) => setStage(e.target.value as StageId)}
                >
                  {stages.map((item) => (
                    <option value={item.id} key={item.id}>
                      {t(item.title)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("عرض المعاينة")}
                <select
                  aria-label={t("عرض المعاينة")}
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                >
                  <option value="all">{t("المشترك")}</option>
                  <option value="women">{t("للنساء")}</option>
                  <option value="men">{t("للرجال")}</option>
                </select>
              </label>
              <label>
                {t("حالة السجلات")}
                <select
                  aria-label={t("حالة السجلات")}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">{t("الكل")}</option>
                  {Object.entries(statusLabels).map(([id, label]) => (
                    <option key={id} value={id}>
                      {t(label)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <label>
              {t("السجل")}
              <select
                aria-label={t("السجل")}
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
              >
                {reviewRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.titleAr}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <p>
          <NavLink className="button" to="/review/faq">
            {t("review.faq")}
          </NavLink>
        </p>
        {view === "guide" ? (
          <>
            <ReligiousContent
              key={`${stage}:${gender}`}
              stageId={stage}
              gender={gender}
              records={reviewRites.filter(
                (r) => status === "all" || r.reviewStatus === status,
              )}
              registry={reviewSources}
              editorial
              renderEditorialTools={(r) => (
                <ReviewRecordPanel key={r.id} record={r} />
              )}
            />
            <div className="actions">
              <button
                disabled={stage === "prepare"}
                onClick={() =>
                  setStage(
                    stages[stages.findIndex((s) => s.id === stage) - 1].id,
                  )
                }
              >
                {t("السابق")}
              </button>
              <button
                disabled={stage === "finish"}
                onClick={() =>
                  setStage(
                    stages[stages.findIndex((s) => s.id === stage) + 1].id,
                  )
                }
              >
                {t("التالي")}
              </button>
            </div>
          </>
        ) : (
          <article data-record-id={record.id}>
            <h2 lang="ar" dir="rtl">
              {record.id} — {record.titleAr}
            </h2>
            <p lang="ar" dir="rtl">
              {record.summaryAr}
            </p>
            <details>
              <summary>{t("faq.detail")}</summary>
              <p className="original-draft" lang="ar" dir="rtl">
                {record.detailsAr}
              </p>
            </details>
            <button onClick={() => setProof(record)}>
              {t("فحص أدلة السجل")}
            </button>
            <ReviewRecordPanel key={record.id} record={record} />
          </article>
        )}
      </section>
      <section className="card">
        <h2>{t("review.open.questions")}</h2>
        <ol lang="ar" dir="rtl">
          {reviewerQuestions.map((question, i) => (
            <li key={i}>{question}</li>
          ))}
        </ol>
      </section>
      <section className="card">
        <h2>{t("تصحيحات من الملاحظات الخام")}</h2>
        <p>{t("علامات تحريرية من الحزمة؛ لم تعتمد كفتاوى للنشر.")}</p>
        {corrections.map((c) => (
          <details key={c.id}>
            <summary>
              {c.id} · {t("يحتاج تصحيحاً")}
            </summary>
            <p dir="auto">{c.text}</p>
          </details>
        ))}
      </section>
      {proof && (
        <EvidenceSheet
          record={proof}
          registry={reviewSources}
          editorial
          close={() => setProof(undefined)}
        />
      )}
    </>
  );
}
export default function ReviewWorkspace() {
  return (
    <ReviewShell>
      <Workspace />
    </ReviewShell>
  );
}
