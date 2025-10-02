import { useState } from "react";
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
import { Plus, Edit2, Trash2, BookOpen, Calendar } from "lucide-react";
import { useNotebookStore, type Notebook } from "@/stores/notebookStore";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

interface NotebookManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateNotebookData {
  name: string;
  description?: string;
}

interface UpdateNotebookData {
  name: string;
  description?: string;
}

export default function NotebookManager({ isOpen, onClose }: NotebookManagerProps) {
  const { toast } = useToast();
  const { 
    notebooks, 
    activeNotebookId, 
    setNotebooks, 
    addNotebook, 
    updateNotebook, 
    removeNotebook, 
    setActiveNotebook 
  } = useNotebookStore();

  // Local state for modals and forms
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [deletingNotebook, setDeletingNotebook] = useState<Notebook | null>(null);
  const [createForm, setCreateForm] = useState<CreateNotebookData>({ name: "", description: "" });
  const [editForm, setEditForm] = useState<UpdateNotebookData>({ name: "", description: "" });

  // Fetch notebooks
  const { isLoading, error } = useQuery({
    queryKey: ['/api/notebooks'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notebooks');
      const notebooks = await response.json() as Notebook[];
      setNotebooks(notebooks);
      return notebooks;
    },
    enabled: isOpen
  });

  // Create notebook mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateNotebookData) => {
      const response = await apiRequest('POST', '/api/notebooks', data);
      return response.json() as Promise<Notebook>;
    },
    onSuccess: (newNotebook) => {
      addNotebook(newNotebook);
      
      // Automatically set the new notebook as active
      setActiveNotebook(newNotebook.id);
      
      setCreateForm({ name: "", description: "" });
      setIsCreateOpen(false);
      
      // Invalidate notebook queries to ensure all components get fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/notebooks'] });
      
      toast({
        title: "Notebook Created",
        description: `"${newNotebook.name}" is now your active notebook.`
      });
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateNotebookData }) => {
      const response = await apiRequest('PUT', `/api/notebooks/${id}`, data);
      return response.json() as Promise<Notebook>;
    },
    onSuccess: (updatedNotebook) => {
      updateNotebook(updatedNotebook.id, updatedNotebook);
      setEditingNotebook(null);
      setEditForm({ name: "", description: "" });
      
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
    mutationFn: async (notebookId: string) => {
      const response = await apiRequest('DELETE', `/api/notebooks/${notebookId}`);
      return response.json();
    },
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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast({
        title: "Error",
        description: "Notebook name is required.",
        variant: "destructive"
      });
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
    setEditForm({ name: notebook.name, description: notebook.description || "" });
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
            {/* Create New Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {notebooks.length} notebook{notebooks.length !== 1 ? 's' : ''}
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

            {/* Notebooks List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-5 bg-muted rounded w-32"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-muted rounded w-48"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : notebooks.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No notebooks yet</p>
                    <Button onClick={() => setIsCreateOpen(true)}>
                      Create Your First Notebook
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                notebooks.map((notebook) => (
                  <Card 
                    key={notebook.id} 
                    className={`hover-elevate transition-colors ${
                      activeNotebookId === notebook.id ? 'ring-2 ring-primary' : ''
                    }`}
                    data-testid={`card-notebook-${notebook.id}`}
                  >
                    <CardHeader className="pb-2 space-y-2 px-3 sm:px-6 pt-3 sm:pt-6">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                          <CardTitle className="text-base sm:text-lg font-serif truncate">{notebook.name}</CardTitle>
                          {activeNotebookId === notebook.id && (
                            <Badge variant="default" data-testid="badge-active-notebook" className="shrink-0 text-xs hidden sm:inline-flex">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(notebook)}
                            data-testid={`button-edit-notebook-${notebook.id}`}
                            title="Edit notebook"
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(notebook)}
                            data-testid={`button-delete-notebook-${notebook.id}`}
                            title="Delete notebook"
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {activeNotebookId === notebook.id && (
                        <Badge variant="default" data-testid="badge-active-notebook-mobile" className="shrink-0 text-xs w-fit sm:hidden">Active</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      {notebook.description && (
                        <CardDescription className="mb-2 text-sm">{notebook.description}</CardDescription>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span className="truncate">Created {formatDistance(new Date(notebook.createdAt), new Date(), { addSuffix: true })}</span>
                        </div>
                        {activeNotebookId !== notebook.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetActive(notebook)}
                            data-testid={`button-activate-notebook-${notebook.id}`}
                            className="shrink-0 text-xs h-7"
                          >
                            Set Active
                          </Button>
                        )}
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
    </>
  );
}