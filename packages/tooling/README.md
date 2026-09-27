# Tooling Layer

The Tooling layer (Layer 6 - Experience/Tooling) provides developer tools for building, testing, and maintaining AI applications.

## Packages

- `@ai-toolkit/codemod` - Codemod tools for automated code transformations
- `@ai-toolkit/devtools` - Developer tools for debugging and inspection

## Capabilities

- Automated code refactoring
- Debugging and inspection tools
- Development utilities

## Dependencies

Tooling may depend on:

- Foundation layer (types, runtime)
- Runtime layer (AI Core)
- Gateway layer (for debugging gateway requests)

Tooling must not depend on:

- Provider internals (use AI Core abstractions)

See `architecture/DEPENDENCY_RULES.md` for complete dependency rules.
