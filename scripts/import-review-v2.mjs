import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {draftRecords} from '../src/content/drafts.ts';
import {faqDrafts} from '../src/content/faq-drafts.ts';
const file='ZAAD_RELIGIOUS_CONTENT_V2_REVIEW_DRAFT.md';const raw=readFileSync(file,'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
const clean=s=>s.replace(/\*\*/g,'').trim();
const researchOnly=new Set(['B04','B06','B07','C04','D03','E02','F04']);
const entries=[];
function entry(id,title,audience,body){
 const cleanBody=clean(body);const marker=body.search(/\*\*(?:المصدر|المصادر|مصدر|مصادر|مرجع|المراجع)/);
 const narrative=clean(marker<0?body:body.slice(0,marker));
 const referenceNotes=marker<0?[]:[clean(body.slice(marker))];
 const research=[...body.matchAll(/\*\*مراجعة[^*]*\*\*\s*([^\n]+)/g)].map(match=>clean(match[1]));
 if(!research.length&&referenceNotes.length)research.push(referenceNotes[0]);
 research.push('تغطية كل ادعاء والتحقق من النص والسياق والتصنيف والخلاف لم تستكمل.');
 const summary=narrative.match(/^.*?[.؟](?:\s|$)/)?.[0].trim()||narrative;
 entries.push({id,titleAr:clean(title),audienceAr:audience,summaryAr:summary,detailsAr:narrative,candidateIds:[...new Set(cleanBody.match(/\bR[1-8]\b/g)||[])],referenceNotesAr:referenceNotes,researchNotesAr:research,bodyStatus:researchOnly.has(id)?'research_only':'drafted'});
}
for(const match of raw.matchAll(/^\*\*([A-F]\d{2})\s*\|\s*([^|]+)\|\s*([^*]+)\*\*\s*\n([\s\S]*?)(?=\n\*\*[A-F]\d{2}\s*\||\n###|\n##|$)/gm))entry(match[1],match[2],clean(match[3]),match[4]);
for(const match of raw.matchAll(/^\*\*(FAQ\d{2})\s*\|\s*([^*]+?):\*\*\s*([\s\S]*?)(?=\n\*\*FAQ\d{2}\s*\||\n##|$)/gm))entry(match[1],match[2],['FAQ05','FAQ06'].includes(match[1])?'نساء':'للجميع',match[3]);
const expected=[...draftRecords,...faqDrafts];if(entries.length!==50||new Set(entries.map(e=>e.id)).size!==50||expected.some(r=>!entries.some(e=>e.id===r.id)))throw Error('Stable-ID or paragraph coverage mismatch; no generated files written');
if(entries.some(e=>!e.detailsAr||!e.summaryAr))throw Error('Empty source paragraph');
const sourceRows=[];
for(const match of raw.matchAll(/^- \*\*(R[1-8])\*\* — (.+)$/gm)){const line=match[2],url=line.match(/https:\/\/[^\s]+/)?.[0]||'';sourceRows.push({id:match[1],title:line.split(': https')[0],url,kind:match[1]==='R7'?'quran':match[1]==='R8'?'hadith':'fatwa',provenance:`${file} §1`,visitedAt:null,accessNote:match[1]==='R7'||match[1]==='R8'?'مرجع مرشح؛ النص الحرفي والموضع لم يتحققا في هذا الدمج.':'تذكر المسودة الاطلاع العام على المصدر؛ لم ينفذ هذا الدمج فحصاً مستقلاً لكل ادعاء.'});}
if(sourceRows.length!==8)throw Error('Expected exactly R1–R8');
const questions=[...raw.split('## 5.')[1].split('## 6.')[0].matchAll(/^\d+\. (.+)$/gm)].map(m=>m[1]);
const duaPlan=clean(raw.split('## 4.')[1].split('## 5.')[0]);
const digest=createHash('sha256').update(readFileSync(file)).digest('hex');
mkdirSync('src/content/review-v2',{recursive:true});
writeFileSync('src/content/review-v2/pack-data.ts',`// Generated from ${file}; do not promote status through this import.\nimport type {ReviewParagraph} from './types';\nimport type {Source} from '../schema';\nexport const reviewEdition='2.0.0-draft';\nexport const reviewPackFile=${JSON.stringify(file)};\nexport const reviewPackSha256=${JSON.stringify(digest)};\nexport const reviewParagraphs:ReviewParagraph[]=${JSON.stringify(entries,null,2)};\nexport const candidateSources:Source[]=${JSON.stringify(sourceRows,null,2)};\nexport const reviewerQuestions:string[]=${JSON.stringify(questions,null,2)};\nexport const duaPlanAr=${JSON.stringify(duaPlan)};\n`);
const table=entries.map(e=>{const old=expected.find(r=>r.id===e.id);return `| ${e.id} | ${old.gender} | ${e.audienceAr} | ${old.evidence.map(x=>x.sourceId).join(', ')||'—'} | ${e.candidateIds.join(', ')|| (e.id==='FAQ14'?'S4 (recheck)':'Required')} | ${e.bodyStatus} |`;}).join('\n');
writeFileSync('docs/RELIGIOUS_V2_COMPARISON.md',`# V2 import comparison\n\nSource: ${file}\n\nSHA-256: ${digest}\n\nAll 34 rite IDs and 16 FAQ IDs preserved. Earlier draft/source files are retained unchanged. Each new paragraph has a source-derived concise excerpt and full narrative, candidate references and outstanding notes. No evidence checks or approvals are transferred to the new wording. DUA-Q2-201 is retained separately as text_pending; no exact prayer is generated.\n\n| ID | Earlier audience | V2 audience | Earlier evidence IDs | New candidate IDs | Editorial text state |\n| --- | --- | --- | --- | --- | --- |\n${table}\n\nA04/A05 now have shared scope in the supplied v2 text, B05 is women-specific and C06 men-specific. Historical A01/S1 excerpt verification remains historical only, not proof of the revised A01 record. FAQ14's exact candidate URL is already registered as S4; it needs rechecking and remains unverified in this overlay. Every effective record remains needs_review with sourceCoverageConfirmed=false.\n`);
console.log(JSON.stringify({riteParagraphs:entries.filter(e=>!e.id.startsWith('FAQ')).length,faqAnswers:entries.filter(e=>e.id.startsWith('FAQ')).length,drafted:entries.filter(e=>e.bodyStatus==='drafted').length,researchOnly:entries.filter(e=>e.bodyStatus==='research_only').length,candidateSources:sourceRows.length,sha256:digest},null,2));
