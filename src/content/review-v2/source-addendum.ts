import type { Source, SourceObservation } from '../schema';
export const addendumFile = 'ZAAD_RELIGIOUS_CONTENT_V2_1_SOURCE_CHECK_ADDENDUM.md';
const checkedAt = '2026-11-23';
export const addendumSources: Source[] = [
  { id: 'SC-BUK1549', title: 'صحيح البخاري 1549 — باب التلبية', url: 'https://sunnah.com/bukhari:1549', kind: 'hadith', provenance: addendumFile, visitedAt: checkedAt, accessNote: 'Automated text retrieval; partial source observation, not qualified review.' },
  { id: 'SC-Q201', title: 'Quran.com — Quran Duas — البقرة 2:201', url: 'https://quran.com/duas/arabic-english-transliteration', kind: 'quran', provenance: addendumFile, visitedAt: checkedAt, accessNote: 'Verse reference and published meaning observed; final orthography and translation not approved.' },
  { id: 'SC-FORGOT', title: 'ابن باز — حكم من نسي الحلق أو التقصير في العمرة', url: 'https://binbaz.org.sa/fatwas/16713/حكم-من-نسي-الحلق-او-التقصير-في-العمرة', kind: 'fatwa', provenance: addendumFile, visitedAt: checkedAt, accessNote: 'Specific question/answer and locator observed; not all scenarios or schools.' },
  { id: 'SC-SHAVE', title: 'ابن باز — الحلق أفضل من التقصير', url: 'https://binbaz.org.sa/fatwas/16338/الحلق-افضل-من-التقصير', kind: 'fatwa', provenance: addendumFile, visitedAt: checkedAt, accessNote: 'Near-Hajj exception and attributed preference observed; not consensus.' },
];
const common = {
  sourceExists: true, status: 'partial_source_check', completeClaimCoverage: false,
  qualifiedApproval: false, checkedAt, checkedBy: 'Codex — automated retrieval; not a qualified scholarly reviewer',
  method: 'web retrieval of primary/reference page text on 2026-11-23; comparison with supplied addendum, no independent textual collation or translation review',
  provenanceFile: addendumFile,
} as const;
export const sourceObservations: Record<string, SourceObservation[]> = {
  B02: [{ ...common, id: 'SC-B02-1', sourceId: 'SC-BUK1549', locator: 'Sahih al-Bukhari 1549; Book 25, Hadith 35; باب التلبية; ابن عمر',
    quotationAr: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ',
    claim: { ar: 'وردت صيغة التلبية في حديث ابن عمر؛ لم تعتمد بطاقة ذكر كاملة.', en: 'The Ibn Umar report contains the talbiyah wording; a complete liturgical card is not approved.' },
    rationale: { ar: 'لوحظ هذا المقتطف في النص العربي بالموضع المحدد، وتوجد بقية الصيغة في الصفحة.', en: 'The short excerpt was observed in the Arabic text at this locator; the remainder is present on the page.' },
    limits: { ar: 'لا يغطي بدء التلبية وانتهاءها وصوت النساء والاستثناءات. بقية الصيغة والترجمة تحتاج مراجعة قبل الإدراج.', en: 'Does not cover start/stop timing, women’s volume or exceptions. Full wording and English publication still require review.' },
    opinionScope: { ar: 'نص رواية؛ ليس ترجيحاً فقهياً لكل أحكام التلبية. لا درجة حديث مضافة.', en: 'Reported wording, not a ruling covering all talbiyah practice. No hadith grade added.' },
  }],
  'DUA-Q2-201': [{ ...common, id: 'SC-DUA-1', sourceId: 'SC-Q201', locator: 'Quran Duas page, first displayed supplication, linked Al-Baqarah 2:201', quotationAr: null,
    claim: { ar: 'عثر على إحالة البقرة 2:201 والنص ومعنى إنجليزي منشور.', en: 'The page displays the supplication, a 2:201 reference and a published English meaning.' },
    rationale: { ar: 'توجد إحالة للآية ونص عربي في الصفحة؛ لم يعتمد نقل الرسم العثماني أو الترجمة للتطبيق.', en: 'The Arabic text and verse link are present; app orthography and translation have not been approved.' },
    limits: { ar: 'الصفحة تعرض دعاء من الآية؛ لا يثبت ذلك عدداً معيناً أو تخصيص شوط. الإدراج الحرفي النهائي والترجمة معلقان.', en: 'The page presents the supplication from the verse. It does not establish a repetition count or circuit assignment. Final literal insertion and translation remain pending.' },
    opinionScope: { ar: 'إحالة قرآنية؛ سياق الاستخدام في الطواف يحتاج دليلاً مستقلاً.', en: 'Quranic reference; tawaf-specific usage needs independent evidence.' },
  }],
  F01: [{ ...common, id: 'SC-F01-1', sourceId: 'SC-SHAVE', locator: 'Fatwa 16338; question and answer; مجموع فتاوى ومقالات ابن باز 17/313', quotationAr: 'لكن إذا كانت العمرة قرب الحج فالأفضل فيها التقصير',
    claim: { ar: 'تذكر الفتوى تفضيل الحلق مع استثناء قرب الحج ومناقشة تعميم الرأس.', en: 'The answer prefers shaving with a near-Hajj exception and discusses whole-head coverage.' },
    rationale: { ar: 'لوحظ الاستثناء في الفقرة الأولى، وتعميم الرأس وعبارة أصح قولي العلماء في الثانية.', en: 'The first answer paragraph contains the exception; the second discusses coverage and attributes a preferred view among two opinions.' },
    limits: { ar: 'لا يحذف استثناء قرب الحج ولا ينقل الترجيح كإجماع. أحكام النساء وتحرير الأقوال وأدلتها لم تكتمل.', en: 'Retain the near-Hajj exception; do not present the preference as consensus. Women’s guidance and comparative positions/evidence remain incomplete.' },
    opinionScope: { ar: 'رأي منسوب لابن باز؛ لم يتحقق نطاق المذاهب مستقلاً.', en: 'Attributed Ibn Baz position; madhhab coverage has not been independently established.' },
  }],
};
for (const id of ['FAQ14', 'F04']) sourceObservations[id] = [{ ...common,
  id: `SC-${id}-1`, sourceId: 'SC-FORGOT', locator: 'Fatwa 16713; question and answer; مجموع فتاوى ومقالات ابن باز 17/436', quotationAr: null,
  claim: { ar: 'حالة من طاف وسعى ولبس ثم تذكر ترك الحلق أو التقصير.', en: 'A specific scenario of remembering omitted shaving/trimming after tawaf, sa’i and changing clothes.' },
  rationale: { ar: 'لوحظ السؤال والجواب وتفريق النسيان والجهل، مع بيان ما يفعله عند التذكر.', en: 'The question and answer address remembering the omission and distinguish forgetfulness/ignorance in the specified clothing scenario.' },
  limits: { ar: 'لا يعمم على الجماع أو النساء أو كل المحظورات والمذاهب. المقارنة مع التعمد وتبعاته تحتاج أدلة أخرى؛ لا محرك فدية أو صحة.', en: 'No extrapolation to intercourse, women, every violation or all schools. Deliberate cases and consequences need further evidence; no penalty or validity engine.' },
  opinionScope: { ar: 'جواب محدد لابن باز؛ الاستثناءات ومقارنة المذاهب معلقان.', en: 'Specific Ibn Baz answer; exceptions and comparative-school review are pending.' },
}];
