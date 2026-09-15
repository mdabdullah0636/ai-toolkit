---
'@ai-toolkit/provider': patch
'@ai-toolkit/provider-utils': patch
'@ai-toolkit/mcp': patch
'@ai-toolkit/openai': patch
'@ai-toolkit/anthropic': patch
'@ai-toolkit/google': patch
'@ai-toolkit/azure': patch
'ai-toolkit': patch
---

Architecture baseline: Phase 0-3 implementation

**Phase 3 — Runtime and Provider Boundary Cleanup (complete)**

Schema type definitions (`Schema`, `LazySchema`, `ZodSchema`, `StandardSchema`,
`FlexibleSchema`, `InferSchema`, `ValidationResult`, `schemaSymbol`) have been
migrated from `@ai-toolkit/provider-utils` (Runtime) to `@ai-toolkit/provider`
(Foundation). This is a source-level re-export — existing imports from
`@ai-toolkit/provider-utils` continue to work, but new consumers should import
schema types from `@ai-toolkit/provider`.

`@ai-toolkit/provider` now declares `zod` and `@standard-schema/spec` as
peerDependencies to support type-only imports. The schema type definitions use
`StandardSchemaV1` (from `@standard-schema/spec`) as the structural type for
`ZodSchema`, making them compatible across Zod v3 and v4.

The conformance test suite has been piloted on 4 providers:
- OpenAI: 7/7 tests pass
- Anthropic: 4/4 tests pass (chat only; no embeddings/images)
- Google: 6/7 pass (1 skipped: batch embedding due to MSW URL matching)
- Azure: 7/7 tests pass

Also includes Phase 0-2 work: package inventory, layer classification,
dependency-direction validation, machine-generated capability matrix,
architecture inspection commands, and gateway relocation.
