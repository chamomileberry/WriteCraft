import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { type BannedPhrase } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BannedPhrasesManagement() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState<BannedPhrase | null>(null);
  const [formData, setFormData] = useState({
    category: "forbidden",
    phrase: "",
    isActive: true,
  });

  // Fetch banned phrases
  const { data: phrases, isLoading } = useQuery<BannedPhrase[]>({
    queryKey: ["/api/admin/banned-phrases"],
    enabled: !!user && !authLoading,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest(
        "POST",
        "/api/admin/banned-phrases",
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Phrase Added",
        description: "The banned phrase has been successfully added.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/banned-phrases"],
      });
      closeDialog();
    },
    onError: () => {
      toast({
        title: "Failed to Add",
        description: "Failed to add banned phrase. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<typeof formData>;
    }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/banned-phrases/${id}`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Phrase Updated",
        description: "The banned phrase has been successfully updated.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/banned-phrases"],
      });
      closeDialog();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update banned phrase. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/banned-phrases/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Phrase Deleted",
        description: "The banned phrase has been successfully deleted.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/banned-phrases"],
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete banned phrase. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/banned-phrases/${id}`,
        { isActive },
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/banned-phrases"],
      });
    },
    onError: () => {
      toast({
        title: "Toggle Failed",
        description: "Failed to toggle phrase status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const openCreateDialog = () => {
    setEditingPhrase(null);
    setFormData({
      category: "forbidden",
      phrase: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (phrase: BannedPhrase) => {
    setEditingPhrase(phrase);
    setFormData({
      category: phrase.category,
      phrase: phrase.phrase,
      isActive: phrase.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPhrase(null);
    setFormData({
      category: "forbidden",
      phrase: "",
      isActive: true,
    });
  };

  const handleSubmit = () => {
    if (!formData.phrase.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a phrase.",
        variant: "destructive",
      });
      return;
    }

    if (editingPhrase) {
      updateMutation.mutate({ id: editingPhrase.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this banned phrase?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter phrases
  const filteredPhrases =
    phrases?.filter((phrase) => {
      const matchesSearch = phrase.phrase
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || phrase.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  // Stats
  const stats = {
    total: phrases?.length || 0,
    active: phrases?.filter((p) => p.isActive).length || 0,
    inactive: phrases?.filter((p) => !p.isActive).length || 0,
    forbidden: phrases?.filter((p) => p.category === "forbidden").length || 0,
    transition: phrases?.filter((p) => p.category === "transition").length || 0,
  };

  if (authLoading) return null;

  if (!user || user.isAdmin !== true) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Alert variant="destructive">
            <AlertDescription>
              You must be an admin to access this page.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="mt-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            size="sm"
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" data-testid="heading-title">
                Banned Phrases Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage AI writing style guidelines and banned clichés
              </p>
            </div>
            <Button onClick={openCreateDialog} data-testid="button-add-phrase">
              <Plus className="h-4 w-4 mr-2" />
              Add Phrase
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Phrases</CardDescription>
              <CardTitle className="text-2xl" data-testid="stat-total">
                {stats.total}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active</CardDescription>
              <CardTitle
                className="text-2xl text-green-600"
                data-testid="stat-active"
              >
                {stats.active}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Inactive</CardDescription>
              <CardTitle
                className="text-2xl text-muted-foreground"
                data-testid="stat-inactive"
              >
                {stats.inactive}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Forbidden</CardDescription>
              <CardTitle className="text-2xl" data-testid="stat-forbidden">
                {stats.forbidden}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Transitions</CardDescription>
              <CardTitle className="text-2xl" data-testid="stat-transition">
                {stats.transition}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search phrases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48" data-testid="select-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="forbidden">Forbidden</SelectItem>
              <SelectItem value="transition">Transition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Phrases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Banned Phrases ({filteredPhrases.length})</CardTitle>
            <CardDescription>
              These phrases will be automatically avoided by AI generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : filteredPhrases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No phrases found.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPhrases.map((phrase) => (
                  <div
                    key={phrase.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                    data-testid={`phrase-item-${phrase.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Switch
                        checked={phrase.isActive ?? true}
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({
                            id: phrase.id,
                            isActive: checked,
                          })
                        }
                        data-testid={`switch-active-${phrase.id}`}
                      />
                      <div className="flex-1">
                        <div
                          className="font-medium"
                          data-testid={`text-phrase-${phrase.id}`}
                        >
                          {phrase.phrase}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            data-testid={`badge-category-${phrase.id}`}
                          >
                            {phrase.category}
                          </Badge>
                          {!phrase.isActive && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(phrase)}
                        data-testid={`button-edit-${phrase.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(phrase.id)}
                        data-testid={`button-delete-${phrase.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent data-testid="dialog-phrase-form">
            <DialogHeader>
              <DialogTitle data-testid="dialog-title">
                {editingPhrase ? "Edit Banned Phrase" : "Add Banned Phrase"}
              </DialogTitle>
              <DialogDescription>
                {editingPhrase
                  ? "Update the banned phrase details below."
                  : "Add a new phrase to avoid in AI-generated content."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phrase">Phrase</Label>
                <Input
                  id="phrase"
                  value={formData.phrase}
                  onChange={(e) =>
                    setFormData({ ...formData, phrase: e.target.value })
                  }
                  placeholder="e.g., delve into"
                  data-testid="input-phrase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger
                    id="category"
                    data-testid="select-category-form"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forbidden">Forbidden Phrase</SelectItem>
                    <SelectItem value="transition">Transition Word</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                  data-testid="switch-is-active"
                />
                <Label htmlFor="is-active">
                  Active (will be used in AI prompts)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeDialog}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save"
              >
                {editingPhrase ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
