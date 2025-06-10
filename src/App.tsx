import { Tolgee, TolgeeProvider, BackendFetch, DevTools, DevBackend } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import { Title } from "./Title.tsx";
import { Page } from './components/Page';

const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .use(BackendFetch())
  .use(DevBackend())
  .init({
    apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL,
    apiKey: import.meta.env.VITE_APP_TOLGEE_API_KEY,
    projectId: import.meta.env.VITE_APP_TOLGEE_PROJECT_ID,
    fallbackLanguage: 'en',
    defaultLanguage: 'en',
  });

export const App = () => {
  return (
    <TolgeeProvider tolgee={tolgee} options={{ useSuspense: true }}>
      <Title />
      <Page />
    </TolgeeProvider>
  );
};
