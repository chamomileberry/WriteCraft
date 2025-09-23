import { FormFieldType, FormTabConfig, ContentTypeFormConfig } from './types';

// Field type configurations for different content types
export const contentTypeFormConfigs: Record<string, ContentTypeFormConfig> = {
  // Characters - comprehensive worldbuilding with tabs covering all aspects
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
          { name: "givenName", label: "Given Name", type: "text", placeholder: "Their first name at birth", description: "The name they were given at birth" },
          { name: "familyName", label: "Family Name", type: "text", placeholder: "Last name or surname", description: "Their family name or surname" },
          { name: "middleName", label: "Middle Name", type: "text", placeholder: "Middle name(s)", description: "Any middle names they have" },
          { name: "nickname", label: "Nickname", type: "text", placeholder: "What friends call them", description: "Common nickname or what friends call them" },
          { name: "honorificTitle", label: "Honorific Title", type: "text", placeholder: "Sir, Lady, Dr., etc.", description: "Formal titles or honors they hold" },
          { name: "prefix", label: "Prefix", type: "text", placeholder: "Mr., Ms., Lord, etc.", description: "Name prefixes used in formal address" },
          { name: "suffix", label: "Suffix", type: "text", placeholder: "Jr., Sr., III, etc.", description: "Name suffixes like Jr., Sr., III" },
          { name: "maidenName", label: "Maiden Name", type: "text", placeholder: "Name before marriage", description: "Their family name before marriage (if applicable)" },
          { name: "age", label: "Age", type: "number", placeholder: "Character's age...", description: "How old is this character?" },
          { name: "occupation", label: "Occupation", type: "autocomplete-profession", endpoint: "/api/professions", labelField: "name", valueField: "name", multiple: false, placeholder: "Search or select a profession...", description: "Their primary profession or role in society" },
          { name: "species", label: "Species", type: "autocomplete-species", multiple: false, placeholder: "Search or select a species...", description: "What species or race is this character?" },
          { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Non-Binary", "Agender", "Bigender", "Genderfluid", "Genderqueer", "Transgender", "Intersex", "Pangender", "Demigender", "Androgynous", "Omnigender", "Polygender"], placeholder: "Select gender identity", description: "Their gender identity and expression" },
          { name: "pronouns", label: "Pronouns", type: "select", options: ["they/them", "she/her", "he/him", "xe/xem", "ze/zir", "ey/em", "ve/ver", "fae/faer", "it/its", "she/they", "he/they", "any pronouns", "ask for pronouns"], placeholder: "Select pronouns", description: "Preferred pronouns for this character", customizable: true }
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
          { name: "genderIdentity", label: "Gender Identity", type: "select", options: ["Male", "Female", "Non-Binary", "Agender", "Bigender", "Genderfluid", "Genderqueer", "Transgender", "Intersex", "Pangender", "Demigender", "Androgynous", "Omnigender", "Polygender"], placeholder: "Select gender identity", description: "Their personal gender identity" },
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
          { name: "currentLocation", label: "Current Location", type: "autocomplete-location", placeholder: "Search or create location...", description: "Their current place of residence", multiple: false },
          { name: "currentResidence", label: "Current Residence", type: "text", placeholder: "Details about their home", description: "Specifics about where they live" },
          { name: "dateOfBirth", label: "Date of Birth", type: "text", placeholder: "When they were born", description: "Their birth date" },
          { name: "placeOfBirth", label: "Place of Birth", type: "autocomplete-location", placeholder: "Search or create birthplace...", description: "Their birthplace", multiple: false },
          { name: "dateOfDeath", label: "Date of Death", type: "text", placeholder: "When they died (if applicable)", description: "Date of death (for deceased characters)" },
          { name: "placeOfDeath", label: "Place of Death", type: "autocomplete-location", placeholder: "Search or create location...", description: "Place of death (for deceased characters)" },
          { name: "upbringing", label: "Upbringing", type: "textarea", placeholder: "How they were raised", description: "Details about their childhood and upbringing" },
          { name: "family", label: "Family Members", type: "autocomplete-character", placeholder: "Search or create family members...", description: "Family members and relationships", multiple: true },
          { name: "education", label: "Education", type: "textarea", placeholder: "Formal education, training, apprenticeships...", description: "Their educational background and training" },
          { name: "profession", label: "Current Profession", type: "text", placeholder: "Their current job or role", description: "What they do for work currently" },
          { name: "workHistory", label: "Work History", type: "textarea", placeholder: "Previous jobs, career progression...", description: "Their employment and career history" },
          { name: "accomplishments", label: "Accomplishments", type: "textarea", placeholder: "Notable achievements, awards, victories...", description: "Their major achievements and successes" },
          { name: "religiousBelief", label: "Religious Beliefs", type: "autocomplete-religion", placeholder: "Search or create religion...", description: "Their religious or spiritual beliefs", multiple: false },
          { name: "affiliatedOrganizations", label: "Organizations", type: "autocomplete-organization", placeholder: "Search or create organizations...", description: "Organizations they're affiliated with" },
          { name: "genderUnderstanding", label: "Gender Understanding", type: "textarea", placeholder: "How they understand and express gender", description: "Their understanding and relationship with gender" },
          { name: "sexualOrientation", label: "Sexual Orientation", type: "text", placeholder: "Their romantic and sexual preferences", description: "Their sexual and romantic orientation" },
          { name: "ethnicity", label: "Ethnicity", type: "text", placeholder: "Cultural and ethnic background", description: "Their ethnic and cultural heritage" },
          { name: "genre", label: "Genre/Setting", type: "select", options: ["Fantasy", "Science Fiction", "Literary Fiction", "Mystery", "Romance", "Thriller", "Horror", "Historical Fiction", "Contemporary Fiction", "Crime", "Adventure", "Western", "Dystopian", "Post-Apocalyptic", "Steampunk", "Cyberpunk", "Space Opera", "Urban Fantasy", "Paranormal Romance", "Cozy Mystery", "Hard Boiled", "Young Adult", "Children's", "Comedy", "Satire", "Drama", "Political Fiction", "Magical Realism", "Gothic", "Noir", "Superhero", "Military", "Espionage", "Techno-Thriller", "Medical Thriller", "Legal Thriller", "Psychological Thriller", "Biographical Fiction", "Alternate History", "Time Travel", "Fairy Tale Retelling", "Mythology", "Folklore", "Other"], placeholder: "Select genre (optional)", description: "The genre or setting type this character fits into - helps with AI generation and thematic consistency" }
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
  },

  // Languages
  language: {
    title: "Language Creator",
    description: "Create detailed languages for your world",
    icon: "Globe",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Globe",
        fields: [
          { name: "name", label: "Language Name", type: "text", placeholder: "Enter language name...", description: "The name of this language" },
          { name: "family", label: "Language Family", type: "text", placeholder: "Germanic, Romance, Constructed, etc.", description: "What family does this language belong to?" },
          { name: "speakers", label: "Speakers", type: "text", placeholder: "Who speaks this language?", description: "Description of the people or groups who speak this language" },
          { name: "regions", label: "Regions", type: "tags", placeholder: "Add regions where it's spoken", description: "Geographic regions where this language is used" },
          { name: "status", label: "Status", type: "select", options: ["Living", "Dead", "Constructed", "Evolving", "Extinct", "Revived"], description: "Current status of the language" },
          { name: "difficulty", label: "Learning Difficulty", type: "select", options: ["Very Easy", "Easy", "Moderate", "Hard", "Very Hard"], description: "How difficult is this language to learn?" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "structure",
        label: "Language Structure",
        icon: "BookOpen",
        fields: [
          { name: "phonology", label: "Phonology", type: "textarea", placeholder: "Describe the sounds and pronunciation...", description: "Sound system, pronunciation rules, and phonetic characteristics" },
          { name: "grammar", label: "Grammar", type: "textarea", placeholder: "Describe grammatical rules...", description: "Grammar rules, sentence structure, and linguistic patterns" },
          { name: "vocabulary", label: "Vocabulary", type: "textarea", placeholder: "Common words and meanings...", description: "Key vocabulary, word formation patterns, and semantic features" },
          { name: "writingSystem", label: "Writing System", type: "text", placeholder: "Alphabet, logographic, syllabic, etc.", description: "How is this language written down?" }
        ]
      },
      {
        id: "culture",
        label: "Cultural Context",
        icon: "Users",
        fields: [
          { name: "commonPhrases", label: "Common Phrases", type: "tags", placeholder: "Add common phrases and expressions", description: "Frequently used phrases and their meanings" },
          { name: "culturalContext", label: "Cultural Context", type: "textarea", placeholder: "How does culture influence this language?", description: "Cultural significance and how society shapes language use" },
          { name: "history", label: "History", type: "textarea", placeholder: "How did this language develop?", description: "Historical development and evolution of the language" },
          { name: "variations", label: "Dialects & Variations", type: "tags", placeholder: "Add regional dialects or variations", description: "Different dialects, accents, or regional variations" }
        ]
      }
    ]
  },

  // Creatures
  creature: {
    title: "Creature Creator",
    description: "Create detailed creatures for your world",
    icon: "Zap",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Zap",
        fields: [
          { name: "name", label: "Creature Name", type: "text", placeholder: "Enter creature name...", description: "The name of this creature" },
          { name: "creatureType", label: "Creature Type", type: "select", options: ["Beast", "Dragon", "Humanoid", "Fey", "Fiend", "Celestial", "Construct", "Undead", "Elemental", "Aberration", "Other"], description: "What type of creature is this?" },
          { name: "habitat", label: "Habitat", type: "text", placeholder: "Where does it live?", description: "Natural environment and preferred living conditions" },
          { name: "behavior", label: "Behavior", type: "textarea", placeholder: "How does it behave?", description: "Typical behavior patterns and temperament" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Horror", "Modern", "Historical", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "physical",
        label: "Physical Description",
        icon: "Eye",
        fields: [
          { name: "physicalDescription", label: "Physical Description", type: "textarea", placeholder: "Describe their appearance...", description: "Detailed description of the creature's physical appearance" },
          { name: "abilities", label: "Abilities", type: "tags", placeholder: "Add creature abilities", description: "Special abilities, powers, or skills this creature possesses" }
        ]
      },
      {
        id: "cultural",
        label: "Cultural Significance",
        icon: "Users",
        fields: [
          { name: "culturalSignificance", label: "Cultural Significance", type: "textarea", placeholder: "What role does this creature play in cultures?", description: "How different cultures view and interact with this creature" }
        ]
      }
    ]
  },

  // Locations
  location: {
    title: "Location Creator", 
    description: "Create detailed locations for your world",
    icon: "MapPin",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "MapPin",
        fields: [
          { name: "name", label: "Location Name", type: "text", placeholder: "Enter location name...", description: "The name of this place" },
          { name: "locationType", label: "Location Type", type: "select", options: ["City", "Town", "Village", "Forest", "Mountain", "Desert", "Ocean", "River", "Cave", "Dungeon", "Castle", "Temple", "Ruins", "Other"], description: "What type of location is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this location...", description: "General description of the location" },
          { name: "geography", label: "Geography", type: "text", placeholder: "Geographic features...", description: "Physical geographic characteristics" },
          { name: "climate", label: "Climate", type: "text", placeholder: "Weather and climate...", description: "Climate and weather patterns" }
        ]
      },
      {
        id: "society",
        label: "Society & Culture",
        icon: "Users",
        fields: [
          { name: "population", label: "Population", type: "text", placeholder: "Who lives here?", description: "Population size and demographics" },
          { name: "government", label: "Government", type: "text", placeholder: "How is it governed?", description: "Political structure and leadership" },
          { name: "economy", label: "Economy", type: "text", placeholder: "Economic activities...", description: "Economic system and primary industries" },
          { name: "culture", label: "Culture", type: "text", placeholder: "Cultural characteristics...", description: "Cultural practices and traditions" }
        ]
      },
      {
        id: "features",
        label: "Features & History",
        icon: "BookOpen",
        fields: [
          { name: "history", label: "History", type: "textarea", placeholder: "Historical background...", description: "Historical events and background" },
          { name: "notableFeatures", label: "Notable Features", type: "tags", placeholder: "Add notable features", description: "Distinctive landmarks or characteristics" },
          { name: "landmarks", label: "Landmarks", type: "tags", placeholder: "Add landmarks", description: "Important landmarks and points of interest" },
          { name: "threats", label: "Threats", type: "tags", placeholder: "Add potential dangers", description: "Dangers or threats that exist here" },
          { name: "resources", label: "Resources", type: "tags", placeholder: "Add available resources", description: "Natural resources and materials available" }
        ]
      }
    ]
  },

  // Organizations  
  organization: {
    title: "Organization Creator",
    description: "Create detailed organizations for your world",
    icon: "Users",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Users",
        fields: [
          { name: "name", label: "Organization Name", type: "text", placeholder: "Enter organization name...", description: "The name of this organization" },
          { name: "organizationType", label: "Organization Type", type: "select", options: ["Guild", "Corporation", "Government", "Military", "Religious", "Academic", "Criminal", "Secret Society", "Tribe", "Clan", "Other"], description: "What type of organization is this?" },
          { name: "purpose", label: "Purpose", type: "text", placeholder: "What is their main purpose?", description: "Primary purpose or mission of the organization" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this organization...", description: "General description of the organization" }
        ]
      },
      {
        id: "structure",
        label: "Structure & Leadership",
        icon: "Crown",
        fields: [
          { name: "structure", label: "Structure", type: "textarea", placeholder: "How is it organized?", description: "Organizational structure and hierarchy" },
          { name: "leadership", label: "Leadership", type: "text", placeholder: "Who leads this organization?", description: "Leadership structure and key figures" },
          { name: "members", label: "Members", type: "text", placeholder: "Who are the members?", description: "Membership composition and requirements" },
          { name: "headquarters", label: "Headquarters", type: "text", placeholder: "Where are they based?", description: "Main headquarters or base of operations" }
        ]
      },
      {
        id: "influence",
        label: "Influence & Relations",
        icon: "Globe",
        fields: [
          { name: "influence", label: "Influence", type: "text", placeholder: "How much influence do they have?", description: "Scope and level of influence" },
          { name: "resources", label: "Resources", type: "text", placeholder: "What resources do they control?", description: "Financial, material, and other resources" },
          { name: "goals", label: "Goals", type: "text", placeholder: "What are their goals?", description: "Short-term and long-term objectives" },
          { name: "history", label: "History", type: "textarea", placeholder: "Historical background...", description: "Formation and historical development" },
          { name: "allies", label: "Allies", type: "tags", placeholder: "Add allied organizations", description: "Allied organizations and positive relationships" },
          { name: "enemies", label: "Enemies", type: "tags", placeholder: "Add enemy organizations", description: "Enemy organizations and conflicts" }
        ]
      }
    ]
  },

  // Species
  species: {
    title: "Species Creator",
    description: "Create detailed species for your world",
    icon: "Zap",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Zap",
        fields: [
          { name: "name", label: "Species Name", type: "text", placeholder: "Enter species name...", description: "The name of this species" },
          { name: "classification", label: "Classification", type: "text", placeholder: "Scientific or fantasy classification", description: "Taxonomic or fantasy classification" },
          { name: "physicalDescription", label: "Physical Description", type: "textarea", placeholder: "Describe their appearance...", description: "Detailed physical characteristics" },
          { name: "habitat", label: "Habitat", type: "text", placeholder: "Where do they live?", description: "Natural habitat and environment" }
        ]
      },
      {
        id: "biology",
        label: "Biology & Behavior",
        icon: "Heart",
        fields: [
          { name: "behavior", label: "Behavior", type: "textarea", placeholder: "How do they behave?", description: "Behavioral patterns and traits" },
          { name: "diet", label: "Diet", type: "text", placeholder: "What do they eat?", description: "Dietary habits and food sources" },
          { name: "lifespan", label: "Lifespan", type: "text", placeholder: "How long do they live?", description: "Average lifespan and lifecycle" },
          { name: "intelligence", label: "Intelligence", type: "text", placeholder: "How intelligent are they?", description: "Intelligence level and cognitive abilities" },
          { name: "reproduction", label: "Reproduction", type: "text", placeholder: "How do they reproduce?", description: "Reproductive methods and mating behaviors" }
        ]
      },
      {
        id: "society",
        label: "Society & Traits",
        icon: "Users",
        fields: [
          { name: "socialStructure", label: "Social Structure", type: "text", placeholder: "How do they organize socially?", description: "Social organization and group dynamics" },
          { name: "abilities", label: "Abilities", type: "tags", placeholder: "Add special abilities", description: "Special abilities, powers, or talents" },
          { name: "weaknesses", label: "Weaknesses", type: "tags", placeholder: "Add weaknesses", description: "Vulnerabilities or limitations" },
          { name: "culturalTraits", label: "Cultural Traits", type: "text", placeholder: "Cultural characteristics...", description: "Cultural behaviors and traditions" }
        ]
      }
    ]
  },

  // Items
  item: {
    title: "Item Creator",
    description: "Create detailed items for your world",
    icon: "Package",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Package",
        fields: [
          { name: "name", label: "Item Name", type: "text", placeholder: "Enter item name...", description: "The name of this item" },
          { name: "itemType", label: "Item Type", type: "select", options: ["Weapon", "Armor", "Tool", "Magic Item", "Artifact", "Consumable", "Trade Good", "Art Object", "Document", "Other"], description: "What type of item is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this item...", description: "Detailed description of the item" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"], description: "How rare is this item?" }
        ]
      },
      {
        id: "properties",
        label: "Properties & Value",
        icon: "Gem",
        fields: [
          { name: "value", label: "Value", type: "text", placeholder: "Item's worth...", description: "Economic value or cost" },
          { name: "weight", label: "Weight", type: "text", placeholder: "How heavy is it?", description: "Physical weight and portability" },
          { name: "properties", label: "Properties", type: "tags", placeholder: "Add item properties", description: "Special properties and characteristics" },
          { name: "materials", label: "Materials", type: "tags", placeholder: "Add materials used", description: "Materials used in construction" },
          { name: "requirements", label: "Requirements", type: "text", placeholder: "Usage requirements...", description: "Requirements to use this item effectively" }
        ]
      },
      {
        id: "lore",
        label: "Lore & Abilities",
        icon: "BookOpen",
        fields: [
          { name: "history", label: "History", type: "textarea", placeholder: "Item's history...", description: "Historical background and origin" },
          { name: "abilities", label: "Abilities", type: "tags", placeholder: "Add special abilities", description: "Magical or special abilities the item grants" },
          { name: "crafting", label: "Crafting", type: "text", placeholder: "How is it made?", description: "Crafting process and requirements" }
        ]
      }
    ]
  },

  // Food
  food: {
    title: "Food Creator",
    description: "Create detailed foods for your world",
    icon: "Apple",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Apple",
        fields: [
          { name: "name", label: "Food Name", type: "text", placeholder: "Enter food name...", description: "The name of this food" },
          { name: "foodType", label: "Food Type", type: "select", options: ["Meat", "Vegetable", "Fruit", "Grain", "Dairy", "Dessert", "Beverage", "Spice", "Bread", "Soup", "Other"], description: "What type of food is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this food...", description: "Detailed description of the food" },
          { name: "origin", label: "Origin", type: "text", placeholder: "Where does it come from?", description: "Geographic or cultural origin" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "details",
        label: "Details & Properties",
        icon: "Leaf",
        fields: [
          { name: "taste", label: "Taste", type: "text", placeholder: "How does it taste?", description: "Flavor profile and taste characteristics" },
          { name: "texture", label: "Texture", type: "text", placeholder: "What's the texture like?", description: "Physical texture and mouthfeel" },
          { name: "ingredients", label: "Ingredients", type: "tags", placeholder: "Add ingredients", description: "Main ingredients or components" },
          { name: "preparation", label: "Preparation", type: "textarea", placeholder: "How is it prepared?", description: "Cooking or preparation methods" },
          { name: "nutritionalValue", label: "Nutritional Value", type: "text", placeholder: "Health benefits or effects", description: "Nutritional content and health effects" }
        ]
      },
      {
        id: "cultural",
        label: "Cultural & Economic",
        icon: "Users",
        fields: [
          { name: "culturalSignificance", label: "Cultural Significance", type: "textarea", placeholder: "Cultural importance...", description: "Role in culture and society" },
          { name: "cost", label: "Cost", type: "text", placeholder: "How expensive is it?", description: "Economic value and affordability" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary"], description: "How rare or common is this food?" },
          { name: "seasonality", label: "Seasonality", type: "text", placeholder: "When is it available?", description: "Seasonal availability" }
        ]
      }
    ]
  },

  // Drinks
  drink: {
    title: "Drink Creator",
    description: "Create detailed drinks for your world",
    icon: "Cup",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Cup",
        fields: [
          { name: "name", label: "Drink Name", type: "text", placeholder: "Enter drink name...", description: "The name of this drink" },
          { name: "drinkType", label: "Drink Type", type: "select", options: ["Alcoholic", "Non-alcoholic", "Magical", "Potion", "Tea", "Coffee", "Juice", "Water", "Other"], description: "What type of drink is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this drink...", description: "Detailed description of the drink" },
          { name: "alcoholContent", label: "Alcohol Content", type: "text", placeholder: "Alcohol percentage or strength", description: "Alcoholic strength if applicable" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "properties",
        label: "Properties & Effects",
        icon: "Zap",
        fields: [
          { name: "taste", label: "Taste", type: "text", placeholder: "How does it taste?", description: "Flavor profile and taste characteristics" },
          { name: "appearance", label: "Appearance", type: "text", placeholder: "What does it look like?", description: "Visual appearance and color" },
          { name: "ingredients", label: "Ingredients", type: "tags", placeholder: "Add ingredients", description: "Main ingredients or components" },
          { name: "preparation", label: "Preparation", type: "textarea", placeholder: "How is it made?", description: "Brewing or preparation methods" },
          { name: "effects", label: "Effects", type: "text", placeholder: "What effects does it have?", description: "Physical or magical effects when consumed" }
        ]
      },
      {
        id: "cultural",
        label: "Cultural & Economic",
        icon: "Users",
        fields: [
          { name: "origin", label: "Origin", type: "text", placeholder: "Where does it come from?", description: "Geographic or cultural origin" },
          { name: "culturalSignificance", label: "Cultural Significance", type: "textarea", placeholder: "Cultural importance...", description: "Role in culture and ceremonies" },
          { name: "cost", label: "Cost", type: "text", placeholder: "How expensive is it?", description: "Economic value and affordability" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary"], description: "How rare or common is this drink?" }
        ]
      }
    ]
  },

  // Armor
  armor: {
    title: "Armor Creator",
    description: "Create detailed armor for your world",
    icon: "Shield",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Shield",
        fields: [
          { name: "name", label: "Armor Name", type: "text", placeholder: "Enter armor name...", description: "The name of this armor" },
          { name: "armorType", label: "Armor Type", type: "select", options: ["Light", "Medium", "Heavy", "Shield", "Helmet", "Gauntlets", "Boots", "Cloak", "Magical", "Other"], description: "What type of armor is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this armor...", description: "Detailed description of the armor" },
          { name: "protection", label: "Protection", type: "text", placeholder: "How much protection does it offer?", description: "Level and type of protection provided" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "properties",
        label: "Properties & Materials",
        icon: "Hammer",
        fields: [
          { name: "weight", label: "Weight", type: "text", placeholder: "How heavy is it?", description: "Physical weight and burden" },
          { name: "materials", label: "Materials", type: "tags", placeholder: "Add materials used", description: "Materials used in construction" },
          { name: "coverage", label: "Coverage", type: "text", placeholder: "What body parts does it cover?", description: "Areas of the body protected" },
          { name: "mobility", label: "Mobility", type: "text", placeholder: "How does it affect movement?", description: "Impact on wearer's mobility and dexterity" },
          { name: "craftsmanship", label: "Craftsmanship", type: "text", placeholder: "Quality of construction", description: "Level of skill and quality in creation" }
        ]
      },
      {
        id: "lore",
        label: "Lore & Value",
        icon: "BookOpen",
        fields: [
          { name: "enchantments", label: "Enchantments", type: "tags", placeholder: "Add magical enhancements", description: "Magical properties and enchantments" },
          { name: "history", label: "History", type: "textarea", placeholder: "Armor's history...", description: "Historical background and previous owners" },
          { name: "value", label: "Value", type: "text", placeholder: "What is it worth?", description: "Economic value and rarity" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"], description: "How rare is this armor?" },
          { name: "maintenance", label: "Maintenance", type: "text", placeholder: "Care requirements", description: "How to maintain and care for the armor" }
        ]
      }
    ]
  },

  // Religions
  religion: {
    title: "Religion Creator",
    description: "Create detailed religions for your world",
    icon: "Church",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Church",
        fields: [
          { name: "name", label: "Religion Name", type: "text", placeholder: "Enter religion name...", description: "The name of this religion" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this religion...", description: "General description and overview" },
          { name: "followers", label: "Followers", type: "text", placeholder: "Who follows this religion?", description: "Description of the faithful and adherents" },
          { name: "influence", label: "Influence", type: "text", placeholder: "How influential is it?", description: "Social and political influence" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "beliefs",
        label: "Beliefs & Practices",
        icon: "Heart",
        fields: [
          { name: "beliefs", label: "Core Beliefs", type: "tags", placeholder: "Add core beliefs", description: "Fundamental beliefs and doctrines" },
          { name: "practices", label: "Practices", type: "tags", placeholder: "Add religious practices", description: "Regular practices and rituals" },
          { name: "deities", label: "Deities", type: "tags", placeholder: "Add deities or divine figures", description: "Gods, goddesses, or divine entities" },
          { name: "morality", label: "Morality", type: "text", placeholder: "Moral and ethical code", description: "Moral teachings and ethical guidelines" },
          { name: "afterlife", label: "Afterlife", type: "text", placeholder: "Beliefs about death and afterlife", description: "Teachings about death and what comes after" }
        ]
      },
      {
        id: "organization",
        label: "Organization & Culture",
        icon: "Users",
        fields: [
          { name: "hierarchy", label: "Hierarchy", type: "text", placeholder: "Religious organization structure", description: "Organizational structure and leadership" },
          { name: "ceremonies", label: "Ceremonies", type: "tags", placeholder: "Add ceremonies and rituals", description: "Important ceremonies and ritual practices" },
          { name: "symbols", label: "Symbols", type: "tags", placeholder: "Add religious symbols", description: "Sacred symbols and iconography" },
          { name: "scriptures", label: "Scriptures", type: "text", placeholder: "Holy texts and writings", description: "Sacred texts and religious writings" },
          { name: "history", label: "History", type: "textarea", placeholder: "Religious history...", description: "Historical development and founding" }
        ]
      }
    ]
  },

  // Technology
  technology: {
    title: "Technology Creator",
    description: "Create detailed technologies for your world",
    icon: "Cog",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Cog",
        fields: [
          { name: "name", label: "Technology Name", type: "text", placeholder: "Enter technology name...", description: "The name of this technology" },
          { name: "technologyType", label: "Technology Type", type: "select", options: ["Magical", "Mechanical", "Biological", "Chemical", "Quantum", "Digital", "Energy", "Medical", "Transportation", "Other"], description: "What type of technology is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this technology...", description: "Detailed description of the technology" },
          { name: "function", label: "Function", type: "text", placeholder: "What does it do?", description: "Primary function and purpose" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Steampunk", "Cyberpunk", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "mechanics",
        label: "Mechanics & Requirements",
        icon: "Settings",
        fields: [
          { name: "principles", label: "Principles", type: "textarea", placeholder: "How does it work?", description: "Underlying principles and mechanics" },
          { name: "requirements", label: "Requirements", type: "tags", placeholder: "Add requirements", description: "Materials, energy, or conditions needed to operate" },
          { name: "limitations", label: "Limitations", type: "tags", placeholder: "Add limitations", description: "Constraints and limitations on usage" },
          { name: "applications", label: "Applications", type: "tags", placeholder: "Add applications", description: "Practical applications and uses" },
          { name: "risks", label: "Risks", type: "text", placeholder: "What are the dangers?", description: "Potential risks and hazards" }
        ]
      },
      {
        id: "development",
        label: "Development & Availability",
        icon: "Lightbulb",
        fields: [
          { name: "development", label: "Development", type: "text", placeholder: "Development status", description: "Current state of development" },
          { name: "inventors", label: "Inventors", type: "text", placeholder: "Who created it?", description: "Inventors or developers" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Unique"], description: "How rare or common is this technology?" },
          { name: "evolution", label: "Evolution", type: "text", placeholder: "How has it evolved?", description: "Historical development and future potential" }
        ]
      }
    ]
  },

  // Spells
  spell: {
    title: "Spell Creator",
    description: "Create detailed spells for your world",
    icon: "Sparkles",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Sparkles",
        fields: [
          { name: "name", label: "Spell Name", type: "text", placeholder: "Enter spell name...", description: "The name of this spell" },
          { name: "school", label: "School of Magic", type: "select", options: ["Evocation", "Divination", "Enchantment", "Illusion", "Necromancy", "Transmutation", "Conjuration", "Abjuration", "Elemental", "Other"], description: "Which school of magic does this belong to?" },
          { name: "level", label: "Spell Level", type: "select", options: ["Cantrip", "1st Level", "2nd Level", "3rd Level", "4th Level", "5th Level", "6th Level", "7th Level", "8th Level", "9th Level", "Epic"], description: "Power level of the spell" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this spell...", description: "Detailed description of the spell's effects" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Urban Fantasy", "Sci-Fi", "Horror", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "mechanics",
        label: "Mechanics & Casting",
        icon: "Wand",
        fields: [
          { name: "components", label: "Components", type: "tags", placeholder: "Add spell components", description: "Verbal, somatic, or material components needed" },
          { name: "castingTime", label: "Casting Time", type: "text", placeholder: "How long to cast?", description: "Time required to cast the spell" },
          { name: "range", label: "Range", type: "text", placeholder: "Spell's range", description: "Distance the spell can reach" },
          { name: "duration", label: "Duration", type: "text", placeholder: "How long does it last?", description: "How long the spell's effects last" },
          { name: "effect", label: "Effect", type: "textarea", placeholder: "What does it do?", description: "Detailed magical effects and mechanics" }
        ]
      },
      {
        id: "lore",
        label: "Lore & Variations",
        icon: "BookOpen",
        fields: [
          { name: "origin", label: "Origin", type: "text", placeholder: "Where did this spell come from?", description: "Historical origin and creator" },
          { name: "variations", label: "Variations", type: "tags", placeholder: "Add spell variations", description: "Different versions or modifications of the spell" },
          { name: "limitations", label: "Limitations", type: "text", placeholder: "What are the limits?", description: "Constraints and limitations on the spell" },
          { name: "risks", label: "Risks", type: "text", placeholder: "Dangers of casting", description: "Potential risks or backlash from casting" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Lost", "Forbidden"], description: "How rare or restricted is this spell?" }
        ]
      }
    ]
  },

  // Animal
  animal: {
    title: "Animal Creator",
    description: "Create detailed animals for your world",
    icon: "Cat",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Cat",
        fields: [
          { name: "name", label: "Animal Name", type: "text", placeholder: "Enter animal name...", description: "The name of this animal" },
          { name: "animalType", label: "Animal Type", type: "select", options: ["Mammal", "Bird", "Reptile", "Fish", "Amphibian", "Insect", "Arachnid", "Mythical", "Hybrid", "Other"], description: "What type of animal is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this animal...", description: "Detailed description of the animal" },
          { name: "habitat", label: "Habitat", type: "text", placeholder: "Where does it live?", description: "Natural habitat and environment" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Realistic", "Prehistoric", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "biology",
        label: "Biology & Behavior",
        icon: "Heart",
        fields: [
          { name: "diet", label: "Diet", type: "text", placeholder: "What does it eat?", description: "Dietary habits and food sources" },
          { name: "behavior", label: "Behavior", type: "textarea", placeholder: "How does it behave?", description: "Behavioral patterns and temperament" },
          { name: "lifespan", label: "Lifespan", type: "text", placeholder: "How long does it live?", description: "Average lifespan and lifecycle" },
          { name: "reproduction", label: "Reproduction", type: "text", placeholder: "How does it reproduce?", description: "Mating and reproductive behaviors" },
          { name: "socialStructure", label: "Social Structure", type: "text", placeholder: "How do they organize socially?", description: "Pack behavior and social organization" }
        ]
      },
      {
        id: "traits",
        label: "Traits & Abilities",
        icon: "Zap",
        fields: [
          { name: "physicalTraits", label: "Physical Traits", type: "tags", placeholder: "Add physical characteristics", description: "Notable physical features and traits" },
          { name: "abilities", label: "Special Abilities", type: "tags", placeholder: "Add special abilities", description: "Unique abilities or powers" },
          { name: "intelligence", label: "Intelligence", type: "text", placeholder: "How intelligent is it?", description: "Intelligence level and cognitive abilities" },
          { name: "domestication", label: "Domestication", type: "text", placeholder: "Can it be domesticated?", description: "Relationship with civilized species" }
        ]
      }
    ]
  },

  // Resource  
  resource: {
    title: "Resource Creator",
    description: "Create detailed resources for your world",
    icon: "Gem",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Gem",
        fields: [
          { name: "name", label: "Resource Name", type: "text", placeholder: "Enter resource name...", description: "The name of this resource" },
          { name: "resourceType", label: "Resource Type", type: "select", options: ["Natural", "Manufactured", "Magical", "Energy", "Mineral", "Organic", "Rare Earth", "Fuel", "Precious", "Other"], description: "What type of resource is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this resource...", description: "Detailed description of the resource" },
          { name: "abundance", label: "Abundance", type: "select", options: ["Abundant", "Common", "Uncommon", "Rare", "Very Rare", "Extinct"], description: "How abundant is this resource?" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Modern", "Historical", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "extraction",
        label: "Extraction & Location",
        icon: "Pickaxe",
        fields: [
          { name: "location", label: "Location", type: "text", placeholder: "Where is it found?", description: "Geographic locations where it can be found" },
          { name: "extractionMethod", label: "Extraction Method", type: "text", placeholder: "How is it extracted?", description: "Methods used to harvest or extract the resource" },
          { name: "renewability", label: "Renewability", type: "select", options: ["Renewable", "Sustainable", "Limited", "Non-renewable", "Finite"], description: "Can this resource be replenished?" },
          { name: "controlledBy", label: "Controlled By", type: "text", placeholder: "Who controls access?", description: "Organizations or entities that control this resource" }
        ]
      },
      {
        id: "economics",
        label: "Economics & Politics",
        icon: "Coins",
        fields: [
          { name: "uses", label: "Uses", type: "tags", placeholder: "Add resource uses", description: "Primary uses and applications" },
          { name: "value", label: "Value", type: "text", placeholder: "Economic value", description: "Economic worth and market value" },
          { name: "tradeCommodity", label: "Trade Commodity", type: "text", placeholder: "Trade importance", description: "Importance in trade and commerce" },
          { name: "conflicts", label: "Conflicts", type: "text", placeholder: "Resource-related conflicts", description: "Wars or conflicts over this resource" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Unique"], description: "Overall rarity assessment" }
        ]
      }
    ]
  },

  // Ethnicity
  ethnicity: {
    title: "Ethnicity Creator",
    description: "Create detailed ethnicities for your world",
    icon: "Users",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Users",
        fields: [
          { name: "name", label: "Ethnicity Name", type: "text", placeholder: "Enter ethnicity name...", description: "The name of this ethnicity" },
          { name: "origin", label: "Origin", type: "text", placeholder: "Where did they originate?", description: "Geographic or historical origin" },
          { name: "physicalTraits", label: "Physical Traits", type: "text", placeholder: "Common physical characteristics", description: "Typical physical appearance and traits" },
          { name: "geography", label: "Geography", type: "autocomplete-location", placeholder: "Search locations...", description: "Geographic regions they inhabit" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "culture",
        label: "Culture & Society",
        icon: "Heart",
        fields: [
          { name: "culturalTraits", label: "Cultural Traits", type: "text", placeholder: "Cultural characteristics", description: "Distinctive cultural features and behaviors" },
          { name: "traditions", label: "Traditions", type: "autocomplete-tradition", placeholder: "Search traditions...", description: "Important traditions and customs" },
          { name: "language", label: "Language", type: "autocomplete-language", placeholder: "Search languages...", description: "Primary language or linguistic family" },
          { name: "religion", label: "Religion", type: "autocomplete-religion", placeholder: "Search religions...", description: "Primary religious or spiritual beliefs" },
          { name: "socialStructure", label: "Social Structure", type: "text", placeholder: "How is society organized?", description: "Social organization and hierarchy" }
        ]
      },
      {
        id: "values",
        label: "Values & History",
        icon: "BookOpen",
        fields: [
          { name: "values", label: "Core Values", type: "tags", placeholder: "Add core values", description: "Fundamental values and principles" },
          { name: "customs", label: "Customs", type: "tags", placeholder: "Add customs", description: "Daily customs and social practices" },
          { name: "history", label: "History", type: "textarea", placeholder: "Historical background...", description: "Historical development and major events" }
        ]
      }
    ]
  },

  // Culture
  culture: {
    title: "Culture Creator",
    description: "Create detailed cultures for your world",
    icon: "Globe",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Globe",
        fields: [
          { name: "name", label: "Culture Name", type: "text", placeholder: "Enter culture name...", description: "The name of this culture" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this culture...", description: "General description and overview" },
          { name: "language", label: "Language", type: "text", placeholder: "Primary language", description: "Main language spoken by this culture" },
          { name: "governance", label: "Governance", type: "text", placeholder: "How are they governed?", description: "Political system and governance structure" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "society",
        label: "Society & Values",
        icon: "Heart",
        fields: [
          { name: "values", label: "Core Values", type: "tags", placeholder: "Add core values", description: "Fundamental cultural values" },
          { name: "beliefs", label: "Beliefs", type: "tags", placeholder: "Add beliefs", description: "Important beliefs and worldviews" },
          { name: "socialNorms", label: "Social Norms", type: "tags", placeholder: "Add social norms", description: "Expected behaviors and social rules" },
          { name: "family", label: "Family Structure", type: "text", placeholder: "Family organization", description: "How families are structured and function" },
          { name: "education", label: "Education", type: "text", placeholder: "Educational practices", description: "How knowledge is transmitted and learning occurs" }
        ]
      },
      {
        id: "practices",
        label: "Practices & Arts",
        icon: "Palette",
        fields: [
          { name: "traditions", label: "Traditions", type: "tags", placeholder: "Add traditions", description: "Important cultural traditions" },
          { name: "ceremonies", label: "Ceremonies", type: "tags", placeholder: "Add ceremonies", description: "Important ceremonies and rituals" },
          { name: "arts", label: "Arts", type: "text", placeholder: "Artistic traditions", description: "Art forms and creative expressions" },
          { name: "technology", label: "Technology", type: "text", placeholder: "Technological level", description: "Technological development and innovations" },
          { name: "economy", label: "Economy", type: "text", placeholder: "Economic system", description: "Economic structure and trade practices" }
        ]
      }
    ]
  },

  // Document
  document: {
    title: "Document Creator",
    description: "Create detailed documents for your world",
    icon: "FileText",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "FileText",
        fields: [
          { name: "title", label: "Document Title", type: "text", placeholder: "Enter document title...", description: "The title of this document" },
          { name: "documentType", label: "Document Type", type: "select", options: ["Book", "Scroll", "Letter", "Map", "Charter", "Diary", "Report", "Contract", "Prophecy", "Manual", "Other"], description: "What type of document is this?" },
          { name: "author", label: "Author", type: "text", placeholder: "Who created this?", description: "The original author or creator" },
          { name: "language", label: "Language", type: "text", placeholder: "What language is it in?", description: "The language the document is written in" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "content",
        label: "Content & Condition",
        icon: "Edit",
        fields: [
          { name: "content", label: "Content", type: "textarea", placeholder: "Document contents...", description: "The main text or content of the document" },
          { name: "age", label: "Age", type: "text", placeholder: "How old is it?", description: "Age of the document" },
          { name: "condition", label: "Condition", type: "select", options: ["Pristine", "Good", "Fair", "Poor", "Damaged", "Fragmentary"], description: "Physical condition of the document" },
          { name: "accessibility", label: "Accessibility", type: "text", placeholder: "Who can access it?", description: "Who has access to this document" }
        ]
      },
      {
        id: "significance",
        label: "Significance & Secrets",
        icon: "Lock",
        fields: [
          { name: "significance", label: "Significance", type: "text", placeholder: "Why is it important?", description: "Historical or cultural significance" },
          { name: "location", label: "Location", type: "text", placeholder: "Where is it kept?", description: "Current location or repository" },
          { name: "secrets", label: "Secrets", type: "text", placeholder: "Hidden information", description: "Secret or hidden information within the document" },
          { name: "history", label: "History", type: "textarea", placeholder: "Document's history...", description: "History of the document's creation and travels" }
        ]
      }
    ]
  },

  // Accessory
  accessory: {
    title: "Accessory Creator",
    description: "Create detailed accessories for your world",
    icon: "Watch",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Watch",
        fields: [
          { name: "name", label: "Accessory Name", type: "text", placeholder: "Enter accessory name...", description: "The name of this accessory" },
          { name: "accessoryType", label: "Accessory Type", type: "select", options: ["Jewelry", "Belt", "Cloak", "Hat", "Gloves", "Bag", "Amulet", "Ring", "Necklace", "Bracelet", "Other"], description: "What type of accessory is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this accessory...", description: "Detailed description of the accessory" },
          { name: "appearance", label: "Appearance", type: "text", placeholder: "What does it look like?", description: "Visual appearance and design" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "properties",
        label: "Properties & Materials",
        icon: "Gem",
        fields: [
          { name: "materials", label: "Materials", type: "tags", placeholder: "Add materials used", description: "Materials used in construction" },
          { name: "functionality", label: "Functionality", type: "text", placeholder: "What does it do?", description: "Practical functions or purposes" },
          { name: "value", label: "Value", type: "text", placeholder: "What is it worth?", description: "Economic or cultural value" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"], description: "How rare is this accessory?" }
        ]
      },
      {
        id: "lore",
        label: "Lore & Magic",
        icon: "Sparkles",
        fields: [
          { name: "enchantments", label: "Enchantments", type: "tags", placeholder: "Add magical properties", description: "Magical enchantments or properties" },
          { name: "culturalSignificance", label: "Cultural Significance", type: "text", placeholder: "Cultural importance", description: "Role in culture and society" },
          { name: "history", label: "History", type: "textarea", placeholder: "Accessory's history...", description: "Historical background and previous owners" }
        ]
      }
    ]
  },

  // Clothing
  clothing: {
    title: "Clothing Creator",
    description: "Create detailed clothing for your world",
    icon: "Shirt",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Shirt",
        fields: [
          { name: "name", label: "Clothing Name", type: "text", placeholder: "Enter clothing name...", description: "The name of this clothing" },
          { name: "clothingType", label: "Clothing Type", type: "select", options: ["Shirt", "Pants", "Dress", "Robe", "Cloak", "Hat", "Shoes", "Armor", "Uniform", "Ceremonial", "Other"], description: "What type of clothing is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this clothing...", description: "Detailed description of the clothing" },
          { name: "style", label: "Style", type: "text", placeholder: "Fashion style", description: "Fashion style and aesthetic" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "materials",
        label: "Materials & Colors",
        icon: "Palette",
        fields: [
          { name: "materials", label: "Materials", type: "tags", placeholder: "Add materials used", description: "Fabrics and materials used" },
          { name: "colors", label: "Colors", type: "tags", placeholder: "Add colors", description: "Primary colors and patterns" },
          { name: "durability", label: "Durability", type: "text", placeholder: "How durable is it?", description: "Durability and wear resistance" },
          { name: "climate", label: "Climate", type: "text", placeholder: "Suitable climate", description: "Climate conditions it's designed for" }
        ]
      },
      {
        id: "social",
        label: "Social & Cultural",
        icon: "Users",
        fields: [
          { name: "socialClass", label: "Social Class", type: "text", placeholder: "Associated social class", description: "Which social classes typically wear this" },
          { name: "culturalContext", label: "Cultural Context", type: "text", placeholder: "Cultural significance", description: "Cultural meaning and context" },
          { name: "occasion", label: "Occasion", type: "text", placeholder: "When is it worn?", description: "Appropriate occasions and events" },
          { name: "cost", label: "Cost", type: "text", placeholder: "How expensive is it?", description: "Economic cost and affordability" }
        ]
      }
    ]
  },

  // Material
  material: {
    title: "Material Creator",
    description: "Create detailed materials for your world",
    icon: "Package",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Package",
        fields: [
          { name: "name", label: "Material Name", type: "text", placeholder: "Enter material name...", description: "The name of this material" },
          { name: "materialType", label: "Material Type", type: "select", options: ["Metal", "Wood", "Fabric", "Stone", "Crystal", "Organic", "Synthetic", "Magical", "Composite", "Other"], description: "What type of material is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this material...", description: "Detailed description of the material" },
          { name: "appearance", label: "Appearance", type: "text", placeholder: "What does it look like?", description: "Visual appearance and characteristics" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "properties",
        label: "Properties & Processing",
        icon: "Settings",
        fields: [
          { name: "properties", label: "Properties", type: "tags", placeholder: "Add material properties", description: "Physical and chemical properties" },
          { name: "durability", label: "Durability", type: "text", placeholder: "How durable is it?", description: "Strength and resistance to wear" },
          { name: "weight", label: "Weight", type: "text", placeholder: "How heavy is it?", description: "Density and weight characteristics" },
          { name: "processing", label: "Processing", type: "text", placeholder: "How is it processed?", description: "Methods to refine or work with the material" },
          { name: "source", label: "Source", type: "text", placeholder: "Where does it come from?", description: "Natural or manufactured source" }
        ]
      },
      {
        id: "economics",
        label: "Economics & Uses",
        icon: "Coins",
        fields: [
          { name: "uses", label: "Uses", type: "tags", placeholder: "Add material uses", description: "Common applications and purposes" },
          { name: "value", label: "Value", type: "text", placeholder: "Economic value", description: "Market value and cost" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Unique"], description: "How rare is this material?" }
        ]
      }
    ]
  },

  // Settlement
  settlement: {
    title: "Settlement Creator",
    description: "Create detailed settlements for your world",
    icon: "Home",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Home",
        fields: [
          { name: "name", label: "Settlement Name", type: "text", placeholder: "Enter settlement name...", description: "The name of this settlement" },
          { name: "settlementType", label: "Settlement Type", type: "select", options: ["City", "Town", "Village", "Outpost", "Fortress", "Trading Post", "Port", "Capital", "Ruins", "Other"], description: "What type of settlement is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this settlement...", description: "General description and overview" },
          { name: "population", label: "Population", type: "text", placeholder: "How many people live here?", description: "Number of inhabitants" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "governance",
        label: "Governance & Society",
        icon: "Crown",
        fields: [
          { name: "government", label: "Government", type: "text", placeholder: "How is it governed?", description: "Political system and leadership" },
          { name: "economy", label: "Economy", type: "text", placeholder: "Economic base", description: "Primary economic activities and trade" },
          { name: "culture", label: "Culture", type: "text", placeholder: "Cultural characteristics", description: "Cultural identity and social norms" },
          { name: "defenses", label: "Defenses", type: "text", placeholder: "How is it defended?", description: "Military defenses and fortifications" }
        ]
      },
      {
        id: "geography",
        label: "Geography & Features",
        icon: "MapPin",
        fields: [
          { name: "geography", label: "Geography", type: "text", placeholder: "Geographic features", description: "Terrain and geographic setting" },
          { name: "climate", label: "Climate", type: "text", placeholder: "Climate conditions", description: "Weather patterns and climate" },
          { name: "resources", label: "Resources", type: "tags", placeholder: "Add natural resources", description: "Available natural resources" },
          { name: "landmarks", label: "Landmarks", type: "tags", placeholder: "Add landmarks", description: "Notable buildings and locations" },
          { name: "districts", label: "Districts", type: "tags", placeholder: "Add districts", description: "Different areas or neighborhoods" },
          { name: "threats", label: "Threats", type: "tags", placeholder: "Add threats", description: "Dangers and challenges facing the settlement" },
          { name: "history", label: "History", type: "textarea", placeholder: "Settlement's history...", description: "Historical background and founding" }
        ]
      }
    ]
  },

  // Society
  society: {
    title: "Society Creator",
    description: "Create detailed societies for your world",
    icon: "Users",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Users",
        fields: [
          { name: "name", label: "Society Name", type: "text", placeholder: "Enter society name...", description: "The name of this society" },
          { name: "societyType", label: "Society Type", type: "select", options: ["Tribal", "Feudal", "Democratic", "Autocratic", "Theocratic", "Merchant", "Nomadic", "Military", "Academic", "Other"], description: "What type of society is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this society...", description: "General description and overview" },
          { name: "structure", label: "Structure", type: "text", placeholder: "Social structure", description: "How society is organized and structured" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "governance",
        label: "Governance & Law",
        icon: "Scale",
        fields: [
          { name: "leadership", label: "Leadership", type: "text", placeholder: "How is it led?", description: "Leadership structure and authority" },
          { name: "laws", label: "Laws", type: "text", placeholder: "Legal system", description: "Legal system and justice" },
          { name: "values", label: "Core Values", type: "tags", placeholder: "Add core values", description: "Fundamental societal values" },
          { name: "customs", label: "Customs", type: "tags", placeholder: "Add customs", description: "Important customs and traditions" }
        ]
      },
      {
        id: "systems",
        label: "Systems & Culture",
        icon: "Cog",
        fields: [
          { name: "economy", label: "Economy", type: "text", placeholder: "Economic system", description: "Economic structure and trade" },
          { name: "technology", label: "Technology", type: "text", placeholder: "Technological level", description: "Technological advancement and tools" },
          { name: "education", label: "Education", type: "text", placeholder: "Educational system", description: "How knowledge is shared and preserved" },
          { name: "military", label: "Military", type: "text", placeholder: "Military organization", description: "Military structure and defense" },
          { name: "religion", label: "Religion", type: "text", placeholder: "Religious practices", description: "Spiritual beliefs and practices" },
          { name: "arts", label: "Arts", type: "text", placeholder: "Artistic traditions", description: "Art, music, and cultural expressions" },
          { name: "history", label: "History", type: "textarea", placeholder: "Society's history...", description: "Historical development and major events" }
        ]
      }
    ]
  },

  // Faction
  faction: {
    title: "Faction Creator",
    description: "Create detailed factions for your world",
    icon: "Flag",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Flag",
        fields: [
          { name: "name", label: "Faction Name", type: "text", placeholder: "Enter faction name...", description: "The name of this faction" },
          { name: "factionType", label: "Faction Type", type: "select", options: ["Political", "Military", "Religious", "Criminal", "Mercantile", "Academic", "Secret", "Revolutionary", "Noble", "Other"], description: "What type of faction is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this faction...", description: "General description and overview" },
          { name: "goals", label: "Goals", type: "text", placeholder: "What are their goals?", description: "Primary objectives and ambitions" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "organization",
        label: "Organization & Power",
        icon: "Crown",
        fields: [
          { name: "ideology", label: "Ideology", type: "text", placeholder: "Core beliefs and ideology", description: "Fundamental beliefs and principles" },
          { name: "leadership", label: "Leadership", type: "autocomplete-character", placeholder: "Search or create faction leaders...", description: "Leadership structure and key figures" },
          { name: "members", label: "Members", type: "autocomplete-character", placeholder: "Search or create faction members...", description: "Types of members and recruitment" },
          { name: "resources", label: "Resources", type: "text", placeholder: "What resources do they have?", description: "Financial, material, and human resources" },
          { name: "territory", label: "Territory", type: "autocomplete-location", placeholder: "Search or create territories...", description: "Geographic areas under their influence" },
          { name: "influence", label: "Influence", type: "text", placeholder: "How influential are they?", description: "Level of power and influence" }
        ]
      },
      {
        id: "relations",
        label: "Relations & Operations",
        icon: "Users",
        fields: [
          { name: "allies", label: "Allies", type: "autocomplete-faction", placeholder: "Search or create allied factions...", description: "Allied factions and supporters" },
          { name: "enemies", label: "Enemies", type: "autocomplete-faction", placeholder: "Search or create enemy factions...", description: "Opposing factions and rivals" },
          { name: "methods", label: "Methods", type: "text", placeholder: "How do they operate?", description: "Tactics and methods of operation" },
          { name: "secrets", label: "Secrets", type: "text", placeholder: "Hidden secrets", description: "Secret information or hidden agendas" },
          { name: "history", label: "History", type: "textarea", placeholder: "Faction's history...", description: "Historical background and formation" }
        ]
      }
    ]
  },

  // Military Unit
  militaryUnit: {
    title: "Military Unit Creator",
    description: "Create detailed military units for your world",
    icon: "Shield",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Shield",
        fields: [
          { name: "name", label: "Unit Name", type: "text", placeholder: "Enter unit name...", description: "The name of this military unit" },
          { name: "unitType", label: "Unit Type", type: "select", options: ["Infantry", "Cavalry", "Navy", "Air Force", "Special Forces", "Artillery", "Engineers", "Guards", "Scouts", "Other"], description: "What type of military unit is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this unit...", description: "General description and overview" },
          { name: "size", label: "Size", type: "text", placeholder: "How many members?", description: "Number of soldiers or personnel" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "organization",
        label: "Organization & Equipment",
        icon: "Sword",
        fields: [
          { name: "composition", label: "Composition", type: "text", placeholder: "Unit structure", description: "How the unit is organized and structured" },
          { name: "equipment", label: "Equipment", type: "tags", placeholder: "Add equipment", description: "Weapons, armor, and equipment used" },
          { name: "training", label: "Training", type: "text", placeholder: "Training regimen", description: "Training methods and standards" },
          { name: "specializations", label: "Specializations", type: "tags", placeholder: "Add specializations", description: "Special skills and capabilities" },
          { name: "commander", label: "Commander", type: "autocomplete-character", placeholder: "Search or create commander...", description: "Leadership and command structure", multiple: false }
        ]
      },
      {
        id: "status",
        label: "Status & History",
        icon: "Award",
        fields: [
          { name: "morale", label: "Morale", type: "text", placeholder: "Current morale", description: "Fighting spirit and motivation" },
          { name: "reputation", label: "Reputation", type: "text", placeholder: "Unit's reputation", description: "How they are viewed by others" },
          { name: "battleRecord", label: "Battle Record", type: "text", placeholder: "Combat history", description: "Notable battles and achievements" },
          { name: "currentStatus", label: "Current Status", type: "text", placeholder: "Current deployment", description: "Current assignment and location" },
          { name: "history", label: "History", type: "textarea", placeholder: "Unit's history...", description: "Formation and historical background" }
        ]
      }
    ]
  },

  // Transportation
  transportation: {
    title: "Transportation Creator",
    description: "Create detailed transportation for your world",
    icon: "Car",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Car",
        fields: [
          { name: "name", label: "Transportation Name", type: "text", placeholder: "Enter transportation name...", description: "The name of this transportation method" },
          { name: "transportType", label: "Transport Type", type: "select", options: ["Land", "Sea", "Air", "Magical", "Underground", "Dimensional", "Hybrid", "Other"], description: "What type of transportation is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this transportation...", description: "Detailed description of the transportation" },
          { name: "capacity", label: "Capacity", type: "text", placeholder: "How many can it carry?", description: "Passenger or cargo capacity" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "performance",
        label: "Performance & Operation",
        icon: "Zap",
        fields: [
          { name: "speed", label: "Speed", type: "text", placeholder: "How fast is it?", description: "Maximum speed and typical travel speed" },
          { name: "range", label: "Range", type: "text", placeholder: "How far can it travel?", description: "Maximum distance or range" },
          { name: "requirements", label: "Requirements", type: "text", placeholder: "What does it need to operate?", description: "Fuel, energy, or other operational requirements" },
          { name: "operation", label: "Operation", type: "text", placeholder: "How is it operated?", description: "Operation methods and controls" }
        ]
      },
      {
        id: "economics",
        label: "Economics & Culture",
        icon: "Coins",
        fields: [
          { name: "construction", label: "Construction", type: "text", placeholder: "How is it built?", description: "Construction materials and methods" },
          { name: "cost", label: "Cost", type: "text", placeholder: "How expensive is it?", description: "Purchase, maintenance, and operation costs" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Unique"], description: "How rare is this transportation?" },
          { name: "advantages", label: "Advantages", type: "tags", placeholder: "Add advantages", description: "Benefits and advantages" },
          { name: "disadvantages", label: "Disadvantages", type: "tags", placeholder: "Add disadvantages", description: "Limitations and drawbacks" },
          { name: "culturalSignificance", label: "Cultural Significance", type: "text", placeholder: "Cultural importance", description: "Role in culture and society" }
        ]
      }
    ]
  },

  // Natural Law
  naturalLaw: {
    title: "Natural Law Creator",
    description: "Create detailed natural laws for your world",
    icon: "Atom",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Atom",
        fields: [
          { name: "name", label: "Law Name", type: "text", placeholder: "Enter natural law name...", description: "The name of this natural law" },
          { name: "lawType", label: "Law Type", type: "select", options: ["Physical", "Magical", "Divine", "Quantum", "Biological", "Chemical", "Mathematical", "Metaphysical", "Other"], description: "What type of natural law is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this law...", description: "Detailed description of the law" },
          { name: "scope", label: "Scope", type: "text", placeholder: "What does it affect?", description: "Range and scope of the law's influence" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Modern", "Historical", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "mechanics",
        label: "Mechanics & Principles",
        icon: "Cog",
        fields: [
          { name: "principles", label: "Principles", type: "textarea", placeholder: "Underlying principles...", description: "Core principles and mechanics" },
          { name: "exceptions", label: "Exceptions", type: "tags", placeholder: "Add exceptions", description: "Known exceptions to the law" },
          { name: "applications", label: "Applications", type: "tags", placeholder: "Add applications", description: "Practical applications and uses" },
          { name: "relatedLaws", label: "Related Laws", type: "tags", placeholder: "Add related laws", description: "Other laws that interact with this one" }
        ]
      },
      {
        id: "discovery",
        label: "Discovery & Understanding",
        icon: "Search",
        fields: [
          { name: "discovery", label: "Discovery", type: "text", placeholder: "How was it discovered?", description: "History of discovery or understanding" },
          { name: "understanding", label: "Understanding", type: "text", placeholder: "Current understanding level", description: "How well is it understood?" },
          { name: "evidence", label: "Evidence", type: "text", placeholder: "Supporting evidence", description: "Evidence that supports this law" },
          { name: "controversies", label: "Controversies", type: "text", placeholder: "Debates and controversies", description: "Scientific or philosophical controversies" },
          { name: "implications", label: "Implications", type: "text", placeholder: "What are the implications?", description: "Broader implications and consequences" }
        ]
      }
    ]
  },

  // Tradition
  tradition: {
    title: "Tradition Creator",
    description: "Create detailed traditions for your world",
    icon: "Calendar",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Calendar",
        fields: [
          { name: "name", label: "Tradition Name", type: "text", placeholder: "Enter tradition name...", description: "The name of this tradition" },
          { name: "traditionType", label: "Tradition Type", type: "select", options: ["Ceremony", "Festival", "Custom", "Ritual", "Holiday", "Practice", "Celebration", "Mourning", "Coming of Age", "Other"], description: "What type of tradition is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this tradition...", description: "Detailed description of the tradition" },
          { name: "origin", label: "Origin", type: "text", placeholder: "Where did it come from?", description: "Historical origin and founding" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "practice",
        label: "Practice & Participation",
        icon: "Users",
        fields: [
          { name: "purpose", label: "Purpose", type: "text", placeholder: "What is its purpose?", description: "Main purpose and meaning" },
          { name: "participants", label: "Participants", type: "text", placeholder: "Who participates?", description: "Who takes part in this tradition" },
          { name: "procedure", label: "Procedure", type: "textarea", placeholder: "How is it performed?", description: "Step-by-step procedure and activities" },
          { name: "timing", label: "Timing", type: "text", placeholder: "When does it occur?", description: "Timing and frequency of the tradition" },
          { name: "location", label: "Location", type: "text", placeholder: "Where does it take place?", description: "Typical locations for the tradition" }
        ]
      },
      {
        id: "meaning",
        label: "Meaning & Evolution",
        icon: "Heart",
        fields: [
          { name: "symbolism", label: "Symbolism", type: "text", placeholder: "Symbolic meanings", description: "Symbolic elements and their meanings" },
          { name: "significance", label: "Significance", type: "text", placeholder: "Cultural significance", description: "Importance to the community or culture" },
          { name: "modernPractice", label: "Modern Practice", type: "text", placeholder: "How is it practiced today?", description: "Current state and modern adaptations" },
          { name: "variations", label: "Variations", type: "tags", placeholder: "Add variations", description: "Regional or cultural variations" },
          { name: "relatedTraditions", label: "Related Traditions", type: "tags", placeholder: "Add related traditions", description: "Connected or similar traditions" }
        ]
      }
    ]
  },

  // Ritual
  ritual: {
    title: "Ritual Creator",
    description: "Create detailed rituals for your world",
    icon: "Flame",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Flame",
        fields: [
          { name: "name", label: "Ritual Name", type: "text", placeholder: "Enter ritual name...", description: "The name of this ritual" },
          { name: "ritualType", label: "Ritual Type", type: "select", options: ["Religious", "Magical", "Social", "Healing", "Protective", "Summoning", "Binding", "Cleansing", "Divination", "Other"], description: "What type of ritual is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this ritual...", description: "Detailed description of the ritual" },
          { name: "purpose", label: "Purpose", type: "text", placeholder: "What is its purpose?", description: "Main purpose and intended outcome" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "execution",
        label: "Execution & Requirements",
        icon: "Settings",
        fields: [
          { name: "participants", label: "Participants", type: "text", placeholder: "Who performs this ritual?", description: "Required participants and their roles" },
          { name: "requirements", label: "Requirements", type: "tags", placeholder: "Add requirements", description: "Materials, conditions, or preparations needed" },
          { name: "components", label: "Components", type: "tags", placeholder: "Add components", description: "Physical components and materials used" },
          { name: "steps", label: "Steps", type: "tags", placeholder: "Add ritual steps", description: "Sequential steps to perform the ritual" },
          { name: "duration", label: "Duration", type: "text", placeholder: "How long does it take?", description: "Time required to complete the ritual" }
        ]
      },
      {
        id: "effects",
        label: "Effects & Variations",
        icon: "Sparkles",
        fields: [
          { name: "location", label: "Location", type: "text", placeholder: "Where is it performed?", description: "Required or preferred locations" },
          { name: "timing", label: "Timing", type: "text", placeholder: "When should it be performed?", description: "Optimal timing or required conditions" },
          { name: "effects", label: "Effects", type: "text", placeholder: "What are the effects?", description: "Expected outcomes and effects" },
          { name: "risks", label: "Risks", type: "text", placeholder: "What are the dangers?", description: "Potential risks and negative consequences" },
          { name: "variations", label: "Variations", type: "tags", placeholder: "Add variations", description: "Different versions or adaptations" }
        ]
      }
    ]
  },

  // Setting
  setting: {
    title: "Setting Creator",
    description: "Create detailed settings for your world",
    icon: "Mountain",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Mountain",
        fields: [
          { name: "name", label: "Setting Name", type: "text", placeholder: "Enter setting name...", description: "The name of this setting" },
          { name: "location", label: "Location", type: "text", placeholder: "Where is it located?", description: "Geographic location and positioning" },
          { name: "timePeriod", label: "Time Period", type: "text", placeholder: "When does it exist?", description: "Historical time period or era" },
          { name: "settingType", label: "Setting Type", type: "select", options: ["Urban", "Rural", "Wilderness", "Underground", "Aerial", "Aquatic", "Dimensional", "Magical", "Technological", "Other"], description: "What type of setting is this?" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Horror", "Other"], description: "What genre is this setting for?" }
        ]
      },
      {
        id: "environment",
        label: "Environment & Atmosphere",
        icon: "Cloud",
        fields: [
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this setting...", description: "Detailed description of the setting" },
          { name: "atmosphere", label: "Atmosphere", type: "text", placeholder: "What's the atmosphere like?", description: "Mood and atmospheric qualities" },
          { name: "climate", label: "Climate", type: "text", placeholder: "Climate conditions", description: "Weather patterns and climate" },
          { name: "population", label: "Population", type: "text", placeholder: "Who lives here?", description: "Population size and demographics" }
        ]
      },
      {
        id: "features",
        label: "Features & Culture",
        icon: "Star",
        fields: [
          { name: "culturalElements", label: "Cultural Elements", type: "tags", placeholder: "Add cultural elements", description: "Cultural aspects and influences" },
          { name: "notableFeatures", label: "Notable Features", type: "tags", placeholder: "Add notable features", description: "Distinctive landmarks and features" }
        ]
      }
    ]
  },

  // Name
  name: {
    title: "Name Creator",
    description: "Create detailed names for your world",
    icon: "Type",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Type",
        fields: [
          { name: "name", label: "Name", type: "text", placeholder: "Enter the name...", description: "The actual name" },
          { name: "nameType", label: "Name Type", type: "select", options: ["Character", "Place", "Fantasy", "Historical", "Family", "Title", "Organization", "Item", "Other"], description: "What type of name is this?" },
          { name: "culture", label: "Culture", type: "text", placeholder: "Cultural origin", description: "Cultural or ethnic origin" },
          { name: "meaning", label: "Meaning", type: "text", placeholder: "What does it mean?", description: "Meaning and significance of the name" },
          { name: "origin", label: "Origin", type: "text", placeholder: "Etymology and origin", description: "Linguistic and historical origin" }
        ]
      }
    ]
  },

  // Conflict
  conflict: {
    title: "Conflict Creator",
    description: "Create detailed conflicts for your world",
    icon: "Swords",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Swords",
        fields: [
          { name: "title", label: "Conflict Title", type: "text", placeholder: "Enter conflict title...", description: "The name of this conflict" },
          { name: "type", label: "Conflict Type", type: "select", options: ["Internal", "External", "Interpersonal", "Social", "Political", "Moral", "Physical", "Emotional", "Spiritual", "Other"], description: "What type of conflict is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this conflict...", description: "Detailed description of the conflict" },
          { name: "stakes", label: "Stakes", type: "text", placeholder: "What's at stake?", description: "What will be won or lost" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Drama", "Action", "Romance", "Other"], description: "What genre is this conflict for?" }
        ]
      },
      {
        id: "resolution",
        label: "Resolution & Impact",
        icon: "Target",
        fields: [
          { name: "obstacles", label: "Obstacles", type: "tags", placeholder: "Add obstacles", description: "Challenges and barriers to resolution" },
          { name: "potentialResolutions", label: "Potential Resolutions", type: "tags", placeholder: "Add potential resolutions", description: "Possible ways to resolve the conflict" },
          { name: "emotionalImpact", label: "Emotional Impact", type: "text", placeholder: "Emotional consequences", description: "Emotional weight and impact on characters" }
        ]
      }
    ]
  },

  // Theme
  theme: {
    title: "Theme Creator",
    description: "Create detailed themes for your world",
    icon: "Lightbulb",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Lightbulb",
        fields: [
          { name: "title", label: "Theme Title", type: "text", placeholder: "Enter theme title...", description: "The name of this theme" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this theme...", description: "Detailed description of the theme" },
          { name: "coreMessage", label: "Core Message", type: "text", placeholder: "What's the main message?", description: "Central message or idea" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Drama", "Romance", "Mystery", "Other"], description: "What genre is this theme for?" }
        ]
      },
      {
        id: "elements",
        label: "Elements & Examples",
        icon: "Star",
        fields: [
          { name: "symbolicElements", label: "Symbolic Elements", type: "tags", placeholder: "Add symbols", description: "Symbols and metaphors that represent the theme" },
          { name: "questions", label: "Key Questions", type: "tags", placeholder: "Add questions", description: "Questions the theme explores" },
          { name: "conflicts", label: "Related Conflicts", type: "tags", placeholder: "Add conflicts", description: "Conflicts that explore this theme" },
          { name: "examples", label: "Examples", type: "tags", placeholder: "Add examples", description: "Examples of how the theme manifests" }
        ]
      }
    ]
  },

  // Mood
  mood: {
    title: "Mood Creator",
    description: "Create detailed moods for your world",
    icon: "Palette",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Palette",
        fields: [
          { name: "name", label: "Mood Name", type: "text", placeholder: "Enter mood name...", description: "The name of this mood" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this mood...", description: "Detailed description of the mood" },
          { name: "emotionalTone", label: "Emotional Tone", type: "text", placeholder: "Overall emotional feeling", description: "The primary emotional atmosphere" }
        ]
      },
      {
        id: "sensory",
        label: "Sensory Details",
        icon: "Eye",
        fields: [
          { name: "sensoryDetails", label: "Sensory Details", type: "tags", placeholder: "Add sensory details", description: "Details that engage the five senses" },
          { name: "colorAssociations", label: "Color Associations", type: "tags", placeholder: "Add colors", description: "Colors that evoke this mood" },
          { name: "lightingEffects", label: "Lighting Effects", type: "tags", placeholder: "Add lighting effects", description: "Lighting that creates this mood" },
          { name: "weatherElements", label: "Weather Elements", type: "tags", placeholder: "Add weather elements", description: "Weather conditions that enhance the mood" },
          { name: "soundscape", label: "Soundscape", type: "tags", placeholder: "Add sounds", description: "Sounds and audio that create this atmosphere" }
        ]
      }
    ]
  },

  // Plant
  plant: {
    title: "Plant Creator",
    description: "Create detailed plants for your world",
    icon: "Flower",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Flower",
        fields: [
          { name: "name", label: "Plant Name", type: "text", placeholder: "Enter plant name...", description: "The common name of this plant" },
          { name: "scientificName", label: "Scientific Name", type: "text", placeholder: "Scientific classification", description: "Scientific or botanical name" },
          { name: "type", label: "Plant Type", type: "select", options: ["Tree", "Shrub", "Herb", "Flower", "Grass", "Vine", "Moss", "Fern", "Mushroom", "Algae", "Other"], description: "What type of plant is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this plant...", description: "Detailed description of the plant" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Realistic", "Historical", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "growing",
        label: "Growing & Habitat",
        icon: "MapPin",
        fields: [
          { name: "habitat", label: "Habitat", type: "text", placeholder: "Where does it grow?", description: "Natural habitat and growing conditions" },
          { name: "careInstructions", label: "Care Instructions", type: "text", placeholder: "How to care for it", description: "Growing and care requirements" },
          { name: "bloomingSeason", label: "Blooming Season", type: "text", placeholder: "When does it bloom?", description: "Flowering or fruiting season" },
          { name: "hardinessZone", label: "Hardiness Zone", type: "text", placeholder: "Climate requirements", description: "Climate tolerance and hardiness" }
        ]
      },
      {
        id: "characteristics",
        label: "Characteristics",
        icon: "Leaf",
        fields: [
          { name: "characteristics", label: "Characteristics", type: "tags", placeholder: "Add characteristics", description: "Notable physical and biological traits" }
        ]
      }
    ]
  },

  // Description
  description: {
    title: "Description Creator",
    description: "Create detailed descriptions for your world",
    icon: "FileText",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "FileText",
        fields: [
          { name: "title", label: "Description Title", type: "text", placeholder: "Enter description title...", description: "Title for this description" },
          { name: "descriptionType", label: "Description Type", type: "select", options: ["Armour", "Weapon", "Clothing", "Location", "Character", "Item", "Creature", "Building", "Event", "Other"], description: "What is this description for?" },
          { name: "content", label: "Content", type: "textarea", placeholder: "Write the description...", description: "The detailed descriptive content" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Horror", "Other"], description: "What genre is this description for?" }
        ]
      }
    ]
  },

  // Myth
  myth: {
    title: "Myth Creator",
    description: "Create detailed myths for your world",
    icon: "Crown",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Crown",
        fields: [
          { name: "title", label: "Myth Title", type: "text", placeholder: "Enter myth title...", description: "The title of this myth" },
          { name: "mythType", label: "Myth Type", type: "select", options: ["Creation", "Hero", "Origin", "Cautionary", "Transformation", "Destruction", "Divine", "Ancestral", "Natural", "Other"], description: "What type of myth is this?" },
          { name: "summary", label: "Summary", type: "textarea", placeholder: "Brief summary of the myth...", description: "Short summary of the myth's main story" },
          { name: "culturalOrigin", label: "Cultural Origin", type: "text", placeholder: "Which culture does this come from?", description: "The culture or people this myth originates from" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Mythology", "Historical", "Sci-Fi", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "story",
        label: "Story & Characters",
        icon: "BookOpen",
        fields: [
          { name: "fullStory", label: "Full Story", type: "textarea", placeholder: "Tell the complete myth...", description: "The complete narrative of the myth" },
          { name: "characters", label: "Characters", type: "tags", placeholder: "Add mythical characters", description: "Key figures and characters in the myth" },
          { name: "themes", label: "Themes", type: "tags", placeholder: "Add themes", description: "Major themes and motifs" },
          { name: "symbolism", label: "Symbolism", type: "text", placeholder: "Symbolic meanings", description: "Symbolic elements and their meanings" }
        ]
      },
      {
        id: "impact",
        label: "Impact & Variations",
        icon: "Star",
        fields: [
          { name: "moralLesson", label: "Moral Lesson", type: "text", placeholder: "What lesson does it teach?", description: "The moral or lesson conveyed by the myth" },
          { name: "modernRelevance", label: "Modern Relevance", type: "text", placeholder: "Contemporary significance", description: "How this myth relates to modern times" },
          { name: "variations", label: "Variations", type: "tags", placeholder: "Add variations", description: "Different versions or regional variations" },
          { name: "relatedMyths", label: "Related Myths", type: "tags", placeholder: "Add related myths", description: "Connected or similar myths" }
        ]
      }
    ]
  },

  // Legend
  legend: {
    title: "Legend Creator",
    description: "Create detailed legends for your world",
    icon: "Shield",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Shield",
        fields: [
          { name: "title", label: "Legend Title", type: "text", placeholder: "Enter legend title...", description: "The title of this legend" },
          { name: "legendType", label: "Legend Type", type: "select", options: ["Historical", "Supernatural", "Heroic", "Tragic", "Romantic", "Adventure", "Mystery", "Folk", "Urban", "Other"], description: "What type of legend is this?" },
          { name: "summary", label: "Summary", type: "textarea", placeholder: "Brief summary of the legend...", description: "Short summary of the legend's main story" },
          { name: "location", label: "Location", type: "text", placeholder: "Where did this take place?", description: "Geographic setting of the legend" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Historical", "Supernatural", "Adventure", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "story",
        label: "Story & Characters",
        icon: "Users",
        fields: [
          { name: "fullStory", label: "Full Story", type: "textarea", placeholder: "Tell the complete legend...", description: "The complete narrative of the legend" },
          { name: "mainCharacters", label: "Main Characters", type: "tags", placeholder: "Add main characters", description: "Key figures in the legend" },
          { name: "timeframe", label: "Timeframe", type: "text", placeholder: "When did this occur?", description: "Historical period or time when events occurred" },
          { name: "historicalBasis", label: "Historical Basis", type: "text", placeholder: "What historical truth exists?", description: "Real historical events or figures that inspired the legend" }
        ]
      },
      {
        id: "truth",
        label: "Truth & Impact",
        icon: "Search",
        fields: [
          { name: "truthElements", label: "Truth Elements", type: "text", placeholder: "What parts are likely true?", description: "Elements that may be historically accurate" },
          { name: "exaggerations", label: "Exaggerations", type: "text", placeholder: "What parts are embellished?", description: "Aspects that have been embellished over time" },
          { name: "culturalImpact", label: "Cultural Impact", type: "text", placeholder: "How has it influenced culture?", description: "Impact on culture and society" },
          { name: "modernAdaptations", label: "Modern Adaptations", type: "tags", placeholder: "Add modern adaptations", description: "Contemporary retellings and adaptations" }
        ]
      }
    ]
  },

  // Event
  event: {
    title: "Event Creator",
    description: "Create detailed events for your world",
    icon: "Calendar",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Calendar",
        fields: [
          { name: "name", label: "Event Name", type: "text", placeholder: "Enter event name...", description: "The name of this event" },
          { name: "eventType", label: "Event Type", type: "select", options: ["Battle", "Festival", "Disaster", "Discovery", "Political", "Religious", "Cultural", "Economic", "Scientific", "Other"], description: "What type of event is this?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this event...", description: "Detailed description of what happened" },
          { name: "date", label: "Date", type: "text", placeholder: "When did it occur?", description: "Date or time period when the event occurred" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "details",
        label: "Details & Participants",
        icon: "Users",
        fields: [
          { name: "location", label: "Location", type: "autocomplete-location", placeholder: "Where did it happen?", description: "Geographic location where the event took place" },
          { name: "participants", label: "Participants", type: "autocomplete-character", placeholder: "Add participants", description: "Key individuals, groups, or organizations involved" },
          { name: "duration", label: "Duration", type: "text", placeholder: "How long did it last?", description: "Length of time the event lasted" },
          { name: "scale", label: "Scale", type: "text", placeholder: "How big was the impact?", description: "Scale and scope of the event's impact" }
        ]
      },
      {
        id: "impact",
        label: "Causes & Consequences",
        icon: "Target",
        fields: [
          { name: "causes", label: "Causes", type: "text", placeholder: "What caused this event?", description: "Underlying causes and triggers" },
          { name: "consequences", label: "Consequences", type: "text", placeholder: "What were the results?", description: "Immediate and long-term consequences" },
          { name: "significance", label: "Significance", type: "text", placeholder: "Why is it important?", description: "Historical or cultural significance" },
          { name: "legacy", label: "Legacy", type: "text", placeholder: "What legacy did it leave?", description: "Lasting impact and legacy" },
          { name: "documentation", label: "Documentation", type: "text", placeholder: "How was it recorded?", description: "How the event was documented or remembered" },
          { name: "conflictingAccounts", label: "Conflicting Accounts", type: "text", placeholder: "Are there different versions?", description: "Different perspectives or conflicting historical accounts" }
        ]
      }
    ]
  },

  // New Content Types
  familyTree: {
    title: "Family Tree Creator",
    description: "Map family lineages and relationships",
    icon: "Users",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Users",
        fields: [
          { name: "name", label: "Family Tree Name", type: "text", placeholder: "Enter family tree name...", description: "The name of this family lineage" },
          { name: "treeType", label: "Tree Type", type: "select", options: ["Lineage", "Ancestral", "Descendant", "Genealogical", "Royal", "Noble", "Other"], description: "What type of family tree is this?" },
          { name: "rootPerson", label: "Root Person", type: "autocomplete-character", placeholder: "Search or create root family member...", description: "The central person of this family tree", multiple: false },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this family tree...", description: "General description and overview" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "members",
        label: "Family Members",
        icon: "User",
        fields: [
          { name: "keyMembers", label: "Key Family Members", type: "autocomplete-character", placeholder: "Search or create family members...", description: "Important members of this family", multiple: true },
          { name: "generations", label: "Generations", type: "number", placeholder: "Number of generations", description: "How many generations does this tree span?" },
          { name: "livingMembers", label: "Living Members", type: "text", placeholder: "Number of living members", description: "How many family members are still alive?" },
          { name: "notableAncestors", label: "Notable Ancestors", type: "autocomplete-character", placeholder: "Search or create notable ancestors...", description: "Important historical family members", multiple: true }
        ]
      },
      {
        id: "heritage",
        label: "Heritage & Legacy",
        icon: "Crown",
        fields: [
          { name: "ancestralHome", label: "Ancestral Home", type: "autocomplete-location", placeholder: "Search or create ancestral location...", description: "The family's place of origin", multiple: false },
          { name: "familyTraditions", label: "Family Traditions", type: "autocomplete-tradition", placeholder: "Search or create family traditions...", description: "Important family customs and practices" },
          { name: "inheritance", label: "Inheritance", type: "textarea", placeholder: "Family inheritance and heirlooms...", description: "What passes down through generations" },
          { name: "familySecrets", label: "Family Secrets", type: "textarea", placeholder: "Hidden family secrets...", description: "Dark secrets or hidden information" }
        ]
      }
    ]
  },

  timeline: {
    title: "Timeline Creator",
    description: "Create chronological sequences of events",
    icon: "Clock",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Clock",
        fields: [
          { name: "name", label: "Timeline Name", type: "text", placeholder: "Enter timeline name...", description: "The name of this timeline" },
          { name: "timelineType", label: "Timeline Type", type: "select", options: ["Historical", "Personal", "Fictional", "Political", "Cultural", "Military", "Scientific", "Other"], description: "What type of timeline is this?" },
          { name: "scope", label: "Scope", type: "text", placeholder: "Geographic or thematic scope", description: "What area or theme does this timeline cover?" },
          { name: "timeScale", label: "Time Scale", type: "select", options: ["Years", "Decades", "Centuries", "Millennia", "Days", "Months", "Ages", "Other"], description: "What time scale does this timeline use?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this timeline...", description: "General description and overview" }
        ]
      },
      {
        id: "events",
        label: "Key Events",
        icon: "Target",
        fields: [
          { name: "majorEvents", label: "Major Events", type: "tags", placeholder: "Add major events", description: "Key events in this timeline" },
          { name: "startDate", label: "Start Date", type: "text", placeholder: "When does this timeline begin?", description: "The beginning point of this timeline" },
          { name: "endDate", label: "End Date", type: "text", placeholder: "When does this timeline end?", description: "The ending point of this timeline (if applicable)" },
          { name: "turningPoints", label: "Turning Points", type: "textarea", placeholder: "Describe major turning points...", description: "Critical moments that changed everything" }
        ]
      },
      {
        id: "context",
        label: "Historical Context",
        icon: "Book",
        fields: [
          { name: "keyFigures", label: "Key Figures", type: "autocomplete-character", placeholder: "Search or create important people...", description: "Important people in this timeline" },
          { name: "locations", label: "Important Locations", type: "autocomplete-location", placeholder: "Search or create key locations...", description: "Significant places in this timeline" },
          { name: "culturalImpact", label: "Cultural Impact", type: "textarea", placeholder: "Cultural significance and impact...", description: "How this timeline affected culture and society" },
          { name: "technologicalAdvances", label: "Technological Advances", type: "tags", placeholder: "Add technological developments", description: "Technology that emerged during this period" }
        ]
      }
    ]
  },

  map: {
    title: "Map Creator",
    description: "Create detailed geographical maps",
    icon: "Map",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Map",
        fields: [
          { name: "name", label: "Map Name", type: "text", placeholder: "Enter map name...", description: "The name of this map" },
          { name: "mapType", label: "Map Type", type: "select", options: ["Political", "Topographical", "City", "Regional", "World", "Dungeon", "Battle", "Trade Routes", "Other"], description: "What type of map is this?" },
          { name: "scale", label: "Scale", type: "text", placeholder: "Map scale (e.g., 1:100,000)", description: "The scale or zoom level of this map" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this map...", description: "General description and overview" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "geography",
        label: "Geography",
        icon: "Mountain",
        fields: [
          { name: "terrain", label: "Major Terrain", type: "tags", placeholder: "Add terrain types", description: "Mountains, forests, deserts, etc." },
          { name: "climate", label: "Climate", type: "text", placeholder: "Overall climate", description: "Weather patterns and climate zones" },
          { name: "naturalFeatures", label: "Natural Features", type: "textarea", placeholder: "Rivers, lakes, mountains...", description: "Important natural landmarks" },
          { name: "resources", label: "Natural Resources", type: "autocomplete-material", placeholder: "Search or create resources...", description: "Valuable resources found in this area" }
        ]
      },
      {
        id: "locations",
        label: "Key Locations",
        icon: "MapPin",
        fields: [
          { name: "settlements", label: "Settlements", type: "autocomplete-settlement", placeholder: "Search or create settlements...", description: "Cities, towns, and villages on this map" },
          { name: "landmarks", label: "Landmarks", type: "autocomplete-location", placeholder: "Search or create landmarks...", description: "Important places and points of interest" },
          { name: "borders", label: "Political Borders", type: "textarea", placeholder: "Describe political boundaries...", description: "Kingdoms, territories, and political divisions" },
          { name: "travelRoutes", label: "Travel Routes", type: "textarea", placeholder: "Roads, paths, shipping lanes...", description: "Major routes for travel and trade" }
        ]
      }
    ]
  },

  ceremony: {
    title: "Ceremony Creator",
    description: "Design important cultural ceremonies",
    icon: "Crown",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Crown",
        fields: [
          { name: "name", label: "Ceremony Name", type: "text", placeholder: "Enter ceremony name...", description: "The name of this ceremony" },
          { name: "ceremonyType", label: "Ceremony Type", type: "select", options: ["Religious", "Royal", "Cultural", "Coming of Age", "Wedding", "Funeral", "Seasonal", "Military", "Other"], description: "What type of ceremony is this?" },
          { name: "purpose", label: "Purpose", type: "text", placeholder: "Why is this ceremony performed?", description: "The main purpose or reason for this ceremony" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this ceremony...", description: "General description and overview" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "ritual",
        label: "Ritual & Process",
        icon: "Sparkles",
        fields: [
          { name: "steps", label: "Ceremony Steps", type: "textarea", placeholder: "Describe the ceremonial process...", description: "The sequence of events and actions" },
          { name: "duration", label: "Duration", type: "text", placeholder: "How long does it last?", description: "Length of time the ceremony takes" },
          { name: "participants", label: "Participants", type: "autocomplete-character", placeholder: "Search or create participants...", description: "Who participates in this ceremony?" },
          { name: "officiant", label: "Officiant", type: "text", placeholder: "Who leads the ceremony?", description: "The person who conducts or oversees the ceremony" }
        ]
      },
      {
        id: "cultural",
        label: "Cultural Context",
        icon: "Globe",
        fields: [
          { name: "culture", label: "Associated Culture", type: "autocomplete-culture", placeholder: "Search or create culture...", description: "The culture that practices this ceremony", multiple: false },
          { name: "location", label: "Ceremony Location", type: "autocomplete-location", placeholder: "Search or create location...", description: "Where is this ceremony typically held?", multiple: false },
          { name: "requiredItems", label: "Required Items", type: "tags", placeholder: "Add ceremonial items", description: "Special objects needed for the ceremony" },
          { name: "symbolism", label: "Symbolism", type: "textarea", placeholder: "What does this ceremony symbolize?", description: "Deeper meaning and symbolic significance" },
          { name: "traditions", label: "Related Traditions", type: "autocomplete-tradition", placeholder: "Search or create traditions...", description: "Connected cultural traditions" }
        ]
      }
    ]
  },

  music: {
    title: "Music Creator",
    description: "Create songs and musical compositions",
    icon: "Music",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Music",
        fields: [
          { name: "name", label: "Song/Composition Name", type: "text", placeholder: "Enter music name...", description: "The title of this musical piece" },
          { name: "musicType", label: "Music Type", type: "select", options: ["Song", "Instrumental", "Hymn", "Anthem", "Folk Song", "Battle Song", "Lullaby", "Opera", "Other"], description: "What type of music is this?" },
          { name: "composer", label: "Composer", type: "autocomplete-character", placeholder: "Search or create composer...", description: "Who composed this music?", multiple: false },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this music...", description: "General description and overview" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "composition",
        label: "Composition",
        icon: "FileText",
        fields: [
          { name: "lyrics", label: "Lyrics", type: "textarea", placeholder: "Enter song lyrics...", description: "The words of the song (if applicable)" },
          { name: "melody", label: "Melody Description", type: "text", placeholder: "Describe the melody...", description: "How the music sounds" },
          { name: "instruments", label: "Instruments", type: "tags", placeholder: "Add instruments", description: "Musical instruments used" },
          { name: "key", label: "Musical Key", type: "text", placeholder: "E.g., C Major, A Minor", description: "The musical key or mode" },
          { name: "tempo", label: "Tempo", type: "text", placeholder: "Fast, slow, moderate...", description: "The speed and rhythm of the music" }
        ]
      },
      {
        id: "cultural",
        label: "Cultural Context",
        icon: "Globe",
        fields: [
          { name: "culture", label: "Associated Culture", type: "autocomplete-culture", placeholder: "Search or create culture...", description: "The culture this music comes from", multiple: false },
          { name: "purpose", label: "Purpose", type: "text", placeholder: "Why is this music performed?", description: "Ceremonial, entertainment, religious, etc." },
          { name: "occasions", label: "Occasions", type: "textarea", placeholder: "When is this music played?", description: "Specific events or occasions" },
          { name: "meaning", label: "Meaning", type: "textarea", placeholder: "What does this music mean?", description: "Cultural or personal significance" },
          { name: "variations", label: "Regional Variations", type: "textarea", placeholder: "Different versions...", description: "How the music varies by region or performer" }
        ]
      }
    ]
  },

  dance: {
    title: "Dance Creator",
    description: "Design choreographed performances",
    icon: "PersonStanding",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "PersonStanding",
        fields: [
          { name: "name", label: "Dance Name", type: "text", placeholder: "Enter dance name...", description: "The name of this dance" },
          { name: "danceType", label: "Dance Type", type: "select", options: ["Ceremonial", "Social", "Courtly", "Folk", "Martial", "Religious", "Performance", "Ritual", "Other"], description: "What type of dance is this?" },
          { name: "choreographer", label: "Choreographer", type: "autocomplete-character", placeholder: "Search or create choreographer...", description: "Who created this dance?", multiple: false },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this dance...", description: "General description and overview" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "choreography",
        label: "Choreography",
        icon: "Target",
        fields: [
          { name: "movements", label: "Key Movements", type: "textarea", placeholder: "Describe the main dance movements...", description: "Primary steps and gestures" },
          { name: "formation", label: "Formation", type: "text", placeholder: "Solo, pair, group, circle...", description: "How many dancers and their arrangement" },
          { name: "duration", label: "Duration", type: "text", placeholder: "How long does it last?", description: "Length of the dance performance" },
          { name: "difficulty", label: "Difficulty", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Master"], description: "How difficult is this dance to learn?" },
          { name: "accompaniment", label: "Musical Accompaniment", type: "autocomplete-music", placeholder: "Search or create music...", description: "Music that accompanies this dance", multiple: false }
        ]
      },
      {
        id: "cultural",
        label: "Cultural Context",
        icon: "Globe",
        fields: [
          { name: "culture", label: "Associated Culture", type: "autocomplete-culture", placeholder: "Search or create culture...", description: "The culture that practices this dance", multiple: false },
          { name: "occasions", label: "Occasions", type: "textarea", placeholder: "When is this dance performed?", description: "Specific events, festivals, or ceremonies" },
          { name: "costume", label: "Traditional Costume", type: "autocomplete-clothing", placeholder: "Search or create dance costume...", description: "Special clothing worn for this dance" },
          { name: "symbolism", label: "Symbolism", type: "textarea", placeholder: "What does this dance represent?", description: "Cultural meaning and symbolism" },
          { name: "restrictions", label: "Social Restrictions", type: "text", placeholder: "Who can perform this dance?", description: "Any social or cultural restrictions" }
        ]
      }
    ]
  },

  law: {
    title: "Law Creator", 
    description: "Create legal codes and regulations",
    icon: "Scale",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "Scale",
        fields: [
          { name: "name", label: "Law Name", type: "text", placeholder: "Enter law name...", description: "The official title of this law" },
          { name: "lawType", label: "Law Type", type: "select", options: ["Criminal", "Civil", "Commercial", "Constitutional", "Religious", "Military", "Property", "Family", "Tax", "Other"], description: "What type of law is this?" },
          { name: "jurisdiction", label: "Jurisdiction", type: "autocomplete-location", placeholder: "Search or create location...", description: "Where does this law apply?", multiple: false },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this law...", description: "General description and overview" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "details",
        label: "Legal Details",
        icon: "FileText",
        fields: [
          { name: "text", label: "Law Text", type: "textarea", placeholder: "The actual text of the law...", description: "The formal wording of the law" },
          { name: "penalties", label: "Penalties", type: "textarea", placeholder: "Punishments for breaking this law...", description: "Consequences for violations" },
          { name: "enforcement", label: "Enforcement", type: "text", placeholder: "Who enforces this law?", description: "The authority responsible for enforcement" },
          { name: "exceptions", label: "Exceptions", type: "textarea", placeholder: "Any exceptions to this law...", description: "Special circumstances where the law doesn't apply" }
        ]
      },
      {
        id: "context",
        label: "Historical Context",
        icon: "Book",
        fields: [
          { name: "creator", label: "Creator/Author", type: "autocomplete-character", placeholder: "Search or create lawmaker...", description: "Who created or sponsored this law?", multiple: false },
          { name: "dateEnacted", label: "Date Enacted", type: "text", placeholder: "When was this law created?", description: "When this law was officially established" },
          { name: "precedent", label: "Legal Precedent", type: "textarea", placeholder: "What legal precedent does this set?", description: "How this law affects future legal decisions" },
          { name: "relatedLaws", label: "Related Laws", type: "tags", placeholder: "Add related laws", description: "Other laws that interact with this one" },
          { name: "controversy", label: "Controversy", type: "textarea", placeholder: "Any controversy around this law?", description: "Public opinion and debates" }
        ]
      }
    ]
  },

  policy: {
    title: "Policy Creator",
    description: "Design governance and administrative policies",
    icon: "FileText",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "FileText",
        fields: [
          { name: "name", label: "Policy Name", type: "text", placeholder: "Enter policy name...", description: "The official title of this policy" },
          { name: "policyType", label: "Policy Type", type: "select", options: ["Economic", "Social", "Foreign", "Military", "Environmental", "Educational", "Healthcare", "Administrative", "Other"], description: "What type of policy is this?" },
          { name: "organization", label: "Governing Organization", type: "autocomplete-organization", placeholder: "Search or create organization...", description: "The organization that implements this policy", multiple: false },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this policy...", description: "General description and overview" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "implementation",
        label: "Implementation",
        icon: "Target",
        fields: [
          { name: "objectives", label: "Objectives", type: "textarea", placeholder: "What does this policy aim to achieve?", description: "The main goals and objectives" },
          { name: "guidelines", label: "Guidelines", type: "textarea", placeholder: "How should this policy be implemented?", description: "Specific implementation guidelines" },
          { name: "scope", label: "Scope", type: "text", placeholder: "Who does this policy affect?", description: "The range of people or areas affected" },
          { name: "budget", label: "Budget", type: "text", placeholder: "Cost and funding", description: "Financial resources allocated" }
        ]
      },
      {
        id: "governance",
        label: "Governance & Impact",
        icon: "Crown",
        fields: [
          { name: "authority", label: "Authority", type: "autocomplete-character", placeholder: "Search or create responsible official...", description: "Who has authority over this policy?", multiple: false },
          { name: "dateImplemented", label: "Date Implemented", type: "text", placeholder: "When was this policy implemented?", description: "When this policy went into effect" },
          { name: "review", label: "Review Process", type: "text", placeholder: "How is this policy reviewed?", description: "Regular review and update procedures" },
          { name: "publicOpinion", label: "Public Opinion", type: "textarea", placeholder: "How do people view this policy?", description: "Public reception and criticism" },
          { name: "effectiveness", label: "Effectiveness", type: "text", placeholder: "How effective is this policy?", description: "Measured success and outcomes" }
        ]
      }
    ]
  },

  potion: {
    title: "Potion Creator",
    description: "Create magical brews and elixirs",
    icon: "FlaskConical",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: "FlaskConical",
        fields: [
          { name: "name", label: "Potion Name", type: "text", placeholder: "Enter potion name...", description: "The name of this magical brew" },
          { name: "potionType", label: "Potion Type", type: "select", options: ["Healing", "Enhancement", "Transformation", "Poison", "Utility", "Combat", "Magical", "Alchemical", "Other"], description: "What type of potion is this?" },
          { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"], description: "How rare is this potion?" },
          { name: "description", label: "Description", type: "textarea", placeholder: "Describe this potion...", description: "General description and overview" },
          { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Historical", "Modern", "Other"], description: "What genre setting is this for?" }
        ]
      },
      {
        id: "properties",
        label: "Properties & Effects",
        icon: "Zap",
        fields: [
          { name: "effect", label: "Primary Effect", type: "textarea", placeholder: "What does this potion do?", description: "The main magical or chemical effect" },
          { name: "duration", label: "Duration", type: "text", placeholder: "How long do effects last?", description: "Duration of the potion's effects" },
          { name: "onset", label: "Onset Time", type: "text", placeholder: "How quickly does it work?", description: "Time before effects begin" },
          { name: "sideEffects", label: "Side Effects", type: "textarea", placeholder: "Any negative side effects?", description: "Unwanted or dangerous effects" },
          { name: "appearance", label: "Appearance", type: "text", placeholder: "Color, texture, smell...", description: "What does the potion look like?" }
        ]
      },
      {
        id: "creation",
        label: "Creation & Usage",
        icon: "Sparkles",
        fields: [
          { name: "ingredients", label: "Ingredients", type: "autocomplete-material", placeholder: "Search or create ingredients...", description: "Materials needed to create this potion" },
          { name: "recipe", label: "Recipe", type: "textarea", placeholder: "How is this potion made?", description: "Step-by-step brewing instructions" },
          { name: "difficulty", label: "Brewing Difficulty", type: "select", options: ["Trivial", "Easy", "Moderate", "Hard", "Extreme", "Legendary"], description: "How difficult is this to brew?" },
          { name: "creator", label: "Original Creator", type: "autocomplete-character", placeholder: "Search or create alchemist...", description: "Who first created this potion?", multiple: false },
          { name: "cost", label: "Market Value", type: "text", placeholder: "How much does it cost?", description: "Typical price or trade value" },
          { name: "dosage", label: "Dosage", type: "text", placeholder: "How much to consume?", description: "Recommended amount for desired effect" }
        ]
      }
    ]
  }

  // 🎉 ALL 51 CONTENT TYPES NOW HAVE COMPREHENSIVE FORM CONFIGURATIONS! 🎉
};