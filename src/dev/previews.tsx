import {ComponentPreview, Previews} from "@react-buddy/ide-toolbox";
import {PaletteTree} from "./palette";
import {Navbar} from "../components/Navbar.tsx";
import {Voting} from "../components/Voting.tsx";
import {LoadingScreen} from "../components/LoadingScreen.tsx";
import {VotingItem} from "../components/VotingItem.tsx";
import {SuccessPopup} from "../components/SuccessPopup.tsx";
import {LangSelector} from "../components/LangSelector.tsx";
import {Header} from "../components/Header.tsx";
import {QRCode} from "../components/QRCode.tsx";
import {ShareButton} from "../components/ShareButton.tsx";
import {LocalLoadingComponent} from "../components/LocalLoadingComponent.tsx";

const ComponentPreviews = () => {
  return (
      <Previews palette={<PaletteTree/>}>
        <ComponentPreview path="/Navbar">
          <Navbar/>
        </ComponentPreview>
        <ComponentPreview path="/Voting">
            <Voting/>
        </ComponentPreview>
        <ComponentPreview path="/LoadingScreen">
          <LoadingScreen/>
        </ComponentPreview>
        <ComponentPreview path="/VotingItem">
            <VotingItem
              onSelect={() => {}}
              selected={false}
              option={{ text: 'option-1', votes: 10 }}
            />
        </ComponentPreview>
        <ComponentPreview path="/SuccessPopup">
          <SuccessPopup show />
        </ComponentPreview>
        <ComponentPreview path="/LangSelector">
          <LangSelector/>
        </ComponentPreview>
        <ComponentPreview path="/Header">
          <Header/>
        </ComponentPreview>
        <ComponentPreview path="/QRCode">
          <QRCode/>
        </ComponentPreview>
        <ComponentPreview path="/ShareButton">
          <ShareButton/>
        </ComponentPreview>
        <ComponentPreview path="/LocalLoadingComponent">
          <LocalLoadingComponent/>
        </ComponentPreview>
      </Previews>
  );
};

export default ComponentPreviews;