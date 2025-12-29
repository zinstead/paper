import DndWrapper from "@/components/DndWrapper";
import CardList from "@/components/CardList";
import EditorModal from "@/components/EditorModal";

const Card = () => {
  return (
    <div style={{ margin: 20 }}>
      <DndWrapper>
        <CardList />
      </DndWrapper>
      <EditorModal />
    </div>
  );
};

export default Card;
