# Memory System Layer

The Memory System layer provides a comprehensive memory system with short-term, long-term, semantic, and episodic memory capabilities.

## Packages

- `@ai-toolkit/memory` - Memory primitives and interfaces
- `@ai-toolkit/memory-short-term` - Short-term memory (conversation)
- `@ai-toolkit/memory-long-term` - Long-term memory (persistent)
- `@ai-toolkit/memory-semantic` - Semantic memory (vector-based)
- `@ai-toolkit/memory-episodic` - Episodic memory (event-based)
- `@ai-toolkit/memory-storage` - Storage adapters (PostgreSQL, Redis, etc.)

## Dependencies

Memory may depend on:

- Foundation layer (types, runtime, provider-utils)
- AI Core (for model abstractions)
- Context (for context management)

See `architecture/DEPENDENCY_RULES.md` for complete dependency rules.
