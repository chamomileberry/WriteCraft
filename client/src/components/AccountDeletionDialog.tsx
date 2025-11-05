import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Download } from "lucide-react";

interface AccountDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isPending: boolean;
  onExportData?: () => Promise<void>;
}

export function AccountDeletionDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  onExportData,
}: AccountDeletionDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [showDataExportPrompt, setShowDataExportPrompt] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const isConfirmed = confirmText === "DELETE";

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    await onConfirm();
    // Reset state
    setConfirmText("");
    setShowDataExportPrompt(true);
  };

  const handleCancel = () => {
    setConfirmText("");
    setShowDataExportPrompt(true);
    onOpenChange(false);
  };

  const handleExportData = async () => {
    if (!onExportData) {
      setShowDataExportPrompt(false);
      return;
    }

    try {
      setIsExporting(true);
      await onExportData();
      setShowDataExportPrompt(false);
    } catch (error) {
      // Error handling is done in the parent component via toast
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px]"
        data-testid="dialog-account-deletion"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account Permanently
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Data Export Prompt */}
          {showDataExportPrompt && (
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between gap-2">
                <span className="flex-1">
                  Would you like to export your data before deleting?
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleExportData}
                    disabled={isExporting}
                    data-testid="button-export-data"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1" />
                        Export Data
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDataExportPrompt(false)}
                    disabled={isExporting}
                    data-testid="button-skip-export"
                  >
                    Skip
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warning List */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>This will permanently delete:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>All your characters, locations, and plot points</li>
                <li>All your projects and timelines</li>
                <li>All your notes and notebooks</li>
                <li>Your AI conversation history</li>
                <li>Your subscription (if active)</li>
                <li>All account settings and preferences</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="font-mono"
              data-testid="input-confirm-delete"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Once deleted, your account cannot be recovered. If you have an
            active subscription, it will be canceled immediately.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            data-testid="button-cancel-delete"
          >
            Keep My Account
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isPending}
            data-testid="button-confirm-delete-account"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete Account Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
