import { Form, Switch } from "@arco-design/web-react";
import useForm from "@arco-design/web-react/es/Form/useForm";
import classNames from "classnames";
import styles from "./index.module.less";

const NumericalProperty = () => {
  const [form] = useForm();
  const inverted = Form.useWatch("inverted", form);

  const colorbarClassName = classNames(styles.colorbar, {
    [styles.inverted]: inverted,
  });

  return (
    <Form form={form}>
      <Form.Item label="Colormap" field={"inverted"}>
        <Switch checkedText="Inverted" uncheckedText="Regular" />
      </Form.Item>
      <div className={colorbarClassName}></div>
    </Form>
  );
};

export default NumericalProperty;
