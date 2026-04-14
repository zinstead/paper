import { useState, useRef, useEffect } from "react";
import {
  Input,
  Button,
  Layout,
  Space,
  Dropdown,
  Menu,
  Alert,
} from "@arco-design/web-react";
import axios from "axios";
import DockviewContainer from "@/components-agent/DockviewContainer";
import { actionDispatcher } from "@/agent/dispatcher";
import { useUIStore } from "@/store/agent";
import {
  clearLocalWorkspace,
  getUIContext,
  initLocalWorkspace,
} from "@/utils/agent";
import {
  IconArrowUp,
  IconDelete,
  IconList,
  IconMore,
  IconRedo,
  IconSave,
  IconUndo,
  IconUser,
} from "@arco-design/web-react/icon";
import styles from "./index.module.less";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import SaveWorkspaceForm from "@/components-agent/SaveWorkspaceForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

const { TextArea } = Input;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const Agent = () => {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { agentMessages, chatMessages } = useUIStore(
    useShallow((state) => ({
      agentMessages: state.agentMessages,
      chatMessages: state.chatMessages,
    })),
  );
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspace");

  async function handleReturnToMain() {
    await navigate(location.pathname, { replace: true });
    await initLocalWorkspace();
  }

  async function handleApplyToMain() {
    const temporaryWorkspace = localStorage.getItem("workspace-temporary")!;
    localStorage.setItem("workspace-main", temporaryWorkspace);
    await handleReturnToMain();
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const userInput = input.trim();
    if (!userInput) return;

    const userMsg: Message = { role: "user", content: userInput };
    const systemMsg: Message = {
      role: "system",
      content: `当前界面状态：${JSON.stringify(getUIContext())}`,
    };
    const msgs = [...agentMessages, systemMsg, userMsg];
    setInput("");
    useUIStore.setState({ chatMessages: [...chatMessages, userMsg] });

    const action = (
      await axios.post("http://localhost:5000/api/agent", { messages: msgs })
    ).data;
    const assistantMsg: Message = {
      role: "assistant",
      content: JSON.stringify(action),
    };
    useUIStore.setState({ agentMessages: [...msgs, assistantMsg] });

    await actionDispatcher.dispatch(action);
  };
  const sendMessageMutation = useMutation({
    mutationKey: ["sendMessage"],
    mutationFn: handleSendMessage,
  });

  const droplist = (
    <Menu>
      <Menu.Item
        key="clear"
        onClick={() => {
          clearLocalWorkspace();
        }}
      >
        <Space style={{ color: "red" }}>
          <IconDelete />
          Clear Workspace
        </Space>
      </Menu.Item>
      <Menu.Item
        key="save"
        onClick={() => {
          setModalVisible(true);
        }}
      >
        <Space>
          <IconSave />
          Save & Share
        </Space>
      </Menu.Item>
      <Menu.Item
        key="list"
        onClick={() => {
          actionDispatcher.dispatch({
            type: "showWorkspaceList",
            parameters: {},
          });
        }}
      >
        <Space>
          <IconList />
          Workspace List
        </Space>
      </Menu.Item>
      <Menu.Item
        key="return"
        onClick={() => {
          handleReturnToMain();
        }}
      >
        <Space>
          <IconUndo />
          Return to Main
        </Space>
      </Menu.Item>
      <Menu.Item
        key="apply"
        onClick={() => {
          handleApplyToMain();
        }}
      >
        <Space>
          <IconRedo />
          Apply to Main
        </Space>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout
      style={{
        height: "100vh",
      }}
    >
      {/* 左侧聊天区 */}
      <Layout.Sider width={400} className={styles.customTextarea}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
          // className="chat-scroll-container"
        >
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #eee" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "rgb(129, 133, 140)",
                marginBottom: 12,
              }}
            >
              <Space size={12}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgb(240,241,242)",
                  }}
                >
                  <IconUser style={{ fontSize: 16 }} />
                </div>
                <span>1371634433@qq.com</span>
              </Space>
              <Dropdown droplist={droplist} position="br" trigger={"click"}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  className={styles.moreIcon}
                >
                  <IconMore />
                </div>
              </Dropdown>
            </div>
            {workspaceId ? (
              <Alert
                type="warning"
                content={
                  <div>
                    <div>Current: temporary workspace.</div>
                    <div>Changes need to be saved manually.</div>
                  </div>
                }
              />
            ) : (
              <Alert
                content={
                  <div>
                    <div>Current: main workspace.</div>
                    <div>Changes will be automatically saved locally.</div>
                  </div>
                }
              />
            )}
          </div>

          {/* 消息区域 */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 0",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                maxWidth: 800,
                margin: "0 auto",
                padding: "0 24px",
              }}
            >
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background:
                        msg.role === "user" ? "#edf3ff" : "transparent",
                      lineHeight: 1.6,
                      fontSize: 14,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* 输入区域 */}
          <div
            style={{
              borderTop: "1px solid #eee",
              padding: 16,
              height: "auto",
            }}
          >
            <div
              style={{
                margin: "0 auto",
              }}
            >
              <div style={{ display: "flex" }}>
                <TextArea
                  style={{ flex: 1, marginRight: 12 }}
                  value={input}
                  placeholder="Please enter action..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  onChange={setInput}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      sendMessageMutation.mutate();
                    }
                  }}
                  className={styles.customTextarea}
                />

                <Space>
                  <Button
                    type="primary"
                    onClick={() => {
                      sendMessageMutation.mutate();
                    }}
                    loading={sendMessageMutation.isPending}
                    shape="circle"
                  >
                    <IconArrowUp />
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        </div>
      </Layout.Sider>

      {/* 右侧 Panel */}
      <Layout.Content
        style={{
          flex: 1,
          borderLeft: "1px solid #eee",
        }}
      >
        <DockviewContainer />
      </Layout.Content>

      <SaveWorkspaceForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
        }}
      />
    </Layout>
  );
};

export default Agent;
