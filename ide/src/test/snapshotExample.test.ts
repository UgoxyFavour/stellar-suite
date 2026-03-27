import { describe, it, expect, beforeAll } from 'vitest';
import { snapshotManager } from '@/lib/testing/snapshotManager';

describe('Snapshot Testing Example', () => {
  beforeAll(() => {
    // Ensure we're not in update mode for these tests
    snapshotManager.setUpdateMode(false);
  });

  it('should match a simple object snapshot', async () => {
    const data = {
      name: 'Test Contract',
      version: '1.0.0',
      functions: ['initialize', 'transfer', 'balance'],
    };

    await expect(data).toMatchSnapshot();
  });

  it('should match a complex contract state snapshot', async () => {
    const contractState = {
      ledger: {
        sequence: 12345,
        timestamp: 1234567890,
        protocolVersion: 20,
      },
      storage: {
        entries: [
          { key: 'COUNTER', value: 42 },
          { key: 'OWNER', value: 'GABC...XYZ' },
        ],
      },
      events: [
        {
          type: 'contract',
          topics: ['transfer'],
          data: { from: 'GABC...', to: 'GDEF...', amount: '1000' },
        },
      ],
      resources: {
        instructions: 1500000,
        readBytes: 2048,
        writeBytes: 1024,
      },
    };

    await expect(contractState).toMatchSnapshot();
  });

  it('should match an array snapshot', async () => {
    const transactions = [
      { id: 1, type: 'deploy', status: 'success' },
      { id: 2, type: 'invoke', status: 'success' },
      { id: 3, type: 'invoke', status: 'failed' },
    ];

    await expect(transactions).toMatchSnapshot();
  });

  it('should match a simulation result snapshot', async () => {
    const simulationResult = {
      success: true,
      result: {
        auth: [],
        retval: { type: 'u64', value: '100' },
      },
      cost: {
        cpuInsns: '1234567',
        memBytes: '4096',
      },
      latestLedger: 54321,
      events: [],
    };

    await expect(simulationResult).toMatchSnapshot();
  });
});
