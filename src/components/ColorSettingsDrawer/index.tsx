import { Collapse, Drawer, Select } from "@arco-design/web-react";
import NumericalProperty from "../NumericalProperty";
import { IconDelete } from "@arco-design/web-react/icon";
import styles from "./index.module.less";
import type { Property } from "@/type";
import { useState } from "react";

const ColorSettingsDrawer = (props: {
  properties: Property[];
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const { properties, visible, onCancel, onConfirm } = props;
  const options = properties.map((item) => item.key);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const selectedProperties = properties.filter((item) =>
    selectedOptions?.includes(item.key),
  );

  return (
    <Drawer
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      title={"Color Settings"}
      width={500}
    >
      <div style={{ marginBottom: 12 }}>
        <Select
          options={options}
          mode="multiple"
          value={selectedOptions}
          onChange={(v) => {
            setSelectedOptions(v);
          }}
          placeholder="Select properties"
        />
      </div>
      <Collapse>
        {selectedProperties.map(({ key }) => (
          <Collapse.Item
            key={key}
            name={key}
            header={<div>{key}</div>}
            extra={<IconDelete />}
            className={styles.collapseItem}
          >
            <NumericalProperty />
          </Collapse.Item>
        ))}
      </Collapse>
    </Drawer>
  );
};

export default ColorSettingsDrawer;
