import { create } from "zustand";

interface IDesignStore {
  selectedResidues: Record<string, number[]>;
  setSelectedResidues: (selectedResidues: Record<string, number[]>) => void;
  cropTarget: Record<string, number[]>;
  setCropTarget: (cropTarget: Record<string, number[]>) => void;
  specifyHotspot: Record<string, number[]>;
  setSpecifyHotspot: (specifyHotspot: Record<string, number[]>) => void;
}

export const useStructureDesignStore = create<IDesignStore>()((set) => ({
  selectedResidues: {},
  setSelectedResidues: (selectedResidues) => set({ selectedResidues }),
  cropTarget: {},
  setCropTarget: (cropTarget) => set({ cropTarget }),
  specifyHotspot: {},
  setSpecifyHotspot: (specifyHotspot) => set({ specifyHotspot }),
}));

export const useSequenceDesignStore = create<IDesignStore>()((set) => ({
  selectedResidues: {},
  setSelectedResidues: (selectedResidues) => set({ selectedResidues }),
  cropTarget: {},
  setCropTarget: (cropTarget) => set({ cropTarget }),
  specifyHotspot: {},
  setSpecifyHotspot: (specifyHotspot) => set({ specifyHotspot }),
}));
