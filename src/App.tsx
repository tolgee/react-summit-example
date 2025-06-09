import {Tolgee, TolgeeProvider, BackendFetch, DevTools, DevBackend} from '@tolgee/react';
import { Voting } from './Voting';
import { FormatIcu } from '@tolgee/format-icu';

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
      <Voting />
    </TolgeeProvider>
  );
};
