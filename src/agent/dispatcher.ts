import { saveLocalWorkspace, updateUIContext } from "@/utils/agent";

// 核心 dispatcher
class ActionDispatcher {
  private handlers = new Map<string, Function[]>();

  register(type: string, handler: Function) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
  }

  async dispatch(action: { type: string; parameters: any }) {
    updateUIContext(action.parameters);
    const handlers = this.handlers.get(action.type) || [];
    for (const handler of handlers) {
      await handler(action.parameters);
    }
    saveLocalWorkspace();
  }
}

export const actionDispatcher = new ActionDispatcher();
