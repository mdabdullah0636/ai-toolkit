# @ai-toolkit/provider-utils Audit and Scope Boundaries

## Overview

`@ai-toolkit/provider-utils` is the shared utility package for provider implementations and the core SDK. It provides HTTP, serialization, schema conversion, streaming, and media utilities. Currently it serves as a "utility bucket" — this document catalogs every utility and assigns it to a responsibility category to guide Phase 3 refactoring.

## Responsibility categories

| Category                             | Status                           | Refactoring target                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Streams and chunk formatting         | Current                          | Extract to `@ai-toolkit/stream-utils` (Foundation) — providers need stream handling without pulling in HTTP logic                                                                                                                                                                                                                                                                                   |
| Schema conversion and validation     | **Partially migrated (Phase 3)** | **COMPLETED**: Type definitions (`Schema`, `FlexibleSchema`, `LazySchema`, `ZodSchema`, `StandardSchema`, `InferSchema`, `ValidationResult`, `schemaSymbol`) moved to `@ai-toolkit/provider` (Foundation). Implementation functions (`jsonSchema`, `asSchema`, `zod3Schema`, `zod4Schema`, `zodSchema`, `isZod4Schema`) remain in provider-utils (Runtime) due to zod/json-schema conversion logic. |
| Serialization and deserialization    | Current                          | Keep in provider-utils or move to `@ai-toolkit/runtime`                                                                                                                                                                                                                                                                                                                                             |
| HTTP and retry logic                 | Current                          | Core responsibility of provider-utils — this is its primary purpose                                                                                                                                                                                                                                                                                                                                 |
| Media handling (audio, image, video) | Current                          | Keep in provider-utils — providers need media conversion                                                                                                                                                                                                                                                                                                                                            |
| Tool factory utilities               | Current                          | Keep in provider-utils — provider-specific tool creation                                                                                                                                                                                                                                                                                                                                            |
| ID generation and general utilities  | Current                          | Move pure utilities (`generateId`, `delay`, `asArray`, `isNonNullable`) to `@ai-toolkit/runtime` (Foundation)                                                                                                                                                                                                                                                                                       |

## Current utility catalog

### 1. Streams and chunk formatting

| Export                                 | Source file                                    | Responsibility                                        | Public     |
| -------------------------------------- | ---------------------------------------------- | ----------------------------------------------------- | ---------- |
| `convertAsyncIteratorToReadableStream` | `convert-async-iterator-to-readable-stream.ts` | Wraps an async iterator into a `ReadableStream`       | Yes        |
| `parseJsonEventStream`                 | `parse-json-event-stream.ts`                   | Parses SSE/JSON event streams from API responses      | Yes        |
| `parseJson`                            | `parse-json.ts`                                | Safe JSON parsing with error handling                 | Yes        |
| `ResponseHandler`                      | `response-handler.ts`                          | Builder for typed response handlers (JSON, streaming) | Yes        |
| `createEventSourceResponseHandler`     | `response-handler.ts`                          | Handles SSE event stream responses                    | Yes        |
| `createJsonResponseHandler`            | `response-handler.ts`                          | Handles JSON responses                                | Yes        |
| `cancelResponseBody`                   | `cancel-response-body.ts`                      | Aborts a response body stream                         | Yes        |
| `convertResponseStreamToArray` (test)  | `test/convert-response-stream-to-array.ts`     | Converts a Response stream to array (test-only)       | Yes (test) |
| `convertReadableStreamToArray` (test)  | `test/convert-readable-stream-to-array.ts`     | Alias for test compatibility                          | Yes (test) |

### 2. Schema conversion and validation

