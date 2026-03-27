# Snapshot Testing - Integration Guide

## Quick Start

### 1. Install Dependencies

Dependencies are already added to `package.json`:
```bash
npm install
```

### 2. Write Your First Snapshot Test

```typescript
import { describe, it, expect } from 'vitest';

describe('My Contract Tests', () => {
  it('should match contract deployment result', async () => {
    const result = await deployContract();
    await expect(result).toMatchSnapshot();
  });
});
```

### 3. Run Tests

```bash
npm test
```

On first run, the snapshot is created. On subsequent runs, the test compares against the saved snapshot.

## Integration with IDE

### Add Test Explorer to Sidebar

```tsx
// In your IDE layout component (e.g., src/features/ide/Index.tsx)
import { TestExplorer } from '@/components/ide/TestExplorer';

// Add to your sidebar tabs
<Tabs>
  <TabsList>
    <TabsTrigger value="files">Files</TabsTrigger>
    <TabsTrigger value="tests">Tests</TabsTrigger>
  </TabsList>
  
  <TabsContent value="files">
    <FileExplorer />
  </TabsContent>
  
  <TabsContent value="tests">
    <TestExplorer />
  </TabsContent>
</Tabs>
```

### Add Snapshot Viewer

```tsx
// Add as a separate panel or modal
import { SnapshotViewer } from '@/components/ide/SnapshotViewer';

<Dialog>
  <DialogTrigger>View Snapshots</DialogTrigger>
  <DialogContent className="max-w-6xl">
    <SnapshotViewer />
  </DialogContent>
</Dialog>
```

### Handle Snapshot Mismatches

```tsx
import { SnapshotDiffViewer } from '@/components/ide/SnapshotDiffViewer';
import { useState } from 'react';

function TestResultHandler() {
  const [diffViewerOpen, setDiffViewerOpen] = useState(false);
  const [mismatchData, setMismatchData] = useState(null);

  // When a test fails with snapshot mismatch
  const handleTestFailure = (result) => {
    if (result.snapshotMismatch) {
      setMismatchData({
        testPath: result.testPath,
        testName: result.testName,
        diffs: result.diffs,
        oldValue: result.expected,
        newValue: result.actual,
      });
      setDiffViewerOpen(true);
    }
  };

  return (
    <SnapshotDiffViewer
      open={diffViewerOpen}
      onOpenChange={setDiffViewerOpen}
      {...mismatchData}
    />
  );
}
```

## Advanced Usage

### Programmatic Snapshot Management

```typescript
import { snapshotManager } from '@/lib/testing/snapshotManager';

// Enable update mode
snapshotManager.setUpdateMode(true);

// Save a snapshot manually
await snapshotManager.saveSnapshot(
  'test/example.test.ts',
  'my test',
  { data: 'value' }
);

// Get a snapshot
const snapshot = await snapshotManager.getSnapshot(
  'test/example.test.ts',
  'my test'
);

// Compare values
const result = await snapshotManager.matchSnapshot(
  'test/example.test.ts',
  'my test',
  { data: 'new value' }
);

if (!result.matches) {
  console.log('Differences:', result.diffs);
}

// Export as JSON
const json = snapshotManager.serializeSnapshot(snapshot.data);

// Delete a snapshot
await snapshotManager.deleteSnapshot('test/example.test.ts', 'my test');

// Clear all snapshots
await snapshotManager.clearAllSnapshots();
```

### Using the React Hook

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

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  return (
    <div>
      <Switch checked={updateMode} onCheckedChange={setUpdateMode} />
      <Button onClick={() => clearAllSnapshots()}>Clear All</Button>
      
      {snapshots.map(snapshot => (
        <div key={`${snapshot.metadata.testPath}::${snapshot.metadata.testName}`}>
          <p>{snapshot.metadata.testName}</p>
          <Button onClick={() => {
            const json = exportSnapshot(snapshot);
            // Download or display json
          }}>
            Export
          </Button>
        </div>
      ))}
    </div>
  );
}
```

## Test Runner Integration

### Vitest Integration

The custom matcher is automatically registered in `src/test/setup.ts`:

```typescript
import { expect } from "vitest";
import { toMatchSnapshot } from "@/lib/testing/snapshotManager";

expect.extend({
  toMatchSnapshot,
});
```

### Running Tests with Update Mode

```bash
# Run tests normally
npm test

# To update snapshots, toggle the switch in Test Explorer UI
# Or programmatically:
```

```typescript
import { snapshotManager } from '@/lib/testing/snapshotManager';

