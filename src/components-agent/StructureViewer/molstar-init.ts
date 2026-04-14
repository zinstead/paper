import {
  DefaultPluginUISpec,
  type PluginUISpec,
} from "molstar/lib/mol-plugin-ui/spec";
import { PluginBehavior } from "molstar/lib/mol-plugin/behavior";
import { PluginConfig } from "molstar/lib/mol-plugin/config";

const ProteinAPIBehavior = PluginBehavior.create({
  name: "protein-api",
  category: "custom-props",
  display: { name: "Protein API" },

  ctor: class extends PluginBehavior.Handler {
    register() {
      const plugin = this.ctx;
      plugin.custom = {
        highlightResidues: () => {
          // console.log(plugin);
        },
      };
    }

    unregister() {
      const plugin = this.ctx;
      delete plugin.custom;
    }
  },
});

export const MySpec: PluginUISpec = {
  ...DefaultPluginUISpec(),
  config: [
    [PluginConfig.Viewport.ShowControls, true],
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
      top: "none",
      bottom: "none",
      left: "none",
      right: "none",
    },
    selectionTools: {
      controls: () => null,
    },
  },
  behaviors: [
    ...DefaultPluginUISpec().behaviors,
    { transformer: ProteinAPIBehavior },
  ],
};
