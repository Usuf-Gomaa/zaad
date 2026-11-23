import { useEffect, useState } from "react";
import { appVersion, buildId, releases } from "../release";
import { t, useLanguage } from "../i18n";
import { activateSafely } from "./lifecycle";
import { isAuthenticatedStaging } from '../content/editorial-mode';
export function UpdatePanel({
  onLock,
  onReady,
}: {
  onLock: (value: boolean) => void;
  onReady: (value: boolean) => void;
}) {
  useLanguage();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>(),
    [waiting, setWaiting] = useState<ServiceWorker>(),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (isAuthenticatedStaging || !import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let disposed = false,
      reg: ServiceWorkerRegistration | undefined;
    const inspect = () => {
      if (reg?.waiting) setWaiting(reg.waiting);
    };
    const check = () => {
      if (navigator.onLine && document.visibilityState !== "hidden")
        void reg?.update().catch(() => {});
    };
    const found = () => {
      const installing = reg?.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed") {
          inspect();
          onReady(true);
        }
      });
    };
    // No auto refresh for an unsolicited controller change. Only our confirmed update may reload.
    const changed = () => {
      if (document.documentElement.dataset.updateConfirmed === "true")
        location.reload();
    };
    void navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((value) => {
        if (disposed) return;
        reg = value;
        setRegistration(value);
        inspect();
        reg.addEventListener("updatefound", found);
        found();
        return navigator.serviceWorker.ready;
      })
      .then((value) => {
        if (value && !disposed) onReady(true);
      })
      .catch(() => setMessage("update.failed"));
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      disposed = true;
      reg?.removeEventListener("updatefound", found);
      navigator.serviceWorker.removeEventListener("controllerchange", changed);
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [onReady]);
  async function check() {
    if (!navigator.onLine) {
      setMessage("update.offline");
      return;
    }
    setMessage("update.checking");
    try {
      await registration?.update();
      setMessage("update.none");
    } catch {
      setMessage("update.failed");
    }
  }
  async function update() {
    if (!waiting || busy || !window.confirm(t("update.confirmation"))) return;
    setBusy(true);
    setMessage("update.saving");
    try {
      document.documentElement.dataset.updateConfirmed = "true";
      await activateSafely(waiting, onLock);
    } catch (error) {
      delete document.documentElement.dataset.updateConfirmed;
      setBusy(false);
      setMessage(error instanceof Error ? error.message : "update.failed");
    }
  }
  return (
    <aside
      className={`update-panel ${waiting ? "notice" : ""}`}
      aria-label={t("release.version")}
    >
      <div className="section-head">
        <small>
          {t("release.version")} {appVersion} · {buildId}
        </small>
        {waiting && <strong role="status">{t("update.available")}</strong>}
      </div>
      {waiting && (
        <button
          className="primary"
          disabled={busy}
          onClick={() => void update()}
        >
          {t("update.confirm")}
        </button>
      )}
      <details>
        <summary>{t("release.new")}</summary>
        {releases.map((release) => (
          <section key={release.version}>
            <h3>
              {release.version} · {t(release.title)}
            </h3>
            <p>{t(release.body)}</p>
          </section>
        ))}
        <p>{t(isAuthenticatedStaging ? 'staging.online' : "update.limit")}</p>
        {!isAuthenticatedStaging && <button disabled={busy} onClick={() => void check()}>
          {t("update.check")}
        </button>}
      </details>
      <p role="status">{t(message)}</p>
    </aside>
  );
}
