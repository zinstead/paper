import {
  Structure,
  StructureElement,
  StructureProperties,
} from "molstar/lib/mol-model/structure";
import type { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";

export function hideLigands(plugin: PluginUIContext) {
  const { structures } = plugin.managers.structure.hierarchy.current;

  for (const s of structures) {
    for (const component of s.components) {
      // Mol* 默认定义的组件标签包含 'ligand' 或 'non-standard'
      const label = component.cell.obj?.label.toLowerCase();
      if (label?.includes("ligand") || label?.includes("non-standard")) {
        plugin.managers.structure.component.toggleVisibility([component]);
      }
    }
  }
}

export async function removeMolecule(plugin: PluginUIContext, structure: any) {
  await plugin.build().delete(structure.cell?.transform.ref).commit();
}

export function toggleMoleculeVisibility(
  plugin: PluginUIContext,
  structure: any,
) {
  plugin.managers.structure.hierarchy.toggleVisibility([structure]);
}

export async function loadSdf(plugin: PluginUIContext, url: string) {
  const data = await plugin.builders.data.download(
    { url },
    { state: { isGhost: true } },
  );
  const trajectory = await plugin.builders.structure.parseTrajectory(
    data,
    "sdf",
  );
  const res = await plugin.builders.structure.hierarchy.applyPreset(
    trajectory,
    "default",
  )!;
  return res.structure;

  // const model = await plugin.builders.structure.createModel(trajectory);
  // const structure = await plugin.builders.structure.createStructure(model);
  // await plugin.builders.structure.representation.addRepresentation(structure, {
  //   type: "ball-and-stick",
  //   color: "uniform",
  //   typeParams: {
  //     sizeFactor: 0.1,
  //     sizeAspectRatio: 2.0, // 增粗 bond
  //     tryUseImpostor: true,
  //   },
  // });
  // return structure.cell?.obj?.data;
}

export async function loadPdb(plugin: PluginUIContext, pdbId: string) {
  const rcsb = "https://files.rcsb.org/download";
  const data = await plugin.builders.data.download(
    { url: `${rcsb}/${pdbId}.pdb` },
    { state: { isGhost: true } },
  );

  const trajectory = await plugin.builders.structure.parseTrajectory(
    data,
    "pdb",
  );
  const res = await plugin.builders.structure.hierarchy.applyPreset(
    trajectory,
    "default",
  )!;
  await plugin.builders.structure.representation.addRepresentation(
    res.structure,
    {
      type: "line",
    },
  );

  return res.structure;
}

export function getSequenceData(structure: Structure) {
  const result: Record<string, string[]> = {};
  // const structure = plugin.managers.structure.hierarchy.current.structures[0]
  //   ?.cell?.obj?.data as Structure;
  Structure.eachAtomicHierarchyElement(structure, {
    residue: (loc) => {
      // const chainType = StructureProperties.entity.type(loc);
      const description = StructureProperties.entity.pdbx_description(loc);
      const chainId = StructureProperties.chain.auth_asym_id(loc);
      const residueId = StructureProperties.residue.auth_seq_id(loc);
      const compId = StructureProperties.residue.auth_comp_id(loc);
      const chainName = `${chainId}:${description}`;
      if (!result[chainName]) {
        result[chainName] = [];
      }
      result[chainName].push(`${compId} ${residueId}`);
    },
  });
  const entityId = structure?.models[0].entryId;
  return { entityId, sequence: result };
}

export function getTreeDataFromSequence(
  entityId: string,
  sequence: Record<string, string[]>,
) {
  return {
    key: entityId,
    title: entityId,
    children: Object.keys(sequence).map((chainName, i) => {
      const [chainId, description] = chainName.split(":");
      return {
        key: `${chainId}:${i}`,
        title: `${chainId}: ${description}`,
        children: sequence[chainName].map((residueId) => {
          return {
            key: `${chainId}:${i}:${residueId}`,
            title: residueId,
          };
        }),
      };
    }),
    checkable: true,
  };
}

export function getLociFromResidues(params: {
  plugin: PluginUIContext;
  auth_asym_ids?: string[];
  auth_seq_ids?: number[];
}) {
  const { auth_asym_ids, auth_seq_ids, plugin } = params;
  const structure = plugin.managers.structure.hierarchy.current.structures[0]
    ?.cell?.obj?.data as Structure;
  const residues: StructureElement.Schema = {
    items: {
      auth_asym_id: auth_asym_ids,
      auth_seq_id: auth_seq_ids,
    },
  };
  const loci = StructureElement.Loci.fromSchema(structure, residues);
  return loci;
}

export function getLociFromChains(params: {
  plugin: PluginUIContext;
  auth_asym_ids?: string[];
}) {
  const { auth_asym_ids, plugin } = params;
  const structure = plugin.managers.structure.hierarchy.current.structures[0]
    ?.cell?.obj?.data as Structure;
  const residues: StructureElement.Schema = {
    items: {
      auth_asym_id: auth_asym_ids,
    },
  };
  const loci = StructureElement.Loci.fromSchema(structure, residues);
  return loci;
}

export function highlightResidues(params: {
  plugin: PluginUIContext;
  auth_asym_ids?: string[];
  auth_seq_ids?: number[];
}) {
  const loci = getLociFromResidues(params);
  params.plugin.managers.interactivity.lociHighlights.highlight({ loci });
}

export function highlightChains(params: {
  plugin: PluginUIContext;
  auth_asym_ids?: string[];
  auth_seq_ids?: number[];
}) {
  const loci = getLociFromChains(params);
  params.plugin.managers.interactivity.lociHighlights.highlight({ loci });
}

export function clearHighlights(plugin: PluginUIContext) {
  plugin.managers.interactivity.lociHighlights.clearHighlights();
}

export function focusResidues(params: {
  plugin: PluginUIContext;
  auth_asym_ids?: string[];
  auth_seq_ids?: number[];
}) {
  const loci = getLociFromResidues(params);
  params.plugin.managers.camera.focusLoci(loci);
}

export function focusChains(params: {
  plugin: PluginUIContext;
  auth_asym_ids?: string[];
}) {
  const loci = getLociFromChains(params);
  params.plugin.managers.camera.focusLoci(loci);
}

export function toggleMeasurementVisibility(
  plugin: PluginUIContext,
  ref: string,
  visible: boolean,
) {
  plugin.state.data.updateCellState(ref, {
    isHidden: !visible,
  });
}

export function highlightMeasurement(plugin: PluginUIContext, ref: string) {
  const cell = plugin.state.data.cells.get(ref);
  if (!cell) return;

  const params = cell.transform.params;
  const structure =
    plugin.managers.structure.hierarchy.current.structures[0].cell.obj?.data!;

  const lociA = StructureElement.Bundle.toLoci(
    params.selections[0].bundle,
    structure,
  );
  const lociB = StructureElement.Bundle.toLoci(
    params.selections[1].bundle,
    structure,
  );

  plugin.managers.interactivity.lociHighlights.highlight({ loci: lociA });
  plugin.managers.interactivity.lociHighlights.highlight({ loci: lociB });
}
