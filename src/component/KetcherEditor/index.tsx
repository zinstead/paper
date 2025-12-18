import { Message } from "@arco-design/web-react";
import { Ketcher } from "ketcher-core";
import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";

// @ts-ignore
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { useCardDataStore } from "../../store";
const structServiceProvider = new StandaloneStructServiceProvider();

const KetcherEditor = () => {
  const setEditData = useCardDataStore((state) => state.setEditData);
  const editData = useCardDataStore((state) => state.editData);

  const handleOnInit = async (ketcher: Ketcher) => {
    (window as any).ketcher = ketcher;
    ketcher.setMolecule(editData.structure);
    ketcher.editor.subscribe("change", async () => {
      const structure = await ketcher.getSmiles();
      setEditData({ ...editData, structure });
    });
  };

  return (
    <Editor
      errorHandler={(msg) => Message.error(msg)}
      staticResourcesUrl={""}
      structServiceProvider={structServiceProvider}
      onInit={handleOnInit}
    />
  );
};

export default KetcherEditor;
