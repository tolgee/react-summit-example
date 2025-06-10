import { T } from '@tolgee/react';
import { useOptions, Option } from './OptionsProvider';

interface VotingItemProps {
  option: Option;
  selected?: boolean;
  onSelect: (option: string) => void;
}

export const VotingItem = ({ option, selected, onSelect }: VotingItemProps) => {
  const { totalVotes, userVote } = useOptions();
  const isUserVote = userVote === option.text;
  const hasVoted = userVote !== null;

  return (
    <div
      className={`option-item ${selected ? 'selected' : ''} ${isUserVote ? 'user-vote' : ''}`}
    >
      <div className="option-row">
        <div className="option-info">
          {!hasVoted && (
            <input
              type="radio"
              id={`option-${option.text}`}
              name="option"
              value={option.text}
              checked={selected}
              onChange={() => onSelect(option.text)}
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
  );
};
