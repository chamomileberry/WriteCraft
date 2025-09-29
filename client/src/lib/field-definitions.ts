import { FormField } from "@/components/forms/types";

/**
 * Common field definitions library for content type forms
 * This eliminates duplication and ensures consistency across all forms
 * 
 * ENHANCED VERSION - Includes all commonly repeated fields
 */

// ============================================================================
// OPTION CONSTANTS
// ============================================================================

// Genre options array - reused across many content types
export const GENRE_OPTIONS = [
  "Fantasy", "Science Fiction", "Literary Fiction", "Mystery", "Romance", 
  "Thriller", "Horror", "Historical Fiction", "Contemporary Fiction", "Crime", 
  "Adventure", "Western", "Dystopian", "Post-Apocalyptic", "Steampunk", 
  "Cyberpunk", "Space Opera", "Urban Fantasy", "Paranormal Romance", 
  "Cozy Mystery", "Hard Boiled", "Young Adult", "Children's", "Comedy", 
  "Satire", "Drama", "Political Fiction", "Magical Realism", "Gothic", 
  "Noir", "Superhero", "Military", "Espionage", "Techno-Thriller", 
  "Medical Thriller", "Legal Thriller", "Psychological Thriller", 
  "Biographical Fiction", "Alternate History", "Time Travel", 
  "Fairy Tale Retelling", "Mythology", "Folklore", "Other"
];

// Rarity options - commonly used for items, weapons, artifacts
export const RARITY_OPTIONS = [
  "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"
];

// Difficulty levels - used in guides and various content
export const DIFFICULTY_OPTIONS = [
  "Beginner", "Intermediate", "Advanced", "Expert"
];

// Extended difficulty options for brewing, crafting, etc.
export const EXTENDED_DIFFICULTY_OPTIONS = [
  "Trivial", "Easy", "Moderate", "Hard", "Extreme", "Legendary"
];

// Social status options
export const SOCIAL_STATUS_OPTIONS = [
  "Low", "Middle", "High", "Nobility"
];

// Demand/intensity level options
export const DEMAND_LEVEL_OPTIONS = [
  "Low", "Moderate", "High", "Extreme"
];

// Status/condition options
export const STATUS_OPTIONS = [
  "Living", "Dead", "Constructed", "Evolving", "Extinct", "Revived"
];

// Physical condition options
export const CONDITION_OPTIONS = [
  "Pristine", "Good", "Fair", "Poor", "Damaged", "Fragmentary", "Ruins"
];

// Size options
export const SIZE_OPTIONS = [
  "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"
];

// ============================================================================
// CORE FIELD CREATORS
// ============================================================================

/**
 * Creates a standard name field
 * @param contentType - The type of content (e.g., "weapon", "character") 
 * @param options - Optional overrides for placeholder, description, etc.
 */
export function createNameField(
  contentType: string, 
  options: Partial<FormField> = {}
): FormField {
  return {
    name: "name",
    label: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Name`,
    type: "text",
    placeholder: `Enter ${contentType} name...`,
    description: `The name of this ${contentType}`,
    required: true,
    ...options
  };
}

/**
 * Creates a standard title field (alternative to name)
 * @param options - Optional overrides
 */
export function createTitleField(options: Partial<FormField> = {}): FormField {
  return {
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "Enter title...",
    description: "The title of this item",
    required: true,
    ...options
  };
}

/**
 * Creates a standard description field
 * @param contentType - The type of content
 * @param options - Optional overrides
 */
export function createDescriptionField(
  contentType: string,
  options: Partial<FormField> = {}
): FormField {
  return {
    name: "description",
    label: "Description",
    type: "textarea", 
    placeholder: `Detailed description of the ${contentType}...`,
    description: `What does this ${contentType} look like and how does it function?`,
    ...options
  };
}

/**
 * Creates a standard genre selection field
 * @param options - Optional overrides
 */
export function createGenreField(options: Partial<FormField> = {}): FormField {
  return {
    name: "genre",
    label: "Genre", 
    type: "select",
    options: GENRE_OPTIONS,
    placeholder: "Select genre (optional)",
    description: "The genre or setting type this fits into - helps with AI generation and thematic consistency",
    ...options
  };
}

/**
 * Creates a standard history/background field
 * @param contentType - The type of content
 * @param options - Optional overrides
 */
export function createHistoryField(
  contentType: string,
  options: Partial<FormField> = {}
): FormField {
  return {
    name: "history",
    label: "History",
    type: "textarea",
    placeholder: `The ${contentType}'s origin story and past...`,
    description: `The background and historical significance of this ${contentType}`,
    ...options
  };
}

