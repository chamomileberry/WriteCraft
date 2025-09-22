import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, BookMarked, Loader2, Edit, Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Import the shared content type mapping
import { CONTENT_TYPE_MAPPINGS, getMappingById } from "@shared/contentTypes";
import { 
  User, MapPin, Building, Zap, Book, FileText, UtensilsCrossed, Wine, Sword, 
  Shield, Star, Globe, Users, Flag, Crown, Target, Scroll, Lightbulb, Rocket, 
  TreePine, Package, Home, Palette, PaintBucket, Mountain, Car, Calculator, 
  Feather, Sparkles, Circle 
} from "lucide-react";

interface SavedItem {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  itemData?: any;
  createdAt: string;
}

// Icon mapping for content types
const CONTENT_TYPE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  character: User,
  location: MapPin,
  organization: Building,
  species: Star,
  creature: Circle,
  setting: Mountain,
  description: FileText,
  item: Package,
  weapon: Sword,
  armor: Shield,
  food: UtensilsCrossed,
  drink: Wine,
  religion: Star,
  language: Book,
  plot: Scroll,
  prompt: Lightbulb,
  theme: Target,
  mood: Palette,
  plant: TreePine,
  animal: Circle,
  ethnicity: Users,
  culture: Globe,
  document: FileText,
  settlement: Building,
  society: Users,
  faction: Flag,
  militaryunit: Crown,
  accessory: Star,
  clothing: Palette,
  material: PaintBucket,
  resource: Package,
  myth: Scroll,
  legend: Crown,
  tradition: Feather,
  ritual: Sparkles,
  event: Target,
  building: Home,
  transportation: Car,
  naturallaw: Calculator,
  technology: Lightbulb,
  spell: Zap
};

