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
            Thank you for your vote. You can watch the results grow.
          </T>
        </p>
      </div>
    </div>
  );
};