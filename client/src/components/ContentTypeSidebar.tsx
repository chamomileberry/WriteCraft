import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONTENT_TYPE_ICONS, CONTENT_TYPES } from "@/config/content-types";
import { cn } from "@/lib/utils";

interface SavedItem {
  id: string;
  userId: string;
  notebookId?: string;
  itemType?: string;
  contentType?: string;
  itemId?: string;
  contentId?: string;
  title?: string;
  content?: string;
  itemData?: any;
  metadata?: any;
  createdAt: string;
}

interface ContentTypeSidebarProps {
  items: SavedItem[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  className?: string;
}

interface ContentTypeGroup {
  category: string;
  types: {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }[];
}

export default function ContentTypeSidebar({
  items,
  selectedType,
  onSelectType,
  className
}: ContentTypeSidebarProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Group items by content type and category
  const groupedTypes = useMemo(() => {
    const typeMap = new Map<string, number>();
    
    // Count items by type
    items.forEach(item => {
      const itemType = item.itemType || item.contentType || 'unknown';
      typeMap.set(itemType, (typeMap.get(itemType) || 0) + 1);
    });

    // Create grouped structure by category
    const categoryMap = new Map<string, ContentTypeGroup['types']>();
    
    CONTENT_TYPES.forEach(contentType => {
      const count = typeMap.get(contentType.id) || 0;
      
      if (!categoryMap.has(contentType.category)) {
        categoryMap.set(contentType.category, []);
      }
      
      categoryMap.get(contentType.category)!.push({
        id: contentType.id,
        name: contentType.name,
        icon: contentType.icon,
        count
      });
    });

    // Convert to array and sort by category
    const groups: ContentTypeGroup[] = Array.from(categoryMap.entries())
      .map(([category, types]) => ({
        category,
        types: types.sort((a, b) => b.count - a.count) // Sort by count descending
      }))
      .sort((a, b) => {
        // Calculate total count for each category
        const aTotal = a.types.reduce((sum, t) => sum + t.count, 0);
        const bTotal = b.types.reduce((sum, t) => sum + t.count, 0);
        return bTotal - aTotal; // Sort categories by total count descending
      });

    return groups;
  }, [items]);

  const toggleCategoryCollapse = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const handleTypeClick = (typeId: string) => {
    if (selectedType === typeId) {
      onSelectType(null); // Deselect if already selected
    } else {
      onSelectType(typeId);
    }
  };

  const totalCount = items.length;

  return (
    <div className={cn("flex flex-col h-full border-r bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Content Types</h2>
          <Badge variant="secondary" className="text-xs">
            {totalCount}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Filter by content type
        </p>
      </div>

      {/* Content Type List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Show All button */}
          <Button
            variant={selectedType === null ? "default" : "ghost"}
            className="w-full justify-between h-auto py-2"
            onClick={() => onSelectType(null)}
            data-testid="button-show-all-types"
          >
            <span className="text-sm font-medium">All Content</span>
            <Badge variant="secondary" className="ml-2">
              {totalCount}
            </Badge>
          </Button>

          {/* Grouped by Category */}
          {groupedTypes.map(group => {
            const categoryTotal = group.types.reduce((sum, t) => sum + t.count, 0);
            const isCategoryCollapsed = collapsedCategories.has(group.category);
            
            // Only show categories that have items
            if (categoryTotal === 0) return null;

            return (
              <div key={group.category} className="space-y-0.5">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategoryCollapse(group.category)}
                  className="w-full flex items-center justify-between px-2 py-1.5 hover-elevate rounded-md transition-all"
                  data-testid={`button-category-${group.category.toLowerCase()}`}
                >
                  <div className="flex items-center gap-2">
                    {isCategoryCollapsed ? (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs font-semibold text-muted-foreground">
                      {group.category}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {categoryTotal}
                  </Badge>
                </button>

                {/* Types in Category */}
                {!isCategoryCollapsed && group.types.map(type => {
                  if (type.count === 0) return null;
                  
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;

                  return (
                    <div key={type.id} className="ml-4">
                      <Button
                        variant={isSelected ? "secondary" : "ghost"}
                        className="w-full justify-start h-auto py-1.5 px-2"
                        onClick={() => handleTypeClick(type.id)}
                        data-testid={`button-type-${type.id}`}
                      >
                        <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm flex-1 text-left truncate">{type.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {type.count}
                        </Badge>
                      </Button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
