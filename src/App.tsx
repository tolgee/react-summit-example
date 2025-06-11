import { Title } from "./Title.tsx";
import { Page } from './components/Page';
import { QRCode } from './components/QRCode';

export const App = () => {
  return (
    <>
      <div className="background-confetti"></div>
      <div className="app-mouse-dev"></div>
      <QRCode />
      <Title />
      <Page />
    </>
  );
};
