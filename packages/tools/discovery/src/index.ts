export type DiscoveredTool = {
  readonly name: string;
  readonly source: string;
  readonly description: string;
  readonly capabilities: readonly string[];
};

export interface ToolDiscoveryClient {
  discoverMCP(): Promise<readonly DiscoveredTool[]>;
  discoverRegistry(): Promise<readonly DiscoveredTool[]>;
  discoverAll(): Promise<readonly DiscoveredTool[]>;
}

export interface DiscoveryEngine {
  discover(): Promise<readonly DiscoveredTool[]>;
  filterByCapability(capability: string): Promise<readonly DiscoveredTool[]>;
  mergeSources(sources: readonly DiscoveredTool[][]): readonly DiscoveredTool[];
}

export function createDiscoveryEngine(): DiscoveryEngine {
  return {
    discover: async () => [],
    filterByCapability: async capability => [],
    mergeSources: sources => sources.flat(),
  };
}
