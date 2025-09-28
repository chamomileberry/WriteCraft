import { FormTabConfig } from "@/components/forms/types";
import { 
  createBasicInfoFields, 
  createValueFields, 
  createPhysicalFields, 
  createHistoryField,
  createRelationshipFields
} from "./field-definitions";

/**
 * Common tab definitions library for content type forms
 * This provides reusable tab structures that are repeated across content types
 */

/**
 * Creates a basic info tab - the most common tab across all content types
 * @param contentType - The content type (e.g., "weapon", "creature")
 * @param typeOptions - Optional array of type options for type selection
 */
export function createBasicInfoTab(
  contentType: string,
  typeOptions?: string[]
): FormTabConfig {
  return {
    id: "basic",
    label: "Basic Info",
    icon: "Info",
    fields: createBasicInfoFields(contentType, typeOptions)
  };
}

/**
 * Creates a physical properties tab for tangible objects
 * @param contentType - The content type
 */
export function createPhysicalTab(contentType: string): FormTabConfig {
  return {
    id: "physical",
    label: "Physical Properties",
    icon: "Package",
    fields: createPhysicalFields(contentType)
  };
}

/**
 * Creates a history/lore tab for background information
 * @param contentType - The content type
 */
export function createHistoryTab(contentType: string): FormTabConfig {
  return {
    id: "history",
    label: "History & Lore",
    icon: "BookOpen",
    fields: [
      createHistoryField(contentType),
      {
        name: "culturalSignificance",
        label: "Cultural Significance",
        type: "textarea",
        placeholder: `The cultural importance and meaning of this ${contentType}...`,
        description: `How this ${contentType} is viewed and used in society`
      },
      {
        name: "legends",
        label: "Legends & Stories",
        type: "textarea",
        placeholder: `Famous stories and legends about this ${contentType}...`,
        description: `Notable tales, myths, or historical events involving this ${contentType}`
      }
    ]
  };
}

/**
 * Creates a value/economics tab for tradeable items
 */
export function createValueTab(): FormTabConfig {
  return {
    id: "value",
    label: "Value & Economics",
    icon: "DollarSign",
    fields: [
      ...createValueFields(),
      {
        name: "availability",
        label: "Availability",
        type: "text",
        placeholder: "Common in cities, rare in wilderness, etc.",
        description: "Where and how easily this can be obtained"
      },
      {
        name: "tradability",
        label: "Trade Information",
        type: "textarea",
        placeholder: "Trading restrictions, preferred currencies, market conditions...",
        description: "Important information about buying, selling, and trading"
      }
    ]
  };
}

/**
 * Creates a relationships tab for social connections
 */
export function createRelationshipsTab(): FormTabConfig {
  return {
    id: "relationships",
    label: "Relationships",
    icon: "Users",
    fields: createRelationshipFields()
  };
}

/**
 * Creates a stats/mechanics tab for game-related properties
 * @param contentType - The content type
 */
export function createStatsTab(contentType: string): FormTabConfig {
  return {
    id: "stats",
    label: "Stats & Mechanics",
    icon: "Zap",
    fields: [
      {
        name: "damage",
        label: "Damage",
        type: "text",
        placeholder: "Damage rating or dice (e.g., 1d8+2)",
        description: "Damage dealt by this item"
      },
      {
        name: "range",
        label: "Range",
        type: "text",
        placeholder: "Melee, 100 feet, etc.",
        description: "Effective range of use"
      },
      {
        name: "requirements",
        label: "Requirements",
        type: "text",
        placeholder: "Strength needed, training required, etc.",
        description: "Prerequisites for using this item"
      },
      {
        name: "maintenance",
        label: "Maintenance",
        type: "textarea",
        placeholder: `How to care for and maintain this ${contentType}...`,
        description: "Upkeep requirements and care instructions"
      }
    ]
  };
}

/**
 * Creates abilities/powers tab for special capabilities
 * @param contentType - The content type
 */
export function createAbilitiesTab(contentType: string): FormTabConfig {
  return {
    id: "abilities",
    label: "Abilities & Powers",
    icon: "Sparkles",
    fields: [
      {
        name: "abilities",
        label: "Special Abilities",
        type: "tags",
        placeholder: "flight, fire resistance, telepathy...",
        description: "Special abilities or powers (comma-separated)"
      },
      {
        name: "enchantments",
        label: "Enchantments",
        type: "tags",
        placeholder: "fire damage, glowing, self-repairing...",
        description: "Magical properties and enchantments (comma-separated)"
      },
      {
        name: "limitations",
        label: "Limitations",
        type: "textarea",
        placeholder: `Restrictions, drawbacks, or limitations of this ${contentType}...`,
        description: "Any restrictions or negative aspects"
      }
    ]
  };
}

/**
 * Predefined tab sets for common content type categories
 */

/**
 * Standard tabs for physical items (weapons, armor, tools, etc.)
 */
export function createItemTabSet(
  contentType: string,
  typeOptions: string[]
): FormTabConfig[] {
  return [
    createBasicInfoTab(contentType, typeOptions),
    createStatsTab(contentType),
    createPhysicalTab(contentType),
    createAbilitiesTab(contentType),
    createValueTab(),
    createHistoryTab(contentType)
  ];
}

