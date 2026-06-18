import {
  BackendFetch,
  DevBackend,
  DevTools,
  LanguageDetector,
  Tolgee,
} from "@tolgee/react";
import { FormatIcu } from "@tolgee/format-icu";
import { getUserLocale } from "./utils/userLocaleStorage";
import { bindDocumentDirection } from "./utils/languageDirection";

const savedLocale = getUserLocale();

const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .use(
    BackendFetch({
      prefix: import.meta.env.VITE_APP_TOLGEE_CDN_URL,
    })
  )
  .use(LanguageDetector())
  .use(DevBackend())
  .init({
    apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL,
    apiKey: import.meta.env.VITE_APP_TOLGEE_API_KEY,
    projectId: import.meta.env.VITE_APP_TOLGEE_PROJECT_ID,
    fallbackLanguage: "en",
    defaultLanguage: "en",
    availableLanguages: ["en", "cs"],
    language: savedLocale,
  });

bindDocumentDirection(tolgee);

export default tolgee;
