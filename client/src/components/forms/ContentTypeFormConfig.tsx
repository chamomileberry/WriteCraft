import { FormFieldType, FormTabConfig, ContentTypeFormConfig } from './types';

// Field type configurations for different content types
export const contentTypeFormConfigs: Record<string, ContentTypeFormConfig> = {
  // Characters - comprehensive worldbuilding with 10+ tabs covering all aspects
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
          { name: "name", label: "Character Name", type: "text", placeholder: "Enter character name...", description: "The character's primary name" },
          { name: "age", label: "Age", type: "number", placeholder: "Character's age...", description: "How old is this character?" },
          { name: "occupation", label: "Occupation", type: "text", placeholder: "What is their job or role?", description: "Their primary profession or role in society" },
          { name: "species", label: "Species", type: "text", placeholder: "Human, Elf, Dwarf, etc.", description: "What species or race is this character?" },
          { name: "gender", label: "Gender", type: "text", placeholder: "Character's gender identity", description: "Their gender identity and expression" },
          { name: "pronouns", label: "Pronouns", type: "text", placeholder: "they/them, she/her, he/him, etc.", description: "Preferred pronouns for this character" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Horror", "Modern", "Historical", "Other"], description: "What genre does this character fit?" }
        ]
      },
      {
        id: "names",
        label: "Names & Titles",
        icon: "Crown",
        fields: [
          { name: "givenName", label: "Given Name", type: "text", placeholder: "Their first name at birth", description: "The name they were given at birth" },
          { name: "familyName", label: "Family Name", type: "text", placeholder: "Last name or surname", description: "Their family name or surname" },
          { name: "middleName", label: "Middle Name", type: "text", placeholder: "Middle name(s)", description: "Any middle names they have" },
          { name: "maidenName", label: "Maiden Name", type: "text", placeholder: "Name before marriage", description: "Their family name before marriage (if applicable)" },
          { name: "nickname", label: "Nickname", type: "text", placeholder: "What friends call them", description: "Common nickname or what friends call them" },
          { name: "honorificTitle", label: "Honorific Title", type: "text", placeholder: "Sir, Lady, Dr., etc.", description: "Formal titles or honors they hold" },
          { name: "suffix", label: "Suffix", type: "text", placeholder: "Jr., Sr., III, etc.", description: "Name suffixes like Jr., Sr., III" },
          { name: "prefix", label: "Prefix", type: "text", placeholder: "Mr., Ms., Lord, etc.", description: "Name prefixes used in formal address" }
        ]
      },
      {
        id: "physical",
        label: "Physical Appearance",
        icon: "Eye", 
        fields: [
          { name: "physicalDescription", label: "Overall Physical Description", type: "textarea", placeholder: "Describe their general physical appearance...", description: "A comprehensive description of how they look" },
          { name: "height", label: "Height", type: "text", placeholder: "5'8\", tall, average, etc.", description: "How tall are they?" },
          { name: "heightDetail", label: "Height Details", type: "text", placeholder: "Specific height measurements", description: "More specific height information" },
          { name: "weight", label: "Weight", type: "text", placeholder: "Build and weight description", description: "Their weight and body mass" },
          { name: "build", label: "Build", type: "text", placeholder: "Muscular, slim, stocky, etc.", description: "Their overall body build and physique" },
          { name: "physicalCondition", label: "Physical Condition", type: "text", placeholder: "Fitness level, health status", description: "Their overall physical fitness and health" },
          { name: "sex", label: "Biological Sex", type: "text", placeholder: "Assigned sex at birth", description: "Their biological sex assigned at birth" },
          { name: "genderIdentity", label: "Gender Identity", type: "text", placeholder: "How they identify", description: "Their personal gender identity" },
          { name: "physicalPresentation", label: "Physical Presentation", type: "text", placeholder: "How they present physically", description: "How they present their gender physically" }
        ]
      },
      {
        id: "facial",
        label: "Facial Features",
        icon: "Smile",
        fields: [
          { name: "facialFeatures", label: "General Facial Features", type: "text", placeholder: "Sharp jawline, round face, etc.", description: "Overall facial structure and features" },
          { name: "facialDetails", label: "Detailed Facial Features", type: "textarea", placeholder: "Detailed description of facial characteristics", description: "Specific details about their facial features" },
          { name: "eyeColor", label: "Eye Color", type: "text", placeholder: "Blue, brown, green, etc.", description: "The color of their eyes" },
          { name: "hairColor", label: "Hair Color", type: "text", placeholder: "Brown, blonde, black, etc.", description: "Their natural or current hair color" },
          { name: "hairTexture", label: "Hair Texture", type: "text", placeholder: "Straight, curly, wavy, etc.", description: "The texture and type of their hair" },
          { name: "hairStyle", label: "Hair Style", type: "text", placeholder: "Long, short, braided, etc.", description: "How they style their hair" },
          { name: "skinTone", label: "Skin Tone", type: "text", placeholder: "Pale, olive, dark, etc.", description: "Their skin color and tone" },
          { name: "strikingFeatures", label: "Most Striking Features", type: "text", placeholder: "What stands out most about them", description: "The most noticeable aspects of their appearance" }
        ]
      },
      {
        id: "marks",
        label: "Marks & Features",
        icon: "Zap",
        fields: [
          { name: "identifyingMarks", label: "Identifying Marks", type: "text", placeholder: "Scars, birthmarks, tattoos, etc.", description: "Permanent marks that identify them" },
          { name: "marksPiercingsTattoos", label: "Marks, Piercings & Tattoos", type: "textarea", placeholder: "Detailed description of body modifications", description: "All body modifications, tattoos, piercings, and distinctive marks" },
          { name: "distinctiveBodyFeatures", label: "Distinctive Body Features", type: "text", placeholder: "Unique physical characteristics", description: "Unique aspects of their physical form" },
          { name: "distinctPhysicalFeatures", label: "Other Distinct Features", type: "textarea", placeholder: "Any other notable physical traits", description: "Additional distinctive physical characteristics" },
          { name: "conditions", label: "Physical Conditions", type: "text", placeholder: "Disabilities, chronic conditions", description: "Any physical conditions or disabilities" }
        ]
      },
      {
        id: "personality",
        label: "Personality & Psychology",
        icon: "Heart",
        fields: [
          { name: "personality", label: "Core Personality Traits", type: "tags", placeholder: "brave, curious, stubborn...", description: "Key personality traits that define them" },
          { name: "backstory", label: "Backstory", type: "textarea", placeholder: "Character's history and background...", description: "What shaped this character into who they are today?" },
          { name: "motivation", label: "Core Motivation", type: "textarea", placeholder: "What drives this character...", description: "What are their primary goals and desires?" },
          { name: "flaw", label: "Fatal Flaw", type: "textarea", placeholder: "Character's greatest weakness...", description: "What major flaw could lead to their downfall?" },
          { name: "strength", label: "Greatest Strength", type: "textarea", placeholder: "Character's greatest asset...", description: "What is their most powerful attribute or ability?" },
          { name: "intellectualTraits", label: "Intellectual Traits", type: "textarea", placeholder: "How they think and process information", description: "Their intellectual abilities and thinking patterns" },
          { name: "mentalHealth", label: "Mental Health", type: "textarea", placeholder: "Psychological state and wellbeing", description: "Their mental health status and psychological traits" },
          { name: "valuesEthicsMorals", label: "Values, Ethics & Morals", type: "textarea", placeholder: "What they believe is right and wrong", description: "Their moral compass and ethical beliefs" },
          { name: "frownedUponViews", label: "Controversial Views", type: "textarea", placeholder: "Beliefs others might disapprove of", description: "Views they hold that others might find objectionable" },
          { name: "secretBeliefs", label: "Secret Beliefs", type: "textarea", placeholder: "Beliefs they keep hidden", description: "Private beliefs they don't share publicly" }
        ]
      },
      {
        id: "flaws",
        label: "Flaws & Vices",
        icon: "AlertTriangle",
        fields: [
          { name: "characterFlaws", label: "Character Flaws", type: "textarea", placeholder: "Major personality flaws", description: "Significant character flaws and weaknesses" },
          { name: "addictions", label: "Addictions", type: "text", placeholder: "Substances or behaviors they're addicted to", description: "Any addictions they struggle with" },
          { name: "vices", label: "Vices", type: "text", placeholder: "Bad habits and moral failings", description: "Their vices and bad habits" },
          { name: "defects", label: "Character Defects", type: "textarea", placeholder: "Fundamental character defects", description: "Deep-seated character defects" },
          { name: "negativeEvents", label: "Traumatic Events", type: "textarea", placeholder: "Negative experiences that shaped them", description: "Traumatic or negative events in their past" },
          { name: "likes", label: "Likes & Preferences", type: "text", placeholder: "Things they enjoy", description: "What they like and prefer" },
          { name: "dislikes", label: "Dislikes & Pet Peeves", type: "text", placeholder: "Things they hate or avoid", description: "What they dislike or find annoying" }
        ]
      },
      {
        id: "skills",
        label: "Skills & Abilities",
        icon: "Star",
        fields: [
          { name: "mainSkills", label: "Primary Skills", type: "text", placeholder: "Their main areas of expertise", description: "The skills they're most proficient in" },
          { name: "strengths", label: "Strengths", type: "textarea", placeholder: "What they excel at", description: "Areas where they particularly excel" },
          { name: "positiveAspects", label: "Positive Aspects", type: "textarea", placeholder: "Their positive qualities", description: "Positive traits and aspects of their character" },
          { name: "proficiencies", label: "Proficiencies", type: "text", placeholder: "Areas of competence", description: "Skills and areas they're competent in" },
          { name: "lackingSkills", label: "Lacking Skills", type: "text", placeholder: "Areas they struggle with", description: "Skills they lack or are poor at" },
          { name: "lackingKnowledge", label: "Knowledge Gaps", type: "text", placeholder: "What they don't know", description: "Areas where they lack knowledge or understanding" },
          { name: "languages", label: "Languages", type: "tags", placeholder: "Common, Elvish, Draconic...", description: "Languages they speak" },
          { name: "languageFluencyAccent", label: "Language Details", type: "textarea", placeholder: "Fluency levels, accents, dialects", description: "Details about their language abilities and accents" }
        ]
      },
      {
        id: "supernatural",
        label: "Supernatural & Special",
        icon: "Sparkles",
        fields: [
          { name: "supernaturalPowers", label: "Supernatural Powers", type: "textarea", placeholder: "Magical or supernatural abilities", description: "Any supernatural powers they possess" },
          { name: "specialAbilities", label: "Special Abilities", type: "textarea", placeholder: "Unique talents or abilities", description: "Special abilities that set them apart" },
          { name: "mutations", label: "Mutations", type: "text", placeholder: "Physical or genetic mutations", description: "Any mutations or alterations to their biology" }
        ]
      },
      {
        id: "equipment",
        label: "Equipment & Attire",
        icon: "Package",
        fields: [
          { name: "typicalAttire", label: "Typical Attire", type: "textarea", placeholder: "How they usually dress", description: "Their typical clothing and style choices" },
          { name: "accessories", label: "Accessories", type: "text", placeholder: "Jewelry, watches, etc.", description: "Accessories they commonly wear" },
          { name: "keyEquipment", label: "Key Equipment", type: "text", placeholder: "Important tools or weapons", description: "Essential equipment they carry" },
          { name: "specializedItems", label: "Specialized Items", type: "text", placeholder: "Unique or magical items", description: "Special or unique items in their possession" }
        ]
      },
      {
        id: "background",
        label: "Life & Background",
        icon: "MapPin",
        fields: [
          { name: "currentLocation", label: "Current Location", type: "text", placeholder: "Where they currently live/stay", description: "Their current place of residence" },
          { name: "currentResidence", label: "Current Residence", type: "text", placeholder: "Details about their home", description: "Specifics about where they live" },
          { name: "dateOfBirth", label: "Date of Birth", type: "text", placeholder: "When they were born", description: "Their birth date" },
          { name: "placeOfBirth", label: "Place of Birth", type: "text", placeholder: "Where they were born", description: "Their birthplace" },
          { name: "dateOfDeath", label: "Date of Death", type: "text", placeholder: "When they died (if applicable)", description: "Date of death (for deceased characters)" },
          { name: "placeOfDeath", label: "Place of Death", type: "text", placeholder: "Where they died (if applicable)", description: "Place of death (for deceased characters)" },
          { name: "upbringing", label: "Upbringing", type: "textarea", placeholder: "How they were raised", description: "Details about their childhood and upbringing" },
          { name: "family", label: "Family", type: "textarea", placeholder: "Information about family members, relationships...", description: "Family members and relationships" },
          { name: "education", label: "Education", type: "textarea", placeholder: "Formal education, training, apprenticeships...", description: "Their educational background and training" },
          { name: "profession", label: "Current Profession", type: "text", placeholder: "Their current job or role", description: "What they do for work currently" },
          { name: "workHistory", label: "Work History", type: "textarea", placeholder: "Previous jobs, career progression...", description: "Their employment and career history" },
          { name: "accomplishments", label: "Accomplishments", type: "textarea", placeholder: "Notable achievements, awards, victories...", description: "Their major achievements and successes" },
          { name: "religiousBelief", label: "Religious Beliefs", type: "text", placeholder: "Spiritual beliefs, religion, philosophy", description: "Their religious or spiritual beliefs" },
          { name: "affiliatedOrganizations", label: "Organizations", type: "text", placeholder: "Guilds, groups, factions they belong to", description: "Organizations they're affiliated with" },
          { name: "genderUnderstanding", label: "Gender Understanding", type: "textarea", placeholder: "How they understand and express gender", description: "Their understanding and relationship with gender" },
          { name: "sexualOrientation", label: "Sexual Orientation", type: "text", placeholder: "Their romantic and sexual preferences", description: "Their sexual and romantic orientation" },
          { name: "ethnicity", label: "Ethnicity", type: "text", placeholder: "Cultural and ethnic background", description: "Their ethnic and cultural heritage" }
        ]
      },
      {
        id: "legacy",
        label: "Legacy & Influence",
        icon: "Award",
        fields: [
          { name: "worldInfluence", label: "World Influence", type: "textarea", placeholder: "How they've impacted the world", description: "Their influence on the world around them" },
          { name: "legacy", label: "Legacy", type: "textarea", placeholder: "What they'll be remembered for", description: "The legacy they leave behind" },
          { name: "rememberedBy", label: "Remembered By", type: "text", placeholder: "Who remembers them and how", description: "How and by whom they are remembered" }
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
          { name: "name", label: "Weapon Name", type: "text", placeholder: "Enter weapon name..." },
          { name: "weaponType", label: "Weapon Type", type: "select", options: ["Sword", "Bow", "Staff", "Dagger", "Axe", "Mace", "Spear", "Crossbow", "Wand", "Other"] },
          { name: "description", label: "Description", type: "textarea", placeholder: "Detailed description of the weapon...", description: "What does this weapon look like and how does it function?" },
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
          { name: "name", label: "Building Name", type: "text", placeholder: "Enter building name..." },
          { name: "buildingType", label: "Building Type", type: "select", options: ["House", "Castle", "Temple", "Shop", "Tavern", "Library", "Prison", "Tower", "Mansion", "Barracks", "Other"] },
          { name: "description", label: "Description", type: "textarea", placeholder: "Detailed description of the building...", description: "What does this building look like from the outside?" },
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
          { name: "setup", label: "Setup", type: "textarea", placeholder: "Introduce characters, world, and status quo...", description: "Set the stage for your story" },
          { name: "incitingIncident", label: "Inciting Incident", type: "textarea", placeholder: "The event that kicks off the main story...", description: "What disrupts the normal world?" },
          { name: "firstPlotPoint", label: "First Plot Point", type: "textarea", placeholder: "The protagonist commits to the journey...", description: "The point of no return" },
          { name: "midpoint", label: "Midpoint", type: "textarea", placeholder: "Major revelation or turning point...", description: "Everything changes here" }
        ]
      },
      {
        id: "climax",
        label: "Climax & Resolution", 
        icon: "Zap",
        fields: [
          { name: "secondPlotPoint", label: "Second Plot Point", type: "textarea", placeholder: "All hope seems lost...", description: "The darkest moment" },
          { name: "climax", label: "Climax", type: "textarea", placeholder: "The final confrontation...", description: "The ultimate showdown" },
          { name: "resolution", label: "Resolution", type: "textarea", placeholder: "How everything wraps up...", description: "The new normal" }
        ]
      },
      {
        id: "themes",
        label: "Themes & Conflict",
        icon: "Heart",
        fields: [
          { name: "theme", label: "Theme", type: "textarea", placeholder: "The deeper meaning or message...", description: "What is your story really about?" },
          { name: "conflict", label: "Central Conflict", type: "textarea", placeholder: "The main struggle or tension...", description: "What opposition drives the story?" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Romance", "Mystery", "Horror", "Thriller", "Drama", "Comedy", "Other"] },
          { name: "storyStructure", label: "Story Structure", type: "select", options: ["Three-Act", "Hero's Journey", "Save the Cat", "Freytag's Pyramid", "Other"] }
        ]
      }
    ]
  }

  // TODO: Add more content types as needed
};