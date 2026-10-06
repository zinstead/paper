import { Form, Input, Radio, Switch } from "@arco-design/web-react";
import classNames from "classnames";
import styles from "./index.module.less";
import type { Property } from "@/type/index.ts";

const NumericalProperty = (props: { property: Property }) => {
  const { property } = props;
  const field = property.key;
  // const inverted = Form.useWatch("inverted", form);

  // const colorbarClassName = classNames(styles.colorbar, {
  //   [styles.inverted]: inverted,
  // });

  return (
    <>
      <Form.Item label="Scale" field={`${field}.scale`} initialValue={"linear"}>
        <Radio.Group type="button">
          <Radio value="linear">Linear</Radio>
          <Radio value="log">Log</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label="Colormap"
        field={`${field}.inverted`}
        initialValue={false}
      >
        <Switch checkedText="Inverted" uncheckedText="Regular" />
      </Form.Item>
      <Form.Item shouldUpdate wrapperCol={{ span: 24 }}>
        {(values) => {
          const colorbarClassName = classNames(styles.colorbar, {
            [styles.inverted]: values[field].inverted,
          });
          return <div className={colorbarClassName}></div>;
        }}
      </Form.Item>
      <Form.Item label="Mode" field={`${field}.mode`} initialValue={"auto"}>
        <Radio.Group type="button">
          <Radio value="auto">Auto</Radio>
          <Radio value="manual">Manual</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }} shouldUpdate>
        {(values) => {
          const mode = values[field].mode;
          if (mode === "auto") {
            return null;
          } else {
            return (
              <div>
                <Form.Item
                  label="Min"
                  field={`${field}.min`}
                  initialValue={property.min}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Max"
                  field={`${field}.max`}
                  initialValue={property.max}
                >
                  <Input />
                </Form.Item>
              </div>
            );
          }
        }}
      </Form.Item>
    </>
  );
};

export default NumericalProperty;
