export type RuntimeTarget =
  | 'browser'
  | 'node'
  | 'edge'
  | 'serverless'
  | 'workers'
  | 'mobile'
  | 'electron'
  | 'tauri';

export interface RuntimeCapabilities {
  readonly target: RuntimeTarget;
  readonly fetch: boolean;
  readonly streams: boolean;
  readonly abortSignal: boolean;
  readonly crypto: boolean;
  readonly timers: boolean;
  readonly encoding: boolean;
  readonly binaryData: boolean;
}

export type RuntimeCapabilityName = Exclude<
  keyof RuntimeCapabilities,
  'target'
>;

export interface RuntimeContext {
  readonly fetch: typeof globalThis.fetch;
  readonly crypto?: Crypto;
  readonly setTimeout: typeof globalThis.setTimeout;
  readonly clearTimeout: typeof globalThis.clearTimeout;
  readonly supports: RuntimeCapabilities;
}

export interface RuntimeAdapter {
  readonly target: RuntimeTarget;
  readonly capabilities: RuntimeCapabilities;
  createContext(overrides?: Partial<RuntimeContext>): RuntimeContext;
}

export class RuntimeCapabilityError extends Error {
  readonly code = 'RUNTIME_CAPABILITY_UNSUPPORTED';
  readonly target: RuntimeTarget;
  readonly capability: RuntimeCapabilityName;

  constructor(target: RuntimeTarget, capability: RuntimeCapabilityName) {
    super(
      `Runtime \"${target}\" does not support capability \"${capability}\".`,
    );
    this.name = 'RuntimeCapabilityError';
    this.target = target;
    this.capability = capability;
  }
}

export function assertRuntimeCapability(
  runtime: RuntimeCapabilities,
  capability: RuntimeCapabilityName,
): void {
  if (!runtime[capability]) {
    throw new RuntimeCapabilityError(runtime.target, capability);
  }
}

export function createRuntimeContext(
  target: RuntimeTarget,
  overrides: Partial<RuntimeContext> = {},
): RuntimeContext {
  const capabilities: RuntimeCapabilities = {
    target,
    fetch: overrides.fetch
      ? typeof overrides.fetch === 'function'
      : typeof globalThis.fetch === 'function',
    streams: typeof globalThis.ReadableStream === 'function',
    abortSignal: typeof globalThis.AbortSignal === 'function',
    crypto: typeof globalThis.crypto !== 'undefined',
    timers: typeof globalThis.setTimeout === 'function',
    encoding: typeof globalThis.TextEncoder === 'function',
    binaryData: typeof globalThis.ArrayBuffer === 'function',
  };

  const fetch = overrides.fetch ?? globalThis.fetch;
  const boundFetch =
    typeof fetch === 'function'
      ? fetch.bind(globalThis)
      : () => {
          throw new Error('Runtime does not provide fetch.');
        };

  return {
    fetch: boundFetch,
    crypto: overrides.crypto ?? globalThis.crypto,
    setTimeout: overrides.setTimeout ?? globalThis.setTimeout,
    clearTimeout: overrides.clearTimeout ?? globalThis.clearTimeout,
    supports: overrides.supports ?? capabilities,
  };
}
