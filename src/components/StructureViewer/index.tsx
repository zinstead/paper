import {
  DefaultPluginUISpec,
  type PluginUISpec,
} from "molstar/lib/mol-plugin-ui/spec";
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { useEffect, useRef } from "react";
import type { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import "molstar/lib/mol-plugin-ui/skin/light.scss";

const MySpec: PluginUISpec = {
  ...DefaultPluginUISpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
};

const StructureViewer = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<PluginUIContext | null>(null);

  async function createPlugin(parent: HTMLElement) {
    const plugin = await createPluginUI({
      target: parent,
      spec: MySpec,
      render: renderReact18,
    });
    pluginRef.current = plugin;

    const data = await plugin.builders.data.download(
      { url: "https://files.rcsb.org/download/2GMX.pdb" },
      { state: { isGhost: true } }
    );
    const trajectory = await plugin.builders.structure.parseTrajectory(
      data,
      "pdb"
    );
    const res = await plugin.builders.structure.hierarchy.applyPreset(
      trajectory,
      "default"
    )!;

    await plugin.builders.structure.representation.addRepresentation(
      // res.representation.components.polymer,
      res.structure,
      {
        type: "line",
        color: "element-symbol",
        // typeParams: {
        //   ignoreHydrogens: false,
        //   ignoreHydrogensVariant: "non-polar",
        // },
      }
    );
  }

  useEffect(() => {
    if (!parentRef.current) return;
    createPlugin(parentRef.current);

    return () => {
      const plugin = pluginRef.current;
      plugin?.dispose();
    };
  }, []);

  return <div ref={parentRef} style={{ width: 800, height: 600 }}></div>;
};

export default StructureViewer;
