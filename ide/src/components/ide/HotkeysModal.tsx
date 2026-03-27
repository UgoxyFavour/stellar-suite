import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard, Command } from "lucide-react";
import { useEffect, useState } from "react";

interface HotkeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["⌘", "S"], description: "Save current file" },
  { keys: ["⌘", "B"], description: "Build project" },
  { keys: ["⌘", "P"], description: "Open file finder" },
  { keys: ["⌘", "Shift", "F"], description: "Search in files" },
  { keys: ["⌘", "K"], description: "Toggle command palette" },
  { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Close modal/palette" },
];

const KeyCombo = ({ keys }: { keys: string[] }) => {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <div key={index} className="flex items-center">
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
            {key}
          </span>
          {index < keys.length - 1 && (
            <span className="mx-1 text-gray-500">+</span>
          )}
        </div>
      ))}
    </div>
  );
};

export const HotkeysModal = ({ open, onOpenChange }: HotkeysModalProps) => {
  useEffect(() => {
    const handleOpenHotkeys = () => onOpenChange(true);
    window.addEventListener('ide:open-hotkeys', handleOpenHotkeys);
    return () => window.removeEventListener('ide:open-hotkeys', handleOpenHotkeys);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Common keyboard shortcuts to navigate the IDE faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <KeyCombo keys={shortcut.keys} />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Note: ⌘ represents the Command key on Mac or Ctrl key on Windows/Linux
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
