import { difference, isEmpty } from "lodash";
import {
  Structure,
  StructureProperties,
} from "molstar/lib/mol-model/structure";
import { StructureSelectionQuery } from "molstar/lib/mol-plugin-state/helpers/structure-selection-query";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { PluginCommands } from "molstar/lib/mol-plugin/commands";
import {
  MolScriptBuilder,
  MolScriptBuilder as MS,
} from "molstar/lib/mol-script/language/builder";
import { Expression } from "molstar/lib/mol-script/language/expression";
import { Color } from "molstar/lib/mol-util/color";

export function getSequenceFromStructure(plugin: PluginUIContext) {
  const structure = plugin.managers.structure.hierarchy.current.structures[0]
    ?.cell?.obj?.data as Structure;

  const chainMap = new Map<string, Map<string, any>>();

  Structure.eachAtomicHierarchyElement(structure, {
    residue: (loc) => {
      if (StructureProperties.entity.type(loc) !== "polymer") return;

      const chain = StructureProperties.chain.auth_asym_id(loc);
      const description = StructureProperties.entity.pdbx_description(loc);
      const residue = StructureProperties.residue.auth_seq_id(loc);
      const comp = StructureProperties.residue.auth_comp_id(loc);
      const insCode = StructureProperties.residue.pdbx_PDB_ins_code(loc) || "";

      if (!chainMap.has(chain)) {
        chainMap.set(chain, new Map());
      }

      const residues = chainMap.get(chain)!;
      const key = `${residue}_${insCode}`;

      if (!residues.has(key)) {
        residues.set(key, {
          chain,
          residue,
          comp,
          insCode,
        });
      }
    },
  });

  return Array.from(chainMap.entries()).map(([chain, residues]) => ({
    chain,
    residues: Array.from(residues.values()),
  }));
}

// Modify the 3d structural color of some residues
export async function color3DByResidues(
  plugin: PluginUIContext,
  residues: Record<string, number[]>,
  color: Color,
) {
  const query = getSelectionQueryFromResidues(residues);
  await plugin.managers.structure.component.applyTheme({
    selection: query,
    action: { name: "color", params: { color } },
    representations: ["cartoon"],
  });
}

export async function resetColor3DByResidues(
  plugin: PluginUIContext,
  residues: Record<string, number[]>,
) {
  const query = getSelectionQueryFromResidues(residues);
  await plugin.managers.structure.component.applyTheme({
    selection: query,
    action: { name: "resetColor", params: {} },
    representations: ["cartoon"],
  });
}

export async function emissive3DByResidues(
  plugin: PluginUIContext,
  residues: Record<string, number[]>,
  emissive: number,
) {
  const query = getSelectionQueryFromResidues(residues);
  await plugin.managers.structure.component.applyTheme({
    selection: query,
    action: { name: "emissive", params: { value: emissive } },
    representations: ["cartoon"],
  });
}

export async function transparency3DByResidues(
  plugin: PluginUIContext,
  residues: Record<string, number[]>,
  transparency: number,
) {
  const query = getSelectionQueryFromResidues(residues);
  await plugin.managers.structure.component.applyTheme({
    selection: query,
    action: { name: "transparency", params: { value: transparency } },
    representations: ["cartoon"],
  });
}

// Modify the color selection
export function changeSelectionColor(
  plugin: PluginUIContext,
  params: { selectColor: Color; selectEdgeColor: Color },
) {
  const { selectColor, selectEdgeColor } = params;
  const renderer = plugin.canvas3d!.props.renderer;
  const marking = plugin.canvas3d!.props.marking;
  PluginCommands.Canvas3D.SetSettings(plugin, {
    settings: {
      renderer: { ...renderer, selectColor },
      marking: { ...marking, selectEdgeColor },
    },
  });
}

export function getAllResiduesOfSequence(plugin: PluginUIContext) {
  const structure =
    plugin.managers.structure.hierarchy.current.structures[0]?.cell?.obj?.data;
  const residues = getResiduesFromStructure(structure!);
  return residues;
}

export function getResiduesFromCrop(crop: Record<string, string>[]) {
  const result: Record<string, number[]> = {};
  Object.entries(crop[0]).forEach(([chainId, rangeStr]) => {
    const ranges = rangeStr.split(",");
    ranges.forEach((item) => {
      const [start, end] = item.split("-");
      for (let i = Number.parseInt(start); i <= Number.parseInt(end); i++) {
        if (!result[chainId]) {
          result[chainId] = [];
        }
        result[chainId].push(i);
      }
    });
  });
  return result;
}

