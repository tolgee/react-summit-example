import React, { useState, useEffect } from 'react';
import { useTolgee } from '@tolgee/react';

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
          `${apiUrl}/v2/projects/${projectId}/languages?size=100`,
          {
            headers: {
              'X-API-Key': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch languages: ${response.statusText}`);
        }

        const data: LanguagesResponse = await response.json();
        setLanguages(data._embedded.languages);
      } catch (error) {
        console.error('Error fetching languages:', error);
        // Fallback to default languages if API call fails
        setLanguages([
          { id: 1, name: 'English', tag: 'en', originalName: 'English', flagEmoji: '🇬🇧' },
          { id: 2, name: 'Česky', tag: 'cs', originalName: 'Česky', flagEmoji: '🇨🇿' },
          { id: 3, name: 'Français', tag: 'fr', originalName: 'Français', flagEmoji: '🇫🇷' },
          { id: 4, name: 'Deutsch', tag: 'de', originalName: 'Deutsch', flagEmoji: '🇩🇪' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch languages when the selector is clicked
    const handleClick = () => {
      if (languages.length === 0 && !loading) {
        fetchLanguages();
      }
    };

    const selectElement = document.querySelector('.lang-selector');
    if (selectElement) {
      selectElement.addEventListener('click', handleClick);
    }

    return () => {
      if (selectElement) {
        selectElement.removeEventListener('click', handleClick);
      }
    };
  }, [languages.length, loading]);

  return (
    <select
      className="lang-selector"
      onChange={(e) => tolgee.changeLanguage(e.target.value)}
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
          <option value="en">🇬🇧 English</option>
          <option value="cs">🇨🇿 Česky</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="de">🇩🇪 Deutsch</option>
        </>
      )}
    </select>
  );
};
