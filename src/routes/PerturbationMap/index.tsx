import { useEffect, useRef, useState } from "react";
import { Cell, Graph } from "@antv/x6";
import type { Node, NodeProperties, Edge, EdgeProperties } from "@antv/x6";
import { register } from "@antv/x6-react-shape";
import "./index.css";
import CompoundCard from "@/components/CompoundCard";
import { isEmpty, mapValues, throttle } from "lodash";
import { mapData, properties } from "@/constant";
import { getBackground, getTextColor, isPassSearch } from "@/utils";
import { Button, Form, Grid, Select, Switch } from "@arco-design/web-react";
import { useRequest } from "ahooks";
import type {
  ForceLayoutData,
  ForceLayoutEdge,
  PerturbationEdge,
  Property,
  SearchRule,
} from "@/type";
import useForm from "@arco-design/web-react/es/Form/useForm";
import { IconSearch, IconSettings } from "@arco-design/web-react/icon";
import { runFcoseLayout } from "./cytoscape";
import ColorSettingsDrawer from "@/components/ColorSettingsDrawer";
import AdvancedSearchModal from "@/components/AdvancedSearchModal";

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
    nodeProperties,
  } = node.getData() || {};

  const renderPropertyList = () => {
    const displayProperties = (properties as Property[]).filter((p) =>
      nodeProperties.has(p.key),
    );
    return (
      <div>
        {displayProperties.map(({ key, value }) => {
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
        footer={renderPropertyList()}
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
    n.setData({ visible });
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
    })),
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

const labelLineHeight = 21;
const width = 200;
function getNodeHeight(labelCount: number) {
  return 200 + labelLineHeight * labelCount + 20 + 2 + 20;
}

export default function Example() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<Graph>();
  const [form] = useForm();

  const selectedNodes = Form.useWatch("selectedNodes", form) as string[];
  const selectedEdge = Form.useWatch("selectedEdge", form) as string;
  const hasNeighbour = Form.useWatch("hasNeighbour", form) as boolean;

  const { data } = useRequest(async () => {
    const res = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(mapData);
        const { initNodeProperties, initEdgeProperties } = mapData;
        form.setFieldsValue({
          nodeProperties: initNodeProperties,
          edgeProperties: initEdgeProperties,
        });
      });
    });
    return res as typeof mapData | undefined;
  });
  const nodeIds = data?.nodes.map((item) => item.id);
  const edgeIds = data?.edges.map(
    ({ source, target }) => `${source}-${target}`,
  );

  const nodeProperties = Form.useWatch("nodeProperties", form) as string[];
  const edgeProperties = Form.useWatch("edgeProperties", form) as string[];

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchForm] = useForm();
  const searchType = Form.useWatch("searchType", searchForm);
  const searchProperties =
    searchType === "node" ? data?.nodeProperties : data?.edgeProperties;
  const searchRules = Form.useWatch("searchRules", searchForm) as boolean;

  const selectedNodesDisabled = !isEmpty(selectedEdge) || !isEmpty(searchRules);
  const selectedEdgeDisabled = !isEmpty(selectedNodes) || !isEmpty(searchRules);
  const advancedSearchDisabled =
    !isEmpty(selectedNodes) || !isEmpty(selectedEdge);
  const hasSearchCondition =
    selectedNodesDisabled || selectedEdgeDisabled || advancedSearchDisabled;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!containerRef) return;
    const graph = new Graph({
      container: containerRef.current!,
      autoResize: true,
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
        data: e,
      });
    });

    const layoutNodes = nodes.map((n) => n.id);
    const layoutEdges = edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));
    requestLayout(graph, { nodes: layoutNodes, edges: layoutEdges });
  }, [graph, data]);

  useEffect(() => {
    searchNodes(selectedNodes);
  }, [graph, data, selectedNodes, hasNeighbour]);

  useEffect(() => {
    const edges: ForceLayoutEdge[] = [];
    if (!isEmpty(selectedEdge)) {
      const [source, target] = selectedEdge.split("-");
      edges.push({ source, target });
    }
    searchEdges(edges);
  }, [graph, data, selectedEdge]);

  useEffect(() => {
    if (!graph || !data) return;

    graph.getNodes().forEach((n) => {
      n.setData({
        nodeProperties: new Set(nodeProperties),
      });
    });
  }, [graph, data, nodeProperties]);

  useEffect(() => {
    if (!graph || !data) return;
    const edgePropertiesSet = new Set(edgeProperties);
    graph.getEdges().forEach((e) => {
      const properties = e.getData().properties as Property[];
      const displayProperties = properties.filter((p) =>
        edgePropertiesSet.has(p.key),
      );
      const labels = getEdgeLabels(displayProperties, labelLineHeight);
      e.setLabels(labels);
    });
  }, [graph, data, edgeProperties]);

  const requestLayout = async (graph: Graph, data: ForceLayoutData) => {
    const height = getNodeHeight(nodeProperties.length);
    // 应用力导向布局
    const forceNodes = data.nodes.map((id) => ({
      id,
      width,
      height,
    }));
    const forceEdges = data.edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));

    const result = await runFcoseLayout(forceNodes, forceEdges);
    const nodes = Object.values(
      mapValues(result, (value, key) => ({
        id: key,
        ...value,
      })),
    );

    nodes.forEach((n) => {
      const node = graph.getCellById(n.id) as Node;
      node.position(n.x - width / 2, n.y - height / 2);
    });

    requestAnimationFrame(() => {
      graph.zoomToFit({ padding: 30 });
      graph.centerContent();
    });
  };

  const resetGraph = () => {
    if (!graph || !data) return;
    graph.getNodes().forEach((n) => n.show());
    graph.getEdges().forEach((e) => e.show());
    const nodes = data.nodes.map((n) => n.id);
    const edges = data.edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));
    requestLayout(graph, { nodes, edges });
  };

  const handleSearch = () => {
    if (!graph || !data) return;
    if (!hasSearchCondition) return resetGraph();
    const { searchRules } = searchForm.getFieldsValue() as {
      searchRules: SearchRule[];
    };
    if (isEmpty(searchRules)) return;
    if (searchType === "node") {
      const nodeIds: string[] = [];
      graph.getNodes().forEach((n) => {
        const { properties } = n.getData() as { properties: Property[] };
        if (isPassSearch(searchRules, properties)) {
          nodeIds.push(n.id);
        }
      });
      searchNodes(nodeIds);
    } else {
      const edges: ForceLayoutEdge[] = [];
      graph.getEdges().forEach((e) => {
        const { properties } = e.getData() as { properties: Property[] };
        if (isPassSearch(searchRules, properties)) {
          edges.push({ source: e.source as any, target: e.target as any });
        }
        searchEdges(edges);
      });
    }
  };

  const searchNodes = (nodeIds: string[]) => {
    if (!graph || !data) return;
    if (!hasSearchCondition) return resetGraph();
    if (isEmpty(nodeIds)) return;

    const nodeSet = new Set(nodeIds);
    if (hasNeighbour) {
      nodeIds.forEach((id) => {
        const node = graph.getCellById(id);
        graph.getNeighbors(node).forEach((cell) => nodeSet.add(cell.id));
      });
    }

    const edges = data.edges.filter(
      (e) => nodeSet.has(e.source) && nodeSet.has(e.target),
    );

    graph.getNodes().forEach((n) => {
      if (nodeSet.has(n.id)) {
        n.show();
      } else {
        n.hide();
      }
    });

    graph.getEdges().forEach((e) => {
      const data = e.getData() as PerturbationEdge;
      if (nodeSet.has(data.source) && nodeSet.has(data.target)) {
        e.setData({ display: true });
      } else {
        e.setData({ display: false });
      }
    });

    // 重新布局
    requestLayout(graph, { nodes: Array.from(nodeSet), edges });
  };

  const searchEdges = (edges: ForceLayoutEdge[]) => {
    if (!graph || !data) return;
    if (!hasSearchCondition) return resetGraph();

    const nodeSet = new Set<string>();
    const edgeSet = new Set<string>();
    edges.forEach((e) => {
      nodeSet.add(e.source);
      nodeSet.add(e.target);
      edgeSet.add(`${e.source}-${e.target}`);
    });
    graph.getNodes().forEach((n) => {
      if (nodeSet.has(n.id)) {
        n.show();
      } else {
        n.hide();
      }
    });

    graph.getEdges().forEach((e) => {
      const data = e.getData() as PerturbationEdge;
      const id = `${data.source}-${data.target}`;
      if (edgeSet.has(id)) {
        e.setData({ display: true });
      } else {
        e.setData({ display: false });
      }
    });

    // 重新布局
    requestLayout(graph, { nodes: Array.from(nodeSet), edges });
  };

  return (
    <div
      style={{
        height: "100vh",
        padding: 30,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: "auto" }}>
        <Form form={form}>
          <Grid.Row>
            <Grid.Col span={8}>
              <div style={{ display: "flex" }}>
                <Form.Item
                  label="节点"
                  field={"selectedNodes"}
                  initialValue={[]}
                >
                  <Select
                    options={nodeIds?.map((item) => ({
                      label: item,
                      value: item,
                    }))}
                    mode="multiple"
                    allowClear
                    showSearch={false}
                    disabled={selectedNodesDisabled}
                  ></Select>
                </Form.Item>
                <Button
                  icon={<IconSearch />}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 10,
                  }}
                  onClick={() => {
                    setSearchModalVisible(true);
                  }}
                  disabled={advancedSearchDisabled}
                />
              </div>
            </Grid.Col>
            <Grid.Col span={8}>
              <div style={{ display: "flex" }}>
                <Form.Item label="边" field={"selectedEdge"} initialValue={""}>
                  <Select
                    options={edgeIds?.map((item) => ({
                      label: item,
                      value: item,
                    }))}
                    allowClear
                    showSearch={false}
                    disabled={selectedEdgeDisabled}
                  ></Select>
                </Form.Item>
                <Button
                  icon={<IconSearch />}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 10,
                  }}
                  onClick={() => {
                    setSearchModalVisible(true);
                  }}
                  disabled={advancedSearchDisabled}
                />
              </div>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item
                label="包含一阶邻域"
                colon
                labelCol={{ span: 12 }}
                wrapperCol={{ span: 12 }}
                field={"hasNeighbour"}
                initialValue={true}
                triggerPropName="checked"
              >
                <Switch checkedText="ON" uncheckedText="OFF" />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col span={8}>
              <div style={{ display: "flex" }}>
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
                <Button
                  icon={<IconSettings />}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 10,
                  }}
                  onClick={() => setVisible(true)}
                />
              </div>
            </Grid.Col>
            <Grid.Col span={8}>
              <div style={{ display: "flex" }}>
                <Form.Item
                  label="边属性"
                  field={"edgeProperties"}
                  initialValue={[]}
                >
                  <Select
                    options={data?.edgeProperties}
                    mode="multiple"
                    allowClear
                  ></Select>
                </Form.Item>
                <Button
                  icon={<IconSettings />}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 10,
                  }}
                  onClick={() => setVisible(true)}
                />
              </div>
            </Grid.Col>
          </Grid.Row>
        </Form>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{ overflow: "hidden", minHeight: 0 }}
            ref={containerRef}
          />
        </div>
      </div>
      <AdvancedSearchModal
        visible={searchModalVisible}
        onCancel={() => {
          setSearchModalVisible(false);
        }}
        onSearch={handleSearch}
        searchProperties={searchProperties ?? []}
      />
      <ColorSettingsDrawer
        properties={properties}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        onConfirm={() => {
          setVisible(false);
        }}
      />
    </div>
  );
}
