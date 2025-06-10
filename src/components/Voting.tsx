import { FormEvent, useState, useEffect } from 'react';
import { T, useTranslate } from '@tolgee/react';
import { useOptions } from './OptionsProvider';
import { VotingItem } from './VotingItem';
import { ShareButton } from './ShareButton';
import { SuccessPopup } from './SuccessPopup';
import { RepoLink } from "./RepoLink.tsx";

export const Voting = () => {
  const { t } = useTranslate();
  const { 
    options, 
    errorFetch, 
    errorSubmit, 
    userVote, 
    submitVote, 
    isSubmitting,
    leaderboard
  } = useOptions();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const hasVoted = userVote !== null || leaderboard;

  // Set initial selected option based on user's previous vote
  useEffect(() => {
    if (userVote) {
      setSelectedOption(userVote);
    }
  }, [userVote]);

  const onVote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedOption) return;

    await submitVote(selectedOption, email);
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  return (
    <section className="items">
      <h2 className="question">
        <T keyName="vote-question">
          Global state: What's your coping mechanism?
        </T>
      </h2>

      {errorFetch && <div className="error-message">{errorFetch}</div>}
      {errorSubmit && <div className="error-message">{errorSubmit}</div>}

      <SuccessPopup show={showSuccessPopup} />

      <div className="options-list">
        {options.map((option) => (
          <VotingItem
            key={option.text}
            option={option}
            selected={!leaderboard && selectedOption === option.text}
            onSelect={setSelectedOption}
          />
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

        </form>
      )}
      <div className="share-button-container">
        <ShareButton />
      </div>
      <RepoLink />
    </section>
  );
};
