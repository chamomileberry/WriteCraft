import { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { CONTENT_TYPES, type ContentType } from "@/config/content-types";

// Content types moved to centralized config

interface ContentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (contentType: string) => void;
}

export default function ContentTypeModal({ isOpen, onClose, onSelectType }: ContentTypeModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    onSelectType(contentType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Create New Content</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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