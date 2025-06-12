import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useTranslate } from '@tolgee/react';

export interface Option {
  text: string;
  votes: number;
}

interface OptionsContextType {
  options: Option[];
  totalVotes: number | undefined;
  errorFetch: string | null;
  userVote: string | null;
  setUserVote: (vote: string | null) => void;
  submitVote: (option: string, email?: string, name?: string) => Promise<boolean>;
  isSubmitting: boolean;
  errorSubmit: string | null;
  setErrorSubmit: (error: string | null) => void;
  leaderboard: boolean;
  isLive: boolean;
  explosions: number[];
  removeExplosion: (id: number) => void,
  addExplosions: (n: number) => void,
  hasVoted: boolean,
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
  const [totalVotes, _setTotalVotes] = useState<number | undefined>(undefined);
  const [options, setOptions] = useState<Option[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [explosions, setExplosions] = useState<number[]>([]);
  const hasVoted = useRef(false)

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

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    const reconnectDelay = 10000;

    const connect = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/ws`;
      console.log('Connecting to WebSocket', wsUrl);

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsLive(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'options') {
            setOptions(data.data);
            setTotalVotes(data.data.reduce((sum: number, option: Option) => sum + option.votes, 0));
            setErrorFetch(null);
            setIsLive(true);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setIsLive(false);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsLive(false);
        fetchOptions();
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsLive(false);
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
  }, []);

  const handleFetchError = (error: any) => {
    console.error('Error fetching options:', error);
    setErrorFetch(t({
      key: 'error-fetching-options',
      defaultValue: 'Failed to load voting options. Please try again later.'
    }));
  }

  const fetchOptions = async () => {
    try {
      const response = await fetch(`/api/options`);
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

  function removeExplosion (id: number) {
    setExplosions(items => items.filter(i => i !== id))
  }

  function addExplosions(n: number) {
    if (hasVoted.current) {
      setExplosions((existing) => {
        const newExplosions = [...Array(n).keys()].map(() => Math.random())
        return [...existing, ...newExplosions]
      })
    }
  }

  function setTotalVotes(newVotes: number) {
    _setTotalVotes(previous => {
      if(previous !== undefined && previous < newVotes) {
        addExplosions(newVotes - previous)
      }
      return newVotes
    })
  }



  const submitVote = async (option: string, email?: string, name?: string) => {
    if (!option) {
      setErrorSubmit(t({
        key: 'error-no-option-selected',
        defaultValue: 'Please select an option to vote.'
      }));
      return false;
    }

    setIsSubmitting(true);
    setErrorSubmit(null);

    try {
      const response = await fetch(`/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option,
          email: email || undefined,
          name: name || undefined,
        }),
      });

      if (!response.ok) {
        handleVoteError(response);
        return false;
      }

      localStorage.setItem('userVote', option);
      setUserVote(option);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      handleVoteError(error);
      return false;
    }
  };

  hasVoted.current = userVote !== null || leaderboard;

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
    isLive,
    removeExplosion,
    explosions,
    addExplosions,
    hasVoted: hasVoted.current,
  };

  return (
    <OptionsContext.Provider value={value}>
      {children}
    </OptionsContext.Provider>
  );
};

export const DummyOptionsProvider = ({ children }: OptionsProviderProps) => {
  const mockOptions: Option[] = [
    {text: 'option-1', votes: 10},
    {text: 'option-2', votes: 20},
    {text: 'option-3', votes: 15},
  ];

  const value: OptionsContextType = {
    options: mockOptions,
    totalVotes: 45,
    errorFetch: null,
    userVote: null,
    setUserVote: () => {
    },
    submitVote: async () => {
      return true;
    },
    isSubmitting: false,
    errorSubmit: null,
    setErrorSubmit: () => {
    },
    leaderboard: false,
    isLive: true,
    explosions: [],
    removeExplosion: () => {},
    addExplosions: () => {},
    hasVoted: false,
  };

  return (
    <OptionsContext.Provider value={value}>
      {children}
    </OptionsContext.Provider>
  );
};
