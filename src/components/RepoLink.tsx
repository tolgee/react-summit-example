import { T } from '@tolgee/react';

export const RepoLink = () => {
  return (
    <div className="repo-link">
      <a href="https://github.com/tolgee/react-summit-example" target="_blank" rel="noopener noreferrer">
        <T keyName="repo-link">
            View on GitHub
        </T>
      </a>
    </div>
  );
};