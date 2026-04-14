import type { ProteinSequence, ResidueMap } from "@/type/molstar";
import {
  Structure,
  StructureElement,
  StructureProperties,
  StructureSelection,
} from "molstar/lib/mol-model/structure";
import type { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import {
  MolScriptBuilder,
  MolScriptBuilder as MS,
} from "molstar/lib/mol-script/language/builder";
import type { Expression } from "molstar/lib/mol-script/language/expression";
import { Script } from "molstar/lib/mol-script/script";

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
  plugin.managers.structure.hierarchy.remove([structure]);
}

export function toggleMoleculeVisibility(
  plugin: PluginUIContext,
  structure: any,
) {
  plugin.managers.structure.hierarchy.toggleVisibility([structure]);
}

export async function loadSdf(plugin: PluginUIContext, url: string) {
  const data = await plugin.builders.data.download({ url });
  const trajectory = await plugin.builders.structure.parseTrajectory(
    data,
    "sdf",
  );
  const model = await plugin.builders.structure.createModel(trajectory);
  const structure = await plugin.builders.structure.createStructure(model);
  await plugin.builders.structure.representation.addRepresentation(structure, {
    type: "ball-and-stick",
    color: "uniform",
    typeParams: {
      sizeFactor: 0.1,
      sizeAspectRatio: 2.0, // 增粗 bond
      tryUseImpostor: true,
    },
  });
  return structure;
}

export async function loadPdb(plugin: PluginUIContext, pdbId: string) {
  const url = `https://files.rcsb.org/download/${pdbId}.pdb`;

  const data = await plugin.builders.data.download({ url });
  const trajectory = await plugin.builders.structure.parseTrajectory(
    data,
    "pdb",
  );
  const model = await plugin.builders.structure.createModel(trajectory);
  const structure = await plugin.builders.structure.createStructure(model, {
    name: "model",
    params: { dynamicBonds: false },
  });
  await plugin.builders.structure.representation.addRepresentation(structure, {
    type: "cartoon",
    color: "chain-id",
  });
  await plugin.builders.structure.representation.addRepresentation(structure, {
    type: "line",
    color: "element-symbol",
  });
  return structure;
}

export function getSequenceData(structure: Structure) {
  const sequence: ProteinSequence = {};
  // const structure = plugin.managers.structure.hierarchy.current.structures[0]
  //   ?.cell?.obj?.data as Structure;
  Structure.eachAtomicHierarchyElement(structure, {
    residue: (loc) => {
      const chainType = StructureProperties.entity.type(loc);
      if (chainType !== "polymer") return;
      const auth_asym_id = StructureProperties.chain.auth_asym_id(loc);
      const description = StructureProperties.entity.pdbx_description(loc);
      const auth_seq_id = StructureProperties.residue.auth_seq_id(loc);
      const auth_comp_id = StructureProperties.residue.auth_comp_id(loc);
      const ins_code = StructureProperties.residue.pdbx_PDB_ins_code(loc);
      if (!sequence[auth_asym_id]) {
        sequence[auth_asym_id] = { description, residues: [] };
      }
      sequence[auth_asym_id].residues.push({
        auth_asym_id,
        auth_seq_id,
        auth_comp_id,
        ins_code,
      });
    },
  });
  const entryId = structure?.models[0].entryId;
  return { entryId, sequence };
}

export function getTreeDataFromSequence(
  entryId: string,
  sequence: ProteinSequence,
) {
  return {
    key: entryId,
    title: entryId,
    children: Object.keys(sequence).map((auth_asym_id, i) => {
      const { description, residues } = sequence[auth_asym_id];
      return {
        key: auth_asym_id,
        title: `${auth_asym_id}: ${description}`,
        children: residues.map(
          ({ auth_asym_id, auth_seq_id, auth_comp_id, ins_code }) => {
            return {
              key: `${auth_asym_id}:${auth_seq_id}`,
              title: `${auth_comp_id} ${auth_seq_id}`,
              data: { auth_asym_id, auth_seq_id, auth_comp_id, ins_code },
            };
          },
        ),
      };
    }),
    checkable: true,
  };
}

