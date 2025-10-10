import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Search, Edit, Trash2, Copy, Package, BookOpen, Lightbulb, Plus, ChevronDown, ChevronRight, FileText, AlertCircle } from "lucide-react";
import { CONTENT_TYPE_ICONS } from "@/config/content-types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { getMappingById } from "@shared/contentTypes";
import { useNotebookStore } from "@/stores/notebookStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import NotebookSwitcher from "./NotebookSwitcher";
import ContentTypeModal from "./ContentTypeModal";
import ContentTypeSidebar from "./ContentTypeSidebar";
import { ContentTypeSwitcher } from "./ContentTypeSwitcher";

// Helper function to get display name for different content types
const getDisplayName = (item: SavedItem, actualItemData?: any): string => {
  // For quick notes (handle both itemType and contentType for compatibility)
  if (item.itemType === 'quickNote' || item.contentType === 'quickNote') {
    return item.itemData?.title || item.title || 'Quick Note';
  }

  // For characters, ALWAYS prefer fresh fetched data over stale itemData
  // This ensures names update immediately after character edits
  if (item.itemType === 'character') {
    const dataSource = actualItemData || item.itemData;
    if (dataSource) {
      const givenName = dataSource.givenName || '';
      const familyName = dataSource.familyName || '';
      const fullName = [givenName, familyName].filter(Boolean).join(' ').trim();
      return fullName || dataSource.name || 'Untitled Character';
    }
    return 'Untitled Character';
  }

  // For other types, use itemData if available, otherwise use actualItemData
  const dataSource = item.itemData || actualItemData;

  if (item.itemType === 'profession') {
    return dataSource?.name || 'Untitled';
  }

  return dataSource?.name || 'Untitled';
};

// Helper function to get image URL from item data
const getImageUrl = (item: SavedItem, actualItemData?: any): string | null => {
  // For characters, prefer fresh fetched data to ensure consistency
  if (item.itemType === 'character') {
    const dataSource = actualItemData || item.itemData;
    return dataSource?.imageUrl || null;
  }
  // For other types, use itemData if available
  const dataSource = item.itemData || actualItemData;
  return dataSource?.imageUrl || null;
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
  notebookPopoverOpen?: boolean;
  onNotebookPopoverOpenChange?: (open: boolean) => void;
}