export function getSelectionQueryFromResidues(
  residues: Record<string, number[]>,
) {
  const groups: Expression[] = [];
  Object.entries(residues).forEach(([chainId, residueIds]) => {
    for (const residueId of residueIds) {
      groups.push(
        MolScriptBuilder.struct.generator.atomGroups({
          "chain-test": MolScriptBuilder.core.rel.eq([
            MolScriptBuilder.struct.atomProperty.macromolecular.label_asym_id(),
            chainId,
          ]),
          // 'residue-test': MolScriptBuilder.core.rel.inRange([
          //   MolScriptBuilder.struct.atomProperty.macromolecular.label_seq_id(),
          //   chain[1],
          //   chain[2],
          // ]),
          "residue-test": MolScriptBuilder.core.rel.eq([
            MolScriptBuilder.struct.atomProperty.macromolecular.label_seq_id(),
            residueId,
          ]),
        }),
      );
    }
  });
  const sq = StructureSelectionQuery(
    "residue_range",
    MolScriptBuilder.struct.combinator.merge(groups),
  );
  return sq;
}

export function getResiduesFromStructure(structure: Structure) {
  const result: Record<string, number[]> = {};
  Structure.eachAtomicHierarchyElement(structure, {
    // Get a chain sequence
    // chain: loc => {
    //   const chainGroupId = loc.unit.chainGroupId;
    //   const sequences = loc.unit.model.sequence.sequences;
    //   const chainSequence = sequences[chainGroupId].sequence.label
    //     .__array as string[];
    // },
    residue: (loc) => {
      const chainType = StructureProperties.entity.type(loc);
      if (chainType === "polymer") {
        const chainId = StructureProperties.chain.label_asym_id(loc);
        const residueId = StructureProperties.residue.label_seq_id(loc);
        if (!result[chainId]) {
          result[chainId] = [];
        }
        result[chainId].push(residueId);
      }
    },
  });
  return result;
}

export function getResiduesFromSelection(plugin: PluginUIContext) {
  // const result: ResidueItem[] = [];
  const result: Record<string, number[]> = {};
  let hasError = false;
  const selections = Array.from(
    plugin.managers.structure.selection.entries.values(),
  );

  for (const { structure } of selections) {
    if (!structure) {
      continue;
    }

    Structure.eachAtomicHierarchyElement(structure, {
      // Get a chain sequence
      // chain: loc => {
      //   const chainGroupId = loc.unit.chainGroupId;
      //   const sequences = loc.unit.model.sequence.sequences;
      //   const chainSequence = sequences[chainGroupId].sequence.label
      //     .__array as string[];
      // },
      residue: (loc) => {
        const chainSubtype = StructureProperties.entity.subtype(loc);
        if (chainSubtype === "polypeptide(L)") {
          const chainId = StructureProperties.chain.label_asym_id(loc);
          const residueId = StructureProperties.residue.label_seq_id(loc);
          // result.push({ chainId, residueId });
          if (!result[chainId]) {
            result[chainId] = [];
          }
          result[chainId].push(residueId);
        } else {
          hasError = true;
        }
      },
    });
  }
  const errMsg = hasError
    ? "Support for selecting small molecules, nucleic acids, and more as targets and hotspots is coming soon ⏳"
    : "";
  return { residues: result, errMsg };
}

export function isHotspotCropped(
  cropTarget: Record<string, number[]>,
  specifyHotspot: Record<string, number[]>,
) {
  for (const [chainId, ids] of Object.entries(specifyHotspot)) {
    if (difference(ids, cropTarget[chainId]).length > 0) {
      return false;
    }
  }
  return true;
}

export function getCropTargetTip(selectedResidues: Record<string, number[]>) {
  const ranges = getResidueRanges(selectedResidues);
  const selectedRanges: string[] = [];
  for (const [chainId, rangeArr] of Object.entries(ranges)) {
    rangeArr.forEach((range) => {
      selectedRanges.push(`${chainId}:${range}`);
    });
  }
  const tip = !isEmpty(selectedResidues)
    ? selectedRanges.join(", ")
    : "No residues selected";
  return tip;
}

export function getSpecifyHotspotTip(
  selectedResidues: Record<string, number[]>,
) {
  const selectedRanges: string[] = [];
  for (const [chainId, ids] of Object.entries(selectedResidues)) {
    ids.forEach((id) => {
      selectedRanges.push(`${chainId}:${id}`);
    });
  }
  const tip = !isEmpty(selectedResidues)
    ? selectedRanges.join(", ")
    : "No residues selected";
  return tip;
}

export function getResidueRanges(residues: Record<string, number[]>) {
  const result: Record<string, string[]> = {};

  for (const [chainId, idxList] of Object.entries(residues)) {
    idxList.sort((a, b) => a - b);

    const ranges: string[] = [];
    let start = idxList[0];
    let end = idxList[0];

    for (let i = 1; i < idxList.length; i++) {
      if (idxList[i] === end + 1) {
        end = idxList[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = end = idxList[i];
      }
    }

    // Add the last interval
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    result[chainId] = ranges;
  }

  return result;
}

export function getChainId(chainIdx: number) {
  return String.fromCharCode("A".charCodeAt(0) + chainIdx);
}
