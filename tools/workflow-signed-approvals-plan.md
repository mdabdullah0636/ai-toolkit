# Implementation Plan: Workflow-Safe Signed Tool Approvals for ToolLoopAgent

## Objective

Add constructor- and stream-level `experimental_toolApprovalSecret` support to `ToolLoopAgent` (WorkflowAgent) using an environment-variable reference. The system signs and verifies approvals inside durable steps, binds signatures to approval and tool-call details, preserves signatures through stream transformations, and never serializes the raw secret.

## Architecture Overview

```
ToolLoopAgent (constructor)
  └─ experimental_toolApprovalSecret (env-var ref string)
       │
       ▼
  ToolLoopAgentSettings (via CallSettings)
       │
       ▼
  generateText() / streamText()  ── toolApprovalSecret: ...
       │
       ├──▶ executeToolsFromStream()  ── sign approvals (maybeSignApproval)
       │        │
       │        └──▶ tool-approval-request stream part (includes signature)
       │
       ├──▶ validateApprovedToolApprovals()  ── verify signatures (verifyToolApprovalSignature)
       │        │
       │        └──▶ approved/denied/invalid classification
       │
       └──▶ stream transformations  ── signatures preserved through transforms
```

## Phase 1: Core Signing Infrastructure

### 1.1 Add `signature` to ToolApprovalRequest type

**File**: `packages/core/provider-utils/src/types/tool-approval-request.ts`
- Add optional `signature?: string` field to `ToolApprovalRequest`
- This allows the signature to travel with the approval request through all layers

### 1.2 Add `experimental_toolApprovalSecret` to CallSettings

**File**: `packages/core/ai-toolkit/src/prompt/call-settings.ts`
- Add `experimental_toolApprovalSecret?: string | Uint8Array` to `CallSettings`
- This makes the secret available to `generateText`, `streamText`, `generateObject`, `streamObject`

### 1.3 Expose `toolApprovalSecret` in generateText

**File**: `packages/core/ai-toolkit/src/generate-text/generate-text.ts`
- Add `experimental_toolApprovalSecret` to the function options type
- Pass `toolApprovalSecret` through to approval validation flow
- When re-validating from client-supplied message history, pass secret to `validateApprovedToolApprovals`

### 1.4 Expose `toolApprovalSecret` in streamText

**File**: `packages/core/ai-toolkit/src/generate-text/stream-text.ts`
- Add `experimental_toolApprovalSecret` to the constructor options and public API
- Pass through to `executeToolsFromStream` for signing approvals during streaming
- Ensure signature is included in `tool-approval-request` stream parts

### 1.5 Wire secret through validateApprovedToolApprovals

**File**: `packages/core/ai-toolkit/src/generate-text/validate-tool-approvals.ts`
- Already accepts `toolApprovalSecret` - verify it's wired from generateText/streamText
- Ensure missing signature throws `InvalidToolApprovalSignatureError` when secret configured
- Ensure tampered input/IDs throw `InvalidToolApprovalSignatureError`

### 1.6 Wire secret through executeToolsFromStream

**File**: `packages/core/ai-toolkit/src/generate-text/execute-tools-from-stream.ts`
- Already accepts `toolApprovalSecret` - verify it's called from streamText with the secret
- Signing happens at `maybeSignApproval` call site (line 144)
- Ensure signature is included in all `tool-approval-request` stream parts (lines 161, 173, 193)

## Phase 2: ToolLoopAgent Integration

### 2.1 Add `experimental_toolApprovalSecret` to ToolLoopAgentSettings

**File**: `packages/core/ai-toolkit/src/agent/tool-loop-agent-settings.ts`
- Add `experimental_toolApprovalSecret?: string | Uint8Array` to settings type
- Include in `prepareCall` parameter type (so it can be overridden per-call)
- Include in the return type of `prepareCall` (so it flows to generateText/streamText)

### 2.2 Pass secret through ToolLoopAgent.generate() and .stream()

**File**: `packages/core/ai-toolkit/src/agent/tool-loop-agent.ts`
- In `generate()`: pass `experimental_toolApprovalSecret` from settings to `generateText` options
- In `stream()`: pass `experimental_toolApprovalSecret` from settings to `streamText` options

### 2.3 Environment-variable reference resolution

**File**: `packages/core/ai-toolkit/src/agent/tool-loop-agent.ts` (or new utility)
- If `experimental_toolApprovalSecret` starts with `env:`, resolve it via `process.env`
- Pattern: `env:TOOL_APPROVAL_SECRET` → `process.env.TOOL_APPROVAL_SECRET`
- This keeps the raw secret out of source code and serialized state
- Add helper: `resolveToolApprovalSecret(value?: string): string | undefined`

## Phase 3: Stream Transformation Preservation

### 3.1 Ensure signatures survive stream transforms

**File**: `packages/core/ai-toolkit/src/generate-text/run-tools-transformation.ts`
- Verify `tool-approval-request` parts with `signature` are forwarded unchanged by all default transforms
- Document that custom transforms must preserve `signature` on `tool-approval-request` parts

### 3.2 UI stream transformation preservation

**File**: `packages/core/ai-toolkit/src/ui-message-stream/` (and adapter streams)
- Ensure `tool-approval-request` parts with `signature` survive UI stream transformations
- Verify consumers can access signature for verification on re-request

## Phase 4: Never Serialize Raw Secret

### 4.1 Verify secret is excluded from serialization paths

**File**: `packages/core/ai-toolkit/src/agent/tool-loop-agent-settings.ts`
- Verify `experimental_toolApprovalSecret` is NOT in any serialization return type
- `prepareCall` return type must exclude or strip the secret
- `isJSONSerializable` correctly rejects `string | Uint8Array` (non-plain objects and functions)

