import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface CancellationSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, feedback?: string) => Promise<void>;
  isPending: boolean;
}

const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'not_using', label: 'Not using it enough' },
  { value: 'switching_service', label: 'Switching to another service' },
  { value: 'technical_issues', label: 'Technical issues' },
  { value: 'temporary_break', label: 'Taking a temporary break' },
  { value: 'other', label: 'Other' },
];

export function CancellationSurveyDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: CancellationSurveyDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');

  const handleConfirm = async () => {
    if (!reason) return;
    await onConfirm(reason, feedback || undefined);
    // Reset form
    setReason('');
    setFeedback('');
  };

  const handleCancel = () => {
    setReason('');
    setFeedback('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-cancellation-survey">
        <DialogHeader>
          <DialogTitle>Before you go...</DialogTitle>
          <DialogDescription>
            We'd love to understand why you're canceling. Your feedback helps us improve WriteCraft for everyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">What's your main reason for canceling?</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason" data-testid="select-cancellation-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Additional feedback (optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Tell us more about your experience or what we could improve..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
              data-testid="textarea-cancellation-feedback"
            />
          </div>

          <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-4 text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
              Your subscription will remain active until the end of your billing period
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              You'll continue to have full access to all features until then.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            data-testid="button-cancel-survey"
          >
            Keep Subscription
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason || isPending}
            data-testid="button-confirm-cancellation"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
