import { Collapse, Drawer } from "@arco-design/web-react";
import NumericalProperty from "../NumericalProperty";
import { IconDelete } from "@arco-design/web-react/icon";
import styles from "./index.module.less";
import type { Property } from "@/type";

const ColorSettingsDrawer = (props: {
  properties: Property[];
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const { properties, visible, onCancel, onConfirm } = props;
  return (
    <Drawer
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      title={"颜色编码控制"}
      width={500}
    >
      <Collapse>
        {properties.map(({ key }) => (
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
