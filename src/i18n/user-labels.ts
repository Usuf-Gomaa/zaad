import { t } from "./index";
const initial = [
  "لنفسي",
  "لأهلي",
  "لأصحابي",
  "لسائر المسلمين والمسلمات والأمة الإسلامية",
  "لأمواتي وأموات المسلمين",
];
// Translate only untouched seed labels. Renamed/custom values always stay exactly as entered.
export function categoryLabel(category: { id: string; name: string }) {
  return initial[Number(category.id)] === category.name
    ? t(category.name)
    : category.name;
}
export function tripLabel(trip: { id: string; title: string }) {
  return trip.id === "first" && trip.title === "رحلتي الأولى"
    ? t(trip.title)
    : trip.title;
}
