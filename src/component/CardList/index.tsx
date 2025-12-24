import CardItem from "../CardItem";
import styles from "./index.module.less";
import { useCardDataStore } from "../../store";
import { Button, Collapse, Drawer } from "@arco-design/web-react";
import { useState } from "react";
import { columns } from "../../constant";
import { IconDelete } from "@arco-design/web-react/icon";
import NumericalProperty from "../NumericalProperty";

export default function CardList() {
  const cardList = useCardDataStore((state) => state.cardList);
  const setCardList = useCardDataStore((state) => state.setCardList);
  const [visible, setVisible] = useState(false);

  const moveCard = (dragIndex: number, dropIndex: number) => {
    if (cardList[dragIndex].locked || cardList[dropIndex].locked) return;
    const newList = [...cardList];
    const [dragCard] = newList.splice(dragIndex, 1);
    newList.splice(dropIndex, 0, dragCard);
    setCardList(newList);
  };

  const switchLock = (id: string) => {
    setCardList(
      cardList.map((card) => {
        if (card.id === id) {
          return { ...card, locked: !card.locked };
        } else {
          return card;
        }
      })
    );
  };

  return (
    <>
      <Button
        onClick={() => {
          setVisible(true);
        }}
        type="primary"
        style={{ marginBottom: 10 }}
      >
        卡片设置
      </Button>
      <div className={styles.cardList}>
        {cardList.map((card, index) => (
          <CardItem
            key={card.id}
            cardData={card}
            index={index}
            moveCard={moveCard}
            switchLock={switchLock}
          />
        ))}
      </div>
      <Drawer
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        title={"卡片设置"}
        width={500}
      >
        <Collapse>
          {columns.map((field) => (
            <Collapse.Item
              key={field}
              name={field}
              header={<div>{field}</div>}
              extra={<IconDelete />}
              className={styles.collapseItem}
            >
              <NumericalProperty />
            </Collapse.Item>
          ))}
        </Collapse>
      </Drawer>
    </>
  );
}
