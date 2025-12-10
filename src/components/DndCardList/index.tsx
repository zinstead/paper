import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

const DndCardList = (props: { children: React.ReactNode }) => {
  return <DndProvider backend={HTML5Backend}>{props.children}</DndProvider>;
};

export default DndCardList;
