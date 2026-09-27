# Testing Layer

The Testing layer provides internal test utilities and fixtures for testing AI Toolkit packages. These packages are not published to npm.

## Packages

- `@ai-toolkit/test-server` - Internal test server and utilities

## Purpose

- Test fixtures and mocks
- Test server for integration testing
- Testing utilities shared across packages

## Dependencies

Testing may depend on:

- Foundation layer (types, runtime)
- Runtime layer (AI Core)
- Provider layer (for testing provider implementations)

Testing packages are not published and are only used internally.

See `architecture/DEPENDENCY_RULES.md` for complete dependency rules.
