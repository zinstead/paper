import CompoundCard from "./components/CompoundCard";
import { SMILES_LIST } from "./utils/smiles";
import DndCardList from "./components/DndCardList";
import CardList from "./components/CardList";
import "./App.css";

const App = () => {
  return (
    <div className="container">
      <DndCardList>
        <CardList />
      </DndCardList>
    </div>
  );
};

export default App;
