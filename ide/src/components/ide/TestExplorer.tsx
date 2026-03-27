import { useState, useEffect } from 'react';
import { Play, RefreshCw, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { snapshotManager } from '@/lib/testing/snapshotManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  name: string;
  path: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  duration?: number;
  error?: string;
  snapshotMismatch?: boolean;
}

export function TestExplorer() {
  const [updateSnapshots, setUpdateSnapshots] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Update snapshot manager when toggle changes
    snapshotManager.setUpdateMode(updateSnapshots);
  }, [updateSnapshots]);

  const handleRunTests = async () => {
    setIsRunning(true);
    // This would integrate with the actual test runner
    // For now, it's a placeholder for the integration point
    setTimeout(() => {
      setIsRunning(false);
    }, 1000);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Test Explorer</CardTitle>
        <CardDescription>Run and manage your tests</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="update-snapshots"
              checked={updateSnapshots}
              onCheckedChange={setUpdateSnapshots}
            />
            <Label htmlFor="update-snapshots" className="cursor-pointer">
              Update Snapshots
            </Label>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunTests}
              disabled={isRunning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleRunTests}
              disabled={isRunning}
            >
              <Play className="h-4 w-4 mr-2" />
              Run All
            </Button>
          </div>
        </div>

        {updateSnapshots && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm">
            <p className="text-amber-800 dark:text-amber-200">
              Snapshot update mode is enabled. All snapshots will be updated on the next test run.
            </p>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {tests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No tests found</p>
                <p className="text-xs mt-1">Run tests to see results here</p>
              </div>
            ) : (
              tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(test.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{test.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{test.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.duration && (
                      <span className="text-xs text-muted-foreground">
                        {test.duration}ms
                      </span>
                    )}
                    {test.snapshotMismatch && (
                      <Badge variant="outline" className="text-xs">
                        Snapshot
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