export default function SavedItems({ onCreateNew, notebookPopoverOpen, onNotebookPopoverOpenChange }: SavedItemsProps = {}) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [fetchedItemData, setFetchedItemData] = useState<{ [key: string]: any }>({});
  const fetchedItemsRef = useRef<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();
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
  const { data: savedItems = [], isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ['/api/saved-items', user?.id, activeNotebookId], // Include user ID and activeNotebookId in query key
    queryFn: async () => {
      if (!activeNotebookId) {
        console.error('[SavedItems] No active notebook selected');
        throw new Error('No active notebook selected');
      }
      if (!user?.id) {
        console.error('[SavedItems] No user authenticated');
        throw new Error('User not authenticated');
      }
      console.log('[SavedItems] Fetching items for notebook:', activeNotebookId);
      // Use notebook-specific endpoint to get fresh data
      const response = await apiRequest('GET', `/api/saved-items/notebook/${activeNotebookId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch saved items: ${response.status}`);
      }
      const data = await response.json() as SavedItem[];
      console.log('[SavedItems] Fetched', data.length, 'items for notebook', activeNotebookId);
      return data;
    },
    enabled: !!activeNotebookId && !!user?.id, // Only enabled when there's an active notebook and authenticated user
    gcTime: 0, // Don't cache query results at all
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 60000 // Poll every 60 seconds to catch imports (reduced frequency for better performance)
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

  // Fetch missing or stale item data for entries
  const fetchMissingItemData = async (items: SavedItem[]) => {
    // Only fetch item data if itemData is missing
    // Trust the itemData that's already stored in saved_items table
    const missingDataItems = items.filter(item => {
      const itemKey = item.itemId || item.id;
      // Only fetch if itemData is missing and we haven't already fetched it
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
        const notebookIdParam = item.notebookId || activeNotebookId;
        
        // Map content types to their API endpoints
        const endpointMap: { [key: string]: string } = {
          'character': `/api/characters/${item.itemId}?notebookId=${notebookIdParam}`,
          'profession': `/api/professions/${item.itemId}?notebookId=${notebookIdParam}`,
          'species': `/api/species/${item.itemId}?notebookId=${notebookIdParam}`,
          'location': `/api/locations/${item.itemId}?notebookId=${notebookIdParam}`,
          'settlement': `/api/settlements/${item.itemId}?notebookId=${notebookIdParam}`,
          'organization': `/api/organizations/${item.itemId}?notebookId=${notebookIdParam}`,
          'ethnicity': `/api/ethnicities/${item.itemId}?notebookId=${notebookIdParam}`,
          'item': `/api/items/${item.itemId}?notebookId=${notebookIdParam}`,
          'document': `/api/documents/${item.itemId}?notebookId=${notebookIdParam}`,
          'language': `/api/languages/${item.itemId}?notebookId=${notebookIdParam}`,
          'building': `/api/buildings/${item.itemId}?notebookId=${notebookIdParam}`,
          'material': `/api/materials/${item.itemId}?notebookId=${notebookIdParam}`,
          'transportation': `/api/transportation/${item.itemId}?notebookId=${notebookIdParam}`,
          'rank': `/api/ranks/${item.itemId}?notebookId=${notebookIdParam}`,
          'condition': `/api/conditions/${item.itemId}?notebookId=${notebookIdParam}`,
          'ritual': `/api/rituals/${item.itemId}?notebookId=${notebookIdParam}`,
          'law': `/api/laws/${item.itemId}?notebookId=${notebookIdParam}`
        };
        
        endpoint = endpointMap[item.itemType || ''] || '';

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
      setFetchedItemData({});
    }
  }, [activeNotebookId]);

  useEffect(() => {
    if (allItems.length > 0) {
      // Clear fetchedItemsRef to allow refetching when items change
      // This ensures updated character data is fetched after edits
      fetchedItemsRef.current.clear();
      setFetchedItemData({});
      fetchMissingItemData(allItems);
    }
    // Depend on dataUpdatedAt to detect when the query has been refetched
    // This will trigger when the saved-items query is invalidated after character updates
  }, [dataUpdatedAt, activeNotebookId, allItems.length]);

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
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/saved-items', user.id, activeNotebookId] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(['/api/saved-items', user.id, activeNotebookId]);

      // Optimistically update to remove the item
      queryClient.setQueryData(['/api/saved-items', user.id, activeNotebookId], (old: SavedItem[] = []) => {
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
      if (!user?.id) return;

      // Rollback to previous value on error
      if (context?.previousItems) {
        queryClient.setQueryData(['/api/saved-items', user.id, activeNotebookId], context.previousItems);
      }
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      if (!user?.id) return;

      // Force a fresh refetch (not from cache) to ensure we get the updated list
      queryClient.refetchQueries({ 
        queryKey: ['/api/saved-items', user.id, activeNotebookId],
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
      // Pass the saved item ID and the itemData for the quick note panel to load
      const noteId = item.id; // Use saved item ID as noteId
      const savedNoteData = item.itemData || { 
        title: item.title || 'Quick Note', 
        content: item.content || '',
        notebookId: item.notebookId // Include notebook ID for dropdown
      };
      
      // Use workspace store to open quick note with saved data in metadata
      const { openQuickNote } = useWorkspaceStore.getState();
      openQuickNote(noteId, savedNoteData);
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

  const handleContentTypeSelect = (contentTypeId: string) => {
    const mapping = getMappingById(contentTypeId);
    if (mapping) {
      const notebookParam = activeNotebookId ? `?notebookId=${activeNotebookId}` : '';
      setLocation(`/${mapping.urlSegment}/new${notebookParam}`);
    }
    setIsContentModalOpen(false);
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

    const matchesType = !selectedType || type === selectedType;

    return matchesSearch && matchesTab && matchesCategory && matchesType;
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

  // Show friendly empty state if no notebooks exist
  if (fetchedNotebooks && fetchedNotebooks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Writing Notebook
            </h1>
            <p className="text-muted-foreground mt-2">
              Your saved characters, locations, plots, and creative content
            </p>
          </div>
        </div>

        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Create Your First Notebook</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Notebooks help you organize your worldbuilding content. Create one for each story, setting, or creative project to keep your characters, locations, and ideas neatly organized.
            </p>
            <div className="w-full max-w-md">
              <NotebookSwitcher showActiveInfo={false} />
            </div>
            <p className="text-sm text-muted-foreground mt-6 flex items-center gap-2 justify-center">
              <Lightbulb className="h-4 w-4" />
              <span><strong>Tip:</strong> You can switch between notebooks anytime to work on different projects.</span>
            </p>
          </CardContent>
        </Card>
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
    <div className="flex h-full gap-0">
      {/* Content Type Sidebar */}
      <ContentTypeSidebar
        items={allItems}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        className="w-64 flex-shrink-0"
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-6">
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
        <NotebookSwitcher 
          showActiveInfo={true} 
          showHeader={false}
          isPopoverOpen={notebookPopoverOpen}
          onPopoverOpenChange={onNotebookPopoverOpenChange}
        />
        {!activeNotebookId && (
          <div className="text-sm text-muted-foreground">
            💡 Create or select a notebook to organize your content by world or project.
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your content by name, type, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-content"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/saved-items', user?.id, activeNotebookId] });
              toast({
                title: "Refreshing...",
                description: "Reloading notebook content",
              });
            }}
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsContentModalOpen(true)}
            className="gap-2"
            data-testid="button-create-new-content"
          >
            <Plus className="w-4 h-4" />
            Create New Content
          </Button>
          {activeNotebookId && (
            <Button 
              variant="outline"
              onClick={() => setLocation('/notebook/consolidate')}
              className="gap-2"
              data-testid="button-consolidate-characters"
            >
              <AlertCircle className="w-4 h-4" />
              Data Issues
            </Button>
          )}
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
              const isCollapsed = collapsedCategories.has(type);

              const toggleCollapse = () => {
                setCollapsedCategories(prev => {
                  const newSet = new Set(Array.from(prev));
                  if (newSet.has(type)) {
                    newSet.delete(type);
                  } else {
                    newSet.add(type);
                  }
                  return newSet;
                });
              };

              // Group items by type for better organization
              const groupedItems = items.reduce((acc, item) => {
                const type = item.itemType || 'other';
                if (!acc[type]) {
                  acc[type] = [];
                }
                acc[type].push(item);
                return acc;
              }, {} as Record<string, typeof items>);

              const handleItemClick = (item: SavedItem) => {
                const itemType = item.itemType || item.contentType;
                if (!itemType) return;
                const mapping = getMappingById(itemType);
                if (mapping) {
                  setLocation(`/${mapping.urlSegment}/${item.itemId || item.contentId}`);
                } else {
                  console.warn(`No mapping found for item type: ${itemType}`);
                }
              };

              return (
                <div key={type} className="space-y-3">
                  <button 
                    onClick={toggleCollapse}
                    className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 -mx-2 w-full"
                    data-testid={`toggle-category-${type}`}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                    <IconComponent className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold capitalize">
                      {mapping?.name || type} ({items.length})
                    </h2>
                  </button>

                  {!isCollapsed && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {items.map((item) => {
                      const imageUrl = getImageUrl(item, fetchedItemData[item.itemId || item.contentId || '']);
                      return (
                        <Card key={item.id} className="group hover-elevate relative" data-testid={`card-content-${item.id}`}>
                          {/* Content type icon - top right corner */}
                          <div className="absolute top-3 right-3 z-10">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>

                          <div className="flex gap-4 p-4">
                            {/* Left side - Image */}
                            <div className="flex-shrink-0">
                              {imageUrl ? (
                                <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
                                  <img
                                    src={imageUrl}
                                    alt={getDisplayName(item, fetchedItemData[item.itemId || item.contentId || ''])}
                                    className="w-full h-full object-cover"
                                    data-testid={`image-content-${item.id}`}
                                  />
                                </div>
                              ) : (
                                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                                  <IconComponent className="w-12 h-12 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Right side - Content */}
                            <div className="flex-1 min-w-0 flex flex-col pr-8">
                              <h3 className="text-lg font-semibold line-clamp-1" data-testid={`title-content-${item.id}`}>
                                {getDisplayName(item, fetchedItemData[item.itemId || item.contentId || ''])}
                              </h3>

                              <span className="text-xs text-muted-foreground mb-2">
                                Created {new Date(item.createdAt).toLocaleDateString()}
                              </span>

                              {(() => {
                                // For quick notes, use content field
                                if (item.itemType === 'quickNote' || item.contentType === 'quickNote') {
                                  const content = item.itemData?.content || item.content;
                                  if (content) {
                                    return (
                                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {content}
                                      </p>
                                    );
                                  }
                                }

                                // For other content types, use displayFields mapping
                                const descriptionField = mapping?.displayFields?.description;
                                if (descriptionField) {
                                  const dataSource = fetchedItemData[item.itemId || ''] || item.itemData;
                                  const description = dataSource?.[descriptionField];
                                  if (description) {
                                    return (
                                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {description}
                                      </p>
                                    );
                                  }
                                }

                                return null;
                              })()}

                              <div className="mt-auto">
                                <Badge variant="secondary" className="text-xs">
                                  {mapping?.name || type}
                                </Badge>
                              </div>

                              {/* Action buttons - hidden until hover */}
                              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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
                          </div>
                        </Card>
                      );
                  })}
                  </div>
                  )}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredItems.slice(0, 12).map((item) => {
                const type = item.contentType || item.itemType || 'unknown';
                const mapping = getMappingById(type);
                const IconComponent = CONTENT_TYPE_ICONS[type] || CONTENT_TYPE_ICONS.default;
                const imageUrl = getImageUrl(item, fetchedItemData[item.itemId || item.contentId || '']);

                return (
                  <Card key={item.id} className="group hover-elevate relative" data-testid={`card-recent-${item.id}`}>
                    {/* Content type icon - top right corner */}
                    <div className="absolute top-3 right-3 z-10">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex gap-4 p-4">
                      {/* Left side - Image */}
                      <div className="flex-shrink-0">
                        {imageUrl ? (
                          <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={imageUrl}
                              alt={getDisplayName(item, fetchedItemData[item.itemId || item.contentId || ''])}
                              className="w-full h-full object-cover"
                              data-testid={`image-recent-${item.id}`}
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                            <IconComponent className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Right side - Content */}
                      <div className="flex-1 min-w-0 flex flex-col pr-8">
                        <h3 className="text-lg font-semibold line-clamp-1" data-testid={`title-recent-${item.id}`}>
                          {getDisplayName(item, fetchedItemData[item.itemId || item.contentId || ''])}
                        </h3>

                        <span className="text-xs text-muted-foreground mb-2">
                          Created {new Date(item.createdAt).toLocaleDateString()}
                        </span>

                        {(() => {
                          // For quick notes, use content field
                          if (item.itemType === 'quickNote' || item.contentType === 'quickNote') {
                            const content = item.itemData?.content || item.content;
                            if (content) {
                              return (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {content}
                                </p>
                              );
                            }
                          }

                          // For other content types, use displayFields mapping
                          const descriptionField = mapping?.displayFields?.description;
                          if (descriptionField) {
                            const dataSource = fetchedItemData[item.itemId || ''] || item.itemData;
                            const description = dataSource?.[descriptionField];
                            if (description) {
                              return (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {description}
                                </p>
                              );
                            }
                          }

                          return null;
                        })()}

                        <div className="mt-auto">
                          <Badge variant="secondary" className="text-xs">
                            {mapping?.name || type}
                          </Badge>
                        </div>

                        {/* Action buttons - hidden until hover */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            data-testid={`button-edit-recent-${item.id}`}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(item)}
                            data-testid={`button-copy-recent-${item.id}`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnsave(item)}
                            disabled={unsaveMutation.isPending}
                            data-testid={`button-delete-recent-${item.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

          <ContentTypeModal 
            isOpen={isContentModalOpen}
            onClose={() => setIsContentModalOpen(false)}
            onSelectType={handleContentTypeSelect}
          />
        </div>
      </div>
    </div>
  );
}