import type { Evidence, Gender, ReligiousRecord, Source } from "./schema";
import { sources } from "./sources.ts";
import { contentNamespaces } from "./namespaces.ts";
const text = (value: string | null) => !!value?.trim();
const date = (value: string | null) =>
  !!value &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value));
export function evidenceIssues(
  e: Evidence,
  registry: Source[] = sources,
): string[] {
  const source = registry.find((s) => s.id === e.sourceId);
  const issues: string[] = [];
  if (!source) issues.push("المصدر غير مسجل");
  if (!source?.visitedAt) issues.push("لم تسجل زيارة المصدر");
  if (!source || e.url !== source.url || !e.url.startsWith("https://"))
    issues.push("رابط الدليل لا يطابق سجل المصادر");
  if (source && source.kind !== e.evidenceType)
    issues.push("نوع الدليل لا يطابق المصدر");
  if (!text(e.locator)) issues.push("الإحالة الدقيقة ناقصة");
  if (!e.verified || !text(e.checkedBy) || !date(e.checkedAt))
    issues.push("لم يتم فحص الإحالة والنص");
  if (!text(e.exactArabicText)) issues.push("النص العربي المحقق غير مرفق");
  if (e.hadithGrade && (!e.gradeCitation || e.evidenceType !== "hadith"))
    issues.push("درجة الحديث بلا إحالة معتمدة");
  return issues;
}
export function sourceCheckIssues(
  record: ReligiousRecord,
  registry: Source[] = sources,
) {
  return [
    ...(!record.sourceCoverageConfirmed
      ? ["تغطية الأدلة لكل ادعاءات السجل لم تؤكد"]
      : []),
    ...(!record.evidence.length ? ["الدليل مفقود"] : []),
    ...[
      ...record.evidence,
      ...record.disputes.flatMap((d) => d.evidence),
    ].flatMap((e) => evidenceIssues(e, registry)),
    ...(record.disputes.some((d) => !d.evidence.length)
      ? ["إحدى وجهات الخلاف بلا دليل"]
      : []),
  ];
}
export function publicationIssues(
  record: ReligiousRecord,
  registry: Source[] = sources,
) {
  return [
    ...(record.category === "faq" && !record.detailsAr?.trim()
      ? ["تفصيل إجابة السؤال غير مكتمل"]
      : []),
    ...(!contentNamespaces[record.namespace || "umrah"].enabled
      ? ["محتوى الحج غير متاح للنشر"]
      : []),
    ...((record.category === "dua" || record.category === "dhikr") &&
    !text(record.applicabilityAr)
      ? ["سياق استعمال الدعاء أو الذكر لم يضبط"]
      : []),
    ...(record.legalClass !== "not_applicable" && !text(record.legalSchoolScope)
      ? ["نطاق التصنيف الفقهي لم يضبط"]
      : []),
    ...(record.legalClass === "disputed" && !record.disputes.length
      ? ["الخلاف يحتاج تحرير الأقوال وأدلتها"]
      : []),
    ...(record.reviewStatus !== "scholarly_approved"
      ? ["لم يعتمد السجل شرعياً"]
      : []),
    ...(!text(record.reviewedBy) ||
    !text(record.reviewerQualifications) ||
    !date(record.reviewedAt)
      ? ["بيانات المراجع المؤهل وتاريخ الاعتماد ناقصة"]
      : []),
    ...sourceCheckIssues(record, registry),
  ];
}
export function isPublished(
  record: ReligiousRecord,
  registry: Source[] = sources,
) {
  return publicationIssues(record, registry).length === 0;
}
export function visibleRecords(
  records: ReligiousRecord[],
  gender: Gender = "all",
  editorial = false,
) {
  return records
    .filter(
      (r) =>
        (editorial || isPublished(r)) &&
        (r.gender === "all" || r.gender === gender),
    )
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
export const statusLabels: Record<ReligiousRecord["reviewStatus"], string> = {
  needs_review: "يحتاج مراجعة",
  source_checked: "فُحص المصدر — ليس اعتماداً شرعياً",
  scholarly_approved: "معتمد من المراجع المسمى",
  correction_required: "يحتاج تصحيحاً",
};
export const legalLabels: Record<ReligiousRecord["legalClass"], string> = {
  pillar: "ركن",
  obligation: "واجب",
  sunnah: "سنة",
  recommended: "مستحب",
  permitted: "مباح",
  disliked: "مكروه",
  prohibited: "محظور",
  disputed: "التصنيف يحتاج ضبطاً",
  not_applicable: "دون تصنيف فقهي",
};
