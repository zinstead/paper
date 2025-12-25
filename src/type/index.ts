export interface Property {
  key: string;
  value: any;
  type: string;
}

export interface PerturbationNode {
  id: string;
  structure: string;
  properties: Property[];
}

export interface PerturbationEdge {
  source: string;
  target: string;
  properties: Property[];
}

export interface PerturbationData {
  nodes: PerturbationNode[];
  edges: PerturbationEdge[];
  nodeProperties: string[];
  edgeProperties: string[];
  initNodeProperties: string[];
  initEdgeProperties: string[];
}

export interface CardData extends PerturbationNode {
  locked: boolean;
}
