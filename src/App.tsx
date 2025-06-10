import { Tolgee, TolgeeProvider, BackendFetch, DevTools, DevBackend } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import { Title } from "./Title.tsx";
import { Page } from './components/Page';
import { LoadingScreen } from './components/LoadingScreen';

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

export const App = () => {
  return (
    <TolgeeProvider
      tolgee={tolgee}
      options={{ useSuspense: true }}
      fallback={<LoadingScreen />}
    >
      <Title />
      <Page />
    </TolgeeProvider>
  );
};
