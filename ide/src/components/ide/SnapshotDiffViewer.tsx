import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { snapshotManager, type SnapshotDiff } from '@/lib/testing/snapshotManager';
import { CheckCircle2, XCircle, Plus, Minus, Edit } from 'lucide-react';

interface SnapshotDiffViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testPath: string;
  testName: string;
  diffs: SnapshotDiff[];
  newValue: unknown;
  oldValue: unknown;
}

export function SnapshotDiffViewer({
  open,
  onOpenChange,
  testPath,
  testName,
  diffs,
  newValue,
  oldValue,
}: SnapshotDiffViewerProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprove = async () => {
    setIsUpdating(true);
    try {
      await snapshotManager.saveSnapshot(testPath, testName, newValue);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update snapshot:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = () => {
    onOpenChange(false);
  };

  const getDiffIcon = (type: SnapshotDiff['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-amber-500" />;
    }
  };

  const getDiffColor = (type: SnapshotDiff['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'removed':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'modified':
        return 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Snapshot Mismatch</DialogTitle>
          <DialogDescription>
            {testName} in {testPath}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="diff" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diff">
              Differences ({diffs.length})
            </TabsTrigger>
            <TabsTrigger value="expected">Expected</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>

          <TabsContent value="diff" className="flex-1 min-h-0">
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-3">
                {diffs.map((diff, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-md ${getDiffColor(diff.type)}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getDiffIcon(diff.type)}
                      <span className="font-mono text-sm font-medium">
                        {diff.path || '(root)'}
                      </span>
                      <span className="text-xs uppercase font-semibold">
                        {diff.type}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm font-mono">
                      {diff.type !== 'added' && (
                        <div className="flex gap-2">
                          <span className="text-red-600 dark:text-red-400">-</span>
                          <pre className="flex-1 overflow-x-auto">
                            {JSON.stringify(diff.oldValue, null, 2)}
                          </pre>
                        </div>
                      )}
                      {diff.type !== 'removed' && (
                        <div className="flex gap-2">
                          <span className="text-green-600 dark:text-green-400">+</span>
                          <pre className="flex-1 overflow-x-auto">
                            {JSON.stringify(diff.newValue, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="expected" className="flex-1 min-h-0">
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <pre className="text-sm font-mono">
                {snapshotManager.serializeSnapshot(oldValue)}
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="received" className="flex-1 min-h-0">
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <pre className="text-sm font-mono">
                {snapshotManager.serializeSnapshot(newValue)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isUpdating}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isUpdating}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isUpdating ? 'Updating...' : 'Approve & Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
