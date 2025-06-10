import React, { useState, useEffect } from 'react';
import { useTolgee, useTranslate } from '@tolgee/react';

interface Language {
  id: number;
  name: string;
  tag: string;
  originalName: string;
  flagEmoji: string;
}

interface LanguagesResponse {
  _embedded: {
    languages: Language[];
  };
  page: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export const LangSelector: React.FC = () => {
  const { t } = useTranslate();
  const tolgee = useTolgee(['pendingLanguage']);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_APP_TOLGEE_API_URL;
        const apiKey = import.meta.env.VITE_APP_TOLGEE_API_KEY;
        const projectId = import.meta.env.VITE_APP_TOLGEE_PROJECT_ID;

        const response = await fetch(
          `${apiUrl}/v2/projects/${projectId}/languages?size=100&sort=name,asc`,
          {
            headers: {
              'X-API-Key': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch languages: ${response.statusText}`);
          return;
        }

        const data: LanguagesResponse = await response.json();
        setLanguages(data._embedded.languages);
      } catch (error) {
        console.error('Error fetching languages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return (
    <select
      className="lang-selector"
      onChange={(e) => {
        const selectedLang = e.target.value;
        localStorage.setItem('userLocale', selectedLang);
        tolgee.changeLanguage(selectedLang);
      }}
      value={tolgee.getPendingLanguage()}
    >
      {languages.length > 0 ? (
        languages.map((lang) => (
          <option key={lang.id} value={lang.tag}>
            {lang.flagEmoji} {lang.name}
          </option>
        ))
      ) : (
        <>
          <option value="en">
            🇬🇧 English
          </option>
          {tolgee.getPendingLanguage() !== 'en' && (
            <option value={tolgee.getPendingLanguage()}>{tolgee.getPendingLanguage()}</option>
          )}
          <option value="none" disabled>
            {loading  ?
              t("lang-selector-loading", "Loading languages...") :
              t("lang-selector-failed", "Whoops! Y’all hammered our servers so hard, all the languages ran off.")}
          </option>
        </>
      )}
    </select>
  );
};
