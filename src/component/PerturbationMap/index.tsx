import { useEffect, useRef, useState } from "react";
import { Cell, Graph, MiniMap, Scroller } from "@antv/x6";
import type { Node, NodeProperties, Edge, EdgeProperties } from "@antv/x6";
import { register } from "@antv/x6-react-shape";
import dagre from "dagre";
import "./index.css";
import CompoundCard from "../CompoundCard";
import { v4 as uuid } from "uuid";
import { throttle } from "lodash";

function setEdgeLabelsOpacity(edge: Edge<EdgeProperties>, opacity: number) {
  edge.setLabels(
    edge.getLabels().map((label) => ({
      ...label,
      attrs: {
        ...label.attrs,
        bg: {
          ...label.attrs?.bg,
          opacity,
        },
        text: {
          ...label.attrs?.text,
          opacity,
        },
      },
    }))
  );
}

function highlightRelated(node: Cell, graph: Graph) {
  const neighbors = graph.getNeighbors(node);
  const edges = graph.getConnectedEdges(node);

  const highlightNodes = new Set([node.id, ...neighbors.map((n) => n.id)]);
  const highlightEdges = new Set(edges.map((e) => e.id));

  graph.getNodes().forEach((n) => {
    if (!highlightNodes.has(n.id)) {
      n.setData({ dim: true });
    }
  });

  graph.getEdges().forEach((e) => {
    if (!highlightEdges.has(e.id)) {
      e.attr("line/opacity", 0.2);
    } else {
      e.attr("line/stroke", "blue");
    }
  });

  requestAnimationFrame(() => {
    graph.getEdges().forEach((e) => {
      if (!highlightEdges.has(e.id)) {
        setEdgeLabelsOpacity(e, 0.2);
      }
    });
  });
}

function resetHighlight(graph: Graph) {
  graph.getNodes().forEach((n) => {
    n.setData({ dim: false });
  });

  graph.getEdges().forEach((e) => {
    e.attr("line/opacity", 1);
    e.attr("line/stroke", "black");
  });

  requestAnimationFrame(() => {
    graph.getEdges().forEach((e) => {
      setEdgeLabelsOpacity(e, 1);
    });
  });
}

function renderNode({ node }: { node: Node<NodeProperties> }) {
  const { dim, visible } = node.getData() || {};
  return (
    <div
      style={{
        opacity: dim ? 0.2 : 1,
        background: "white",
      }}
    >
      <CompoundCard
        id={uuid()}
        header={<div>id</div>}
        footer={<div>property</div>}
        structure="C[C@H](CCCC(C)(C)O)[C@@]1([H])CC[C@@]2([H])C(CCC[C@]12C)=CC=C1C[C@@H](O)CCC1=C"
        width={200}
        height={200}
        svgMode={false}
        visible={visible}
      />
    </div>
  );
}

const setNodeVisible = throttle((graph: Graph, ratio: number) => {
  const visible = ratio >= 1;
  graph.getNodes().forEach((n) => {
    const data = n.getData();
    n.setData({ ...data, visible });
  });
});

register({
  shape: "custom-node",
  width: 200,
  height: 200,
  component: renderNode,
});

export default function Example() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<Graph>();

  useEffect(() => {
    if (!containerRef) return;
    const graph = new Graph({
      container: containerRef.current!,
      width: 1000,
      height: 800,
      // 设置画布背景颜色
      background: {
        color: "#F2F7FA",
      },
      // panning: true,
      mousewheel: true,
    });
    setGraph(graph);

    // 节点数据
    const nodesData = [
      { id: "a", label: "节点A" },
      { id: "b", label: "节点B" },
      { id: "c", label: "节点C" },
      { id: "d", label: "节点D" },
    ];

    const edgesData = [
      { source: "a", target: "b" },
      { source: "a", target: "c" },
      { source: "b", target: "d" },
      { source: "c", target: "d" },
    ];

    // 添加节点
    nodesData.forEach((n) => {
      graph.addNode({
        id: n.id,
        shape: "custom-node",
      });
    });

    const labelsData = [
      { text: "ΔG = -3.2", bg: "#e6f7ff" },
      { text: "RMSD = 1.4", bg: "#fff7e6" },
      { text: "State: stable", bg: "#f6ffed" },
    ];

    // 添加边
    edgesData.forEach((e) => {
      graph.addEdge({
        source: e.source,
        target: e.target,
        labels: labelsData.map((item, index) => ({
          position: {
            distance: 0.5, // 沿边的中点
            offset: {
              x: 0,
              y: index * 16, // 控制“多行”
            },
          },
          markup: [
            { tagName: "rect", selector: "bg" },
            { tagName: "text", selector: "text" },
          ],
          attrs: {
            bg: {
              ref: "text",
              fill: item.bg,
              stroke: "#ccc",
            },
            text: {
              text: item.text,
              fill: "#333",
              fontSize: 12,
            },
          },
        })),
      });
    });

    // 自动布局（Dagre）
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setGraph({});
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    nodesData.forEach((n) => {
      dagreGraph.setNode(n.id, { width: 200, height: 200 });
    });
    edgesData.forEach((e) => {
      dagreGraph.setEdge(e.source, e.target);
    });

    dagre.layout(dagreGraph);

    dagreGraph.nodes().forEach((id) => {
      const node = graph.getCellById(id);
      const pos = dagreGraph.node(id);
      if (node.isNode()) {
        node.position(pos.x - pos.width / 2, pos.y - pos.height / 2);
      }
    });

    graph.centerContent();

    graph.on("node:mouseenter", ({ node }) => {
      highlightRelated(node, graph);
    });

    graph.on("node:mouseleave", () => {
      resetHighlight(graph);
    });

    let edgesHidden = false;

    const hideEdges = () => {
      if (edgesHidden) return;
      edgesHidden = true;
      graph.getEdges().forEach((edge) => edge.hide());
    };

    const showEdges = () => {
      if (!edgesHidden) return;
      edgesHidden = false;
      graph.getEdges().forEach((edge) => edge.show());
    };

    // 开始平移
    graph.on("blank:mousedown", () => {
      hideEdges();
    });

    // 平移过程中（可选）
    graph.on("blank:mousemove", () => {
      hideEdges();
    });

    // 平移结束
    graph.on("blank:mouseup", () => {
      showEdges();
    });

    // 兜底：鼠标移出画布
    graph.on("blank:mouseleave", () => {
      showEdges();
    });

    // 缩放时判断是否渲染smiles结构
    graph.on("scale", (args) => {
      setNodeVisible(graph, args.sx);
    });

    return () => {
      graph.dispose();
    };
  }, []);

  return <div ref={containerRef} />;
}
