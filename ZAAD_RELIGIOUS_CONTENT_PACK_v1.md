# ZAAD — Religious Content Pack v1.0
Date: 2026-11-23 | Language: ar-EG | Status: EDITORIAL DRAFT — NOT SCHOLARLY APPROVED

## 0. Instructions for Codex
Integrate into EXISTING D:\zad project. Do not recreate app, replace IndexedDB, reset user data, or change offline-first behavior. All normative records require source-linked verification and explicit editorial status. Never mark content `scholarly_approved` without an actual named qualified reviewer. Use a `source_checked` status only after manually checking the exact citation. Render a visible 'معلومة إرشادية — قيد المراجعة الشرعية' label on draft normative content, or keep it unpublished until approval. Existing user-generated checklist and du'a must remain fully functional. Do not generate hadith wording or grades from memory.

## 1. Content model
Use versioned JSON/TS content files and deterministic IDs. Recommended record:
```
{
 id, stageId, titleAr, summaryAr, stepsAr:[], gender:'all'|'men'|'women',
 category:'instruction'|'ruling'|'dhikr'|'dua'|'faq'|'caution',
 legalClass:'pillar'|'obligation'|'sunnah'|'recommended'|'permitted'|'disliked'|'prohibited'|'disputed'|'not_applicable',
 legalSchoolScope:null, evidence:[{sourceId, locator, exactArabicText:null, url, evidenceType:'quran'|'hadith'|'fatwa', verified:false}],
 disputes:[], reviewStatus:'needs_review'|'source_checked'|'scholarly_approved'|'correction_required',
 reviewedBy:null, reviewedAt:null, lastEdited:'2026-11-23', actionableChecklist:false
}
```
`legalClass` may remain `disputed` or `not_applicable` until verified. `source_checked` ≠ religious approval. Exact quotations and hadith grades must be copied only after opening the primary source and verifying context. For disputes, do not auto-label one opinion 'easier' or 'safer' without contextual scholarly validation. Evidence popup must work offline with locally bundled verified quotations; URL is supplementary and may need internet. Avoid copyrighted bulk reproduction.

## 2. User-facing information architecture
Stages: (A) الاستعداد والمواقيت (B) الإحرام والتلبية (C) دخول المسجد والطواف (D) ما بعد الطواف (E) السعي (F) الحلق أو التقصير والتحلل. Every stage: short introduction, chronological micro-steps, men's/women's differences only where supported, evidence disclosure, caution/FAQ, personal checkbox independent of fiqh validity, optional user notes. The app must never treat checked steps as an automated religious verdict. Prominent one-tap 'دعواتي' shortcut on tawaf and sa'i screens. No required login, network, telemetry or external media.

