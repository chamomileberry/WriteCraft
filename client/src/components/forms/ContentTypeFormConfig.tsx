import { FormFieldType, FormTabConfig, ContentTypeFormConfig } from './types';

// Field type configurations for different content types
export const contentTypeFormConfigs: Record<string, ContentTypeFormConfig> = {
  // Characters - organized into logical tabs
  character: {
    title: "Character Editor",
    description: "Create detailed characters for your world",
    icon: "User",
    tabs: [
      {
        id: "basic",
        label: "Basic Info", 
        icon: "User",
        fields: [
          { name: "name", label: "Character Name", type: "text", required: true, placeholder: "Enter character name..." },
          { name: "age", label: "Age", type: "number", placeholder: "Character's age..." },
          { name: "occupation", label: "Occupation", type: "text", placeholder: "What is their job or role?" },
          { name: "species", label: "Species", type: "text", placeholder: "Human, Elf, Dwarf, etc." },
          { name: "gender", label: "Gender", type: "text", placeholder: "Character's gender identity" },
          { name: "pronouns", label: "Pronouns", type: "text", placeholder: "they/them, she/her, he/him, etc." },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Horror", "Modern", "Historical", "Other"] }
        ]
      },
      {
        id: "physical",
        label: "Physical",
        icon: "Eye", 
        fields: [
          { name: "physicalDescription", label: "Physical Description", type: "textarea", placeholder: "Overall physical appearance...", description: "Describe the character's general physical appearance" },
          { name: "height", label: "Height", type: "text", placeholder: "5'8\", tall, average, etc." },
          { name: "build", label: "Build", type: "text", placeholder: "Muscular, slim, stocky, etc." },
          { name: "hairColor", label: "Hair Color", type: "text", placeholder: "Brown, blonde, black, etc." },
          { name: "hairTexture", label: "Hair Texture", type: "text", placeholder: "Straight, curly, wavy, etc." },
          { name: "hairStyle", label: "Hair Style", type: "text", placeholder: "Long, short, braided, etc." },
          { name: "eyeColor", label: "Eye Color", type: "text", placeholder: "Blue, brown, green, etc." },
          { name: "skinTone", label: "Skin Tone", type: "text", placeholder: "Pale, olive, dark, etc." },
          { name: "facialFeatures", label: "Facial Features", type: "text", placeholder: "Sharp jawline, round face, etc." },
          { name: "identifyingMarks", label: "Identifying Marks", type: "text", placeholder: "Scars, birthmarks, tattoos, etc." }
        ]
      },
      {
        id: "personality",
        label: "Personality",
        icon: "Heart",
        fields: [
          { name: "personality", label: "Personality Traits", type: "tags", placeholder: "brave, curious, stubborn...", description: "Key personality traits (comma-separated)" },
          { name: "backstory", label: "Backstory", type: "textarea", required: true, placeholder: "Character's history and background...", description: "What shaped this character into who they are today?" },
          { name: "motivation", label: "Motivation", type: "textarea", required: true, placeholder: "What drives this character...", description: "What are their primary goals and desires?" },
          { name: "flaw", label: "Fatal Flaw", type: "textarea", required: true, placeholder: "Character's greatest weakness...", description: "What major flaw could lead to their downfall?" },
          { name: "strength", label: "Greatest Strength", type: "textarea", required: true, placeholder: "Character's greatest asset...", description: "What is their most powerful attribute or ability?" }
        ]
      },
      {
        id: "background",
        label: "Background",
        icon: "MapPin",
        fields: [
          { name: "currentLocation", label: "Current Location", type: "text", placeholder: "Where they currently live/stay" },
          { name: "placeOfBirth", label: "Place of Birth", type: "text", placeholder: "Where they were born" },
          { name: "family", label: "Family", type: "textarea", placeholder: "Information about family members, relationships..." },
          { name: "education", label: "Education", type: "textarea", placeholder: "Formal education, training, apprenticeships..." },
          { name: "workHistory", label: "Work History", type: "textarea", placeholder: "Previous jobs, career progression..." },
          { name: "accomplishments", label: "Accomplishments", type: "textarea", placeholder: "Notable achievements, awards, victories..." },
          { name: "religiousBelief", label: "Religious Beliefs", type: "text", placeholder: "Spiritual beliefs, religion, philosophy" },
          { name: "affiliatedOrganizations", label: "Organizations", type: "text", placeholder: "Guilds, groups, factions they belong to" }
        ]
      }
    ]
  },

  // Weapons - focused on combat and lore
  weapon: {
    title: "Weapon Editor",
    description: "Design weapons for your world",
    icon: "Sword",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Sword",
        fields: [
          { name: "name", label: "Weapon Name", type: "text", required: true, placeholder: "Enter weapon name..." },
          { name: "weaponType", label: "Weapon Type", type: "select", required: true, options: ["Sword", "Bow", "Staff", "Dagger", "Axe", "Mace", "Spear", "Crossbow", "Wand", "Other"] },
          { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Detailed description of the weapon...", description: "What does this weapon look like and how does it function?" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Modern", "Historical", "Steampunk", "Other"] }
        ]
      },
      {
        id: "stats",
        label: "Combat Stats",
        icon: "Zap",
        fields: [
          { name: "damage", label: "Damage", type: "text", placeholder: "Damage rating or dice (e.g., 1d8+2)" },
          { name: "range", label: "Range", type: "text", placeholder: "Melee, 100 feet, etc." },
          { name: "weight", label: "Weight", type: "text", placeholder: "3 lbs, heavy, light, etc." },
          { name: "requirements", label: "Requirements", type: "text", placeholder: "Strength needed, training required, etc." },
          { name: "maintenance", label: "Maintenance", type: "textarea", placeholder: "How to care for and maintain this weapon..." }
        ]
      },
      {
        id: "crafting",
        label: "Crafting & Lore",
        icon: "Wrench",
        fields: [
          { name: "materials", label: "Materials", type: "tags", placeholder: "steel, wood, leather...", description: "Materials used in construction (comma-separated)" },
          { name: "craftsmanship", label: "Craftsmanship", type: "text", placeholder: "Masterwork, crude, ornate, etc." },
          { name: "enchantments", label: "Enchantments", type: "tags", placeholder: "fire damage, glowing, etc.", description: "Magical properties (comma-separated)" },
          { name: "history", label: "History", type: "textarea", placeholder: "The weapon's origin story and past owners..." },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"] },
          { name: "value", label: "Value", type: "text", placeholder: "500 gold, priceless, etc." }
        ]
      }
    ]
  },

  // Buildings - architecture and purpose
  building: {
    title: "Building Editor", 
    description: "Design structures for your world",
    icon: "Building",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Building",
        fields: [
          { name: "name", label: "Building Name", type: "text", required: true, placeholder: "Enter building name..." },
          { name: "buildingType", label: "Building Type", type: "select", required: true, options: ["House", "Castle", "Temple", "Shop", "Tavern", "Library", "Prison", "Tower", "Mansion", "Barracks", "Other"] },
          { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Detailed description of the building...", description: "What does this building look like from the outside?" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Modern", "Historical", "Steampunk", "Other"] }
        ]
      },
      {
        id: "structure",
        label: "Structure",
        icon: "Hammer",
        fields: [
          { name: "architecture", label: "Architecture", type: "text", placeholder: "Gothic, Roman, modern, etc." },
          { name: "materials", label: "Materials", type: "tags", placeholder: "stone, wood, metal...", description: "Construction materials (comma-separated)" },
          { name: "capacity", label: "Capacity", type: "text", placeholder: "Number of people it can hold" },
          { name: "defenses", label: "Defenses", type: "text", placeholder: "Walls, guards, magical wards, etc." },
          { name: "currentCondition", label: "Current Condition", type: "text", placeholder: "Excellent, worn, ruins, etc." }
        ]
      },
      {
        id: "purpose",
        label: "Purpose & Lore",
        icon: "Scroll",
        fields: [
          { name: "purpose", label: "Purpose", type: "textarea", placeholder: "What is this building used for?..." },
          { name: "history", label: "History", type: "textarea", placeholder: "The building's construction and past..." },
          { name: "location", label: "Location", type: "text", placeholder: "Where in the world is it located?" },
          { name: "owner", label: "Owner", type: "text", placeholder: "Who owns or controls this building?" },
          { name: "significance", label: "Significance", type: "textarea", placeholder: "Why is this building important?..." },
          { name: "secrets", label: "Secrets", type: "textarea", placeholder: "Hidden rooms, mysteries, secrets..." }
        ]
      }
    ]
  },

  // Plot structure
  plot: {
    title: "Plot Editor",
    description: "Structure compelling stories",
    icon: "BookOpen", 
    tabs: [
      {
        id: "structure",
        label: "Story Structure",
        icon: "BookOpen",
        fields: [
          { name: "setup", label: "Setup", type: "textarea", required: true, placeholder: "Introduce characters, world, and status quo...", description: "Set the stage for your story" },
          { name: "incitingIncident", label: "Inciting Incident", type: "textarea", required: true, placeholder: "The event that kicks off the main story...", description: "What disrupts the normal world?" },
          { name: "firstPlotPoint", label: "First Plot Point", type: "textarea", required: true, placeholder: "The protagonist commits to the journey...", description: "The point of no return" },
          { name: "midpoint", label: "Midpoint", type: "textarea", required: true, placeholder: "Major revelation or turning point...", description: "Everything changes here" }
        ]
      },
      {
        id: "climax",
        label: "Climax & Resolution", 
        icon: "Zap",
        fields: [
          { name: "secondPlotPoint", label: "Second Plot Point", type: "textarea", required: true, placeholder: "All hope seems lost...", description: "The darkest moment" },
          { name: "climax", label: "Climax", type: "textarea", required: true, placeholder: "The final confrontation...", description: "The ultimate showdown" },
          { name: "resolution", label: "Resolution", type: "textarea", required: true, placeholder: "How everything wraps up...", description: "The new normal" }
        ]
      },
      {
        id: "themes",
        label: "Themes & Conflict",
        icon: "Heart",
        fields: [
          { name: "theme", label: "Theme", type: "textarea", required: true, placeholder: "The deeper meaning or message...", description: "What is your story really about?" },
          { name: "conflict", label: "Central Conflict", type: "textarea", required: true, placeholder: "The main struggle or tension...", description: "What opposition drives the story?" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Romance", "Mystery", "Horror", "Thriller", "Drama", "Comedy", "Other"] },
          { name: "storyStructure", label: "Story Structure", type: "select", options: ["Three-Act", "Hero's Journey", "Save the Cat", "Freytag's Pyramid", "Other"] }
        ]
      }
    ]
  }

  // TODO: Add more content types as needed
};