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

export interface ForceLayoutData {
  nodes: string[];
  edges: ForceLayoutEdge[];
}

export interface ForceLayoutEdge {
  source: string;
  target: string;
}

export interface CardData extends PerturbationNode {
  locked: boolean;
}

export interface SearchRule {
  property: string;
  operator: string;
  value?: string;
  min?: string;
  max?: string;
}
