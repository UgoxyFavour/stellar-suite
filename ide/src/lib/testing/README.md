# Snapshot Testing Utility

A comprehensive snapshot testing system for the Stellar IDE that records test outputs and contract states, then asserts against them in future runs.

## Features

- **Automatic Snapshot Management**: Snapshots are stored in IndexedDB within the virtual workspace
- **Visual Diff Viewer**: Interactive UI for reviewing snapshot mismatches with detailed diffs
- **Update Mode Toggle**: Easy toggle in Test Explorer to update all snapshots
- **Human-Readable Format**: Snapshots stored as pretty-printed JSON
- **Deep Comparison**: Intelligent diff algorithm that detects added, removed, and modified values
- **Export Functionality**: Download snapshots as `.snap.json` files

## Usage

### Basic Snapshot Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Contract Tests', () => {
  it('should match contract state snapshot', async () => {
    const contractState = {
      ledger: { sequence: 12345 },
      storage: { entries: [{ key: 'COUNTER', value: 42 }] },
    };

    await expect(contractState).toMatchSnapshot();
  });
});
```

### Update Mode

When you need to update snapshots (e.g., after intentional changes):

1. Open the Test Explorer panel
2. Toggle "Update Snapshots" switch
3. Run your tests
4. All snapshots will be updated automatically

Alternatively, programmatically:

```typescript
import { snapshotManager } from '@/lib/testing/snapshotManager';

// Enable update mode
snapshotManager.setUpdateMode(true);

// Run tests...

// Disable update mode
snapshotManager.setUpdateMode(false);
```

### Viewing Snapshots

Use the Snapshot Viewer component to:
- Browse all stored snapshots
- Preview snapshot contents
- Download snapshots as JSON files
- Delete individual or all snapshots

### Handling Snapshot Mismatches

When a test fails due to a snapshot mismatch, the Snapshot Diff Viewer will show:

1. **Differences Tab**: List of all changes with visual indicators
   - 🟢 Added values
   - 🔴 Removed values
   - 🟡 Modified values

2. **Expected Tab**: The saved snapshot (what was expected)

3. **Received Tab**: The new value (what was received)

You can then:
- **Approve & Update**: Accept the changes and update the snapshot
- **Reject**: Keep the existing snapshot and fail the test

## API Reference

### SnapshotManager

The core snapshot management class.

#### Methods

##### `setUpdateMode(enabled: boolean): void`
Enable or disable snapshot update mode.

##### `getUpdateMode(): boolean`
Get current update mode status.

##### `saveSnapshot(testPath: string, testName: string, data: unknown): Promise<void>`
Save a snapshot to IndexedDB.

##### `getSnapshot(testPath: string, testName: string): Promise<Snapshot | null>`
Retrieve a snapshot from IndexedDB.

##### `deleteSnapshot(testPath: string, testName: string): Promise<void>`
Delete a specific snapshot.

##### `getAllSnapshots(): Promise<Snapshot[]>`
Get all stored snapshots.

##### `matchSnapshot(testPath: string, testName: string, data: unknown): Promise<{ matches: boolean; diffs?: SnapshotDiff[] }>`
Compare a value against a saved snapshot.

##### `serializeSnapshot(data: unknown): string`
Export snapshot as pretty-printed JSON string.

##### `clearAllSnapshots(): Promise<void>`
Delete all snapshots.

### Custom Matcher

#### `toMatchSnapshot()`

Vitest custom matcher for snapshot assertions.

```typescript
await expect(value).toMatchSnapshot();
```

The matcher:
- Automatically saves snapshots on first run
- Compares against saved snapshots on subsequent runs
- Provides detailed diff information on mismatch
- Respects update mode setting

## Components

### TestExplorer

Main test management interface with snapshot toggle.

```tsx
import { TestExplorer } from '@/components/ide/TestExplorer';

