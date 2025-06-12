import { useState, useEffect } from 'react';

/**
 * A hook that reads the 'rotate' query parameter from the URL
 * and returns it as a number or undefined.
 * 
 * @returns {number | undefined} The rotate value in seconds, or undefined if not set
 */
export const useRotate = (): number | undefined => {
  const [rotate, setRotate] = useState<number | undefined>(undefined);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rotateParam = urlParams.get('rotate');
    setRotate(rotateParam ? Number(rotateParam) : undefined);
  }, []);

  return rotate;
};