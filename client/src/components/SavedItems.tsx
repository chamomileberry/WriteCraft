import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Trash2, Copy, User, MapPin, Building, Star, Package, Users, Globe, Flag, Crown, Circle, Home, UtensilsCrossed, Wine, Sword, Shield, TreePine, Car, Calculator, Feather, Sparkles, Mountain, PaintBucket } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { CONTENT_TYPE_MAPPINGS, getMappingById } from "@shared/contentTypes";

// Helper function to get display name for different content types
const getDisplayName = (item: SavedItem): string => {
  if (item.itemType === 'character') {
    const givenName = item.itemData?.givenName || '';
    const familyName = item.itemData?.familyName || '';
    const fullName = [givenName, familyName].filter(Boolean).join(' ').trim();
    return fullName || 'Untitled Character';
  }
  return item.itemData?.name || 'Untitled';
};

interface SavedItem {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  itemData?: any;
  createdAt: string;
}

// Icon mapping for all 40+ content types
const CONTENT_TYPE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  // People & Characters
  character: User,
  ethnicity: Users,
  culture: Globe,
  
  // Places & Locations
  location: MapPin,
  settlement: Building,
  building: Home,
  geography: Mountain,
  territory: MapPin,
  district: Building,
  city: Building,
  country: Flag,
  
  // Organizations & Groups
  organization: Building,
  society: Users,
  faction: Flag,
  militaryunit: Crown,
  
  // Creatures & Life
  species: Star,
  creature: Star,
  animal: Circle,
  
  // Items & Objects
  item: Package,
  weapon: Sword,
  armor: Shield,
  accessory: Package,
  clothing: Package,
  food: UtensilsCrossed,
  drink: Wine,
  material: Package,
  resource: Package,
  
  // Knowledge & Culture
  document: Package,
  language: Feather,
  religion: Star,
  myth: Package,
  legend: Package,
  tradition: Package,
  ritual: Star,
  
  // Events & Time
  event: Package,
  timeline: Package,
  familytree: Users,
  
  // Nature & Environment
  plant: TreePine,
  condition: Package,
  naturallaw: Package,
  
  // Technology & Magic
  technology: Calculator,
  spell: Sparkles,
  
  // Transportation & Infrastructure
  transportation: Car,
  
  // Story Elements
  plot: Package,
  conflict: Package,
  theme: Package,
  mood: PaintBucket,
  prompt: Package,
  
  // Professions & Roles
  profession: User,
  role: User,
  title: Crown,
  
  // Culinary
  cuisine: UtensilsCrossed,
  
  // Deities & Religion
  deity: Star,
  
  // Fallback
  setting: MapPin
};

// Content type categories for filtering
const CONTENT_CATEGORIES: { [key: string]: string[] } = {
  "People": ["character", "ethnicity", "culture", "profession", "role", "title"],
  "Places": ["location", "settlement", "building", "geography", "territory", "district", "city", "country"],
  "Groups": ["organization", "society", "faction", "militaryunit"],
  "Life": ["species", "creature", "animal", "plant"],
  "Items": ["item", "weapon", "armor", "accessory", "clothing", "food", "drink", "material", "resource"],
  "Knowledge": ["document", "language", "religion", "myth", "legend", "tradition", "ritual", "deity"],
  "Story": ["plot", "conflict", "theme", "mood", "prompt", "event", "timeline"],
  "World": ["condition", "naturallaw", "technology", "spell", "transportation", "cuisine", "familytree"]
};

export default function SavedItems() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch saved items
  const { data: savedItems = [], isLoading, error } = useQuery({
    queryKey: ['/api/saved-items', 'guest'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/saved-items/guest');
      return response.json() as Promise<SavedItem[]>;
    },
  });

  // Unsave mutation
  const unsaveMutation = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: string; itemId: string }) => {
      const response = await apiRequest('DELETE', '/api/saved-items', {
        userId: 'guest',
        itemType,
        itemId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Item removed",
        description: "Item has been removed from your notebook.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', 'guest'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    },
  });

  const handleUnsave = async (itemType: string, itemId: string) => {
    unsaveMutation.mutate({ itemType, itemId });
  };

  const handleCopy = async (item: SavedItem) => {
    const content = `${getDisplayName(item)}\n\n${JSON.stringify(item.itemData, null, 2)}`;
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content has been copied to your clipboard.",
    });
  };

  const handleEdit = (itemType: string, itemId: string) => {
    const mapping = getMappingById(itemType);
    if (mapping) {
      setLocation(`/${mapping.urlSegment}/${itemId}/edit`);
    } else {
      // Fallback for unmapped content types
      setLocation(`/editor/${itemType}/${itemId}`);
    }
  };

  // Get category for a content type
  const getCategoryForType = (itemType: string): string | null => {
    for (const [category, types] of Object.entries(CONTENT_CATEGORIES)) {
      if (types.includes(itemType)) {
        return category;
      }
    }
    return null;
  };

  // Filter saved items
  const filteredItems = savedItems.filter(item => {
    const displayName = getDisplayName(item);
    const matchesSearch = !searchQuery || 
      (displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.itemType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (getCategoryForType(item.itemType)?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "recent" && new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const matchesCategory = !selectedCategory || 
      (CONTENT_CATEGORIES[selectedCategory]?.includes(item.itemType));
    
    return matchesSearch && matchesTab && matchesCategory;
  });

  // Group items by type for better organization
  const groupedItems = filteredItems.reduce((acc, item) => {
    const type = item.itemType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, SavedItem[]>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
  const totalItems = savedItems.length;
  const recentItems = savedItems.filter(item => 
    new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const categoryStats = Object.keys(CONTENT_CATEGORIES).reduce((acc, category) => {
    acc[category] = savedItems.filter(item => 
      CONTENT_CATEGORIES[category].includes(item.itemType)
    ).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Writing Notebook</h1>
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
              <h3 className="text-lg font-semibold mb-2">No saved content</h3>
              <p className="text-muted-foreground mb-4">
                Start creating and saving content to see it here.
              </p>
              <Button onClick={() => setLocation('/')} data-testid="button-create-content">
                Create Content
              </Button>
            </div>
          ) : (
            Object.entries(groupedItems).map(([type, items]) => {
              const mapping = getMappingById(type);
              const IconComponent = CONTENT_TYPE_ICONS[type] || Package;
              
              return (
                <div key={type} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold capitalize">
                      {mapping?.name || type} ({items.length})
                    </h2>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <Card key={item.id} className="group hover-elevate" data-testid={`card-content-${item.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4 text-primary" />
                              <CardTitle className="text-base line-clamp-1">
                                {getDisplayName(item)}
                              </CardTitle>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {mapping?.name || type}
                            </Badge>
                          </div>
                          {item.itemData?.description && (
                            <CardDescription className="line-clamp-2">
                              {item.itemData.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Created {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(item.itemType, item.itemId)}
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
                                onClick={() => handleUnsave(item.itemType, item.itemId)}
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.slice(0, 12).map((item) => {
                const mapping = getMappingById(item.itemType);
                const IconComponent = CONTENT_TYPE_ICONS[item.itemType] || Package;
                
                return (
                  <Card key={item.id} className="group hover-elevate" data-testid={`card-recent-${item.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-primary" />
                          <CardTitle className="text-base line-clamp-1">
                            {getDisplayName(item)}
                          </CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {mapping?.name || item.itemType}
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
                          onClick={() => handleEdit(item.itemType, item.itemId)}
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