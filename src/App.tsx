import { useRoutes } from "react-router-dom";
import DndWrapper from "./component/DndWrapper";
import CardList from "./component/CardList";
import EditorModal from "./component/EditorModal";

const App = () => {
  const routes = useRoutes([
    {
      path: "/card",
      element: (
        <div style={{ margin: 20 }}>
          <DndWrapper>
            <CardList />
          </DndWrapper>
          <EditorModal />
        </div>
      ),
    },
    {
      path: "/graph",
      element: <div>graph</div>,
    },
    {
      path: "*",
      element: <div>404</div>,
    },
  ]);
  return <>{routes}</>;
};

export default App;
