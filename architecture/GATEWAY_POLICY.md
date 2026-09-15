# Gateway Policy Architecture

Documents the architectural model for gateway-based routing, capability resolution, and policy enforcement. The gateway (`@ai-toolkit/gateway`) is the client-side entry point for model routing via the AI Gateway API. This document defines the conceptual models and policies that the gateway layer should implement or delegate.

---

## 1. Normalized Request Model

A normalized request is the canonical representation of a model inference request that the gateway layer accepts before mapping it to a specific provider's API format.

```ts
interface NormalizedRequest {
  // Routing metadata
  readonly requestId: string;          // Correlation ID for tracing
  readonly sessionId?: string;         // User session identifier
  readonly tenantId?: string;          // Tenant for multi-tenant deployments

  // Model selection
  readonly capability: ModelCapability; // Required capability (chat, embedding, etc.)
  readonly modelId?: string;           // Specific model requested (optional)
  readonly provider?: string;          // Preferred provider (optional)

  // Input
  readonly messages?: NormalizedMessage[];  // Chat messages
  readonly prompt?: string | NormalizedMessage[];  // Prompt input
  readonly tools?: NormalizedTool[];   // Available tools
  readonly outputSchema?: object;      // JSON Schema for structured output

  // Execution options
  readonly maxOutputTokens?: number;
  readonly temperature?: number;
  readonly topP?: number;
  readonly reasoningEffort?: 'low' | 'medium' | 'high';
  readonly abortSignal?: AbortSignal;

  // Provider override
  readonly providerOptions?: Record<string, Record<string, unknown>>;
}
```

## 2. Normalized Response Model

The normalized response is what all consumers receive regardless of which provider actually served the request.

```ts
interface NormalizedResponse {
  // Content
  readonly content: NormalizedContent[];
  readonly usage: {
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly totalTokens: number;
    readonly cost?: number;
    readonly currency?: string;
  };
  readonly finishReason: NormalizedFinishReason;

  // Metadata
  readonly modelId: string;            // The model that actually served the request
  readonly provider: string;           // The provider that served the request
  readonly latencyMs: number;
  readonly requestId: string;
  readonly warnings?: string[];
}
```

## 3. Capability Resolution Rules

The gateway resolves which provider to use based on the requested capability:

1. **Explicit model override**: If `modelId` is specified (e.g., `"openai/gpt-4o"`), route to that provider
2. **Capability-based routing**: If only a capability is specified (e.g., `chat`), select from providers that support it
3. **Preference-based selection**: If `provider` is specified, prefer that provider for the capability
4. **Load balancing**: Distribute requests across available providers for the capability
5. **Fallback**: If the selected provider fails, try the next provider in the fallback chain

## 4. Model Resolution Rules

1. **Client-specified model**: `model: "openai/gpt-4o"` → route to OpenAI's gpt-4o
2. **Gateway model alias**: `model: "gateway/gpt-4o"` → route through gateway's model mapping
3. **Capability-only**: `model: undefined, capability: "chat"` → gateway selects the best available chat model
4. **Provider preference**: `model: undefined, provider: "anthropic", capability: "chat"` → gateway selects best Anthropic chat model

## 5. Routing Policy

The gateway supports multiple routing policies:

### Fallback
- Route to the primary provider; on failure, try secondary providers
- Configurable retry count and backoff strategy
- Failures include: network errors, rate limits, authentication errors

### Weighted
- Distribute requests across providers by weight
- Useful for A/B testing or gradual rollout
- Example: 70% OpenAI, 30% Anthropic

### Priority
- Always try higher-priority providers first
- Fall back to lower-priority providers only on failure
- Example: Priority 1 = OpenAI, Priority 2 = Anthropic

### Latency-aware
- Track P95 latency per provider per capability
- Route to the fastest available provider
- Update latency metrics in real-time

### Cost-aware
- Route to the lowest-cost provider that meets the capability requirements
- Use cached cost estimates from `@ai-toolkit/capabilities` pricing descriptors
- Balance cost vs. quality based on a configurable `qualityWeight`

## 6. Auth, Tenant, Quota, Rate-Limit Boundaries

| Concern | Layer | Enforcement point |
|---------|-------|-------------------|
| API key resolution | Gateway client | `getGatewayAuthToken()` — resolves from options or `AI_GATEWAY_API_KEY` env var |
| OIDC token | Gateway client | `getVercelOidcToken()` — fetches Vercel OIDC token |
| Tenant identification | Gateway server | Headers `ai-tenant-id` |
| Quota enforcement | Gateway server | Response 429 with `Retry-After` |
| Rate limiting | Gateway server | Response 429 with `Retry-After` |
| Policy enforcement | Gateway server | Policy engine evaluates rules per request |

The gateway client (`@ai-toolkit/gateway`) handles auth and request formatting. The gateway server (deployed separately) handles quota, rate limiting, and policy enforcement.

## 7. Run/Session Metadata for Tracing and Observability

The gateway client adds observability headers to every request:

| Header | Source | Purpose |
|--------|--------|---------|
| `ai-o11y-deployment-id` | `VERCEL_DEPLOYMENT_ID` env | Identifies the Vercel deployment |
| `ai-o11y-environment` | `VERCEL_ENV` env | `development`, `preview`, `production` |
| `ai-o11y-region` | `VERCEL_REGION` env | The Vercel region serving the request |
| `ai-o11y-request-id` | `getVercelRequestId()` | Unique request ID for tracing |
| `ai-gateway-protocol-version` | Static (`"0.0.1"`) | Protocol version for compatibility |

### Correlation model

```
session ID (user session)
  └─▶ request ID (per inference call, from headers or generated)
      └─▶ provider request ID (from provider response headers)
          └─▶ model ID + provider (which model was actually invoked)
              └─▶ cost + latency (post-execution metrics)
```

## 8. Gateway Layer Placement

`@ai-toolkit/gateway` lives in `packages/core/gateway/` and is classified as **Runtime layer** (alongside `ai-toolkit` and `@ai-toolkit/provider-utils`). This was chosen over a separate Gateway layer because:

1. The gateway is a core SDK dependency — `ai-toolkit` imports `gateway()` for model resolution
2. The gateway depends only on Foundation (`@ai-toolkit/provider`) and Runtime (`@ai-toolkit/provider-utils`), not on higher layers
3. Keeping it in the Runtime layer avoids circular dependencies (ai-toolkit → gateway → ai-toolkit)

The `@ai-toolkit/khulnasoft` package (in `packages/special/`) remains in the **Gateway layer** for official KhulnaSoft platform integration, with a documented exception for its provider dependency.

## 9. Gateway Health and Failover

### Health checks
- The gateway exposes `getAvailableModels()` which returns the current model catalog
- Health status is inferred from metadata fetch success/failure

### Failover policy
| Failure type | Retry? | Fallback provider |
|--------------|--------|-------------------|
| Network error | Yes (exponential backoff) | Next provider in chain |
| Rate limit (429) | Yes (respect Retry-After) | Next provider in chain |
| Auth error (401) | No | Fail immediately |
| Model not found (404) | No | Next provider in chain |
| Server error (5xx) | Yes (exponential backoff) | Next provider in chain |

### Failover chain configuration
```ts
interface FailoverConfig {
  maxRetries: number;           // Default: 3
  retryDelayMs: number;         // Default: 1000
  maxRetryDelayMs: number;      // Default: 10000
  fallbackProviders: string[];  // Ordered list of provider names
  respectRetryAfter: boolean;   // Default: true
}
```
