import { T } from "@tolgee/react";
import { Explosions } from "./Explosions";

export const Header = () => {
  return (
    <header>
      <div className="header__logo">
        <img src="/img/appLogo.svg" alt="App Logo" />
        <Explosions />
      </div>
      <h1 className="header__title">
        <T keyName="app-title">Pick Your Stack – Win Some Swag</T>
      </h1>
    </header>
  );
};
