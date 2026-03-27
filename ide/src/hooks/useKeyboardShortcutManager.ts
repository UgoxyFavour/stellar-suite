import { useEffect } from 'react';
import { useFileStore } from '@/store/useFileStore';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcutManager = () => {
  const { updateFileContent, markSaved, activeTabPath, files } = useFileStore();

  const saveCurrentFile = () => {
    if (activeTabPath.length > 0) {
      markSaved(activeTabPath);
      // Trigger save event - in a real IDE, this would save to disk
      console.log('File saved:', activeTabPath.join('/'));
    }
  };

  const triggerBuild = () => {
    // Trigger build event
    window.dispatchEvent(new Event('ide:build'));
    console.log('Build triggered');
  };

  const openFileFinder = () => {
    // Trigger file finder
    window.dispatchEvent(new Event('ide:open-file-finder'));
    console.log('File finder opened');
  };

  const openSearch = () => {
    // Trigger search (already exists in App.tsx)
    window.dispatchEvent(new Event('ide:open-search'));
    console.log('Search opened');
  };

  const openCommandPalette = () => {
    // Toggle command palette (already exists in App.tsx)
    window.dispatchEvent(new Event('ide:toggle-command-palette'));
    console.log('Command palette toggled');
  };

  const openHotkeysModal = () => {
    // Trigger hotkeys modal
    window.dispatchEvent(new Event('ide:open-hotkeys'));
    console.log('Hotkeys modal opened');
  };

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 's',
      metaKey: true,
      action: saveCurrentFile,
      description: 'Save current file'
    },
    {
      key: 'b',
      metaKey: true,
      action: triggerBuild,
      description: 'Build project'
    },
    {
      key: 'p',
      metaKey: true,
      action: openFileFinder,
      description: 'Open file finder'
    },
    {
      key: 'f',
      metaKey: true,
      shiftKey: true,
      action: openSearch,
      description: 'Search in files'
    },
    {
      key: 'k',
      metaKey: true,
      action: openCommandPalette,
      description: 'Toggle command palette'
    },
    {
      key: '/',
      metaKey: true,
      action: openHotkeysModal,
      description: 'Show keyboard shortcuts'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const matchesMeta = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const matchesShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.altKey ? event.altKey : !event.altKey;

        if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabPath, files]);

  return { shortcuts };
};
