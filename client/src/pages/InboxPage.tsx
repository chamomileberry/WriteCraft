
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, MailOpen, MessageSquare } from "lucide-react";
import { logger } from "@/lib/logger";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { useState } from "react";
import type { FeedbackResponse } from "@shared/types/feedback";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-900",
  reviewed: "bg-purple-100 text-purple-900",
  "in-progress": "bg-yellow-100 text-yellow-900",
  resolved: "bg-green-100 text-green-900",
  closed: "bg-gray-100 text-gray-900",
};

export default function InboxPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (view: string) => {
    if (view === 'notebook') {
      setLocation('/notebook');
    } else if (view === 'projects') {
      setLocation('/projects');
    } else if (view === 'generators') {
      setLocation('/generators');
    } else if (view === 'guides') {
      setLocation('/guides');
    }
  };

  // Fetch user's feedback/messages
  const { data: messages = [], isLoading } = useQuery<FeedbackResponse[]>({
    queryKey: ["/api/inbox"],
    queryFn: async () => {
      const res = await fetch("/api/inbox", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

  // Mark as read mutation
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`/api/inbox/${messageId}/mark-read`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inbox/unread-count"] });
    },
  });

  const handleOpenMessage = (message: FeedbackResponse) => {
    if (message.hasUnreadReply) {
      markAsRead(message.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} searchQuery={searchQuery} onNavigate={handleNavigate} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Inbox</h1>
          <p className="text-xl text-muted-foreground">
            Messages and responses from the WriteCraft team
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              No messages yet. Submit feedback to start a conversation with the team!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-all ${
                  message.hasUnreadReply ? "border-primary shadow-md" : ""
                }`}
                onClick={() => handleOpenMessage(message)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {message.hasUnreadReply ? (
                          <Mail className="h-5 w-5 text-primary" />
                        ) : (
                          <MailOpen className="h-5 w-5 text-muted-foreground" />
                        )}
                        <CardTitle className="text-lg">{message.title}</CardTitle>
                      </div>
                      <CardDescription>
                        {new Date(message.createdAt).toLocaleDateString()} • Status:{" "}
                        <Badge className={statusColors[message.status]} variant="outline">
                          {message.status}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Your message:</p>
                    <p className="text-sm">{message.description}</p>
                  </div>

                  {message.adminReply && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">Team Response:</p>
                        <p className="text-xs text-muted-foreground">
                          {message.adminRepliedAt
                            ? new Date(message.adminRepliedAt).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.adminReply}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button onClick={() => setLocation("/feedback")} className="w-full sm:w-auto">
            <MessageSquare className="mr-2 h-4 w-4" />
            Send New Message
          </Button>
        </div>
      </div>
    </div>
  );
}
