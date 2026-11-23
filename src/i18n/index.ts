import { useSyncExternalStore } from "react";
import { en } from "./en";
import { messages } from "./messages";
import {isPrivateReviewBuild} from '../content/editorial-mode';
export type Language = "ar" | "en";
let language: Language = "ar";
try {
  if (localStorage.getItem("zaad-language") === "en") language = "en";
} catch {
  /* IndexedDB remains the preference source. */
}
const listeners = new Set<() => void>();
const reverse = Object.fromEntries(
  Object.entries(en).map(([ar, english]) => [english, ar]),
);
export function getLanguage() {
  return language;
}
export function useLanguage() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getLanguage,
    () => "ar" as Language,
  );
}
export function applyLanguage(next: Language) {
  language = next;
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document
      .querySelector('link[rel="manifest"]')
      ?.setAttribute(
        "href",
      next === "en" ? isPrivateReviewBuild?'/review-manifest-en.webmanifest':"/manifest-en.webmanifest" : "/manifest.webmanifest",
      );
    document.title = isPrivateReviewBuild?(next==='ar'?'زاد — مسودة غير معتمدة':'ZAAD Review — Unapproved draft'):(next === "ar" ? "زاد | رفيق رحلتك" : "ZAAD | Your journey companion");
  }
  for (const fn of listeners) fn();
}
// Message IDs never pass through user data repositories. Arabic source IDs normalize whitespace only.
export function t(key: string, params: Record<string, string | number> = {}) {
  let normalized = key.trim().replace(/\s+/g, " ");
  normalized = reverse[normalized] || normalized;
  const pair = messages[normalized];
  let value = pair
    ? pair[language === "ar" ? 0 : 1]
    : language === "ar"
      ? normalized
      : (en[normalized] ?? normalized);
  value = value.replace(/\{(\w+)\}/g, (_, id) =>
    String(params[id] ?? `{${id}}`),
  );
  return (/^\s/.test(key) ? " " : "") + value + (/\s$/.test(key) ? " " : "");
}
export const catalogs = { en, messages };
// Apply the startup mirror before async storage opens, including loading/error screens.
applyLanguage(language);