| Export                 | Source file                                                                 | Responsibility                                        | Public   |
| ---------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| `Schema`               | `@ai-toolkit/provider` (Foundation) — types re-exported from provider-utils | Contract type for schemas with JSON schema + validate | Yes      |
| `LazySchema`           | `@ai-toolkit/provider` (Foundation) — types re-exported from provider-utils | Lazy-initialized schema type                          | Yes      |
| `FlexibleSchema`       | `@ai-toolkit/provider` (Foundation) — types re-exported from provider-utils | Union of Schema, Zod, and Standard Schema types       | Yes      |
| `InferSchema`          | `@ai-toolkit/provider` (Foundation) — types re-exported from provider-utils | Infers the object type from a schema                  | Yes      |
| `jsonSchema`           | `schema.ts` (provider-utils)                                                | Creates a `Schema` from a JSON Schema object          | Yes      |
| `asSchema`             | `schema.ts` (provider-utils)                                                | Converts any `FlexibleSchema` to a `Schema`           | Yes      |
| `lazySchema`           | `schema.ts` (provider-utils)                                                | Creates a lazy-initialized schema                     | Yes      |
| `zod3Schema`           | `schema.ts` (provider-utils)                                                | Creates a `Schema` from a Zod v3 schema               | Yes      |
| `zod4Schema`           | `schema.ts` (provider-utils)                                                | Creates a `Schema` from a Zod v4 schema               | Yes      |
| `isZod4Schema`         | `schema.ts` (provider-utils)                                                | Type guard for Zod v4 schemas                         | Yes      |
| `ValidationResult`     | `@ai-toolkit/provider` (Foundation) — types re-exported from provider-utils | Result type for schema validation                     | Yes      |
| `StandardSchema`       | `@ai-toolkit/provider` (Foundation) via `@standard-schema/spec` re-export   | Standard Schema interface                             | Yes      |
| `StandardJSONSchemaV1` | `@ai-toolkit/provider` (Foundation) via `@standard-schema/spec` re-export   | Standard JSON Schema interface                        | Yes      |
| `zodSchema`            | `schema.ts` (provider-utils)                                                | Generic Zod schema adapter                            | Yes      |
| `schemaSymbol`         | `@ai-toolkit/provider` (Foundation) — re-exported from provider-utils       | Symbol for marking schemas                            | Internal |

### 3. Serialization and deserialization

| Export                              | Source file                                  | Responsibility                                   | Public |
| ----------------------------------- | -------------------------------------------- | ------------------------------------------------ | ------ |
| `secureJsonParse`                   | `secure-json-parse.ts`                       | Safe `JSON.parse` with error handling            | Yes    |
| `isJsonSerializable`                | `is-json-serializable.ts`                    | Checks if a value is JSON-serializable           | Yes    |
| `SerializationError`                | `serialization-error.ts`                     | Error thrown when serialization fails            | Yes    |
| `serializeModelOptions`             | `serialize-model-options.ts`                 | Serializes model options for error messages      | Yes    |
| `removeUndefinedEntries`            | `remove-undefined-entries.ts`                | Removes undefined values from objects            | Yes    |
| `parseProviderOptions`              | `parse-provider-options.ts`                  | Parses provider-specific options from tool calls | Yes    |
| `injectJsonInstructionIntoMessages` | `inject-json-instruction.ts`                 | Injects JSON instructions into message arrays    | Yes    |
| `convertInlineFileDataToUint8Array` | `convert-inline-file-data-to-uint8-array.ts` | Converts inline file data to Uint8Array          | Yes    |

### 4. HTTP and retry logic

