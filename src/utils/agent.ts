import { getWorkspace } from "@/api";
import { useUIStore } from "@/store/agent";
import { isNil, omitBy } from "lodash";

export function updateUIContext(parameters: any) {
  const { uiContext } = useUIStore.getState();
  const context = { ...uiContext };
  const { projectId, taskId } = parameters ?? {};
  if (!isNil(projectId)) {
    context.projectId = projectId;
  }
  if (!isNil(taskId)) {
    context.taskId = taskId;
  }
  useUIStore.setState({ uiContext: context });
}

export function getUIContext() {
  const { uiContext, dockviewApi, panelStates } = useUIStore.getState();
  if (!dockviewApi) return {};
  if (!dockviewApi.activePanel) return omitBy(uiContext, isNil);

  const activePanelId = dockviewApi.activePanel.id;
  const panel = dockviewApi.getPanel(activePanelId)!;
  const activePanel = {
    id: activePanelId,
    component: panel.api.component,
    state: panelStates[activePanelId],
  };
  const context = omitBy({ ...uiContext, activePanel }, isNil);
  return context;
}

export function saveLocalWorkspace() {
  const { panelStates, uiContext, agentMessages, chatMessages, dockviewApi } =
    useUIStore.getState();
  if (!dockviewApi) return;
  const layout = dockviewApi.toJSON();
  const workspaceState = {
    layout,
    panelStates,
    uiContext,
    agentMessages,
    chatMessages,
  };

  const params = new URLSearchParams(location.search);
  const workspaceId = params.get("workspace");
  if (workspaceId) {
    localStorage.setItem("workspace-temporary", JSON.stringify(workspaceState));
  } else {
    localStorage.setItem("workspace-main", JSON.stringify(workspaceState));
  }
}

export async function initLocalWorkspace() {
  const params = new URLSearchParams(location.search);
  const workspaceId = params.get("workspace");
  let workspaceState = "";
  if (workspaceId) {
    const workspace = await getWorkspace(workspaceId);
    localStorage.setItem("workspace-temporary", workspace.state);
    workspaceState = workspace.state;
  } else {
    workspaceState = localStorage.getItem("workspace-main")!;
  }

  if (workspaceState) {
    const { layout, ...otherState } = JSON.parse(workspaceState);
    const dockviewApi = useUIStore.getState().dockviewApi;
    if (dockviewApi) {
      dockviewApi.clear();
      useUIStore.setState(otherState);
      dockviewApi.fromJSON(layout, { reuseExistingPanels: false });
    }
  }
}

export function clearLocalWorkspace() {
  const params = new URLSearchParams(window.location.search);
  const workspaceId = params.get("workspace");
  if (workspaceId) {
    localStorage.removeItem("workspace-temporary");
  } else {
    localStorage.removeItem("workspace-main");
  }
  useUIStore.setState({
    panelStates: {},
    uiContext: {},
    agentMessages: [],
    chatMessages: [],
  });
  useUIStore.getState().dockviewApi?.clear();
}

export function getShareUrl(workspaceId: string) {
  const params = new URLSearchParams(location.search);
  params.set("workspace", workspaceId);
  const targetUrl = `${location.origin}${location.pathname}?${params.toString()}`;
  return targetUrl;
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
