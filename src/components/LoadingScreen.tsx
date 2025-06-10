import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="background-wrapper">
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    </div>
  );
};