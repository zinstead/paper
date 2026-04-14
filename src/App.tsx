import { useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";

const Home = lazy(() => import("@/routes/Home/Home"));
const CardList = lazy(() => import("@/components/CardList"));
const Fep = lazy(() => import("@/routes/Fep"));
const Agent = lazy(() => import("@/routes/Agent"));
const Page = lazy(() => import("@/routes/Page"));
const PerturbationMap = lazy(() => import("@/components/PerturbationMap"));
const StructureViewer = lazy(() => import("@/components/StructureViewer"));

const App = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/card",
      element: <CardList />,
    },
    {
      path: "/map",
      element: <PerturbationMap />,
    },
    {
      path: "/structure",
      element: <StructureViewer />,
    },
    {
      path: "/fep",
      element: <Fep />,
    },
    {
      path: "/agent",
      element: <Agent />,
    },
    {
      path: "/page",
      element: <Page />,
    },
    {
      path: "*",
      element: <div>404</div>,
    },
  ]);
  return <Suspense fallback={<div>loading...</div>}>{routes}</Suspense>;
};

export default App;
