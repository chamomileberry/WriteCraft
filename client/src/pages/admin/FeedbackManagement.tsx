import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Search, Filter, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logger } from "@/lib/logger";
import type {
  FeedbackResponse,
  FeedbackType,
  FeedbackStatus,
} from "@shared/types/feedback";

const typeColors: Record<FeedbackType, string> = {
  bug: "destructive",
  "feature-request": "secondary",
  "general-feedback": "outline",
};

const typeEmojis: Record<FeedbackType, string> = {
  bug: "🐛",
  "feature-request": "💡",
  "general-feedback": "💬",
};

const statusColors: Record<FeedbackStatus, string> = {
  new: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  reviewed:
    "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100",
  "in-progress":
    "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
  resolved: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
  closed: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
};

export default function FeedbackManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FeedbackType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">(
    "all",
  );
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackResponse | null>(null);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();

  // Fetch feedback
  const { data: feedbackList = [], isLoading } = useQuery<FeedbackResponse[]>({
    queryKey: ["/api/admin/feedback"],
    queryFn: async () => {
      const res = await fetch("/api/admin/feedback", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch feedback");
      return res.json();
    },
  });

  // Reply to feedback mutation
  const { mutate: replyToFeedback, isPending: isReplying } = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      // Fetch CSRF token first
      const csrfResponse = await fetch("/api/auth/csrf-token", {
        credentials: "include",
      });
      const { csrfToken } = await csrfResponse.json();

      // Send reply with CSRF token
      const response = await fetch(`/api/admin/feedback/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ reply }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      setReplyText("");
      logger.info("Reply sent successfully");
    },
  });

  // Update feedback status mutation
  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: FeedbackStatus;
    }) => {
      // Fetch CSRF token first
      const csrfResponse = await fetch("/api/auth/csrf-token", {
        credentials: "include",
      });
      const { csrfToken } = await csrfResponse.json();

      // Update status with CSRF token
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update feedback status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      logger.info("Feedback status updated");
    },
  });

  // Filter feedback
  let filtered = feedbackList;
  if (typeFilter !== "all") {
    filtered = filtered.filter((f: FeedbackResponse) => f.type === typeFilter);
  }
  if (statusFilter !== "all") {
    filtered = filtered.filter(
      (f: FeedbackResponse) => f.status === statusFilter,
    );
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (f: FeedbackResponse) =>
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.userEmail.toLowerCase().includes(q),
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Feedback Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage user feedback and bug reports
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{feedbackList.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {
                feedbackList.filter((f: FeedbackResponse) => f.status === "new")
                  .length
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {
                feedbackList.filter(
                  (f: FeedbackResponse) => f.status === "in-progress",
                ).length
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {
                feedbackList.filter(
                  (f: FeedbackResponse) => f.status === "resolved",
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title, description, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-feedback"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Type</label>
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as FeedbackType | "all")}
              >
                <SelectTrigger data-testid="select-feedback-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">🐛 Bug Report</SelectItem>
                  <SelectItem value="feature-request">
                    💡 Feature Request
                  </SelectItem>
                  <SelectItem value="general-feedback">
                    💬 General Feedback
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as FeedbackStatus | "all")
                }
              >
                <SelectTrigger data-testid="select-feedback-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Feedback Items ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No feedback matches your filters.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((feedback: FeedbackResponse) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <span className="text-lg">
                          {typeEmojis[feedback.type]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setSelectedFeedback(feedback)}
                          className="hover:underline text-primary max-w-xs truncate"
                          data-testid="button-view-feedback"
                        >
                          {feedback.title}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {feedback.userEmail}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[feedback.status]}
                          variant="outline"
                        >
                          {feedback.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={feedback.status}
                          onValueChange={(newStatus) =>
                            updateStatus({
                              id: feedback.id,
                              status: newStatus as FeedbackStatus,
                            })
                          }
                          disabled={isUpdating}
                        >
                          <SelectTrigger
                            className="w-32"
                            data-testid="select-feedback-status-update"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="in-progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[var(--z-modal)]"
          onClick={() => setSelectedFeedback(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {typeEmojis[selectedFeedback.type]}
                    </span>
                    <Badge className={statusColors[selectedFeedback.status]}>
                      {selectedFeedback.status}
                    </Badge>
                  </div>
                  <CardTitle>{selectedFeedback.title}</CardTitle>
                  <CardDescription>
                    From: {selectedFeedback.userEmail}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedFeedback(null)}
                  data-testid="button-close-feedback-detail"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedFeedback.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-muted-foreground">Browser</p>
                  <p>{selectedFeedback.userBrowser || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">OS</p>
                  <p>{selectedFeedback.userOS || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Page</p>
                  <p>{selectedFeedback.currentPage || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">
                    Submitted
                  </p>
                  <p>{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedFeedback.adminReply && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Your Reply</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedFeedback.adminReply}
                    </p>
                    {selectedFeedback.adminRepliedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Sent on{" "}
                        {new Date(
                          selectedFeedback.adminRepliedAt,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold">Send Reply</h3>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the user..."
                  className="min-h-[100px]"
                  data-testid="textarea-admin-reply"
                />
                <Button
                  onClick={() => {
                    if (replyText.trim()) {
                      replyToFeedback({
                        id: selectedFeedback.id,
                        reply: replyText,
                      });
                    }
                  }}
                  disabled={!replyText.trim() || isReplying}
                  data-testid="button-send-reply"
                >
                  {isReplying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Send Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
