import {T, useTranslate} from '@tolgee/react';
import { useOptions, Option } from './OptionsProvider';

interface VotingItemProps {
  option: Option;
  selected?: boolean;
  onSelect: (option: string) => void;
}

const removeInvisibleCharacters = (str: string): string => {
  return str.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202F\uFEFF]/g, '');
};

export const VotingItem = ({ option, selected, onSelect }: VotingItemProps) => {
  const { t } = useTranslate();
  const { totalVotes, userVote, leaderboard } = useOptions();
  const isUserVote = !leaderboard && userVote === option.text;
  const hasVoted = userVote !== null || leaderboard;

  const punchline = t({
    key: `${option.text}-punchline`,
    defaultValue: '',
  })
  const trimmedPunchline = removeInvisibleCharacters(punchline);
  const noPunchline = trimmedPunchline.length === 0;

  return (
    <div
      className={`option-item ${selected ? 'selected' : ''} ${isUserVote ? 'user-vote' : ''}`}
      onClick={() => onSelect(option.text)}
    >
      <div className="option-row">
        <div className="option-info">
          {!hasVoted && (
            <input
              type="radio"
              id={`option-${option.text}`}
              className="option-radio"
              name="option"
              value={option.text}
              checked={selected}
              onChange={() => onSelect(option.text)}
            />
          )}
          <img
            src={`/img/${option.text}.svg`}
            alt={option.text}
            className="option-icon"
          />
          <label htmlFor={`option-${option.text}`} className="option-label">
            <span className="option-name">
              <T keyName={`${option.text}-name`}>
                {option.text.replace('option-', '').split('-').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </T>
            </span>
            <span className={noPunchline ? 'option-no-punchline' : 'option-punchline'}>
              {punchline}
            </span>
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
              width: `${totalVotes ?? 0 > 0 ? (option.votes / (totalVotes ?? 1)) * 100 : 0}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