export default function SavedItems() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch saved items
  const { data: savedItems = [], isLoading, error } = useQuery({
    id: "character",
    name: "Character",
    description: "Detailed fictional characters",
    category: "People",
    icon: User,
    displayFields: {
      title: "name",
      subtitle: "occupation",
      description: "backstory",
      badges: ["gender", "genre"]
    },
    editRoute: "/characters"
  },
  location: {
    id: "location",
    name: "Location",
    description: "Places and settings",
    category: "Places",
    icon: MapPin,
    displayFields: {
      title: "name",
      subtitle: "locationType",
      description: "description",
      badges: ["climate", "genre"]
    },
    editRoute: "/locations"
  },
  organization: {
    id: "organization",
    name: "Organization",
    description: "Groups and institutions",
    category: "Groups",
    icon: Building,
    displayFields: {
      title: "name",
      subtitle: "organizationType",
      description: "purpose",
      badges: ["size", "influence"]
    },
    editRoute: "/organizations"
  },
  species: {
    id: "species",
    name: "Species",
    description: "Unique species",
    category: "Life",
    icon: Star,
    displayFields: {
      title: "name",
      subtitle: "speciesType",
      description: "physicalDescription",
      badges: ["habitat", "intelligence"]
    },
    editRoute: "/species"
  },
  creature: {
    id: "creature",
    name: "Creature",
    description: "Creatures and fauna",
    category: "Life",
    icon: Circle,
    displayFields: {
      title: "name",
      subtitle: "creatureType",
      description: "physicalDescription",
      badges: ["habitat", "genre"]
    },
    editRoute: "/creatures"
  },
  setting: {
    id: "setting",
    name: "Setting", 
    description: "Environmental settings",
    category: "Places",
    icon: Mountain,
    displayFields: {
      title: "name",
      subtitle: "location",
      description: "description",
      badges: ["climate", "genre"]
    },
    editRoute: "/settings"
  },
  description: {
    id: "description",
    name: "Description",
    description: "Descriptive content",
    category: "Knowledge",
    icon: FileText,
    displayFields: {
      title: "title",
      subtitle: "descriptionType",
      description: "content",
      badges: ["genre"]
    },
    editRoute: "/descriptions"
  },
  item: {
    id: "item",
    name: "Item",
    description: "Objects and artifacts",
    category: "Items",
    icon: Package,
    displayFields: {
      title: "name",
      subtitle: "itemType",
      description: "description",
      badges: ["rarity", "material"]
    },
    editRoute: "/items"
  },
  weapon: {
    id: "weapon",
    name: "Weapon",
    description: "Combat weapons",
    category: "Items",
    icon: Sword,
    displayFields: {
      title: "name",
      subtitle: "weaponType",
      description: "description",
      badges: ["material", "rarity"]
    },
    editRoute: "/weapons"
  },
  armor: {
    id: "armor",
    name: "Armor",
    description: "Protective equipment",
    category: "Items",
    icon: Shield,
    displayFields: {
      title: "name",
      subtitle: "armorType",
      description: "description",
      badges: ["material", "protection"]
    },
    editRoute: "/armor"
  },
  food: {
    id: "food",
    name: "Food",
    description: "Culinary items",
    category: "Resources",
    icon: UtensilsCrossed,
    displayFields: {
      title: "name",
      subtitle: "foodType",
      description: "description",
      badges: ["origin", "rarity"]
    },
    editRoute: "/foods"
  },
  drink: {
    id: "drink",
    name: "Drink",
    description: "Beverages and potions",
    category: "Resources",
    icon: Wine,
    displayFields: {
      title: "name",
      subtitle: "drinkType",
      description: "description",
      badges: ["alcoholContent", "effects"]
    },
    editRoute: "/drinks"
  },
  religion: {
    id: "religion",
    name: "Religion",
    description: "Belief systems",
    category: "Knowledge",
    icon: Star,
    displayFields: {
      title: "name",
      subtitle: "religionType",
      description: "beliefs",
      badges: ["pantheon", "domain"]
    },
    editRoute: "/religions"
  },
  language: {
    id: "language",
    name: "Language",
    description: "Communication systems",
    category: "Knowledge",
    icon: Book,
    displayFields: {
      title: "name",
      subtitle: "languageFamily",
      description: "description",
      badges: ["speakers", "complexity"]
    },
    editRoute: "/languages"
  },
  // Additional content types from schema
  plot: {
    id: "plot",
    name: "Plot",
    description: "Story plots",
    category: "Knowledge",
    icon: Scroll,
    displayFields: {
      title: "title",
      subtitle: "plotType",
      description: "summary",
      badges: ["genre", "complexity"]
    },
    editRoute: "/plots"
  },
  prompt: {
    id: "prompt",
    name: "Prompt",
    description: "Writing prompts",
    category: "Knowledge",
    icon: Lightbulb,
    displayFields: {
      title: "title",
      subtitle: "promptType",
      description: "content",
      badges: ["genre", "difficulty"]
    },
    editRoute: "/prompts"
  },
  theme: {
    id: "theme",
    name: "Theme",
    description: "Story themes",
    category: "Knowledge",
    icon: Target,
    displayFields: {
      title: "name",
      subtitle: "themeType",
      description: "description",
      badges: ["genre", "complexity"]
    },
    editRoute: "/themes"
  },
  mood: {
    id: "mood",
    name: "Mood",
    description: "Atmospheric moods",
    category: "Knowledge",
    icon: Palette,
    displayFields: {
      title: "name",
      subtitle: "moodType",
      description: "description",
      badges: ["intensity", "genre"]
    },
    editRoute: "/moods"
  },
  plant: {
    id: "plant",
    name: "Plant",
    description: "Flora and vegetation",
    category: "Life",
    icon: TreePine,
    displayFields: {
      title: "name",
      subtitle: "plantType",
      description: "description",
      badges: ["habitat", "rarity"]
    },
    editRoute: "/plants"
  },
  animal: {
    id: "animal",
    name: "Animal",
    description: "Fauna and wildlife",
    category: "Life",
    icon: Circle,
    displayFields: {
      title: "name",
      subtitle: "animalType",
      description: "description",
      badges: ["habitat", "size"]
    },
    editRoute: "/animals"
  },
  ethnicity: {
    id: "ethnicity",
    name: "Ethnicity",
    description: "Cultural ethnic groups",
    category: "People",
    icon: Users,
    displayFields: {
      title: "name",
      subtitle: "ethnicType",
      description: "description",
      badges: ["region", "population"]
    },
    editRoute: "/ethnicities"
  },
  culture: {
    id: "culture",
    name: "Culture",
    description: "Cultural backgrounds",
    category: "People", 
    icon: Globe,
    displayFields: {
      title: "name",
      subtitle: "cultureType",
      description: "description",
      badges: ["region", "influence"]
    },
    editRoute: "/cultures"
  },
  document: {
    id: "document",
    name: "Document",
    description: "Books, scrolls, records",
    category: "Knowledge",
    icon: FileText,
    displayFields: {
      title: "title",
      subtitle: "documentType",
      description: "content",
      badges: ["author", "era"]
    },
    editRoute: "/documents"
  },
  settlement: {
    id: "settlement",
    name: "Settlement",
    description: "Towns and communities",
    category: "Places",
    icon: Building,
    displayFields: {
      title: "name",
      subtitle: "settlementType",
      description: "description",
      badges: ["population", "government"]
    },
    editRoute: "/settlements"
  },
  society: {
    id: "society",
    name: "Society",
    description: "Social structures",
    category: "Groups",
    icon: Users,
    displayFields: {
      title: "name",
      subtitle: "societyType",
      description: "description",
      badges: ["government", "influence"]
    },
    editRoute: "/societies"
  },
  faction: {
    id: "faction",
    name: "Faction",
    description: "Competing groups",
    category: "Groups",
    icon: Flag,
    displayFields: {
      title: "name",
      subtitle: "factionType",
      description: "goals",
      badges: ["influence", "alignment"]
    },
    editRoute: "/factions"
  },
  militaryunit: {
    id: "militaryunit",
    name: "Military Unit",
    description: "Armed forces",
    category: "Groups",
    icon: Crown,
    displayFields: {
      title: "name",
      subtitle: "unitType",
      description: "description",
      badges: ["size", "specialization"]
    },
    editRoute: "/military-units"
  },
  accessory: {
    id: "accessory", 
    name: "Accessory",
    description: "Jewelry and trinkets",
    category: "Items",
    icon: Star,
    displayFields: {
      title: "name",
      subtitle: "accessoryType",
      description: "description",
      badges: ["material", "value"]
    },
    editRoute: "/accessories"
  },
  clothing: {
    id: "clothing",
    name: "Clothing",
    description: "Garments and fashion",
    category: "Items",
    icon: Palette,
    displayFields: {
      title: "name",
      subtitle: "clothingType",
      description: "description",
      badges: ["material", "style"]
    },
    editRoute: "/clothing"
  },
  material: {
    id: "material",
    name: "Material",
    description: "Substances and materials",
    category: "Resources",
    icon: PaintBucket,
    displayFields: {
      title: "name",
      subtitle: "materialType",
      description: "description",
      badges: ["rarity", "properties"]
    },
    editRoute: "/materials"
  },
  resource: {
    id: "resource",
    name: "Resource",
    description: "Valuable commodities",
    category: "Resources",
    icon: Package,
    displayFields: {
      title: "name",
      subtitle: "resourceType",
      description: "description",
      badges: ["rarity", "origin"]
    },
    editRoute: "/resources"
  },
  myth: {
    id: "myth",
    name: "Myth",
    description: "Legendary stories",
    category: "Knowledge",
    icon: Scroll,
    displayFields: {
      title: "title",
      subtitle: "mythType",
      description: "summary",
      badges: ["origin", "significance"]
    },
    editRoute: "/myths"
  },
  legend: {
    id: "legend",
    name: "Legend",
    description: "Heroic tales",
    category: "Knowledge",
    icon: Crown,
    displayFields: {
      title: "title",
      subtitle: "legendType", 
      description: "summary",
      badges: ["hero", "era"]
    },
    editRoute: "/legends"
  },
  tradition: {
    id: "tradition",
    name: "Tradition",
    description: "Cultural practices",
    category: "Knowledge",
    icon: Feather,
    displayFields: {
      title: "name",
      subtitle: "traditionType",
      description: "description",
      badges: ["culture", "significance"]
    },
    editRoute: "/traditions"
  },
  ritual: {
    id: "ritual",
    name: "Ritual",
    description: "Ceremonial practices",
    category: "Knowledge",
    icon: Sparkles,
    displayFields: {
      title: "name",
      subtitle: "ritualType",
      description: "description",
      badges: ["purpose", "participants"]
    },
    editRoute: "/rituals"
  },
  event: {
    id: "event",
    name: "Event",
    description: "Significant happenings",
    category: "Events",
    icon: Target,
    displayFields: {
      title: "name",
      subtitle: "eventType",
      description: "description",
      badges: ["date", "impact"]
    },
    editRoute: "/events"
  },
  building: {
    id: "building",
    name: "Building",
    description: "Structures and architecture",
    category: "Places",
    icon: Home,
    displayFields: {
      title: "name",
      subtitle: "buildingType",
      description: "description",
      badges: ["material", "purpose"]
    },
    editRoute: "/buildings"
  },
  transportation: {
    id: "transportation",
    name: "Transportation",
    description: "Vehicles and mounts",
    category: "Items",
    icon: Car,
    displayFields: {
      title: "name",
      subtitle: "transportationType",
      description: "description",
      badges: ["speed", "capacity"]
    },
    editRoute: "/transportation"
  },
  naturallaw: {
    id: "naturallaw",
    name: "Natural Law",
    description: "World physics and rules",
    category: "Science",
    icon: Calculator,
    displayFields: {
      title: "name",
      subtitle: "lawType",
      description: "description",
      badges: ["scope", "effects"]
    },
    editRoute: "/natural-laws"
  },
  technology: {
    id: "technology",
    name: "Technology",
    description: "Innovations and inventions",
    category: "Science",
    icon: Lightbulb,
    displayFields: {
      title: "name",
      subtitle: "technologyType",
      description: "description",
      badges: ["era", "complexity"]
    },
    editRoute: "/technologies"
  },
  spell: {
    id: "spell",
    name: "Spell",
    description: "Magical effects",
    category: "Science",
    icon: Zap,
    displayFields: {
      title: "name",
      subtitle: "spellType",
      description: "description",
      badges: ["school", "level"]
    },
    editRoute: "/spells"
  }
};

