import 'vitest';
import type { SnapshotDiff } from './snapshotManager';

interface CustomMatchers<R = unknown> {
  toMatchSnapshot(): Promise<R>;
}

declare module 'vitest' {
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
