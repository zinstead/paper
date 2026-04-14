import "molstar/lib/mol-plugin/context";

declare module "molstar/lib/mol-plugin/context" {
  interface PluginContext {
    custom?: {
      highlightResidues: () => void;
    };
  }
}
