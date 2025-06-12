import { TolgeeProvider } from "@tolgee/react";
import { Title } from "./Title.tsx";
import { Page } from "./components/Page";
import { QRCode } from "./components/QRCode";
import { LoadingScreen } from "./components/LoadingScreen.tsx";
import { DummyOptionsProvider } from "./components/OptionsProvider.tsx";
import { DevSupport } from "@react-buddy/ide-toolbox";
import ComponentPreviews from "./dev/previews.tsx";
import { useInitial } from "./dev/useInitial.ts";
import { useLanguages } from "./components/useLanguages.tsx";
import { GlobalLanguagesProvider } from "./components/GlobalLanguagesProvider";
import tolgee from "./tolgee";

export const App = () => {
  const { languages, loading } = useLanguages({
    onLoad(languages) {
      tolgee.updateOptions({ availableLanguages: languages.map((l) => l.tag) });
    },
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <TolgeeProvider
        tolgee={tolgee}
        options={{ useSuspense: true }}
        fallback={<LoadingScreen />}
      >
        <GlobalLanguagesProvider languages={languages}>
          <DummyOptionsProvider>
            <DevSupport
              ComponentPreviews={ComponentPreviews}
              useInitialHook={useInitial}
            >
              <>
                <div className="background-confetti"></div>
                <div className="app-mouse-dev"></div>
                <QRCode />
                <Title />
                <Page />
              </>
            </DevSupport>
          </DummyOptionsProvider>
        </GlobalLanguagesProvider>
      </TolgeeProvider>
    </>
  );
};
