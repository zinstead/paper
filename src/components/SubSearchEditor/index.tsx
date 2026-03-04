import { Modal, Message } from "@arco-design/web-react";
import { Ketcher } from "ketcher-core";
import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { useState } from "react";
const structServiceProvider = new StandaloneStructServiceProvider();

const SubSearchEditor = (props: {
  visible: boolean;
  onSearch: (smarts: string) => void;
}) => {
  const { visible, onSearch } = props;
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
    <Modal visible={visible}>
      <Editor
        errorHandler={(msg) => Message.error(msg)}
        staticResourcesUrl={""}
        structServiceProvider={structServiceProvider}
        onInit={handleOnInit}
      />
    </Modal>
  );
};

export default SubSearchEditor;
