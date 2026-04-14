import { useUIStore, type Message } from "@/store/agent";
import {
  DockviewReact,
  themeLight,
  type IDockviewPanel,
  type IDockviewPanelProps,
} from "dockview";
import { mapValues, omit } from "lodash";
import ProjectList from "../ProjectList";
import CreateProjectForm from "../CreateProjectForm";
import EntryList from "../EntryList";
import TaskList from "../TaskList";
import StructureViewer from "../StructureViewer";
import LigandList from "../LigandList";
import PerturbationMap from "../PerturbationMap";
import WorkspaceList from "../WorkspaceList";
import { actionDispatcher } from "@/agent/dispatcher";
import { initLocalWorkspace } from "@/utils/agent";

const componentMap: Record<
  string,
  React.FC<{ state: any; setState: (state: any) => void }>
> = {
  ProjectList: ProjectList,
  CreateProjectForm: CreateProjectForm,
  EntryList: EntryList,
  TaskList: TaskList,
  StructureViewer: StructureViewer,
  LigandList: LigandList,
  PerturbationMap: PerturbationMap,
  WorkspaceList: WorkspaceList,
};

const components = mapValues(componentMap, (Component) => {
  return (props: IDockviewPanelProps) => {
    const panelId = props.api.id;
    const panelStates = useUIStore((state) => state.panelStates);
    const panelState = panelStates[panelId];
    if (!panelState) return null;

    const setState = (newState: Record<string, any>) => {
      actionDispatcher.dispatch({
        type: "panelStateChange",
        parameters: { panelId, ...newState },
      });
    };

    return (
      <div
        style={{
          overflowY: "auto",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <Component state={panelState} setState={setState} />
      </div>
    );
  };
});

actionDispatcher.register("showProjectList", () => {
  const { dockviewApi, panelStates } = useUIStore.getState();
  if (!dockviewApi) return;
  const panelId = "ProjectList";
  const panel = dockviewApi.getPanel(panelId);
  if (panel) {
    panel.api.setActive();
  } else {
    const panelState = {
      pagination: { current: 1, pageSize: 10, total: 0 },
      projectType: "my",
    };
    useUIStore.setState({
      panelStates: { ...panelStates, [panelId]: panelState },
    });
    dockviewApi.addPanel({
      id: panelId,
      title: panelId,
      component: panelId,
    });
  }
});

actionDispatcher.register("createProject", () => {
  const { dockviewApi } = useUIStore.getState();
  if (!dockviewApi) return;
  const panelId = "CreateProjectForm";
  const panel = dockviewApi.getPanel(panelId);
  if (panel) {
    panel.api.setActive();
  } else {
    dockviewApi.addPanel({
      id: panelId,
      title: panelId,
      component: panelId,
    });
  }
});

actionDispatcher.register(
  "showEntryList",
  (parameters: { projectId: number }) => {
    const { projectId } = parameters;
    const { dockviewApi, panelStates } = useUIStore.getState();
    if (!dockviewApi) return;
    const component = "EntryList";
    const panelId = `${component}-${projectId}`;
    const panelTitle = `${component} (project:${projectId})`;
    const panel = dockviewApi.getPanel(panelId);
    if (panel) {
      panel.api.setActive();
    } else {
      const panelState = {
        projectId,
      };
      useUIStore.setState({
        panelStates: { ...panelStates, [panelId]: panelState },
      });
      dockviewApi.addPanel({
        id: panelId,
        title: panelTitle,
        component,
      });
    }
  },
);

actionDispatcher.register(
  "showTaskList",
  (parameters: { projectId: number }) => {
    const { projectId } = parameters;
    const { dockviewApi, panelStates } = useUIStore.getState();
    if (!dockviewApi) return;
    const component = "TaskList";
    const panelId = `${component}-${projectId}`;
    const panelTitle = `${component} (project:${projectId})`;
    const panel = dockviewApi.getPanel(panelId);
    if (panel) {
      panel.api.setActive();
    } else {
      const panelState = {
        projectId,
      };
      useUIStore.setState({
        panelStates: { ...panelStates, [panelId]: panelState },
      });
      dockviewApi.addPanel({
        id: panelId,
        title: panelTitle,
        component,
      });
    }
  },
);

actionDispatcher.register(
  "viewEntry",
  (parameters: {
    projectId: number;
    entryId: number;
    moleculeType: "protein" | "ligand" | "perturbationMap";
  }) => {
    const { projectId, entryId, moleculeType } = parameters;
    const { dockviewApi, panelStates } = useUIStore.getState();
    if (!dockviewApi) return;
    const componentMap = {
      protein: "StructureViewer",
      ligand: "LigandList",
      perturbationMap: "PerturbationMap",
    };
    const component = componentMap[moleculeType];
    const panelId = `${component}-${projectId}`;
    const panelTitle = `${component} (project:${projectId})`;
    const panel = dockviewApi.getPanel(panelId);
    if (panel) {
      panel.api.setActive();
    } else {
      const panelState = {
        projectId,
        entryId,
      };
      useUIStore.setState({
        panelStates: { ...panelStates, [panelId]: panelState },
      });
      dockviewApi.addPanel({
        id: panelId,
        title: panelTitle,
        component,
      });
    }
  },
);

actionDispatcher.register(
  "missingParameters",
  (parameters: { query: string }) => {
    const { chatMessages } = useUIStore.getState();
    const msg: Message = { role: "assistant", content: parameters.query };
    useUIStore.setState({ chatMessages: [...chatMessages, msg] });
  },
);

actionDispatcher.register("unknown", (parameters: { reason: string }) => {
  const { chatMessages } = useUIStore.getState();
  const msg: Message = { role: "assistant", content: parameters.reason };
  useUIStore.setState({ chatMessages: [...chatMessages, msg] });
});

actionDispatcher.register("activePanelChange", () => {});

actionDispatcher.register(
  "panelStateChange",
  (parameters: { panelId: string; [key: string]: any }) => {
    const { panelId, ...partialPanelState } = parameters;
    const { panelStates, dockviewApi } = useUIStore.getState();
    if (!dockviewApi) return;
    const panelState = panelStates[panelId];
    useUIStore.setState({
      panelStates: {
        ...panelStates,
        [panelId]: { ...panelState, ...partialPanelState },
      },
    });
  },
);

actionDispatcher.register(
  "removePanel",
  (parameters: { panel: IDockviewPanel }) => {
    const { panel } = parameters;
    const { panelStates } = useUIStore.getState();
    useUIStore.setState({ panelStates: omit(panelStates, panel.id) });
  },
);

actionDispatcher.register("showWorkspaceList", () => {
  const { dockviewApi, panelStates } = useUIStore.getState();
  if (!dockviewApi) return;
  const panelId = "WorkspaceList";
  const panel = dockviewApi.getPanel(panelId);
  if (panel) {
    panel.api.setActive();
  } else {
    const panelState = {
      pagination: { current: 1, pageSize: 10, total: 0 },
    };
    useUIStore.setState({
      panelStates: { ...panelStates, [panelId]: panelState },
    });
    dockviewApi.addPanel({
      id: panelId,
      title: panelId,
      component: panelId,
    });
  }
});

const DockviewContainer = () => {
  return (
    <DockviewReact
      components={components}
      onReady={async (e) => {
        const api = e.api;
        useUIStore.setState({ dockviewApi: api });

        api.onDidActivePanelChange((panel) => {
          actionDispatcher.dispatch({
            type: "activePanelChange",
            parameters: {},
          });
        });

        api.onDidRemovePanel((panel) => {
          actionDispatcher.dispatch({
            type: "removePanel",
            parameters: { panel },
          });
        });

        await initLocalWorkspace();
      }}
      theme={themeLight}
    />
  );
};

export default DockviewContainer;
