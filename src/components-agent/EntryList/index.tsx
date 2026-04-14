import { useUIStore } from "@/store/agent";
import type { PanelComponentProps } from "@/type/agent";
import {
  Button,
  Dropdown,
  Input,
  Menu,
  Tree,
  Typography,
  type TreeNodeProps,
} from "@arco-design/web-react";
import type { TreeDataType } from "@arco-design/web-react/es/Tree/interface";
import {
  IconDown,
  IconEye,
  IconEyeInvisible,
  IconLaunch,
  IconUpload,
} from "@arco-design/web-react/icon";
import { useState } from "react";

interface StateType {
  projectId: number;
}

interface TreeNode extends TreeDataType {
  open: boolean;
  type: string;
}

const EntryList = (props: PanelComponentProps<StateType>) => {
  // const { state, setState } = props;
  const dockviewApi = useUIStore((store) => store.dockviewApi);

  const [treeData, setTreeData] = useState<TreeNode[]>([
    {
      key: "401",
      title: "protein1 (ID:401)",
      children: [
        {
          key: "402",
          title: "confactor1 (ID:402)",
          open: false,
          type: "ligand",
        },
      ],
      open: true,
      type: "protein",
    },
    {
      key: "501",
      title: "labeled_protein1 (ID:501)",
      children: [
        {
          key: "502",
          title: "confactor2 (ID:502)",
          open: false,
          type: "ligand",
        },
      ],
      open: false,
      type: "protein",
    },
    {
      key: "601",
      title: "ligands1 (ID:601)",
      children: [
        {
          key: "602",
          title: "perturbation map 1 (ID:602)",
          open: false,
          type: "perturbationMap",
        },
      ],
      open: false,
      type: "ligand",
    },
    {
      key: "701",
      title: "aligned_ligands2 (ID:701)",
      children: [
        {
          key: "702",
          title: "perturbation map 2 (ID:702)",
          open: false,
          type: "perturbationMap",
        },
      ],
      open: false,
      type: "ligand",
    },
  ]);

  const toggleNodeField = (params: {
    key: string;
    field: string;
    value: any;
  }) => {
    const { key, field, value } = params;
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.key === key) {
          return { ...node, [field]: value };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children as TreeNode[]) };
        }
        return node;
      });
    };
    setTreeData((prevData) => updateNode(prevData));
  };

  function handleClickEye(params: { type: string; key: string; value: any }) {
    const { key, value, type } = params;
    // const title = "Structure Viewer";
    // if (!dockviewApi) return;
    // if (type === "protein") {
    //   dockviewApi.addPanel({ id: key, title, component: "structureViewer" });
    // } else if (type === "ligand") {
    //   dockviewApi.addPanel({ id: key, title, component: "structureViewer" });
    // } else if (type === "perturbationMap") {
    //   dockviewApi.addPanel({
    //     id: key,
    //     title: key,
    //     component: "perturbationMap",
    //   });
    // }
    toggleNodeField({ key, value, field: "open" });
  }

  const uploadDropList = (
    <Menu>
      <Menu.Item key="Protein">Protein</Menu.Item>
      <Menu.Item key="Ligand">Ligand</Menu.Item>
      <Menu.Item key="PerturbationMap">PerturbationMap</Menu.Item>
    </Menu>
  );

  const taskDropList = (
    <Menu>
      <Menu.SubMenu key="rbfep" title={"RBFEP"}>
        <Menu.Item key="rpp">Protein Prepare</Menu.Item>
        <Menu.Item key="rla">Ligand Align</Menu.Item>
        <Menu.Item key="rlp">Ligand Prepare</Menu.Item>
        <Menu.Item key="rpm">Perturbation Map</Menu.Item>
        <Menu.Item key="rs">Submit</Menu.Item>
        <Menu.Item key="rc">Correct</Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu key="abfep" title={"ABFEP"}>
        <Menu.Item key="app">Protein Prepare</Menu.Item>
        <Menu.Item key="alp">Ligand Prepare</Menu.Item>
        <Menu.Item key="as">Submit</Menu.Item>
        <Menu.Item key="ac">Correct</Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu key="md" title={"MD"}>
        <Menu.Item key="mpp">Protein Prepare</Menu.Item>
        <Menu.Item key="mlp">Ligand Prepare</Menu.Item>
        <Menu.Item key="ms">Submit</Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );

  return (
    <div style={{ width: 500, padding: "0 20px", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 20 }}>
        <Typography.Title heading={4}>Entry List</Typography.Title>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Dropdown droplist={taskDropList} position="bl">
            <Button type="primary" icon={<IconLaunch />}>
              Task
            </Button>
          </Dropdown>
          <Dropdown droplist={uploadDropList} position="br">
            <Button type="primary" icon={<IconUpload />}>
              Upload
            </Button>
          </Dropdown>
        </div>
      </div>
      <Input.Search style={{ marginBottom: 20 }} />
      <Tree
        treeData={treeData}
        autoExpandParent={false}
        blockNode
        renderExtra={(props) => {
          const node = props.dataRef as TreeNode;
          return (
            <div
              style={{
                width: 32,
                lineHeight: "32px",
                display: "flex",
                justifyContent: "center",
              }}
              onClick={() => {
                toggleNodeField({
                  key: node.key!,
                  value: !node.open,
                  field: "open",
                });
              }}
            >
              {node.open ? <IconEye /> : <IconEyeInvisible />}
            </div>
          );
        }}
      />
    </div>
  );
};

export default EntryList;
