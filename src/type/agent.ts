export interface PanelComponentProps<StateType> {
  state: StateType;
  setState: (state: Partial<StateType>) => void;
}
