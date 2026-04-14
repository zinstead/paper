import cytoscape from "cytoscape";
import type {
  Core,
  ElementDefinition,
  LayoutOptions,
  Position,
} from "cytoscape";
import fcose from "cytoscape-fcose";
import { keyBy, mapValues } from "lodash";

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
  const n = nodes.length;

  const density = 0.3; // 0.2~0.4
  const gravity = 1 / Math.sqrt(n);
  const nodeArea = nodeWidth * nodeHeight * n;
  const layoutArea = nodeArea / density;
  const idealEdgeLength = Math.sqrt(layoutArea / n);
  const nodeRepulsion = Math.pow(idealEdgeLength, 2.5); // 一般是2

  const layoutOptions: LayoutOptions = {
    name: "fcose",
    quality: "default",
    randomize: true,
    animate: false,

    idealEdgeLength,
    nodeRepulsion,
    gravity,
    numIter: 3000,
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
     后处理
  ======================= */

  cy.destroy();

  const nodeList = cy.nodes().map((n) => ({
    id: n.id(),
    x: n.position("x"),
    y: n.position("y"),
    width: nodeWidth,
    height: nodeHeight,
  }));
  const res = resolveOverlap(nodeList);

  return mapValues(keyBy(res, "id"), (n) => ({ x: n.x, y: n.y }));
}

type Node = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function resolveOverlap(
  nodes: Node[],
  {
    padding = 8, // 节点之间的最小间距
    maxIter = 3, // 迭代次数（1~3 通常就够）
  } = {},
) {
  for (let iter = 0; iter < maxIter; iter++) {
    let moved = false;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];

        // 当前中心差
        const dx = b.x - a.x;
        const dy = b.y - a.y;

        // 允许的最小距离（半宽 + 半宽 + padding）
        const overlapX = (a.width + b.width) / 2 + padding - Math.abs(dx);
        const overlapY = (a.height + b.height) / 2 + padding - Math.abs(dy);

        // 有重叠
        if (overlapX > 0 && overlapY > 0) {
          moved = true;

          // 选择“更容易分开”的方向（重叠更小的轴）
          if (overlapX < overlapY) {
            const shift = overlapX / 2;
            const dir =
              dx === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(dx);

            a.x -= dir * shift;
            b.x += dir * shift;
          } else {
            const shift = overlapY / 2;
            const dir =
              dy === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(dy);

            a.y -= dir * shift;
            b.y += dir * shift;
          }
        }
      }
    }

    // 如果这一轮没有移动，提前结束
    if (!moved) break;
  }

  return nodes;
}

export async function layoutFn(params: {
  adaptiveParams: boolean;
  avoidOverlap: boolean;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
}) {
  const { nodes, edges, adaptiveParams, avoidOverlap } = params;
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
  const n = nodes.length;

  const density = 0.2; // 0.2~0.4
  const gravity = 0.1 / Math.sqrt(n);
  const nodeArea = nodeWidth * nodeHeight * n;
  const layoutArea = nodeArea / density;
  const idealEdgeLength = Math.sqrt(layoutArea / n);
  const nodeRepulsion = Math.pow(idealEdgeLength, 2.5); // 一般是2

  const layoutOptions: LayoutOptions = adaptiveParams
    ? {
        name: "fcose",
        quality: "default",
        randomize: true,
        animate: false,

        idealEdgeLength,
        nodeRepulsion,
        gravity,
        numIter: 3000,
      }
    : {
        name: "fcose",
        quality: "default",
        randomize: true,
        animate: false,

        idealEdgeLength: baseSize * 1.6,
        nodeRepulsion: Math.pow(baseSize * 1.6, 2),
        gravity: 0.2,
        numIter: 3000,
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
     后处理
  ======================= */

  cy.destroy();

  const nodeList = cy.nodes().map((n) => ({
    id: n.id(),
    x: n.position("x"),
    y: n.position("y"),
    width: nodeWidth,
    height: nodeHeight,
  }));
  const avoidResult = resolveOverlap(nodeList);
  const finalResult = keyBy(avoidOverlap ? avoidResult : nodeList, "id");

  return finalResult;
}
