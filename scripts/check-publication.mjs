import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { reviewRecords, reviewSources, legacyRecords } from '../src/content/review-v2/records.ts';
import { publishedRecords } from '../src/content/published.ts';
import { isPublished } from '../src/content/publication.ts';
import { reviewPackSha256, sourceDocuments } from '../src/content/review-v2/source-identity.ts';
assert.equal(reviewRecords.length, 51);
assert.deepEqual(reviewRecords.map(r => r.id), legacyRecords.map(r => r.id));
for (const r of reviewRecords) {
  assert.equal(r.reviewStatus, 'needs_review');
  assert.equal(r.sourceCoverageConfirmed, false);
  assert.equal(r.reviewedBy, null);
  assert.equal(isPublished(r, reviewSources), false);
}
assert.equal(publishedRecords.length, 0, 'Approval allowlist must be deliberately revised only after genuine review');
const walk = dir => readdirSync(dir, {withFileTypes:true}).flatMap(f => f.isDirectory() ? walk(`${dir}/${f.name}`) : [`${dir}/${f.name}`]);
const publicText = walk('dist').filter(f => /\.(js|html|json|webmanifest|css)$/.test(f)).map(f => readFileSync(f,'utf8')).join('\n');
const forbidden = [reviewPackSha256, ...sourceDocuments.map(s => s.sha256), 'zaad-editorial', ...reviewRecords.flatMap(r => [r.summaryAr, r.detailsAr, ...(r.sourceObservations || []).flatMap(s => [s.claim.ar, s.claim.en, s.quotationAr])])].filter(Boolean);
for (const value of forbidden) assert.ok(!publicText.includes(value), `Private content in public build: ${value.slice(0,50)}`);
assert.ok(!existsSync('dist/review-build.json'));
console.log('PASS: all 51 IDs retained and unapproved; public artifacts contain no draft text, source observations, fingerprints or editorial database.');
