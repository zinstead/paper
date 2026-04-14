interface Property {
  key: string;
  value: any;
  type: string;
}

interface Node {
  id: string;
  structure: string;
  properties: Property[];
}

interface Edge {
  source: string;
  target: string;
  properties: Property[];
}

interface MockData {
  nodes: Node[];
  edges: Edge[];
}

const NODE_COUNT = 20;
const EDGE_COUNT = 2 * NODE_COUNT;

/** 一些简单的SMILES片段 */
const smilesLibrary = [
  "CCO",
  "CCN",
  "CCC",
  "CCCO",
  "CCCN",
  "CC(C)O",
  "CC(C)N",
  "c1ccccc1",
  "c1ccncc1",
  "c1ccccc1O",
  "c1ccccc1N",
  "c1ccccc1Cl",
  "c1ccc(cc1)O",
  "c1ccc(cc1)N",
  "CC(=O)O",
  "CC(=O)N",
  "CCOC",
  "CCNC",
  "CCCl",
  "CCBr",
  "CCF",
  "CCS",
  "CCCOC",
  "CCNCC",
  "CCOCC",
  "CC(C)CO",
  "CC(C)CN",
  "c1ccc2ccccc2c1",
  "c1ccccc1C(=O)O",
];

function randomSmiles(): string {
  return smilesLibrary[Math.floor(Math.random() * smilesLibrary.length)];
}

const nodeProperties = ["logP", "MW", "HBA", "HBD", "active"];
const edgeProperties = ["deltaG", "error"];

function randomPropertySet(): Property[] {
  return [
    {
      key: "logP",
      value: Number((Math.random() * 6 - 2).toFixed(2)),
      type: "number",
    },
    {
      key: "MW",
      value: Number((Math.random() * 500 + 150).toFixed(2)),
      type: "number",
    },
    {
      key: "HBA",
      value: Math.floor(Math.random() * 10),
      type: "number",
    },
    {
      key: "HBD",
      value: Math.floor(Math.random() * 5),
      type: "number",
    },
    {
      key: "active",
      value: Math.random() > 0.7,
      type: "boolean",
    },
  ];
}

function generateNodes(): Node[] {
  const nodes: Node[] = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      id: `mol_${i}`,
      structure: randomSmiles(),
      properties: randomPropertySet(),
    });
  }

  return nodes;
}

function generateEdges(nodes: Node[]): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();

  while (edges.length < EDGE_COUNT) {
    const s = nodes[Math.floor(Math.random() * nodes.length)].id;
    const t = nodes[Math.floor(Math.random() * nodes.length)].id;

    if (s === t) continue;

    const key = s < t ? `${s}-${t}` : `${t}-${s}`;
    if (edgeSet.has(key)) continue;

    edgeSet.add(key);

    edges.push({
      source: s,
      target: t,
      properties: [
        {
          key: "deltaG",
          value: Number((-12 + Math.random() * 6).toFixed(2)),
          type: "number",
        },
        {
          key: "error",
          value: Number((Math.random() * 1.5).toFixed(2)),
          type: "number",
        },
      ],
    });
  }

  return edges;
}

export function generateMockData(): any {
  const nodes = generateNodes();
  const edges = generateEdges(nodes);

  return {
    nodes,
    edges,
    nodeProperties: nodeProperties,
    edgeProperties: edgeProperties,
    initNodeProperties: nodeProperties.slice(0, 3),
    initEdgeProperties: edgeProperties,
  };
}

export const mock = generateMockData();
