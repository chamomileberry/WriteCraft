import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Download,
  RefreshCw,
  Loader2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MFASetupData {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export function MFASettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [disableToken, setDisableToken] = useState("");
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [regeneratedCodes, setRegeneratedCodes] = useState<string[]>([]);

  // Check MFA status
  const { data: statusData, isLoading: statusLoading } = useQuery<{
    enabled: boolean;
  }>({
    queryKey: ["/api/auth/mfa/status"],
  });

  const mfaEnabled = statusData?.enabled || false;

  // Setup MFA mutation
  const setupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/mfa/setup");
      return (await res.json()) as MFASetupData;
    },
    onSuccess: (data) => {
      setSetupData(data);
      setShowSetupDialog(true);
    },
    onError: () => {
      toast({
        title: "Setup Failed",
        description: "Failed to initialize MFA setup. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify and enable MFA mutation
  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest("POST", "/api/auth/mfa/verify", { token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/mfa/status"] });
      setShowBackupCodesDialog(true);
      setShowSetupDialog(false);
      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Invalid authentication code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Disable MFA mutation
  const disableMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest("POST", "/api/auth/mfa/disable", { token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/mfa/status"] });
      setShowDisableDialog(false);
      setDisableToken("");
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    },
    onError: () => {
      toast({
        title: "Disable Failed",
        description: "Invalid authentication code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Regenerate backup codes mutation
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "/api/auth/mfa/regenerate-backup-codes",
        "POST",
      );
      return (await res.json()) as { backupCodes: string[] };
    },
    onSuccess: (data) => {
      setRegeneratedCodes(data.backupCodes);
      setShowRegenerateDialog(true);
      toast({
        title: "Backup Codes Regenerated",
        description:
          "New backup codes have been generated. Save them securely.",
      });
    },
    onError: () => {
      toast({
        title: "Regeneration Failed",
        description: "Failed to regenerate backup codes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (verificationToken.length === 6) {
      verifyMutation.mutate(verificationToken);
    }
  };

  const handleDisable = () => {
    if (disableToken.length === 6) {
      disableMutation.mutate(disableToken);
    }
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content = `WriteCraft Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nThese backup codes can be used if you lose access to your authenticator app.\nEach code can only be used once. Store them securely.\n\n${codes.join("\n")}\n`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `writecraft-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
            {mfaEnabled && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                Enabled
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mfaEnabled ? (
            <>
              <p className="text-sm text-muted-foreground">
                Two-factor authentication (2FA) adds an additional layer of
                security to your account by requiring a second form of
                verification when you sign in.
              </p>
              <Button
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending}
                data-testid="button-enable-mfa"
              >
                {setupMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Enable Two-Factor Authentication
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>2FA is Active</AlertTitle>
                <AlertDescription>
                  Your account is protected with two-factor authentication.
                  You'll need your authenticator app or backup codes to sign in.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => regenerateMutation.mutate()}
                  disabled={regenerateMutation.isPending}
                  data-testid="button-regenerate-codes"
                >
                  {regenerateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Regenerate Backup Codes
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDisableDialog(true)}
                  data-testid="button-disable-mfa"
                >
                  <X className="w-4 h-4 mr-2" />
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MFA Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-mfa-setup">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the
              verification code
            </DialogDescription>
          </DialogHeader>

          {setupData && (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img
                  src={setupData.qrCode}
                  alt="MFA QR Code"
                  className="w-48 h-48"
                  data-testid="img-qr-code"
                />
              </div>

              <div className="space-y-2">
                <Label>Manual Entry Code</Label>
                <Input
                  value={setupData.secret}
                  readOnly
                  className="font-mono text-sm"
                  data-testid="input-secret-code"
                />
                <p className="text-xs text-muted-foreground">
                  If you can't scan the QR code, enter this code manually in
                  your authenticator app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-token">Verification Code</Label>
                <Input
                  id="verification-token"
                  value={verificationToken}
                  onChange={(e) =>
                    setVerificationToken(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-xl tracking-widest font-mono"
                  data-testid="input-verification-token"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSetupDialog(false);
                setVerificationToken("");
                setSetupData(null);
              }}
              data-testid="button-cancel-setup"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={
                verificationToken.length !== 6 || verifyMutation.isPending
              }
              data-testid="button-verify-code"
            >
              {verifyMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog
        open={showBackupCodesDialog}
        onOpenChange={setShowBackupCodesDialog}
      >
        <DialogContent className="max-w-md" data-testid="dialog-backup-codes">
          <DialogHeader>
            <DialogTitle>Save Your Backup Codes</DialogTitle>
            <DialogDescription>
              Store these codes securely. Each code can only be used once if you
              lose access to your authenticator.
            </DialogDescription>
          </DialogHeader>

          {setupData && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Download or write down these codes now. You won't be able to
                  see them again.
                </AlertDescription>
              </Alert>

              <div
                className="bg-muted p-4 rounded-lg space-y-1"
                data-testid="backup-codes-list"
              >
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                onClick={() => downloadBackupCodes(setupData.backupCodes)}
                data-testid="button-download-codes"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Backup Codes
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setShowBackupCodesDialog(false);
                setSetupData(null);
                setVerificationToken("");
              }}
              data-testid="button-close-backup-codes"
            >
              I've Saved My Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable MFA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-disable-mfa">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your current authentication code to disable 2FA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling 2FA will make your account less secure. Only disable
                if necessary.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="disable-token">Authentication Code</Label>
              <Input
                id="disable-token"
                value={disableToken}
                onChange={(e) =>
                  setDisableToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="text-center text-xl tracking-widest font-mono"
                data-testid="input-disable-token"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDisableDialog(false);
                setDisableToken("");
              }}
              data-testid="button-cancel-disable"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disableToken.length !== 6 || disableMutation.isPending}
              data-testid="button-confirm-disable"
            >
              {disableMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
      >
        <DialogContent
          className="max-w-md"
          data-testid="dialog-regenerate-codes"
        >
          <DialogHeader>
            <DialogTitle>New Backup Codes Generated</DialogTitle>
            <DialogDescription>
              Your old backup codes are now invalid. Save these new codes
              securely.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Download or write down these codes now. Your previous codes no
                longer work.
              </AlertDescription>
            </Alert>

            <div
              className="bg-muted p-4 rounded-lg space-y-1"
              data-testid="regenerated-codes-list"
            >
              {regeneratedCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={() => downloadBackupCodes(regeneratedCodes)}
              data-testid="button-download-regenerated"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Backup Codes
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowRegenerateDialog(false);
                setRegeneratedCodes([]);
              }}
              data-testid="button-close-regenerated"
            >
              I've Saved My Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
