import styles from "./index.module.less";
import Sequence from "./Sequence";
import type { ChainItem, HoverResidue, StatusItem } from "@/type/molstar";
import { Button, Divider, Popconfirm, Space } from "@arco-design/web-react";
import { IconAt, IconRefresh, IconScissor } from "@arco-design/web-react/icon";
import { useSequenceDesignStore } from "@/store/molstar";
import { useEffect, useState } from "react";
import { getResidueRanges } from "@/utils/molstar";
import { difference, isEmpty, mapValues } from "lodash";

const maxHotspotCount = 10;

const initStatus: StatusItem = {
  // isFocused: false,
  isHighlighted: false,
  isSelected: false,
};

const SequenceView = (props: { chains: ChainItem[] }) => {
  const { chains } = props;
  const [statusMap, setStatusMap] = useState<Record<string, StatusItem[]>>({});
  const [hoverResidue, setHoverResidue] = useState<HoverResidue | null>(null);

  const [cropTargetTip, setCropTargetTip] = useState("");
  const [specifyHotspotTip, setSpecifyHotspotTip] = useState("");
  const [cropPopupVisible, setCropPopupVisible] = useState(false);
  const [hotspotPopupVisible, setHotspotPopupVisible] = useState(false);
  const [cropVerificationMsg, setCropVerificationMsg] = useState("");
  const [hotspotVerificationMsg, setHotspotVerificationMsg] = useState("");

  const {
    selectedResidues,
    setSelectedResidues,
    cropTarget,
    setCropTarget,
    specifyHotspot,
    setSpecifyHotspot,
  } = useSequenceDesignStore();

  const onCropTarget = () => {
    if (isEmpty(selectedResidues)) {
      setCropPopupVisible(false);
      return;
    }

    if (!isEmpty(specifyHotspot)) {
      for (const [chainId, ids] of Object.entries(specifyHotspot)) {
        if (difference(ids, selectedResidues[chainId]).length > 0) {
          setCropVerificationMsg("Hotspot must lie in cropped target.");
          return;
        }
      }
    }

    setCropPopupVisible(false);
    setStatusMap((pre) =>
      mapValues(pre, (status) => status.map(() => initStatus))
    );
    setCropTarget(selectedResidues);
    setSelectedResidues({});
  };

  const onSpecifyHotspot = () => {
    if (isEmpty(selectedResidues)) {
      setHotspotPopupVisible(false);
      return;
    }

    const hotspotCount = Object.values(selectedResidues).reduce(
      (pre, cur) => pre + cur.length,
      0
    );
    if (hotspotCount > maxHotspotCount) {
      setHotspotVerificationMsg("The number of hotspots can only be 0-10.");
      return;
    }

    if (!isEmpty(cropTarget)) {
      for (const [chainId, ids] of Object.entries(selectedResidues)) {
        if (difference(ids, cropTarget[chainId]).length > 0) {
          setHotspotVerificationMsg("Hotspot must lie in cropped target.");
          return;
        }
      }
    }

    setHotspotPopupVisible(false);
    setStatusMap((pre) =>
      mapValues(pre, (status) => status.map(() => initStatus))
    );
    setSpecifyHotspot(selectedResidues);
    setSelectedResidues({});
  };

  const onReset = () => {
    setStatusMap((pre) =>
      mapValues(pre, (status) => status.map(() => initStatus))
    );
    setSelectedResidues({});
    setCropTarget({});
    setSpecifyHotspot({});
  };

  useEffect(() => {
    const result: Record<string, StatusItem[]> = {};
    chains.forEach(({ chainId, sequence }) => {
      result[chainId] = new Array(sequence.length)
        .fill(null)
        .map(() => initStatus);
    });
    setStatusMap(result);
  }, [chains]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Space style={{ marginBottom: 20 }} size={12}>
          <Popconfirm
            position="bottom"
            title={<span>Crop structure to:</span>}
            content={
              <>
                <div>{cropTargetTip}</div>
                <div style={{ color: "red" }}>{cropVerificationMsg}</div>
              </>
            }
            onOk={onCropTarget}
            popupVisible={cropPopupVisible}
            onCancel={() => {
              setCropPopupVisible(false);
              setCropVerificationMsg("");
            }}
          >
            <Button
              // className={styles.customButton}
              type="text"
              icon={<IconScissor />}
              onClick={() => {
                setCropPopupVisible(true);
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
                setCropTargetTip(tip);
              }}
            >
              Crop target
            </Button>
          </Popconfirm>
          <Popconfirm
            popupVisible={hotspotPopupVisible}
            position="bottom"
            title={<span>Set hotspot:</span>}
            content={
              <>
                <div>{specifyHotspotTip}</div>
                <div style={{ color: "red" }}>{hotspotVerificationMsg}</div>
              </>
            }
            onOk={onSpecifyHotspot}
            onCancel={() => {
              setHotspotPopupVisible(false);
              setHotspotVerificationMsg("");
            }}
          >
            <Button
              // className={styles.customButton}
              type="text"
              icon={<IconAt />}
              onClick={() => {
                setHotspotPopupVisible(true);
                const selectedRanges: string[] = [];
                for (const [chainId, ids] of Object.entries(selectedResidues)) {
                  ids.forEach((id) => {
                    selectedRanges.push(`${chainId}:${id}`);
                  });
                }
                const tip = !isEmpty(selectedResidues)
                  ? selectedRanges.join(", ")
                  : "No residues selected";
                setSpecifyHotspotTip(tip);
              }}
            >
              Specifying binding hotspot
            </Button>
          </Popconfirm>
          <Button
            // className={styles.customButton}
            type="text"
            icon={<IconRefresh />}
            onClick={onReset}
          >
            Reset
          </Button>
        </Space>
        {hoverResidue ? (
          <div className={styles.tooltipContainer}>
            <span>{hoverResidue.chainId}</span>
            <Divider className={styles.dividerVertical} type="vertical" />
            <span>{hoverResidue.aminoAcid}</span>
            &nbsp;
            <span>{hoverResidue.residueId}</span>
          </div>
        ) : null}
      </div>
      <div className={styles.mspSequenceContainer}>
        <div className={styles.mspSequence}>
          <div className={styles.mspSequenceHeader}>Sequence</div>
          <div className={styles.mspSequenceNonEmpty}>
            {chains.map(({ chainId, sequence }) => {
              if (
                isEmpty(statusMap[chainId]) ||
                statusMap[chainId].length !== sequence.length
              ) {
                return null;
              }
              return (
                <div key={chainId}>
                  <Sequence
                    chainId={chainId}
                    sequence={sequence}
                    statusGroup={statusMap[chainId] ?? []}
                    setStatusGroup={(statusGroup) => {
                      setStatusMap((pre) => ({
                        ...pre,
                        [chainId]: statusGroup,
                      }));
                    }}
                    setHoverResidue={setHoverResidue}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceView;
