import { describe, it, expect, beforeAll } from 'vitest';
import { snapshotManager } from '@/lib/testing/snapshotManager';

/**
 * Test demonstrating snapshot mismatch detection
 * This test intentionally creates a mismatch to show the diff functionality
 */
describe('Snapshot Mismatch Detection', () => {
  beforeAll(async () => {
    // Pre-create a snapshot with old data
    await snapshotManager.saveSnapshot(
      'test/mismatch.test.ts',
      'should detect changes',
      {
        version: 1,
        user: {
          name: 'Alice',
          age: 30,
        },
        features: ['feature1', 'feature2'],
      }
    );
    
    // Ensure update mode is off
    snapshotManager.setUpdateMode(false);
  });

  it('should detect changes and provide detailed diffs', async () => {
    // New data with changes
    const newData = {
      version: 2, // Modified
      user: {
        name: 'Alice',
        age: 31, // Modified
        email: 'alice@example.com', // Added
      },
      features: ['feature1', 'feature2', 'feature3'], // Added item
      // Note: some property could be removed too
    };

    const result = await snapshotManager.matchSnapshot(
      'test/mismatch.test.ts',
      'should detect changes',
      newData
    );

    // Verify mismatch is detected
    expect(result.matches).toBe(false);
    expect(result.diffs).toBeDefined();
    expect(result.diffs!.length).toBeGreaterThan(0);

    // Verify specific changes are detected
    const diffPaths = result.diffs!.map(d => d.path);
    expect(diffPaths).toContain('version');
    expect(diffPaths).toContain('user.age');
    expect(diffPaths).toContain('user.email');
    expect(diffPaths).toContain('features[2]');

    // Verify diff types
    const versionDiff = result.diffs!.find(d => d.path === 'version');
    expect(versionDiff?.type).toBe('modified');
    expect(versionDiff?.oldValue).toBe(1);
    expect(versionDiff?.newValue).toBe(2);

    const emailDiff = result.diffs!.find(d => d.path === 'user.email');
    expect(emailDiff?.type).toBe('added');
    expect(emailDiff?.newValue).toBe('alice@example.com');

    // Log the diffs for visual verification
    console.log('\n📸 Snapshot Mismatch Detected:');
    console.log(`Found ${result.diffs!.length} difference(s):\n`);
    result.diffs!.forEach(diff => {
      console.log(`  ${diff.type.toUpperCase()} at ${diff.path}:`);
      if (diff.type !== 'added') {
        console.log(`    Expected: ${JSON.stringify(diff.oldValue)}`);
      }
      if (diff.type !== 'removed') {
        console.log(`    Received: ${JSON.stringify(diff.newValue)}`);
      }
      console.log('');
    });
  });

  it('should allow updating snapshot after review', async () => {
    const newData = {
      version: 2,
      user: {
        name: 'Alice',
        age: 31,
        email: 'alice@example.com',
      },
      features: ['feature1', 'feature2', 'feature3'],
    };

    // Enable update mode
    snapshotManager.setUpdateMode(true);

    // This should now update the snapshot
    const result = await snapshotManager.matchSnapshot(
      'test/mismatch.test.ts',
      'should detect changes',
      newData
    );

    expect(result.matches).toBe(true);

    // Verify the snapshot was updated
    const updatedSnapshot = await snapshotManager.getSnapshot(
      'test/mismatch.test.ts',
      'should detect changes'
    );
    expect(updatedSnapshot?.data).toEqual(newData);

    // Disable update mode
    snapshotManager.setUpdateMode(false);
  });
});
