# Gateway Layer

The Gateway layer (Layer 3) provides routing, orchestration, and policy enforcement for AI requests across multiple providers and models.

## Packages

- `@ai-toolkit/gateway` - Gateway and routing implementation

## Capabilities

- Request routing across providers
- Load balancing and failover
- Rate limiting and quota management
- Request/response transformation
- Policy enforcement

## Dependencies

Gateway may depend on:

- Foundation layer (types, runtime, provider)
- Runtime layer (AI Core, provider-utils)
- Protocol layer (provider interfaces)

Gateway must not depend on:

- Integration layer (framework-specific code)
- Experience/Tooling layer (UI or tooling)

See `architecture/DEPENDENCY_RULES.md` for complete dependency rules.
