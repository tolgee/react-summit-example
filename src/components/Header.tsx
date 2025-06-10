import { T } from '@tolgee/react';
import { QRCode } from './QRCode';

export const Header = () => {
  return (
    <header>
      <img src="/img/appLogo.svg" alt="App Logo" />
      <h1 className="header__title">
        <T keyName="app-title">Pick Your Stack – Win Some Swag</T>
      </h1>
      <QRCode />
    </header>
  );
};