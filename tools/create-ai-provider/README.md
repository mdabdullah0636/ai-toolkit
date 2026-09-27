# create-ai-provider

Scaffold AI TOOLKIT provider packages quickly. Generates a repo-convention-complete package (governance metadata, build/test configs, version file, README, starter source + tests) for one of three archetypes.

## Usage

```bash
node tools/create-ai-provider/src/index.js <provider-name> [options]
# or after linking the workspace:
pnpm create-provider <provider-name> [options]
```

| Option             | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `--archetype, -a`  | `openai-compatible` (default), `harness-acp`, `full-custom` |
| `--models, -m`     | Comma-separated model ids (`openai-compatible`)             |
| `--executable, -e` | Agent command, e.g. `"my-agent --acp"` (`harness-acp`)      |
| `--with-docs`      | Emit docs page stubs (canonical + site mirror + nav)        |
| `--with-example`   | Emit example stub under `examples/04-tools`                 |
| `--no-install`     | Skip `pnpm install` / `update-references`                   |
| `-y, --yes`        | Skip prompts, use defaults                                  |
| `-h, --help`       | Show help                                                   |

Examples:

```bash
node tools/create-ai-provider/src/index.js my-provider
node tools/create-ai-provider/src/index.js my-agent -a harness-acp -e "my-agent --acp"
node tools/create-ai-provider/src/index.js my-provider -y --no-install --with-docs
```

## Archetypes

- **openai-compatible** — provider factory over `@ai-toolkit/openai-compatible` (chat models, env-key auth, import-safe without credentials).
- **harness-acp** — one `createACP({...})` ACP profile for `HarnessAgent` (modeled on the `harness-*` packages).
- **full-custom** — `LanguageModelV3` skeleton with `TODO` `doGenerate`/`doStream` for non-compatible APIs.

## What the tool wires automatically

Root `tsconfig.json` reference, `pnpm install`, `pnpm update-references`. Still manual (printed as next steps): `major` changeset, docs prose, example registration in `examples/registry.json`, then `node tools/scripts/validate-structure.mjs`.

## Tests

```bash
pnpm --filter create-ai-provider test   # node:test golden files (no network)
```
