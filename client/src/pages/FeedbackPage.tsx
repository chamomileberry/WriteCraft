import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { logger } from "@/lib/logger";
import { useLocation } from "wouter";
import Header from "@/components/Header";

type FeedbackType = "bug" | "feature-request" | "general-feedback";
type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export default function FeedbackPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [feedbackType, setFeedbackType] =
    useState<FeedbackType>("general-feedback");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreFilled, setIsPreFilled] = useState(false);

  // Check for pre-filled feedback from help chat
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldOpenFeedback = params.get("openFeedback") === "true";

    if (shouldOpenFeedback) {
      const transcript = sessionStorage.getItem("helpChatTranscript");
      const originalQuestion = sessionStorage.getItem(
        "helpChatOriginalQuestion",
      );

      if (transcript && originalQuestion) {
        setTitle(
          `Help needed: ${originalQuestion.substring(0, 50)}${originalQuestion.length > 50 ? "..." : ""}`,
        );
        setDescription(
          `**Original Question:**\n${originalQuestion}\n\n**Full Conversation:**\n${transcript}`,
        );
        setFeedbackType("general-feedback");
        setIsPreFilled(true);

        // Clear session storage after pre-filling
        sessionStorage.removeItem("helpChatTranscript");
        sessionStorage.removeItem("helpChatOriginalQuestion");

        // Remove the query parameter from URL
        window.history.replaceState({}, "", "/feedback");
      }
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      // Fetch CSRF token first
      const csrfResponse = await fetch("/api/auth/csrf-token", {
        credentials: "include",
      });
      const { csrfToken } = await csrfResponse.json();

      // Submit feedback with CSRF token
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          type: feedbackType,
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setStatus("success");
      setTitle("");
      setDescription("");
      setFeedbackType("bug");
      logger.info("Feedback submitted successfully");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } catch (err) {
      logger.error("Failed to submit feedback:", err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Failed to submit feedback",
      );
    }
  };

  const typeLabel = {
    bug: "🐛 Bug Report",
    "feature-request": "💡 Feature Request",
    "general-feedback": "💬 General Feedback",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Help Us Improve WriteCraft
          </h1>
          <p className="text-xl text-muted-foreground">
            Your feedback helps us build a better writing experience. Whether
            you found a bug, have a feature idea, or just want to share your
            thoughts, we'd love to hear from you!
          </p>
        </div>

        {/* Pre-filled from help chat indicator */}
        {isPreFilled && status === "idle" && (
          <Alert className="mb-6 border-primary">
            <MessageSquare className="h-4 w-4" />
            <AlertTitle>Help Chat Context Included</AlertTitle>
            <AlertDescription>
              Your conversation with the help assistant has been included below.
              Feel free to edit before submitting.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>
              {user
                ? `Signed in as ${user.email}`
                : "Please log in to submit feedback"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "success" && (
              <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">
                  Success!
                </AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Thank you for your feedback! We'll review it and use it to
                  improve WriteCraft.
                </AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error || "Failed to submit feedback. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Feedback Type</Label>
                <Select
                  value={feedbackType}
                  onValueChange={(value) =>
                    setFeedbackType(value as FeedbackType)
                  }
                >
                  <SelectTrigger id="type" data-testid="select-feedback-type">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">
                      🐛 Bug Report - Something isn't working
                    </SelectItem>
                    <SelectItem value="feature-request">
                      💡 Feature Request - I have an idea
                    </SelectItem>
                    <SelectItem value="general-feedback">
                      💬 General Feedback - Just want to share
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder={
                    feedbackType === "bug"
                      ? "Brief description of the bug"
                      : feedbackType === "feature-request"
                        ? "What would you like to see?"
                        : "What would you like to tell us?"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={status === "submitting"}
                  data-testid="input-feedback-title"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/200 characters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Details</Label>
                <Textarea
                  id="description"
                  placeholder={
                    feedbackType === "bug"
                      ? "Steps to reproduce, expected behavior, actual behavior, screenshots, etc."
                      : feedbackType === "feature-request"
                        ? "Describe your feature idea in detail"
                        : "Tell us more about your feedback"
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={status === "submitting"}
                  rows={8}
                  data-testid="textarea-feedback-description"
                  maxLength={2000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/2000 characters
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-sm font-semibold">
                  We automatically include:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Your email address</li>
                  <li>• Browser and operating system information</li>
                  <li>• The page you were on when submitting</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={status === "submitting" || !user}
                  data-testid="button-submit-feedback"
                  className="flex-1"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </div>

              {!user && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Sign in required</AlertTitle>
                  <AlertDescription>
                    Please sign in to your WriteCraft account to submit
                    feedback.
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  What kind of feedback do you accept?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground pt-0">
                We welcome bug reports, feature requests, and general feedback.
                Anything that helps us improve WriteCraft is valuable!
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Will I get a response?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground pt-0">
                We read and review all feedback. While we may not respond
                individually to every submission, we use your input to guide
                development priorities.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  How do I report a security issue?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground pt-0">
                For security-sensitive issues, please email
                support@writecraft.app directly instead of using this form.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Can I track the status of my feedback?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground pt-0">
                Your feedback is tracked internally. For status updates, please
                reach out to support@writecraft.app.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
