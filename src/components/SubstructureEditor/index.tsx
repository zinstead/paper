import { Modal, Message, Input } from "@arco-design/web-react";
import { Ketcher } from "ketcher-core";
import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { useState } from "react";
const structServiceProvider = new StandaloneStructServiceProvider();

const SubstructureEditor = (props: {
  visible: boolean;
  onCancel: () => void;
  onSearch: (smarts: string) => void;
}) => {
  const { visible, onCancel, onSearch } = props;
  const [smarts, setSmarts] = useState<string>();

  const handleOnInit = async (ketcher: Ketcher) => {
    (window as any).ketcher = ketcher;
    // ketcher.setMolecule(editData.structure);
    ketcher.editor.subscribe("change", async () => {
      const structure = await ketcher.getSmarts();
      setSmarts(structure);
    });
  };
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      onConfirm={() => {
        if (smarts) {
          onSearch(smarts);
        }
      }}
      style={{ width: 800 }}
    >
      <div style={{ height: 600 }}>
        <Editor
          errorHandler={(msg) => Message.error(msg)}
          staticResourcesUrl={""}
          structServiceProvider={structServiceProvider}
          onInit={handleOnInit}
        />
      </div>
      <label>
        <span style={{ marginRight: 8 }}>SMARTS:</span>
        <Input
          value={smarts}
          onChange={() => {
            setSmarts(smarts);
          }}
          style={{ width: 300, marginTop: 20 }}
        />
      </label>
    </Modal>
  );
};

export default SubstructureEditor;
