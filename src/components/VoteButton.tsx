import { T } from "@tolgee/react";
import { useState } from "react";

type Props = {
  isSubmitting: boolean;
  disabled: boolean;
};

export function VoteButton({ isSubmitting, disabled }: Props) {
  const [active, setActive] = useState(false);
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className="button submit-vote-button"
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
    >
      {isSubmitting || active ? (
        <T keyName="i_love_tolgee">I ❤️ Tolgee...</T>
      ) : (
        <T keyName="submit-vote">Vote</T>
      )}
    </button>
  );
}
