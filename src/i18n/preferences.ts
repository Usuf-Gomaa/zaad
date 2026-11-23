import { db, saves } from "../db";
import { applyLanguage, getLanguage, type Language } from "./index";
export async function initializeLanguage() {
  const preference = await db.preferences.get("language");
  applyLanguage(
    preference?.value === "en"
      ? "en"
      : preference?.value === "ar"
        ? "ar"
        : getLanguage(),
  );
}
export async function selectLanguage(next: Language) {
  window.dispatchEvent(new Event("zaad:flush"));
  await saves.drain();
  await db.preferences.put({ id: "language", value: next });
  try {
    localStorage.setItem("zaad-language", next);
  } catch {
    /* Mirror is optional. */
  }
  applyLanguage(next);
}