| Export                           | Source file                             | Responsibility                                     | Public   |
| -------------------------------- | --------------------------------------- | -------------------------------------------------- | -------- |
| `FetchFunction`                  | `fetch-function.ts`                     | Type for fetch-compatible functions                | Yes      |
| `postToApi`                      | `post-to-api.ts`                        | POST request with response handler                 | Yes      |
| `getFromApi`                     | `get-from-api.ts`                       | GET request with response handler                  | Yes      |
| `deleteFromApi`                  | `delete-from-api.ts`                    | DELETE request with response handler               | Yes      |
| `postMultipartStreamToApi`       | `post-multipart-stream-to-api.ts`       | POST multipart/form-data with streaming            | Yes      |
| `retryWithExponentialBackoff`    | `retry-with-exponential-backoff.ts`     | Retry failed requests with backoff                 | Yes      |
| `handleFetchError`               | `handle-fetch-error.ts`                 | Converts fetch errors to provider errors           | Yes      |
| `normalizeHeaders`               | `normalize-headers.ts`                  | Normalizes HTTP headers                            | Yes      |
| `combineHeaders`                 | `combine-headers.ts`                    | Combines multiple header sources                   | Yes      |
| `sanitizeRequestHeaders`         | `sanitize-request-headers.ts`           | Strips sensitive headers                           | Yes      |
| `loadApiKey`                     | `load-api-key.ts`                       | Loads API key from settings or env                 | Yes      |
| `loadSetting`                    | `load-setting.ts`                       | Loads a setting from config or env                 | Yes      |
| `loadOptionalSetting`            | `load-optional-setting.ts`              | Loads an optional setting                          | Yes      |
| `resolve`                        | `resolve.ts`                            | Resolves nested values (possibly deprecated)       | Yes      |
| `resolveProviderReference`       | `resolve-provider-reference.ts`         | Resolves "provider/model" references               | Yes      |
| `isProviderReference`            | `is-provider-reference.ts`              | Checks if a string is a "provider/model" reference | Yes      |
| `withoutTrailingSlash`           | `without-trailing-slash.ts`             | Removes trailing slash from URL                    | Yes      |
| `validateBaseUrl`                | `validate-base-url.ts`                  | Validates a base URL                               | Yes      |
| `validateDownloadUrl`            | `validate-download-url.ts`              | Validates a download URL                           | Yes      |
| `safeNodeFetch`                  | `safe-node-fetch.ts`                    | Fallback fetch for Node.js                         | Internal |
| `connectToWebSocket`             | `websocket.ts`                          | Establishes a WebSocket connection                 | Yes      |
| `extractResponseHeaders`         | `extract-response-headers.ts`           | Extracts response headers                          | Yes      |
| `isUrlSupported`                 | `is-url-supported.ts`                   | Checks if a URL is supported in the runtime        | Yes      |
| `isSameOrigin`                   | `is-same-origin.ts`                     | Checks if two URLs are same-origin                 | Yes      |
| `readResponseWithSizeLimit`      | `read-response-with-size-limit.ts`      | Reads response with size cap                       | Yes      |
| `withUserAgentSuffix`            | `with-user-agent-suffix.ts`             | Appends a suffix to the user agent                 | Yes      |
| `getRuntimeEnvironmentUserAgent` | `get-runtime-environment-user-agent.ts` | Gets the runtime environment user agent            | Yes      |
| `normalizeBatchRequestCounts`    | `normalize-batch-request-counts.ts`     | Normalizes batch request counts                    | Yes      |

### 5. Media handling (audio, image, video)

| Export                              | Source file                                  | Responsibility                          | Public |
| ----------------------------------- | -------------------------------------------- | --------------------------------------- | ------ |
| `convertImageModelFileToDataUri`    | `convert-image-model-file-to-data-uri.ts`    | Converts image file input to data URI   | Yes    |
| `convertInlineFileDataToUint8Array` | `convert-inline-file-data-to-uint8-array.ts` | Converts inline file data to Uint8Array | Yes    |
| `detectMediaType`                   | `detect-media-type.ts`                       | Detects media type from file extension  | Yes    |
| `mediaTypeToExtension`              | `media-type-to-extension.ts`                 | Converts media type to file extension   | Yes    |
| `resolveFullMediaType`              | `resolve-full-media-type.ts`                 | Resolves full media type from file      | Yes    |
| `DownloadError`                     | `download-error.ts`                          | Error for blob download failures        | Yes    |
| `downloadBlob`                      | `download-blob.ts`                           | Downloads a blob from a URL             | Yes    |
| `Uint8Utils`                        | `uint8-utils.ts`                             | Utilities for Uint8Array manipulation   | Yes    |

### 6. Tool factory utilities

