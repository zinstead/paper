import {
  Button,
  Form,
  Input,
  Typography,
  Upload,
} from "@arco-design/web-react";
import useForm from "@arco-design/web-react/es/Form/useForm";

const UploadMoleculeForm = () => {
  const [form] = useForm();

  return (
    <Form form={form} style={{ width: 500 }}>
      <Typography.Title heading={4}>Upload Protein</Typography.Title>
      <Form.Item label="Entry" field={"entry"}>
        <Input />
      </Form.Item>
      <Form.Item label="Protein" field={"protein"}>
        <Upload tip="Upload pdb of protein" />
      </Form.Item>
      <Form.Item label="Cocrystal" field={"cocrystal"}>
        <Upload tip="Upload sdf of cocrystal" />
      </Form.Item>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button type="primary">Confirm</Button>
      </div>
    </Form>
  );
};

export default UploadMoleculeForm;
