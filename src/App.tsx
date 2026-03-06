import { useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";
import CardList from "./components/CardList";

const Home = lazy(() => import("@/routes/Home/Home"));
const Fep = lazy(() => import("@/routes/Fep/Fep"));
const PerturbationMap = lazy(() => import("@/components/PerturbationMap"));

const App = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "card",
      element: <CardList />,
    },
    {
      path: "map",
      element: <PerturbationMap />,
    },
    {
      path: "/fep",
      element: <Fep />,
    },
    {
      path: "*",
      element: <div>404</div>,
    },
  ]);
  return <Suspense fallback={<div>loading...</div>}>{routes}</Suspense>;
};

export default App;
