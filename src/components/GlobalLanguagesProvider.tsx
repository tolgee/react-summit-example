import { createContext, useContext, ReactNode } from 'react';
import { Language } from './useLanguages';

interface GlobalLanguagesContextType {
  languages: Language[] | undefined;
}

const GlobalLanguagesContext = createContext<GlobalLanguagesContextType | undefined>(undefined);

export const useGlobalLanguages = () => {
  const context = useContext(GlobalLanguagesContext);
  if (!context) {
    throw new Error('useGlobalLanguages must be used within a GlobalLanguagesProvider');
  }
  return context;
};

interface GlobalLanguagesProviderProps {
  children: ReactNode;
  languages: Language[] | undefined;
}

export const GlobalLanguagesProvider = ({ children, languages }: GlobalLanguagesProviderProps) => {
  const value = {
    languages,
  };

  return (
    <GlobalLanguagesContext.Provider value={value}>
      {children}
    </GlobalLanguagesContext.Provider>
  );
};