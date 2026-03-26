"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileJson,
  Settings,
} from "lucide-react";
import { FileNode } from "@/lib/sample-contracts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  content?: string;
  language?: string;
}

export interface FileTreeProps {
  /** Root-level nodes to render */
  nodes: FileNode[];
  /** Currently active file path (e.g. ["hello_world", "lib.rs"]) */
  activePath?: string[];
  /** Called when a file node is clicked */
  onFileClick?: (path: string[], node: FileNode) => void;
}

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

function FileIcon({ name, className }: { name: string; className?: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "rs") {
    // Rust logo — inline SVG for accurate branding
    return (
      <svg
        viewBox="0 0 24 24"
        className={className ?? "h-4 w-4 shrink-0"}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.634 11.536l-1.09-.672a13.17 13.17 0 0 0-.028-.29l.938-.8a.37.37 0 0 0-.1-.61l-1.158-.493a12.93 12.93 0 0 0-.086-.282l.762-.91a.37.37 0 0 0-.195-.592l-1.21-.3a12.6 12.6 0 0 0-.143-.265l.567-1.006a.37.37 0 0 0-.284-.554l-1.237-.1a12.4 12.4 0 0 0-.196-.24l.357-1.082a.37.37 0 0 0-.365-.503l-1.24.1a12.2 12.2 0 0 0-.244-.21l.136-1.14a.37.37 0 0 0-.437-.41l-1.215.3a12 12 0 0 0-.285-.174L17.1.97a.37.37 0 0 0-.497-.3l-1.155.494a11.8 11.8 0 0 0-.318-.134L14.9.07a.37.37 0 0 0-.543-.18l-1.06.68a11.6 11.6 0 0 0-.344-.09L12.67.003a.37.37 0 0 0-.573-.053l-.934.852a11.4 11.4 0 0 0-.36-.044L10.56.003a.37.37 0 0 0-.573.053l-.333.757a11.6 11.6 0 0 0-.36.044L8.36.57a.37.37 0 0 0-.543.18l-.23.96a11.8 11.8 0 0 0-.344.09L6.18.97a.37.37 0 0 0-.497.3l-.12 1.01a12 12 0 0 0-.285.174L4.063 2.15a.37.37 0 0 0-.437.41l.136 1.14a12.2 12.2 0 0 0-.244.21l-1.24-.1a.37.37 0 0 0-.365.503l.357 1.082a12.4 12.4 0 0 0-.196.24l-1.237.1a.37.37 0 0 0-.284.554l.567 1.006a12.6 12.6 0 0 0-.143.265l-1.21.3a.37.37 0 0 0-.195.592l.762.91a12.93 12.93 0 0 0-.086.282L.449 9.964a.37.37 0 0 0-.1.61l.938.8a13.17 13.17 0 0 0-.028.29l-1.09.672a.37.37 0 0 0 0 .628l1.09.672c.008.097.018.194.028.29l-.938.8a.37.37 0 0 0 .1.61l1.158.493c.028.095.057.188.086.282l-.762.91a.37.37 0 0 0 .195.592l1.21.3c.046.09.094.178.143.265l-.567 1.006a.37.37 0 0 0 .284.554l1.237.1c.064.082.13.162.196.24l-.357 1.082a.37.37 0 0 0 .365.503l1.24-.1c.08.072.162.142.244.21l-.136 1.14a.37.37 0 0 0 .437.41l1.215-.3c.093.06.189.118.285.174l.12 1.01a.37.37 0 0 0 .497.3l1.063-.73c.113.046.228.09.344.134l.23.96a.37.37 0 0 0 .543.18l1.06-.68c.12.032.24.062.36.09l.333.757a.37.37 0 0 0 .573.053l.934-.852c.12.016.24.03.36.044l.333.757a.37.37 0 0 0 .573-.053l.334-.757c.12-.014.24-.028.36-.044l.934.852a.37.37 0 0 0 .573-.053l.333-.757c.12-.028.24-.058.36-.09l1.06.68a.37.37 0 0 0 .543-.18l.23-.96c.116-.044.231-.088.344-.134l1.063.73a.37.37 0 0 0 .497-.3l.12-1.01c.096-.056.192-.114.285-.174l1.215.3a.37.37 0 0 0 .437-.41l-.136-1.14c.082-.068.164-.138.244-.21l1.24.1a.37.37 0 0 0 .365-.503l-.357-1.082c.066-.078.132-.158.196-.24l1.237-.1a.37.37 0 0 0 .284-.554l-.567-1.006c.049-.087.097-.175.143-.265l1.21-.3a.37.37 0 0 0 .195-.592l-.762-.91c.029-.094.058-.187.086-.282l1.158-.493a.37.37 0 0 0 .1-.61l-.938-.8c.01-.096.02-.193.028-.29l1.09-.672a.37.37 0 0 0 0-.628zM12 17.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-9.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      </svg>
    );
  }

  if (ext === "toml") return <Settings className={className ?? "h-4 w-4 shrink-0 text-green-400"} aria-hidden="true" />;
  if (ext === "json") return <FileJson className={className ?? "h-4 w-4 shrink-0 text-yellow-400"} aria-hidden="true" />;
  if (["ts", "tsx", "js", "jsx"].includes(ext)) return <FileCode className={className ?? "h-4 w-4 shrink-0 text-blue-400"} aria-hidden="true" />;
  if (ext === "md") return <FileText className={className ?? "h-4 w-4 shrink-0 text-muted-foreground"} aria-hidden="true" />;

  return <FileText className={className ?? "h-4 w-4 shrink-0 text-muted-foreground"} aria-hidden="true" />;
}

