import { getTasks } from "@/api";
import type { PanelComponentProps } from "@/type/agent";
import {
  Badge,
  Button,
  Dropdown,
  Input,
  Link,
  Menu,
  Select,
  Space,
  Table,
  Typography,
  type TableColumnProps,
} from "@arco-design/web-react";
import { IconDown, IconExperiment } from "@arco-design/web-react/icon";
import { useQuery } from "@tanstack/react-query";

interface TaskData {
  id: number;
  name: string;
  description: string;
  type: "MD" | "ABFEP" | "RBFEP";
  status: "running" | "success" | "failed" | "stopped";
  creator: string;
  createTime: string;
}

const statusMap = {
  running: "processing",
  success: "success",
  failed: "error",
  stopped: "default",
};

const TaskList = (props: PanelComponentProps<{ projectId: number }>) => {
  const { state, setState } = props;
  const { projectId } = state;

  const columns: TableColumnProps<TaskData>[] = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Progress",
      dataIndex: "progress",
      render(col, item, index) {
        const percent = typeof col === "number" ? Math.round(col * 100) : 0;
        return <div>{percent}%</div>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render(col, item, index) {
        return <Badge text={col} status={statusMap[col]} />;
      },
    },
    {
      title: "Creator",
      dataIndex: "creator",
    },
    {
      title: "Create At",
      dataIndex: "createTime",
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render(col, item, index) {
        return (
          <Space size={16}>
            <Link icon={<IconExperiment />}>analyse</Link>
            <Link>restart</Link>
            <Link style={{ color: "rgb(245, 63, 63)" }}>stop</Link>
            {/* <Dropdown
              droplist={
                <Menu>
                  <Menu.Item key="freeze">freeze</Menu.Item>
                </Menu>
              }
              position="bl"
            >
              <IconDown />
            </Dropdown> */}
          </Space>
        );
      },
    },
  ];

  const query = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const res = await getTasks();
      return res;
    },
  });

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title heading={4}>Task List</Typography.Title>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <Space size={30}>
          <Input.Group compact style={{ width: 240 }}>
            <Select defaultValue="ID" showSearch style={{ width: "35%" }}>
              <Select.Option value="ID">ID</Select.Option>
              <Select.Option value="Name">Name</Select.Option>
            </Select>
            <Input.Search placeholder="Search" style={{ width: "65%" }} />
          </Input.Group>
          <Button type="primary">Create Task</Button>
        </Space>
      </div>
      <Table
        rowKey={"id"}
        columns={columns}
        data={query.data?.slice(0, 5)}
        loading={query.isLoading}
        pagination={{ showTotal: true }}
      />
    </div>
  );
};

export default TaskList;
