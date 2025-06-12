import { useEffect, useState } from "react";

export interface Language {
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

type Props = {
  onLoad: (languages: Language[]) => void;
};

export const useLanguages = ({ onLoad }: Props) => {
  const [languages, setLanguages] = useState<Language[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_APP_TOLGEE_API_URL;
        const apiKey = import.meta.env.VITE_APP_TOLGEE_API_KEY;
        const projectId = import.meta.env.VITE_APP_TOLGEE_PROJECT_ID;

        const url = projectId
          ? `${apiUrl}/v2/projects/${projectId}/languages?size=100&sort=name,asc`
          : `${apiUrl}/v2/projects/languages?size=100&sort=name,asc`;

        const response = await fetch(url, {
          headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch languages: ${response.statusText}`);
          return;
        }

        const data: LanguagesResponse = await response.json();
        setLanguages(data._embedded.languages);
        onLoad(data._embedded.languages)
      } catch (error) {
        console.error("Error fetching languages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return { languages, loading };
};
