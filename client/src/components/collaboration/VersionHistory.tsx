import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { History, RotateCcw, Plus, Clock, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Version {
  id: string;
  projectId: string;
  versionNumber: number;
  title: string;
  content: string;
  wordCount: number;
  userId: string;
  versionType: string;
  versionLabel: string | null;
  createdAt: string;
}

interface VersionHistoryProps {
  projectId: string;
  onClose: () => void;
  isOwner: boolean;
}

export function VersionHistory({ projectId, onClose, isOwner }: VersionHistoryProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [snapshotLabel, setSnapshotLabel] = useState("");

  const { data, isLoading } = useQuery<{ versions: Version[] }>({
    queryKey: ['/api/collaboration/projects', projectId, 'versions'],
    enabled: !!projectId,
  });

  const createVersionMutation = useMutation({
    mutationFn: async (label: string) => {
      return await apiRequest("POST", `/api/collaboration/projects/${projectId}/versions`, { label });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/projects', projectId, 'versions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/projects', projectId, 'activity'] });
      setShowCreateDialog(false);
      setSnapshotLabel("");
      toast({
        title: "Snapshot created",
        description: "Version snapshot saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create snapshot",
        variant: "destructive",
      });
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return await apiRequest("POST", `/api/collaboration/projects/${projectId}/versions/${versionId}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/projects', projectId, 'activity'] });
      setShowRestoreDialog(false);
      setSelectedVersion(null);
      toast({
        title: "Version restored",
        description: "Project content has been restored to this version",
      });
      onClose();
      window.location.reload(); // Reload to show restored content
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive",
      });
    },
  });

  const handleCreateSnapshot = () => {
    if (snapshotLabel.trim()) {
      createVersionMutation.mutate(snapshotLabel.trim());
    }
  };

  const handleRestoreVersion = () => {
    if (selectedVersion) {
      restoreVersionMutation.mutate(selectedVersion.id);
    }
  };

  return (
    <>
      <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col" data-testid="version-history-sidebar">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Version History</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-version-history"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Create Snapshot Button */}
        <div className="p-4 border-b border-border">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full"
            data-testid="button-create-snapshot"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Snapshot
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-lg border p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : data?.versions && data.versions.length > 0 ? (
            <div className="space-y-3">
              {data.versions.map(version => (
                <div
                  key={version.id}
                  className="rounded-lg border border-border p-4 hover-elevate active-elevate-2 transition-all"
                  data-testid={`version-${version.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">
                        {version.versionLabel || `Version ${version.versionNumber}`}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                        </span>
                        <span>•</span>
                        <span>{version.wordCount} words</span>
                      </div>
                    </div>

                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedVersion(version);
                          setShowRestoreDialog(true);
                        }}
                        data-testid={`button-restore-${version.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground line-clamp-3">
                    {version.content.substring(0, 150)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <History className="h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">No versions yet</p>
              <p className="text-sm mt-2">
                Create manual snapshots to save specific versions
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            Automatic snapshots created every 50 edits
          </p>
        </div>
      </div>

      {/* Create Snapshot Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-testid="dialog-create-snapshot">
          <DialogHeader>
            <DialogTitle>Create Snapshot</DialogTitle>
            <DialogDescription>
              Save the current version of your project with a descriptive label
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="snapshot-label">Snapshot Label</Label>
              <Input
                id="snapshot-label"
                placeholder="e.g., 'Before major revision'"
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                data-testid="input-snapshot-label"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setSnapshotLabel("");
              }}
              data-testid="button-cancel-snapshot"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSnapshot}
              disabled={!snapshotLabel.trim() || createVersionMutation.isPending}
              data-testid="button-confirm-snapshot"
            >
              {createVersionMutation.isPending ? "Creating..." : "Create Snapshot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent data-testid="dialog-restore-version">
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this version? This will replace the current content.
            </DialogDescription>
          </DialogHeader>

          {selectedVersion && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedVersion.versionLabel || `Version ${selectedVersion.versionNumber}`}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(selectedVersion.createdAt), { addSuffix: true })}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRestoreDialog(false);
                setSelectedVersion(null);
              }}
              data-testid="button-cancel-restore"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestoreVersion}
              disabled={restoreVersionMutation.isPending}
              data-testid="button-confirm-restore"
            >
              {restoreVersionMutation.isPending ? "Restoring..." : "Restore Version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
