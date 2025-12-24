import { create } from "zustand";
import type { CardData } from "../type";
import { cardList } from "../constant";

interface EditData {
  visible: boolean;
  editId: string;
  structure: string;
}

interface CardDataStore {
  editData: EditData;
  setEditData: (editData: EditData) => void;
  cardList: CardData[];
  setCardList: (cardList: CardData[]) => void;
}

export const useCardDataStore = create<CardDataStore>()((set) => ({
  editData: {
    visible: false,
    editId: "0",
    structure: "",
  },
  setEditData: (editData) => set({ editData }),
  cardList: cardList,
  setCardList: (cardList) => set({ cardList }),
}));
