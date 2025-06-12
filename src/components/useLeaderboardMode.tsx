import { useState, useEffect } from 'react';

/**
 * A hook that determines if the application is in leaderboard mode
 * based on the URL query parameter.
 * 
 * @returns {boolean} Whether the application is in leaderboard mode
 */
export const useLeaderboardMode = (): boolean => {
  const [leaderboardMode, setLeaderboardMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setLeaderboardMode(Boolean(urlParams.get('leaderboard')));
  }, []);

  return leaderboardMode;
};