import cytoscape from "cytoscape";
import type {
  Core,
  ElementDefinition,
  LayoutOptions,
  NodeSingular,
  Position,
} from "cytoscape";
import fcose from "cytoscape-fcose";

cytoscape.use(fcose);

/* =======================
   类型定义
======================= */

export interface LayoutNode {
  id: string;
  width: number;
  height: number;
}

export interface LayoutEdge {
  source: string;
  target: string;
}

export type LayoutResult = Record<string, Position>;

/* =======================
   主布局函数
======================= */

export async function runFcoseLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
): Promise<LayoutResult> {
  if (!nodes || nodes.length === 0) {
    return {};
  }

  // 单节点直接返回原点
  if (nodes.length === 1) {
    return {
      [nodes[0].id]: { x: 0, y: 0 },
    };
  }

  /* =======================
     构造 Cytoscape Elements
  ======================= */

  const elements: ElementDefinition[] = [
    ...nodes.map((n) => ({
      data: {
        id: n.id,
        width: n.width,
        height: n.height,
      },
    })),
    ...edges.map((e, index) => ({
      data: {
        id: `${e.source}-${e.target}-${index}`,
        source: e.source,
        target: e.target,
      },
    })),
  ];

  /* =======================
     创建 headless 实例
  ======================= */

  const cy: Core = cytoscape({
    headless: true,
    elements,
    style: [
      {
        selector: "node",
        style: {
          width: "data(width)",
          height: "data(height)",
        },
      },
    ],
  });

  /* =======================
     自适应参数计算
  ======================= */

  const nodeWidth = nodes[0]?.width ?? 200;
  const nodeHeight = nodes[0]?.height ?? 200;
  const baseSize = Math.max(nodeWidth, nodeHeight);
  const idealEdgeLength = baseSize * 1.6;
  const nodeRepulsion = baseSize * (100 + 10 * Math.log(nodes.length));

  const layoutOptions: LayoutOptions = {
    name: "fcose",
    quality: "default",
    randomize: true,
    animate: false,

    idealEdgeLength,
    nodeRepulsion,
    gravity: 0.25,

    numIter: 2500,
  };

  const layout = cy.layout(layoutOptions);

  /* =======================
     执行布局（正确监听方式）
  ======================= */

  await new Promise<void>((resolve) => {
    layout.on("layoutstop", () => {
      resolve();
    });

    layout.run();
  });

  /* =======================
     收集结果
  ======================= */

  const result: LayoutResult = {};

  cy.nodes().forEach((node: NodeSingular) => {
    const pos = node.position();
    result[node.id()] = { x: pos.x, y: pos.y };
  });

  cy.destroy();

  return result;
}
