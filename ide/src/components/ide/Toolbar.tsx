import { Network, Settings, TestTube, Upload, Menu, X, Play } from "lucide-react";
import { useState } from "react";

import { BuildButton } from "@/components/ide/BuildButton";
import { Button } from "@/components/ui/button";
import { type NetworkKey } from "@/lib/networkConfig";

type BuildState = "idle" | "building" | "success" | "error";

interface ToolbarProps {
  onCompile: () => void;
  onDeploy: () => void;
  onTest: () => void;
  isCompiling: boolean;
  buildState: BuildState;
  network: NetworkKey;
  onNetworkChange: (network: NetworkKey) => void;
  saveStatus?: string;
}

export function Toolbar({
  onCompile,
  onDeploy,
  onTest,
  isCompiling,
  buildState,
  network,
  onNetworkChange,
  saveStatus,
}: ToolbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-toolbar-bg border-b border-border">
      <div className="hidden md:flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="mr-2 text-sm font-semibold font-mono text-primary">
            Kit CANVAS
          </span>
          <BuildButton
            onClick={onCompile}
            isBuilding={isCompiling}
            state={isCompiling ? "building" : buildState}
          />
          <Button
            onClick={onDeploy}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-8"
          >
            <Upload className="h-3.5 w-3.5" />
            Deploy
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onTest}
            className="gap-1.5 text-xs h-8"
          >
            <TestTube className="h-3.5 w-3.5" />
            Test
          </Button>
          {saveStatus && (
            <span className="ml-2 animate-in fade-in font-mono text-[10px] text-muted-foreground">
              {saveStatus}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Network className="h-3.5 w-3.5" />
            <select
              value={network}
              onChange={(e) => onNetworkChange(e.target.value as NetworkKey)}
              className="rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="testnet">Testnet</option>
              <option value="futurenet">Futurenet</option>
              <option value="mainnet">Mainnet</option>
              <option value="local">Local</option>
            </select>
          </div>
          <button className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 py-1.5 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold font-mono text-primary">
            Kit CANVAS
          </span>
          <BuildButton
            onClick={onCompile}
            isBuilding={isCompiling}
            state={isCompiling ? "building" : buildState}
            compact
          />
        </div>
        <div className="flex items-center gap-1">
          {saveStatus && (
            <span className="font-mono text-[9px] text-muted-foreground">
              {saveStatus}
            </span>
          )}
          <select
            value={network}
            onChange={(e) => onNetworkChange(e.target.value as NetworkKey)}
            className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-foreground focus:outline-none"
          >
            <option value="testnet">Testnet</option>
            <option value="futurenet">Futurenet</option>
            <option value="mainnet">Mainnet</option>
            <option value="local">Local</option>
          </select>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden flex gap-2 px-2 pb-2 border-b border-border">
          <Button
            onClick={() => {
              onCompile();
              setMobileMenuOpen(false);
            }}
            disabled={isCompiling}
            className="flex-1 gap-1 text-[11px] h-9"
          >
            <Play className="h-3 w-3" />
            {isCompiling ? "..." : "Build"}
          </Button>
          <Button
            onClick={() => {
              onDeploy();
              setMobileMenuOpen(false);
            }}
            variant="outline"
            className="flex-1 gap-1 text-[11px] h-9"
          >
            <Upload className="h-3 w-3" />
            Deploy
          </Button>
          <Button
            type="button"
            onClick={() => {
              onTest();
              setMobileMenuOpen(false);
            }}
            variant="outline"
            className="flex-1 gap-1 text-[11px] h-9"
          >
            <TestTube className="h-3 w-3" />
            Test
          </Button>
        </div>
      )}
    </div>
  );
}