/**
 * Standard tabs for creatures and beings
 */
export function createCreatureTabSet(
  contentType: string,
  typeOptions: string[]
): FormTabConfig[] {
  return [
    createBasicInfoTab(contentType, typeOptions),
    {
      id: "physical",
      label: "Physical Description",
      icon: "Eye",
      fields: [
        {
          name: "physicalDescription",
          label: "Physical Description",
          type: "textarea",
          placeholder: `Describe the physical appearance of this ${contentType}...`,
          description: "Detailed description of physical characteristics"
        },
        {
          name: "size",
          label: "Size",
          type: "text",
          placeholder: "Small, Medium, Large, etc.",
          description: "The size category of this creature"
        },
        {
          name: "habitat",
          label: "Habitat",
          type: "text",
          placeholder: "Forest, desert, underwater, etc.",
          description: "Natural environment where this creature lives"
        }
      ]
    },
    {
      id: "behavior",
      label: "Behavior & Psychology",
      icon: "Brain",
      fields: [
        {
          name: "behavior",
          label: "Behavior",
          type: "textarea",
          placeholder: `How does this ${contentType} typically behave...`,
          description: "Typical behavioral patterns and temperament"
        },
        {
          name: "intelligence",
          label: "Intelligence",
          type: "text",
          placeholder: "Animal, Human-like, Genius, etc.",
          description: "Level and type of intelligence"
        },
        {
          name: "socialStructure",
          label: "Social Structure",
          type: "textarea",
          placeholder: "Pack hunter, solitary, hive mind, etc.",
          description: "How they interact with their own kind"
        }
      ]
    },
    createAbilitiesTab(contentType),
    createHistoryTab(contentType)
  ];
}

/**
 * Standard tabs for locations and places
 */
export function createLocationTabSet(
  contentType: string,
  typeOptions: string[]
): FormTabConfig[] {
  return [
    createBasicInfoTab(contentType, typeOptions),
    {
      id: "geography",
      label: "Geography & Layout",
      icon: "Map",
      fields: [
        {
          name: "geography",
          label: "Geography",
          type: "textarea",
          placeholder: "The physical layout and geographical features...",
          description: "Terrain, climate, and physical characteristics"
        },
        {
          name: "size",
          label: "Size",
          type: "text",
          placeholder: "Area or dimensions",
          description: "How large this location is"
        },
        {
          name: "landmarks",
          label: "Notable Landmarks",
          type: "tags",
          placeholder: "castle, river, ancient tree...",
          description: "Important features and landmarks (comma-separated)"
        }
      ]
    },
    {
      id: "inhabitants",
      label: "Inhabitants & Culture",
      icon: "Users",
      fields: [
        {
          name: "population",
          label: "Population",
          type: "text",
          placeholder: "Number and types of inhabitants",
          description: "Who lives here and how many"
        },
        {
          name: "culture",
          label: "Culture",
          type: "textarea",
          placeholder: "Local customs, traditions, and way of life...",
          description: "Cultural practices and social norms"
        },
        {
          name: "government",
          label: "Government",
          type: "text",
          placeholder: "Type of governance or leadership",
          description: "How this place is ruled or organized"
        }
      ]
    },
    createHistoryTab(contentType)
  ];
}

/**
 * Standard tabs for organizations and groups
 */
export function createOrganizationTabSet(
  contentType: string,
  typeOptions: string[]
): FormTabConfig[] {
  return [
    createBasicInfoTab(contentType, typeOptions),
    {
      id: "structure",
      label: "Structure & Hierarchy",
      icon: "Users",
      fields: [
        {
          name: "leadership",
          label: "Leadership",
          type: "autocomplete-character",
          placeholder: "Search or create leaders...",
          description: "Current leaders of this organization",
          multiple: true
        },
        {
          name: "structure",
          label: "Organizational Structure",
          type: "textarea",
          placeholder: "How the organization is structured and organized...",
          description: "Hierarchy, ranks, departments, and organizational layout"
        },
        {
          name: "membership",
          label: "Membership",
          type: "textarea",
          placeholder: "Who can join, requirements, member count...",
          description: "Information about membership and joining requirements"
        }
      ]
    },
    {
      id: "purpose",
      label: "Purpose & Activities",
      icon: "Target",
      fields: [
        {
          name: "purpose",
          label: "Primary Purpose",
          type: "textarea",
          placeholder: "The main goals and objectives of this organization...",
          description: "What this organization exists to accomplish"
        },
        {
          name: "activities",
          label: "Activities",
          type: "textarea", 
          placeholder: "Day-to-day activities and operations...",
          description: "What this organization actually does"
        },
        {
          name: "resources",
          label: "Resources",
          type: "textarea",
          placeholder: "Funding, assets, capabilities...",
          description: "Resources, funding sources, and capabilities"
        }
      ]
    },
    createRelationshipsTab(),
    createHistoryTab(contentType)
  ];
}