## 3. Draft content — do not publish as approved rulings
### A. الاستعداد والمواقيت
A01 — الاستعداد: الاغتسال للإحرام مستحب عند التيسر، وتهيئة النظافة قبل عقد الإحرام. لا يصح إلزام الجميع بالاغتسال أو نية لفظية للتطهر من الذنوب. Source S1.
A02 — الرجل: الإزار والرداء، مع تجنب القميص والسراويل والعمائم ونحو الملابس المحظورة في الإحرام. وجود خياطة في القماش وحده لا يجعل الثوب محظورًا. الحزام/المشبك/اللاصق وسائل تثبيت تحتاج بيانًا بحسب الصورة، ولا يصح تحريمها بإطلاق. Source S1; detailed cases NEED REVIEW.
A03 — المرأة: لا لون محددًا للإحرام؛ اللباس الساتر المعتاد وفق ضوابطه، وتجنب النقاب والقفازين أثناء الإحرام. إسدال غطاء الوجه عند وجود غير المحارم مسألة تحتاج صياغة تراعي أقوال الفقهاء والتطبيق الواقعي. Source S1. لا تُستخدم عبارة «المرأة كلها عورة» كحكم مطلق في جميع السياقات.
A04 — التطيب: يذكر تطيب بدن الرجل قبل الإحرام، لا تعمد تطييب ثوب الإحرام بعد الدخول في النسك. مزيلات العرق المعطرة والصابون المعطر تحتاج تفصيلًا بحسب وقت الاستعمال وطبيعته؛ لا تُفتَح أحكام قطعية عامة. Source S1.
A05 — يجوز تبديل الإزار والرداء وغسلهما حال الإحرام مع مراعاة المحظورات؛ دعوى منع تبديلهما خاطئة. Source S1; add specific checked fatwa.
A06 — المواقيت: ذو الحليفة، الجحفة (ويحرم كثير من القادمين من رابغ)، قرن المنازل، يلملم، ذات عرق. من مر بميقات وهو يريد النسك لا يتجاوزه دون إحرام. القادم بالطائرة يستعد قبل محاذاة الميقات. لا تعرض أرقام كيلومترات غير محققة أو قاعدة موحدة لكل مسار. من كان بمكة ويريد العمرة يخرج إلى الحل، مثل التنعيم. Sources S1,S2.
### B. الإحرام والتلبية
B01 — الإحرام هو نية الدخول في النسك، لا مجرد لبس الإزار والرداء. من صيغ التلبية عند بدء العمرة «لبيك عمرة». Source S2.
B02 — التلبية المعروفة تبدأ «لبيك اللهم لبيك...»؛ يُدرج النص الكامل فقط بعد التحقق الحرفي من مصدر حديثي محدد. تستمر التلبية للعمرة حتى الشروع في الطواف بحسب الفقه المقرر. NEED REVIEW.
B03 — الاشتراط «فإن حبسني حابس فمحلي حيث حبستني» مشروع في الجملة، وتعميم استحبابه أو تخصيصه بمن يخشى عائقًا محل تفصيل. Source S2; verify primary hadith.
B04 — العمرة عن الغير: تفصيل الميت والعاجز عجزًا دائمًا وشروط سبق الاعتمار عن النفس ومسألة الإذن، مع اختلاف الأحوال؛ لا يُعتمد على وصف مبسط. NEED REVIEW.
B05 — الحائض يجوز لها الإحرام والتلبية وتؤخر الطواف حتى تطهر في الحالة المعتادة؛ طول الحيض لا يعني تحللًا تلقائيًا. الظروف الاستثنائية تستدعي سؤال أهل العلم. NEED REVIEW.
B06 — محظورات الإحرام تشمل للرجل تغطية الرأس المعتادة والملابس المحددة، وتشمل عموم المحرمين قص الشعر والأظفار والتطيب بعد الإحرام وسائر المحظورات المفصلة. سقوط الشعر تلقائيًا ليس كتعمد إزالته؛ لا تُحسب فدية آليًا. NEED REVIEW.
B07 — رفع الرجل صوته بالتلبية والمرأة بصوت غير مثير للفتنة: يحتاج تحقيقًا وصياغة غير قطعية مع الأدلة. NEED REVIEW.
### C. دخول المسجد والطواف
C01 — آداب دخول المسجد الحرام من جنس آداب دخول المساجد؛ لا تثبت صيغة مخصوصة لرؤية الكعبة بمجرد تداولها. تحقق من الأذكار الصحيحة قبل نسبتها للسنة. NEED REVIEW.
C02 — الطواف سبعة أشواط حول الكعبة، بدءًا من محاذاة الحجر الأسود وانتهاءً بها؛ لا يجوز اختصار المسار عبر الحِجر لأنه داخل حدود البيت. Source S1.
C03 — الحجر الأسود: الاستلام/التقبيل عند التيسر دون أذى أو مزاحمة، وإلا الإشارة والتكبير؛ لا تثبت كل الزيادات المتداولة في صيغة التكبير. Source S1; exact wording NEED REVIEW.
C04 — الركن اليماني: استلامه عند التيسر دون تقبيل، ولا إشارة عند عدم التيسر في الوصف المشهور. بينه وبين الحجر الأسود دعاء «ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار»؛ تحقق من التخريج والسياق. NEED REVIEW.
C05 — لا دعاء ثابت مخصوص لكل شوط؛ للمستخدم الدعاء والذكر وقراءة القرآن، مع عدم إيذاء الآخرين. Source S1.
C06 — الاضطباع للرجل في طواف العمرة، والرمل في الأشواط الثلاثة الأولى بحسب القدرة دون أذى؛ لا يشرع للنساء على هذا الوجه. تحقق من تفاصيل الموضع والكتف والظروف. NEED REVIEW.
C07 — الطهارة للطواف، انقطاعه بسبب الصلاة، الشك في العدد، فقدان الوضوء، الحيض أو النزيف: مسائل فيها تفصيل وخلاف؛ لا يقدم التطبيق تعليمات حاسمة لإعادة الشوط أو البناء على السابق بلا مصدر محقق. NEED REVIEW.
C08 — الصلاة داخل الحِجر: لا يصح تعميم منع كل صلاة فيه؛ فرّق بين النافلة والفرض وبين أحكام الطواف داخله. NEED REVIEW.
### D. ما بعد الطواف
D01 — بعد الطواف يصلي ركعتين إن تيسر، والأفضل عند مقام إبراهيم من غير مزاحمة أو تعطيل حركة الطائفين، ويجوز في موضع آخر من المسجد. NEED REVIEW.
D02 — للرجل إعادة تغطية الكتفين بعد انتهاء طواف الاضطباع. NEED REVIEW.
D03 — قراءة الكافرون والإخلاص في ركعتي الطواف وردت في وصف النسك؛ تحقق من النص والإحالة الدقيقة. Source S3.
D04 — شرب زمزم من الأعمال المستحبة، من غير إلزام بشرب كمية معينة أو دعاء ثابت مخصوص دون دليل. NEED REVIEW.
### E. السعي
E01 — يبدأ السعي بالصفا وينتهي بالمروة؛ الذهاب من الصفا إلى المروة شوط، والعودة شوط ثانٍ، وينتهي السابع عند المروة. Source S1,S3.
E02 — عند الاقتراب من الصفا تُقرأ آية البقرة 2:158 ويقال «أبدأ بما بدأ الله به» في موضعها، ثم يستقبل القبلة ويذكر الله ويدعو وفق الوارد في حديث جابر. النص التفصيلي وعدد التكرارات يوثقان حرفيًا من صحيح مسلم 1218. Source S3.
E03 — يسرع الرجال بين العلامتين المحددتين بحسب القدرة، وتمشي النساء؛ تجنب الزحام والأذى. NEED REVIEW.
E04 — الوضوء ليس شرطًا لصحة السعي في الوصف المعتمد لدى كثير من الفقهاء، وإن كانت الطهارة أفضل؛ يحتاج ضبط نسبة الحكم. Source S1.
E05 — لا يلزم صعود الصخر أو اختيار دور معين؛ اختر المسار الرسمي الآمن والمناسب، وتجنب أي ادعاء بأفضلية دور أو جهة بلا دليل. NEED REVIEW.
### F. الحلق أو التقصير والتحلل
F01 — بعد الطواف والسعي يحلق الرجل شعر رأسه أو يقصره، والحلق أفضل في الجملة؛ قد يُفضل التقصير إذا قرب الحج ليبقى شعر للحلق. ينبغي تعميم التقصير على الرأس لا الاقتصار على خصلة واحدة في الوصف المختار. Source S1,S2.
F02 — المرأة تقصر من أطراف شعرها ولا تحلق للنسك. Source S1.
F03 — لا تعرض «اكتملت العمرة شرعًا» اعتمادًا على checkbox؛ تعرض فقط «أنهيت خطواتي المسجلة». من نسي التقصير أو فعل محظورًا يسأل أهل العلم حسب حاله. Source S4.
F04 — الأصلع وتمرير الموس، تعدد العمرات، العمرة عن الغير: مسائل متخصصة تُعرض في FAQ بعد التحقيق. NEED REVIEW.

