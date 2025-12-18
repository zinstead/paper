import { Graph } from "@dp/xgraph";
import { useEffect } from "react";

const PerturbationMap = () => {
  const data = {
    nodes: [
      {
        id: "Hello",
        x: 100,
        y: 100,
      },
      {
        id: "World",
        x: 300,
        y: 100,
      },
    ],
    edges: [
      {
        source: "Hello",
        target: "World",
      },
    ],
  };

  useEffect(() => {
    const graph = new Graph({
      // 指定图容器
      container: "graphContainer",
      // 指定图尺寸
      width: 400,
      height: 300,
      // 配置节点样式
      setDefaultNode(nodeData) {
        return {
          label: nodeData.id,
          width: 100,
          height: 40,
        };
      },
    });

    graph.data(data);

    return () => {
      graph.destroy();
    };
  }, []);

  return (
    <div>
      <div id="graphContainer"></div>
    </div>
  );
};

export default PerturbationMap;