function fileIconColor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "rs") return "text-orange-400";
  if (ext === "toml") return "text-green-400";
  if (ext === "json") return "text-yellow-400";
  if (["ts", "tsx", "js", "jsx"].includes(ext)) return "text-blue-400";
  return "text-muted-foreground";
}

// ---------------------------------------------------------------------------
// TreeNode — recursive item
// ---------------------------------------------------------------------------

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  path: string[];
  activePath?: string[];
  focusedPath: string | null;
  onFileClick?: (path: string[], node: FileNode) => void;
  onFocus: (key: string) => void;
  registerRef: (key: string, el: HTMLButtonElement | null) => void;
}

function TreeNode({
  node,
  depth,
  path,
  activePath,
  focusedPath,
  onFileClick,
  onFocus,
  registerRef,
}: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const currentPath = [...path, node.name];
  const key = currentPath.join("/");
  const isActive = activePath?.join("/") === key;
  const isFocused = focusedPath === key;

  const indent = depth * 12;

  if (node.type === "folder") {
    return (
      <div role="treeitem" aria-expanded={isOpen} aria-label={node.name}>
        <button
          ref={(el) => registerRef(key, el)}
          data-tree-key={key}
          onClick={() => setIsOpen((o) => !o)}
          onFocus={() => onFocus(key)}
          className={`flex items-center w-full gap-1 px-2 py-1 text-sm hover:bg-sidebar-accent transition-colors outline-none ${
            isFocused ? "ring-1 ring-inset ring-primary/50" : ""
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
          aria-label={`${isOpen ? "Collapse" : "Expand"} folder ${node.name}`}
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          {isOpen ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          )}
          <span className="truncate font-mono text-sidebar-foreground">{node.name}</span>
        </button>

        {isOpen && node.children && (
          <div role="group">
            {node.children.map((child) => (
              <TreeNode
                key={child.name}
                node={child}
                depth={depth + 1}
                path={currentPath}
                activePath={activePath}
                focusedPath={focusedPath}
                onFileClick={onFileClick}
                onFocus={onFocus}
                registerRef={registerRef}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div role="treeitem" aria-selected={isActive} aria-label={node.name}>
      <button
        ref={(el) => registerRef(key, el)}
        data-tree-key={key}
        onClick={() => onFileClick?.(currentPath, node)}
        onFocus={() => onFocus(key)}
        className={`flex items-center w-full gap-1.5 px-2 py-1 text-sm transition-colors outline-none ${
          isActive
            ? "bg-editor-selection text-foreground"
            : "hover:bg-sidebar-accent text-sidebar-foreground"
        } ${isFocused ? "ring-1 ring-inset ring-primary/50" : ""}`}
        style={{ paddingLeft: `${indent + 20}px` }}
        aria-label={`Open file ${node.name}`}
      >
        <FileIcon name={node.name} className={`h-3.5 w-3.5 shrink-0 ${fileIconColor(node.name)}`} />
        <span className="truncate font-mono">{node.name}</span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileTree — root component
// ---------------------------------------------------------------------------

/**
 * FileTree
 *
 * A recursive, keyboard-navigable file explorer tree.
 *
 * - Folders expand/collapse on click or Enter/Space
 * - Arrow Up/Down moves focus between visible nodes
 * - File icons are resolved by extension (.rs ? Rust gear, .toml ? Settings, etc.)
 * - Deeply nested directories indent by 12px per level
 */
export function FileTree({ nodes, activePath, onFileClick }: FileTreeProps) {
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const registerRef = useCallback(
    (key: string, el: HTMLButtonElement | null) => {
      if (el) nodeRefs.current.set(key, el);
      else nodeRefs.current.delete(key);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
      e.preventDefault();

      // Collect all currently visible (rendered) node keys in DOM order
      const allKeys = Array.from(
        nodeRefs.current.keys()
      ).sort((a, b) => {
        const elA = nodeRefs.current.get(a);
        const elB = nodeRefs.current.get(b);
        if (!elA || !elB) return 0;
        const pos = elA.compareDocumentPosition(elB);
        return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });

      const currentIdx = focusedKey ? allKeys.indexOf(focusedKey) : -1;

      let nextIdx = currentIdx;
      if (e.key === "ArrowDown") nextIdx = Math.min(currentIdx + 1, allKeys.length - 1);
      if (e.key === "ArrowUp") nextIdx = Math.max(currentIdx - 1, 0);
      if (e.key === "Home") nextIdx = 0;
      if (e.key === "End") nextIdx = allKeys.length - 1;

      if (nextIdx !== currentIdx && allKeys[nextIdx]) {
        const nextKey = allKeys[nextIdx];
        setFocusedKey(nextKey);
        nodeRefs.current.get(nextKey)?.focus();
      }
    },
    [focusedKey]
  );

  return (
    <div
      role="tree"
      aria-label="File explorer"
      className="h-full overflow-y-auto py-1 focus:outline-none"
      onKeyDown={handleKeyDown}
    >
      {nodes.map((node) => (
        <TreeNode
          key={node.name}
          node={node}
          depth={0}
          path={[]}
          activePath={activePath}
          focusedPath={focusedKey}
          onFileClick={onFileClick}
          onFocus={setFocusedKey}
          registerRef={registerRef}
        />
      ))}
    </div>
  );
}
