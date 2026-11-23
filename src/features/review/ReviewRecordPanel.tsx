import { useState } from "react";
import type { ReligiousRecord } from "../../content/schema";
import { t, useLanguage } from "../../i18n";
import { publicationIssues } from "../../content/publication";
import { legacyRecords, reviewSources } from "../../content/review-v2/records";
import { EvidenceSheet } from "../../components/EvidenceSheet";
import { ReviewFeedback } from "./ReviewFeedback";
import { SourceObservations } from './SourceObservations';
export function ReviewRecordPanel({ record }: { record: ReligiousRecord }) {
  useLanguage();
  const [priorEvidence, setPriorEvidence] = useState(false);
  const metadata = record.editorialReview;
  const prior = legacyRecords.find((r) => r.id === record.id);
  return (
    <section
      className="review-record-panel"
      aria-label={t("review.record.meta", { id: record.id })}
    >
      <p>
        <span className="badge">
          {t(`review.text.${metadata?.bodyStatus || "text_pending"}`)}
        </span>{" "}
        · {t("review.translation.pending")}
      </p>
      <p>
        {t("review.audience")} <bdi lang="ar">{metadata?.audienceAr}</bdi>
      </p>
      <h4>{t("review.research")}</h4>
      <SourceObservations record={record} registry={reviewSources} />
      <ul lang="ar" dir="rtl">
        {metadata?.researchNotesAr.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
      <h4>{t("review.candidates")}</h4>
      {metadata?.referenceNotesAr.map((note, i) => (
        <p key={i} lang="ar" dir="rtl">
          {note}
        </p>
      ))}
      <details>
        <summary>{t("ما يمنع النشر")}</summary>
        <ul>
          {publicationIssues(record, reviewSources).map((note, i) => (
            <li key={i}>{t(note)}</li>
          ))}
        </ul>
      </details>
      {prior && (
        <details>
          <summary>{t("review.compare")}</summary>
          <p>{t("review.prior.warning")}</p>
          <p lang="ar" dir="rtl">
            {prior.summaryAr}
          </p>
          <small dir="ltr">
            {prior.provenance.file} · {prior.id}
          </small>
          <button onClick={() => setPriorEvidence(true)}>
            {t("review.prior.evidence")}
          </button>
        </details>
      )}
      <ReviewFeedback key={record.id} record={record} />
      {priorEvidence && prior && (
        <EvidenceSheet
          record={prior}
          editorial
          close={() => setPriorEvidence(false)}
        />
      )}
    </section>
  );
}
