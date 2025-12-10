import { useState, useCallback } from "react";
import CardItem from "./CardItem";
import { SMILES_LIST } from "../../utils/smiles";
import "./index.css";

const cardList = SMILES_LIST.map((item, index) => ({
  id: index,
  smiles: item,
}));

export interface CardData {
  id: number;
  smiles: string;
}

export default function CardList() {
  const [cards, setCards] = useState<CardData[]>(cardList);

  /** 在 drop 时交换卡片 */
  const swapCard = useCallback((dragIndex: number, dropIndex: number) => {
    setCards((prev) => {
      const newList = [...prev];
      const [dragCard] = newList.splice(dragIndex, 1);
      newList.splice(dropIndex, 0, dragCard);
      return newList;
    });
  }, []);

  return (
    <div className="structure-list">
      {cards.map((card, index) => (
        <CardItem
          key={card.id}
          id={card.id}
          index={index}
          smiles={card.smiles}
          swapCard={swapCard}
        />
      ))}
    </div>
  );
}
