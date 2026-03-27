import { useEffect, useState } from 'react';
import { FileText, Trash2, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSnapshotManager } from '@/hooks/useSnapshotManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function SnapshotViewer() {
  const {
    snapshots,
    isLoading,
    loadSnapshots,
    deleteSnapshot,
    clearAllSnapshots,
    exportSnapshot,
  } = useSnapshotManager();

  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  const handleDownload = (snapshot: typeof snapshots[0]) => {
    const content = exportSnapshot(snapshot);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snapshot.metadata.testName}.snap.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (testPath: string, testName: string) => {
    await deleteSnapshot(testPath, testName);
    if (selectedSnapshot === `${testPath}::${testName}`) {
      setSelectedSnapshot(null);
    }
  };

  const selectedSnapshotData = snapshots.find(
    (s) => `${s.metadata.testPath}::${s.metadata.testName}` === selectedSnapshot
  );

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Snapshots</CardTitle>
              <CardDescription>
                {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} stored
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={loadSnapshots}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={snapshots.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Snapshots?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {snapshots.length} snapshot(s). This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllSnapshots}>
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {snapshots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No snapshots found</p>
                  <p className="text-xs mt-1">Run tests with snapshots to see them here</p>
                </div>
              ) : (
                snapshots.map((snapshot) => {
                  const key = `${snapshot.metadata.testPath}::${snapshot.metadata.testName}`;
                  const isSelected = selectedSnapshot === key;

                  return (
                    <div
                      key={key}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-accent border-primary'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedSnapshot(key)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {snapshot.metadata.testName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {snapshot.metadata.testPath}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated: {new Date(snapshot.metadata.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(snapshot);
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Snapshot?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the snapshot for "{snapshot.metadata.testName}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(
                                      snapshot.metadata.testPath,
                                      snapshot.metadata.testName
                                    )
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Snapshot Preview</CardTitle>
          <CardDescription>
            {selectedSnapshotData
              ? selectedSnapshotData.metadata.testName
              : 'Select a snapshot to preview'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          {selectedSnapshotData ? (
            <ScrollArea className="h-full">
              <pre className="text-xs font-mono p-4 bg-muted rounded-md">
                {exportSnapshot(selectedSnapshotData)}
              </pre>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <FileText className="h-12 w-12 opacity-50" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
