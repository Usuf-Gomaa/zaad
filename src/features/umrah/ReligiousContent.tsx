import { isEditorialEnvironment } from "../../content/editorial-mode";
// localized-ui
import { t as tr, useLanguage, getLanguage } from "../../i18n";
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import type {
  Gender,
  ReligiousRecord,
  StageId,
  Source,
} from "../../content/schema";
import {
  isPublished,
  legalLabels,
  statusLabels,
  visibleRecords,
} from "../../content/publication";
import { publishedRecords } from "../../content/published";
import {
  isPublishedInLocale,
  localizedReligious,
} from "../../content/localization";
import { EvidenceSheet } from "../../components/EvidenceSheet";
export function ReligiousContent({
  stageId,
  gender,
  records = publishedRecords,
  editorial = false,
  registry,
  renderEditorialTools,
}: {
  stageId: StageId;
  gender: Gender;
  records?: ReligiousRecord[];
  editorial?: boolean;
  registry?: Source[];
  renderEditorialTools?: (record: ReligiousRecord) => ReactNode;
}) {
  useLanguage();
  const preview = editorial && isEditorialEnvironment;
  const shown = visibleRecords(
    records.filter(
      (r) =>
        r.stageId === stageId &&
        (r.namespace || "umrah") === "umrah" &&
        (preview || isPublishedInLocale(r, getLanguage())),
    ),
    gender,
    preview,
  );
  const [selected, setSelected] = useState<ReligiousRecord>();
  return (
    <section aria-label={tr("محتوى المرحلة")} className="religious-content">
      {(stageId === "tawaf" || stageId === "sai") && (
        <NavLink className="button primary" to="/duas">
          {tr(" افتح دعواتي الآن ")}
        </NavLink>
      )}
      {preview && (
        <aside className="notice">
          <strong>{tr("معاينة تحريرية محلية")}</strong>
          <p>
            {tr(
              " معلومة إرشادية \u2014 قيد المراجعة الشرعية. النصوص التالية مسودات غير معتمدة ولا تظهر في النسخة العامة. ",
            )}
          </p>
        </aside>
      )}
      {!shown.length && (
        <div className="notice">
          <strong>{tr("المحتوى العلمي قيد المراجعة")}</strong>
          <p>
            {tr(
              " لم تعتمد خطوات تفصيلية أو فروق خاصة للنشر بعد. تبقى المراحل المشتركة ظاهرة وتظل متابعتك الشخصية مستقلة. ",
            )}
          </p>
        </div>
      )}
      <ol className="microsteps">
        {shown.map((record) => (
          <li key={record.id} data-record-id={record.id}>
            <div className="section-head">
              <h3>
                {localizedReligious(record, getLanguage())?.title || record.id}
              </h3>
              <span className="badge">
                {tr(statusLabels[record.reviewStatus])}
              </span>
            </div>
            {preview && (
              <small>
                {tr("معلومة إرشادية \u2014 قيد المراجعة الشرعية \u00B7 ")}
                {record.id}
              </small>
            )}
            {record.gender !== "all" && (
              <span className="badge">
                {record.gender === "women"
                  ? tr("إرشاد خاص بالنساء")
                  : tr("إرشاد خاص بالرجال")}
              </span>
            )}
            <p>
              {localizedReligious(record, getLanguage())?.summary ||
                tr("content.english.pending")}
            </p>
            {preview && getLanguage() === "en" && !record.translations?.en && (
              <p lang="ar" dir="rtl">
                {record.summaryAr}
              </p>
            )}
            {(record.detailsAr ||
              localizedReligious(record, getLanguage())?.details) && (
              <details>
                <summary>{tr("faq.detail")}</summary>
                <p
                  className="original-draft"
                  lang={preview ? "ar" : getLanguage()}
                  dir={preview ? "rtl" : undefined}
                >
                  {preview
                    ? record.detailsAr
                    : localizedReligious(record, getLanguage())?.details}
                </p>
              </details>
            )}
            {(localizedReligious(record, getLanguage())?.steps.length || 0) >
              0 && (
              <ul>
                {localizedReligious(record, getLanguage())?.steps.map(
                  (step, i) => (
                    <li key={i}>{step}</li>
                  ),
                )}
              </ul>
            )}
            <p>
              <small>
                {tr(legalLabels[record.legalClass])} ·{" "}
                {localizedReligious(record, getLanguage())?.legalSchoolScope ||
                  tr("النطاق الفقهي لم يضبط")}
              </small>
            </p>
            {(localizedReligious(record, getLanguage())?.genderNotes || [])
              .filter((note) => note.gender === gender)
              .map((note) => (
                <aside className="notice" key={note.gender}>
                  <strong>
                    {note.gender === "women"
                      ? tr("تنبيه للنساء")
                      : tr("تنبيه للرجال")}
                  </strong>
                  <p>{note.text}</p>
                </aside>
              ))}
            {record.actionableChecklist && isPublished(record) && (
              <p>
                {tr(
                  " متابعة هذه الخطوة تبقى ضمن التسجيل الشخصي للمرحلة، ولا تغيّر تلقائياً أي تقدّم سابق. ",
                )}
              </p>
            )}
            {record.category === "faq" && (
              <p>
                {tr(
                  " هل يختلف الحكم بحسب حالتي؟ اسأل أهل العلم عند وجود أثر على صحة النسك أو الفدية. ",
                )}
              </p>
            )}
            <button onClick={() => setSelected(record)}>
              {tr(" الأدلة وحالة المراجعة \u2014 ")}
              {record.id}
            </button>
            {preview && renderEditorialTools?.(record)}
          </li>
        ))}
      </ol>
      {selected && (
        <EvidenceSheet
          record={selected}
          registry={registry}
          editorial={preview}
          close={() => setSelected(undefined)}
        />
      )}
    </section>
  );
}
