import { Navbar } from "./Navbar";
import { Header } from "./Header";
import { Voting } from "./Voting";
import { OptionsProvider } from "./OptionsProvider";
import { AdminProvider } from "./AdminProvider";
import { AdminArea } from "./AdminArea";

export const Page = () => {
  return (
    <AdminProvider>
      <OptionsProvider>
        <div className="background-wrapper">
          <div className="example">
            <Navbar />
            <Header />
            <Voting />
            <AdminArea />
          </div>
        </div>
      </OptionsProvider>
    </AdminProvider>
  );
};
