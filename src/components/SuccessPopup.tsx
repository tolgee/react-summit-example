import { T } from '@tolgee/react';

interface SuccessPopupProps {
  show: boolean;
}

export const SuccessPopup = ({ show }: SuccessPopupProps) => {
  if (!show) return null;

  return (
    <div className="success-popup">
      <div className="success-popup-content">
        <h3>
          <T keyName="vote-success">Vote submitted successfully!</T>
        </h3>
        <p>
          <T keyName="vote-success-message">
            Your vote's in! Sit back, watch the graphs do their thing, and have a great time at React Summit 2025!
          </T>
        </p>
      </div>
    </div>
  );
};