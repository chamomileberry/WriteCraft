import { 
  User, MapPin, Building, Zap, Book, FileText, UtensilsCrossed, Wine, Sword, Shield, 
  Star, Globe, Users, Flag, Crown, Target, Scroll, Lightbulb, Package, Home, Palette, 
  PaintBucket, Car, Calculator, Feather, Sparkles, Circle, GitBranch, Clock, Camera, 
  Music, PersonStanding, Scale, FileText as Policy, FlaskConical, Briefcase, TreePine, 
  Mountain, StickyNote 
} from "lucide-react";

/**
 * Content type definitions and configurations
 * Centralized to eliminate duplication across components
 */

export interface ContentType {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CONTENT_TYPES: ContentType[] = [
  // Characters & People
  { id: "character", name: "Character", description: "Create detailed fictional characters", category: "People", icon: User },
  { id: "ethnicity", name: "Ethnicity", description: "Define cultural ethnic groups", category: "People", icon: Users },
  { id: "culture", name: "Culture", description: "Build rich cultural backgrounds", category: "People", icon: Globe },
  { id: "profession", name: "Profession", description: "Create detailed job roles and professions", category: "People", icon: Briefcase },
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

// Content type icon mapping for saved items and other components
export const CONTENT_TYPE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  // Quick Notes
  quickNote: StickyNote,
  
  // People & Characters
  character: User,
  ethnicity: Users,
  culture: Globe,
  profession: Briefcase,
  familyTree: GitBranch,
  
  // Places & Locations
  location: MapPin,
  settlement: Building,
  building: Home,
  geography: Mountain,
  territory: MapPin,
  district: Building,
  city: Building,
  country: Flag,
  map: Camera,
  
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
  transportation: Car,
  
  // Knowledge & Culture
  document: Package,
  language: Feather,
  religion: Star,
  myth: Package,
  legend: Package,
  tradition: Package,
  ritual: Star,
  ceremony: Crown,
  music: Music,
  dance: PersonStanding,
  law: Scale,
  policy: Policy,
  
  // Events & Time
  event: Package,
  timeline: Package,
  
  // Nature & Environment
  plant: TreePine,
  condition: Package,
  naturallaw: Package,
  
  // Technology & Magic
  technology: Calculator,
  spell: Sparkles,
  
  // Story Elements
  plot: Package,
  conflict: Package,
  potion: FlaskConical,
};

// Content categories for organization
export const CONTENT_CATEGORIES = [
  "People", "Places", "Groups", "Life", "Items", "Resources", 
  "Knowledge", "Events", "Science"
];