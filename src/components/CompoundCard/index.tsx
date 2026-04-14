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
  showSmile?: boolean;
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
    drawingDelay = 0,
    showSmile = true,
  } = props;

  return (
    <div className="compound-card">
      {header}
      <div
        className="molecule-wrapper"
        style={{ visibility: showSmile ? "visible" : "hidden" }}
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
