import { Navbar } from './Navbar';
import { Header } from './Header';
import { Voting } from './Voting';
import { OptionsProvider } from './OptionsProvider';

export const Page = () => {
  return (
    <OptionsProvider>
      <div className="background-wrapper">
        <div className="example">
          <Navbar />
          <Header />
          <Voting />
        </div>
      </div>
    </OptionsProvider>
  );
};