| Export                                      | Source file                         | Responsibility                             | Public |
| ------------------------------------------- | ----------------------------------- | ------------------------------------------ | ------ |
| `createToolNameMapping`                     | `create-tool-name-mapping.ts`       | Maps tool names for provider compatibility | Yes    |
| `ProviderToolFactory`                       | `provider-tool-factory.ts`          | Factory for provider-defined tools         | Yes    |
| `createProviderToolFactory`                 | `provider-tool-factory.ts`          | Creates a provider tool factory            | Yes    |
| `ProviderToolFactoryWithOutputSchema`       | `provider-tool-factory.ts`          | Tool factory with output schema            | Yes    |
| `createProviderToolFactoryWithOutputSchema` | `provider-tool-factory.ts`          | Creates factory with output schema         | Yes    |
| `ProviderExecutedToolFactory`               | `provider-executed-tool-factory.ts` | Factory for provider-executed tools        | Yes    |
| `ProviderDefinedToolFactory`                | `provider-defined-tool-factory.ts`  | Factory for provider-defined tools         | Yes    |

### 7. ID generation and general utilities

| Export                                | Source file                                  | Responsibility                                | Public |
| ------------------------------------- | -------------------------------------------- | --------------------------------------------- | ------ | --- |
| `generateId`                          | `generate-id.ts`                             | Generates a random ID                         | Yes    |
| `createIdGenerator`                   | `generate-id.ts`                             | Creates an ID generator function              | Yes    |
| `IdGenerator`                         | `generate-id.ts`                             | Type for ID generators                        | Yes    |
| `delay`                               | `delay.ts`                                   | Returns a promise that resolves after a delay | Yes    |
| `DelayedPromise`                      | `delayed-promise.ts`                         | A promise that can be delayed                 | Yes    |
| `asArray`                             | `as-array.ts`                                | Wraps a value in an array if not already      | Yes    |
| `Arrayable<T>`                        | `as-array.ts`                                | Type: `T                                      | T[]`   | Yes |
| `isNonNullable`                       | `is-non-nullable.ts`                         | Type guard for non-null values                | Yes    |
| `isAbortError`                        | `is-abort-error.ts`                          | Checks if an error is an AbortError           | Yes    |
| `getErrorMessage`                     | `get-error-message.ts`                       | Safely extracts error messages                | Yes    |
| `createNullLanguageModelUsage`        | `create-null-language-model-usage.ts`        | Returns a no-op usage object                  | Yes    |
| `createLanguageModelResponseMetadata` | `create-language-model-response-metadata.ts` | Creates response metadata object              | Yes    |
| `mapReasoningToProvider`              | `map-reasoning-to-provider.ts`               | Maps reasoning settings to provider format    | Yes    |
| `maybePromiseLike`                    | `maybe-promise-like.ts`                      | Type for values that may be promise-like      | Yes    |
| `isBrowserRuntime`                    | `is-browser-runtime.ts`                      | Checks if running in browser                  | Yes    |
| `isBuffer`                            | `is-buffer.ts`                               | Checks if a value is a Buffer                 | Yes    |
| `isAsyncIterable`                     | `is-async-iterable.ts`                       | Checks if a value is async iterable           | Yes    |

### 8. Types

| Export                 | Source file                       | Responsibility                   | Public |
| ---------------------- | --------------------------------- | -------------------------------- | ------ |
| `ToolExecutionOptions` | `types/tool-execution-options.ts` | Options for tool execution       | Yes    |
| `ToolResult`           | `types/tool-result.ts`            | Result type for tool invocations | Yes    |
| `ProviderDefinedTool`  | `types/provider-defined-tool.ts`  | A tool defined by a provider     | Yes    |
| `ProviderExecutedTool` | `types/provider-executed-tool.ts` | A tool executed by a provider    | Yes    |

## Public vs internal API

### Public API (used by providers and core SDK)

All exports from `index.ts` are public. The key public exports are:

- Schema utilities (`Schema`, `jsonSchema`, `asSchema`, `zod3Schema`, `zod4Schema`, `FlexibleSchema`, `InferSchema`) — type definitions now in `@ai-toolkit/provider`; runtime functions (jsonSchema, asSchema, zodSchema, zod3Schema, zod4Schema) remain in provider-utils
- HTTP utilities (`postToApi`, `getFromApi`, `postMultipartStreamToApi`, `loadApiKey`, `loadSetting`, `FetchFunction`)
- Stream utilities (`ResponseHandler`, `createJsonResponseHandler`, `createEventSourceResponseHandler`, `parseJsonEventStream`)
- Media utilities (`convertImageModelFileToDataUri`, `detectMediaType`, `downloadBlob`)
- Utility functions (`generateId`, `delay`, `asArray`, `isAbortError`, `getErrorMessage`)
- Tool factory utilities (`createProviderToolFactory`, `createToolNameMapping`)
- Types (`Arrayable`, `IdGenerator`, `FetchFunction`, `ToolExecutionOptions`, `ToolResult`)

