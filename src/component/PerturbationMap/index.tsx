import { useEffect, useRef, useState } from "react";
import { Cell, Graph } from "@antv/x6";
import type { Node, NodeProperties, Edge, EdgeProperties } from "@antv/x6";
import { register } from "@antv/x6-react-shape";
import dagre from "dagre";
import "./index.css";
import CompoundCard from "../CompoundCard";
import { isEmpty, throttle } from "lodash";
import { mapData } from "../../constant";
import { getBackground, getTextColor } from "../../utils";
import { applyForceLayout } from "./layout";
import { Form, Select } from "@arco-design/web-react";
import useForm from "@arco-design/web-react/es/Form/useForm";

register({
  shape: "custom-node",
  component: renderNode,
});

function buildDagreLayout(
  graph: Graph,
  nodes: { id: string }[],
  edges: { source: string; target: string }[],
  width: number,
  height: number
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({});
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => {
    dagreGraph.setNode(n.id, { width, height });
  });

  edges.forEach((e) => {
    dagreGraph.setEdge(e.source, e.target);
  });

  dagre.layout(dagreGraph);

  dagreGraph.nodes().forEach((id) => {
    const node = graph.getCellById(id);
    const pos = dagreGraph.node(id);
    if (node?.isNode()) {
      node.position(pos.x - pos.width / 2, pos.y - pos.height / 2);
    }
  });

  graph.centerContent();
}

function renderNode({ node }: { node: Node<NodeProperties> }) {
  const {
    dim = false,
    visible = true,
    id,
    structure,
    properties,
  } = node.getData() || {};

  const renderPropertyList = (
    properties: { key: string; value: any; type: string }[]
  ) => {
    return (
      <div>
        {properties?.map(({ key, value }) => {
          const background = getBackground({
            value,
            min: 0,
            max: 99,
            linear: true,
            inverted: false,
          });
          const color = getTextColor(background);
          return (
            <div
              key={key}
              style={{
                padding: "0 5px",
                display: "flex",
                justifyContent: "space-between",
                background,
                color,
              }}
            >
              <span>{key}</span>
              <span>{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        opacity: dim ? 0.1 : 1,
      }}
    >
      <CompoundCard
        id={id}
        header={<div>{id}</div>}
        footer={renderPropertyList(properties)}
        structure={structure}
        width={198}
        height={200}
        svgMode
        visible={visible}
      />
    </div>
  );
}

const setNodeVisible = throttle((graph: Graph, ratio: number) => {
  const visible = ratio >= 0.8;
  graph.getNodes().forEach((n) => {
    const data = n.getData();
    n.setData({ ...data, visible });
  });
});

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
      e.attr("line/opacity", 0.1);
    } else {
      e.attr("line/stroke", "blue");
    }
  });

  requestAnimationFrame(() => {
    graph.getEdges().forEach((e) => {
      if (!highlightEdges.has(e.id)) {
        setEdgeLabelsOpacity(e, 0.1);
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

const labelLineHeight = 21;
const width = 200;
const height = 200 + labelLineHeight * 5 + 20 + 2;

export default function Example() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [myGraph, setMyGraph] = useState<Graph>();
  const [data, setData] = useState<typeof mapData>();
  const nodeIds = data?.nodes.map((item) => item.id);
  const edgeIds = data?.edges.map(
    ({ source, target }) => `${source}-${target}`
  );
  const [form] = useForm();
  const selectedNodes = Form.useWatch("selectedNodes", form);
  const selectedEdge = Form.useWatch("selectedEdge", form);
  const [selectNodesDisabled, setSelectNodesDisabled] = useState(false);
  const [selectEdgeDisabled, setSelectEdgeDisabled] = useState(false);

  useEffect(() => {
    if (!containerRef) return;
    const graph = new Graph({
      container: containerRef.current!,
      width: 1600,
      height: 800,
      // 设置画布背景颜色
      background: {
        color: "#F2F7FA",
      },
      panning: true,
      mousewheel: true,
    });
    setMyGraph(graph);

    // 悬浮时高亮节点以及一阶邻域
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

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(mapData);
        }); // 假设 mapData 是你想要的数据
      }).then((result) => {
        setData(result as typeof mapData);
      });
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!myGraph || !data) return;

    const { nodes, edges } = data;
    // 添加节点
    nodes.forEach((n) => {
      myGraph.addNode({
        id: n.id,
        shape: "custom-node",
        width,
        height,
        data: n,
      });
    });

    // 添加边
    edges.forEach((e) => {
      myGraph.addEdge({
        source: e.source,
        target: e.target,
        labels: e.labels.map(({ key, value }, index) => {
          const background = getBackground({
            value,
            min: 0,
            max: 99,
            linear: true,
            inverted: false,
          });
          const color = getTextColor(background);
          return {
            position: {
              distance: 0.5, // 沿边的中点
              offset: {
                x: 0,
                y: index * labelLineHeight, // 控制“多行”
              },
            },
            markup: [
              { tagName: "rect", selector: "bg" },
              { tagName: "text", selector: "text" },
            ],
            attrs: {
              bg: {
                ref: "text",
                fill: background,
                stroke: "#ccc",
              },
              text: {
                text: `${key} = ${value}`,
                fill: color,
                fontSize: 12,
              },
            },
          };
        }),
        zIndex: -1,
        connectionPoint: "boundary",
      });
    });

    // 应用力导向布局
    const forceNodes = nodes.map((n) => ({
      id: n.id,
      width,
      height,
    }));

    const forceEdges = edges.map((e) => ({
      source: e.source,
      target: e.target,
      distance: 200, // 可根据能量差映射
    }));

    // 应用力导向布局
    applyForceLayout(
      myGraph,
      {
        nodes: forceNodes,
        edges: forceEdges,
      },
      {
        width: 1600,
        height: 800,
      }
    );
  }, [myGraph, data]);

  useEffect(() => {
    if (!myGraph || !data) return;

    if (isEmpty(selectedNodes)) {
      myGraph.getNodes().forEach((n) => {
        n.show();
        n.setData({ dim: false });
      });
      myGraph.getEdges().forEach((e) => e.show());
      return;
    }

    const set = new Set(selectedNodes);

    myGraph.getNodes().forEach((n) => {
      if (set.has(n.id)) {
        n.show();
        n.setData({ dim: false });
      } else {
        n.hide();
      }
    });

    myGraph.getEdges().forEach((e) => e.hide());

    // 重新布局
    const nodes = data.nodes.filter((n) => set.has(n.id));
    const edges = data.edges.filter(
      (e) => set.has(e.source) || set.has(e.target)
    );
    const forceNodes = nodes.map((n) => ({
      id: n.id,
      width,
      height,
    }));

    const forceEdges = edges.map((e) => ({
      source: e.source,
      target: e.target,
      distance: 200, // 可根据能量差映射
    }));

    // 应用力导向布局
    requestAnimationFrame(() => {
      applyForceLayout(
        myGraph,
        {
          nodes: forceNodes,
          edges: forceEdges,
        },
        {
          width: 1600,
          height: 800,
        }
      );
    });
  }, [myGraph, selectedNodes]);

  return (
    <div style={{ padding: 30 }}>
      <Form form={form}>
        <div
          style={{
            width: "50%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Form.Item label="Nodes" field={"selectedNodes"}>
            <Select options={nodeIds} mode="multiple"></Select>
          </Form.Item>
          <Form.Item label="Edge" field={"selectedEdge"}>
            <Select options={edgeIds}></Select>
          </Form.Item>
        </div>
      </Form>
      <div ref={containerRef} />
    </div>
  );
}
