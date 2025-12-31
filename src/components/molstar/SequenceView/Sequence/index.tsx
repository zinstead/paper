import { useState } from "react";
import styles from "./index.module.less";
import { isNil } from "lodash";
import { useSequenceDesignStore } from "@/store/molstar";
import type { HoverResidue, StatusItem } from "@/type/molstar";

const period = 10;
const MaxSequenceNumberSize = 5;

const residueBackgroundColor = {
  // focused: '',
  highlighted: "rgb(255, 102, 153)",
  selected: "rgb(51, 255, 25)",
  cropped: "rgb(51, 153, 255)",
};

const aminoAcidMap: Record<string, string> = {
  A: "ALA",
  R: "ARG",
  N: "ASN",
  D: "ASP",
  C: "CYS",
  Q: "GLN",
  E: "GLU",
  G: "GLY",
  H: "HIS",
  I: "ILE",
  L: "LEU",
  K: "LYS",
  M: "MET",
  F: "PHE",
  P: "PRO",
  S: "SER",
  T: "THR",
  W: "TRP",
  Y: "TYR",
  V: "VAL",
  B: "ASX", // Aspartic acid or Asparagine
  Z: "GLX", // Glutamic acid or Glutamine
  X: "UNK", // Unknown
  U: "SEC", // Selenocysteine
  O: "PYL", // Pyrrolysine
  J: "XLE", // Leucine or Isoleucine
};

interface IProps {
  chainId: string;
  sequence: string;
  statusGroup: StatusItem[];
  setStatusGroup: (statusGroup: StatusItem[]) => void;
  setHoverResidue: (hoverResidue: HoverResidue | null) => void;
}

const Sequence: React.FC<IProps> = (props) => {
  const { chainId, sequence, statusGroup, setStatusGroup, setHoverResidue } =
    props;
  const selectedResidues = useSequenceDesignStore(
    (state) => state.selectedResidues
  );
  const setSelectedResidues = useSequenceDesignStore(
    (state) => state.setSelectedResidues
  );
  const cropTarget = useSequenceDesignStore((state) => state.cropTarget);
  const specifyHotspot = useSequenceDesignStore(
    (state) => state.specifyHotspot
  );

  function getBackgroundColor(seqIdx: number) {
    const residueId = seqIdx + 1;
    if (statusGroup[seqIdx].isHighlighted) {
      return residueBackgroundColor.highlighted;
    }
    if (statusGroup[seqIdx].isSelected) {
      return residueBackgroundColor.selected;
    }
    if (specifyHotspot[chainId]?.includes(residueId)) {
      return residueBackgroundColor.highlighted;
    }
    if (cropTarget[chainId]?.includes(residueId)) {
      return residueBackgroundColor.cropped;
    }
    // if (statusGroup[seqIdx].isFocused) return residueBackgroundColor.focused;
    return "";
  }

  function getSequenceNumberSpan(seqIdx: number) {
    const seqNum = `${seqIdx + 1}`;
    const pagSeqNum =
      seqNum +
      new Array(MaxSequenceNumberSize - seqNum.length + 1).join("\u00A0");
    return (
      <span key={`marker-${seqIdx}`} className={styles.mspSequenceNumber}>
        {pagSeqNum}
      </span>
    );
  }

  function getResidueSpan(chainId: string, seqIdx: number, label: string) {
    return (
      <span
        key={seqIdx}
        data-seqid={seqIdx}
        data-chainid={chainId}
        className={getResidueClass(seqIdx)}
        style={{ backgroundColor: getBackgroundColor(seqIdx) }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          setHoverResidue(null);
        }}
      >
        {`\u200b${label}\u200b`}
      </span>
    );
  }

  function getResidueClass(seqIdx: number) {
    const classes = [styles.mspSequencePreset];
    if (statusGroup[seqIdx].isSelected) {
      classes.push(styles.mspSequenceResidueSelected);
    }
    if (statusGroup[seqIdx].isHighlighted) {
      classes.push(styles.mspSequenceResidueHighlighted);
    }
    // if (statusGroup[seqIdx].isFocused) {
    //   classes.push(styles.mspSequenceResidueFocused);
    // }
    return classes.join(" ");
  }

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [dragStartIndex, setDragStartIndex] = useState<number | undefined>();

  const onSelect = (selectedIndices: number[]) => {
    const isAllOverlapped = selectedIndices.every(
      (i) => statusGroup[i].isSelected === true
    );
    const newStatusGroup = statusGroup.map((item) => ({
      ...item,
      isHighlighted: false,
    }));
    if (isAllOverlapped) {
      selectedIndices.forEach((i) => {
        newStatusGroup[i].isSelected = false;
      });
    } else {
      selectedIndices.forEach((i) => {
        newStatusGroup[i].isSelected = true;
      });
    }
    setStatusGroup(newStatusGroup);
    const selection: number[] = [];
    newStatusGroup.forEach((status, index) => {
      if (status.isSelected) {
        selection.push(index + 1);
      }
    });
    setSelectedResidues({ ...selectedResidues, [chainId]: selection });
  };

  const getSeqIdx = (e: React.MouseEvent) => {
    const elem = e.target as HTMLElement;
    if (!elem || !elem.hasAttribute("data-seqid")) {
      return undefined;
    }
    const i = Number.parseInt(elem.getAttribute("data-seqid")!);
    return i;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const index = getSeqIdx(e);
    if (!isNil(index)) {
      setDragStartIndex(index);
      setSelectedIndices([index]);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusGroup(
      statusGroup.map((item) => ({ ...item, isHighlighted: false }))
    );
    setDragStartIndex(undefined);
    setSelectedIndices([]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    const index = getSeqIdx(e);
    if (isNil(index)) {
      setStatusGroup(
        statusGroup.map((item) => ({ ...item, isHighlighted: false }))
      );
      setSelectedIndices([]);
      return;
    }
    if (!isNil(index) && !isNil(dragStartIndex)) {
      const start = Math.min(dragStartIndex, index);
      const end = Math.max(dragStartIndex, index);
      const range = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
      const newStatusGroup = statusGroup.map((item) => ({
        ...item,
        isHighlighted: false,
      }));
      range.forEach((i) => {
        newStatusGroup[i].isHighlighted = true;
      });
      setStatusGroup(newStatusGroup);
      setSelectedIndices(range);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const index = getSeqIdx(e);
    if (!isNil(index)) {
      onSelect(selectedIndices);
    }
    setDragStartIndex(undefined);
    setSelectedIndices([]);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const index = getSeqIdx(e);
    if (!isNil(index)) {
      const residue = {
        chainId,
        aminoAcid: aminoAcidMap[sequence[index]],
        residueId: index + 1,
      };
      setHoverResidue(residue);
    }
  };

  const elems: JSX.Element[] = [];
  for (let i = 0; i < sequence.length; i++) {
    const label = sequence[i];
    if (i % period === 0) {
      elems[elems.length] = getSequenceNumberSpan(i);
    }
    elems[elems.length] = getResidueSpan(chainId, i, label);
  }

  return (
    <>
      <div className={styles.mspSequenceChainLabel}>{chainId}</div>
      <div
        className={styles.mspSequenceWrapper}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {elems}
      </div>
    </>
  );
};

export default Sequence;
