# Context Management Layer

The Context Management layer provides context window management with compression, summarization, and intelligent routing to optimize token usage and relevance.

## Packages

- `@ai-toolkit/context` - Context primitives and types
- `@ai-toolkit/context-window` - Context window management
- `@ai-toolkit/context-compression` - Context compression algorithms
- `@ai-toolkit/context-summarization` - Context summarization
- `@ai-toolkit/context-runtime` - Runtime context tracking
- `@ai-toolkit/context-routing` - Context routing and selection

## Dependencies

Context may depend on:

- Foundation layer (types, runtime, provider-utils)
- AI Core (for model abstractions)
- Memory (for persistent context)

See `architecture/DEPENDENCY_RULES.md` for complete dependency rules.
