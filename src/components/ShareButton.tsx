import { T, useTranslate } from '@tolgee/react';

export const ShareButton = () => {
  const { t } = useTranslate();

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
    <button className="button" onClick={onShare} type="button">
      <img src="/img/iconShare.svg" alt="Share" />
      <T keyName="share-button">Share</T>
    </button>
  );
};