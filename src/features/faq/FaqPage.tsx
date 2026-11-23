import { isEditorialEnvironment } from "../../content/editorial-mode";
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { faqIndex } from "../../content/umrah/faq-index";
import { publishedRecords } from "../../content/published";
import type { ReligiousRecord, Source } from "../../content/schema";
import {
  isPublishedInLocale,
  localizedReligious,
} from "../../content/localization";
import { legalLabels, statusLabels } from "../../content/publication";
import { EvidenceSheet } from "../../components/EvidenceSheet";
import { t, useLanguage } from "../../i18n";
const categories = ["travel", "ihram", "tawaf", "sai", "finish"];
const normalize = (s: string) =>
  s
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي");
export function FaqPage({
  records = publishedRecords,
  editorial = false,
  editorialConsent = false,
  registry,
  renderEditorialTools,
}: {
  records?: ReligiousRecord[];
  editorial?: boolean;
  editorialConsent?: boolean;
  registry?: Source[];
  renderEditorialTools?: (record: ReligiousRecord) => ReactNode;
}) {
  const locale = useLanguage();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("all"),
    [evidence, setEvidence] = useState<ReligiousRecord | "registry">(),
    [optedIn, setOptedIn] = useState(false);
  const preview =
    editorial && isEditorialEnvironment && (optedIn || editorialConsent);
  const shown = faqIndex.filter(
    (topic) =>
      (category === "all" || topic.category === category) &&
      normalize(`${topic.title.ar} ${topic.title.en}`).includes(
        normalize(search),
      ),
  );
  return (
    <>
      <section className="intro">
        <span className="eyebrow">{t("مناسك العمرة")}</span>
        <h1>{t("faq.title")}</h1>
        <p>{t("faq.intro")}</p>
      </section>
      <aside className="notice">
        {t(
          "هذا دليل تعليمي، وليس فتوى شخصية. في الحالات الخاصة أو عند الشك في صحة النسك، اسأل أهل العلم.",
        )}
      </aside>
      {editorial && isEditorialEnvironment && !preview && (
        <button onClick={() => setOptedIn(true)}>
          {t("أفهم التحذير — عرض المسودات للتحرير")}
        </button>
      )}
      {preview && (
        <aside className="notice">
          {t(
            "معلومة إرشادية — قيد المراجعة الشرعية. معاينة تحريرية وليست فتوى.",
          )}
        </aside>
      )}
      <section className="card">
        <div className="inline">
          <label>
            {t("faq.search")}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("faq.search")}
            />
          </label>
          <label>
            {t("faq.category")}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label={t("faq.category")}
            >
              <option value="all">{t("faq.all")}</option>
              {categories.map((c) => (
                <option value={c} key={c}>
                  {t(`faq.${c}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      {!shown.length && <p role="status">{t("faq.empty")}</p>}
      <div className="faq-grid">
        {shown.map((topic) => {
          const record = records.find(
            (r) =>
              r.id === topic.id &&
              (r.namespace || "umrah") === "umrah" &&
              r.category === "faq",
          );
          const approved = record && isPublishedInLocale(record, locale);
          const visible = record && (approved || preview);
          const copy = visible
            ? localizedReligious(record, preview ? "ar" : locale)
            : undefined;
          return (
            <article className="card" key={topic.id} data-faq-id={topic.id}>
              <h2>{topic.title[locale]}</h2>
              <div className="inline">
                <span className="badge">{t(`faq.${topic.category}`)}</span>
                <span className="badge">
                  {t(
                    statusLabels[
                      approved
                        ? "scholarly_approved"
                        : record?.reviewStatus === "source_checked"
                          ? "source_checked"
                          : "needs_review"
                    ],
                  )}
                </span>
              </div>
              <h3>{t("faq.answer")}</h3>
              {preview && locale === "en" && (
                <p>{t("review.translation.pending")}</p>
              )}
              <p
                lang={preview ? "ar" : locale}
                dir={preview ? "rtl" : undefined}
              >
                {copy?.summary || t("faq.pending")}
              </p>
              <p>
                <strong>{t("faq.class")}: </strong>
                {approved && record
                  ? t(legalLabels[record.legalClass])
                  : t("faq.unclassified")}
              </p>
              <details>
                <summary>
                  {t(approved || preview ? "faq.detail" : "faq.why")}
                </summary>
                {copy?.details ? (
                  <p
                    className="original-draft"
                    lang={preview ? "ar" : locale}
                    dir={preview ? "rtl" : undefined}
                  >
                    {copy.details}
                  </p>
                ) : (
                  <p>{t("faq.review.explainer")}</p>
                )}
                {copy?.disputes.map((view) => (
                  <section key={view.id}>
                    <h3>{view.label}</h3>
                    <p>{view.summary}</p>
                  </section>
                ))}
                <p>{t("faq.scope")}</p>
              </details>
              {preview && record && !copy && (
                <>
                  <p>{t("content.english.pending")}</p>
                  <p lang="ar" dir="rtl">
                    {record.summaryAr}
                  </p>
                </>
              )}
              <button
                onClick={() =>
                  setEvidence(visible && record ? record : "registry")
                }
              >
                {t("faq.sources")}
              </button>
              {preview && record && renderEditorialTools?.(record)}
            </article>
          );
        })}
      </div>
      <p>
        <NavLink to="/support">{t("support.open")}</NavLink>
      </p>
      {evidence && (
        <EvidenceSheet
          record={evidence === "registry" ? undefined : evidence}
          registry={registry}
          editorial={preview}
          close={() => setEvidence(undefined)}
        />
      )}
    </>
  );
}
