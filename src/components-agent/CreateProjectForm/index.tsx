import { createProject, getUsers } from "@/api";
import {
  Button,
  Form,
  Input,
  Select,
  Typography,
} from "@arco-design/web-react";
import useForm from "@arco-design/web-react/es/Form/useForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CreateProjectForm = () => {
  const [form] = useForm();

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const users = (await getUsers()) as { id: string; name: string }[];
      return users.map(({ id, name }) => ({ id, label: name, value: name }));
    },
  });

  const handleCreateProject = async () => {
    const data = form.getFieldsValue();
    const res = await createProject(data);
  };

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: handleCreateProject,
    onSuccess: () => {
      // 错误处理和刷新
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return (
    <Form form={form} style={{ width: 500 }}>
      <Typography.Title heading={4}>Create Project</Typography.Title>
      <Form.Item field={"name"} label={"Name"}>
        <Input />
      </Form.Item>
      <Form.Item field={"description"} label={"Description"}>
        <Input />
      </Form.Item>
      <Form.Item field={"owners"} label={"Owners"} initialValue={[]}>
        <Select options={users} mode="multiple" allowClear />
      </Form.Item>
      <Form.Item field={"operators"} label={"Operators"} initialValue={[]}>
        <Select options={users} mode="multiple" allowClear />
      </Form.Item>
      <Form.Item field={"viewers"} label={"Viewers"} initialValue={[]}>
        <Select options={users} mode="multiple" allowClear />
      </Form.Item>
      <div style={{ color: "rgb(78, 89, 105)" }}>
        <Form.Item
          label="Explanation:"
          style={{ marginTop: 20, marginBottom: 10 }}
        ></Form.Item>
        <Form.Item label="1.">
          <div style={{ display: "flex", alignItems: "center" }}>
            Initial users do not have project permissions.
          </div>
        </Form.Item>
        <Form.Item label="2.">
          <div style={{ display: "flex", alignItems: "center" }}>
            Viewers only have browsing privileges.
          </div>
        </Form.Item>
        <Form.Item label="3.">
          <div style={{ display: "flex", alignItems: "center" }}>
            Operators have access to all modules within the current project.
          </div>
        </Form.Item>
        <Form.Item label="4.">
          <div style={{ display: "flex", alignItems: "center" }}>
            Owners have full operational authority over the project.
          </div>
        </Form.Item>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          type="primary"
          loading={mutation.isPending}
          onClick={() => {
            mutation.mutate();
          }}
        >
          Submit
        </Button>
      </div>
    </Form>
  );
};

export default CreateProjectForm;
