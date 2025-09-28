import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Plus } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: string;
  subtitle?: string;
  description?: string;
}

interface ContentSearchProps {
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  onSearchChange: (query: string) => void;
  onInsertLink: (item: SearchResult) => void;
  onOpenInPanel: (item: SearchResult) => void;
}

export function ContentSearch({
  searchQuery,
  searchResults,
  isSearching,
  onSearchChange,
  onInsertLink,
  onOpenInPanel,
}: ContentSearchProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search content to open in tabs..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-64"
        data-testid="input-search-content"
      />
      
      {/* Search Results Dropdown */}
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 z-50 border-b bg-muted/40 max-h-32 overflow-y-auto">
          <div className="p-2">
            {isSearching ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.slice(0, 5).map((item: SearchResult) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between p-2 rounded-md border hover-elevate"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onInsertLink(item)}
                        className="h-6 w-6 p-0"
                        title="Insert as link"
                        data-testid={`button-insert-link-${item.type}-${item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenInPanel(item)}
                        className="h-6 w-6 p-0"
                        title="Open in panel"
                        data-testid={`button-open-panel-${item.type}-${item.id}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">No results found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}