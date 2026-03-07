import { useRef, useState } from "react";
import styles from "./index.module.less";
import {
  DockviewReact,
  DockviewApi,
  themeLight,
  type DockviewReadyEvent,
} from "dockview";
import {
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  Tree,
} from "@arco-design/web-react";
import { v4 as uuid } from "uuid";
import {
  IconApps,
  IconBulb,
  IconClose,
  IconDown,
  IconEye,
  IconEyeInvisible,
  IconFire,
  IconHome,
  IconLaunch,
  IconLayout,
  IconRobot,
  IconSafe,
  IconSave,
  IconSettings,
  IconShareAlt,
  IconUser,
} from "@arco-design/web-react/icon";
import RightControls from "@/components/RightControls/RightControls";
import { dockviewJson } from "@/constant";
import StructureViewer from "@/components/StructureViewer";
import PerturbationMap from "@/components/PerturbationMap";

const Fep = () => {
  const apiRef = useRef<DockviewApi | null>(null);

  const components = {
    leftPanel: LeftPanel,
    rightPanel: RightPanel,
    structureViewer: StructureViewer,
    perturbationMap: PerturbationMap,
  };

  function LeftPanel() {
    const [treeData, setTreeData] = useState<any>([
      {
        key: "protein1",
        title: "protein1",
        children: [
          {
            key: "confactor1",
            title: "confactor1",
            open: false,
            type: "ligand",
          },
        ],
        open: true,
        type: "protein",
      },
      {
        key: "labeled_protein1",
        title: "labeled_protein1",
        children: [
          {
            key: "confactor2",
            title: "confactor2",
            open: false,
            type: "ligand",
          },
        ],
        open: false,
        type: "protein",
      },
      {
        key: "ligands1",
        title: "ligands1",
        children: [
          {
            key: "perturbation map 1",
            title: "perturbation map 1",
            open: false,
            type: "perturbationMap",
          },
        ],
        open: false,
        type: "ligand",
      },
      {
        key: "aligned_ligands2",
        title: "aligned_ligands2",
        children: [
          {
            key: "perturbation map 2",
            title: "perturbation map 2",
            open: false,
            type: "perturbationMap",
          },
        ],
        open: false,
        type: "ligand",
      },
    ]);

    function toggleOpen(key: string) {
      setTreeData((data) => {
        data.forEach((node) => {
          if (node.key === key) {
            node.open = !node.open;
          }
          if (Array.isArray(node.children)) {
            node.children.forEach((n) => {
              if (n.key === key) {
                n.open = !n.open;
              }
            });
          }
        });
        return data;
      });
    }

    function handleClickEye(params: { type: string; id: string }) {
      const { id, type } = params;
      const title = "Structure Viewer";
      if (type === "protein") {
        openRightTab(id, title, "structureViewer");
      } else if (type === "ligand") {
        openRightTab(id, title, "structureViewer");
      } else if (type === "perturbationMap") {
        openRightTab(id, title, "perturbationMap");
      }
      toggleOpen(id);
    }

    const dropList = (
      <Menu>
        <Menu.Item key="Protein">Protein</Menu.Item>
        <Menu.Item key="Ligand">Ligand</Menu.Item>
        <Menu.Item key="PerturbationMap">PerturbationMap</Menu.Item>
      </Menu>
    );

    return (
      <div style={{ padding: "12px 20px" }}>
        <div style={{ marginBottom: 30 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              fontSize: 18,
            }}
          >
            <div>Entry List</div>
            <IconClose className={styles.operatorIcon} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button.Group>
              <Button type="primary">Upload</Button>
              <Dropdown droplist={dropList} position="br">
                <Button type="primary" icon={<IconDown />} />
              </Dropdown>
            </Button.Group>
          </div>
        </div>
        {/* <Space>
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
        </Space> */}
        <Tree
          treeData={treeData}
          autoExpandParent={false}
          blockNode
          renderExtra={(props) => {
            return (
              <div
                style={{ width: 32, lineHeight: "32px" }}
                onClick={() => {
                  handleClickEye({ type: props.type, id: props._key });
                }}
              >
                {props.open ? <IconEye /> : <IconEyeInvisible />}
              </div>
            );
          }}
        />
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
    // if (dockviewJson) {
    //   api.fromJSON(dockviewJson);
    //   return;
    // }

    // 左侧固定 panel
    const leftPanel = api.addPanel({
      id: "leftPanel",
      component: "leftPanel",
      title: "左侧固定面板",
      minimumWidth: 300,
      maximumWidth: 300,
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
    <Layout>
      <Layout.Sider style={{ width: 51.5 }}>
        <div style={{ display: "flex", height: "100vh" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              fontSize: 20,
              color: "rgba(0, 0, 0, 0.6)",
              width: 50,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconHome />

                <span style={{ fontSize: 10 }}>Home</span>
              </div>
            </div>
            <Space direction="vertical" size={16}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconLayout />
                <span style={{ fontSize: 10 }}>View</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconLaunch />
                <span style={{ fontSize: 10 }}>Func</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconSettings />
                <span style={{ fontSize: 10 }}>Setting</span>
              </div>
            </Space>
            <Space direction="vertical" size={16}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconSave />
                <span style={{ fontSize: 10 }}>Save</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconShareAlt />
                <span style={{ fontSize: 10 }}>Share</span>
              </div>
            </Space>
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <IconUser />
                <span style={{ fontSize: 10 }}>User</span>
              </div>
            </div>
          </div>
          <div style={{ width: 1.5, backgroundColor: "#d3d3d3" }}></div>
        </div>
      </Layout.Sider>
      <Layout.Content>
        <div className={styles.container}>
          <DockviewReact
            components={components}
            onReady={handleReady}
            theme={themeLight}
            rightHeaderActionsComponent={RightControls}
          />
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default Fep;
