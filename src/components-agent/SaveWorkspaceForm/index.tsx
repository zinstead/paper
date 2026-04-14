import { createWorkspace, getWorkspace, updateWorkspace } from "@/api";
import { useUIStore, type RemoteWorkspace } from "@/store/agent";
import { getShareUrl } from "@/utils/agent";
import { Button, Form, Input, Modal } from "@arco-design/web-react";
import useForm from "@arco-design/web-react/es/Form/useForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

const SaveWorkspaceForm = (props: {
  visible: boolean;
  onCancel: () => void;
}) => {
  const { visible, onCancel } = props;
  const [form] = useForm();
  const { user, chatMessages } = useUIStore(
    useShallow((state) => ({
      user: state.user,
      chatMessages: state.chatMessages,
    })),
  );

  const [params] = useSearchParams();
  const workspaceId = params.get("workspace")!;

  const { data: remoteWorkspace } = useQuery<RemoteWorkspace>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const res = await getWorkspace(workspaceId);
      return res;
    },
    enabled: !!workspaceId,
  });

  const canUpdateWorkspace =
    remoteWorkspace && user && remoteWorkspace.creator === user.username;
  const queryClient = useQueryClient();

  const handleCreateWorkspace = async () => {
    if (!user) return;
    const data = form.getFieldsValue();
    const creator = user.username;
    const createTime = Date.now();
    const localWorkspace = remoteWorkspace
      ? "workspace-temporary"
      : "workspace-main";
    const state = localStorage.getItem(localWorkspace)!;
    const res = await createWorkspace({
      ...data,
      creator,
      createTime,
      updateTime: createTime,
      state,
    });
    onCancel();
    useUIStore.setState({
      chatMessages: [
        ...chatMessages,
        {
          role: "assistant",
          content: `Saved successfully. Share link: ${getShareUrl(res.id)}`,
        },
      ],
    });
  };
  const createWorkspaceMutation = useMutation({
    mutationFn: handleCreateWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const handleUpdateWorkspace = async () => {
    if (!user) return;
    const data = form.getFieldsValue();
    const updateTime = Date.now();
    const state = localStorage.getItem("workspace-temporary")!;
    const res = await updateWorkspace(workspaceId, {
      ...data,
      updateTime,
      state,
    });
    onCancel();
    useUIStore.setState({
      chatMessages: [
        ...chatMessages,
        {
          role: "assistant",
          content: `Updated successfully. Share link: ${getShareUrl(res.id)}`,
        },
      ],
    });
  };
  const updateWorkspaceMutation = useMutation({
    mutationFn: handleUpdateWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return (
    <Modal
      title={"Save Workspace"}
      visible={visible}
      onCancel={onCancel}
      footer={
        <>
          <Button
            type="primary"
            onClick={() => {
              createWorkspaceMutation.mutate();
            }}
            loading={createWorkspaceMutation.isPending}
          >
            Save as Copy
          </Button>
          {canUpdateWorkspace && (
            <Button
              type="primary"
              onClick={() => {
                updateWorkspaceMutation.mutate();
              }}
              loading={updateWorkspaceMutation.isPending}
            >
              Update
            </Button>
          )}
        </>
      }
    >
      <Form form={form}>
        <Form.Item
          label="Name"
          field={"name"}
          initialValue={remoteWorkspace?.name}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          field={"description"}
          initialValue={remoteWorkspace?.description}
        >
          <Input />
        </Form.Item>
        {/* <div style={{ display: "flex", justifyContent: "center" }}>
          <Space size={20}>
            <Button
              type="primary"
              onClick={() => {
                createWorkspaceMutation.mutate();
              }}
              loading={createWorkspaceMutation.isPending}
            >
              Save as Copy
            </Button>
            {canUpdateWorkspace && (
              <Button
                type="primary"
                onClick={() => {
                  updateWorkspaceMutation.mutate();
                }}
                loading={updateWorkspaceMutation.isPending}
              >
                Update
              </Button>
            )}
          </Space>
        </div> */}
      </Form>
    </Modal>
  );
};

export default SaveWorkspaceForm;
