import snapshot from '../../../build/platform-registry.json';
import {
  PlatformRegistry,
  type PlatformRegistrySnapshot,
} from '@ai-toolkit/platform';

export const platformRegistry = new PlatformRegistry(
  snapshot as PlatformRegistrySnapshot,
);
