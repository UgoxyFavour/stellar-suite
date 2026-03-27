import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { snapshotManager } from '../snapshotManager';

describe('SnapshotManager', () => {
  const testPath = 'test/example.test.ts';
  const testName = 'test snapshot';

  beforeEach(async () => {
    // Clear all snapshots before each test
    await snapshotManager.clearAllSnapshots();
    snapshotManager.setUpdateMode(false);
  });

  afterEach(async () => {
    // Clean up after tests
    await snapshotManager.clearAllSnapshots();
  });

  describe('saveSnapshot and getSnapshot', () => {
    it('should save and retrieve a snapshot', async () => {
      const data = { foo: 'bar', count: 42 };
      
      await snapshotManager.saveSnapshot(testPath, testName, data);
      const snapshot = await snapshotManager.getSnapshot(testPath, testName);

      expect(snapshot).not.toBeNull();
      expect(snapshot?.data).toEqual(data);
      expect(snapshot?.metadata.testName).toBe(testName);
      expect(snapshot?.metadata.testPath).toBe(testPath);
    });

    it('should update existing snapshot', async () => {
      const data1 = { version: 1 };
      const data2 = { version: 2 };

      await snapshotManager.saveSnapshot(testPath, testName, data1);
      const snapshot1 = await snapshotManager.getSnapshot(testPath, testName);
      const createdAt = snapshot1?.metadata.createdAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      await snapshotManager.saveSnapshot(testPath, testName, data2);
      const snapshot2 = await snapshotManager.getSnapshot(testPath, testName);

      expect(snapshot2?.data).toEqual(data2);
      expect(snapshot2?.metadata.createdAt).toBe(createdAt);
      expect(snapshot2?.metadata.updatedAt).not.toBe(createdAt);
    });
  });

  describe('deleteSnapshot', () => {
    it('should delete a snapshot', async () => {
      const data = { test: 'data' };
      
      await snapshotManager.saveSnapshot(testPath, testName, data);
      let snapshot = await snapshotManager.getSnapshot(testPath, testName);
      expect(snapshot).not.toBeNull();

      await snapshotManager.deleteSnapshot(testPath, testName);
      snapshot = await snapshotManager.getSnapshot(testPath, testName);
      expect(snapshot).toBeNull();
    });
  });

  describe('getAllSnapshots', () => {
    it('should return all snapshots', async () => {
      await snapshotManager.saveSnapshot('path1', 'test1', { a: 1 });
      await snapshotManager.saveSnapshot('path2', 'test2', { b: 2 });
      await snapshotManager.saveSnapshot('path3', 'test3', { c: 3 });

      const snapshots = await snapshotManager.getAllSnapshots();
      expect(snapshots).toHaveLength(3);
    });

    it('should return empty array when no snapshots exist', async () => {
      const snapshots = await snapshotManager.getAllSnapshots();
      expect(snapshots).toHaveLength(0);
    });
  });

  describe('matchSnapshot', () => {
    it('should match identical data', async () => {
      const data = { foo: 'bar', nested: { value: 42 } };
      
      await snapshotManager.saveSnapshot(testPath, testName, data);
      const result = await snapshotManager.matchSnapshot(testPath, testName, data);

      expect(result.matches).toBe(true);
      expect(result.diffs).toBeUndefined();
    });

    it('should detect modified values', async () => {
      const oldData = { count: 10 };
      const newData = { count: 20 };

      await snapshotManager.saveSnapshot(testPath, testName, oldData);
      const result = await snapshotManager.matchSnapshot(testPath, testName, newData);

      expect(result.matches).toBe(false);
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs?.[0].type).toBe('modified');
      expect(result.diffs?.[0].path).toBe('count');
    });

    it('should detect added properties', async () => {
      const oldData = { a: 1 };
      const newData = { a: 1, b: 2 };

      await snapshotManager.saveSnapshot(testPath, testName, oldData);
      const result = await snapshotManager.matchSnapshot(testPath, testName, newData);

      expect(result.matches).toBe(false);
      expect(result.diffs?.some(d => d.type === 'added' && d.path === 'b')).toBe(true);
    });

    it('should detect removed properties', async () => {
      const oldData = { a: 1, b: 2 };
      const newData = { a: 1 };

      await snapshotManager.saveSnapshot(testPath, testName, oldData);
      const result = await snapshotManager.matchSnapshot(testPath, testName, newData);

      expect(result.matches).toBe(false);
      expect(result.diffs?.some(d => d.type === 'removed' && d.path === 'b')).toBe(true);
    });

    it('should handle array differences', async () => {
      const oldData = [1, 2, 3];
      const newData = [1, 2, 3, 4];

      await snapshotManager.saveSnapshot(testPath, testName, oldData);
      const result = await snapshotManager.matchSnapshot(testPath, testName, newData);

      expect(result.matches).toBe(false);
      expect(result.diffs?.some(d => d.type === 'added' && d.path === '[3]')).toBe(true);
    });

    it('should handle nested object differences', async () => {
      const oldData = { user: { name: 'Alice', age: 30 } };
      const newData = { user: { name: 'Alice', age: 31 } };

      await snapshotManager.saveSnapshot(testPath, testName, oldData);
      const result = await snapshotManager.matchSnapshot(testPath, testName, newData);

      expect(result.matches).toBe(false);
      expect(result.diffs?.[0].path).toBe('user.age');
    });

    it('should create snapshot on first run', async () => {
      const data = { first: 'run' };
      
      const result = await snapshotManager.matchSnapshot(testPath, testName, data);
      
      expect(result.matches).toBe(true);
      const snapshot = await snapshotManager.getSnapshot(testPath, testName);
      expect(snapshot?.data).toEqual(data);
    });

    it('should update snapshot when update mode is enabled', async () => {
      const oldData = { version: 1 };
      const newData = { version: 2 };

      await snapshotManager.saveSnapshot(testPath, testName, oldData);
      snapshotManager.setUpdateMode(true);

      const result = await snapshotManager.matchSnapshot(testPath, testName, newData);
      
      expect(result.matches).toBe(true);
      const snapshot = await snapshotManager.getSnapshot(testPath, testName);
      expect(snapshot?.data).toEqual(newData);
    });
  });

  describe('serializeSnapshot', () => {
    it('should serialize data as pretty-printed JSON', () => {
      const data = { foo: 'bar', nested: { value: 42 } };
      const serialized = snapshotManager.serializeSnapshot(data);

      expect(serialized).toContain('\n');
      expect(serialized).toContain('  ');
      expect(JSON.parse(serialized)).toEqual(data);
    });
  });

  describe('update mode', () => {
    it('should toggle update mode', () => {
      expect(snapshotManager.getUpdateMode()).toBe(false);
      
      snapshotManager.setUpdateMode(true);
      expect(snapshotManager.getUpdateMode()).toBe(true);
      
      snapshotManager.setUpdateMode(false);
      expect(snapshotManager.getUpdateMode()).toBe(false);
    });
  });
});
