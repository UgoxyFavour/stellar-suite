/**
 * useDeployedContractsStore.ts
 *
 * Zustand slice that tracks every successfully deployed contract.
 * Each entry carries the contract ID, the network it was deployed on,
 * a human-readable name (derived from the WASM/file name), and a
 * deployment timestamp — all persisted to IndexedDB so entries survive
 * page refreshes.
 *
 * Usage:
 *   const { addContract, deployedContracts } = useDeployedContractsStore();
 *   addContract("CDLZ...X7YQ", "testnet", "hello_world");
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { NetworkKey } from "@/lib/networkConfig";
import { idbStorage } from "@/utils/idbStorage";

export interface DeployedContract {
  /** The on-chain contract ID returned by the deployment RPC call. */
  id: string;
  /** The Stellar network this contract was deployed to. */
  network: NetworkKey;
  /** A human-readable label (WASM file name or user-supplied tag). */
  name: string;
  /** ISO 8601 timestamp recorded at the moment of successful deployment. */
  deployedAt: string;
}

interface DeployedContractsStore {
  /** Ordered list of all saved contract deployments (newest last). */
  deployedContracts: DeployedContract[];

  /**
   * Append a new deployment record.
   * @param id      - The deployed contract ID string.
   * @param network - The network key the contract was deployed to.
   * @param name    - A label for the contract (WASM name or user tag).
   */
  addContract: (id: string, network: NetworkKey, name: string) => void;

  /** Remove a deployment record by its contract ID. */
  removeContract: (id: string) => void;
}

const SAMPLE_DEPLOYMENTS: DeployedContract[] = [
  {
    id: "CDLZ6X7YQ...HB7Q",
    network: "testnet",
    name: "hello_world",
    deployedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "CCAAX...Q9RX",
    network: "futurenet",
    name: "soroban_auth",
    deployedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
  {
    id: "CCBBX...L0PZ",
    network: "local",
    name: "native_token_wrap",
    deployedAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
  }
];

export const useDeployedContractsStore = create<DeployedContractsStore>()(
  persist(
    (set) => ({
      deployedContracts: SAMPLE_DEPLOYMENTS,

      addContract: (id, network, name) =>
        set((state) => ({
          deployedContracts: [
            ...state.deployedContracts,
            { id, network, name, deployedAt: new Date().toISOString() },
          ],
        })),

      removeContract: (id) =>
        set((state) => ({
          deployedContracts: state.deployedContracts.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "stellar-suite:deployed-contracts",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
