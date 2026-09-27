# AI Core Layer

The AI Core layer (Layer 1) provides the main SDK package `ai-toolkit` with high-level functions for text generation, streaming, structured output, embeddings, and image generation.

## Packages

- `ai-toolkit` (published as `ai-toolkit` on npm) - Main SDK package
- `@ai-toolkit/ai-generation` - Text generation primitives and utilities
- `@ai-toolkit/ai-multimodal` - Vision, audio, image, and video runtime
- `@ai-toolkit/ai-reasoning` - Reasoning engine and chain-of-thought primitives
- `@ai-toolkit/ai-structured` - Structured output generation and validation

## Core APIs

- `generateText` - Generate text completion
- `streamText` - Stream text completion
- `generateObject` - Generate structured output
- `streamObject` - Stream structured output
- `embed` / `embedMany` - Generate embeddings
- `generateImage` - Generate images

## Dependencies

AI Core may depend on:

- Foundation layer (types, runtime, provider-utils)
- Provider layer (for provider implementations)
- Gateway (for routing)

AI Core must not depend on:

- Higher-level domains (agents, workflow, etc.)

See `architecture/DEPENDENCY_RULES.md` for complete dependency rules.