## 4. Frequently asked questions — safe editorial skeleton
Each FAQ should include a short practical general answer + 'هل يختلف الحكم بحسب حالتي؟' + source button + 'اسأل أهل العلم عند وجود أثر على صحة النسك أو الفدية'. Topics: تجاوز الميقات، فقد الوضوء أثناء الطواف، نسيان عدد الأشواط، الإقامة للصلاة أثناء الطواف، الحيض قبل الطواف، الحيض بعد الطواف، سقوط الشعر دون قصد، تبديل الإحرام، المشابك والحزام، المعطرات، العمرة عن الغير، استخدام الكرسي المتحرك، الصفا والمروة في الأدوار، التقصير المنسي، الشك بعد الفراغ، ازدحام الحجر الأسود. Do not invent one-size-fits-all fatwas.

## 5. Du'a library policy
User's FIVE personal categories remain default: نفسي، أهلي، أصحابي، سائر المسلمين والمسلمات والأمة، أمواتي وأموات المسلمين. User may add categories. Provide an OPTIONAL separate 'أدعية مأثورة' collection; each item has exact Arabic text, source name, book/number, hadith grade if relevant, contextual applicability, and reviewer status. Do not label generic user-written prayers 'prophetic'. Do not claim fixed du'a per tawaf circuit or guaranteed-answer places. Candidate Quranic du'a: البقرة 2:201 «رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ» (Quran citation; exact orthography verify against approved mushaf text). Candidate prophetic formulas must be sourced independently before publishing. Personal du'a never leaves device.

