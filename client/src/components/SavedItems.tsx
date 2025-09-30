import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Trash2, Copy, Package, BookOpen } from "lucide-react";
import { CONTENT_TYPE_ICONS } from "@/config/content-types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { getMappingById } from "@shared/contentTypes";
import { useNotebookStore } from "@/stores/notebookStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import NotebookSwitcher from "./NotebookSwitcher";

// Helper function to get display name for different content types
const getDisplayName = (item: SavedItem, actualItemData?: any): string => {
  // For quick notes (handle both itemType and contentType for compatibility)
  if (item.itemType === 'quickNote' || item.contentType === 'quickNote') {
    return item.itemData?.title || item.title || 'Quick Note';
  }
  
  // Use actualItemData if itemData is null (for older saved items)
  const dataSource = item.itemData || actualItemData;
  
  if (item.itemType === 'character') {
    if (dataSource) {
      const givenName = dataSource.givenName || '';
      const familyName = dataSource.familyName || '';
      const fullName = [givenName, familyName].filter(Boolean).join(' ').trim();
      return fullName || dataSource.name || 'Untitled Character';
    }
    return 'Untitled Character';
  }
  
  if (item.itemType === 'profession') {
    return dataSource?.name || 'Untitled';
  }
  
  return dataSource?.name || 'Untitled';
};

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

// Icon mapping moved to centralized config - imported from @/config/content-types

// Content type categories for filtering
const CONTENT_CATEGORIES: { [key: string]: string[] } = {
  "Quick Notes": ["quickNote"],
  "People": ["character", "ethnicity", "culture", "profession", "role", "title"],
  "Places": ["location", "settlement", "building", "geography", "territory", "district", "city", "country"],
  "Groups": ["organization", "society", "faction", "militaryunit"],
  "Life": ["species", "creature", "animal", "plant"],
  "Items": ["item", "weapon", "armor", "accessory", "clothing", "food", "drink", "material", "resource"],
  "Knowledge": ["document", "language", "religion", "myth", "legend", "tradition", "ritual", "deity"],
  "Story": ["plot", "conflict", "theme", "mood", "prompt", "event", "timeline"],
  "World": ["condition", "naturallaw", "technology", "spell", "transportation", "cuisine", "familytree"]
};

interface SavedItemsProps {
  onCreateNew?: () => void;
}

