import ConfettiExplosion from "react-confetti-explosion";
import { useOptions } from "./OptionsProvider";

export const Explosions = () => {
  const { explosions, removeExplosion } = useOptions();

  return (
    <div style={{width: 0}}>
      {explosions.map((eId) => (
        <ConfettiExplosion key={eId} onComplete={() => removeExplosion(eId)} />
      ))}
    </div>
  );
};