<TestExplorer />
```

Features:
- Run all tests button
- Refresh tests button
- Update Snapshots toggle
- Test results list with status indicators

### SnapshotDiffViewer

Interactive diff viewer for snapshot mismatches.

```tsx
import { SnapshotDiffViewer } from '@/components/ide/SnapshotDiffViewer';

<SnapshotDiffViewer
  open={isOpen}
  onOpenChange={setIsOpen}
  testPath="src/test/contract.test.ts"
  testName="should match state"
  diffs={diffs}
  newValue={newValue}
  oldValue={oldValue}
/>
```

### SnapshotViewer

Browse and manage all snapshots.

```tsx
import { SnapshotViewer } from '@/components/ide/SnapshotViewer';

<SnapshotViewer />
```

Features:
- List all snapshots
- Preview snapshot contents
- Download snapshots
- Delete individual or all snapshots

## Hooks

### useSnapshotManager

React hook for snapshot management in components.

```tsx
import { useSnapshotManager } from '@/hooks/useSnapshotManager';

function MyComponent() {
  const {
    updateMode,
    setUpdateMode,
    snapshots,
    isLoading,
    loadSnapshots,
    deleteSnapshot,
    clearAllSnapshots,
    compareSnapshot,
    exportSnapshot,
  } = useSnapshotManager();

  // Use the hook methods...
}
```

## Storage

Snapshots are stored in IndexedDB using the `idb-keyval` library. Each snapshot is stored with:

- **Key**: `snapshot:{testPath}::{testName}`
- **Value**: 
  ```typescript
  {
    data: unknown,           // The actual snapshot data
    metadata: {
      testName: string,      // Test name
      testPath: string,      // Test file path
      createdAt: string,     // ISO timestamp
      updatedAt: string,     // ISO timestamp
    }
  }
  ```

## Best Practices

1. **Use for Complex Objects**: Snapshots are ideal for large return objects or complex ledger changes that are tedious to manually assert.

2. **Review Changes**: Always review snapshot diffs before approving updates to ensure changes are intentional.

3. **Commit Snapshots**: While snapshots are stored in IndexedDB (browser storage), consider exporting and committing important snapshots to version control.

4. **Descriptive Test Names**: Use clear, descriptive test names to make snapshot identification easier.

5. **Avoid Non-Deterministic Data**: Don't snapshot values that change on every run (timestamps, random IDs) unless you normalize them first.

6. **Update Mode Discipline**: Remember to disable update mode after updating snapshots to prevent accidental overwrites.

## Example Use Cases

### Contract State Verification

```typescript
it('should maintain correct state after transfer', async () => {
  const state = await contract.getState();
  await expect(state).toMatchSnapshot();
});
```

### Transaction Simulation Results

```typescript
it('should simulate transaction correctly', async () => {
  const result = await simulateTransaction(tx);
  await expect(result).toMatchSnapshot();
});
```

### ABI Parsing

```typescript
it('should parse contract ABI correctly', async () => {
  const abi = parseContractAbi(wasmBuffer);
  await expect(abi).toMatchSnapshot();
});
```

### Event Emission

```typescript
it('should emit correct events', async () => {
  const events = await contract.getEvents();
  await expect(events).toMatchSnapshot();
});
```

## Troubleshooting

### Snapshots Not Saving

- Ensure IndexedDB is available in your browser
- Check browser console for errors
- Verify test path and name are valid strings

### Diffs Not Showing

- Ensure the diff viewer is properly integrated
- Check that the `diffs` prop is being passed correctly
- Verify the snapshot data is serializable

### Update Mode Not Working

- Confirm `snapshotManager.setUpdateMode(true)` is called before tests
- Check that tests are actually running
- Verify no errors in the console

## Future Enhancements

- [ ] Snapshot compression for large objects
- [ ] Snapshot versioning and history
- [ ] Snapshot sharing between team members
- [ ] Integration with CI/CD pipelines
- [ ] Snapshot migration tools
- [ ] Custom serializers for special data types
