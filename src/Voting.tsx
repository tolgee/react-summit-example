import { FormEvent, useState, useEffect } from 'react';
import { T, useTranslate } from '@tolgee/react';
import { QRCodeSVG } from 'qrcode.react';

import { Navbar } from './components/Navbar';

interface Option {
  text: string;
  votes: number;
}

export const Voting = () => {
  const { t } = useTranslate();
  const [totalVotes, setTotalVotes] = useState(0);
  const [options, setOptions] = useState<Option[]>([]);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const hasVoted = userVote !== null;

  useEffect(() => {
    const savedVote = localStorage.getItem('userVote');
    if (savedVote) {
      setUserVote(savedVote);
      setSelectedOption(savedVote);
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

  const onVote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedOption) {
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
          option: selectedOption,
          email: email || undefined,
        }),
      });

      if (!response.ok) {
        handleVoteError(response);
        return;
      }

      localStorage.setItem('userVote', selectedOption);
      setUserVote(selectedOption);
      setIsSubmitting(false);
      setShowSuccessPopup(true);

      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      handleVoteError(error);
    }
  };

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: t({
            key: 'share-title',
            defaultValue: 'Vote for your favorite state management library!',
          }),
          text: t({
            key: 'share-text',
            defaultValue: (
              'Join the voting for the best state management library for React. Pick your favorite and win some swag!'
            ),
          }),
          url: 'https://vote.tolgee.io',
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        await navigator.clipboard.writeText('https://vote.tolgee.io');
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
            <T keyName="app-title">Pick Your Stack – Win Some Swag</T>
          </h1>
          <div className="qr-code">
            <QRCodeSVG value={window.location.href} size={120} />
          </div>
        </header>
        <section className="items">
          <h2 className="question">
            <T keyName="vote-question">
              Global state: What's your coping mechanism?
            </T>
          </h2>

          {errorFetch && <div className="error-message">{errorFetch}</div>}
          {errorSubmit && <div className="error-message">{errorSubmit}</div>}

          {/* Success Popup */}
          {showSuccessPopup && (
            <div className="success-popup">
              <div className="success-popup-content">
                <h3>
                  <T keyName="vote-success">Vote submitted successfully!</T>
                </h3>
                <p>
                  <T keyName="vote-success-message">
                    Thank you for your vote. You can watch the results grow.
                  </T>
                </p>
              </div>
            </div>
          )}

          <div className="options-list">
            {options.map((option) => (
              <div
                key={option.text}
                className={`option-item ${selectedOption === option.text ? 'selected' : ''} ${userVote === option.text ? 'user-vote' : ''}`}
              >
                <div className="option-row">
                  <div className="option-info">
                    {!hasVoted && (
                      <input
                        type="radio"
                        id={`option-${option.text}`}
                        name="option"
                        value={option.text}
                        checked={selectedOption === option.text}
                        onChange={() => setSelectedOption(option.text)}
                      />
                    )}
                    <label htmlFor={`option-${option.text}`}>
                      <T keyName={option.text}>
                        {option.text.replace('option-', '').split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </T>
                    </label>
                  </div>
                  <div className="option-votes">
                    {option.votes}
                  </div>
                </div>
                <div className="option-row">
                  <div className="result-bar-container">
                    <div
                      className="result-bar"
                      style={{
                        width: `${totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!hasVoted && (
            <form className="voting-form" onSubmit={onVote}>
              <div className="email-input">
                <label htmlFor="email">
                  <T keyName="email-label">
                    Email (optional - to participate in the raffle):
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

              <button className="button" onClick={onShare} type="button">
                <img src="/img/iconShare.svg" alt="Share" />
                <T keyName="share-button">Share</T>
              </button>
            </form>
          )}


          <div className="repo-link">
            <a href="https://github.com/tolgee/react-summit-example" target="_blank" rel="noopener noreferrer">
              <T keyName="repo-link">
                  View on GitHub
              </T>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
