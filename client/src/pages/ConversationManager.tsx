import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Search,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit,
  MessageSquarePlus,
  Filter,
  GitBranch,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { analytics, EVENTS } from "@/lib/posthog";

interface ConversationThread {
  id: string;
  title: string;
  summary?: string;
  tags?: string[];
  parentThreadId?: string;
  isActive: boolean;
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
  projectId?: string;
  guideId?: string;
}

export default function ConversationManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "archived"
  >("all");
  const [selectedThreadForRename, setSelectedThreadForRename] =
    useState<ConversationThread | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [selectedThreadForDelete, setSelectedThreadForDelete] =
    useState<ConversationThread | null>(null);
  const [selectedThreadForBranch, setSelectedThreadForBranch] =
    useState<ConversationThread | null>(null);
  const [branchThreadTitle, setBranchThreadTitle] = useState("");

  // Fetch all threads for user (when no search query)
  const { data: allThreads = [], isLoading: isLoadingAll } = useQuery<
    ConversationThread[]
  >({
    queryKey: ["/api/conversation-threads", filterStatus],
    enabled: !!user && !searchQuery,
  });

  // Search threads (when search query exists)
  const { data: searchResults = [], isLoading: isSearching } = useQuery<
    ConversationThread[]
  >({
    queryKey: ["/api/conversation-threads/search", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ query: searchQuery });
      const response = await fetch(
        `/api/conversation-threads/search?${params}`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: !!user && !!searchQuery,
  });

  const isLoading = isLoadingAll || isSearching;
  const threads = searchQuery ? searchResults : allThreads;

  // Filter threads based on status only (search is handled by backend)
  const filteredThreads = threads
    .filter((thread) => {
      // Filter by status
      if (filterStatus === "active" && !thread.isActive) return false;
      if (filterStatus === "archived" && thread.isActive) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime(),
    );

  // Archive/unarchive thread mutation
  const toggleArchiveMutation = useMutation({
    mutationFn: async (thread: ConversationThread) => {
      const response = await apiRequest(
        "PUT",
        `/api/conversation-threads/${thread.id}`,
        {
          isActive: !thread.isActive,
        },
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversation-threads"],
      });
      toast({
        title: "Thread updated",
        description: "Conversation status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update conversation status.",
        variant: "destructive",
      });
    },
  });

  // Rename thread mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const response = await apiRequest(
        "PUT",
        `/api/conversation-threads/${id}`,
        { title },
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversation-threads"],
      });
      setSelectedThreadForRename(null);
      setNewThreadTitle("");
      toast({
        title: "Thread renamed",
        description: "Conversation title updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to rename conversation.",
        variant: "destructive",
      });
    },
  });

  // Delete thread mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(
        "DELETE",
        `/api/conversation-threads/${id}`,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversation-threads"],
      });
      setSelectedThreadForDelete(null);
      toast({
        title: "Thread deleted",
        description: "Conversation deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    },
  });

  // Branch thread mutation
  const branchMutation = useMutation({
    mutationFn: async ({
      parentId,
      title,
    }: {
      parentId: string;
      title: string;
    }) => {
      const response = await apiRequest(
        "POST",
        `/api/conversation-threads/${parentId}/branch`,
        { title },
      );
      return response.json();
    },
    onSuccess: (newThread) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversation-threads"],
      });
      setSelectedThreadForBranch(null);
      setBranchThreadTitle("");
      toast({
        title: "Branch created",
        description: "New conversation branch created successfully.",
      });
      // Navigate to the new branched thread
      handleOpenThread(newThread);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create conversation branch.",
        variant: "destructive",
      });
    },
  });

  const handleOpenThread = (thread: ConversationThread) => {
    // Track opening conversation
    analytics.track(EVENTS.AI_CHAT_STARTED, {
      thread_id: thread.id,
      has_project: !!thread.projectId,
      has_guide: !!thread.guideId,
    });

    // Navigate to workspace with thread ID in URL
    if (thread.projectId) {
      setLocation(
        `/workspace/project/${thread.projectId}?threadId=${thread.id}`,
      );
    } else if (thread.guideId) {
      setLocation(`/workspace/guide/${thread.guideId}?threadId=${thread.id}`);
    } else {
      setLocation(`/workspace?threadId=${thread.id}`);
    }
  };

  const handleRenameClick = (thread: ConversationThread) => {
    setSelectedThreadForRename(thread);
    setNewThreadTitle(thread.title);
  };

  const handleRenameSubmit = () => {
    if (selectedThreadForRename && newThreadTitle.trim()) {
      renameMutation.mutate({
        id: selectedThreadForRename.id,
        title: newThreadTitle.trim(),
      });
    }
  };

  const handleDeleteClick = (thread: ConversationThread) => {
    setSelectedThreadForDelete(thread);
  };

  const handleDeleteConfirm = () => {
    if (selectedThreadForDelete) {
      deleteMutation.mutate(selectedThreadForDelete.id);
    }
  };

  const handleBranchClick = (thread: ConversationThread) => {
    setSelectedThreadForBranch(thread);
    setBranchThreadTitle(`Branch of: ${thread.title}`);
  };

  const handleBranchSubmit = () => {
    if (selectedThreadForBranch && branchThreadTitle.trim()) {
      branchMutation.mutate({
        parentId: selectedThreadForBranch.id,
        title: branchThreadTitle.trim(),
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">
          Please log in to view your conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Conversation History</h1>
        <p className="text-muted-foreground">
          Manage your AI writing assistant conversations
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search-conversations"
            placeholder="Search conversations by title, summary, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(value: any) => setFilterStatus(value)}
        >
          <SelectTrigger
            data-testid="select-filter-status"
            className="w-full sm:w-48"
          >
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conversations</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Thread List */}
      <ScrollArea className="h-[calc(100vh-250px)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-1">No conversations found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search filters"
                : "Start a conversation in the Writing Assistant to begin"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredThreads.map((thread) => (
              <Card
                key={thread.id}
                className="hover-elevate cursor-pointer"
                data-testid={`card-thread-${thread.id}`}
                onClick={() => handleOpenThread(thread)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span
                          className="truncate"
                          data-testid={`text-thread-title-${thread.id}`}
                        >
                          {thread.title}
                        </span>
                        {thread.parentThreadId && (
                          <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </CardTitle>
                      {thread.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {thread.summary}
                        </p>
                      )}
                    </div>
                    <Badge variant={thread.isActive ? "default" : "secondary"}>
                      {thread.isActive ? "Active" : "Archived"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {thread.tags && thread.tags.length > 0 && (
                      <>
                        {thread.tags.slice(0, 5).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {thread.tags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{thread.tags.length - 5} more
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {thread.messageCount} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(thread.lastActivityAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        data-testid={`button-branch-${thread.id}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBranchClick(thread)}
                        title="Branch conversation"
                      >
                        <GitBranch className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid={`button-rename-${thread.id}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRenameClick(thread)}
                        title="Rename"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid={`button-archive-${thread.id}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleArchiveMutation.mutate(thread)}
                        title={thread.isActive ? "Archive" : "Restore"}
                      >
                        {thread.isActive ? (
                          <Archive className="h-4 w-4" />
                        ) : (
                          <ArchiveRestore className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        data-testid={`button-delete-${thread.id}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(thread)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Rename Dialog */}
      <Dialog
        open={!!selectedThreadForRename}
        onOpenChange={(open) => !open && setSelectedThreadForRename(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Enter a new title for this conversation thread.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="thread-title">Thread Title</Label>
            <Input
              id="thread-title"
              data-testid="input-rename-title"
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              placeholder="Enter conversation title..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedThreadForRename(null)}
            >
              Cancel
            </Button>
            <Button
              data-testid="button-confirm-rename"
              onClick={handleRenameSubmit}
              disabled={!newThreadTitle.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branch Conversation Dialog */}
      <Dialog
        open={!!selectedThreadForBranch}
        onOpenChange={(open) => !open && setSelectedThreadForBranch(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Branch Conversation</DialogTitle>
            <DialogDescription>
              Create a new conversation thread branching from "
              {selectedThreadForBranch?.title}". The new branch will start with
              the same context but allow you to explore different narrative
              directions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="branch-title">Branch Title</Label>
            <Input
              id="branch-title"
              data-testid="input-branch-title"
              value={branchThreadTitle}
              onChange={(e) => setBranchThreadTitle(e.target.value)}
              placeholder="Enter branch conversation title..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedThreadForBranch(null)}
            >
              Cancel
            </Button>
            <Button
              data-testid="button-confirm-branch"
              onClick={handleBranchSubmit}
              disabled={!branchThreadTitle.trim()}
            >
              Create Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!selectedThreadForDelete}
        onOpenChange={(open) => !open && setSelectedThreadForDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedThreadForDelete?.title}
              "? This action cannot be undone and will delete all messages in
              this conversation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedThreadForDelete(null)}
            >
              Cancel
            </Button>
            <Button
              data-testid="button-confirm-delete"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
