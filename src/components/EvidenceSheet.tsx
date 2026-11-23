import { isEditorialEnvironment } from "../content/editorial-mode";
import { useEffect, useRef } from "react";
import type { Evidence, ReligiousRecord, Source } from "../content/schema";
import { contentVersion } from "../content/schema";
import { sources } from "../content/sources";
import {
  legalLabels,
  publicationIssues,
  statusLabels,
} from "../content/publication";
import {
  isPublishedInLocale,
  localizedReligious,
} from "../content/localization";
import { t, useLanguage } from "../i18n";
import { SourceObservations } from '../features/review/SourceObservations';
function EvidenceEntry({ e, registry }: { e: Evidence; registry: Source[] }) {
  const locale = useLanguage();
  const source = registry.find((s) => s.id === e.sourceId);
  const meaning = e.englishMeaning;
  const meaningChecked =
    meaning?.verified &&
    meaning.sourceUrl.startsWith("https://") &&
    meaning.checkedBy.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(meaning.checkedAt);
  return (
    <section className="evidence-entry">
      <h3>{source ? t(source.title) : e.sourceId}</h3>
      <p>
        {e.sourceId} {t("· النوع:")}{" "}
        {t(
          e.evidenceType === "hadith"
            ? "حديث"
            : e.evidenceType === "fatwa"
              ? "فتوى / رأي علمي"
              : e.evidenceType === "quran"
                ? "قرآن"
                : "دليل رسمي",
        )}
      </p>
      <p>
        {t("الإحالة:")} <bdi lang="ar">{e.locator}</bdi>
      </p>
      <p>
        {t("فحص الدليل:")}{" "}
        {t(
          e.verified ? "فحص نصي للمقتطف؛ لا يعني اعتماد الحكم" : "لم يفحص بعد",
        )}
      </p>
      <p>
        {t("الفاحص:")} {e.checkedBy ? t(e.checkedBy) : t("غير مسجل")}{" "}
        {t("· التاريخ:")} {e.checkedAt || t("غير مسجل")}
      </p>
      {e.verified && e.exactArabicText ? (
        <>
          <small>{t("content.ar.original")}</small>
          <blockquote lang="ar" dir="rtl">
            {e.exactArabicText}
          </blockquote>
          {locale === "en" &&
            (meaningChecked ? (
              <>
                <p lang="en" dir="ltr">
                  {meaning!.text}
                </p>
                <a href={meaning!.sourceUrl} target="_blank" rel="noreferrer">
                  {t("فتح المصدر (يحتاج اتصالاً)")}
                </a>
              </>
            ) : (
              <p>{t("faq.meaning.pending")}</p>
            ))}
        </>
      ) : (
        <p>{t("لا يوجد نص عربي محقق مرفق. لم يستكمل فحص المصدر.")}</p>
      )}
      {e.verified &&
      e.hadithGrade &&
      e.gradeCitation &&
      e.evidenceType === "hadith" ? (
        <p>
          {t("درجة الحديث:")}{" "}
          <bdi lang="ar">
            {e.hadithGrade} · {e.gradeCitation}
          </bdi>
        </p>
      ) : e.evidenceType === "hadith" ? (
        <p>{t("لم تسجل درجة حديث مستقلة؛ لا تستنتج من اسم الموقع.")}</p>
      ) : null}
      {source?.url.startsWith("https://") && (
        <a href={source.url} target="_blank" rel="noreferrer">
          {t("فتح المصدر خارج التطبيق (يحتاج اتصالاً)")}
        </a>
      )}
    </section>
  );
}
export function EvidenceSheet({
  record,
  editorial = false,
  close,
  registry = sources,
}: {
  registry?: Source[];
  record?: ReligiousRecord;
  editorial?: boolean;
  close: () => void;
}) {
  const locale = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const preview = editorial && isEditorialEnvironment;
  const allowed = !record || preview || isPublishedInLocale(record, locale);
  const copy = record ? localizedReligious(record, locale) : undefined;
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      aria-labelledby="evidence-title"
      className="evidence-sheet"
    >
      <h2 id="evidence-title">
        {record && allowed
          ? t("evidence.title", {
              title: copy?.title || (preview ? record.titleAr : record.id),
            })
          : t("منهج الأدلة والمصادر")}
      </h2>
      {!allowed ? (
        <p>{t("هذا السجل غير منشور ولا يعرض قبل الاعتماد.")}</p>
      ) : record ? (
        <>
          {preview && (
            <p className="notice">
              {t(
                "معلومة إرشادية — قيد المراجعة الشرعية. معاينة تحريرية وليست فتوى.",
              )}
            </p>
          )}
          <dl>
            <dt>{t("المعرّف والإصدار")}</dt>
            <dd>
              {record.id} · {record.editorialReview?.edition || contentVersion}
            </dd>
            <dt>{t("حالة المراجعة")}</dt>
            <dd>{t(statusLabels[record.reviewStatus])}</dd>
            <dt>{t("التصنيف")}</dt>
            <dd>{t(legalLabels[record.legalClass])}</dd>
            <dt>{t("نطاق المدرسة أو القول")}</dt>
            <dd>{copy?.legalSchoolScope || t("لم يضبط بعد")}</dd>
            <dt>{t("المراجع المؤهل")}</dt>
            <dd>
              <bdi>{record.reviewedBy || t("لم يعيّن")}</bdi>
              {record.reviewerQualifications && (
                <bdi> — {record.reviewerQualifications}</bdi>
              )}
            </dd>
            <dt>{t("تاريخ الاعتماد")}</dt>
            <dd>{record.reviewedAt || t("لا يوجد اعتماد")}</dd>
            <dt>{t("أصل المسودة")}</dt>
            <dd dir="ltr">
              {record.provenance.file} §{record.provenance.section} /{" "}
              {record.provenance.recordId}
            </dd>
          </dl>
          {preview && <SourceObservations record={record} registry={registry} />}
          {!record.evidence.length && (
            <p>{t("لا دليل محدد لهذا السجل حتى الآن.")}</p>
          )}
          {record.evidence.map((e, i) => (
            <EvidenceEntry
              registry={registry}
              e={e}
              key={`${e.sourceId}:${i}`}
            />
          ))}
          <h3>{t("الخلاف والتفصيل")}</h3>
          {record.disputes.length ? (
            record.disputes.map((d, i) => (
              <section key={d.id || i}>
                <h4>
                  {copy?.disputes[i]?.label || t("faq.translation.pending")}
                </h4>
                <p>
                  {copy?.disputes[i]?.summary || t("faq.translation.pending")}
                </p>
                {d.evidence.map((e, j) => (
                  <EvidenceEntry registry={registry} e={e} key={j} />
                ))}
              </section>
            ))
          ) : (
            <p>{t("لم يحرر الخلاف بعد؛ غياب الأقوال هنا لا يعني الإجماع.")}</p>
          )}
          {preview && (
            <>
              <h3>{t("ما يمنع النشر")}</h3>
              <ul>
                {publicationIssues(record, registry).map((issue, i) => (
                  <li key={i}>{t(issue)}</li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          <p>
            {t(
              "المصادر التالية سجل مراجع، وليست اعتماداً لأحكام المسودة. فحص المصدر لا يساوي الاعتماد الشرعي. لا توجد أحكام معتمدة للنشر حالياً.",
            )}
          </p>
          <p>
            {t(
              "النصوص المحققة والإحالات تُحزم محلياً عند اعتمادها؛ الروابط تكميلية وتحتاج اتصالاً.",
            )}
          </p>
          {registry.map((s) => (
            <section className="evidence-entry" key={s.id}>
              <h3>
                {s.id} · {t(s.title)}
              </h3>
              <p>
                {t("زيارة المصدر:")} {s.visitedAt || t("غير مسجلة")}
              </p>
              <p>{t(s.accessNote)}</p>
              <small dir="ltr">{s.provenance}</small>
              {s.url.startsWith("https://") ? (
                <a href={s.url} target="_blank" rel="noreferrer">
                  {t("فتح المصدر (يحتاج اتصالاً)")}
                </a>
              ) : (
                <p>{t("review.url.pending")}</p>
              )}
            </section>
          ))}
        </>
      )}
      <button autoFocus onClick={close}>
        {t("إغلاق")}
      </button>
    </dialog>
  );
}
