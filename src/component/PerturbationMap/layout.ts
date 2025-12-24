import { Graph, Node, Edge } from "@antv/x6";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3-force";

// 扩展节点类型，包含 X6 节点 id 和尺寸
interface ForceNode extends SimulationNodeDatum {
  id: string;
  width?: number;
  height?: number;
  isLabel?: boolean;
}

// 边类型
interface ForceEdge extends SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
  distance?: number; // 可选：自定义边长度
  strength?: number;
  id?: string;
  labelWidth?: number;
  labelHeight?: number;
}

/**
 * 力导向布局函数
 * @param graph X6 Graph 实例
 * @param data 节点和边数据
 * @param options 布局可选参数
 */
export function applyForceLayout(
  graph: Graph,
  data: {
    nodes: {
      id: string;
      width?: number;
      height?: number;
    }[];
    edges: {
      source: string;
      target: string;
      distance?: number;
    }[];
  },
  options?: {
    width?: number;
    height?: number;
    linkDistance?: number;
    chargeStrength?: number;
    collisionRadius?: number;
    alphaDecay?: number;
  }
) {
  const width = options?.width ?? 800;
  const height = options?.height ?? 600;
  const linkDistance = options?.linkDistance ?? 200;
  const chargeStrength = options?.chargeStrength ?? -400;
  const collisionRadius = options?.collisionRadius ?? 120;
  const alphaDecay = options?.alphaDecay ?? 0.02;

  const labelWidth = 200;
  const labelHeight = 200;

  // 构造 ForceNode 和 ForceEdge
  // const nodes: ForceNode[] = data.nodes.map((n) => ({
  //   id: n.id,
  //   width: n.width ?? 200,
  //   height: n.height ?? 200,
  // }));
  // const edges: ForceEdge[] = data.edges.map((e) => ({
  //   source: e.source,
  //   target: e.target,
  //   distance: e.distance ?? linkDistance,
  //   labelWidth: labelWidth,
  //   labelHeight: labelHeight,
  //   id: `${e.source}-${e.target}`,
  // }));
  // edges.forEach((edge) => {
  //   nodes.push({
  //     id: `label-${edge.id}`,
  //     isLabel: true,
  //     width: edge.labelWidth,
  //     height: edge.labelHeight,
  //   });

  //   edges.push(
  //     { source: edge.source, target: `label-${edge.id}` },
  //     { source: `label-${edge.id}`, target: edge.target }
  //   );
  // });

  const nodes: ForceNode[] = data.nodes.map((n) => ({
    id: n.id,
    width: n.width ?? 200,
    height: n.height ?? 200,
  }));

  const edges: ForceEdge[] = [];
  data.edges.forEach((edge) => {
    const id = `${edge.source}-${edge.target}`;
    nodes.push({
      id: `label-${id}`,
      isLabel: true,
      width: labelWidth,
      height: labelHeight,
    });

    edges.push(
      { source: edge.source, target: `label-${id}`, distance: 100 },
      { source: `label-${id}`, target: edge.target, distance: 100 },
      { source: edge.source, target: edge.target }
    );
  });

  // 创建 d3-force 模拟器
  const simulation = forceSimulation<ForceNode>(nodes)
    .force(
      "link",
      forceLink<ForceNode, ForceEdge>(edges)
        .id((d) => d.id)
        .distance((d) => d.distance ?? linkDistance)
    )
    .force("charge", forceManyBody<ForceNode>().strength(chargeStrength))
    .force("center", forceCenter(width / 2, height / 2))
    .force(
      "collision",
      forceCollide<ForceNode>().radius((d) => {
        // 使用节点尺寸的一半作为碰撞半径
        if (d.isLabel) {
          return Math.max(d.width ?? 200, d.height ?? 200) / 2 + 30;
        }
        return Math.max(d.width ?? 200, d.height ?? 200) / 2 + 60;
      })
    )
    .alphaDecay(alphaDecay);

  // tick 事件：更新 X6 节点位置
  simulation.stop(); // 先停止自动迭代
  simulation.tick(200); // 手动跑 200 步，使节点分散
  nodes.forEach((n) => {
    if (n.isLabel) return;
    (graph.getCellById(n.id) as Node).position(n.x!, n.y!);
  });
  graph.zoomToFit({ padding: 20 });
}
