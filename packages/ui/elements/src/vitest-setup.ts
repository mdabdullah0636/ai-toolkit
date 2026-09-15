import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: mockMatchMedia,
  writable: true,
});

Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
});

globalThis.navigator = navigator;

globalThis.IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
};

const mockMediaDevices = {
  addEventListener: vi.fn(),
  enumerateDevices: vi.fn(),
  getUserMedia: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(navigator, 'mediaDevices', {
  configurable: true,
  value: mockMediaDevices,
  writable: true,
});

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  configurable: true,
  value: vi.fn(),
  writable: true,
});
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  configurable: true,
  value: vi.fn().mockReturnValue(false),
  writable: true,
});
Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  configurable: true,
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window.URL, 'createObjectURL', {
  configurable: true,
  value: vi.fn(() => 'blob:mock-url'),
  writable: true,
});
Object.defineProperty(window.URL, 'revokeObjectURL', {
  configurable: true,
  value: vi.fn(),
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
  vi.useRealTimers();
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