## 6. Sources and verification registry
S1 — ابن باز، «أعمال مناسك العمرة» https://binbaz.org.sa/articles/196/اعمال-مناسك-العمرة
S2 — ابن باز، «صفة مناسك الحج الثلاثة» https://binbaz.org.sa/fatwas/16511/صفة-مناسك-الحج-الثلاثة
S3 — صحيح مسلم، حديث جابر 1218a https://sunnah.com/muslim:1218a
S4 — ابن باز، «حكم من نسي الحلق أو التقصير في العمرة» https://binbaz.org.sa/fatwas/16713/حكم-من-نسي-الحلق-او-التقصير-في-العمرة
S5 — ابن باز، «صفة العمرة لمن كان من أهل مكة» https://binbaz.org.sa/fatwas/14941/صفة-العمرة-لمن-كان-من-اهل-مكة
Source registry status: pages located in preliminary research, NOT all quotations and rulings independently checked in full and NOT scholarly approved. URLs can be percent-encoded by client. Preserve exact citation identifiers and visited/check dates in code.

## 7. Corrections from raw notes
- 'Any stitched ihram is forbidden' -> false overgeneralization.
- 'Elastic, velcro, clips always forbidden' -> unverified blanket ruling; remove.
- 'Changing ihram clothes invalidates ihram' -> incorrect; remove.
- 'Perfuming ihram fabric is fine if never removed' -> do not publish.
- 'Menstruation lasting long automatically ends ihram' -> incorrect generalization; remove.
- 'All prayer inside Hijr forbidden' -> incorrect generalization; remove.
- 'Seeing Kaaba du'a is established sunnah' -> do not assert.
- 'Specific du'a at every circuit' -> do not invent.
- 'If wudu breaks, always restart half-circuit' -> disputed; do not auto-rule.
- 'All hair falling incurs fidyah' -> do not assert.
- 'Tawaf is prayer' alone settles purity dispute -> incomplete legal reasoning.
- 'Bukhari/Muslim hadith exact formula' -> verify before literal publication.
- 'Best sa'i floor is closest to Kaaba' -> no supported claim.
- Miqat distance figures -> remove pending verification.

## 8. Integration tasks
1. Read existing src/content/stages.ts, sources.ts and their tests. Preserve IDs/migrations and current state.
2. Add typed content schema, stage data, source registry, evidence drawer with offline citations, gender-specific differences and review badges. Drafts remain hidden from public normative display by default; for development preview only use explicit review mode with warning.
3. Integrate stage microsteps with existing personal checklist but do NOT mutate previous trip progress silently. New ritual IDs must be stable; existing stage checkboxes remain intact.
4. Add optional reviewed supplication library after precise verification; personal du'a categories stay editable and private.
5. Add tests: no unreviewed normative text exposed publicly; offline evidence drawer; no phantom hadith grading; gender toggle; Arabic RTL; migration and backup/restore compatibility; no external fetch; source provenance; responsive mobile.
6. Generate docs/RELIGIOUS_CONTENT_STATUS.md with counts of approved/draft/blocked and precise outstanding review; do not claim completion until approved.
7. Run npm test, npm run build, npm run test:e2e, npm audit. Do not deploy without explicit approval.

## 9. Acceptance gate
The content pack is a carefully structured research/editorial draft, NOT a fatwa and NOT a completed scholarly review. A named qualified reviewer must approve each normative record (or the launch must remain clearly non-normative with drafts hidden). Never manufacture reviewer identity, timestamps, religious approval, source text, or hadith grade. Do not block offline notes/planner/checklist while awaiting review.

## 10. Ready-to-paste Codex command
Read ZAAD_RELIGIOUS_CONTENT_PACK_v1.md and integrate it into the EXISTING ZAAD app in D:\\zad. Preserve current PWA, IndexedDB, autosave, user data, backups, and tests. First implement the religious-content schema, source registry, offline evidence UI, six-stage step architecture, gender-specific differences, and strict publication gate. Import draft content with reviewStatus=needs_review and keep normative drafts hidden in production; provide a clearly labeled local editorial preview. Independently verify exact source quotations before marking source_checked, never claim scholarly approval. Add tests and produce a report with what is visible publicly vs awaiting review. Do not deploy.