export default function SavedItems() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch saved items
  const { data: savedItems = [], isLoading, error } = useQuery({
    queryKey: ['/api/saved-items', 'null'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/saved-items/null');
      return response.json() as Promise<SavedItem[]>;
    },
  });

  // Unsave mutation
  const unsaveMutation = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: string; itemId: string }) => {
      const response = await apiRequest('DELETE', '/api/saved-items', {
        userId: 'null',
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
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleUnsave = (itemType: string, itemId: string) => {
    unsaveMutation.mutate({ itemType, itemId });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to Clipboard!",
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

  // Get the display value for a field
  const getFieldValue = (data: any, fieldPath: string): string => {
    if (!data || !fieldPath) return "";
    
    const value = data[fieldPath];
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return value?.toString() || "";
  };

  // Generate content text for copying
  const generateContentText = (item: SavedItem): string => {
    const config = CONTENT_TYPE_CONFIGS[item.itemType];
    if (!config || !item.itemData) return "";

    const { title, subtitle, description, badges } = config.displayFields;
    let text = `${config.name}: ${getFieldValue(item.itemData, title)}\n`;
    
    if (subtitle) {
      text += `Type: ${getFieldValue(item.itemData, subtitle)}\n`;
    }
    
    if (description) {
      text += `\nDescription:\n${getFieldValue(item.itemData, description)}\n`;
    }
    
    if (badges) {
      const badgeValues = badges
        .map(badge => getFieldValue(item.itemData, badge))
        .filter(Boolean);
      if (badgeValues.length > 0) {
        text += `\nTags: ${badgeValues.join(", ")}\n`;
      }
    }
    
    return text;
  };

  // Generic content card renderer
  const renderContentCard = (item: SavedItem) => {
    const mapping = getMappingById(item.itemType);
    if (!mapping || !item.itemData) {
      return null;
    }

    const { title, subtitle, description, badges } = mapping.displayFields;
    const IconComponent = CONTENT_TYPE_ICONS[item.itemType] || Package;
    const contentText = generateContentText(item);
    
    const titleValue = getFieldValue(item.itemData, title);
    const subtitleValue = subtitle ? getFieldValue(item.itemData, subtitle) : "";
    const descriptionValue = description ? getFieldValue(item.itemData, description) : "";
    const badgeValues = badges ? badges
      .map(badge => getFieldValue(item.itemData, badge))
      .filter(Boolean) : [];

    return (
      <Card key={item.id} className="hover-elevate">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="h-5 w-5 text-primary" />
                {titleValue}
              </CardTitle>
              {subtitleValue && (
                <CardDescription className="mt-1">
                  {subtitleValue}
                </CardDescription>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{config.name}</Badge>
                {badgeValues.map((badge, index) => (
                  <Badge key={index} variant="secondary">{badge}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(item.itemType, item.itemId)}
                data-testid={`button-edit-${item.itemType}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(contentText)}
                data-testid={`button-copy-${item.itemType}`}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUnsave(item.itemType, item.itemId)}
                disabled={unsaveMutation.isPending}
                data-testid={`button-unsave-${item.itemType}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {descriptionValue && (
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Description:</span>
                <p className="text-sm text-muted-foreground mt-1">{descriptionValue}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  // Filter items by type and search query
  const filterItems = (type?: string) => {
    let filtered = savedItems;
    
    // Filter by type
    if (type && type !== "all") {
      filtered = filtered.filter(item => item.itemType === type);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const config = CONTENT_TYPE_CONFIGS[item.itemType];
        if (!config || !item.itemData) return false;
        
        const searchFields = [
          config.displayFields.title,
          config.displayFields.subtitle,
          config.displayFields.description,
          ...(config.displayFields.badges || [])
        ].filter(Boolean);
        
        return searchFields.some(field => {
          if (!field) return false;
          const value = getFieldValue(item.itemData, field);
          return value.toLowerCase().includes(query);
        });
      });
    }
    
    return filtered;
  };

  const renderContent = () => {
    const filteredItems = filterItems(activeTab);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load saved items. Please try again.</p>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      const isEmpty = savedItems.length === 0;
      const isFiltered = activeTab !== "all" || searchQuery.trim() !== "";
      
      return (
        <div className="text-center py-12">
          <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          {isEmpty ? (
            <>
              <p className="text-muted-foreground">No saved items found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start creating and saving content with our generators!
              </p>
            </>
          ) : isFiltered ? (
            <>
              <p className="text-muted-foreground">No items match your current filters.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or category selection.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">No items found.</p>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => renderContentCard(item))}
      </div>
    );
  };

  const getItemCount = (type?: string) => {
    return filterItems(type).length;
  };

  // Get unique content types that exist in saved items
  const getAvailableContentTypes = () => {
    const uniqueTypes = Array.from(new Set(savedItems.map(item => item.itemType)));
    return uniqueTypes
      .map(type => CONTENT_TYPE_CONFIGS[type])
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const availableTypes = getAvailableContentTypes();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">My Notebook</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your saved content from all generators in one organized place.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search your saved content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-notebook-search"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Dynamic tabs based on available content types */}
        <TabsList className={`grid w-full ${availableTypes.length < 6 ? `grid-cols-${availableTypes.length + 1}` : 'grid-flow-col overflow-x-auto'}`}>
          <TabsTrigger value="all" data-testid="tab-all-items">
            All ({getItemCount('all')})
          </TabsTrigger>
          {availableTypes.map((config) => (
            <TabsTrigger 
              key={config.id} 
              value={config.id} 
              data-testid={`tab-${config.id}`}
            >
              {config.name}s ({getItemCount(config.id)})
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All content */}
        <TabsContent value="all" className="mt-6">
          {renderContent()}
        </TabsContent>
        
        {/* Dynamic content tabs */}
        {availableTypes.map((config) => (
          <TabsContent key={config.id} value={config.id} className="mt-6">
            {renderContent()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}