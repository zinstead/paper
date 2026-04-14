import {
  Button,
  Form,
  Input,
  Select,
  Tabs,
  Typography,
  Upload,
} from "@arco-design/web-react";
import useForm from "@arco-design/web-react/es/Form/useForm";

const CreateTaskForm = () => {
  const [form] = useForm();

  return (
    <Form form={form} style={{ width: 500 }}>
      <Typography.Title heading={4}>RBFEP Task</Typography.Title>
      <Tabs type="capsule" defaultActiveTab="base">
        <Tabs.TabPane title="Base" key={"base"}>
          <Form.Item label="Name" field={"name"}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" field={"description"}>
            <Input />
          </Form.Item>
          <Form.Item label="Protein" field={"protein"}>
            <Select />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 5 }}>
            <Upload tip="Upload pdb of protein" />
          </Form.Item>
          <Form.Item label="Cocrystal" field={"cocrystal"}>
            <Select />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 5 }}>
            <Upload tip="Upload sdf of cocrystal" />
          </Form.Item>
          <Form.Item label="Ligand" field={"ligand"}>
            <Select />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 5 }}>
            <Upload tip="Upload sdf of ligand" />
          </Form.Item>
        </Tabs.TabPane>
        <Tabs.TabPane title="Config" key={"config"}></Tabs.TabPane>
      </Tabs>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button type="primary">Sumit</Button>
      </div>
    </Form>
  );
};

export default CreateTaskForm;
