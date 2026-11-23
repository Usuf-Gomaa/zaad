/// <reference types="node" />
import { it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { sourceDocuments, reviewPackSha256, reviewEdition } from './source-identity';
import { reviewRecords, reviewSources } from './records';
import { sourceObservations, addendumSources } from './source-addendum';
import { reviewExport, reviewCsv } from '../../features/review/exports';
import { publicationIssues } from '../publication';
it('binds the addendum and base documents without changing stable IDs or publication approval', () => {
  for (const doc of sourceDocuments) expect(createHash('sha256').update(readFileSync(doc.file)).digest('hex')).toBe(doc.sha256);
  expect(createHash('sha256').update(JSON.stringify(sourceDocuments)).digest('hex')).toBe(reviewPackSha256);
  expect(reviewEdition).toBe('2.1.0-draft');
  expect(Object.keys(sourceObservations).sort()).toEqual(['B02','DUA-Q2-201','F01','F04','FAQ14'].sort());
  expect(addendumSources).toHaveLength(4);
  for (const record of reviewRecords) {
    expect(record.reviewStatus).toBe('needs_review');
    expect(record.sourceCoverageConfirmed).toBe(false);
    expect(record.reviewedBy).toBeNull();
    expect(publicationIssues(record, reviewSources).length).toBeGreaterThan(0);
    for (const check of record.sourceObservations || []) {
      expect(record.evidence.some(e => e.sourceId === check.sourceId)).toBe(true);
      expect(record.evidence.find(e => e.sourceId === check.sourceId)?.locator).toBe(check.locator);
      expect(check.status).toBe('partial_source_check');
      expect(check.completeClaimCoverage).toBe(false);
      expect(check.qualifiedApproval).toBe(false);
      expect(check.checkedBy).toContain('automated');
      expect(check.limits.ar).not.toBe('');
      expect(check.limits.en).not.toBe('');
      expect(record.evidence.every(e => !e.verified && e.hadithGrade === null && !e.englishMeaning)).toBe(true);
    }
  }
});
it('exports observation provenance and exceptions separately from feedback and approval', () => {
  const selected = reviewRecords.filter(r => r.sourceObservations?.length);
  const json = reviewExport(selected, []);
  expect(json.sourcePack.sourceDocuments).toEqual(sourceDocuments);
  expect(json.records).toHaveLength(5);
  expect(json.records.find(r => r.id === 'F01')?.sourceObservations?.[0].limits.en).toContain('near-Hajj');
  expect(reviewCsv(selected, [])).toContain('partial_source_check');
  expect(reviewCsv(selected, [])).toContain('NOT GRANTED BY FEEDBACK');
});