beforeAll(() => {
  snapshotManager.setUpdateMode(true);
});

afterAll(() => {
  snapshotManager.setUpdateMode(false);
});
```

## Common Patterns

### Contract Deployment Snapshots

```typescript
it('should deploy contract with correct configuration', async () => {
  const result = await deployContract({
    wasmPath: './contract.wasm',
    network: 'testnet',
  });

  // Snapshot the entire deployment result
  await expect(result).toMatchSnapshot();
});
```

### Contract Invocation Snapshots

```typescript
it('should invoke contract and return expected state', async () => {
  const result = await invokeContract({
    contractId: 'CC...',
    method: 'get_balance',
    args: [{ address: 'GA...' }],
  });

  await expect(result).toMatchSnapshot();
});
```

### Ledger State Snapshots

```typescript
it('should update ledger state correctly', async () => {
  const stateBefore = await getLedgerState();
  await executeTransaction();
  const stateAfter = await getLedgerState();

  await expect({
    before: stateBefore,
    after: stateAfter,
    delta: calculateDelta(stateBefore, stateAfter),
  }).toMatchSnapshot();
});
```

### Error Response Snapshots

```typescript
it('should return correct error for invalid input', async () => {
  try {
    await invokeContract({ method: 'transfer', args: [] });
  } catch (error) {
    await expect(error).toMatchSnapshot();
  }
});
```

## Troubleshooting

### IndexedDB Not Available in Tests

**Problem**: Tests fail with "indexedDB is not defined"

**Solution**: The test setup already includes `fake-indexeddb/auto` import. If you still see this error, ensure your test file imports from the correct setup:

```typescript
// This is already configured in src/test/setup.ts
import 'fake-indexeddb/auto';
```

### Snapshots Not Persisting

**Problem**: Snapshots disappear after page refresh

**Solution**: IndexedDB is persistent by default. If snapshots are not persisting:
1. Check browser console for IndexedDB errors
2. Ensure browser allows IndexedDB storage
3. Check if running in private/incognito mode

### Update Mode Not Working

**Problem**: Snapshots not updating when toggle is enabled

**Solution**: Ensure the toggle state is synced with the snapshot manager:

```typescript
useEffect(() => {
  snapshotManager.setUpdateMode(updateSnapshots);
}, [updateSnapshots]);
```

### Diff Viewer Not Showing

**Problem**: Diff viewer doesn't open on mismatch

**Solution**: Wire up the test failure handler:

```typescript
// When test fails
if (result.snapshotMismatch) {
  setDiffViewerData({
    testPath: result.testPath,
    testName: result.testName,
    diffs: result.diffs,
    oldValue: result.expected,
    newValue: result.actual,
  });
  setDiffViewerOpen(true);
}
```

## Best Practices

### 1. Normalize Non-Deterministic Data

```typescript
it('should match transaction result', async () => {
  const result = await executeTransaction();
  
  // Normalize timestamp before snapshotting
  const normalized = {
    ...result,
    timestamp: '[TIMESTAMP]',
    transactionId: '[TX_ID]',
  };

  await expect(normalized).toMatchSnapshot();
});
```

### 2. Use Descriptive Test Names

```typescript
// Good
it('should return correct balance after transfer', async () => {
  // ...
});

// Bad
it('test 1', async () => {
  // ...
});
```

### 3. Review Diffs Carefully

Always review snapshot diffs before approving updates. Unexpected changes might indicate bugs.

### 4. Commit Important Snapshots

While snapshots are stored in IndexedDB, consider exporting and committing critical snapshots to version control:

```typescript
const snapshot = await snapshotManager.getSnapshot(testPath, testName);
const json = snapshotManager.serializeSnapshot(snapshot.data);
// Save to file system or commit to git
```

### 5. Keep Snapshots Small

For very large objects, consider snapshotting only the relevant parts:

```typescript
it('should match relevant state', async () => {
  const fullState = await getFullState();
  
  // Snapshot only what matters
  await expect({
    balance: fullState.balance,
    owner: fullState.owner,
  }).toMatchSnapshot();
});
```

## API Reference

See `src/lib/testing/README.md` for complete API documentation.

## Support

For issues or questions:
1. Check the main README: `src/lib/testing/README.md`
2. Review test examples in `src/test/snapshot*.test.ts`
3. Check the demo page: `src/pages/SnapshotTestingDemo.tsx`
