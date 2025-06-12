import { Navbar } from "./Navbar";
import { Header } from "./Header";
import { Voting } from "./Voting";
import { OptionsProvider } from "./OptionsProvider";
import { Language } from "./useLanguages";

type Props = {
  languages: Language[] | undefined;
};

export const Page = ({ languages }: Props) => {
  return (
    <OptionsProvider languages={languages}>
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
