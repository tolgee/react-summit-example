import { FormEvent, useState, useEffect } from 'react';
import { T, useTranslate } from '@tolgee/react';

import { Navbar } from './components/Navbar';

interface Option {
  text: string;
  votes: number;
}

export const Voting = () => {
  const { t } = useTranslate();
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  // API URL from environment variables
  const apiUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001';

  // Connect to WebSocket for live updates with reconnection logic
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    const reconnectDelay = 10000; // Fixed 10 second delay

    const connect = () => {
      // Determine if we should use secure WebSocket (wss) based on the current protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${apiUrl.replace(/^https?:\/\//, '')}`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to WebSocket server');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'options') {
            setOptions(data.data);
            setTotalVotes(data.data.reduce((sum: number, option: Option) => sum + option.votes, 0));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Fallback to polling if WebSocket fails
        fetchOptions();
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed with code ${event.code}. Reason: ${event.reason}`);
        console.log(`Attempting to reconnect in ${reconnectDelay/1000}s...`);

        reconnectTimeout = window.setTimeout(() => {
          connect();
        }, reconnectDelay);
      };
    };

    connect();

    // Cleanup function
    return () => {
      if (ws) {
        // Prevent reconnection attempts when component unmounts
        ws.onclose = null;
        ws.close();
      }

      // Clear any pending reconnect timeouts
      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [apiUrl]);

  // Fetch options as fallback
  const fetchOptions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/options`);
      if (!response.ok) {
        throw new Error(`Failed to fetch options: ${response.statusText}`);
      }
      const data = await response.json();
      setOptions(data);
      setTotalVotes(data.reduce((sum: number, option: Option) => sum + option.votes, 0));
    } catch (error) {
      console.error('Error fetching options:', error);
      setError(t({
        key: 'error-fetching-options',
        defaultValue: 'Failed to load voting options. Please try again later.'
      }));
    }
  };

  // Submit vote
  const onVote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedOption) {
      setError(t({
        key: 'error-no-option-selected',
        defaultValue: 'Please select an option to vote.'
      }));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          option: selectedOption,
          email: email || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit vote: ${response.statusText}`);
      }

      setHasVoted(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError(t({
        key: 'error-submitting-vote',
        defaultValue: 'Failed to submit your vote. Please try again.'
      }));
      setIsSubmitting(false);
    }
  };

  // Share the app
  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: t({
            key: 'share-title',
            defaultValue: 'Vote for your favorite framework!'
          }),
          text: t({
            key: 'share-text',
            defaultValue: 'Join the voting for the best frontend framework!'
          }),
          url: 'https://vote.tolgee.io',
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText('https://vote.tolgee.io');
        alert(t({
          key: 'share-copied',
          defaultValue: 'Link copied to clipboard!'
        }));
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="background-wrapper">
      <div className="example">
        <Navbar />
        <header>
          <img src="/img/appLogo.svg" alt="App Logo" />
          <h1 className="header__title">
            <T keyName="app-title" />
          </h1>
        </header>
        <section className="items">
          <h2 className="question">
            <T keyName="vote-question">
              What is your favorite frontend framework?
            </T>
          </h2>

          {error && <div className="error-message">{error}</div>}

          {!hasVoted ? (
            <form className="voting-form" onSubmit={onVote}>
              <div className="options-list">
                {options.map((option) => (
                  <div key={option.text} className="option">
                    <input
                      type="radio"
                      id={`option-${option.text}`}
                      name="option"
                      value={option.text}
                      checked={selectedOption === option.text}
                      onChange={() => setSelectedOption(option.text)}
                    />
                    <label htmlFor={`option-${option.text}`}>{option.text}</label>
                  </div>
                ))}
              </div>

              <div className="email-input">
                <label htmlFor="email">
                  <T keyName="email-label">
                    Email (optional - for discount code):
                  </T>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t({
                    key: 'email-placeholder',
                    defaultValue: 'your@email.com',
                  })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedOption}
                className="button"
              >
                {isSubmitting ? (
                  <T keyName="submitting-vote">Submitting...</T>
                ) : (
                  <T keyName="submit-vote">Vote</T>
                )}
              </button>
            </form>
          ) : (
            <div className="thank-you">
              <h3>
                <T keyName="thank-you">Thank you for your vote!</T>
              </h3>
              <div className="results">
                <h4>
                  <T keyName="current-results">Current Results:</T>
                </h4>
                {options.map((option) => (
                  <div key={option.text} className="result-item">
                    <div className="result-label">
                      {option.text} ({option.votes} {option.votes === 1 ?
                        t({ key: 'vote-singular', defaultValue: 'vote' }) : 
                        t({ key: 'vote-plural', defaultValue: 'votes' })
                      })
                    </div>
                    <div className="result-bar-container">
                      <div
                        className="result-bar"
                        style={{
                          width: `${totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="items__buttons">
            <button className="button" onClick={onShare}>
              <img src="/img/iconShare.svg" alt="Share" />
              <T keyName="share-button">Share</T>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
