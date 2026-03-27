import "@testing-library/jest-dom";
import { expect, vi } from "vitest";
import { toMatchSnapshot } from "@/lib/testing/snapshotManager";
import 'fake-indexeddb/auto';

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Extend vitest matchers with snapshot testing
expect.extend({
  toMatchSnapshot,
});
