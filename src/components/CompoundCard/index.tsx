import type { ReactNode } from "react";
import MoleculeStructure from "../MoleculeStructure";
import "./index.css";

const CompoundCard = (props: {
  header: ReactNode;
  footer: ReactNode;
  structure: string;
  width: number;
  height: number;
}) => {
  const { header, footer, structure, width, height } = props;

  return (
    <div className="compound-card">
      {header}
      <MoleculeStructure
        id={structure}
        structure={structure}
        width={width}
        height={height}
        svgMode
        drawingDelay={500}
        previewWidth={600}
      />
      {footer}
    </div>
  );
};

export default CompoundCard;
