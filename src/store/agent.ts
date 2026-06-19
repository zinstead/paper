import type { DockviewApi } from "dockview";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type PanelStatesType = Record<string, any>;

interface UIContext {
  projectId?: number;
  taskId?: number;
  entryId?: number;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface RemoteWorkspace {
  id: string;
  name: string;
  description: string;
  creator: string;
  createTime: number;
  updateTime: number;
  state: string;
}

export interface UserInfo {
  username: string;
}

interface UIStore {
  panelStates: PanelStatesType;
  dockviewApi: DockviewApi | null;
  uiContext: UIContext;
  agentMessages: Message[];
  chatMessages: Message[];
  user?: UserInfo;
}

export const useUIStore = create<UIStore>()(
  devtools((set) => ({
    panelStates: {},
    dockviewApi: null,
    uiContext: {},
    agentMessages: [],
    chatMessages: [],
    user: {
      username: "alan",
    },
  })),
);
