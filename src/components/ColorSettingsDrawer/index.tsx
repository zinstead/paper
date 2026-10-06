import { Collapse, Drawer, Form, Select } from "@arco-design/web-react";
import NumericalProperty from "../NumericalProperty";
import { IconDelete } from "@arco-design/web-react/icon";
import styles from "./index.module.less";
import type { Property } from "@/type";
import type {
  ColorSettings,
  MinMaxMap,
} from "@/components-agent/LigandList/index.tsx";
import useForm from "@arco-design/web-react/es/Form/useForm";
import { mapValues } from "lodash";

const ColorSettingsDrawer = (props: {
  properties: Property[];
  colorSettings?: ColorSettings;
  minMaxMap: MinMaxMap;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (colorSettings: ColorSettings) => void;
}) => {
  const { properties, colorSettings, minMaxMap, visible, onCancel, onSubmit } =
    props;
  const [form] = useForm();
  const options = properties.map((item) => item.key);
  const selectedOptions = Form.useWatch("selectedOptions", form);
  const selectedProperties = properties.filter((item) =>
    selectedOptions?.includes(item.key),
  );

  return (
    <Drawer
      width={500}
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        const { selectedOptions, ...settings } = form.getFieldsValue();
        const newSettings = mapValues(
          settings as ColorSettings,
          (value, key) => {
            if (value.mode === "auto") {
              return { ...value, ...minMaxMap[key] };
            }
            return value;
          },
        );
        onSubmit(newSettings);
        onCancel();
      }}
      title={"Color Settings"}
      afterOpen={() => {
        if (colorSettings) {
          form.setFieldsValue(colorSettings);
        }
      }}
    >
      <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Form.Item
          field={"selectedOptions"}
          initialValue={[]}
          wrapperCol={{ span: 24 }}
        >
          <Select
            options={options}
            mode="multiple"
            placeholder="Select properties"
          />
        </Form.Item>
        <Collapse>
          {selectedProperties.map((item) => {
            const { key } = item;
            return (
              <Collapse.Item
                key={key}
                name={key}
                header={<div>{key}</div>}
                extra={<IconDelete />}
                className={styles.collapseItem}
              >
                <NumericalProperty property={item} />
              </Collapse.Item>
            );
          })}
        </Collapse>
      </Form>
    </Drawer>
  );
};

export default ColorSettingsDrawer;
