import { useSyncExternalStore, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { t, useLanguage } from "../../i18n";
import { isEditorialEnvironment, isAuthenticatedStaging } from "../../content/editorial-mode";
let accepted = false;
const listeners = new Set<() => void>();
export function revokeReviewAccess() {
  accepted = false;
  for (const listener of listeners) listener();
}
function accept() {
  accepted = true;
  for (const listener of listeners) listener();
}
export function ReviewShell({ children }: { children: ReactNode }) {
  useLanguage();
  const access = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => accepted,
    () => false,
  );
  if (!isEditorialEnvironment)
    return <p>{t("مساحة المراجعة غير متاحة في النسخة العامة.")}</p>;
  return (
    <div className="review-shell">
      <aside className="review-banner" role="note">
        <strong>{t("review.unapproved.banner")}</strong>
        <span>{t(isAuthenticatedStaging ? 'staging.online' : "review.local.only")}</span>
      </aside>
      {!access ? (
        <section className="card">
          <h1>{t("مساحة المراجعة التحريرية")}</h1>
          <p>{t("review.access.warning")}</p>
          <button className="primary" onClick={accept}>
            {t("أفهم التحذير — عرض المسودات للتحرير")}
          </button>
        </section>
      ) : (
        <>
          <nav className="review-tabs" aria-label={t("review.tabs")}>
            <NavLink to="/review" end>
              {t("review.guide")}
            </NavLink>
            <NavLink to="/review/faq">{t("faq.title")}</NavLink>
            <button onClick={revokeReviewAccess}>{t("review.lock")}</button>
          </nav>
          {children}
        </>
      )}
    </div>
  );
}
