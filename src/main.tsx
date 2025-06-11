import { Tolgee, TolgeeProvider, BackendFetch, DevTools, DevBackend } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import './style.css';
import { DevSupport } from "@react-buddy/ide-toolbox";
import { ComponentPreviews, useInitial } from "./dev";
import { DummyOptionsProvider } from "./components/OptionsProvider.tsx";
import { LoadingScreen } from "./components/LoadingScreen.tsx";

const savedLocale = localStorage.getItem('userLocale') || undefined;

const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .use(BackendFetch({
    prefix: import.meta.env.VITE_APP_TOLGEE_CDN_URL,
  }))
  .use(DevBackend())
  .init({
    apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL,
    apiKey: import.meta.env.VITE_APP_TOLGEE_API_KEY,
    projectId: import.meta.env.VITE_APP_TOLGEE_PROJECT_ID,
    fallbackLanguage: 'en',
    defaultLanguage: 'en',
    language: savedLocale,
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TolgeeProvider
      tolgee={tolgee}
      options={{ useSuspense: true }}
      fallback={<LoadingScreen />}
    >
      <DummyOptionsProvider>
        <DevSupport ComponentPreviews={ComponentPreviews}
                    useInitialHook={useInitial}
        >
          <App/>
        </DevSupport>
      </DummyOptionsProvider>
    </TolgeeProvider>
  </React.StrictMode>
);
