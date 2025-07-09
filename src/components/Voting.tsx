import { FormEvent, useState, useEffect } from "react";
import { T, useTranslate } from "@tolgee/react";
import { useOptions } from "./OptionsProvider";
import { VotingItem } from "./VotingItem";
import { ShareButton } from "./ShareButton";
import { SuccessPopup } from "./SuccessPopup";
import { RepoLink } from "./RepoLink.tsx";
import { LocalLoadingComponent } from "./LocalLoadingComponent";
import { VoteButton } from "./VoteButton.tsx";
import { useLeaderboardMode } from "./useLeaderboardMode";

export const Voting = () => {
  const { t } = useTranslate();
  const {
    options,
    errorFetch,
    errorSubmit,
    userVote,
    submitVote,
    isSubmitting,
    isLive,
    hasVoted,
  } = useOptions();
  const leaderboard = useLeaderboardMode();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [enterRaffle, setEnterRaffle] = useState(true);

  // Set initial selected option based on user's previous vote
  useEffect(() => {
    if (userVote) {
      setSelectedOption(userVote);
    }
  }, [userVote]);

  const onVote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedOption) return;

    // Only include email and name if enterRaffle is checked
    const emailToSubmit = enterRaffle ? email : undefined;
    const nameToSubmit = enterRaffle ? name : undefined;

    if (await submitVote(selectedOption, emailToSubmit, nameToSubmit)) {
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    }
  };

  return (
    <section className="items">
      {!isLive && <div className="connection-status" />}
      {isLive && (
        <div className="connection-status connection-status--reconnected" />
      )}
      <h2 className="question">
        <T keyName="vote-question">
          Which one is the best?
        </T>
      </h2>
      <div className="question-subtitle">
        <T keyName="vote-question-subtitle">
          Cast your vote and win a prize!
        </T>
      </div>

      {errorFetch && <div className="error-message">{errorFetch}</div>}
      {errorSubmit && <div className="error-message">{errorSubmit}</div>}

      <SuccessPopup show={showSuccessPopup} />

      {options === null && !errorFetch ? (
        <LocalLoadingComponent />
      ) : (
        <div className="options-list">
          {options?.map((option) => (
            <VotingItem
              key={option.text}
              option={option}
              selected={!leaderboard && selectedOption === option.text}
              onSelect={setSelectedOption}
            />
          ))}
        </div>
      )}

      {!hasVoted ? (
        <form className="voting-form" onSubmit={onVote}>
          <div className="raffle-checkbox">
            <input
              type="checkbox"
              id="enterRaffle"
              checked={enterRaffle}
              onChange={(e) => setEnterRaffle(e.target.checked)}
            />
            <label htmlFor="enterRaffle">
              <T keyName="enter-raffle-label">I want to enter raffle</T>
            </label>
          </div>

          {enterRaffle && (
            <div className="inputs-container">
              <div className="input-field">
                <label htmlFor="email">
                  <T keyName="email-label">Email</T>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t({
                    key: "email-placeholder",
                    defaultValue: "your@email.com",
                  })}
                />
              </div>
              <div className="input-field">
                <label htmlFor="name">
                  <T keyName="name-label">Name</T>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t({
                    key: "name-placeholder",
                    defaultValue: "Your name",
                  })}
                />
              </div>
            </div>
          )}

          <div className="buttons-container">
            <div className="button-wrapper">
              <VoteButton
                isSubmitting={isSubmitting}
                disabled={!selectedOption}
              />
            </div>
            <div className="button-wrapper">
              <ShareButton />
            </div>
          </div>
        </form>
      ) : !leaderboard && (
        <div className="share-button-container">
          <ShareButton />
        </div>
      )}
      {!leaderboard && <RepoLink />}
    </section>
  );
};