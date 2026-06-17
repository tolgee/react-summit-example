import {T, useTranslate} from '@tolgee/react';
import { useOptions, Option } from './OptionsProvider';
import { useLeaderboardMode } from './useLeaderboardMode';
import { useIconEditMode } from './useIconEditMode';
import { useAdmin } from './AdminProvider';

interface VotingItemProps {
  option: Option;
  selected?: boolean;
  onSelect: (option: string) => void;
}

const EMPTY_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>';

const removeInvisibleCharacters = (str: string): string => {
  return str.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202F\uFEFF]/g, '');
};

export const VotingItem = ({ option, selected, onSelect }: VotingItemProps) => {
  const { t } = useTranslate();
  const { totalVotes, userVote } = useOptions();
  const leaderboard = useLeaderboardMode();
  const iconEdit = useIconEditMode();
  const { isAdmin, deleteOption } = useAdmin();
  const isUserVote = !leaderboard && userVote === option.text;
  const hasVoted = userVote !== null || leaderboard;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      t({
        key: 'admin-delete-confirm',
        defaultValue: `Are you sure you want to delete the option "${option.text}"?`
      })
    );

    if (!confirmed) {
      return;
    }

    try {
      const success = await deleteOption(option.text);
      if (!success) {
        alert(
          t({
            key: 'admin-delete-failed',
            defaultValue: 'Failed to delete option'
          })
        );
      }
    } catch (error) {
      console.error('Error deleting option:', error);
      alert(
        t({
          key: 'admin-delete-error',
          defaultValue: 'Error deleting option'
        })
      );
    }
  };

  const punchline = t({
    key: `${option.text}-punchline`,
    defaultValue: '',
  })
  const trimmedPunchline = removeInvisibleCharacters(punchline);
  const noPunchline = trimmedPunchline.length === 0;

  const imgKey = `${option.text}-img`;
  const imgSvg = t({
    key: imgKey,
    defaultValue: '',
    noWrap: true,
  })
  const isEmptyIcon = imgSvg.length === 0;
  const showIconPlaceholder = isEmptyIcon && iconEdit;

  let imgHover = '';
  if (iconEdit) {
    imgHover = t({
      key: imgKey,
      defaultValue: '',
    }).replace(imgSvg, '')
  }

  return (
    <div
      className={`option-item ${selected ? 'selected' : ''} ${isUserVote ? 'user-vote' : ''}`}
      onClick={() => onSelect(option.text)}
    >
      {isAdmin && (
        <button
          className="delete-option-button"
          onClick={handleDelete}
          title={t({
            key: 'admin-delete-option',
            defaultValue: 'Delete option'
          })}
        >
          X
        </button>
      )}
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
            src={`data:image/svg+xml;utf8,${encodeURIComponent(showIconPlaceholder ? EMPTY_ICON_SVG : imgSvg)}`}
            alt={option.text + imgHover}
            className={`option-icon ${isEmptyIcon && !iconEdit ? 'no-icon' : ''} ${showIconPlaceholder ? 'icon-edit-placeholder' : ''}`}
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
