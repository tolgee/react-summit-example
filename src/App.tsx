import {
  BackendFetch,
  DevBackend,
  DevTools,
  LanguageDetector,
  Tolgee,
  TolgeeProvider,
} from "@tolgee/react";
import { Title } from "./Title.tsx";
import { Page } from "./components/Page";
import { QRCode } from "./components/QRCode";
import { FormatIcu } from "@tolgee/format-icu";
import { LoadingScreen } from "./components/LoadingScreen.tsx";
import { DummyOptionsProvider } from "./components/OptionsProvider.tsx";
import { DevSupport } from "@react-buddy/ide-toolbox";
import ComponentPreviews from "./dev/previews.tsx";
import { useInitial } from "./dev/useInitial.ts";
import { useLanguages } from "./components/useLanguages.tsx";

const savedLocale = localStorage.getItem("userLocale") || undefined;

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

export const App = () => {
  const { languages, loading } = useLanguages({
    onLoad(languages) {
      tolgee.updateOptions({ availableLanguages: languages.map((l) => l.tag) });
    },
  });

  console.log({ languages, loading });

  if (loading) {
    <LoadingScreen />;
  }

  return (
    <>
      <TolgeeProvider
        tolgee={tolgee}
        fallback={<LoadingScreen />}
      >
        <DummyOptionsProvider languages={languages}>
          <DevSupport
            ComponentPreviews={ComponentPreviews}
            useInitialHook={useInitial}
          >
            <>
              <div className="background-confetti"></div>
              <div className="app-mouse-dev"></div>
              <QRCode />
              <Title />
              <Page languages={languages} />
            </>
          </DevSupport>
        </DummyOptionsProvider>
      </TolgeeProvider>
    </>
  );
};
