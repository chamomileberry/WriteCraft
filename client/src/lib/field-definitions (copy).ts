import { FormField } from "@/components/forms/types";

/**
 * Common field definitions library for content type forms
 * This eliminates duplication and ensures consistency across all forms
 */

// Genre options array - reused across many content types
export const GENRE_OPTIONS = [
  "Fantasy",
  "Science Fiction",
  "Literary Fiction",
  "Mystery",
  "Romance",
  "Thriller",
  "Horror",
  "Historical Fiction",
  "Contemporary Fiction",
  "Crime",
  "Adventure",
  "Western",
  "Dystopian",
  "Post-Apocalyptic",
  "Steampunk",
  "Cyberpunk",
  "Space Opera",
  "Urban Fantasy",
  "Paranormal Romance",
  "Cozy Mystery",
  "Hard Boiled",
  "Young Adult",
  "Children's",
  "Comedy",
  "Satire",
  "Drama",
  "Political Fiction",
  "Magical Realism",
  "Gothic",
  "Noir",
  "Superhero",
  "Military",
  "Espionage",
  "Techno-Thriller",
  "Medical Thriller",
  "Legal Thriller",
  "Psychological Thriller",
  "Biographical Fiction",
  "Alternate History",
  "Time Travel",
  "Fairy Tale Retelling",
  "Mythology",
  "Folklore",
  "Other",
];

// Rarity options - commonly used for items, weapons, artifacts
export const RARITY_OPTIONS = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
];

// Difficulty levels - used in guides and various content
export const DIFFICULTY_OPTIONS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

/**
 * Common field factories - these generate field definitions with consistent patterns
 */

/**
 * Creates a standard name field
 * @param contentType - The type of content (e.g., "weapon", "character")
 * @param options - Optional overrides for placeholder, description, etc.
 */
export function createNameField(
  contentType: string,
  options: Partial<FormField> = {},
): FormField {
  return {
    name: "name",
    label: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Name`,
    type: "text",
    placeholder: `Enter ${contentType} name...`,
    description: `The name of this ${contentType}`,
    required: true,
    ...options,
  };
}

/**
 * Creates a standard description field
 * @param contentType - The type of content
 * @param options - Optional overrides
 */
export function createDescriptionField(
  contentType: string,
  options: Partial<FormField> = {},
): FormField {
  return {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: `Detailed description of the ${contentType}...`,
    description: `What does this ${contentType} look like and how does it function?`,
    ...options,
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
    description:
      "The genre or setting type this fits into - helps with AI generation and thematic consistency",
    ...options,
  };
}

/**
 * Creates a standard history/background field
 * @param contentType - The type of content
 * @param options - Optional overrides
 */
export function createHistoryField(
  contentType: string,
  options: Partial<FormField> = {},
): FormField {
  return {
    name: "history",
    label: "History",
    type: "textarea",
    placeholder: `The ${contentType}'s origin story and past...`,
    description: `The background and historical significance of this ${contentType}`,
    ...options,
  };
}

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
    ...options,
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
    ...options,
  };
}

/**
 * Creates a standard materials field (tags)
 * @param options - Optional overrides
 */
export function createMaterialsField(
  options: Partial<FormField> = {},
): FormField {
  return {
    name: "materials",
    label: "Materials",
    type: "tags",
    placeholder: "steel, wood, leather...",
    description: "Materials used in construction (comma-separated)",
    ...options,
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
  options: Partial<FormField> = {},
): FormField {
  return {
    name: `${contentType}Type`,
    label: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Type`,
    type: "select",
    options: typeOptions,
    placeholder: `Select ${contentType} type`,
    description: `What type of ${contentType} is this?`,
    ...options,
  };
}

/**
 * Commonly used field sets - pre-defined groups of related fields
 */

/**
 * Basic info fields common to most content types
 */
export function createBasicInfoFields(
  contentType: string,
  typeOptions?: string[],
): FormField[] {
  const fields = [
    createNameField(contentType),
    createDescriptionField(contentType),
    createGenreField(),
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
  return [createRarityField(), createValueField()];
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
      description: "The quality and style of construction",
    },
    {
      name: "weight",
      label: "Weight",
      type: "text",
      placeholder: "3 lbs, heavy, light, etc.",
      description: "How much this weighs",
    },
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
      multiple: false,
    },
    {
      name: "owner",
      label: "Current Owner",
      type: "autocomplete-character",
      placeholder: "Search or create owner...",
      description: "Who currently owns or controls this",
      multiple: false,
    },
    {
      name: "location",
      label: "Current Location",
      type: "autocomplete-location",
      placeholder: "Search or create location...",
      description: "Where this is currently located",
      multiple: false,
    },
  ];
}
