import { useState } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Loader2, DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const REFUND_REASONS = [
  { value: "not_as_described", label: "Service not as described" },
  { value: "technical_issues", label: "Technical issues preventing use" },
  { value: "accidental_purchase", label: "Accidental purchase" },
  { value: "duplicate_charge", label: "Duplicate charge" },
  { value: "dissatisfied", label: "Dissatisfied with service" },
  { value: "other", label: "Other reason" },
];

export default function RefundRequestPage() {
  const [, setLocation] = useLocation();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();

  const [reason, setReason] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason || !explanation.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a reason and provide an explanation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit as feedback with 'refund' tag
      await apiRequest("POST", "/api/feedback", {
        type: "refund",
        subject: `Refund Request: ${REFUND_REASONS.find((r) => r.value === reason)?.label}`,
        message: explanation,
        metadata: {
          reason,
          tier: subscription?.tier,
          currentPeriodEnd: subscription?.currentPeriodEnd,
        },
      });

      toast({
        title: "Refund request submitted",
        description:
          "Our support team will review your request within 1-2 business days.",
      });

      // Navigate back to account settings
      setLocation("/account");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit refund request",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setLocation("/account");
  };

  if (subscriptionLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const isPaidTier = subscription?.tier !== "free";

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={handleCancel}
        className="mb-4"
        data-testid="button-back-to-account"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Account Settings
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Request Refund
              </CardTitle>
              <CardDescription>
                Submit a refund request for your WriteCraft subscription
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isPaidTier ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have an active paid subscription. Refunds are only
                available for paid tiers.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Current Subscription Info */}
              <div className="rounded-lg border p-4 bg-muted/30">
                <h3 className="font-medium mb-3">Current Subscription</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <Badge variant="secondary">
                      {subscription?.tier &&
                        subscription.tier.charAt(0).toUpperCase() +
                          subscription.tier.slice(1)}
                    </Badge>
                  </div>
                  {subscription?.currentPeriodEnd && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Billing period ends:
                      </span>
                      <span>
                        {format(
                          new Date(subscription.currentPeriodEnd),
                          "MMM d, yyyy",
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Policy */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Refund Policy:</strong> Refunds are available within 7
                  days of your initial purchase. Subscription charges more than
                  7 days old are not eligible for refunds, but you can cancel
                  your subscription at any time.
                </AlertDescription>
              </Alert>

              {/* Refund Request Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for refund request</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger
                      id="reason"
                      data-testid="select-refund-reason"
                    >
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFUND_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="explanation">
                    Please explain your situation
                  </Label>
                  <Textarea
                    id="explanation"
                    placeholder="Provide details about why you're requesting a refund. Include any relevant information such as order dates, issues encountered, etc."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="min-h-[150px]"
                    data-testid="textarea-refund-explanation"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be as specific as possible to help us process your request
                    quickly
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    data-testid="button-cancel-refund"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !reason || !explanation.trim()}
                    data-testid="button-submit-refund"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Submit Refund Request
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
