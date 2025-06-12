import React, { useEffect, useState } from "react";
import ActivityDetector from "react-activity-detector";
import { useTolgee } from "@tolgee/react";
import { useOptions } from "./OptionsProvider";
import { shuffleArray } from "./shuffleArray";
import { useLanguages } from "./useLanguages";

export const LangSelector: React.FC = () => {
  const { languages: globalLanguages, rotate } = useOptions();
  const tolgee = useTolgee(["pendingLanguage"]);
  const [userIdle, setUserIdle] = useState(false);

  const { languages: fetchedLanguages, fetchLanguages } = useLanguages({
    auto: false,
    onLoad(languages) {
      tolgee.updateOptions({ availableLanguages: languages.map((l) => l.tag) });
    },
  });

  const languages = fetchedLanguages ?? globalLanguages;

  useEffect(() => {
    const currentLanguage = tolgee.getLanguage();
    if (userIdle && languages && currentLanguage && rotate) {
      const randomizedLangs = [...languages];
      shuffleArray(randomizedLangs);
      const handler = () => {
        const language = tolgee.getLanguage();
        const currentIndex = randomizedLangs?.findIndex(
          (i) => i.tag === language
        );
        const nextIndex = (currentIndex + 1) % randomizedLangs.length;
        tolgee.changeLanguage(randomizedLangs[nextIndex].tag);
      };
      handler();
      const timer = setInterval(handler, rotate * 1000);
      return () => {
        clearInterval(timer);
        tolgee.changeLanguage(currentLanguage);
      };
    }
  }, [userIdle]);

  return (
    <>
      {rotate && (
        <ActivityDetector
          onActive={() => setUserIdle(false)}
          onIdle={() => setUserIdle(true)}
          timeout={20 * 1000}
          enabled={true}
        />
      )}
      <select
        className={`lang-selector ${userIdle ? "rotating" : ""}`}
        onChange={(e) => {
          const selectedLang = e.target.value;
          localStorage.setItem("userLocale", selectedLang);
          tolgee.changeLanguage(selectedLang);
        }}
        onClick={() => {
          fetchLanguages();
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
    </>
  );
};
