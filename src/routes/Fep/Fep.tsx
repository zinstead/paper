import { useRef } from "react";
import styles from "./index.module.less";
import {
  DockviewReact,
  DockviewApi,
  themeLight,
  type DockviewReadyEvent,
} from "dockview";
import { Button, Space } from "@arco-design/web-react";
import { v4 as uuid } from "uuid";
import { IconClose } from "@arco-design/web-react/icon";
import RightControls from "@/components/RightControls/RightControls";
import { dockviewJson } from "@/constant";
import StructureViewer from "@/components/StructureViewer";

const Fep = () => {
  const apiRef = useRef<DockviewApi | null>(null);

  const components = {
    leftPanel: LeftPanel,
    rightPanel: RightPanel,
    structureViewer: StructureViewer,
  };

  const tabComponents = {
    leftHeader: LeftHeader,
  };

  function LeftHeader() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>Entry List</div>
        <IconClose />
      </div>
    );
  }

  function LeftPanel() {
    return (
      <div>
        <LeftHeader />
        <Space>
          <Button
            onClick={() => {
              const id = uuid().slice(0, 8);
              openRightTab(id, id, "rightPanel");
            }}
          >
            打开标签页
          </Button>
          <Button
            onClick={() => {
              const id = uuid().slice(0, 8);
              openRightTab(id, id, "structureViewer");
            }}
          >
            打开viewer
          </Button>
        </Space>
      </div>
    );
  }

  function RightPanel() {
    return (
      <div style={{ padding: "0 20px" }}>
        <h2>welcome to fep platform!</h2>
      </div>
    );
  }

  function handleReady(e: DockviewReadyEvent) {
    const api = e.api;
    apiRef.current = api;
    if (dockviewJson) {
      api.fromJSON(dockviewJson);
      return;
    }

    // 左侧固定 panel
    const leftPanel = api.addPanel({
      id: "leftPanel",
      component: "leftPanel",
      title: "左侧固定面板",
      minimumWidth: 300,
      maximumWidth: 300,
      tabComponent: "leftHeader",
    });

    // 右侧初始 panel group
    api.addPanel({
      id: "rightPanel",
      component: "rightPanel",
      title: "welcome",
      position: {
        direction: "right", // 在左侧 panel 右边
        referencePanel: leftPanel,
      },
    });
  }

  function openRightTab(id: string, title: string, component: string) {
    const api = apiRef.current;
    if (!api) return;
    const rightPanel = api.getPanel("rightPanel");
    if (!rightPanel) return;

    const existing = api.getPanel(id);
    if (existing) {
      existing.api.setActive();
      return;
    }

    api.addPanel({
      id,
      title,
      component,
      position: {
        referenceGroup: rightPanel.group,
      },
    });
  }

  return (
    <div className={styles.container}>
      <DockviewReact
        components={components}
        tabComponents={tabComponents}
        onReady={handleReady}
        theme={themeLight}
        rightHeaderActionsComponent={RightControls}
      />
    </div>
  );
};

export default Fep;
