import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, MapPin, Building, Zap, Book, FileText, UtensilsCrossed, Wine, Sword, Shield, Star, Globe, Users, Flag, Crown, Target, Scroll, Lightbulb, Rocket, TreePine, Package, Home, Palette, PaintBucket, Mountain, Car, Calculator, Feather, Sparkles, Circle, GitBranch, Clock, Camera, Music, PersonStanding, Scale, FileText as Policy, FlaskConical } from "lucide-react";

interface ContentType {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CONTENT_TYPES: ContentType[] = [
  // Characters & People
  { id: "character", name: "Character", description: "Create detailed fictional characters", category: "People", icon: User },
  { id: "ethnicity", name: "Ethnicity", description: "Define cultural ethnic groups", category: "People", icon: Users },
  { id: "culture", name: "Culture", description: "Build rich cultural backgrounds", category: "People", icon: Globe },
  { id: "familyTree", name: "Family Tree", description: "Map family lineages and relationships", category: "People", icon: GitBranch },
  
  // Places & Locations
  { id: "location", name: "Location", description: "Design memorable places and settings", category: "Places", icon: MapPin },
  { id: "settlement", name: "Settlement", description: "Create towns, cities, and communities", category: "Places", icon: Building },
  { id: "building", name: "Building", description: "Design structures and architecture", category: "Places", icon: Home },
  { id: "map", name: "Map", description: "Create detailed geographical maps", category: "Places", icon: Camera },
  
  // Organizations & Groups
  { id: "organization", name: "Organization", description: "Create guilds, companies, and institutions", category: "Groups", icon: Building },
  { id: "society", name: "Society", description: "Build complex social structures", category: "Groups", icon: Users },
  { id: "faction", name: "Faction", description: "Design competing groups and alliances", category: "Groups", icon: Flag },
  { id: "militaryunit", name: "Military Unit", description: "Create armies, guards, and military forces", category: "Groups", icon: Crown },
  
  // Creatures & Life
  { id: "species", name: "Species", description: "Design unique sapient species", category: "Life", icon: Star },
  { id: "animal", name: "Animal", description: "Create fauna for your world", category: "Life", icon: Circle },
  
  // Items & Objects
  { id: "item", name: "Item", description: "Create unique objects and artifacts", category: "Items", icon: Package },
  { id: "weapon", name: "Weapon", description: "Design tools of war and combat", category: "Items", icon: Sword },
  { id: "armor", name: "Armor", description: "Create protective gear and equipment", category: "Items", icon: Shield },
  { id: "accessory", name: "Accessory", description: "Design jewelry, trinkets, and accessories", category: "Items", icon: Star },
  { id: "clothing", name: "Clothing", description: "Create garments and fashion", category: "Items", icon: Palette },
  { id: "transportation", name: "Transportation", description: "Design vehicles and mounts", category: "Items", icon: Car },
  
  // Materials & Resources
  { id: "material", name: "Material", description: "Define substances and raw materials", category: "Resources", icon: PaintBucket },
  { id: "resource", name: "Resource", description: "Create valuable commodities", category: "Resources", icon: Package },
  { id: "food", name: "Food", description: "Design cuisines and dishes", category: "Resources", icon: UtensilsCrossed },
  { id: "drink", name: "Drink", description: "Create beverages and potions", category: "Resources", icon: Wine },
  { id: "potion", name: "Potion", description: "Create magical brews and elixirs", category: "Resources", icon: FlaskConical },
  
  // Knowledge & Culture
  { id: "document", name: "Document", description: "Create books, scrolls, and records", category: "Knowledge", icon: FileText },
  { id: "language", name: "Language", description: "Design communication systems", category: "Knowledge", icon: Book },
  { id: "religion", name: "Religion", description: "Build belief systems and faiths", category: "Knowledge", icon: Star },
  { id: "myth", name: "Myth", description: "Create legendary stories", category: "Knowledge", icon: Scroll },
  { id: "legend", name: "Legend", description: "Design heroic tales", category: "Knowledge", icon: Crown },
  { id: "tradition", name: "Tradition", description: "Build cultural practices", category: "Knowledge", icon: Feather },
  { id: "ritual", name: "Ritual", description: "Create ceremonial practices", category: "Knowledge", icon: Sparkles },
  { id: "ceremony", name: "Ceremony", description: "Design important cultural ceremonies", category: "Knowledge", icon: Crown },
  { id: "music", name: "Music", description: "Create songs and musical compositions", category: "Knowledge", icon: Music },
  { id: "dance", name: "Dance", description: "Design choreographed performances", category: "Knowledge", icon: PersonStanding },
  { id: "law", name: "Law", description: "Create legal codes and regulations", category: "Knowledge", icon: Scale },
  { id: "policy", name: "Policy", description: "Design governance and administrative policies", category: "Knowledge", icon: Policy },
  
  // Events & Time
  { id: "event", name: "Event", description: "Design significant happenings", category: "Events", icon: Target },
  { id: "timeline", name: "Timeline", description: "Create chronological sequences of events", category: "Events", icon: Clock },
  
  // Magic & Technology
  { id: "technology", name: "Technology", description: "Create innovations and inventions", category: "Science", icon: Lightbulb },
  { id: "spell", name: "Spell", description: "Design magical effects", category: "Science", icon: Zap },
  { id: "naturallaw", name: "Natural Law", description: "Define world physics and rules", category: "Science", icon: Calculator },
];

interface ContentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (contentType: string) => void;
}

export default function ContentTypeModal({ isOpen, onClose, onSelectType }: ContentTypeModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(CONTENT_TYPES.map(type => type.category)));
  
  const filteredTypes = CONTENT_TYPES.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || type.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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