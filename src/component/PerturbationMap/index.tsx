import { useEffect, useRef, useState } from "react";
import { Cell, Graph } from "@antv/x6";
import type { Node, NodeProperties, Edge, EdgeProperties } from "@antv/x6";
import { register } from "@antv/x6-react-shape";
import "./index.css";
import CompoundCard from "../CompoundCard";
import { isEmpty, isNil, throttle } from "lodash";
import { mapData } from "../../constant";
import { getBackground, getTextColor } from "../../utils";
import { applyForceLayout } from "./layout";
import { Form, Select, Switch } from "@arco-design/web-react";
import { useRequest } from "ahooks";
import type {
  PerturbationData,
  PerturbationEdge,
  PerturbationNode,
  Property,
} from "@/type";
import useForm from "@arco-design/web-react/es/Form/useForm";

register({
  shape: "custom-node",
  component: renderNode,
});

function renderNode({ node }: { node: Node<NodeProperties> }) {
  const {
    dim = false,
    visible = true,
    id,
    structure,
    properties,
  } = node.getData() || {};
  console.log(properties);

  const renderPropertyList = (properties: Property[]) => {
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

function getEdgeLabels(properties: Property[], labelLineHeight: number) {
  return properties.map(({ key, value }, index) => {
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
  });
}

const canvasWidth = 1600,
  canvasHeight = 800;
const labelLineHeight = 21;
const width = 200;
function getNodeHeight(labelCount: number) {
  return 200 + labelLineHeight * labelCount + 20 + 2;
}
const distance = 200;

export default function Example() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<Graph>();
  const [form] = useForm();

  const selectedNodes = Form.useWatch("selectedNodes", form) as string[];
  const selectedEdge = Form.useWatch("selectedEdge", form) as string;
  const hasNeighbour = Form.useWatch("hasNeighbour", form) as boolean;
  const selectedNodesDisabled = !isEmpty(selectedEdge);
  const selectedEdgeDisabled = !isEmpty(selectedNodes);
  const hasSearchCondition = selectedNodesDisabled || selectedEdgeDisabled;

  const { data } = useRequest(async () => {
    const res = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(mapData);
        const { initNodeProperties, initEdgeProperties } = mapData;
        form.setFieldsValue({
          nodeProperties: initNodeProperties,
          edgeProperties: initEdgeProperties,
        });
      }); // 假设 mapData 是你想要的数据
    });
    return res as typeof mapData | undefined;
  });
  const nodeIds = data?.nodes.map((item) => item.id);
  const edgeIds = data?.edges.map(
    ({ source, target }) => `${source}-${target}`
  );

  const nodeProperties = Form.useWatch("nodeProperties", form) as string[];
  const edgeProperties = Form.useWatch("edgeProperties", form) as string[];

  useEffect(() => {
    if (!containerRef) return;
    const graph = new Graph({
      container: containerRef.current!,
      width: canvasWidth,
      height: canvasHeight,
      // 设置画布背景颜色
      background: {
        color: "#F2F7FA",
      },
      panning: true,
      mousewheel: true,
    });
    setGraph(graph);

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
      graph
        .getEdges()
        .filter((edge) => edge.getData()?.display !== false)
        .forEach((edge) => edge.hide());
    };

    const showEdges = () => {
      if (!edgesHidden) return;
      edgesHidden = false;
      graph
        .getEdges()
        .filter((edge) => edge.getData()?.display !== false)
        .forEach((edge) => edge.show());
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
    if (!graph || !data) return;

    const { nodes, edges } = data;
    const height = getNodeHeight(nodeProperties.length);

    // 添加节点
    nodes.forEach((n) => {
      graph.addNode({
        id: n.id,
        shape: "custom-node",
        width,
        height,
        data: n,
      });
    });

    // 添加边
    edges.forEach((e) => {
      graph.addEdge({
        source: e.source,
        target: e.target,
        labels: getEdgeLabels(e.properties, labelLineHeight),
        zIndex: -1,
        connectionPoint: "boundary",
      });
    });

    requestLayout(graph, data);
  }, [graph, data]);

  useEffect(() => {
    if (!graph || !data) return;
    if (!hasSearchCondition) resetGraph();
    if (isEmpty(selectedNodes)) return;

    const set = new Set(selectedNodes);
    if (hasNeighbour) {
      selectedNodes.forEach((id) => {
        const node = graph.getCellById(id);
        graph.getNeighbors(node).forEach((cell) => set.add(cell.id));
      });
    }

    graph.getNodes().forEach((n) => {
      if (set.has(n.id)) {
        n.show();
      } else {
        n.hide();
      }
    });

    graph.getEdges().forEach((e) => {
      if (set.has(e.source as any) && set.has(e.target as any)) {
        const data = e.getData();
        e.setData({ ...data, display: true });
      } else {
        e.setData({ ...data, display: false });
      }
    });

    // 重新布局
    const nodes = data.nodes.filter((n) => set.has(n.id));
    const edges = data.edges.filter(
      (e) => set.has(e.source) && set.has(e.target)
    );
    requestLayout(graph, { nodes, edges });
  }, [graph, data, selectedNodes, hasNeighbour]);

  useEffect(() => {
    if (!graph || !data) return;
    if (!hasSearchCondition) resetGraph();
    if (isEmpty(selectedEdge)) return;

    const [source, target] = selectedEdge.split("-");
    graph.getNodes().forEach((n) => {
      if (n.id === source || n.id === target) {
        n.show();
      } else {
        n.hide();
      }
    });

    graph.getEdges().forEach((e) => {
      const id = `${e.source}-${e.target}`;
      if (id === selectedEdge) {
        const data = e.getData();
        e.setData({ ...data, display: true });
      } else {
        e.setData({ ...data, display: false });
      }
    });

    // 重新布局
    const nodes = data.nodes.filter((n) => n.id === source || n.id === target);
    const edges = data.edges.filter(
      (e) => `${e.source}-${e.target}` === selectedEdge
    );
    requestLayout(graph, { nodes, edges });
  }, [graph, data, selectedEdge, hasNeighbour]);

  useEffect(() => {
    if (!graph || !data) return;
    const nodePropertiesSet = new Set(nodeProperties);
    graph.getNodes().forEach((n) => {
      const properties = n.getData().properties as Property[];
      n.setData({
        properties: properties.filter((p) => nodePropertiesSet.has(p.key)),
      });
    });
  }, [graph, data, nodeProperties]);

  useEffect(() => {
    if (!graph || !data) return;
    const edgePropertiesSet = new Set(edgeProperties);
    graph.getEdges().forEach((e) => {
      const allProperties =
        data.edges.find(
          (edge) =>
            edge.source === (e.source as any) &&
            edge.target === (e.target as any)
        )?.properties ?? [];
      const properties = allProperties.filter((p) =>
        edgePropertiesSet.has(p.key)
      );
      const labels = getEdgeLabels(properties, labelLineHeight);
      e.setLabels(labels);
    });
  }, [graph, data, edgeProperties]);

  const requestLayout = (
    graph: Graph,
    data: {
      nodes: PerturbationNode[];
      edges: PerturbationEdge[];
    }
  ) => {
    const { nodes, edges } = data;
    const height = getNodeHeight(nodeProperties.length);
    // 应用力导向布局
    const forceNodes = nodes.map((n) => ({
      id: n.id,
      width,
      height,
    }));

    const forceEdges = edges.map((e) => ({
      source: e.source,
      target: e.target,
      distance, // 可根据能量差映射
    }));

    applyForceLayout(
      graph,
      {
        nodes: forceNodes,
        edges: forceEdges,
      },
      {
        width: canvasWidth,
        height: canvasHeight,
      }
    );
  };

  const resetGraph = () => {
    if (!graph || !data) return;
    graph.getNodes().forEach((n) => n.show());
    graph.getEdges().forEach((e) => e.show());
    requestLayout(graph, data);
  };

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
          <Form.Item label="节点" field={"selectedNodes"}>
            <Select
              options={nodeIds?.map((item) => ({ label: item, value: item }))}
              mode="multiple"
              allowClear
              showSearch={false}
              disabled={selectedNodesDisabled}
            ></Select>
          </Form.Item>
          <Form.Item label="边" field={"selectedEdge"}>
            <Select
              options={edgeIds?.map((item) => ({ label: item, value: item }))}
              allowClear
              showSearch={false}
              disabled={selectedEdgeDisabled}
            ></Select>
          </Form.Item>
          <Form.Item
            label="包含一阶邻域"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 12 }}
            field={"hasNeighbour"}
            initialValue={true}
            triggerPropName="checked"
          >
            <Switch checkedText="ON" uncheckedText="OFF" />
          </Form.Item>
        </div>
        <div
          style={{
            width: "50%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Form.Item
            label="节点属性"
            field={"nodeProperties"}
            initialValue={[]}
          >
            <Select
              options={data?.nodeProperties}
              mode="multiple"
              allowClear
            ></Select>
          </Form.Item>
          <Form.Item label="边属性" field={"edgeProperties"} initialValue={[]}>
            <Select
              options={data?.edgeProperties}
              mode="multiple"
              allowClear
            ></Select>
          </Form.Item>
        </div>
      </Form>
      <div ref={containerRef} />
    </div>
  );
}
