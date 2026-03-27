import { get, set, del, keys } from 'idb-keyval';

export interface SnapshotMetadata {
  testName: string;
  testPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface Snapshot {
  data: unknown;
  metadata: SnapshotMetadata;
}

export interface SnapshotDiff {
  path: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'added' | 'removed' | 'modified';
}

class SnapshotManager {
  private readonly SNAPSHOT_PREFIX = 'snapshot:';
  private updateMode = false;

  /**
   * Generate a unique key for a snapshot based on test path and name
   */
  private getSnapshotKey(testPath: string, testName: string): string {
    return `${this.SNAPSHOT_PREFIX}${testPath}::${testName}`;
  }

  /**
   * Enable or disable snapshot update mode
   */
  setUpdateMode(enabled: boolean): void {
    this.updateMode = enabled;
  }

  /**
   * Get current update mode status
   */
  getUpdateMode(): boolean {
    return this.updateMode;
  }

  /**
   * Save a snapshot to IndexedDB
   */
  async saveSnapshot(
    testPath: string,
    testName: string,
    data: unknown
  ): Promise<void> {
    const key = this.getSnapshotKey(testPath, testName);
    const now = new Date().toISOString();
    
    const existingSnapshot = await this.getSnapshot(testPath, testName);
    
    const snapshot: Snapshot = {
      data,
      metadata: {
        testName,
        testPath,
        createdAt: existingSnapshot?.metadata.createdAt || now,
        updatedAt: now,
      },
    };

    await set(key, snapshot);
  }

  /**
   * Get a snapshot from IndexedDB
   */
  async getSnapshot(testPath: string, testName: string): Promise<Snapshot | null> {
    const key = this.getSnapshotKey(testPath, testName);
    const snapshot = await get<Snapshot>(key);
    return snapshot || null;
  }

  /**
   * Delete a snapshot from IndexedDB
   */
  async deleteSnapshot(testPath: string, testName: string): Promise<void> {
    const key = this.getSnapshotKey(testPath, testName);
    await del(key);
  }

  /**
   * Get all snapshots
   */
  async getAllSnapshots(): Promise<Snapshot[]> {
    const allKeys = await keys();
    const snapshotKeys = allKeys.filter((key) => 
      typeof key === 'string' && key.startsWith(this.SNAPSHOT_PREFIX)
    );

    const snapshots: Snapshot[] = [];
    for (const key of snapshotKeys) {
      const snapshot = await get<Snapshot>(key);
      if (snapshot) {
        snapshots.push(snapshot);
      }
    }

    return snapshots;
  }

  /**
   * Deep comparison of two values to detect differences
   */
  private deepDiff(
    oldValue: unknown,
    newValue: unknown,
    path = ''
  ): SnapshotDiff[] {
    const diffs: SnapshotDiff[] = [];

    // Handle null/undefined
    if (oldValue === null || oldValue === undefined) {
      if (newValue !== null && newValue !== undefined) {
        diffs.push({ path, oldValue, newValue, type: 'added' });
      }
      return diffs;
    }

    if (newValue === null || newValue === undefined) {
      diffs.push({ path, oldValue, newValue, type: 'removed' });
      return diffs;
    }

    // Handle primitives
    if (typeof oldValue !== 'object' || typeof newValue !== 'object') {
      if (oldValue !== newValue) {
        diffs.push({ path, oldValue, newValue, type: 'modified' });
      }
      return diffs;
    }

    // Handle arrays
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      const maxLength = Math.max(oldValue.length, newValue.length);
      for (let i = 0; i < maxLength; i++) {
        const itemPath = `${path}[${i}]`;
        if (i >= oldValue.length) {
          diffs.push({ path: itemPath, oldValue: undefined, newValue: newValue[i], type: 'added' });
        } else if (i >= newValue.length) {
          diffs.push({ path: itemPath, oldValue: oldValue[i], newValue: undefined, type: 'removed' });
        } else {
          diffs.push(...this.deepDiff(oldValue[i], newValue[i], itemPath));
        }
      }
      return diffs;
    }

    // Handle objects
    const oldKeys = new Set(Object.keys(oldValue as object));
    const newKeys = new Set(Object.keys(newValue as object));
    const allKeys = new Set([...oldKeys, ...newKeys]);

    for (const key of allKeys) {
      const propPath = path ? `${path}.${key}` : key;
      const oldVal = (oldValue as Record<string, unknown>)[key];
      const newVal = (newValue as Record<string, unknown>)[key];

      if (!oldKeys.has(key)) {
        diffs.push({ path: propPath, oldValue: undefined, newValue: newVal, type: 'added' });
      } else if (!newKeys.has(key)) {
        diffs.push({ path: propPath, oldValue: oldVal, newValue: undefined, type: 'removed' });
      } else {
        diffs.push(...this.deepDiff(oldVal, newVal, propPath));
      }
    }

    return diffs;
  }

  /**
   * Match a value against a saved snapshot
   */
  async matchSnapshot(
    testPath: string,
    testName: string,
    data: unknown
  ): Promise<{ matches: boolean; diffs?: SnapshotDiff[] }> {
    const existingSnapshot = await this.getSnapshot(testPath, testName);

    // If no snapshot exists or update mode is enabled, save the new snapshot
    if (!existingSnapshot || this.updateMode) {
      await this.saveSnapshot(testPath, testName, data);
      return { matches: true };
    }

    // Compare with existing snapshot
    const diffs = this.deepDiff(existingSnapshot.data, data);
    
    return {
      matches: diffs.length === 0,
      diffs: diffs.length > 0 ? diffs : undefined,
    };
  }

  /**
   * Export snapshot as pretty-printed JSON string
   */
  serializeSnapshot(data: unknown): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear all snapshots (useful for testing)
   */
  async clearAllSnapshots(): Promise<void> {
    const allKeys = await keys();
    const snapshotKeys = allKeys.filter((key) => 
      typeof key === 'string' && key.startsWith(this.SNAPSHOT_PREFIX)
    );

    for (const key of snapshotKeys) {
      await del(key);
    }
  }
}

// Singleton instance
export const snapshotManager = new SnapshotManager();

/**
 * Vitest custom matcher for snapshot testing
 */
export async function toMatchSnapshot(
  this: { testPath?: string; currentTestName?: string },
  received: unknown
): Promise<{ pass: boolean; message: () => string; actual?: unknown; expected?: unknown; diffs?: SnapshotDiff[] }> {
  const testPath = this.testPath || 'unknown';
  const testName = this.currentTestName || 'unknown';

  const result = await snapshotManager.matchSnapshot(testPath, testName, received);

  if (result.matches) {
    return {
      pass: true,
      message: () => `Expected value not to match snapshot`,
    };
  }

  return {
    pass: false,
    message: () => 
      `Snapshot mismatch for ${testName}\n\n` +
      `Found ${result.diffs?.length || 0} difference(s):\n` +
      result.diffs?.map(d => 
        `  ${d.type.toUpperCase()} at ${d.path}:\n` +
        `    Expected: ${JSON.stringify(d.oldValue)}\n` +
        `    Received: ${JSON.stringify(d.newValue)}`
      ).join('\n'),
    actual: received,
    expected: result.diffs,
    diffs: result.diffs,
  };
}
