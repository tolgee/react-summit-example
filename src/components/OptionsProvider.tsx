import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslate } from '@tolgee/react';

export interface Option {
  text: string;
  votes: number;
}

interface OptionsContextType {
  options: Option[];
  totalVotes: number;
  errorFetch: string | null;
  userVote: string | null;
  setUserVote: (vote: string | null) => void;
  submitVote: (option: string, email?: string) => Promise<void>;
  isSubmitting: boolean;
  errorSubmit: string | null;
  setErrorSubmit: (error: string | null) => void;
  leaderboard: boolean;
}

const OptionsContext = createContext<OptionsContextType | undefined>(undefined);

export const useOptions = () => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error('useOptions must be used within an OptionsProvider');
  }
  return context;
};

interface OptionsProviderProps {
  children: ReactNode;
}

export const OptionsProvider = ({ children }: OptionsProviderProps) => {
  const { t } = useTranslate();
  const [totalVotes, setTotalVotes] = useState(0);
  const [options, setOptions] = useState<Option[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState(false);

  useEffect(() => {
    const savedVote = localStorage.getItem('userVote');
    if (savedVote) {
      setUserVote(savedVote);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const showLeaderboard = urlParams.get('leaderboard') === 'true';

    if (showLeaderboard) {
      setLeaderboard(true);
    }
  }, []);

  const apiUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    const reconnectDelay = 10000;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${apiUrl.replace(/^https?:\/\//, '')}`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'options') {
            setOptions(data.data);
            setTotalVotes(data.data.reduce((sum: number, option: Option) => sum + option.votes, 0));
            setErrorFetch(null);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        fetchOptions();
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        reconnectTimeout = window.setTimeout(connect, reconnectDelay);
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }

      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [apiUrl]);

  const handleFetchError = (error: any) => {
    console.error('Error fetching options:', error);
    setErrorFetch(t({
      key: 'error-fetching-options',
      defaultValue: 'Failed to load voting options. Please try again later.'
    }));
  }

  const fetchOptions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/options`);
      if (!response.ok) {
        handleFetchError(response);
        return;
      }
      const data = await response.json();
      setOptions(data);
      setTotalVotes(data.reduce((sum: number, option: Option) => sum + option.votes, 0));
      setErrorFetch(null);
    } catch (error) {
      handleFetchError(error);
    }
  };

  const handleVoteError = (error: any) => {
    console.error('Error submitting vote:', error);
    setErrorSubmit(t({
      key: 'error-submitting-vote',
      defaultValue: 'Failed to submit your vote. Please try again.'
    }));
    setIsSubmitting(false);
  }

  const submitVote = async (option: string, email?: string) => {
    if (!option) {
      setErrorSubmit(t({
        key: 'error-no-option-selected',
        defaultValue: 'Please select an option to vote.'
      }));
      return;
    }

    setIsSubmitting(true);
    setErrorSubmit(null);

    try {
      const response = await fetch(`${apiUrl}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option,
          email: email || undefined,
        }),
      });

      if (!response.ok) {
        handleVoteError(response);
        return;
      }

      localStorage.setItem('userVote', option);
      setUserVote(option);
      setIsSubmitting(false);
    } catch (error) {
      handleVoteError(error);
    }
  };

  const value = {
    options,
    totalVotes,
    errorFetch,
    userVote,
    setUserVote,
    submitVote,
    isSubmitting,
    errorSubmit,
    setErrorSubmit,
    leaderboard,
  };

  return (
    <OptionsContext.Provider value={value}>
      {children}
    </OptionsContext.Provider>
  );
};
