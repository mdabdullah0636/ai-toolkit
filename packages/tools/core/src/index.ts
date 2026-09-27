export type Tool = {
  readonly name: string;
  readonly description: string;
  readonly parameters?: Record<string, unknown>;
  readonly execute: (...args: unknown[]) => Promise<unknown>;
};

export type ToolResult = {
  readonly toolName: string;
  readonly success: boolean;
  readonly output: unknown;
};

export interface ToolExecutor {
  execute(tool: Tool, args: Record<string, unknown>): Promise<ToolResult>;
  executeStream(
    tool: Tool,
    args: Record<string, unknown>,
  ): AsyncIterable<ToolResult>;
}

export interface ToolRegistry {
  registerTool(tool: Tool): void;
  getTool(name: string): Tool | undefined;
  listTools(): readonly Tool[];
}

export function createToolRegistry(): ToolRegistry {
  const tools = new Map<string, Tool>();

  return {
    registerTool: tool => tools.set(tool.name, tool),
    getTool: name => tools.get(name),
    listTools: () => [...tools.values()],
  };
}
