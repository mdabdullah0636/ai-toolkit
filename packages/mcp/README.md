# MCP Layer

The MCP layer (Layer 2 - Protocol) provides the Model Context Protocol implementation for connecting AI models with external tools and data sources.

## Packages

- `@ai-toolkit/mcp` - Model Context Protocol implementation

## Capabilities

- Tool discovery and execution
- Resource access and management
- Prompt template management
- Client and server implementations

## Dependencies

MCP may depend on:

- Foundation layer (types, runtime, provider)
- Runtime layer (provider-utils for shared utilities)

MCP must not depend on:

- Provider layer (protocol must be provider-agnostic)
- Higher-level domains (agents, workflow, etc.)

See `architecture/DEPENDENCY_RULES.md` for complete dependency rules.
