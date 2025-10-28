import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Header from "@/components/Header";
import { Loader2, Plus, Pencil, Trash2, GripVertical, ChevronRight, ChevronDown } from "lucide-react";
import { ReactSortable } from "react-sortablejs";

interface GuideCategory {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  children: GuideCategory[];
}

interface CategoryFormData {
  name: string;
  parentId: string | null;
}

export default function GuideCategoriesAdmin() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<{ id: string; name: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<GuideCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [localCategories, setLocalCategories] = useState<GuideCategory[]>([]);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    parentId: null,
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  // Fetch all categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<GuideCategory[]>({
    queryKey: ['/api/guide-categories'],
    enabled: !!user?.isAdmin,
  });

  // Sync local state with query data
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await apiRequest('POST', '/api/guide-categories', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guide-categories'] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', parentId: null });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const res = await apiRequest('PUT', `/api/guide-categories/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guide-categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', parentId: null });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/guide-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guide-categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setDeleteDialogData(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
      setDeleteDialogData(null);
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (categoryOrders: Array<{ id: string; order: number }>) => {
      await apiRequest('POST', '/api/guide-categories/reorder', { categoryOrders });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guide-categories'] });
    },
    onError: (error: Error) => {
      // Refetch to revert optimistic update on failure
      queryClient.invalidateQueries({ queryKey: ['/api/guide-categories'] });
      toast({
        title: "Error",
        description: error.message || "Failed to reorder categories",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (category: GuideCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parentId: category.parentId,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingCategory) return;
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ id: editingCategory.id, data: formData });
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteDialogData({ id, name });
  };

  const confirmDelete = () => {
    if (deleteDialogData) {
      deleteMutation.mutate(deleteDialogData.id);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Flatten categories for parent selection dropdown
  const flattenCategories = (cats: GuideCategory[], level = 0): Array<{ id: string; name: string; level: number }> => {
    let result: Array<{ id: string; name: string; level: number }> = [];
    for (const cat of cats) {
      result.push({ id: cat.id, name: cat.name, level });
      if (cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  };

  // Get all descendant IDs for a category (to prevent cycles when editing parent)
  const getDescendantIds = (categoryId: string, cats: GuideCategory[]): Set<string> => {
    const descendants = new Set<string>();
    
    const findAndAddDescendants = (id: string, categories: GuideCategory[]) => {
      for (const cat of categories) {
        if (cat.id === id) {
          descendants.add(cat.id);
          cat.children.forEach(child => {
            findAndAddDescendants(child.id, [child]);
          });
        } else if (cat.children.length > 0) {
          findAndAddDescendants(id, cat.children);
        }
      }
    };
    
    findAndAddDescendants(categoryId, cats);
    return descendants;
  };

  const flatCategories = flattenCategories(localCategories);
  const editingDescendants = editingCategory ? getDescendantIds(editingCategory.id, localCategories) : new Set();

  // Update nested children in tree
  const updateCategoryChildren = (
    tree: GuideCategory[],
    targetParentId: string | null,
    newChildren: GuideCategory[]
  ): GuideCategory[] => {
    if (targetParentId === null) {
      return newChildren;
    }
    return tree.map(cat => {
      if (cat.id === targetParentId) {
        return { ...cat, children: newChildren };
      }
      if (cat.children.length > 0) {
        return {
          ...cat,
          children: updateCategoryChildren(cat.children, targetParentId, newChildren)
        };
      }
      return cat;
    });
  };

  // Handle drag-and-drop reordering
  // Note: Drag-and-drop only supports reordering within the same parent level.
  // To move a category to a different parent, use the Edit dialog.
  const handleReorder = (newList: GuideCategory[], parentId: string | null) => {
    // Update local state immediately for responsive UI
    setLocalCategories(prevCategories => {
      return updateCategoryChildren(prevCategories, parentId, newList);
    });

    // Fire mutation to persist changes (only updates order, not parentId)
    const categoryOrders = newList.map((cat, index) => ({
      id: cat.id,
      order: index,
    }));
    reorderMutation.mutate(categoryOrders);
  };

  // Render category tree recursively
  const renderCategoryTree = (cats: GuideCategory[], parentId: string | null, level = 0): JSX.Element => {
    return (
      <ReactSortable
        list={cats}
        setList={(newList) => handleReorder(newList, parentId)}
        handle=".drag-handle"
        animation={200}
        className="space-y-2"
      >
        {cats.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const hasChildren = category.children.length > 0;

          return (
            <div key={category.id} className="space-y-2">
              <div
                className="flex items-center gap-2 p-3 rounded-lg border bg-card hover-elevate"
                style={{ marginLeft: `${level * 24}px` }}
              >
                <div className="drag-handle cursor-move" data-testid={`drag-handle-${category.id}`}>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleExpanded(category.id)}
                    data-testid={`button-toggle-${category.id}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {!hasChildren && <div className="w-6" />}

                <span className="flex-1 font-medium" data-testid={`text-category-${category.id}`}>
                  {category.name}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                    data-testid={`button-edit-${category.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id, category.name)}
                    data-testid={`button-delete-${category.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {hasChildren && isExpanded && (
                <div>
                  {renderCategoryTree(category.children, category.id, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </ReactSortable>
    );
  };

  if (authLoading || categoriesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle data-testid="text-page-title">Guide Categories</CardTitle>
                  <CardDescription>
                    Manage hierarchical categories for organizing writing guides
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  data-testid="button-create-category"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {localCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No categories yet. Create your first category to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {renderCategoryTree(localCategories, null)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-category">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new guide category. You can nest it under an existing category if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Category Name</Label>
              <Input
                id="create-name"
                data-testid="input-category-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Writing Craft"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-parent">Parent Category (Optional)</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? null : value })}
              >
                <SelectTrigger id="create-parent" data-testid="select-parent-category">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (top level)</SelectItem>
                  {flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {'  '.repeat(cat.level) + cat.name}
                    </SelectItem>
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
                setFormData({ name: '', parentId: null });
              }}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              data-testid="button-confirm-create"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-category">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name or move it to a different parent.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                data-testid="input-edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Writing Craft"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-parent">Parent Category (Optional)</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? null : value })}
              >
                <SelectTrigger id="edit-parent" data-testid="select-edit-parent">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (top level)</SelectItem>
                  {flatCategories
                    .filter((cat) => !editingDescendants.has(cat.id))
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.level) + cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingCategory(null);
                setFormData({ name: '', parentId: null });
              }}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              data-testid="button-confirm-edit"
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteDialogData}
        onOpenChange={(open) => !open && setDeleteDialogData(null)}
      >
        <AlertDialogContent data-testid="dialog-delete-category">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialogData?.name}"? This will also delete all subcategories. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover-elevate"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
