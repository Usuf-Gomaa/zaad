import type { ReligiousRecord, Source } from '../../content/schema';
import { t, useLanguage } from '../../i18n';
export function SourceObservations({ record, registry }: { record: ReligiousRecord; registry: Source[] }) {
  const language = useLanguage();
  if (!record.sourceObservations?.length) return null;
  return <section className="source-observations" aria-label={t('sources.observations')}>
    <h3>{t('sources.observations')}</h3>
    <p className="notice">{t('sources.boundary')}</p>
    {record.sourceObservations.map(check => {
      const source = registry.find(s => s.id === check.sourceId);
      return <article className="card" key={check.id} data-source-check={check.id}>
        <h4>{record.id} · {check.id}</h4>
        <p>{t('sources.partial')}</p>
        <dl>
          <dt>{t('sources.claim')}</dt><dd>{check.claim[language]}</dd>
          <dt>{t('sources.location')}</dt><dd dir="auto">{check.locator}</dd>
          <dt>{t('sources.rationale')}</dt><dd>{check.rationale[language]}</dd>
          <dt>{t('sources.scope')}</dt><dd>{check.opinionScope[language]}</dd>
          <dt>{t('sources.limits')}</dt><dd>{check.limits[language]}</dd>
          <dt>{t('sources.method')}</dt><dd>{t('sources.automated')} · {check.checkedAt}</dd>
          <dt>{t('sources.approval')}</dt><dd>{t('sources.none')}</dd>
        </dl>
        {check.quotationAr && <><small>{t('sources.excerpt')}</small><blockquote dir="rtl" lang="ar">{check.quotationAr}</blockquote></>}
        {source && <a href={source.url} target="_blank" rel="noreferrer"><bdi dir="auto">{source.title}</bdi></a>}
        <small className="source-provenance" dir="ltr">{check.provenanceFile}</small>
      </article>;
    })}
  </section>;
}
