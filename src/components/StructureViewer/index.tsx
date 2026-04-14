import {
  DefaultPluginUISpec,
  type PluginUISpec,
} from "molstar/lib/mol-plugin-ui/spec";
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { useEffect, useRef, useState } from "react";
import type { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import {
  Checkbox,
  Layout,
  Link,
  Tree,
  Typography,
} from "@arco-design/web-react";
import {
  clearHighlights,
  highlightResidues,
  focusResidues,
  focusChains,
  highlightChains,
  loadPdb,
  loadSdf,
  toggleMoleculeVisibility,
  getSequenceData,
  getTreeDataFromSequence,
  toggleMeasurementVisibility,
  highlightMeasurement,
  removeMolecule,
} from "@/utils/viewer";
import { IconDelete, IconPlus } from "@arco-design/web-react/icon";
import { parseInt } from "lodash";
import { MySpec } from "./molstar-init";
import { extractSequence } from "@/utils/test";
import { Structure } from "molstar/lib/mol-model/structure";

const StructureViewer = () => {
  const parent = useRef<HTMLDivElement>(null);
  const [plugin, setPlugin] = useState<PluginUIContext>();
  const [sequence, setSequence] = useState<Record<string, string[]>>();
  const [proteinStructureMap, setPorteinStructureMap] = useState<
    Record<string, any>
  >({});
  const [ligandStructureMap, setLigandStructureMap] = useState<
    Record<string, any>
  >({});
  const [proteinTreeData, setProteinTreeData] = useState<any>([]);
  const [ligandTreeData, setLigandTreeData] = useState(() => {
    const ligandTreeData = [
      {
        key: "/PCG_ideal.sdf",
        title: "PCG",
        checkable: true,
      },
      {
        key: "/HEM_ideal.sdf",
        title: "HEM",
        checkable: true,
      },
    ];
    return ligandTreeData;
  });
  const [measurementTreeData, setMeasurementTreeData] = useState(() => {
    const measurementTreeData = [
      {
        key: "Distance",
        title: "Distance",
        children: [],
      },
      {
        key: "Angle",
        title: "Angle",
        children: [],
      },
      {
        key: "Diherdral",
        title: "Diherdral",
        children: [],
      },
    ];
    return measurementTreeData;
  });
  const [selectLocis, setSelectLocis] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [measurementRefs, setMeasurementRefs] = useState<Record<string, any>>(
    {},
  );

  async function createPlugin(parent: HTMLElement) {
    const plugin = await createPluginUI({
      target: parent,
      spec: MySpec,
      render: renderReact18,
    });
    await initTreeData(plugin);
    setPlugin(plugin);
  }

  async function initTreeData(plugin: PluginUIContext) {
    const proteins = ["1EF2"];
    const proteinTreeData: any = [];
    const map = {};
    for (let pdbId of proteins) {
      const structure = await loadPdb(plugin, pdbId);
      map[pdbId] = structure;
      const { entityId, sequence } = getSequenceData(structure.data!);
      const treeData = getTreeDataFromSequence(entityId, sequence);
      proteinTreeData.push(treeData);
    }
    setPorteinStructureMap(map);
    setProteinTreeData(proteinTreeData);
  }

  async function addMeasurement(
    plugin: PluginUIContext,
    locis: any[],
    type: string,
  ) {
    let res;
    if (locis.length === 2 && type === "Distance") {
      res = await plugin.managers.structure.measurement.addDistance(
        locis[0],
        locis[1],
      );
    } else if (locis.length === 3 && type === "Angle") {
      res = await plugin.managers.structure.measurement.addAngle(
        locis[0],
        locis[1],
        locis[2],
      );
    } else if (locis.length === 4 && type === "Diherdral") {
      res = await plugin.managers.structure.measurement.addDihedral(
        locis[0],
        locis[1],
        locis[2],
        locis[3],
      );
    }
    const selRef = res?.selection!;
    const repRef = res?.representation.ref!;
    const measurements = measurementTreeData.find((m) => m.key === type);
    const children = measurements?.children!;
    const num =
      children.length === 0
        ? 1
        : parseInt(children[children.length - 1].key.split(" ")[1]) + 1;
    const key = `${type} ${num}`;
    setMeasurementTreeData(
      measurementTreeData.map((m: any) => {
        if (m.key === type) {
          return {
            ...m,
            children: [...m.children, { key, title: key, checkable: true }],
          };
        } else {
          return m;
        }
      }),
    );
    setMeasurementRefs({ ...measurementRefs, [key]: { selRef, repRef } });
  }

  useEffect(() => {
    createPlugin(parent.current as HTMLDivElement);

    return () => {
      plugin?.dispose();
    };
  }, []);

  return (
    <Layout style={{ height: "calc(100vh - 35px)" }}>
      <Layout.Sider style={{ width: 300, padding: 20 }}>
        {/* <button
          onClick={() => {
            if (!plugin) return;
            // const res = extractSequence(plugin);
            // console.log(res);
            // toggleMeasurementVisibility(plugin,)
          }}
        >
          测试
        </button> */}
        <div>
          <label>Protein:</label>
          <Tree
            defaultCheckedKeys={["1EF2"]}
            treeData={proteinTreeData}
            autoExpandParent={false}
            blockNode
            onSelect={(_, { selectedNodes }) => {
              const key = selectedNodes[0].key;
              const data = key!.split(":");
              const chainId = data[0];

              if (data.length === 3) {
                const residueId = Number(data[2].split(" ")[1]);
                focusResidues({
                  plugin,
                  auth_asym_ids: [chainId],
                  auth_seq_ids: [residueId],
                });
              } else if (data.length === 2) {
                focusChains({
                  plugin,
                  auth_asym_ids: [chainId],
                });
              }
            }}
            renderTitle={(props) => {
              return (
                <div
                  onMouseEnter={() => {
                    const data = props._key!.split(":");

                    if (data.length === 3) {
                      const chainId = data[0],
                        residueId = Number(data[2].split(" ")[1]);
                      highlightResidues({
                        plugin,
                        auth_asym_ids: [chainId],
                        auth_seq_ids: [residueId],
                      });
                    } else if (data.length === 2) {
                      const chainId = data[0];
                      highlightChains({
                        plugin,
                        auth_asym_ids: [chainId],
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    clearHighlights(plugin);
                  }}
                >
                  <Typography.Ellipsis style={{ maxWidth: 210 }}>
                    {props.title}
                  </Typography.Ellipsis>
                </div>
              );
            }}
            renderExtra={(props) => {
              const key = props._key!;
              const data = key.split(":");
              if (data.length === 1) {
                return (
                  <Link
                    hoverable={false}
                    style={{ height: 32, lineHeight: "32px" }}
                    onClick={() => {
                      removeMolecule(plugin, proteinStructureMap[key]);
                    }}
                  >
                    <IconDelete />
                  </Link>
                );
              }
            }}
            onCheck={async (checkedKeys, { checked, node }) => {
              const key = node.key!;
              if (checked) {
                // 已加载
                if (proteinStructureMap[key]) {
                  toggleMoleculeVisibility(plugin, proteinStructureMap[key]);
                  return;
                }
                // 未加载
                const structure = await loadPdb(plugin, key);
                setPorteinStructureMap({
                  ...proteinStructureMap,
                  [key]: structure,
                });
                const { entityId, sequence } = getSequenceData(structure.data!);
                const treeData = getTreeDataFromSequence(entityId, sequence);
                setProteinTreeData([...proteinTreeData, treeData]);
              } else {
                toggleMoleculeVisibility(plugin, proteinStructureMap[key]);
              }
            }}
            virtualListProps={{ height: 300 }}
          />
        </div>
        <div style={{ margin: "30px 0" }}>
          <label>Ligand:</label>
          <Tree
            treeData={ligandTreeData}
            autoExpandParent={false}
            blockNode
            renderTitle={(props) => {
              return (
                <div
                  onMouseEnter={() => {
                    if (!plugin) return;
                    const key = props._key!;
                    const ligandLoci = Structure.toStructureElementLoci(
                      ligandStructureMap[key].cell?.obj?.data as any,
                    );
                    plugin.managers.interactivity.lociHighlights.highlight({
                      loci: ligandLoci,
                    });
                  }}
                  onMouseLeave={() => {
                    clearHighlights(plugin);
                  }}
                >
                  <Typography.Ellipsis style={{ maxWidth: 210 }}>
                    {props.title}
                  </Typography.Ellipsis>
                </div>
              );
            }}
            renderExtra={(props) => {
              return (
                <Link
                  hoverable={false}
                  style={{ height: 32, lineHeight: "32px" }}
                  onClick={() => {
                    const key = props._key!;
                    removeMolecule(plugin, ligandStructureMap[key]);
                  }}
                >
                  <IconDelete />
                </Link>
              );
            }}
            onCheck={async (checkedKeys, { checked, node }) => {
              const key = node.key!;
              if (checked) {
                // 已加载
                if (ligandStructureMap[key]) {
                  toggleMoleculeVisibility(plugin, ligandStructureMap[key]);
                  return;
                }
                // 未加载
                const structure = await loadSdf(plugin, key);
                setLigandStructureMap({
                  ...ligandStructureMap,
                  [key]: structure,
                });
              } else {
                toggleMoleculeVisibility(plugin, ligandStructureMap[key]);
              }
            }}
          />
        </div>
        <div>
          <label>Measurement:</label>
          <div style={{ margin: "20px 0" }}>
            <Checkbox
              checked={selectMode}
              onChange={(c) => {
                setSelectMode(c);
                plugin!.selectionMode = c;
                plugin!.behaviors.interaction.click.subscribe(({ current }) => {
                  if (current.loci.kind === "empty-loci") return;
                  setSelectLocis((selectLocis) => {
                    return [...selectLocis, current.loci];
                  });
                });
              }}
            >
              Selection Mode
            </Checkbox>
          </div>
          <Tree
            treeData={measurementTreeData}
            blockNode
            renderExtra={(props) => {
              if (!props.checkable) {
                return (
                  <Link
                    style={{ height: 32, lineHeight: "32px" }}
                    hoverable={false}
                    onClick={() => {
                      addMeasurement(plugin, selectLocis, props._key);
                      setSelectLocis([]);
                    }}
                  >
                    <IconPlus />
                  </Link>
                );
              }
            }}
            onCheck={(_, { node, checked }) => {
              const res = measurementRefs[node.key];
              toggleMeasurementVisibility(plugin, res?.selRef, checked);
            }}
            renderTitle={(props) => {
              const res = measurementRefs[props._key];
              return (
                <div
                  onMouseEnter={() => {
                    highlightMeasurement(plugin, res?.selRef.ref);
                  }}
                  onMouseLeave={() => {
                    clearHighlights(plugin);
                  }}
                >
                  <Typography.Ellipsis style={{ maxWidth: 210 }}>
                    {props.title}
                  </Typography.Ellipsis>
                </div>
              );
            }}
          />
        </div>
      </Layout.Sider>
      <Layout.Content>
        <div
          ref={parent}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        ></div>
      </Layout.Content>
    </Layout>
  );
};

export default StructureViewer;
