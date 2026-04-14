import { getProjects } from "@/api";
import type { PanelComponentProps } from "@/type/agent";
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Link,
  Menu,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  type PaginationProps,
  type TableColumnProps,
} from "@arco-design/web-react";
import { IconDown, IconStar } from "@arco-design/web-react/icon";
import { useQuery } from "@tanstack/react-query";
const TabPane = Tabs.TabPane;

const tabs = [
  { key: "my", title: "My" },
  { key: "starred", title: "Starred" },
  { key: "all", title: "All" },
];

const dropList = (
  <Menu>
    <Menu.Item key="freeze">freeze</Menu.Item>
  </Menu>
);

export type ProjectType = "my" | "starred" | "all";

interface StateType {
  pagination: PaginationProps;
  projectType: ProjectType;
}

const ProjectList = (props: PanelComponentProps<StateType>) => {
  const { state, setState } = props;
  const { pagination, projectType } = state;
  const setPagination = (pagination: PaginationProps) => {
    setState({ pagination });
  };
  const setProjectType = (projectType: ProjectType) => {
    setState({ projectType });
  };

  const columns: TableColumnProps[] = [
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
      title: "Owners",
      dataIndex: "owners",
      render(col, item, index) {
        return (
          <Space>
            {col.map((name) => (
              <Avatar key={name} style={{ backgroundColor: "#14a9f8" }}>
                {name}
              </Avatar>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Operators",
      dataIndex: "operators",
      render(col, item, index) {
        return (
          <Space>
            {col.map((name) => (
              <Avatar key={name} style={{ backgroundColor: "#00d0b6" }}>
                {name}
              </Avatar>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Viewers",
      dataIndex: "viewers",
      render(col, item, index) {
        return (
          <Space>
            {col.map((name) => (
              <Avatar key={name}>
                <img
                  alt="avatar"
                  src="//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp"
                />
              </Avatar>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render(col, item, index) {
        const background = "";
        return (
          <Space size={16}>
            <Link>view</Link>
            <Link>edit</Link>
            <div style={{}}>
              <IconStar style={{ fontSize: 15 }} />
            </div>
            <Dropdown droplist={dropList} position="bl">
              <IconDown />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const query = useQuery({
    queryKey: ["projects", pagination.current, pagination.pageSize],
    queryFn: async () => {
      const res = await getProjects({ pagination });
      setPagination({ ...pagination, total: res.items });
      return res.data;
    },
  });

  return (
    <div style={{ padding: "0 24px" }}>
      <Typography.Title heading={4}>Project List</Typography.Title>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Space size={30}>
          <Input.Group compact style={{ width: 240 }}>
            <Select defaultValue="ID" showSearch style={{ width: "35%" }}>
              <Select.Option value="ID">ID</Select.Option>
              <Select.Option value="Name">Name</Select.Option>
            </Select>
            <Input.Search placeholder="Search" style={{ width: "65%" }} />
          </Input.Group>
          <Button type="primary">Create Project</Button>
        </Space>
      </div>
      <Tabs
        type="line"
        onChange={(key) => {
          setProjectType(key as ProjectType);
        }}
        activeTab={projectType}
      >
        {tabs.map(({ key, title }) => (
          <TabPane key={key} title={title}>
            <Table
              rowKey={"id"}
              columns={columns}
              data={query.data}
              key={"id"}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showTotal: true,
              }}
              onChange={(p) => {
                setPagination({
                  ...pagination,
                  current: p.current!,
                  pageSize: p.pageSize!,
                });
              }}
              loading={query.isLoading}
            />
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default ProjectList;