export default function SavedItems({ onCreateNew }: SavedItemsProps = {}) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedItemData, setFetchedItemData] = useState<{ [key: string]: any }>({});
  const fetchedItemsRef = useRef<Set<string>>(new Set());
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { activeNotebookId, getActiveNotebook, setActiveNotebook, notebooks, setNotebooks } = useNotebookStore();
  const { openQuickNote } = useWorkspaceStore();

  // Fetch notebooks to ensure we have a list
  const { data: fetchedNotebooks } = useQuery({
    queryKey: ['/api/notebooks'],
    queryFn: async () => {
      console.log('[SavedItems] Fetching notebooks list');
      const response = await apiRequest('GET', '/api/notebooks');
      const notebooks = await response.json();
      console.log('[SavedItems] Fetched notebooks:', notebooks);
      return notebooks;
    }
  });

  // Initialize notebooks in store and select first one if none is active
  useEffect(() => {
    if (fetchedNotebooks && fetchedNotebooks.length > 0) {
      console.log('[SavedItems] Initializing notebooks, current activeNotebookId:', activeNotebookId);
      setNotebooks(fetchedNotebooks);
      
      // Check if current activeNotebookId is valid
      const isValidNotebook = fetchedNotebooks.some((nb: any) => nb.id === activeNotebookId);
      
      // If no active notebook or invalid notebook, select the first one
      if (!activeNotebookId || !isValidNotebook) {
        console.log('[SavedItems] Setting active notebook to first one:', fetchedNotebooks[0].id);
        setActiveNotebook(fetchedNotebooks[0].id);
      }
    }
  }, [fetchedNotebooks, activeNotebookId, setNotebooks, setActiveNotebook]);

  // Fetch saved items for the active notebook
  const { data: savedItems = [], isLoading, error } = useQuery({
    queryKey: ['/api/saved-items', 'demo-user', activeNotebookId], // Include activeNotebookId in query key
    queryFn: async () => {
      if (!activeNotebookId) {
        console.error('[SavedItems] No active notebook selected');
        throw new Error('No active notebook selected');
      }
      console.log('[SavedItems] Fetching items for notebook:', activeNotebookId);
      // Use fetch directly with cache: 'no-cache' to force fresh data
      const response = await fetch(`/api/saved-items/demo-user?notebookId=${activeNotebookId}`, {
        credentials: 'include',
        cache: 'no-cache' // Force bypass of HTTP cache
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch saved items: ${response.status}`);
      }
      return await response.json() as SavedItem[];
    },
    enabled: !!activeNotebookId // Only enabled when there's an active notebook
  });

  // Fetch quick note separately
  const { data: quickNote } = useQuery({
    queryKey: ['/api/quick-note', 'guest'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/quick-note?userId=guest`, {
          credentials: 'include'
        });
        if (response.status === 404) {
          return null;
        }
        if (!response.ok) return null;
        return response.json();
      } catch {
        return null;
      }
    },
  });

  // Use saved items directly - don't merge the scratch pad quick note
  // The scratch pad Quick Note is temporary and shouldn't appear in the Notebook
  // Only items saved via "Save to Notebook" button should appear here
  const allItems = useMemo(() => {
    return [...savedItems];
  }, [savedItems]);

  // Fetch missing item data for entries that have itemData: null
  const fetchMissingItemData = async (items: SavedItem[]) => {
    // Filter items that haven't been fetched yet
    const missingDataItems = items.filter(item => {
      const itemKey = item.itemId || item.id;
      return !item.itemData && itemKey && !fetchedItemsRef.current.has(itemKey);
    });
    
    if (missingDataItems.length === 0) return;
    
    const newFetchedData: { [key: string]: any } = {};

    for (const item of missingDataItems) {
      const itemKey = item.itemId || item.id;
      // Mark as fetched to prevent duplicate fetches
      fetchedItemsRef.current.add(itemKey);
      
      try {
        let endpoint = '';
        if (item.itemType === 'character') {
          // Include notebookId when fetching character data
          const notebookIdParam = item.notebookId || activeNotebookId;
          endpoint = `/api/characters/${item.itemId}?notebookId=${notebookIdParam}`;
        } else if (item.itemType === 'profession') {
          // Include notebookId when fetching profession data
          const notebookIdParam = item.notebookId || activeNotebookId;
          endpoint = `/api/professions/${item.itemId}?notebookId=${notebookIdParam}`;
        }
        
        if (endpoint) {
          const response = await apiRequest('GET', endpoint);
          if (response.ok) {
            const data = await response.json();
            newFetchedData[item.itemId || ''] = data;
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch data for ${item.itemType} ${item.itemId}:`, error);
      }
    }

    if (Object.keys(newFetchedData).length > 0) {
      setFetchedItemData(prev => ({ ...prev, ...newFetchedData }));
    }
  };

  // Fetch missing data when items change
  useEffect(() => {
    // Reset fetched items ref when notebook changes
    if (activeNotebookId) {
      fetchedItemsRef.current.clear();
    }
  }, [activeNotebookId]);

  useEffect(() => {
    if (allItems.length > 0) {
      fetchMissingItemData(allItems);
    }
    // Use a stable identifier: JSON stringify the item IDs to detect actual changes
  }, [JSON.stringify(allItems.map(item => item.id || item.itemId)), activeNotebookId]);

  // Unsave mutation with optimistic updates
  const unsaveMutation = useMutation({
    mutationFn: async (item: SavedItem) => {
      // Include notebookId to prevent cross-notebook deletions
      const body = {
        itemType: item.itemType || item.contentType || '',
        itemId: item.itemId || item.contentId || item.id,
        notebookId: item.notebookId || activeNotebookId
      };
      
      console.log('[SavedItems] Deleting item:', {
        itemFromState: item,
        deleteBody: body
      });
      
      const response = await apiRequest('DELETE', '/api/saved-items', body);
      const result = await response.json();
      console.log('[SavedItems] Delete response:', result);
      return result;
    },
    onMutate: async (deletedItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/saved-items', 'demo-user', activeNotebookId] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(['/api/saved-items', 'demo-user', activeNotebookId]);

      // Optimistically update to remove the item
      queryClient.setQueryData(['/api/saved-items', 'demo-user', activeNotebookId], (old: SavedItem[] = []) => {
        return old.filter(item => item.id !== deletedItem.id);
      });

      // Return context with the previous value
      return { previousItems };
    },
    onSuccess: () => {
      toast({
        title: "Item removed",
        description: "Item has been removed from your notebook.",
      });
    },
    onError: (error, deletedItem, context) => {
      // Rollback to previous value on error
      if (context?.previousItems) {
        queryClient.setQueryData(['/api/saved-items', 'demo-user', activeNotebookId], context.previousItems);
      }
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Force a fresh refetch (not from cache) to ensure we get the updated list
      queryClient.refetchQueries({ 
        queryKey: ['/api/saved-items', 'demo-user', activeNotebookId],
        type: 'active'
      });
    },
  });

  const handleUnsave = async (item: SavedItem) => {
    unsaveMutation.mutate(item);
  };

  const handleCopy = async (item: SavedItem) => {
    let content = '';
    if (item.itemType === 'quickNote' || item.contentType === 'quickNote') {
      const title = item.itemData?.title || item.title || 'Quick Note';
      const noteContent = item.itemData?.content || item.content || '';
      content = `${title}\n\n${noteContent}`;
    } else {
      const id = item.itemId || item.contentId || '';
      content = `${getDisplayName(item, fetchedItemData[id])}\n\n${JSON.stringify(item.itemData || fetchedItemData[id], null, 2)}`;
    }
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content has been copied to your clipboard.",
    });
  };

  const handleEdit = (item: SavedItem) => {
    // Open Quick Note panel for editing
    if (item.itemType === 'quickNote' || item.contentType === 'quickNote') {
      openQuickNote();
      return;
    }
    
    const type = item.itemType || item.contentType || '';
    const id = item.itemId || item.contentId || '';
    const mapping = getMappingById(type);
    
    // Include notebookId query parameter for API endpoints that require it
    const notebookIdParam = item.notebookId || activeNotebookId;
    const queryParam = notebookIdParam ? `?notebookId=${notebookIdParam}` : '';
    
    if (mapping) {
      setLocation(`/${mapping.urlSegment}/${id}/edit${queryParam}`);
    } else {
      // Fallback for unmapped content types
      setLocation(`/editor/${type}/${id}${queryParam}`);
    }
  };

  // Get category for a content type
  const getCategoryForType = (type: string): string | null => {
    for (const [category, types] of Object.entries(CONTENT_CATEGORIES)) {
      if (types.includes(type)) {
        return category;
      }
    }
    return null;
  };

  // Filter all items (saved items + quick note)
  const filteredItems = allItems.filter(item => {
    const type = item.contentType || item.itemType || 'unknown';
    const displayName = getDisplayName(item, fetchedItemData[item.itemId || item.contentId || '']);
    const matchesSearch = !searchQuery || 
      (displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (getCategoryForType(type)?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "recent" && new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const matchesCategory = !selectedCategory || 
      (CONTENT_CATEGORIES[selectedCategory]?.includes(type));
    
    return matchesSearch && matchesTab && matchesCategory;
  });

  // Group items by type for better organization
  const groupedItems = filteredItems.reduce((acc, item) => {
    const type = item.contentType || item.itemType || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, SavedItem[]>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load saved items.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Calculate statistics
  const totalItems = allItems.length;
  const recentItems = allItems.filter(item => 
    new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const categoryStats = Object.keys(CONTENT_CATEGORIES).reduce((acc, category) => {
    acc[category] = allItems.filter(item => {
      const type = item.contentType || item.itemType || '';
      return CONTENT_CATEGORIES[category].includes(type);
    }).length;
    return acc;
  }, {} as Record<string, number>);

  const activeNotebook = getActiveNotebook();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Writing Notebook
          </h1>
          <p className="text-muted-foreground mt-2">
            Your saved characters, locations, plots, and creative content
          </p>
          <div className="flex gap-4 mt-3">
            <Badge variant="secondary" data-testid="stat-total-items">
              {totalItems} Total Items
            </Badge>
            <Badge variant="outline" data-testid="stat-recent-items">
              {recentItems} This Week
            </Badge>
          </div>
        </div>
      </div>

      {/* Notebook Switcher */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">Active Notebook</h2>
        <NotebookSwitcher />
        {!activeNotebookId && (
          <div className="text-sm text-muted-foreground">
            💡 Create or select a notebook to organize your content by world or project.
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search your content by name, type, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-content"
          />
        </div>
        
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            data-testid="filter-all-categories"
          >
            All Categories ({totalItems})
          </Button>
          {Object.entries(CONTENT_CATEGORIES).map(([category, types]) => {
            const count = categoryStats[category] || 0;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                disabled={count === 0}
                data-testid={`filter-category-${category.toLowerCase()}`}
              >
                {category} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-items">
            All Items ({filteredItems.length})
          </TabsTrigger>
          <TabsTrigger value="recent" data-testid="tab-recent-items">
            Recent ({filteredItems.filter(item => new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {activeNotebook ? `No saved content in "${activeNotebook.name}"` : 'No saved content'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {activeNotebook 
                  ? `Start creating and saving content to "${activeNotebook.name}" to see it here.`
                  : 'Create a notebook and start saving content to see it here.'
                }
              </p>
              <Button onClick={() => onCreateNew?.()} data-testid="button-create-content">
                Create Content
              </Button>
            </div>
          ) : (
            Object.entries(groupedItems).map(([type, items]) => {
              const mapping = getMappingById(type);
              const IconComponent = CONTENT_TYPE_ICONS[type] || CONTENT_TYPE_ICONS.default;
              
              return (
                <div key={type} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold capitalize">
                      {mapping?.name || type} ({items.length})
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <Card key={item.id} className="group hover-elevate" data-testid={`card-content-${item.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4 text-primary" />
                              <CardTitle className="text-base line-clamp-1">
                                {getDisplayName(item, fetchedItemData[item.itemId || item.contentId || ''])}
                              </CardTitle>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {mapping?.name || type}
                            </Badge>
                          </div>
                          {((item.itemType === 'quickNote' || item.contentType === 'quickNote') ? (item.itemData?.content || item.content) : (item.itemData?.description || fetchedItemData[item.itemId || '']?.description)) && (
                            <CardDescription className="line-clamp-2">
                              {(item.itemType === 'quickNote' || item.contentType === 'quickNote') ? (item.itemData?.content || item.content) : (item.itemData?.description || fetchedItemData[item.itemId || '']?.description)}
                            </CardDescription>
                          )}
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Created {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(item)}
                                data-testid={`button-edit-${item.id}`}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopy(item)}
                                data-testid={`button-copy-${item.id}`}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUnsave(item)}
                                disabled={unsaveMutation.isPending}
                                data-testid={`button-delete-${item.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent items found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.slice(0, 12).map((item) => {
                const type = item.contentType || item.itemType || 'unknown';
                const mapping = getMappingById(type);
                const IconComponent = CONTENT_TYPE_ICONS[type] || CONTENT_TYPE_ICONS.default;
                
                return (
                  <Card key={item.id} className="group hover-elevate" data-testid={`card-recent-${item.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-primary" />
                          <CardTitle className="text-base line-clamp-1">
                            {getDisplayName(item, fetchedItemData[item.itemId || item.contentId || ''])}
                          </CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {mapping?.name || type}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          data-testid={`button-edit-recent-${item.id}`}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}