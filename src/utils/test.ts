import {
  StructureElement,
  StructureProperties as SP,
} from "molstar/lib/mol-model/structure";
import type { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";

export function extractSequence(plugin: PluginUIContext) {
  const structures = plugin.managers.structure.hierarchy.current.structures;
  const structureArr = structures.map((s) => ({
    structure: s.cell.obj?.data!, // Structure
    structureId: s.cell.transform.ref, // ✅ ID 在这里
  }));
  const result: any[] = [];

  structureArr.forEach(({ structure, structureId }) => {
    const loc = StructureElement.Location.create(structure);

    const chainMap = new Map();

    for (const unit of structure.units) {
      loc.unit = unit;

      const elements = unit.elements;

      for (let i = 0; i < elements.length; i++) {
        loc.element = elements[i];

        const chain = SP.chain.auth_asym_id(loc);
        const residue = SP.residue.auth_seq_id(loc);
        const insCode = SP.residue.pdbx_PDB_ins_code(loc) || "";
        const modelId = SP.unit.model_index(loc);
        const innerKey = SP.residue.key(loc);

        const key = `${structureId}_${modelId}_${chain}`;

        if (!chainMap.has(key)) {
          chainMap.set(key, []);
        }

        const residues = chainMap.get(key);

        const resKey = `${residue}_${insCode}`;

        if (!residues.find((r: any) => r.key === resKey)) {
          residues.push({
            structureId,
            modelId,
            chain,
            residue,
            insCode,
            key: resKey,
            innerKey,
          });
        }
      }
    }

    result.push(...chainMap.values());
  });

  return result;
}
