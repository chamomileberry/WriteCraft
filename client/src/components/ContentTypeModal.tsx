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
import { Search, BookOpen, AlertCircle } from "lucide-react";
import { CONTENT_TYPES, type ContentType } from "@/config/content-types";
import { useNotebookStore } from "@/stores/notebookStore";

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
  
  const { notebooks, activeNotebookId, getActiveNotebook } = useNotebookStore();
  
  // Auto-select active notebook when modal opens
  useEffect(() => {
    if (isOpen && activeNotebookId) {
      setSelectedNotebookId(activeNotebookId);
    }
  }, [isOpen, activeNotebookId]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] sm:max-h-[80vh] max-sm:max-h-none h-[100vh] sm:h-auto w-[100vw] sm:w-auto overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Create New Content</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Notebook Selection */}
          <div className="space-y-2">
            <Label htmlFor="notebook-select" className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Save to Notebook
            </Label>
            {notebooks.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  No notebooks available. Create a notebook first to organize your content.
                </span>
              </div>
            ) : (
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
            )}
            {!selectedNotebookId && notebooks.length > 0 && (
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
                  disabled={notebooks.length === 0 || !selectedNotebookId}
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
  );
}