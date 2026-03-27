import { useState, useEffect, useCallback } from 'react';
import { snapshotManager, type Snapshot, type SnapshotDiff } from '@/lib/testing/snapshotManager';

export interface SnapshotComparison {
  testPath: string;
  testName: string;
  matches: boolean;
  diffs?: SnapshotDiff[];
  oldValue?: unknown;
  newValue?: unknown;
}

export function useSnapshotManager() {
  const [updateMode, setUpdateMode] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync update mode with snapshot manager
  useEffect(() => {
    snapshotManager.setUpdateMode(updateMode);
  }, [updateMode]);

  // Load all snapshots
  const loadSnapshots = useCallback(async () => {
    setIsLoading(true);
    try {
      const allSnapshots = await snapshotManager.getAllSnapshots();
      setSnapshots(allSnapshots);
    } catch (error) {
      console.error('Failed to load snapshots:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a specific snapshot
  const deleteSnapshot = useCallback(async (testPath: string, testName: string) => {
    try {
      await snapshotManager.deleteSnapshot(testPath, testName);
      await loadSnapshots();
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
    }
  }, [loadSnapshots]);

  // Clear all snapshots
  const clearAllSnapshots = useCallback(async () => {
    try {
      await snapshotManager.clearAllSnapshots();
      setSnapshots([]);
    } catch (error) {
      console.error('Failed to clear snapshots:', error);
    }
  }, []);

  // Compare value with snapshot
  const compareSnapshot = useCallback(
    async (testPath: string, testName: string, data: unknown): Promise<SnapshotComparison> => {
      const result = await snapshotManager.matchSnapshot(testPath, testName, data);
      const existingSnapshot = await snapshotManager.getSnapshot(testPath, testName);

      return {
        testPath,
        testName,
        matches: result.matches,
        diffs: result.diffs,
        oldValue: existingSnapshot?.data,
        newValue: data,
      };
    },
    []
  );

  // Export snapshot as JSON file
  const exportSnapshot = useCallback((snapshot: Snapshot): string => {
    return snapshotManager.serializeSnapshot(snapshot.data);
  }, []);

  return {
    updateMode,
    setUpdateMode,
    snapshots,
    isLoading,
    loadSnapshots,
    deleteSnapshot,
    clearAllSnapshots,
    compareSnapshot,
    exportSnapshot,
  };
}
