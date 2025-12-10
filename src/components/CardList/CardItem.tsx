import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import CompoundCard from "../CompoundCard";
import { IconUnlock } from "@arco-design/web-react/icon";

export interface CardItemProps {
  id: number;
  smiles: string;
  index: number;
  swapCard: (dragIndex: number, dropIndex: number) => void;
}

const ItemType = { CARD: "card" };

export default function CardItem({
  id,
  smiles,
  index,
  swapCard,
}: CardItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);

  /** -------------------- 拖拽源 -------------------- **/
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.CARD,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  /** -------------------- 放置目标 -------------------- **/
  const [, drop] = useDrop({
    accept: ItemType.CARD,
    hover(item: { index: number }) {
      if (!ref.current) return;

      if (item.index !== index) {
        setIsOver(true);
      }
    },
    drop(item: { index: number }) {
      if (item.index !== index) {
        swapCard(item.index, index);
      }
      setIsOver(false);
    },
  });

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      layout // <--- 启用自动布局动画（核心）
      transition={{ duration: 0.2 }}
      style={{
        background: isOver ? "#f0f0f0" : "#fff",
        border: "1px solid #ccc",
        borderRadius: 6,
        cursor: "move",
        opacity: isDragging ? 0.5 : 1, // <--- 拖拽时半透明
      }}
    >
      <CompoundCard
        structure={smiles}
        header={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>{id}</div>
            <div>
              <IconUnlock />
            </div>
          </div>
        }
        footer={"footer"}
        width={200}
        height={200}
      />
    </motion.div>
  );
}
