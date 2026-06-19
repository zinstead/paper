import { useMemo, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import CompoundCard from "../CompoundCard";
import { IconEdit, IconLock, IconUnlock } from "@arco-design/web-react/icon";
import classNames from "classnames";
import styles from "./index.module.less";
import { Carousel, Space } from "@arco-design/web-react";
import { useCardDataStore } from "../../store";
import type { CardData, Property } from "../../type";
import { columns } from "../../constant";
import { getBackground, getTextColor } from "../../utils";

function getPropertyFields(columns: string[]) {
  const n = columns.length;
  // 一页最多显示三个属性
  const maxSize = 3;
  const pageSize = n > maxSize ? maxSize : n;
  const fields = [];
  let i = 0;
  while (i < n) {
    fields.push(columns.slice(i, i + pageSize));
    i = i + pageSize;
  }
  return { fields, pageSize };
}

export interface CardItemProps {
  cardData: CardData;
  index: number;
  moveCard: (dragIndex: number, dropIndex: number) => void;
  switchLock: (id: string) => void;
}

const ItemType = { CARD: "card" };

export default function CardItem({
  cardData,
  index,
  moveCard,
  switchLock,
}: CardItemProps) {
  const { id, structure, locked, properties } = cardData;
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemType.CARD,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOverShallow }, drop] = useDrop<
    { index: number },
    void,
    { isOverShallow: boolean }
  >({
    accept: ItemType.CARD,
    collect: (monitor) => ({
      isOverShallow: monitor.isOver({ shallow: true }),
    }),
    drop(drapItem: { index: number }) {
      if (drapItem.index !== index) {
        requestAnimationFrame(() => {
          moveCard(drapItem.index, index);
        });
      }
    },
  });

  drag(drop(ref));

  const cardClassName = classNames(
    styles.cardItem,
    { [styles.dragging]: isDragging },
    { [styles.hovered]: isOverShallow },
  );

  const lockIcon = locked ? <IconLock /> : <IconUnlock />;
  const lockClassName = classNames(styles.lockIcon, {
    [styles.locked]: locked,
  });

  const setEditData = useCardDataStore((state) => state.setEditData);

  const renderHeader = () => {
    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>{id}</div>
        <Space>
          {/* <div className={styles.lockIcon}>
            <IconEdit
              onClick={() => {
                setEditData({
                  visible: true,
                  editId: id,
                  structure,
                });
              }}
            />
          </div> */}
          <div
            className={lockClassName}
            onClick={() => {
              switchLock(id);
            }}
          >
            {lockIcon}
          </div>
        </Space>
      </div>
    );
  };

  const renderFooter = () => {
    const columns = cardData.properties.map((item) => item.key);
    const { fields, pageSize } = getPropertyFields(columns);
    return (
      <div style={{ transform: "none" }}>
        <Carousel indicatorPosition="top" animation="fade" showArrow={"never"}>
          {fields.map((pageFields) => (
            <div
              key={`page-${pageFields.join("-")}`}
              style={{ height: 21 * pageSize }}
            >
              {pageFields.map((field) => {
                const property = properties.find((item) => item.key === field)!;
                const params = {
                  linear: true,
                  inverted: false,
                };

                const background = getBackground({
                  ...params,
                  value: property.value,
                  min: property?.min ?? Infinity,
                  max: property.max ?? Infinity,
                });
                const color = getTextColor(background);

                return (
                  <div
                    key={field}
                    className={styles.propertyItem}
                    style={{
                      background,
                      color,
                    }}
                  >
                    <div>{field}</div>
                    <div>{property.value}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </Carousel>
      </div>
    );
  };

  return (
    <div>
      <motion.div ref={ref} layout className={cardClassName}>
        <CompoundCard
          id={id}
          structure={structure}
          header={renderHeader()}
          footer={renderFooter()}
          width={200}
          height={200}
          svgMode
          previewWidth={600}
        />
      </motion.div>
    </div>
  );
}