### 4.2 Type-level documentation

**File**: `packages/core/ai-toolkit/src/agent/tool-loop-agent-settings.ts`
- Mark field with JSDoc noting it is not serialized
- Ensure field is not in any public-facing serializable interface

## Phase 5: Testing

### 5.1 Runtime tests

**Extend**: `packages/core/ai-toolkit/src/generate-text/tool-approval-signature.test.ts`
- Test signed issuance: `signToolApproval` produces valid signature
- Test valid replay: `verifyToolApprovalSignature` accepts valid signature
- Test missing signature fails when secret configured
- Test tampered input/approvalId/toolCallId/toolName fails verification
- Test unsigned compatibility when no secret configured

**Extend**: `packages/core/ai-toolkit/src/generate-text/validate-tool-approvals.test.ts`
- Test valid signature passes validation
- Test missing signature throws when secret configured
- Test tampered signature throws
- Test unsigned compatibility (no secret → ignore signature)

**Extend**: `packages/core/ai-toolkit/src/generate-text/execute-tools-from-stream.test.ts`
- Test `toolApprovalSecret` produces signatures in stream parts
- Test signatures preserved through stream transformations

**New**: `packages/core/ai-toolkit/src/agent/tool-loop-agent.test.ts`
- Test `ToolLoopAgent` constructor accepts `experimental_toolApprovalSecret`
- Test secret passed through generate() and stream() to underlying API
- Test `env:` prefix resolves to environment variable

### 5.2 Type tests

**New**: `packages/core/ai-toolkit/src/agent/tool-loop-agent.test-d.ts`
- Type-check `experimental_toolApprovalSecret` accepted in `ToolLoopAgentSettings`
- Type-check `prepareCall` preserves the option

**Extend**: `packages/core/ai-toolkit/src/generate-text/generate-text.test-d.ts`
- Type-check `experimental_toolApprovalSecret` accepted in `generateText` options

### 5.3 End-to-end validation

**New example**: `examples/01-foundations/ai-functions/src/stream-text/tool-approval-signed-agent.ts`
- Deterministic signed-approval example using `ToolLoopAgent` with `experimental_toolApprovalSecret`
- Agent calls tool → approval signed → client approves → signature validated on execution

## Phase 6: Documentation

### 6.1 Tool approval guide

**File**: `content/docs/03-ai-toolkit-core/15-tools-and-tool-calling.mdx` (or equivalent)
- Add section on `experimental_toolApprovalSecret` configuration
- Document constructor-level (ToolLoopAgent) and stream-level (generateText/streamText) configuration
- Document `env:` prefix for environment variable reference

### 6.2 Agent guide

**File**: `content/docs/03-agents/02-building-agents.mdx` (or equivalent)
- Add section on durable step approval security
- Document how signatures bind to approval and tool-call details
- Document that raw secret is never serialized

### 6.3 API reference

**File**: `content/docs/07-reference/` (appropriate files)
- Document `ToolLoopAgentSettings.experimental_toolApprovalSecret`
- Document `CallSettings.experimental_toolApprovalSecret`
- Document `ToolApprovalRequest.signature`
- Document signature precedence and key availability
- Document key rotation guidance (change secret → old signatures invalid)

## File Change Summary

| File | Change | Phase |
|------|--------|-------|
| `packages/core/provider-utils/src/types/tool-approval-request.ts` | Add `signature?: string` | 1.1 |
| `packages/core/ai-toolkit/src/prompt/call-settings.ts` | Add `experimental_toolApprovalSecret?: string \| Uint8Array` | 1.2 |
| `packages/core/ai-toolkit/src/generate-text/generate-text.ts` | Add option, wire to validation | 1.3 |
| `packages/core/ai-toolkit/src/generate-text/stream-text.ts` | Add option, wire to stream signing | 1.4 |
| `packages/core/ai-toolkit/src/generate-text/validate-tool-approvals.ts` | Verify wired from public API | 1.5 |
| `packages/core/ai-toolkit/src/generate-text/execute-tools-from-stream.ts` | Verify wired from streamText | 1.6 |
| `packages/core/ai-toolkit/src/agent/tool-loop-agent-settings.ts` | Add secret to settings + prepareCall | 2.1 |
| `packages/core/ai-toolkit/src/agent/tool-loop-agent.ts` | Pass secret to generateText/streamText, add env resolution | 2.2, 2.3 |
| `packages/core/ai-toolkit/src/generate-text/run-tools-transformation.ts` | Verify signature preservation | 3.1 |
| `packages/core/ai-toolkit/src/agent/tool-loop-agent.test.ts` | Add agent-level tests | 5.1 |
| `packages/core/ai-toolkit/src/agent/tool-loop-agent.test-d.ts` | Add type tests | 5.2 |
| `examples/01-foundations/ai-functions/src/stream-text/tool-approval-signed-agent.ts` | E2E example | 5.3 |
| `content/docs/...` | Documentation updates | 6 |

## Precedence Rules

When multiple sources of `toolApprovalSecret` exist, precedence is:

1. **Stream-level** (passed to `streamText`/`generateText` call directly) — highest
2. **Agent-level** (set on `ToolLoopAgent` constructor) — medium
3. **Environment variable** (via `env:VAR_NAME` reference) — resolved at call time

## Security Considerations

- The raw secret is **never** serialized (Uint8Array is not JSON-serializable; `env:` references are resolved at runtime)
- Signatures bind to: `approvalId`, `toolCallId`, `toolName`, and `input` digest — any tampering invalidates the signature
- Secret rotation: changing the secret invalidates all previously signed approvals (by design — old approvals should be re-requested)
- The secret is used for HMAC-SHA256 signing/verification only; it is never transmitted or logged
