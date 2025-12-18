import { SMILES_LIST } from "../component/MoleculeStructure/smiles";

export const cardList = SMILES_LIST.map((item, index) => ({
  id: index,
  structure: item,
  locked: false,
  // "logP", "HBA", "QED", "creator"
  logP: 123,
  HBA: 456,
  QED: 789,
  creator: "zhoujiazheng.byte",
}));

export const columns = ["logP", "HBA", "QED", "creator"];
