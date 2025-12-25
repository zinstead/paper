import { cloneDeep } from "lodash";
import { SMILES_LIST } from "../component/MoleculeStructure/smiles";
import type {
  CardData,
  PerturbationData,
  PerturbationEdge,
  PerturbationNode,
} from "@/type";

export const columns = ["logP", "HBA", "QED", "status"];

const propertyList: Record<string, any> = {
  logP: Math.floor(Math.random() * 100),
  HBA: Math.floor(Math.random() * 100),
  QED: Math.floor(Math.random() * 100),
  status: Math.random() < 0.5 ? "good" : "bad",
};
const properties = Object.keys(propertyList).map((key) => ({
  key,
  value: propertyList[key],
  type: typeof propertyList[key],
}));

export const cardList: CardData[] = SMILES_LIST.map((item, index) => ({
  id: String(index),
  structure: item,
  properties,
  locked: false,
}));

export const mapData: PerturbationData = {
  nodes: [
    {
      id: "a",
      structure:
        "C[C@H](CCCC(C)(C)O)[C@@]1([H])CC[C@@]2([H])C(CCC[C@]12C)=CC=C1C[C@@H](O)C[C@H](O)C1=C",
      properties: cloneDeep(properties),
    },
    {
      id: "b",
      structure:
        "CC(C=CC=C(/C)C=CC1C(C)=CC(O)CC1(C)C)=C/C=C/C=C(C)/C=C/C=C(C)/C=C/C1=C(C)CC(O)CC1(C)C",
      properties: cloneDeep(properties),
    },
    {
      id: "c",
      structure:
        "C[C@H](CCCC(C)(C)O)[C@@]1([H])CC[C@@]2([H])C(CCC[C@]12C)=CC=C1C[C@@H](O)CCC1=C",
      properties: cloneDeep(properties),
    },
    {
      id: "d",
      structure:
        "CC(C)[C@@H](C)C=C[C@@H](C)[C@@]1([H])CC[C@@]2([H])C(CCC[C@]12C)=CC=C1C[C@@H](O)CCC1=C",
      properties: cloneDeep(properties),
    },
  ],
  edges: [
    {
      source: "a",
      target: "b",
      properties: cloneDeep(properties),
    },
    {
      source: "a",
      target: "c",
      properties: cloneDeep(properties),
    },
    {
      source: "b",
      target: "d",
      properties: cloneDeep(properties),
    },
    {
      source: "c",
      target: "d",
      properties: cloneDeep(properties),
    },
  ],
  nodeProperties: Object.keys(propertyList),
  edgeProperties: Object.keys(propertyList),
  initNodeProperties: ["logP"],
  initEdgeProperties: ["QED"],
};
