import { getTasks } from "@/api";
import type { PanelComponentProps } from "@/type/agent";
import {
  Badge,
  Button,
  Dropdown,
  Link,
  Menu,
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
            <Dropdown
              droplist={
                <Menu>
                  <Menu.Item key="freeze">freeze</Menu.Item>
                </Menu>
              }
              position="bl"
            >
              <IconDown />
            </Dropdown>
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
      <Table
        rowKey={"id"}
        columns={columns}
        data={query.data}
        loading={query.isLoading}
        pagination={{ showTotal: true }}
      />
    </div>
  );
};

export default TaskList;
