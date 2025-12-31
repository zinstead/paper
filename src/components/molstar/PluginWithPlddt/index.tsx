import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { MAQualityAssessment } from "molstar/lib/extensions/model-archive/quality-assessment/behavior";

import {
  StructureElement,
  StructureProperties,
} from "molstar/lib/mol-model/structure";
import { DefaultPluginSpec, PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { ColorNames } from "molstar/lib/mol-util/color/names";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";

const MyProvider = {
  label: (loci: any) => {
    if (StructureElement.Loci.is(loci)) {
      const loc = StructureElement.Loci.getFirstLocation(loci);
      if (!loc) {
        return;
      }
      const bFactor = StructureProperties.atom.B_iso_or_equiv(loc);
      return `pLDDT: ${bFactor}`;
    }
    return;
  },
};

export const createPluginWithPlddt = async (parent: HTMLElement) => {
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
      behaviors: [
        ...DefaultPluginSpec().behaviors,
        PluginSpec.Behavior(MAQualityAssessment),
      ],
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
          top: "none",
          bottom: "none",
          left: "none",
          right: "none",
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
  const preset = await plugin.builders.structure.hierarchy.applyPreset(
    trajectory,
    "default"
  );
  const cartoon = preset?.representation.representations.polymer;
  if (cartoon) {
    await plugin
      .build()
      .to(cartoon)
      .update({
        ...cartoon.cell.transform.params,
        colorTheme: { name: "plddt-confidence", params: {} },
      })
      .commit();
  }
  plugin.managers.lociLabels.addProvider(MyProvider);
};
