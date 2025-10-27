import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, MessageSquare, Trash2, Edit, GitBranch, Tag as TagIcon, Sparkles, Archive, ArchiveRestore, X, Filter, Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface ConversationThread {
  id: string;
  userId: string;
  projectId?: string | null;
  guideId?: string | null;
  title: string;
  summary?: string | null;
  tags?: string[] | null;
  parentThreadId?: string | null;
  isActive: boolean;
  messageCount?: number;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  title: string;
}

interface Guide {
  id: string;
  title: string;
}

export default function ConversationThreadsManager() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterProjectId, setFilterProjectId] = useState<string>("");
  const [filterGuideId, setFilterGuideId] = useState<string>("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadProjectId, setNewThreadProjectId] = useState<string>("");
  const [newThreadGuideId, setNewThreadGuideId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

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

  // Fetch conversation threads
  const { data: threads = [], isLoading: isThreadsLoading } = useQuery<ConversationThread[]>({
    queryKey: ['/api/conversation-threads', { projectId: filterProjectId, guideId: filterGuideId, isActive: filterActive }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterProjectId) params.append('projectId', filterProjectId);
      if (filterGuideId) params.append('guideId', filterGuideId);
      if (filterActive !== 'all') params.append('isActive', filterActive);
      
      const url = `/api/conversation-threads${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch threads');
      return response.json();
    },
  });

  // Fetch projects for filter
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch guides for filter
  const { data: guides = [] } = useQuery<Guide[]>({
    queryKey: ['/api/guides'],
  });

  // Create thread mutation
  const createThreadMutation = useMutation<ConversationThread, Error, { title: string; projectId?: string; guideId?: string }>({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/conversation-threads', {
        title: data.title,
        projectId: data.projectId || undefined,
        guideId: data.guideId || undefined,
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversation-threads'] });
      toast({
        title: "Thread created",
        description: "New conversation thread has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewThreadTitle("");
      setNewThreadProjectId("");
      setNewThreadGuideId("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the conversation thread.",
        variant: "destructive",
      });
    },
  });

  // Delete thread mutation
  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      return apiRequest(`/api/conversation-threads/${threadId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversation-threads'] });
      toast({
        title: "Thread deleted",
        description: "The conversation thread has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setThreadToDelete(null);
      if (selectedThread?.id === threadToDelete) {
        setIsDetailDrawerOpen(false);
        setSelectedThread(null);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the conversation thread.",
        variant: "destructive",
      });
    },
  });

  // Update thread mutation
  const updateThreadMutation = useMutation<ConversationThread, Error, { id: string; updates: Partial<ConversationThread> }>({
    mutationFn: async ({ id, updates }) => {
      const response = await apiRequest(`/api/conversation-threads/${id}`, 'PUT', updates);
      return response.json();
    },
    onSuccess: (updatedThread: ConversationThread) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversation-threads'] });
      setSelectedThread(updatedThread);
      toast({
        title: "Thread updated",
        description: "The conversation thread has been updated successfully.",
      });
      setIsEditingTitle(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the conversation thread.",
        variant: "destructive",
      });
    },
  });

  // Generate tags mutation
  const generateTagsMutation = useMutation<ConversationThread, Error, string>({
    mutationFn: async (threadId: string) => {
      const response = await apiRequest(`/api/conversation-threads/${threadId}/generate-tags`, 'POST');
      return response.json();
    },
    onSuccess: (updatedThread: ConversationThread) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversation-threads'] });
      setSelectedThread(updatedThread);
      toast({
        title: "Tags generated",
        description: "AI-generated tags have been added to the thread.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate tags for the thread.",
        variant: "destructive",
      });
    },
  });

  const handleViewThread = (thread: ConversationThread) => {
    setSelectedThread(thread);
    setEditingTitle(thread.title);
    setIsDetailDrawerOpen(true);
  };

  const handleDeleteThread = (threadId: string) => {
    setThreadToDelete(threadId);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = (thread: ConversationThread) => {
    updateThreadMutation.mutate({
      id: thread.id,
      updates: { isActive: !thread.isActive },
    });
  };

  const handleSaveTitle = () => {
    if (selectedThread && editingTitle.trim() !== selectedThread.title) {
      updateThreadMutation.mutate({
        id: selectedThread.id,
        updates: { title: editingTitle.trim() },
      });
    } else {
      setIsEditingTitle(false);
    }
  };

  const filteredThreads = threads.filter(thread => {
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      return (
        thread.title.toLowerCase().includes(search) ||
        thread.summary?.toLowerCase().includes(search) ||
        thread.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }
    return true;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    const aTime = new Date(a.lastActivityAt || a.updatedAt).getTime();
    const bTime = new Date(b.lastActivityAt || b.updatedAt).getTime();
    return bTime - aTime;
  });

  // Pagination
  const totalPages = Math.ceil(sortedThreads.length / ITEMS_PER_PAGE);
  const paginatedThreads = sortedThreads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreateThread = () => {
    if (!newThreadTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a thread title.",
        variant: "destructive",
      });
      return;
    }
    createThreadMutation.mutate({
      title: newThreadTitle.trim(),
      projectId: newThreadProjectId || undefined,
      guideId: newThreadGuideId || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="heading-conversation-threads">Conversation Threads</h1>
            <p className="text-muted-foreground">
              Manage your AI writing assistant conversations and brainstorming sessions
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-thread">
            <Plus className="w-4 h-4 mr-2" />
            New Thread
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search threads..."
                    value={debouncedSearch}
                    onChange={(e) => setDebouncedSearch(e.target.value)}
                    className="pl-8"
                    data-testid="input-search-threads"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={filterProjectId} onValueChange={setFilterProjectId}>
                  <SelectTrigger data-testid="select-filter-project">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All projects</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Guide</label>
                <Select value={filterGuideId} onValueChange={setFilterGuideId}>
                  <SelectTrigger data-testid="select-filter-guide">
                    <SelectValue placeholder="All guides" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All guides</SelectItem>
                    {guides.map(guide => (
                      <SelectItem key={guide.id} value={guide.id}>{guide.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterActive} onValueChange={setFilterActive}>
                  <SelectTrigger data-testid="select-filter-status">
                    <SelectValue placeholder="All threads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All threads</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thread List */}
        {isThreadsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : sortedThreads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No conversation threads found</p>
              <p className="text-sm text-muted-foreground">
                {debouncedSearch || filterProjectId || filterGuideId || filterActive !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start a conversation with the AI writing assistant to create your first thread'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedThreads.map(thread => (
              <Card
                key={thread.id}
                className="hover-elevate cursor-pointer transition-all"
                onClick={() => handleViewThread(thread)}
                data-testid={`card-thread-${thread.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {thread.title}
                        {!thread.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            <Archive className="w-3 h-3 mr-1" />
                            Archived
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {thread.summary || 'No summary available'}
                      </CardDescription>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(thread.lastActivityAt || thread.updatedAt), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {thread.messageCount || 0} messages
                        </span>
                      </div>

                      {thread.tags && thread.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {thread.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Thread Detail Drawer */}
        <Drawer open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen}>
          <DrawerContent>
            <div className="max-w-4xl mx-auto w-full p-6">
              <DrawerHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitle();
                            if (e.key === 'Escape') {
                              setIsEditingTitle(false);
                              setEditingTitle(selectedThread?.title || '');
                            }
                          }}
                          className="text-lg font-semibold"
                          data-testid="input-edit-thread-title"
                        />
                        <Button onClick={handleSaveTitle} size="sm" data-testid="button-save-title">
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingTitle(false);
                            setEditingTitle(selectedThread?.title || '');
                          }}
                          size="sm"
                          variant="ghost"
                          data-testid="button-cancel-edit-title"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <DrawerTitle className="flex items-center gap-2">
                        {selectedThread?.title}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingTitle(true);
                          }}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          data-testid="button-edit-title"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </DrawerTitle>
                    )}
                    <DrawerDescription className="mt-2">
                      {selectedThread?.summary || 'No summary available'}
                    </DrawerDescription>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" data-testid="button-close-drawer">
                      <X className="w-4 h-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              {selectedThread && (
                <div className="space-y-6 mt-6">
                  {/* Thread Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>{' '}
                      <span>{format(new Date(selectedThread.createdAt), 'PPP')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Activity:</span>{' '}
                      <span>{format(new Date(selectedThread.lastActivityAt || selectedThread.updatedAt), 'PPP')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Messages:</span>{' '}
                      <span>{selectedThread.messageCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <Badge variant={selectedThread.isActive ? "default" : "secondary"}>
                        {selectedThread.isActive ? 'Active' : 'Archived'}
                      </Badge>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Tags</h3>
                      <Button
                        onClick={() => generateTagsMutation.mutate(selectedThread.id)}
                        disabled={generateTagsMutation.isPending}
                        size="sm"
                        variant="outline"
                        data-testid="button-generate-tags"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {generateTagsMutation.isPending ? 'Generating...' : 'Generate AI Tags'}
                      </Button>
                    </div>
                    {selectedThread.tags && selectedThread.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedThread.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags yet. Generate AI tags to categorize this thread.</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleToggleActive(selectedThread)}
                      disabled={updateThreadMutation.isPending}
                      variant="outline"
                      data-testid="button-toggle-active"
                    >
                      {selectedThread.isActive ? (
                        <>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive Thread
                        </>
                      ) : (
                        <>
                          <ArchiveRestore className="w-4 h-4 mr-2" />
                          Restore Thread
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleDeleteThread(selectedThread.id)}
                      variant="destructive"
                      data-testid="button-delete-thread"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Thread
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Create Thread Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Conversation Thread</DialogTitle>
              <DialogDescription>
                Start a new conversation thread. You can link it to a project or guide for better organization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="thread-title">Thread Title *</Label>
                <Input
                  id="thread-title"
                  placeholder="e.g., Character Development Ideas"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  data-testid="input-new-thread-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thread-project">Project (Optional)</Label>
                <Select value={newThreadProjectId} onValueChange={setNewThreadProjectId}>
                  <SelectTrigger id="thread-project" data-testid="select-new-thread-project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thread-guide">Guide (Optional)</Label>
                <Select value={newThreadGuideId} onValueChange={setNewThreadGuideId}>
                  <SelectTrigger id="thread-guide" data-testid="select-new-thread-guide">
                    <SelectValue placeholder="Select a guide" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No guide</SelectItem>
                    {guides.map(guide => (
                      <SelectItem key={guide.id} value={guide.id}>{guide.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewThreadTitle("");
                  setNewThreadProjectId("");
                  setNewThreadGuideId("");
                }}
                data-testid="button-cancel-create-thread"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateThread}
                disabled={createThreadMutation.isPending}
                data-testid="button-confirm-create-thread"
              >
                {createThreadMutation.isPending ? 'Creating...' : 'Create Thread'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Conversation Thread</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this conversation thread? This will permanently delete all associated messages. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (threadToDelete) {
                    deleteThreadMutation.mutate(threadToDelete);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
