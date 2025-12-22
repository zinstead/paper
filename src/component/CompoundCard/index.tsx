import type { ReactNode } from "react";
import MoleculeStructure from "../MoleculeStructure";
import "./index.css";

const CompoundCard = (props: {
  id: string;
  header: ReactNode;
  footer: ReactNode;
  structure: string;
  width: number;
  height: number;
  svgMode?: boolean;
  visible?: boolean;
}) => {
  const {
    id,
    header,
    footer,
    structure,
    width,
    height,
    svgMode = false,
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
          drawingDelay={500}
          previewWidth={600}
        />
      </div>
      {footer}
    </div>
  );
};

export default CompoundCard;
