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
