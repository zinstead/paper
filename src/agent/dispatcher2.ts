// 核心 dispatcher
class ActionDispatcher {
  private handlers = {
    create_project: createProjectHandler,
    submit_task: submitTaskHandler,
  };

  async dispatch(action: { type: string; parameters: any }) {
    const { type, parameters } = action;
    const handler = this.handlers.get(type);
    if (handler) {
      handler(parameters);
    }
  }
}

export const actionDispatcher = new ActionDispatcher();
