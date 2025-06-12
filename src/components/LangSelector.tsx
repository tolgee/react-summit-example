import React from "react";
import { useTolgee } from "@tolgee/react";
import { useOptions } from "./OptionsProvider";

export const LangSelector: React.FC = () => {
  const { languages } = useOptions();
  const tolgee = useTolgee(["pendingLanguage"]);
  return (
    <select
      className="lang-selector"
      onChange={(e) => {
        const selectedLang = e.target.value;
        localStorage.setItem("userLocale", selectedLang);
        tolgee.changeLanguage(selectedLang);
      }}
      value={tolgee.getPendingLanguage()}
    >
      {languages ? (
        languages.map((lang) => (
          <option key={lang.id} value={lang.tag}>
            {lang.flagEmoji} {lang.name}
          </option>
        ))
      ) : (
        <>
          <option value="en">🇬🇧 English</option>
          {tolgee.getPendingLanguage() !== "en" && (
            <option value={tolgee.getPendingLanguage()}>
              {tolgee.getPendingLanguage()}
            </option>
          )}
        </>
      )}
    </select>
  );
};