// ============================================================================
// NEW: COMMONLY REPEATED FIELDS
// ============================================================================

/**
 * Creates a standard origin field
 * @param options - Optional overrides
 */
export function createOriginField(options: Partial<FormField> = {}): FormField {
  return {
    name: "origin",
    label: "Origin",
    type: "text",
    placeholder: "Where does it come from?",
    description: "Geographic or cultural origin",
    ...options
  };
}

/**
 * Creates a standard purpose field
 * @param options - Optional overrides
 */
export function createPurposeField(options: Partial<FormField> = {}): FormField {
  return {
    name: "purpose",
    label: "Purpose",
    type: "textarea",
    placeholder: "What is its purpose?",
    description: "Primary purpose or function",
    ...options
  };
}

/**
 * Creates a standard abilities field (tags)
 * @param options - Optional overrides
 */
export function createAbilitiesField(options: Partial<FormField> = {}): FormField {
  return {
    name: "abilities",
    label: "Abilities",
    type: "tags",
    placeholder: "Add special abilities",
    description: "Special abilities, powers, or skills",
    ...options
  };
}

/**
 * Creates a cultural significance field
 * @param options - Optional overrides
 */
export function createCulturalSignificanceField(options: Partial<FormField> = {}): FormField {
  return {
    name: "culturalSignificance",
    label: "Cultural Significance",
    type: "textarea",
    placeholder: "Cultural importance and role in society...",
    description: "Role in culture and society",
    ...options
  };
}

/**
 * Creates a symbolism field
 * @param options - Optional overrides
 */
export function createSymbolismField(options: Partial<FormField> = {}): FormField {
  return {
    name: "symbolism",
    label: "Symbolism",
    type: "textarea",
    placeholder: "What does this symbolize?",
    description: "Symbolic meaning and significance",
    ...options
  };
}

/**
 * Creates a climate field
 * @param options - Optional overrides
 */
export function createClimateField(options: Partial<FormField> = {}): FormField {
  return {
    name: "climate",
    label: "Climate",
    type: "text",
    placeholder: "Weather and climate patterns",
    description: "Climate and weather conditions",
    ...options
  };
}

/**
 * Creates a habitat field
 * @param options - Optional overrides
 */
export function createHabitatField(options: Partial<FormField> = {}): FormField {
  return {
    name: "habitat",
    label: "Habitat",
    type: "text",
    placeholder: "Where does it live?",
    description: "Natural environment and habitat",
    ...options
  };
}

/**
 * Creates a weight field
 * @param options - Optional overrides
 */
export function createWeightField(options: Partial<FormField> = {}): FormField {
  return {
    name: "weight",
    label: "Weight",
    type: "text",
    placeholder: "3 lbs, heavy, light, etc.",
    description: "Physical weight",
    ...options
  };
}

/**
 * Creates a cost field (distinct from value - ongoing vs purchase)
 * @param options - Optional overrides
 */
export function createCostField(options: Partial<FormField> = {}): FormField {
  return {
    name: "cost",
    label: "Cost",
    type: "text",
    placeholder: "How expensive is it?",
    description: "Economic cost and affordability",
    ...options
  };
}

/**
 * Creates a properties field (tags)
 * @param options - Optional overrides
 */
