import { getWorkspaces, removeWorkspace } from "@/api";
import type { RemoteWorkspace } from "@/store/agent";
import type { PanelComponentProps } from "@/type/agent";
import { formatDate, getShareUrl } from "@/utils/agent";
import {
  Dropdown,
  Link,
  Menu,
  Notification,
  Space,
  Table,
  Typography,
  type PaginationProps,
  type TableColumnProps,
} from "@arco-design/web-react";
import { IconDown, IconShareAlt } from "@arco-design/web-react/icon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const WorkspaceList = (
  props: PanelComponentProps<{ pagination: PaginationProps }>,
) => {
  const { state, setState } = props;
  const { pagination } = state;
  const query = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await getWorkspaces({ pagination });
      setState({ pagination: { ...pagination, total: res.items } });
      return res.data;
    },
  });

  async function handleShareWorkspace(workspaceId: string) {
    const shareUrl = getShareUrl(workspaceId);
    await navigator.clipboard.writeText(shareUrl);
    Notification.success({ content: "Link copied!" });
  }

  const queryClient = useQueryClient();
  const removeWorkspaceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await removeWorkspace(id);
    },
    onSuccess: () => {
      Notification.success({ content: "Workspace deleted!" });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const columns: TableColumnProps<RemoteWorkspace>[] = [
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
      title: "Creator",
      dataIndex: "creator",
    },
    {
      title: "Create At",
      dataIndex: "createTime",
      render(col, item, index) {
        return formatDate(col);
      },
    },
    {
      title: "Last Modified",
      dataIndex: "updateTime",
      render(col, item, index) {
        return formatDate(col);
      },
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render(col, item, index) {
        return (
          <Space size={16}>
            <Link target="_blank" href={getShareUrl(item.id)}>
              open
            </Link>
            <Link
              icon={<IconShareAlt />}
              onClick={() => {
                handleShareWorkspace(item.id);
              }}
            >
              share
            </Link>
            <Dropdown
              droplist={
                <Menu>
                  <Menu.Item
                    key="delete"
                    onClick={() => {
                      removeWorkspaceMutation.mutate(item.id);
                    }}
                  >
                    delete
                  </Menu.Item>
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

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title heading={4}>Workspace List</Typography.Title>
      <Table
        rowKey={"id"}
        columns={columns}
        data={query.data}
        loading={query.isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showTotal: true,
        }}
        onChange={(p) => {
          setState({
            pagination: {
              ...pagination,
              current: p.current!,
              pageSize: p.pageSize!,
            },
          });
        }}
      />
    </div>
  );
};

export default WorkspaceList;
