import { Form, Input, Radio, Switch } from "@arco-design/web-react";
import classNames from "classnames";
import styles from "./index.module.less";
import useForm from "@arco-design/web-react/es/Form/useForm";

const NumericalProperty = () => {
  const [form] = useForm();
  const inverted = Form.useWatch("inverted", form);

  const colorbarClassName = classNames(styles.colorbar, {
    [styles.inverted]: inverted,
  });

  return (
    <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <Form.Item label="Scale" field={"scale"} initialValue={"linear"}>
        <Radio.Group type="button">
          <Radio value="linear">Linear</Radio>
          <Radio value="log">Log</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Colormap" field={"inverted"}>
        <Switch checkedText="Inverted" uncheckedText="Regular" />
      </Form.Item>
      <div className={colorbarClassName}></div>
      <Form.Item label="Mode" field={"mode"} initialValue={"auto"}>
        <Radio.Group type="button">
          <Radio value="auto">Auto</Radio>
          <Radio value="manual">Manual</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }} shouldUpdate>
        {(values) => {
          const mode = values.mode;
          if (mode === "auto") {
            return null;
          } else {
            return (
              <div>
                <Form.Item label="Min">
                  <Input />
                </Form.Item>
                <Form.Item label="Max">
                  <Input />
                </Form.Item>
              </div>
            );
          }
        }}
      </Form.Item>
    </Form>
  );
};

export default NumericalProperty;