export function createPropertiesField(options: Partial<FormField> = {}): FormField {
  return {
    name: "properties",
    label: "Properties",
    type: "tags",
    placeholder: "Add properties",
    description: "Special properties and characteristics",
    ...options
  };
}

/**
 * Creates an appearance field
 * @param options - Optional overrides
 */
export function createAppearanceField(options: Partial<FormField> = {}): FormField {
  return {
    name: "appearance",
    label: "Appearance",
    type: "text",
    placeholder: "What does it look like?",
    description: "Visual appearance and characteristics",
    ...options
  };
}

/**
 * Creates a behavior field
 * @param options - Optional overrides
 */
export function createBehaviorField(options: Partial<FormField> = {}): FormField {
  return {
    name: "behavior",
    label: "Behavior",
    type: "textarea",
    placeholder: "How does it behave?",
    description: "Behavioral patterns and temperament",
    ...options
  };
}

/**
 * Creates a duration field
 * @param options - Optional overrides
 */
export function createDurationField(options: Partial<FormField> = {}): FormField {
  return {
    name: "duration",
    label: "Duration",
    type: "text",
    placeholder: "How long does it last?",
    description: "Length of time or duration",
    ...options
  };
}

/**
 * Creates an effect field
 * @param options - Optional overrides
 */
export function createEffectField(options: Partial<FormField> = {}): FormField {
  return {
    name: "effect",
    label: "Effect",
    type: "textarea",
    placeholder: "What effect does it have?",
    description: "Primary effect or outcome",
    ...options
  };
}

/**
 * Creates a population field
 * @param options - Optional overrides
 */
export function createPopulationField(options: Partial<FormField> = {}): FormField {
  return {
    name: "population",
    label: "Population",
    type: "text",
    placeholder: "Who lives here?",
    description: "Population size and demographics",
    ...options
  };
}

/**
 * Creates a government field
 * @param options - Optional overrides
 */
export function createGovernmentField(options: Partial<FormField> = {}): FormField {
  return {
    name: "government",
    label: "Government",
    type: "text",
    placeholder: "How is it governed?",
    description: "Political structure and leadership",
    ...options
  };
}

/**
 * Creates an economy field
 * @param options - Optional overrides
 */
export function createEconomyField(options: Partial<FormField> = {}): FormField {
  return {
    name: "economy",
    label: "Economy",
    type: "text",
    placeholder: "Economic activities...",
    description: "Economic system and primary industries",
    ...options
  };
}

/**
 * Creates a culture field
 * @param options - Optional overrides
 */
export function createCultureField(options: Partial<FormField> = {}): FormField {
  return {
    name: "culture",
    label: "Culture",
    type: "text",
    placeholder: "Cultural characteristics...",
    description: "Cultural practices and traditions",
    ...options
  };
}

// ============================================================================
// EXISTING FIELD CREATORS
// ============================================================================

/**
 * Creates a standard rarity field
 * @param options - Optional overrides
 */
export function createRarityField(options: Partial<FormField> = {}): FormField {
  return {
    name: "rarity",
    label: "Rarity",
    type: "select",
    options: RARITY_OPTIONS,
    placeholder: "Select rarity",
    description: "How rare and valuable this item is",
    ...options
  };
}

/**
 * Creates a standard value/cost field
 * @param options - Optional overrides
 */
export function createValueField(options: Partial<FormField> = {}): FormField {
  return {
    name: "value",
    label: "Value",
    type: "text",
    placeholder: "500 gold, priceless, etc.",
    description: "The monetary or cultural value",
    ...options
  };
}

/**
 * Creates a standard materials field (tags)
 * @param options - Optional overrides
 */
export function createMaterialsField(options: Partial<FormField> = {}): FormField {
  return {
    name: "materials",
    label: "Materials",
    type: "tags",
    placeholder: "steel, wood, leather...",
    description: "Materials used in construction (comma-separated)",
    ...options
  };
}

/**
 * Creates a type selection field for content types
 * @param contentType - The content type (e.g., "weapon", "building")
 * @param typeOptions - Array of type options
 * @param options - Optional overrides
 */
