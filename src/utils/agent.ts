import {
  getWorkspace,
  type FilterConditionSchema,
  type MoleculeFiltersSchema,
  type MoleculeSorterSchema,
} from "@/api";
import { useUIStore } from "@/store/agent";
import { isNil, omitBy } from "lodash";

export function updateUIContext(parameters: any) {
  const { uiContext } = useUIStore.getState();
  const context = { ...uiContext };
  const { projectId, taskId, entryId } = parameters ?? {};
  if (!isNil(projectId)) {
    context.projectId = projectId;
  }
  if (!isNil(taskId)) {
    context.taskId = taskId;
  }
  if (!isNil(entryId)) {
    context.entryId = entryId;
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

const OP_SUFFIX: Record<string, string> = {
  eq: ":eq",
  ne: ":ne",
  gt: ":gt",
  gte: ":gte",
  lt: ":lt",
  lte: ":lte",
  contains: ":contains",
  in: ":in", // 在数组中：field:in=value1,value2,value3
  // between 特殊处理，不在此映射，直接拆成 :gte 和 :lte
};

export function buildFilterQuery(filters: MoleculeFiltersSchema) {
  const params = new URLSearchParams();

  function appendCondition(field: string, suffix: string, value: any) {
    let key = field;
    if (suffix) key = `${field}${suffix}`;
    // 值如果是数组，转为逗号分隔字符串（用于 _in）
    const serialized = Array.isArray(value) ? value.join(",") : String(value);
    // const serialized = Array.isArray(value) ? value.join(",") : value;
    params.append(key, serialized);
  }

  function traverse(node: MoleculeFiltersSchema) {
    if (!node) return;

    // 叶子条件
    if ("field" in node && "operator" in node) {
      const { field, operator, value } =
        node as unknown as FilterConditionSchema;

      if (operator === "between") {
        // between: value 必须是 [low, high]
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error(
            `between operator requires [low, high] array, got ${value}`,
          );
        }
        const [low, high] = value;
        appendCondition(field, ":gte", low);
        appendCondition(field, ":lte", high);
      } else {
        const suffix = OP_SUFFIX[operator];
        if (suffix === undefined) {
          throw new Error(`Unsupported operator: ${operator}`);
        }
        appendCondition(field, suffix, value);
      }
    }
    // 组合节点
    else if ("logic" in node && "conditions" in node) {
      const { logic, conditions } = node;
      if (logic === "or") {
        // json-server 默认不支持 OR，可提示 Agent 改用多次查询或使用特殊插件
        throw new Error(
          "OR logic is not supported by json-server backend. Please split into separate queries or use AND logic.",
        );
      }
      // AND 逻辑：递归添加所有子条件
      for (const cond of conditions) {
        traverse(cond as MoleculeFiltersSchema);
      }
    } else {
      throw new Error("Invalid filter structure");
    }
  }

  if (Array.isArray(filters)) {
    for (const c of filters) {
      traverse(c);
    }
  }

  return params.toString();
}

export function buildSorterQuery(sorter: MoleculeSorterSchema) {
  const { sortBy, order } = sorter;
  const params = new URLSearchParams();
  const key = "_sort",
    value = order === "asc" ? sortBy : "-" + sortBy;
  params.append(key, value);
  return params.toString();
}

export function buildLimitQuery(limit: number) {
  const params = new URLSearchParams();
  params.append("_per_page", String(limit));
  return params.toString();
}

export function getPaginatedData(params: {
  current: number;
  pageSize: number;
  data: any[];
}) {
  const { current, pageSize, data } = params;
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = data.slice(start, end);
  return paginatedData;
}
