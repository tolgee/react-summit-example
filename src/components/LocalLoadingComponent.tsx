import React from 'react';
import { T } from '@tolgee/react';

export const LocalLoadingComponent: React.FC = () => {
  return (
    <div className="local-loading">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">
          <T keyName="loading-options">Loading options...</T>
        </div>
      </div>
    </div>
  );
};