import type { ReactNode } from "react";
import MoleculeStructure from "../MoleculeStructure/SmilesStructure";
import "./index.css";

const CompoundCard = (props: {
  id: string;
  header: ReactNode;
  footer: ReactNode;
  structure: string;
  width: number;
  height: number;
  svgMode?: boolean;
  previewWidth?: number;
  drawingDelay?: number;
  visible?: boolean;
}) => {
  const {
    id,
    header,
    footer,
    structure,
    width,
    height,
    svgMode,
    previewWidth,
    drawingDelay = 500,
    visible = true,
  } = props;

  return (
    <div className="compound-card">
      {header}
      <div
        className="molecule-wrapper"
        style={{ visibility: visible ? "visible" : "hidden" }}
      >
        <MoleculeStructure
          id={id}
          structure={structure}
          width={width}
          height={height}
          svgMode={svgMode}
          drawingDelay={drawingDelay}
          previewWidth={previewWidth}
        />
      </div>
      {footer}
    </div>
  );
};

export default CompoundCard;
