import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { ColorNames } from "molstar/lib/mol-util/color/names";
import { SequenceView } from "@/components/molstar/mol-plugin-ui/sequence";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";

export const createMolstarPluginAndLoadData = async (
  parent: HTMLElement,
  data: string
) => {
  const plugin = await createPluginUI({
    target: parent,
    render: renderReact18,
    spec: {
      ...DefaultPluginSpec(),
      layout: {
        initial: {
          showControls: true,
        },
      },
      config: [
        [PluginConfig.Viewport.ShowControls, false],
        [PluginConfig.Viewport.ShowExpand, false],
        [PluginConfig.Viewport.ShowSelectionMode, false],
        [PluginConfig.Viewport.ShowSettings, false],
        [PluginConfig.Viewport.ShowTrajectoryControls, false],
        [PluginConfig.Viewport.ShowAnimation, false],
        [PluginConfig.Viewport.ShowScreenshotControls, false],
      ],
      components: {
        viewport: {
          controls: () => null,
        },
        controls: {
          left: () => <SequenceView defaultMode="polymers" />,
          right: "none",
          top: "none",
          bottom: "none",
        },
        selectionTools: {
          controls: () => null,
        },
      },
      canvas3d: {
        renderer: {
          backgroundColor: ColorNames.white,
        },
      },
    },
  });
  if (data) {
    const rawData = await plugin.builders.data.rawData({
      data,
    });
    const trajectory = await plugin.builders.structure.parseTrajectory(
      rawData,
      "mmcif"
    );
    await plugin.builders.structure.hierarchy.applyPreset(
      trajectory,
      "default"
    );
  }
  return plugin;
};

export const createMolstarPlugin = async (parent: HTMLElement) => {
  const plugin = await createPluginUI({
    target: parent,
    render: renderReact18,
    spec: {
      ...DefaultPluginSpec(),
      layout: {
        initial: {
          showControls: true,
        },
      },
      config: [
        [PluginConfig.Viewport.ShowControls, false],
        [PluginConfig.Viewport.ShowExpand, false],
        [PluginConfig.Viewport.ShowSelectionMode, false],
        [PluginConfig.Viewport.ShowSettings, false],
        [PluginConfig.Viewport.ShowTrajectoryControls, false],
        [PluginConfig.Viewport.ShowAnimation, false],
        [PluginConfig.Viewport.ShowScreenshotControls, false],
      ],
      components: {
        viewport: {
          controls: () => null,
        },
        controls: {
          left: () => <SequenceView defaultMode="polymers" />,
          right: "none",
          top: "none",
          bottom: "none",
        },
        selectionTools: {
          controls: () => null,
        },
      },
      canvas3d: {
        renderer: {
          backgroundColor: ColorNames.white,
        },
      },
    },
  });
  return plugin;
};

export const loadCifData = async (plugin: PluginUIContext, data: string) => {
  const rawData = await plugin.builders.data.rawData({
    data,
  });
  const trajectory = await plugin.builders.structure.parseTrajectory(
    rawData,
    "mmcif"
  );
  await plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
};
