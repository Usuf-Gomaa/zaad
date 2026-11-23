import type { ReligiousRecord, Source } from "./schema";
import { sourceCheckIssues, publicationIssues } from "./publication";
// Pure editorial transition; never invoked automatically, never writes to the pilgrim database.
export function transitionReview(
  record: ReligiousRecord,
  next: ReligiousRecord["reviewStatus"],
  registry?: Source[],
): ReligiousRecord {
  if (next === "source_checked" && sourceCheckIssues(record, registry).length)
    throw Error("أكمل فحص النصوص والإحالات أولاً");
  const result = { ...record, reviewStatus: next };
  if (next === "scholarly_approved") {
    if (record.reviewStatus !== "source_checked")
      throw Error("يلزم فحص المصادر قبل الاعتماد");
    if (publicationIssues(result, registry).length)
      throw Error("بيانات الاعتماد أو الأدلة ناقصة");
  }
  return result;
}
