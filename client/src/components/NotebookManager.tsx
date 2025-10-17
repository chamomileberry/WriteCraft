import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, BookOpen, Calendar, Share2 } from "lucide-react";
import { type Notebook, useNotebookStore } from "@/stores/notebookStore";
import { useNotebooks, useActiveNotebookId } from "@/hooks/useNotebookHooks";
import { notebooksApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import { ImageUpload } from "@/components/ui/image-upload";
import { ShareDialog } from "@/components/ShareDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface NotebookManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotebookCreated?: (notebook: Notebook) => void;
  openInCreateMode?: boolean;
}

interface CreateNotebookData {
  name: string;
  description?: string;
  imageUrl?: string;
}

interface UpdateNotebookData {
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function NotebookManager({ isOpen, onClose, onNotebookCreated, openInCreateMode = false }: NotebookManagerProps) {
  const { toast } = useToast();
  const { checkLimit } = useSubscription();
  
  // Use custom hooks for cleaner code
  const notebooks = useNotebooks();
  const activeNotebookId = useActiveNotebookId();
  
  // Use individual action hooks to avoid re-render issues
  const setNotebooks = useNotebookStore(state => state.setNotebooks);
  const addNotebook = useNotebookStore(state => state.addNotebook);
  const updateNotebook = useNotebookStore(state => state.updateNotebook);
  const removeNotebook = useNotebookStore(state => state.removeNotebook);
  const setActiveNotebook = useNotebookStore(state => state.setActiveNotebook);

  // Local state for modals and forms
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [deletingNotebook, setDeletingNotebook] = useState<Notebook | null>(null);
  const [sharingNotebook, setSharingNotebook] = useState<Notebook | null>(null);
  const [activeTab, setActiveTab] = useState<'owned' | 'shared'>('owned');
  const [createForm, setCreateForm] = useState<CreateNotebookData>({ name: "", description: "", imageUrl: "" });
  const [editForm, setEditForm] = useState<UpdateNotebookData>({ name: "", description: "", imageUrl: "" });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Auto-open create dialog when openInCreateMode is true
  useEffect(() => {
    if (isOpen && openInCreateMode) {
      setIsCreateOpen(true);
    }
  }, [isOpen, openInCreateMode]);

  // Fetch notebooks
  const { isLoading, error } = useQuery({
    queryKey: ['/api/notebooks'],
    queryFn: async () => {
      const notebooks = await notebooksApi.list();
      setNotebooks(notebooks);
      return notebooks;
    },
    enabled: isOpen
  });

  // Create notebook mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateNotebookData) => notebooksApi.create(data),
    onSuccess: (newNotebook) => {
      addNotebook(newNotebook);
      
      // Automatically set the new notebook as active
      setActiveNotebook(newNotebook.id);
      
      setCreateForm({ name: "", description: "", imageUrl: "" });
      setIsCreateOpen(false);
      
      // Invalidate notebook queries to ensure all components get fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/notebooks'] });
      
      toast({
        title: "Notebook Created",
        description: `"${newNotebook.name}" is now your active notebook.`
      });
      
      // Call callback if provided (for auto-open from ContentTypeModal)
      if (onNotebookCreated) {
        // Use requestAnimationFrame to ensure the create dialog fully unmounts
        // before calling the callback, which prevents DOM ghosting
        requestAnimationFrame(() => {
          onNotebookCreated(newNotebook);
          onClose();
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create notebook. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update notebook mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotebookData }) => 
      notebooksApi.update(id, data),
    onSuccess: (updatedNotebook) => {
      updateNotebook(updatedNotebook.id, updatedNotebook);
      setEditingNotebook(null);
      setEditForm({ name: "", description: "", imageUrl: "" });
      
      // Invalidate notebook queries to ensure all components get fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/notebooks'] });
      
      toast({
        title: "Notebook Updated",
        description: `"${updatedNotebook.name}" has been updated successfully.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notebook. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete notebook mutation
  const deleteMutation = useMutation({
    mutationFn: (notebookId: string) => notebooksApi.delete(notebookId),
    onSuccess: (_, notebookId) => {
      removeNotebook(notebookId);
      setDeletingNotebook(null);
      
      // Invalidate notebook queries to ensure all components get fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/notebooks'] });
      
      toast({
        title: "Notebook Deleted",
        description: "The notebook has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete notebook. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast({
        title: "Error",
        description: "Notebook name is required.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user can create a notebook
    const limitCheck = await checkLimit('create_notebook');
    if (!limitCheck.allowed) {
      setShowUpgradePrompt(true);
      return;
    }
    
    createMutation.mutate(createForm);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editingNotebook) return;
    updateMutation.mutate({ id: editingNotebook.id, data: editForm });
  };

  const handleEditClick = (notebook: Notebook) => {
    setEditingNotebook(notebook);
    setEditForm({ 
      name: notebook.name, 
      description: notebook.description || "", 
      imageUrl: notebook.imageUrl || "" 
    });
  };

  const handleDeleteClick = (notebook: Notebook) => {
    setDeletingNotebook(notebook);
  };

  const handleSetActive = (notebook: Notebook) => {
    setActiveNotebook(notebook.id);
    toast({
      title: "Active Notebook Changed",
      description: `"${notebook.name}" is now your active notebook.`
    });
  };

  // Filter notebooks based on active tab
  const ownedNotebooks = notebooks.filter(n => !(n as any).isShared);
  const sharedNotebooks = notebooks.filter(n => (n as any).isShared);
  const displayedNotebooks = activeTab === 'owned' ? ownedNotebooks : sharedNotebooks;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-serif flex items-center gap-2">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              Manage Notebooks
            </DialogTitle>
            <DialogDescription className="text-sm">
              Create and organize your writing notebooks. Each notebook is a separate world for your stories and characters.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Tabs and Create Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === 'owned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('owned')}
                  data-testid="button-tab-owned"
                >
                  My Notebooks ({ownedNotebooks.length})
                </Button>
                <Button
                  variant={activeTab === 'shared' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('shared')}
                  data-testid="button-tab-shared"
                >
                  Shared with Me ({sharedNotebooks.length})
                </Button>
              </div>
              <Button 
                onClick={() => setIsCreateOpen(true)}
                data-testid="button-create-notebook"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Notebook
              </Button>
            </div>

            {/* Notebooks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {isLoading ? (
                <>
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse overflow-hidden">
                      <div className="aspect-video bg-muted"></div>
                      <CardContent className="p-4">
                        <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : displayedNotebooks.length === 0 ? (
                <div className="col-span-full">
                  <Card className="text-center py-8">
                    <CardContent>
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        {activeTab === 'owned' ? 'No notebooks yet' : 'No shared notebooks'}
                      </p>
                      {activeTab === 'owned' && (
                        <Button onClick={() => setIsCreateOpen(true)}>
                          Create Your First Notebook
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                displayedNotebooks.map((notebook) => (
                  <Card 
                    key={notebook.id} 
                    className={`group overflow-hidden hover-elevate cursor-pointer transition-all ${
                      activeNotebookId === notebook.id ? 'ring-2 ring-primary' : ''
                    }`}
                    data-testid={`card-notebook-${notebook.id}`}
                    onClick={() => handleSetActive(notebook)}
                  >
                    {/* Thumbnail Image or Fallback */}
                    <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden" data-testid={`thumbnail-notebook-${notebook.id}`}>
                      {notebook.imageUrl ? (
                        <img 
                          src={notebook.imageUrl} 
                          alt={notebook.name}
                          className="w-full h-full object-cover"
                          data-testid={`img-notebook-${notebook.id}`}
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-muted-foreground" data-testid={`icon-fallback-notebook-${notebook.id}`} />
                      )}
                      {/* Active Badge Overlay */}
                      {activeNotebookId === notebook.id && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="default" data-testid="badge-active-notebook" className="text-xs flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Active
                          </Badge>
                        </div>
                      )}
                      {/* Shared Badge Overlay */}
                      {(notebook as any).isShared && (
                        <div className={`absolute top-2 ${activeNotebookId === notebook.id ? 'right-20' : 'right-2'}`}>
                          <Badge variant="secondary" data-testid={`badge-shared-notebook-${notebook.id}`} className="text-xs">
                            Shared
                          </Badge>
                        </div>
                      )}
                      {/* Read-Only Badge for view-only shared items */}
                      {(notebook as any).isShared && (notebook as any).sharePermission === 'view' && (
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="outline" data-testid={`badge-readonly-notebook-${notebook.id}`} className="text-xs">
                            Read-Only
                          </Badge>
                        </div>
                      )}
                      {/* Action Buttons Overlay */}
                      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Share button only for owned notebooks */}
                        {!(notebook as any).isShared && (
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSharingNotebook(notebook);
                            }}
                            data-testid={`button-share-notebook-${notebook.id}`}
                            title="Share notebook"
                            className="h-8 w-8"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Edit/Delete buttons only for owned notebooks or edit permission */}
                        {(!(notebook as any).isShared || (notebook as any).sharePermission === 'edit') && (
                          <>
                            <Button
                              size="icon"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(notebook);
                              }}
                              data-testid={`button-edit-notebook-${notebook.id}`}
                              title="Edit notebook"
                              className="h-8 w-8"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {!(notebook as any).isShared && (
                              <Button
                                size="icon"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(notebook);
                                }}
                                data-testid={`button-delete-notebook-${notebook.id}`}
                                title="Delete notebook"
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Notebook Info */}
                    <CardContent className="p-4">
                      <CardTitle className="text-lg font-serif truncate mb-1">{notebook.name}</CardTitle>
                      {notebook.description && (
                        <CardDescription className="text-sm line-clamp-2 mb-2">
                          {notebook.description}
                        </CardDescription>
                      )}
                      {(notebook as any).isShared && (notebook as any).sharedBy && (
                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <span>Shared by {(notebook as any).sharedBy.firstName || (notebook as any).sharedBy.email}</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {(notebook as any).sharePermission}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="truncate">Created {formatDistance(new Date(notebook.createdAt), new Date(), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Notebook Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
            <DialogDescription>
              Give your notebook a name and optional description to organize your writing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Epic Fantasy World"
                data-testid="input-create-notebook-name"
                required
              />
            </div>
            <div>
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A world of magic and adventure..."
                data-testid="textarea-create-notebook-description"
                rows={3}
              />
            </div>
            <div>
              <ImageUpload
                label="Thumbnail Image (Optional)"
                value={createForm.imageUrl}
                onChange={(url) => setCreateForm(prev => ({ ...prev, imageUrl: url }))}
                accept="image/jpeg,image/png,image/webp"
                maxFileSize={5}
                disabled={createMutation.isPending}
                visibility="public"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                data-testid="button-submit-create-notebook"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Notebook'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Notebook Dialog */}
      <Dialog open={!!editingNotebook} onOpenChange={(open) => !open && setEditingNotebook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notebook</DialogTitle>
            <DialogDescription>
              Update your notebook's name and description.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Epic Fantasy World"
                data-testid="input-edit-notebook-name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A world of magic and adventure..."
                data-testid="textarea-edit-notebook-description"
                rows={3}
              />
            </div>
            <div>
              <ImageUpload
                label="Thumbnail Image (Optional)"
                value={editForm.imageUrl}
                onChange={(url) => setEditForm(prev => ({ ...prev, imageUrl: url }))}
                accept="image/jpeg,image/png,image/webp"
                maxFileSize={5}
                disabled={updateMutation.isPending}
                visibility="public"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingNotebook(null)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                data-testid="button-submit-edit-notebook"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Notebook'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingNotebook} onOpenChange={(open) => !open && setDeletingNotebook(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notebook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingNotebook?.name}"? This action cannot be undone and will remove all content in this notebook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingNotebook && deleteMutation.mutate(deletingNotebook.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Notebook'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      {sharingNotebook && (
        <ShareDialog
          open={!!sharingNotebook}
          onOpenChange={(open) => !open && setSharingNotebook(null)}
          resourceType="notebook"
          resourceId={sharingNotebook.id}
          resourceName={sharingNotebook.name}
          ownerId={sharingNotebook.userId}
        />
      )}

      {/* Upgrade Prompt */}
      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        title="Upgrade to Create More Notebooks"
        description="You've reached the limit for notebooks on your current plan. Upgrade to create unlimited notebooks and unlock more features."
        feature="notebooks"
      />
    </>
  );
}