export function createTypeField(
  contentType: string,
  typeOptions: string[],
  options: Partial<FormField> = {}
): FormField {
  return {
    name: `${contentType}Type`,
    label: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Type`,
    type: "select",
    options: typeOptions,
    placeholder: `Select ${contentType} type`,
    description: `What type of ${contentType} is this?`,
    ...options
  };
}

/**
 * Creates a notebook field for content association
 * @param options - Optional overrides
 */
export function createNotebookField(options: Partial<FormField> = {}): FormField {
  return {
    name: "notebookId",
    label: "Notebook",
    type: "autocomplete",
    endpoint: "/api/notebooks",
    labelField: "title",
    valueField: "id",
    multiple: false,
    placeholder: "Search or select a notebook...",
    description: "Which notebook should this be saved in?",
    ...options
  };
}

// ============================================================================
// FIELD GROUPS - Pre-defined sets of related fields
// ============================================================================

/**
 * Basic info fields common to most content types
 */
export function createBasicInfoFields(contentType: string, typeOptions?: string[]): FormField[] {
  const fields = [
    createNameField(contentType),
    createDescriptionField(contentType),
    createGenreField()
  ];

  if (typeOptions) {
    fields.splice(1, 0, createTypeField(contentType, typeOptions));
  }

  return fields;
}

/**
 * Value and rarity fields for items/objects
 */
export function createValueFields(): FormField[] {
  return [
    createRarityField(),
    createValueField()
  ];
}

/**
 * Physical construction fields for tangible objects
 */
export function createPhysicalFields(contentType: string): FormField[] {
  return [
    createMaterialsField(),
    {
      name: "craftsmanship",
      label: "Craftsmanship",
      type: "text",
      placeholder: "Masterwork, crude, ornate, etc.",
      description: "The quality and style of construction"
    },
    createWeightField()
  ];
}

/**
 * Common relationship fields
 */
export function createRelationshipFields(): FormField[] {
  return [
    {
      name: "creator",
      label: "Creator",
      type: "autocomplete-character",
      placeholder: "Search or create creator...",
      description: "Who created or invented this",
      multiple: false
    },
    {
      name: "owner",
      label: "Current Owner",
      type: "autocomplete-character", 
      placeholder: "Search or create owner...",
      description: "Who currently owns or controls this",
      multiple: false
    },
    {
      name: "location",
      label: "Current Location",
      type: "autocomplete-location",
      placeholder: "Search or create location...", 
      description: "Where this is currently located",
      multiple: false
    }
  ];
}

/**
 * Geographic/location fields
 */
export function createGeographicFields(): FormField[] {
  return [
    createClimateField(),
    {
      name: "geography",
      label: "Geography",
      type: "text",
      placeholder: "Geographic features...",
      description: "Physical geographic characteristics"
    },
    {
      name: "terrain",
      label: "Terrain",
      type: "tags",
      placeholder: "Add terrain types",
      description: "Types of terrain in this area"
    }
  ];
}

/**
 * Society and culture fields
 */
export function createSocietyFields(): FormField[] {
  return [
    createPopulationField(),
    createGovernmentField(),
    createEconomyField(),
    createCultureField()
  ];
}

/**
 * Biology and lifecycle fields
 */
export function createBiologyFields(): FormField[] {
  return [
    createBehaviorField(),
    {
      name: "diet",
      label: "Diet",
      type: "text",
      placeholder: "What does it eat?",
      description: "Dietary habits and food sources"
    },
    {
      name: "lifespan",
      label: "Lifespan",
      type: "text",
      placeholder: "How long does it live?",
      description: "Average lifespan and lifecycle"
    },
    {
      name: "reproduction",
      label: "Reproduction",
      type: "text",
      placeholder: "How does it reproduce?",
      description: "Reproductive methods and behaviors"
    }
  ];
}

/**
 * Notable features field
 */
export function createNotableFeaturesField(options: Partial<FormField> = {}): FormField {
  return {
    name: "notableFeatures",
    label: "Notable Features",
    type: "tags",
    placeholder: "Add notable features",
    description: "Distinctive landmarks or characteristics",
    ...options
  };
}

/**
 * Landmarks field
 */
export function createLandmarksField(options: Partial<FormField> = {}): FormField {
  return {
    name: "landmarks",
    label: "Landmarks",
    type: "tags",
    placeholder: "Add landmarks",
    description: "Important landmarks and points of interest",
    ...options
  };
}

/**
 * Resources field
 */
export function createResourcesField(options: Partial<FormField> = {}): FormField {
  return {
    name: "resources",
    label: "Resources",
    type: "tags",
    placeholder: "Add available resources",
    description: "Natural resources and materials available",
    ...options
  };
}

/**
 * Threats field
 */
export function createThreatsField(options: Partial<FormField> = {}): FormField {
  return {
    name: "threats",
    label: "Threats",
    type: "tags",
    placeholder: "Add potential dangers",
    description: "Dangers or threats that exist here",
    ...options
  };
}

// ============================================================================
// COMPLETE TAB CREATORS (NEW)
// ============================================================================

/**
 * Creates a complete basic info tab
 */
export function createBasicInfoTab(
  contentType: string,
  icon: string = "Package",
  typeOptions?: string[]
): {
  id: string;
  label: string;
  icon: string;
  fields: FormField[];
} {
  return {
    id: "basic",
    label: "Basic Info",
    icon: icon,
    fields: createBasicInfoFields(contentType, typeOptions)
  };
}

/**
 * Creates a lore/history tab
 */
export function createLoreTab(
  contentType: string,
  icon: string = "BookOpen"
): {
  id: string;
  label: string;
  icon: string;
  fields: FormField[];
} {
  return {
    id: "lore",
    label: "Lore & History",
    icon: icon,
    fields: [
      createHistoryField(contentType),
      createOriginField(),
      createCulturalSignificanceField()
    ]
  };
}

/**
 * Creates a features tab for locations
 */
export function createFeaturesTab(
  icon: string = "Star"
): {
  id: string;
  label: string;
  icon: string;
  fields: FormField[];
} {
  return {
    id: "features",
    label: "Features & History",
    icon: icon,
    fields: [
      createHistoryField("location"),
      createNotableFeaturesField(),
      createLandmarksField(),
      createThreatsField(),
      createResourcesField()
    ]
  };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // Constants
  GENRE_OPTIONS,
  RARITY_OPTIONS,
  DIFFICULTY_OPTIONS,
  EXTENDED_DIFFICULTY_OPTIONS,
  SOCIAL_STATUS_OPTIONS,
  DEMAND_LEVEL_OPTIONS,
  STATUS_OPTIONS,
  CONDITION_OPTIONS,
  SIZE_OPTIONS,
  
  // Core fields
  createNameField,
  createTitleField,
  createDescriptionField,
  createGenreField,
  createHistoryField,
  
  // Common fields
  createOriginField,
  createPurposeField,
  createAbilitiesField,
  createCulturalSignificanceField,
  createSymbolismField,
  createClimateField,
  createHabitatField,
  createWeightField,
  createCostField,
  createPropertiesField,
  createAppearanceField,
  createBehaviorField,
  createDurationField,
  createEffectField,
  createPopulationField,
  createGovernmentField,
  createEconomyField,
  createCultureField,
  
  // Value fields
  createRarityField,
  createValueField,
  createMaterialsField,
  createTypeField,
  createNotebookField,
  
  // Field groups
  createBasicInfoFields,
  createValueFields,
  createPhysicalFields,
  createRelationshipFields,
  createGeographicFields,
  createSocietyFields,
  createBiologyFields,
  
  // Individual feature fields
  createNotableFeaturesField,
  createLandmarksField,
  createResourcesField,
  createThreatsField,
  
  // Tab creators
  createBasicInfoTab,
  createLoreTab,
  createFeaturesTab
};
