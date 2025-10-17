import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, PauseCircle, PlayCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

interface PauseStatus {
  isPaused: boolean;
  pausedAt: string | null;
  resumesAt: string | null;
  pauseReason: string | null;
}

export function PauseResumeSubscription() {
  const { toast } = useToast();
  const { subscription } = useSubscription();
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [resumeDate, setResumeDate] = useState("");
  const [pauseReason, setPauseReason] = useState("");

  // Hide for free users
  if (!subscription || subscription.tier === 'free' || !subscription.stripeSubscriptionId) {
    return null;
  }

  // Fetch pause status
  const { data: pauseStatus, isLoading } = useQuery<PauseStatus>({
    queryKey: ["/api/stripe/pause-status"],
  });

  // Pause subscription mutation
  const pauseMutation = useMutation({
    mutationFn: async (data: { resumeAt?: string; reason?: string }) => {
      return await apiRequest("POST", "/api/stripe/pause-subscription", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/pause-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription paused",
        description: "Your subscription has been paused successfully.",
      });
      setIsPauseDialogOpen(false);
      setResumeDate("");
      setPauseReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to pause subscription",
        variant: "destructive",
      });
    },
  });

  // Resume subscription mutation
  const resumeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/stripe/resume-subscription", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/pause-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription resumed",
        description: "Your subscription has been resumed successfully.",
      });
      setIsResumeDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resume subscription",
        variant: "destructive",
      });
    },
  });

  const handlePause = () => {
    pauseMutation.mutate({
      resumeAt: resumeDate || undefined,
      reason: pauseReason || undefined,
    });
  };

  const handleResume = () => {
    resumeMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Pause/Resume</CardTitle>
          <CardDescription>Temporarily pause or resume your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Pause/Resume</CardTitle>
          <CardDescription>
            Temporarily pause or resume your subscription billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pauseStatus?.isPaused ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Your subscription is currently paused</p>
                  {pauseStatus.pausedAt && (
                    <p className="text-sm text-muted-foreground">
                      Paused {formatDistanceToNow(new Date(pauseStatus.pausedAt), { addSuffix: true })}
                    </p>
                  )}
                  {pauseStatus.resumesAt && (
                    <p className="text-sm text-muted-foreground">
                      Scheduled to resume on {new Date(pauseStatus.resumesAt).toLocaleDateString()}
                    </p>
                  )}
                  {pauseStatus.pauseReason && (
                    <p className="text-sm text-muted-foreground">
                      Reason: {pauseStatus.pauseReason}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>
                <p className="text-sm text-muted-foreground">
                  Your subscription is active. You can pause it temporarily if needed.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            {pauseStatus?.isPaused ? (
              <Button
                onClick={() => setIsResumeDialogOpen(true)}
                variant="default"
                data-testid="button-resume-subscription"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Resume Subscription
              </Button>
            ) : (
              <Button
                onClick={() => setIsPauseDialogOpen(true)}
                variant="outline"
                data-testid="button-pause-subscription"
              >
                <PauseCircle className="h-4 w-4 mr-2" />
                Pause Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pause Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent data-testid="dialog-pause-subscription">
          <DialogHeader>
            <DialogTitle>Pause Subscription</DialogTitle>
            <DialogDescription>
              Pausing your subscription will stop billing but you'll lose access to premium features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resume-date">Auto-Resume Date (Optional)</Label>
              <Input
                id="resume-date"
                type="date"
                value={resumeDate}
                onChange={(e) => setResumeDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                data-testid="input-resume-date"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to pause indefinitely
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pause-reason">Reason (Optional)</Label>
              <Textarea
                id="pause-reason"
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Why are you pausing your subscription?"
                rows={3}
                data-testid="textarea-pause-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPauseDialogOpen(false)}
              data-testid="button-cancel-pause"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePause}
              disabled={pauseMutation.isPending}
              data-testid="button-confirm-pause"
            >
              {pauseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Pause Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent data-testid="dialog-resume-subscription">
          <DialogHeader>
            <DialogTitle>Resume Subscription</DialogTitle>
            <DialogDescription>
              Resuming your subscription will restart billing and restore access to premium features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResumeDialogOpen(false)}
              data-testid="button-cancel-resume"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResume}
              disabled={resumeMutation.isPending}
              data-testid="button-confirm-resume"
            >
              {resumeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Resume Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
