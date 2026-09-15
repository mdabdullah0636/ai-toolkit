import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
});

global.ResizeObserver =
  global.ResizeObserver ||
  function ResizeObserver() {
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  };

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
