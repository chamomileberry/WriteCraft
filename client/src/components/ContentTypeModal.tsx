import { useState, useMemo, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen, AlertCircle, Settings } from "lucide-react";
import { CONTENT_TYPES, type ContentType } from "@/config/content-types";
import { useNotebookStore } from "@/stores/notebookStore";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Notebook } from "@/stores/notebookStore";
import NotebookManager from "@/components/NotebookManager";

// Content types moved to centralized config

interface ContentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (contentType: string, notebookId?: string) => void;
}

export default function ContentTypeModal({ isOpen, onClose, onSelectType }: ContentTypeModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>("");
  const [isNotebookManagerOpen, setIsNotebookManagerOpen] = useState(false);
  
  const { notebooks, activeNotebookId, getActiveNotebook, setNotebooks } = useNotebookStore();
  
  // Fetch notebooks when modal opens
  const { data: fetchedNotebooks, isLoading: isLoadingNotebooks, error: notebooksError, refetch } = useQuery({
    queryKey: ['/api/notebooks'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notebooks');
      const data = await response.json() as Notebook[];
      return data;
    },
    enabled: isOpen,
    retry: 1
  });
  
  // Update store when notebooks are fetched
  useEffect(() => {
    if (fetchedNotebooks) {
      setNotebooks(fetchedNotebooks);
    }
  }, [fetchedNotebooks, setNotebooks]);
  
  // Auto-select active notebook when modal opens
  useEffect(() => {
    if (isOpen && activeNotebookId) {
      setSelectedNotebookId(activeNotebookId);
    }
  }, [isOpen, activeNotebookId]);
  
  // Auto-open NotebookManager when no notebooks exist
  useEffect(() => {
    if (isOpen && !isLoadingNotebooks && fetchedNotebooks && fetchedNotebooks.length === 0) {
      setIsNotebookManagerOpen(true);
    }
  }, [isOpen, isLoadingNotebooks, fetchedNotebooks]);

  const categories = Array.from(new Set(CONTENT_TYPES.map(type => type.category)));
  
  // Memoize expensive filtering operation for performance
  const filteredTypes = useMemo(() => 
    CONTENT_TYPES.filter(type => {
      const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           type.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || type.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
    [searchQuery, selectedCategory]
  );

  const handleSelectType = (contentType: string) => {
    // Pass the selected notebook ID along with the content type
    onSelectType(contentType, selectedNotebookId || undefined);
    onClose();
    // Reset form
    setSelectedNotebookId("");
    setSearchQuery("");
    setSelectedCategory(null);
  };
  
  const handleNotebookCreated = (notebook: Notebook) => {
    // Auto-select the newly created notebook
    setSelectedNotebookId(notebook.id);
    // Close NotebookManager to return to ContentTypeModal
    setIsNotebookManagerOpen(false);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] sm:max-h-[80vh] max-sm:max-h-none h-[100vh] sm:h-auto w-[100vw] sm:w-auto overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Create New Content</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Notebook Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notebook-select" className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Save to Notebook
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotebookManagerOpen(true)}
                className="h-8 px-2"
                data-testid="button-manage-notebooks"
                title="Manage Notebooks"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            {isLoadingNotebooks && notebooks.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                <span className="text-sm text-muted-foreground">
                  Loading notebooks...
                </span>
              </div>
            ) : notebooksError && notebooks.length === 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm text-destructive flex-1">
                    Failed to load notebooks. Please check your connection.
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetch()}
                    data-testid="button-retry-notebooks"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : notebooks.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  No notebooks available. Create a notebook first to organize your content.
                </span>
              </div>
            ) : (
              <>
                {notebooksError && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <span className="text-sm text-destructive flex-1">
                      Failed to refresh notebooks. Using cached data.
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refetch()}
                      data-testid="button-retry-notebooks-refresh"
                    >
                      Retry
                    </Button>
                  </div>
                )}
                <Select value={selectedNotebookId} onValueChange={setSelectedNotebookId}>
                  <SelectTrigger data-testid="select-content-notebook">
                    <SelectValue placeholder="Choose a notebook..." />
                  </SelectTrigger>
                  <SelectContent>
                    {notebooks.map((notebook) => (
                      <SelectItem key={notebook.id} value={notebook.id} data-testid={`select-notebook-${notebook.id}`}>
                        <div className="flex flex-col">
                          <span className="font-medium">{notebook.name}</span>
                          {notebook.description && (
                            <span className="text-xs text-muted-foreground">
                              {notebook.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            {!selectedNotebookId && notebooks.length > 0 && !isLoadingNotebooks && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span>Please select a notebook to organize your new content.</span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-content-search"
              autoFocus
            />
          </div>


          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              data-testid="button-category-all"
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`button-category-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Content Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredTypes.map(type => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover-elevate"
                  onClick={() => handleSelectType(type.id)}
                  disabled={isLoadingNotebooks || notebooks.length === 0 || !selectedNotebookId}
                  data-testid={`button-content-type-${type.id}`}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <span className="font-medium">{type.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {type.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    {type.description}
                  </p>
                </Button>
              );
            })}
          </div>

          {filteredTypes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No content types found matching your search.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Notebook Manager Modal */}
    <NotebookManager 
      isOpen={isNotebookManagerOpen} 
      onClose={() => setIsNotebookManagerOpen(false)}
      onNotebookCreated={handleNotebookCreated}
    />
  </>
  );
}