import { Modal } from "@arco-design/web-react";
import { IconClose } from "@arco-design/web-react/icon";
import KetcherEditor from "../KetcherEditor";
import "./index.less";
import { useCardDataStore } from "../../store";

const EditorModal = () => {
  const editData = useCardDataStore((state) => state.editData);
  const setEditData = useCardDataStore((state) => state.setEditData);
  const setCardList = useCardDataStore((state) => state.setCardList);
  const cardList = useCardDataStore((state) => state.cardList);
  const { visible, structure, editId } = editData;

  const handleCancel = () => {
    setEditData({ ...editData, visible: false });
  };

  const handleConfirm = () => {
    setCardList(
      cardList.map((item) => {
        if (item.id === editId) {
          return { ...item, structure: structure };
        }
        return item;
      })
    );
    handleCancel();
  };

  return (
    <div>
      <Modal
        visible={visible}
        onCancel={handleCancel}
        onOk={handleConfirm}
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>编辑</span>
            <IconClose className="close-icon" onClick={handleCancel} />
          </div>
        }
        simple
        style={{ width: 1200 }}
        unmountOnExit
      >
        <div style={{ height: 800 }}>
          <KetcherEditor />
        </div>
      </Modal>
    </div>
  );
};

export default EditorModal;
