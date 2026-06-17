import { useState, useEffect } from 'react';

/**
 * A hook that determines if voting-option icons are in-context editable
 * based on the 'iconEdit' URL query parameter.
 *
 * @returns {boolean} Whether icon edit mode is enabled
 */
export const useIconEditMode = (): boolean => {
  const [iconEditMode, setIconEditMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIconEditMode(urlParams.get('iconEdit') === 'true');
  }, []);

  return iconEditMode;
};
