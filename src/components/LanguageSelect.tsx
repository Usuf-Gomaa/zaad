import { useState } from "react";
import { getLanguage, t, useLanguage, type Language } from "../i18n";
import { selectLanguage } from "../i18n/preferences";
export function LanguageSelect() {
  useLanguage();
  const [error, setError] = useState(false);
  return (
    <div className="language-select">
      <label>
        {t("language")}
        <select
          aria-label={t("language")}
          value={getLanguage()}
          onChange={async (e) => {
            try {
              await selectLanguage(e.target.value as Language);
              setError(false);
            } catch {
              setError(true);
            }
          }}
        >
          <option value="ar" lang="ar">
            العربية
          </option>
          <option value="en" lang="en">
            English
          </option>
        </select>
      </label>
      {error && <small role="alert">{t("language.failed")}</small>}
    </div>
  );
}
