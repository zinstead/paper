export interface CardData {
  id: string;
  structure: string;
  properties: { key: string; value: any; type: string }[];
  locked: boolean;
}
