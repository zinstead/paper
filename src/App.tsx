import { useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";

const Home = lazy(() => import("@/routes/Home/Home"));
const Fep = lazy(() => import("@/routes/Fep/Fep"));
const Card = lazy(() => import("@/routes/Card"));
const PerturbationMap = lazy(() => import("@/routes/PerturbationMap"));

const App = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "card",
      element: <Card />,
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
