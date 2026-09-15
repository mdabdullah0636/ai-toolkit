---
'@ai-toolkit/gateway': patch
---

Refactor `@ai-toolkit/gateway` package:

- Consolidate the duplicate model wiring in `gateway-provider.ts` into a shared
  `createModelConfig()` helper and a single `GatewayModelConfig` type used by
  the language, embedding, and image models.
- Share one `createJsonErrorResponseHandler` instance (`gatewayErrorResponseHandler`)
  across all Gateway API calls instead of creating it inline per request.
- Replace the Node-only `Buffer.from` usage in `gateway-language-model.ts` with
  the runtime-neutral `convertUint8ArrayToBase64` so file parts work in
  edge runtimes.
- Rewrite `maybeEncodeFileParts` as a pure `encodeFileParts` that returns a new
  prompt instead of mutating the caller's options object.
- Replace the `JSON.parse` call in `errors/extract-api-call-response.ts` with
  `safeParseJSON` from `@ai-toolkit/provider-utils`, making
  `extractApiCallResponse` (and `asGatewayError`) async.
- Fix the stale `baseURL` doc comment default (`/v1/ai` → `/v3/ai`) and
  document the `/v1/credits` origin path.

No public API changes.