### Internal API (not for external use)

| Export                                                                             | Reason                                                     |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `safeNodeFetch`                                                                    | Fallback fetch for Node.js — internal use only             |
| `addAdditionalPropertiesToJsonSchema`                                              | Internal helper for JSON Schema conversion                 |
| `ProviderToolFactory`, `ProviderExecutedToolFactory`, `ProviderDefinedToolFactory` | Factory types — used internally by providers               |
| `createNullLanguageModelUsage`                                                     | Creates null usage — internal helper for providers         |
| `createLanguageModelResponseMetadata`                                              | Internal metadata builder                                  |
| All `*.test.ts` and `*.test-d.ts` files                                            | Test files — not part of the public API                    |
| `test/` directory exports                                                          | Test utilities only (`convertReadableStreamToArray`, etc.) |

## Node.js builtin usage

Provider-utils uses:

- `node:dns` — in `safe-node-fetch.ts` for DNS resolution
- `node:module` — in `safe-node-fetch.ts` for module resolution

These are isolated to the `safeNodeFetch` utility and don't affect browser-compatible builds.

## Boundary clarification

Per the Phase 3 goals:

| Package                      | Responsibility                                                                                                                             | Boundary                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `@ai-toolkit/runtime`        | Browser-safe runtime contracts, capability detection (`RuntimeTarget`, `RuntimeCapabilities`, `createRuntimeContext`)                      | Foundation layer — no provider-specific logic, no Node builtins |
| `ai-toolkit`                 | High-level generation functions (`generateText`, `streamText`, `generateObject`, `embed`, `generateImage`, `transcribe`, `generateSpeech`) | Runtime layer — orchestrates calls to provider models           |
| `@ai-toolkit/provider-utils` | Shared utilities for provider implementations (HTTP, serialization, schema conversion, streams, media)                                     | Runtime layer — provides the building blocks providers use      |
| `@ai-toolkit/provider`       | Provider contract interfaces (`LanguageModelV3`, `EmbeddingModelV3`, etc.)                                                                 | Foundation layer — defines the model type contracts             |

## Phase 3 refactoring targets

1. **COMPLETED: Schema type API moved to `@ai-toolkit/provider`**: The `Schema`, `LazySchema`, `FlexibleSchema`, `InferSchema`, `ValidationResult`, `ZodSchema`, `StandardSchema` type definitions and `schemaSymbol` have been moved to `@ai-toolkit/provider` (Foundation). The implementation functions (`jsonSchema`, `asSchema`, `zod3Schema`, `zod4Schema`, `zodSchema`, `isZod4Schema`) remain in `@ai-toolkit/provider-utils` (Runtime). `@ai-toolkit/provider` now has `zod` and `@standard-schema/spec` as peerDependencies. This reduced the `mcp:runtime` exception — MCP now imports `FlexibleSchema` from Foundation, but still imports the `Tool` type from provider-utils (type-only import, documented exception retained).

2. **Move pure utilities to `@ai-toolkit/runtime`**: Functions like `generateId`, `delay`, `asArray`, `isNonNullable`, `getErrorMessage` are pure and don't need HTTP or schema logic. They could move to `@ai-toolkit/runtime` (Foundation) for broader reuse.

3. **Extract stream utilities**: Stream-related utilities (`ResponseHandler`, `parseJsonEventStream`, `convertAsyncIteratorToReadableStream`) could form a separate `@ai-toolkit/streams` package (Foundation) that both providers and runtime depend on.

4. **Reduce `mcp:runtime` exception**: The `@ai-toolkit/mcp` (Protocol) package now imports `FlexibleSchema` from `@ai-toolkit/provider` (Foundation). It still imports the `Tool` type from provider-utils (type-only import). Fully eliminating the exception would require moving the `Tool` type (and its transitive type dependencies) to Foundation.
