// Non-normative question/topic index, derived from pack FAQ01–FAQ16. No draft answers here.
export const faqIndex = [
  ["FAQ01", "travel", "تجاوز الميقات", "Passing the miqat"],
  ["FAQ02", "tawaf", "فقد الوضوء أثناء الطواف", "Losing wudu during tawaf"],
  ["FAQ03", "tawaf", "نسيان عدد الأشواط", "Forgetting the number of circuits"],
  [
    "FAQ04",
    "tawaf",
    "الإقامة للصلاة أثناء الطواف",
    "Prayer beginning during tawaf",
  ],
  ["FAQ05", "ihram", "الحيض قبل الطواف", "Menstruation before tawaf"],
  ["FAQ06", "tawaf", "الحيض بعد الطواف", "Menstruation after tawaf"],
  ["FAQ07", "ihram", "سقوط الشعر دون قصد", "Unintentional hair loss"],
  ["FAQ08", "ihram", "تبديل الإحرام", "Changing ihram garments"],
  ["FAQ09", "ihram", "المشابك والحزام", "Clips and belts"],
  ["FAQ10", "ihram", "المعطرات", "Scented products"],
  ["FAQ11", "ihram", "العمرة عن الغير", "Umrah on behalf of another person"],
  ["FAQ12", "sai", "استخدام الكرسي المتحرك", "Using a wheelchair"],
  [
    "FAQ13",
    "sai",
    "الصفا والمروة في الأدوار",
    "Safa and Marwah on different floors",
  ],
  ["FAQ14", "finish", "التقصير المنسي", "Forgetting to trim the hair"],
  ["FAQ15", "finish", "الشك بعد الفراغ", "Doubt after finishing"],
  ["FAQ16", "tawaf", "ازدحام الحجر الأسود", "Crowding at the Black Stone"],
].map(([id, category, ar, en]) => ({
  id,
  namespace: "umrah" as const,
  category,
  title: { ar, en },
}));