export function highlightResidues(params: {
  plugin: PluginUIContext;
  structure: Structure;
  residues: ResidueMap;
}) {
  const { plugin, structure, residues } = params;
  const loci = getLociFromResidues(structure, residues);
  plugin.managers.interactivity.lociHighlights.highlight({ loci });
}

export function highlightChains(params: {
  plugin: PluginUIContext;
  structure: Structure;
  auth_asym_ids: string[];
}) {
  const { plugin, structure, auth_asym_ids } = params;
  const loci = getLociFromChains(structure, auth_asym_ids);
  plugin.managers.interactivity.lociHighlights.highlight({ loci });
}

export function clearHighlights(plugin: PluginUIContext) {
  plugin.managers.interactivity.lociHighlights.clearHighlights();
}

export function focusResidues(params: {
  plugin: PluginUIContext;
  structure: Structure;
  residues: ResidueMap;
}) {
  const { plugin, structure, residues } = params;
  const loci = getLociFromResidues(structure, residues);
  plugin.managers.camera.focusLoci(loci);
}

export function focusChains(params: {
  plugin: PluginUIContext;
  structure: Structure;
  auth_asym_ids: string[];
}) {
  const { plugin, structure, auth_asym_ids } = params;
  const loci = getLociFromChains(structure, auth_asym_ids);
  plugin.managers.camera.focusLoci(loci);
}

export function toggleMeasurementVisibility(plugin: PluginUIContext, ref: any) {
  // plugin.state.data.updateCellState(ref, {
  //   isHidden: !visible,
  // });
  plugin.managers.structure.hierarchy.toggleVisibility([ref]);
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

export function getLoci(structure: Structure) {
  const residuesMap: Record<string, { seq_id: number; ins_code: string }[]> = {
    A: [
      { seq_id: 1, ins_code: "A" },
      { seq_id: 2, ins_code: "B" },
    ],
    B: [
      { seq_id: 11, ins_code: "" },
      { seq_id: 12, ins_code: "" },
    ],
  };

  const groups: Expression[] = [];
  for (const [asym_id, residues] of Object.entries(residuesMap)) {
    for (const { seq_id, ins_code } of residues) {
      groups.push(
        MS.struct.generator.atomGroups({
          "chain-test": MS.core.rel.eq([
            MS.struct.atomProperty.macromolecular.auth_asym_id(),
            asym_id,
          ]),
          "residue-test": MS.core.logic.and([
            MS.core.rel.eq([
              MS.struct.atomProperty.macromolecular.auth_seq_id(),
              seq_id,
            ]),
            MS.core.rel.eq([
              MS.struct.atomProperty.macromolecular.pdbx_PDB_ins_code(),
              ins_code,
            ]),
          ]),
        }),
      );
    }
  }
  const selection = Script.getStructureSelection(
    MolScriptBuilder.struct.combinator.merge(groups),
    structure,
  );
  const loci = StructureSelection.toLociWithSourceUnits(selection);
  return loci;
}

export function getLociFromResidues(
  structure: Structure,
  residueMap: ResidueMap,
) {
  // const residuesMap: Record<string, { seq_id: number; ins_code: string }[]> = {
  //   A: [
  //     { seq_id: 1, ins_code: "A" },
  //     { seq_id: 2, ins_code: "B" },
  //   ],
  //   B: [
  //     { seq_id: 11, ins_code: "" },
  //     { seq_id: 12, ins_code: "" },
  //   ],
  // };

  const items: StructureElement.SchemaItem[] = [];
  for (const [asym_id, residues] of Object.entries(residueMap)) {
    for (const { seq_id, ins_code } of residues) {
      items.push({
        auth_asym_id: asym_id,
        auth_seq_id: seq_id,
        pdbx_PDB_ins_code: ins_code,
      });
    }
  }

  const loci = StructureElement.Loci.fromSchema(structure, { items });
  return loci;
}

export function getLociFromChains(
  structure: Structure,
  auth_asym_ids: string[],
) {
  const residues: StructureElement.Schema = {
    items: {
      auth_asym_id: auth_asym_ids,
    },
  };
  const loci = StructureElement.Loci.fromSchema(structure, residues);
  return loci;
}
