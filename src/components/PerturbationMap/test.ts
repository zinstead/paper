import { mock } from "@/constant/mock";
import { layoutFn, type LayoutEdge, type LayoutNode } from "./cytoscape";

interface LayoutedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function isOverlap(a: LayoutedNode, b: LayoutedNode, padding = 0) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);

  const overlapX = (a.width + b.width) / 2 + padding - dx;
  const overlapY = (a.height + b.height) / 2 + padding - dy;

  return overlapX > 0 && overlapY > 0;
}

function calcOverlapRate(nodes: LayoutedNode[]) {
  let overlapCount = 0;
  let totalPairs = 0;
  const set = new Set(nodes.map((n) => n.id));

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      totalPairs++;

      if (isOverlap(nodes[i], nodes[j])) {
        overlapCount++;
        set.delete(nodes[i].id);
        set.delete(nodes[j].id);
      }
    }
  }

  return 1 - set.size / nodes.length;
  // return overlapCount / totalPairs;
}

function calcAvgDistance(nodes: LayoutedNode[]) {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;

      const dist = Math.sqrt(dx * dx + dy * dy);
      sum += dist;
      count++;
    }
  }

  return sum / count;
}

function calcOverlapArea(a: LayoutedNode, b: LayoutedNode) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);

  const overlapX = (a.width + b.width) / 2 - dx;
  const overlapY = (a.height + b.height) / 2 - dy;

  if (overlapX > 0 && overlapY > 0) {
    return overlapX * overlapY;
  }

  return 0;
}

export async function evaluateLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  layoutFn: any,
) {
  const start = performance.now();
  const positions = await layoutFn(nodes, edges);
  const end = performance.now();

  const enrichedNodes = nodes.map((n) => ({
    ...n,
    ...positions[n.id],
  }));
  return {
    overlapRate: calcOverlapRate(enrichedNodes),
    avgDistance: calcAvgDistance(enrichedNodes),
    time: end - start,
  };
}

export async function getStatistics(nodes: LayoutNode[], edges: LayoutEdge[]) {
  const statistics: any = [];
  for (let i = 0; i < 100; i++) {
    const res1 = await evaluateLayout(
      nodes,
      edges,
      async (nodes: any, edges: any) => {
        const res = await layoutFn({
          nodes,
          edges,
          adaptiveParams: false,
          avoidOverlap: false,
        });
        return res;
      },
    );
    const res2 = await evaluateLayout(
      nodes,
      edges,
      async (nodes: any, edges: any) => {
        const res = await layoutFn({
          nodes,
          edges,
          adaptiveParams: true,
          avoidOverlap: false,
        });
        return res;
      },
    );
    const res3 = await evaluateLayout(
      nodes,
      edges,
      async (nodes: any, edges: any) => {
        const res = await layoutFn({
          nodes,
          edges,
          adaptiveParams: true,
          avoidOverlap: true,
        });
        return res;
      },
    );
    statistics.push({
      fixed: res1,
      adaptive: res2,
      avoid: res3,
    });
  }
  const overlapRate1 = statistics.reduce(
    (pre, cur) => pre + cur.fixed.overlapRate,
    0,
  );
  const overlapRate2 = statistics.reduce(
    (pre, cur) => pre + cur.adaptive.overlapRate,
    0,
  );
  const overlapRate3 = statistics.reduce(
    (pre, cur) => pre + cur.avoid.overlapRate,
    0,
  );
  console.log([overlapRate1, overlapRate2, overlapRate3]);

  const avgDistance1 = statistics.reduce(
    (pre, cur) => pre + cur.fixed.avgDistance,
    0,
  );
  const avgDistance2 = statistics.reduce(
    (pre, cur) => pre + cur.adaptive.avgDistance,
    0,
  );
  const avgDistance3 = statistics.reduce(
    (pre, cur) => pre + cur.avoid.avgDistance,
    0,
  );
  console.log([avgDistance1, avgDistance2, avgDistance3]);

  const time1 = statistics.reduce((pre, cur) => pre + cur.fixed.time, 0);
  const time2 = statistics.reduce((pre, cur) => pre + cur.adaptive.time, 0);
  const time3 = statistics.reduce((pre, cur) => pre + cur.avoid.time, 0);
  // console.log([time1, time2, time3]);

  // console.log(statistics);
}

export function runTest() {
  const nodes = mock.nodes.map((n) => ({ id: n.id, width: 200, height: 305 })),
    edges = mock.edges.map((e) => ({ source: e.source, target: e.target }));
  getStatistics(nodes, edges);
}
