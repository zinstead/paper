import CardItem from "@/components/CardItem";
// import styles from "./index.module.less";
import { useCardDataStore } from "../../store";
import { Button, Pagination, Space } from "@arco-design/web-react";
import { useState } from "react";
import { IconSettings } from "@arco-design/web-react/icon";
import DndWrapper from "@/components/DndWrapper";
import ColorSettingsDrawer from "@/components/ColorSettingsDrawer";
import { properties } from "@/constant";
import SubstructureEditor from "@/components/SubstructureEditor";
import type { PanelComponentProps } from "@/type/agent";

export default function LigandList(
  props: PanelComponentProps<{ projectId: number; entryId: number }>,
) {
  const cardList = useCardDataStore((state) => state.cardList);
  const setCardList = useCardDataStore((state) => state.setCardList);
  const [editorVisible, setEditorVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnCount, setColumnCount] = useState(4);

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
      }),
    );
  };

  const onSearch = (smarts: string) => {
    console.log(smarts);
  };

  return (
    <div style={{ padding: 20 }}>
      <Space size={16}>
        <Button
          onClick={() => {
            setSettingsVisible(true);
          }}
          style={{ marginBottom: 10 }}
          type="primary"
          icon={<IconSettings />}
        ></Button>
        <Button
          onClick={() => {
            setEditorVisible(true);
          }}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          子结构查询
        </Button>
      </Space>
      <DndWrapper>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columnCount},1fr)`,
            columnGap: "16px",
            rowGap: "16px",
          }}
        >
          {cardList
            .slice((pageNum - 1) * pageSize, pageNum * pageSize)
            .map((card, index) => (
              <CardItem
                key={card.id}
                cardData={card}
                index={index}
                moveCard={moveCard}
                switchLock={switchLock}
              />
            ))}
        </div>
      </DndWrapper>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          total={cardList.length}
          showTotal
          pageSize={pageSize}
          current={pageNum}
          onChange={(pageNum, pageSize) => {
            setPageNum(pageNum);
            setPageSize(pageSize);
          }}
        />
      </div>
      <ColorSettingsDrawer
        properties={properties}
        visible={settingsVisible}
        onCancel={() => {
          setSettingsVisible(false);
        }}
        onConfirm={() => {
          setSettingsVisible(false);
        }}
      />
      <SubstructureEditor
        visible={editorVisible}
        onCancel={() => {
          setEditorVisible(false);
        }}
        onSearch={onSearch}
      />
    </div>
  );
}
