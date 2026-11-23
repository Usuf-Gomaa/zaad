// localized-ui
import { t as tr, useLanguage, getLanguage } from "../../i18n";
import { useState } from "react";
import { publishedRecords } from "../../content/published";
import { visibleRecords } from "../../content/publication";
import type { ReligiousRecord } from "../../content/schema";
import {
  isPublishedInLocale,
  localizedReligious,
} from "../../content/localization";
import { EvidenceSheet } from "../../components/EvidenceSheet";
export function SupplicationLibrary() {
  useLanguage();
  const [selected, setSelected] = useState<ReligiousRecord>();
  const records = visibleRecords(
    publishedRecords.filter(
      (r) => r.category === "dua" && isPublishedInLocale(r, getLanguage()),
    ),
  );
  return (
    <section className="card">
      <details>
        <summary>{tr("أدعية مأثورة \u2014 مكتبة اختيارية")}</summary>
        <p>
          {tr(
            " منفصلة عن دعواتك الشخصية. لا توجد نصوص معتمدة للنشر بعد؛ لن تنسب المسودات للنبي \uFDFA أو تربط بشوط معين. ",
          )}
        </p>
        {records.map((r) => (
          <article key={r.id}>
            <h3>{localizedReligious(r, getLanguage())?.title}</h3>
            <p>{localizedReligious(r, getLanguage())?.summary}</p>
            <blockquote lang="ar" dir="rtl">
              {
                r.evidence.find((e) => e.verified && e.exactArabicText)
                  ?.exactArabicText
              }
            </blockquote>
            <p>
              {tr("سياق الاستعمال: ")}
              {localizedReligious(r, getLanguage())?.applicability}
            </p>
            <button onClick={() => setSelected(r)}>
              {tr(" مصدر الدعاء وحالة اعتماده ")}
            </button>
          </article>
        ))}
      </details>
      {selected && (
        <EvidenceSheet record={selected} close={() => setSelected(undefined)} />
      )}
    </section>
  );
}
