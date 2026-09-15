# Model Capability Matrix

Capabilities come from `@ai-toolkit/capabilities` (`ModelCapability`). This matrix is **machine-generated** from provider source code and gateway model settings, not maintained manually. The generated JSON lives at `build/capability-matrix.json` and is validated by `pnpm arch:capabilities:check`.

## Capability summary by model type

The matrix detects capabilities by scanning each provider's `-provider.ts` interface for model factory methods and their return types:

| Model type returned    | Capability |
| ---------------------- | ---------- |
| `LanguageModelV3`      | chat       |
| `EmbeddingModelV3`     | embedding  |
| `ImageModelV3`         | image      |
| `SpeechModelV3`        | speech     |
| `TranscriptionModelV3` | speech     |
| `RerankingModelV3`     | reranker   |
| `VideoModelV3`         | video      |

## Source of truth

- `packages/validation/capabilities/src/index.ts` — `ModelCapability`, `ModelCapabilityDescriptor`
- `tools/scripts/generate-capability-matrix.mjs` — generates `build/capability-matrix.json`
- Per-provider `src/*-provider.ts` export surfaces (Phase B reconciliation)
- `packages/core/gateway/src/*-model-settings.ts` — gateway model catalog

## How to regenerate

```bash
pnpm arch:capabilities   # regenerate build/capability-matrix.json
pnpm arch:capabilities:check  # verify it's up to date (CI)
```
