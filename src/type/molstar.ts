export interface ChainItem {
  chainId: string;
  count: number;
  sequence: string;
}

export interface HoverResidue {
  chainId: string;
  residueId: number;
  aminoAcid: string;
}

export interface StatusItem {
  isHighlighted: boolean;
  isSelected: boolean;
  // isFocused: boolean;
}

export type ProteinSequence = Record<
  string,
  {
    description: string[];
    residues: {
      auth_asym_id: string;
      auth_seq_id: number;
      auth_comp_id: string;
      ins_code: string;
    }[];
  }
>;

export type ResidueMap = Record<string, { seq_id: number; ins_code: string }[]>;
