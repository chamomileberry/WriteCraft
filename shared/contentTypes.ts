// Canonical content type mapping for consistent routing and API calls
export interface ContentTypeMapping {
  id: string;
  name: string;
  urlSegment: string;
  apiBase: string;
  displayFields: {
    title: string;
    subtitle?: string;
    description?: string;
    badges?: string[];
  };
}

// Single source of truth for all content type mappings
export const CONTENT_TYPE_MAPPINGS: { [key: string]: ContentTypeMapping } = {
  character: {
    id: "character",
    name: "Character",
    urlSegment: "characters",
    apiBase: "/api/characters",
    displayFields: {
      title: "name",
      subtitle: "occupation",
      description: "backstory",
      badges: ["gender", "genre"]
    }
  },
  location: {
    id: "location", 
    name: "Location",
    urlSegment: "locations",
    apiBase: "/api/locations",
    displayFields: {
      title: "name",
      subtitle: "locationType", 
      description: "description",
      badges: ["climate", "genre"]
    }
  },
  organization: {
    id: "organization",
    name: "Organization", 
    urlSegment: "organizations",
    apiBase: "/api/organizations",
    displayFields: {
      title: "name",
      subtitle: "organizationType",
      description: "purpose",
      badges: ["size", "influence"]
    }
  },
  species: {
    id: "species",
    name: "Species",
    urlSegment: "species",
    apiBase: "/api/species", 
    displayFields: {
      title: "name",
      subtitle: "speciesType",
      description: "physicalDescription",
      badges: ["habitat", "intelligence"]
    }
  },
  creature: {
    id: "creature",
    name: "Creature",
    urlSegment: "creatures",
    apiBase: "/api/creatures",
    displayFields: {
      title: "name",
      subtitle: "creatureType", 
      description: "physicalDescription",
      badges: ["habitat", "genre"]
    }
  },
  setting: {
    id: "setting",
    name: "Setting",
    urlSegment: "settings", 
    apiBase: "/api/settings",
    displayFields: {
      title: "name",
      subtitle: "location",
      description: "description", 
      badges: ["climate", "genre"]
    }
  },
  item: {
    id: "item",
    name: "Item",
    urlSegment: "items",
    apiBase: "/api/items",
    displayFields: {
      title: "name",
      subtitle: "itemType",
      description: "description",
      badges: ["rarity", "material"]
    }
  },
  weapon: {
    id: "weapon",
    name: "Weapon",
    urlSegment: "weapons",
    apiBase: "/api/weapons", 
    displayFields: {
      title: "name",
      subtitle: "weaponType",
      description: "description",
      badges: ["material", "rarity"]
    }
  },
  armor: {
    id: "armor",
    name: "Armor",
    urlSegment: "armor",
    apiBase: "/api/armor",
    displayFields: {
      title: "name",
      subtitle: "armorType",
      description: "description",
      badges: ["material", "protection"]
    }
  },
  food: {
    id: "food",
    name: "Food", 
    urlSegment: "foods",
    apiBase: "/api/foods",
    displayFields: {
      title: "name",
      subtitle: "foodType",
      description: "description",
      badges: ["origin", "rarity"]
    }
  },
  drink: {
    id: "drink",
    name: "Drink",
    urlSegment: "drinks", 
    apiBase: "/api/drinks",
    displayFields: {
      title: "name",
      subtitle: "drinkType",
      description: "description",
      badges: ["alcoholContent", "effects"]
    }
  },
  religion: {
    id: "religion",
    name: "Religion",
    urlSegment: "religions",
    apiBase: "/api/religions",
    displayFields: {
      title: "name",
      subtitle: "religionType",
      description: "beliefs",
      badges: ["pantheon", "domain"]
    }
  },
  language: {
    id: "language",
    name: "Language",
    urlSegment: "languages",
    apiBase: "/api/languages",
    displayFields: {
      title: "name", 
      subtitle: "languageFamily",
      description: "description",
      badges: ["speakers", "complexity"]
    }
  },
  plot: {
    id: "plot",
    name: "Plot",
    urlSegment: "plots",
    apiBase: "/api/plots",
    displayFields: {
      title: "title",
      subtitle: "plotType",
      description: "summary",
      badges: ["genre", "complexity"]
    }
  },
  prompt: {
    id: "prompt", 
    name: "Prompt",
    urlSegment: "prompts",
    apiBase: "/api/prompts",
    displayFields: {
      title: "title",
      subtitle: "promptType",
      description: "content",
      badges: ["genre", "difficulty"]
    }
  },
  theme: {
    id: "theme",
    name: "Theme", 
    urlSegment: "themes",
    apiBase: "/api/themes",
    displayFields: {
      title: "name",
      subtitle: "themeType",
      description: "description",
      badges: ["genre", "complexity"]
    }
  },
  mood: {
    id: "mood",
    name: "Mood",
    urlSegment: "moods",
    apiBase: "/api/moods",
    displayFields: {
      title: "name",
      subtitle: "moodType", 
      description: "description",
      badges: ["intensity", "genre"]
    }
  },
  plant: {
    id: "plant",
    name: "Plant",
    urlSegment: "plants",
    apiBase: "/api/plants",
    displayFields: {
      title: "name",
      subtitle: "plantType",
      description: "description",
      badges: ["habitat", "rarity"]
    }
  },
  animal: {
    id: "animal",
    name: "Animal",
    urlSegment: "animals", 
    apiBase: "/api/animals",
    displayFields: {
      title: "name",
      subtitle: "animalType",
      description: "description",
      badges: ["habitat", "size"]
    }
  },
  ethnicity: {
    id: "ethnicity",
    name: "Ethnicity",
    urlSegment: "ethnicities",
    apiBase: "/api/ethnicities",
    displayFields: {
      title: "name",
      subtitle: "ethnicType",
      description: "description",
      badges: ["region", "population"]
    }
  },
  culture: {
    id: "culture",
    name: "Culture",
    urlSegment: "cultures",
    apiBase: "/api/cultures", 
    displayFields: {
      title: "name",
      subtitle: "cultureType",
      description: "description",
      badges: ["region", "influence"]
    }
  },
  document: {
    id: "document",
    name: "Document",
    urlSegment: "documents",
    apiBase: "/api/documents",
    displayFields: {
      title: "title",
      subtitle: "documentType",
      description: "content",
      badges: ["author", "era"]
    }
  },
  settlement: {
    id: "settlement",
    name: "Settlement",
    urlSegment: "settlements",
    apiBase: "/api/settlements",
    displayFields: {
      title: "name",
      subtitle: "settlementType",
      description: "description", 
      badges: ["population", "government"]
    }
  },
  society: {
    id: "society",
    name: "Society",
    urlSegment: "societies",
    apiBase: "/api/societies",
    displayFields: {
      title: "name",
      subtitle: "societyType",
      description: "description",
      badges: ["government", "influence"]
    }
  },
  faction: {
    id: "faction",
    name: "Faction",
    urlSegment: "factions",
    apiBase: "/api/factions",
    displayFields: {
      title: "name",
      subtitle: "factionType", 
      description: "goals",
      badges: ["influence", "alignment"]
    }
  },
  militaryunit: {
    id: "militaryunit",
    name: "Military Unit",
    urlSegment: "military-units", 
    apiBase: "/api/military-units",
    displayFields: {
      title: "name",
      subtitle: "unitType",
      description: "description",
      badges: ["size", "specialization"]
    }
  },
  accessory: {
    id: "accessory",
    name: "Accessory",
    urlSegment: "accessories",
    apiBase: "/api/accessories",
    displayFields: {
      title: "name",
      subtitle: "accessoryType",
      description: "description",
      badges: ["material", "value"]
    }
  },
  clothing: {
    id: "clothing",
    name: "Clothing",
    urlSegment: "clothing",
    apiBase: "/api/clothing",
    displayFields: {
      title: "name",
      subtitle: "clothingType",
      description: "description",
      badges: ["material", "style"]
    }
  },
  material: {
    id: "material",
    name: "Material",
    urlSegment: "materials", 
    apiBase: "/api/materials",
    displayFields: {
      title: "name",
      subtitle: "materialType",
      description: "description",
      badges: ["rarity", "properties"]
    }
  },
  resource: {
    id: "resource",
    name: "Resource",
    urlSegment: "resources",
    apiBase: "/api/resources",
    displayFields: {
      title: "name",
      subtitle: "resourceType",
      description: "description",
      badges: ["rarity", "origin"]
    }
  },
  myth: {
    id: "myth",
    name: "Myth",
    urlSegment: "myths",
    apiBase: "/api/myths",
    displayFields: {
      title: "title",
      subtitle: "mythType",
      description: "summary",
      badges: ["origin", "significance"]
    }
  },
  legend: {
    id: "legend", 
    name: "Legend",
    urlSegment: "legends",
    apiBase: "/api/legends",
    displayFields: {
      title: "title",
      subtitle: "legendType",
      description: "summary",
      badges: ["hero", "era"]
    }
  },
  tradition: {
    id: "tradition",
    name: "Tradition",
    urlSegment: "traditions",
    apiBase: "/api/traditions",
    displayFields: {
      title: "name",
      subtitle: "traditionType",
      description: "description",
      badges: ["culture", "significance"]
    }
  },
  ritual: {
    id: "ritual",
    name: "Ritual",
    urlSegment: "rituals", 
    apiBase: "/api/rituals",
    displayFields: {
      title: "name",
      subtitle: "ritualType",
      description: "description",
      badges: ["purpose", "participants"]
    }
  },
  event: {
    id: "event",
    name: "Event",
    urlSegment: "events",
    apiBase: "/api/events",
    displayFields: {
      title: "name",
      subtitle: "eventType",
      description: "description",
      badges: ["date", "impact"]
    }
  },
  building: {
    id: "building",
    name: "Building",
    urlSegment: "buildings",
    apiBase: "/api/buildings",
    displayFields: {
      title: "name",
      subtitle: "buildingType",
      description: "description", 
      badges: ["material", "purpose"]
    }
  },
  transportation: {
    id: "transportation",
    name: "Transportation",
    urlSegment: "transportation",
    apiBase: "/api/transportation",
    displayFields: {
      title: "name",
      subtitle: "transportationType", 
      description: "description",
      badges: ["speed", "capacity"]
    }
  },
  naturallaw: {
    id: "naturallaw",
    name: "Natural Law",
    urlSegment: "natural-laws",
    apiBase: "/api/natural-laws",
    displayFields: {
      title: "name",
      subtitle: "lawType",
      description: "description",
      badges: ["scope", "effects"]
    }
  },
  technology: {
    id: "technology",
    name: "Technology",
    urlSegment: "technologies",
    apiBase: "/api/technologies",
    displayFields: {
      title: "name",
      subtitle: "technologyType",
      description: "description",
      badges: ["era", "complexity"]
    }
  },
  spell: {
    id: "spell",
    name: "Spell",
    urlSegment: "spells",
    apiBase: "/api/spells",
    displayFields: {
      title: "name",
      subtitle: "spellType", 
      description: "description",
      badges: ["school", "level"]
    }
  },
  description: {
    id: "description",
    name: "Description",
    urlSegment: "descriptions",
    apiBase: "/api/descriptions",
    displayFields: {
      title: "title",
      subtitle: "descriptionType",
      description: "content",
      badges: ["genre"]
    }
  },
  
  // New Content Types
  familyTree: {
    id: "familyTree",
    name: "Family Tree",
    urlSegment: "family-trees",
    apiBase: "/api/family-trees",
    displayFields: {
      title: "name",
      subtitle: "treeType",
      description: "description",
      badges: ["generations", "genre"]
    }
  },
  timeline: {
    id: "timeline",
    name: "Timeline",
    urlSegment: "timelines",
    apiBase: "/api/timelines",
    displayFields: {
      title: "name",
      subtitle: "timelineType",
      description: "description",
      badges: ["timeScale", "scope"]
    }
  },
  map: {
    id: "map",
    name: "Map",
    urlSegment: "maps",
    apiBase: "/api/maps",
    displayFields: {
      title: "name",
      subtitle: "mapType",
      description: "description",
      badges: ["scale", "genre"]
    }
  },
  ceremony: {
    id: "ceremony",
    name: "Ceremony",
    urlSegment: "ceremonies",
    apiBase: "/api/ceremonies",
    displayFields: {
      title: "name",
      subtitle: "ceremonyType",
      description: "description",
      badges: ["purpose", "duration"]
    }
  },
  music: {
    id: "music",
    name: "Music",
    urlSegment: "music",
    apiBase: "/api/music",
    displayFields: {
      title: "name",
      subtitle: "musicType",
      description: "description",
      badges: ["tempo", "genre"]
    }
  },
  dance: {
    id: "dance",
    name: "Dance",
    urlSegment: "dances",
    apiBase: "/api/dances",
    displayFields: {
      title: "name",
      subtitle: "danceType",
      description: "description",
      badges: ["formation", "difficulty"]
    }
  },
  law: {
    id: "law",
    name: "Law",
    urlSegment: "laws",
    apiBase: "/api/laws",
    displayFields: {
      title: "name",
      subtitle: "lawType",
      description: "description",
      badges: ["jurisdiction", "enforcement"]
    }
  },
  policy: {
    id: "policy",
    name: "Policy",
    urlSegment: "policies",
    apiBase: "/api/policies",
    displayFields: {
      title: "name",
      subtitle: "policyType",
      description: "description",
      badges: ["scope", "authority"]
    }
  },
  potion: {
    id: "potion",
    name: "Potion",
    urlSegment: "potions",
    apiBase: "/api/potions",
    displayFields: {
      title: "name",
      subtitle: "potionType",
      description: "description",
      badges: ["rarity", "effect"]
    }
  }
};

// Helper function to get mapping by URL segment
export function getMappingByUrlSegment(urlSegment: string): ContentTypeMapping | undefined {
  return Object.values(CONTENT_TYPE_MAPPINGS).find(mapping => mapping.urlSegment === urlSegment);
}

// Helper function to get mapping by ID  
export function getMappingById(id: string): ContentTypeMapping | undefined {
  return CONTENT_TYPE_MAPPINGS[id];
}