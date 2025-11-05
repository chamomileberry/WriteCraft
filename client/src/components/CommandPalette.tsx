import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { getMappingById } from "@shared/contentTypes";
import { CONTENT_TYPE_ICONS } from "@/config/content-types";
import { GENERATORS } from "@/components/GeneratorDropdown";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Loader2, Command } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  category?: string;
  content?: string;
  notebookId?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGenerator?: (generatorId: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onSelectGenerator,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter generators based on search query
  const filteredGenerators = query.trim()
    ? GENERATORS.filter((gen) =>
        gen.label.toLowerCase().includes(query.toLowerCase()),
      )
    : GENERATORS;

  // Search API call
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  // Group results by type and limit to 5 per category
  const groupedResults: Record<string, SearchResult[]> = searchResults.reduce(
    (acc: Record<string, SearchResult[]>, result: SearchResult) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      if (acc[result.type].length < 5) {
        acc[result.type].push(result);
      }
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );

  // Flatten for keyboard navigation
  const allResults = Object.values(groupedResults).flat() as SearchResult[];

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Global keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        handleResultClick(allResults[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    },
    [selectedIndex, allResults, onOpenChange],
  );

  const handleResultClick = (result: SearchResult) => {
    // Build URL with notebookId if available
    const notebookParam = result.notebookId
      ? `?notebookId=${result.notebookId}`
      : "";

    // Navigate based on content type
    switch (result.type) {
      case "guide":
        setLocation(`/guides/${result.id}`);
        break;
      case "manuscript":
        setLocation(`/manuscripts/${result.id}/edit${notebookParam}`);
        break;
      case "project":
        setLocation(`/projects/${result.id}`);
        break;
      default:
        const mapping = getMappingById(result.type);
        if (mapping) {
          setLocation(
            `/editor/${mapping.urlSegment}/${result.id}${notebookParam}`,
          );
        } else {
          setLocation("/notebook");
        }
    }
    onOpenChange(false);
  };

  const getIcon = (type: string) => {
    return CONTENT_TYPE_ICONS[type] || CONTENT_TYPE_ICONS.default;
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 text-foreground font-medium">
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  const handleViewAll = (type: string) => {
    setLocation(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 gap-0"
        data-testid="command-palette"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search for characters, locations, guides, and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base"
            data-testid="input-command-palette-search"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px] overflow-y-auto">
          <div className="p-2">
            {/* Loading State */}
            {isLoading && query.trim() && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Searching...</span>
              </div>
            )}

            {/* Generators Section */}
            {filteredGenerators.length > 0 && (
              <div className="space-y-1 mb-4">
                <div className="px-2 py-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Generators
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {filteredGenerators.map((generator) => {
                    const Icon = generator.icon;
                    return (
                      <button
                        key={generator.id}
                        onClick={() => {
                          onSelectGenerator?.(generator.id);
                          onOpenChange(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover-elevate text-left"
                        data-testid={`generator-${generator.id}`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-sm font-medium">
                          {generator.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State - No Query */}
            {!query.trim() && !isLoading && filteredGenerators.length === 0 && (
              <div className="py-8 px-4 text-center">
                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="text-sm font-semibold mb-1">Quick Search</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Find characters, locations, guides, and more
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="text-xs">
                    Characters
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Locations
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Guides
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Projects
                  </Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
                      ⌘K
                    </kbd>{" "}
                    or{" "}
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
                      Ctrl+K
                    </kbd>{" "}
                    to open anytime
                  </p>
                </div>
              </div>
            )}

            {/* Empty State - No Results */}
            {query.trim() && !isLoading && searchResults.length === 0 && (
              <div className="py-8 px-4 text-center">
                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="text-sm font-semibold mb-1">No results found</h3>
                <p className="text-xs text-muted-foreground">
                  Try different keywords or check your spelling
                </p>
              </div>
            )}

            {/* Results by Category */}
            {query.trim() && !isLoading && searchResults.length > 0 && (
              <div className="space-y-4">
                {Object.entries(groupedResults).map(([type, results]) => {
                  const IconComponent = getIcon(type);
                  const totalCount = searchResults.filter(
                    (r: SearchResult) => r.type === type,
                  ).length;
                  const hasMore = totalCount > 5;

                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {type}s
                          </h3>
                        </div>
                        {hasMore && (
                          <button
                            onClick={() => handleViewAll(type)}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                            data-testid={`button-view-all-${type}`}
                          >
                            View all {totalCount}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        {results.map((result: SearchResult, index: number) => {
                          const globalIndex = allResults.indexOf(result);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <button
                              key={result.id}
                              onClick={() => handleResultClick(result)}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                isSelected
                                  ? "bg-accent text-accent-foreground"
                                  : "hover-elevate"
                              }`}
                              data-testid={`search-result-${result.id}`}
                            >
                              <div className="flex items-start gap-3">
                                <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {highlightMatch(result.title, query)}
                                  </div>
                                  {result.subtitle && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {highlightMatch(result.subtitle, query)}
                                    </div>
                                  )}
                                  {result.content && !result.subtitle && (
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                      {highlightMatch(
                                        result.content.slice(0, 100),
                                        query,
                                      )}
                                    </div>
                                  )}
                                </div>
                                {isSelected && (
                                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer with keyboard hints */}
        {query.trim() && searchResults.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground bg-muted/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-semibold bg-background border border-border rounded">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 font-semibold bg-background border border-border rounded">
                  ↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-semibold bg-background border border-border rounded">
                  ↵
                </kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-semibold bg-background border border-border rounded">
                  Esc
                </kbd>
                Close
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
