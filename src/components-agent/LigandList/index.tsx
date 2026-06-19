import CardItem from "@/components/CardItem";
// import styles from "./index.module.less";
import { useCardDataStore } from "../../store";
import {
  Button,
  Pagination,
  Space,
  type PaginationProps,
} from "@arco-design/web-react";
import { useEffect, useState } from "react";
import { IconSettings } from "@arco-design/web-react/icon";
import DndWrapper from "@/components/DndWrapper";
import ColorSettingsDrawer from "@/components/ColorSettingsDrawer";
import { properties } from "@/constant";
import SubstructureEditor from "@/components/SubstructureEditor";
import type { PanelComponentProps } from "@/type/agent";
import {
  getMolecules,
  type MoleculeFiltersSchema,
  type MoleculeSorterSchema,
} from "@/api/index.ts";
import { useQuery } from "@tanstack/react-query";
import type { CardData } from "@/type/index.ts";
import { getPaginatedData } from "@/utils/agent.ts";
import axios from "axios";

function getMinMaxByKey(data: Record<string, any>[]) {
  const result: Record<string, { min: number; max: number }> = {};
  for (const item of data) {
    for (const [key, value] of Object.entries(item)) {
      if (typeof value !== "number") continue;
      const cur = result[key];
      if (cur) {
        if (value < cur.min) result[key].min = value;
        if (value > cur.max) result[key].max = value;
      } else {
        result[key] = { min: value, max: value };
      }
    }
  }
  return result;
}

export default function LigandList(
  props: PanelComponentProps<{
    projectId: number;
    entryId: number;
    pagination: PaginationProps;
    filters?: MoleculeFiltersSchema;
    sorter?: MoleculeSorterSchema;
    limit?: number;
  }>,
) {
  const { state, setState } = props;
  const { pagination, filters, sorter, limit } = state;
  console.log(state);

  const setPagination = (pagination: PaginationProps) => {
    setState({ pagination });
  };

  const cardList = useCardDataStore((state) => state.cardList);
  const setCardList = useCardDataStore((state) => state.setCardList);

  useEffect(() => {
    setPagination({ ...pagination, current: 1 });
  }, [filters]);

  const query = useQuery<CardData[]>({
    queryKey: [
      "molecules",
      pagination.current,
      pagination.pageSize,
      filters,
      sorter,
      limit,
    ],
    queryFn: async () => {
      const res = await getMolecules({ pagination, filters, sorter, limit });
      setPagination({ ...pagination, total: res.total });
      const data = res.data;
      const minMaxMap = getMinMaxByKey(data);
      const molecules = data.map((item: Record<string, any>) => {
        const { id, smiles, ...properties } = item;
        const node = {
          id,
          structure: smiles,
          locked: false,
          properties: Object.entries(properties).map(([key, value]) => {
            return {
              key,
              value,
              type: typeof value,
              min: minMaxMap[key]?.min,
              max: minMaxMap[key]?.max,
            };
          }),
        };
        return node;
      });
      return molecules;
    },
  });

  const [editorVisible, setEditorVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

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
          {query.isLoading ? (
            <div>loading...</div>
          ) : (
            query.data?.map((card, index) => {
              return (
                <CardItem
                  key={card.id}
                  cardData={card}
                  index={index}
                  moveCard={moveCard}
                  switchLock={switchLock}
                />
              );
            })
          )}
        </div>
      </DndWrapper>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          showTotal
          total={pagination.total}
          pageSize={pagination.pageSize}
          current={pagination.current}
          onChange={(current, pageSize) => {
            setPagination({ ...pagination, current, pageSize });
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
