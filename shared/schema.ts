import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and user data
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated characters
export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  age: integer("age"),
  occupation: text("occupation"),
  personality: text("personality").array(),
  backstory: text("backstory"),
  motivation: text("motivation"),
  flaw: text("flaw"),
  strength: text("strength"),
  gender: text("gender"),
  genre: text("genre"),
  // Basic physical description fields (existing)
  height: text("height"),
  build: text("build"),
  hairColor: text("hair_color"),
  eyeColor: text("eye_color"),
  skinTone: text("skin_tone"),
  facialFeatures: text("facial_features"),
  identifyingMarks: text("identifying_marks"),
  physicalDescription: text("physical_description"),
  // Extended identity and physical attributes
  sex: text("sex"),
  genderIdentity: text("gender_identity"),
  physicalPresentation: text("physical_presentation"),
  hairTexture: text("hair_texture"),
  hairStyle: text("hair_style"),
  heightDetail: text("height_detail"),
  weight: text("weight"),
  species: text("species"),
  ethnicity: text("ethnicity"),
  pronouns: text("pronouns"),
  // Personal information
  currentLocation: text("current_location"),
  conditions: text("conditions"),
  family: text("family").array(),
  currentResidence: text("current_residence"),
  religiousBelief: text("religious_belief"),
  affiliatedOrganizations: text("affiliated_organizations"),
  // Names and titles
  givenName: text("given_name"),
  familyName: text("family_name"),
  middleName: text("middle_name"),
  maidenName: text("maiden_name"),
  nickname: text("nickname"),
  honorificTitle: text("honorific_title"),
  suffix: text("suffix"),
  prefix: text("prefix"),
  // Vital statistics
  dateOfBirth: text("date_of_birth"),
  placeOfBirth: text("place_of_birth"),
  dateOfDeath: text("date_of_death"),
  placeOfDeath: text("place_of_death"),
  // Character development prompt responses
  upbringing: text("upbringing"),
  genderUnderstanding: text("gender_understanding"),
  sexualOrientation: text("sexual_orientation"),
  education: text("education"),
  profession: text("profession"),
  workHistory: text("work_history"),
  accomplishments: text("accomplishments"),
  negativeEvents: text("negative_events"),
  mentalHealth: text("mental_health"),
  intellectualTraits: text("intellectual_traits"),
  valuesEthicsMorals: text("values_ethics_morals"),
  frownedUponViews: text("frowned_upon_views"),
  languages: text("languages").array(),
  languageFluencyAccent: text("language_fluency_accent"),
  physicalCondition: text("physical_condition"),
  distinctiveBodyFeatures: text("distinctive_body_features"),
  facialDetails: text("facial_details"),
  strikingFeatures: text("striking_features"),
  marksPiercingsTattoos: text("marks_piercings_tattoos"),
  distinctPhysicalFeatures: text("distinct_physical_features"),
  // Supernatural and special abilities
  supernaturalPowers: text("supernatural_powers"),
  specialAbilities: text("special_abilities"),
  mutations: text("mutations"),
  // Attire, equipment and possessions
  typicalAttire: text("typical_attire"),
  accessories: text("accessories"),
  keyEquipment: text("key_equipment"),
  specializedItems: text("specialized_items"),
  // Skills and abilities
  mainSkills: text("main_skills"),
  strengths: text("strengths"),
  positiveAspects: text("positive_aspects"),
  proficiencies: text("proficiencies"),
  lackingSkills: text("lacking_skills"),
  lackingKnowledge: text("lacking_knowledge"),
  // Character flaws and vices
  characterFlaws: text("character_flaws"),
  addictions: text("addictions"),
  vices: text("vices"),
  defects: text("defects"),
  secretBeliefs: text("secret_beliefs"),
  // Preferences and personality
  likes: text("likes"),
  dislikes: text("dislikes"),
  // Legacy and influence (if deceased)
  worldInfluence: text("world_influence"),
  legacy: text("legacy"),
  rememberedBy: text("remembered_by").array(),
  // Behavioral traits
  behavioralTraits: text("behavioral_traits"),
  particularities: text("particularities"),
  hygieneValue: text("hygiene_value"),
  // Quotes and catchphrases
  famousQuotes: text("famous_quotes"),
  catchphrases: text("catchphrases"),
  // Leadership and domain
  overseeingDomain: text("overseeing_domain"),
  leadershipGroup: text("leadership_group"),
  positionDuration: text("position_duration"),
  // Relationships
  keyRelationships: text("key_relationships"),
  allies: text("allies"),
  enemies: text("enemies"),
  familialTies: text("familial_ties"),
  // Religious and spiritual
  religiousViews: text("religious_views"),
  spiritualPractices: text("spiritual_practices"),
  // Personality characteristics
  charisma: text("charisma"),
  confidence: text("confidence"),
  ego: text("ego"),
  extroversion: text("extroversion"),
  etiquette: text("etiquette"),
  mannerisms: text("mannerisms"),
  // Behavioral patterns
  habitualGestures: text("habitual_gestures"),
  speakingStyle: text("speaking_style"),
  behavingStyle: text("behaving_style"),
  // Hobbies and interests
  hobbies: text("hobbies"),
  interests: text("interests"),
  activities: text("activities"),
  pets: text("pets"),
  // Speech characteristics
  speechParticularities: text("speech_particularities"),
  toneOfVoice: text("tone_of_voice"),
  voicePitch: text("voice_pitch"),
  accent: text("accent"),
  dialect: text("dialect"),
  speechImpediments: text("speech_impediments"),
  commonPhrases: text("common_phrases"),
  compliments: text("compliments"),
  insults: text("insults"),
  greetings: text("greetings"),
  farewells: text("farewells"),
  swearing: text("swearing"),
  metaphors: text("metaphors"),
  // Wealth and class
  wealthClass: text("wealth_class"),
  dependencies: text("dependencies"),
  debts: text("debts"),
  funds: text("funds"),
  disposableIncome: text("disposable_income"),
  assets: text("assets"),
  investments: text("investments"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated plots
export const plots = pgTable("plots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  setup: text("setup").notNull(),
  incitingIncident: text("inciting_incident").notNull(),
  firstPlotPoint: text("first_plot_point").notNull(),
  midpoint: text("midpoint").notNull(),
  secondPlotPoint: text("second_plot_point").notNull(),
  climax: text("climax").notNull(),
  resolution: text("resolution").notNull(),
  theme: text("theme").notNull(),
  conflict: text("conflict").notNull(),
  genre: text("genre"),
  storyStructure: text("story_structure"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Writing prompts
export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  genre: text("genre").notNull(),
  difficulty: text("difficulty").notNull(),
  type: text("type").notNull(),
  wordCount: text("word_count").notNull(),
  tags: text("tags").array().notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Writing guides
export const guides = pgTable("guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  readTime: integer("read_time").notNull(),
  difficulty: text("difficulty").notNull(),
  rating: real("rating").default(0),
  author: text("author").notNull(),
  tags: text("tags").array().notNull(),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generated settings
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  timePeriod: text("time_period").notNull(),
  population: text("population").notNull(),
  climate: text("climate").notNull(),
  description: text("description").notNull(),
  atmosphere: text("atmosphere").notNull(),
  culturalElements: text("cultural_elements").array().notNull(),
  notableFeatures: text("notable_features").array().notNull(),
  genre: text("genre"),
  settingType: text("setting_type"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated names
export const names = pgTable("names", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  meaning: text("meaning"),
  origin: text("origin"),
  nameType: text("name_type").notNull(), // 'character', 'place', 'fantasy', etc.
  culture: text("culture").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated conflicts
export const conflicts = pgTable("conflicts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'internal', 'external', 'interpersonal', etc.
  description: text("description").notNull(),
  stakes: text("stakes").notNull(),
  obstacles: text("obstacles").array().notNull(),
  potentialResolutions: text("potential_resolutions").array().notNull(),
  emotionalImpact: text("emotional_impact").notNull(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated themes
export const themes = pgTable("themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coreMessage: text("core_message").notNull(),
  symbolicElements: text("symbolic_elements").array().notNull(),
  questions: text("questions").array().notNull(),
  conflicts: text("conflicts").array().notNull(),
  examples: text("examples").array().notNull(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated moods
export const moods = pgTable("moods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  emotionalTone: text("emotional_tone").notNull(),
  sensoryDetails: text("sensory_details").array().notNull(),
  colorAssociations: text("color_associations").array().notNull(),
  weatherElements: text("weather_elements").array().notNull(),
  lightingEffects: text("lighting_effects").array().notNull(),
  soundscape: text("soundscape").array().notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated creatures
export const creatures = pgTable("creatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  creatureType: text("creature_type").notNull(),
  habitat: text("habitat").notNull(),
  physicalDescription: text("physical_description").notNull(),
  abilities: text("abilities").array().notNull(),
  behavior: text("behavior").notNull(),
  culturalSignificance: text("cultural_significance").notNull(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated plants
export const plants = pgTable("plants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  scientificName: text("scientific_name").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  characteristics: text("characteristics").array().notNull(),
  habitat: text("habitat").notNull(),
  careInstructions: text("care_instructions").notNull(),
  bloomingSeason: text("blooming_season").notNull(),
  hardinessZone: text("hardiness_zone").notNull(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated descriptions
export const descriptions = pgTable("descriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  descriptionType: text("description_type").notNull(), // 'armour', 'weapon', 'clothing', etc.
  genre: text("genre"),
  tags: text("tags").array().notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Locations
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  locationType: text("location_type").notNull(), // city, forest, dungeon, etc.
  description: text("description").notNull(),
  geography: text("geography"),
  climate: text("climate"),
  population: text("population"),
  government: text("government"),
  economy: text("economy"),
  culture: text("culture"),
  history: text("history"),
  notableFeatures: text("notable_features").array(),
  landmarks: text("landmarks").array(),
  threats: text("threats").array(),
  resources: text("resources").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Items
export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  itemType: text("item_type").notNull(), // weapon, armor, tool, magic, etc.
  description: text("description").notNull(),
  rarity: text("rarity"),
  value: text("value"),
  weight: text("weight"),
  properties: text("properties").array(),
  materials: text("materials").array(),
  history: text("history"),
  abilities: text("abilities").array(),
  requirements: text("requirements"),
  crafting: text("crafting"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Organizations
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  organizationType: text("organization_type").notNull(), // guild, faction, government, etc.
  purpose: text("purpose").notNull(),
  description: text("description").notNull(),
  structure: text("structure"),
  leadership: text("leadership"),
  members: text("members"),
  headquarters: text("headquarters"),
  influence: text("influence"),
  resources: text("resources"),
  goals: text("goals"),
  history: text("history"),
  allies: text("allies").array(),
  enemies: text("enemies").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Species
export const species = pgTable("species", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  classification: text("classification"),
  physicalDescription: text("physical_description").notNull(),
  habitat: text("habitat"),
  behavior: text("behavior"),
  diet: text("diet"),
  lifespan: text("lifespan"),
  intelligence: text("intelligence"),
  socialStructure: text("social_structure"),
  abilities: text("abilities").array(),
  weaknesses: text("weaknesses").array(),
  culturalTraits: text("cultural_traits"),
  reproduction: text("reproduction"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ethnicities
export const ethnicities = pgTable("ethnicities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  origin: text("origin"),
  physicalTraits: text("physical_traits"),
  culturalTraits: text("cultural_traits"),
  traditions: text("traditions").array(),
  language: text("language"),
  religion: text("religion"),
  socialStructure: text("social_structure"),
  history: text("history"),
  geography: text("geography"),
  values: text("values").array(),
  customs: text("customs").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cultures
export const cultures = pgTable("cultures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  values: text("values").array(),
  beliefs: text("beliefs").array(),
  traditions: text("traditions").array(),
  socialNorms: text("social_norms").array(),
  language: text("language"),
  arts: text("arts"),
  technology: text("technology"),
  governance: text("governance"),
  economy: text("economy"),
  education: text("education"),
  family: text("family"),
  ceremonies: text("ceremonies").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  documentType: text("document_type").notNull(), // book, scroll, letter, map, etc.
  content: text("content").notNull(),
  author: text("author"),
  language: text("language"),
  age: text("age"),
  condition: text("condition"),
  significance: text("significance"),
  location: text("location"),
  accessibility: text("accessibility"),
  secrets: text("secrets"),
  history: text("history"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Food
export const foods = pgTable("foods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  foodType: text("food_type").notNull(), // meal, snack, dessert, etc.
  description: text("description").notNull(),
  ingredients: text("ingredients").array(),
  preparation: text("preparation"),
  origin: text("origin"),
  culturalSignificance: text("cultural_significance"),
  nutritionalValue: text("nutritional_value"),
  taste: text("taste"),
  texture: text("texture"),
  cost: text("cost"),
  rarity: text("rarity"),
  preservation: text("preservation"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Drinks
export const drinks = pgTable("drinks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  drinkType: text("drink_type").notNull(), // alcoholic, non-alcoholic, magical, etc.
  description: text("description").notNull(),
  ingredients: text("ingredients").array(),
  preparation: text("preparation"),
  alcoholContent: text("alcohol_content"),
  effects: text("effects"),
  origin: text("origin"),
  culturalSignificance: text("cultural_significance"),
  taste: text("taste"),
  appearance: text("appearance"),
  cost: text("cost"),
  rarity: text("rarity"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weapons
export const weapons = pgTable("weapons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  weaponType: text("weapon_type").notNull(), // sword, bow, staff, etc.
  description: text("description").notNull(),
  damage: text("damage"),
  range: text("range"),
  weight: text("weight"),
  materials: text("materials").array(),
  craftsmanship: text("craftsmanship"),
  enchantments: text("enchantments").array(),
  history: text("history"),
  rarity: text("rarity"),
  value: text("value"),
  requirements: text("requirements"),
  maintenance: text("maintenance"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Armor
export const armor = pgTable("armor", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  armorType: text("armor_type").notNull(), // light, medium, heavy, shield, etc.
  description: text("description").notNull(),
  protection: text("protection"),
  weight: text("weight"),
  materials: text("materials").array(),
  coverage: text("coverage"),
  mobility: text("mobility"),
  enchantments: text("enchantments").array(),
  craftsmanship: text("craftsmanship"),
  history: text("history"),
  rarity: text("rarity"),
  value: text("value"),
  maintenance: text("maintenance"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Religions
export const religions = pgTable("religions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  beliefs: text("beliefs").array(),
  practices: text("practices").array(),
  deities: text("deities").array(),
  hierarchy: text("hierarchy"),
  followers: text("followers"),
  history: text("history"),
  scriptures: text("scriptures"),
  ceremonies: text("ceremonies").array(),
  symbols: text("symbols").array(),
  morality: text("morality"),
  afterlife: text("afterlife"),
  influence: text("influence"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Languages
export const languages = pgTable("languages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  family: text("family"),
  speakers: text("speakers"),
  regions: text("regions").array(),
  phonology: text("phonology"),
  grammar: text("grammar"),
  vocabulary: text("vocabulary"),
  writingSystem: text("writing_system"),
  commonPhrases: text("common_phrases").array(),
  culturalContext: text("cultural_context"),
  history: text("history"),
  variations: text("variations").array(),
  difficulty: text("difficulty"),
  status: text("status"), // living, dead, constructed, etc.
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Accessories
export const accessories = pgTable("accessories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  accessoryType: text("accessory_type").notNull(), // jewelry, belt, cloak, etc.
  description: text("description").notNull(),
  materials: text("materials").array(),
  value: text("value"),
  rarity: text("rarity"),
  enchantments: text("enchantments").array(),
  culturalSignificance: text("cultural_significance"),
  history: text("history"),
  appearance: text("appearance"),
  functionality: text("functionality"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clothing
export const clothing = pgTable("clothing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  clothingType: text("clothing_type").notNull(), // shirt, pants, dress, robe, etc.
  description: text("description").notNull(),
  materials: text("materials").array(),
  style: text("style"),
  colors: text("colors").array(),
  socialClass: text("social_class"),
  culturalContext: text("cultural_context"),
  climate: text("climate"),
  occasion: text("occasion"),
  cost: text("cost"),
  durability: text("durability"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Materials
export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  materialType: text("material_type").notNull(), // metal, wood, fabric, stone, etc.
  description: text("description").notNull(),
  properties: text("properties").array(),
  rarity: text("rarity"),
  value: text("value"),
  source: text("source"),
  processing: text("processing"),
  uses: text("uses").array(),
  durability: text("durability"),
  appearance: text("appearance"),
  weight: text("weight"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Settlements
export const settlements = pgTable("settlements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  settlementType: text("settlement_type").notNull(), // city, town, village, outpost, etc.
  description: text("description").notNull(),
  population: text("population"),
  government: text("government"),
  economy: text("economy"),
  defenses: text("defenses"),
  culture: text("culture"),
  history: text("history"),
  geography: text("geography"),
  climate: text("climate"),
  resources: text("resources").array(),
  threats: text("threats").array(),
  landmarks: text("landmarks").array(),
  districts: text("districts").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Societies
export const societies = pgTable("societies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  societyType: text("society_type").notNull(), // tribal, feudal, democratic, etc.
  description: text("description").notNull(),
  structure: text("structure"),
  leadership: text("leadership"),
  laws: text("laws"),
  values: text("values").array(),
  customs: text("customs").array(),
  economy: text("economy"),
  technology: text("technology"),
  education: text("education"),
  military: text("military"),
  religion: text("religion"),
  arts: text("arts"),
  history: text("history"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Factions
export const factions = pgTable("factions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  factionType: text("faction_type").notNull(), // political, military, religious, criminal, etc.
  description: text("description").notNull(),
  goals: text("goals"),
  ideology: text("ideology"),
  leadership: text("leadership"),
  members: text("members"),
  resources: text("resources"),
  territory: text("territory"),
  influence: text("influence"),
  allies: text("allies").array(),
  enemies: text("enemies").array(),
  methods: text("methods"),
  history: text("history"),
  secrets: text("secrets"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Military Units
export const militaryUnits = pgTable("military_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  unitType: text("unit_type").notNull(), // infantry, cavalry, navy, special forces, etc.
  description: text("description").notNull(),
  size: text("size"),
  composition: text("composition"),
  equipment: text("equipment").array(),
  training: text("training"),
  specializations: text("specializations").array(),
  commander: text("commander"),
  morale: text("morale"),
  reputation: text("reputation"),
  history: text("history"),
  battleRecord: text("battle_record"),
  currentStatus: text("current_status"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Myths
export const myths = pgTable("myths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  mythType: text("myth_type").notNull(), // creation, hero, origin, cautionary, etc.
  summary: text("summary").notNull(),
  fullStory: text("full_story").notNull(),
  characters: text("characters").array(),
  themes: text("themes").array(),
  moralLesson: text("moral_lesson"),
  culturalOrigin: text("cultural_origin"),
  symbolism: text("symbolism"),
  variations: text("variations").array(),
  modernRelevance: text("modern_relevance"),
  relatedMyths: text("related_myths").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legends
export const legends = pgTable("legends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  legendType: text("legend_type").notNull(), // historical, supernatural, heroic, etc.
  summary: text("summary").notNull(),
  fullStory: text("full_story").notNull(),
  historicalBasis: text("historical_basis"),
  mainCharacters: text("main_characters").array(),
  location: text("location"),
  timeframe: text("timeframe"),
  truthElements: text("truth_elements"),
  exaggerations: text("exaggerations"),
  culturalImpact: text("cultural_impact"),
  modernAdaptations: text("modern_adaptations").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  eventType: text("event_type").notNull(), // battle, festival, disaster, discovery, etc.
  description: text("description").notNull(),
  date: text("date"),
  location: text("location"),
  participants: text("participants").array(),
  causes: text("causes"),
  consequences: text("consequences"),
  significance: text("significance"),
  duration: text("duration"),
  scale: text("scale"),
  documentation: text("documentation"),
  conflictingAccounts: text("conflicting_accounts"),
  legacy: text("legacy"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Technologies
export const technologies = pgTable("technologies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  technologyType: text("technology_type").notNull(), // magical, mechanical, biological, etc.
  description: text("description").notNull(),
  function: text("function"),
  principles: text("principles"),
  requirements: text("requirements").array(),
  limitations: text("limitations").array(),
  applications: text("applications").array(),
  development: text("development"),
  inventors: text("inventors"),
  rarity: text("rarity"),
  risks: text("risks"),
  evolution: text("evolution"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Spells
export const spells = pgTable("spells", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  school: text("school"), // evocation, divination, etc.
  level: text("level"),
  description: text("description").notNull(),
  components: text("components").array(),
  castingTime: text("casting_time"),
  range: text("range"),
  duration: text("duration"),
  effect: text("effect"),
  limitations: text("limitations"),
  rarity: text("rarity"),
  origin: text("origin"),
  variations: text("variations").array(),
  risks: text("risks"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Additional content types to complete the 40+ types requested

// Resources
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  resourceType: text("resource_type").notNull(), // natural, manufactured, magical, etc.
  description: text("description").notNull(),
  abundance: text("abundance"),
  location: text("location"),
  extractionMethod: text("extraction_method"),
  uses: text("uses").array(),
  value: text("value"),
  rarity: text("rarity"),
  renewability: text("renewability"),
  tradeCommodity: text("trade_commodity"),
  controlledBy: text("controlled_by"),
  conflicts: text("conflicts"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Buildings
export const buildings = pgTable("buildings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  buildingType: text("building_type").notNull(), // temple, castle, shop, house, etc.
  description: text("description").notNull(),
  architecture: text("architecture"),
  materials: text("materials").array(),
  purpose: text("purpose"),
  capacity: text("capacity"),
  defenses: text("defenses"),
  history: text("history"),
  currentCondition: text("current_condition"),
  location: text("location"),
  owner: text("owner"),
  significance: text("significance"),
  secrets: text("secrets"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Animals
export const animals = pgTable("animals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  animalType: text("animal_type").notNull(), // mammal, bird, reptile, etc.
  description: text("description").notNull(),
  habitat: text("habitat"),
  diet: text("diet"),
  behavior: text("behavior"),
  physicalTraits: text("physical_traits"),
  size: text("size"),
  domestication: text("domestication"),
  intelligence: text("intelligence"),
  abilities: text("abilities").array(),
  lifecycle: text("lifecycle"),
  culturalRole: text("cultural_role"),
  threats: text("threats"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transportation
export const transportation = pgTable("transportation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  transportType: text("transport_type").notNull(), // land, sea, air, magical, etc.
  description: text("description").notNull(),
  capacity: text("capacity"),
  speed: text("speed"),
  range: text("range"),
  requirements: text("requirements"),
  construction: text("construction"),
  operation: text("operation"),
  cost: text("cost"),
  rarity: text("rarity"),
  advantages: text("advantages").array(),
  disadvantages: text("disadvantages").array(),
  culturalSignificance: text("cultural_significance"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Natural Laws
export const naturalLaws = pgTable("natural_laws", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  lawType: text("law_type").notNull(), // physical, magical, divine, etc.
  description: text("description").notNull(),
  scope: text("scope"),
  principles: text("principles"),
  exceptions: text("exceptions").array(),
  discovery: text("discovery"),
  applications: text("applications").array(),
  implications: text("implications"),
  relatedLaws: text("related_laws").array(),
  understanding: text("understanding"),
  controversies: text("controversies"),
  evidence: text("evidence"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Traditions
export const traditions = pgTable("traditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  traditionType: text("tradition_type").notNull(), // ceremony, festival, custom, etc.
  description: text("description").notNull(),
  origin: text("origin"),
  purpose: text("purpose"),
  participants: text("participants"),
  procedure: text("procedure"),
  timing: text("timing"),
  location: text("location"),
  symbolism: text("symbolism"),
  significance: text("significance"),
  modernPractice: text("modern_practice"),
  variations: text("variations").array(),
  relatedTraditions: text("related_traditions").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rituals
export const rituals = pgTable("rituals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ritualType: text("ritual_type").notNull(), // religious, magical, social, etc.
  description: text("description").notNull(),
  purpose: text("purpose"),
  participants: text("participants"),
  requirements: text("requirements").array(),
  steps: text("steps").array(),
  duration: text("duration"),
  location: text("location"),
  timing: text("timing"),
  components: text("components").array(),
  effects: text("effects"),
  risks: text("risks"),
  variations: text("variations").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family trees for genealogical relationships
export const familyTrees = pgTable("family_trees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rootPerson: text("root_person").notNull(), // main person the tree starts from
  treeType: text("tree_type").notNull(), // ancestral, descendant, full, etc.
  generations: integer("generations"), // number of generations covered
  familyLineage: text("family_lineage"), // noble, common, etc.
  notableMembers: text("notable_members").array(),
  familyTraditions: text("family_traditions").array(),
  inheritancePatterns: text("inheritance_patterns"),
  familySecrets: text("family_secrets").array(),
  coatOfArms: text("coat_of_arms"),
  familyMotto: text("family_motto"),
  ancestralHome: text("ancestral_home"),
  currentStatus: text("current_status"), // thriving, declining, extinct, etc.
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Timelines for chronological events
export const timelines = pgTable("timelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  timelineType: text("timeline_type").notNull(), // historical, character, world, campaign, etc.
  timeScale: text("time_scale").notNull(), // years, decades, centuries, millennia, etc.
  startDate: text("start_date"),
  endDate: text("end_date"),
  majorEvents: text("major_events").array(),
  keyFigures: text("key_figures").array(),
  culturalPeriods: text("cultural_periods").array(),
  wars: text("wars").array(),
  discoveries: text("discoveries").array(),
  naturalDisasters: text("natural_disasters").array(),
  politicalChanges: text("political_changes").array(),
  technologicalAdvances: text("technological_advances").array(),
  scope: text("scope"), // global, regional, local, personal, etc.
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ceremonies for formal events and rituals
export const ceremonies = pgTable("ceremonies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ceremonyType: text("ceremony_type").notNull(), // wedding, funeral, coronation, graduation, etc.
  description: text("description").notNull(),
  purpose: text("purpose").notNull(),
  participants: text("participants").array(),
  officiant: text("officiant"),
  location: text("location"),
  duration: text("duration"),
  season: text("season"),
  frequency: text("frequency"),
  traditions: text("traditions").array(),
  symbolism: text("symbolism").array(),
  requiredItems: text("required_items").array(),
  dress: text("dress"),
  music: text("music"),
  food: text("food"),
  gifts: text("gifts"),
  significance: text("significance"),
  restrictions: text("restrictions").array(),
  variations: text("variations"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Maps for geographical visualization
export const maps = pgTable("maps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  mapType: text("map_type").notNull(), // world, regional, city, dungeon, political, etc.
  description: text("description").notNull(),
  scale: text("scale"), // global, continental, regional, local, etc.
  dimensions: text("dimensions"),
  keyLocations: text("key_locations").array(),
  terrain: text("terrain").array(),
  climate: text("climate"),
  politicalBoundaries: text("political_boundaries").array(),
  traderoutes: text("traderoutes").array(),
  dangerZones: text("danger_zones").array(),
  resources: text("resources").array(),
  landmarks: text("landmarks").array(),
  hiddenFeatures: text("hidden_features").array(),
  mapMaker: text("map_maker"),
  accuracy: text("accuracy"), // precise, rough, outdated, etc.
  legends: text("legends").array(),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Music for cultural and artistic elements
export const music = pgTable("music", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  musicType: text("music_type").notNull(), // song, symphony, folk tune, chant, etc.
  description: text("description").notNull(),
  genre: text("genre"),
  composer: text("composer"),
  performers: text("performers").array(),
  instruments: text("instruments").array(),
  vocals: text("vocals"), // solo, chorus, none, etc.
  lyrics: text("lyrics"),
  tempo: text("tempo"),
  mood: text("mood"),
  culturalOrigin: text("cultural_origin"),
  occasion: text("occasion"), // ceremony, celebration, mourning, etc.
  significance: text("significance"),
  popularity: text("popularity"),
  musicalStyle: text("musical_style"),
  length: text("length"),
  difficulty: text("difficulty"),
  variations: text("variations").array(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dance for cultural and artistic elements
export const dances = pgTable("dances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  danceType: text("dance_type").notNull(), // ritual, social, performance, combat, etc.
  description: text("description").notNull(),
  origin: text("origin"),
  movements: text("movements").array(),
  formations: text("formations").array(),
  participants: text("participants"), // solo, pair, group, etc.
  music: text("music"),
  costumes: text("costumes"),
  props: text("props").array(),
  occasion: text("occasion"),
  difficulty: text("difficulty"),
  duration: text("duration"),
  symbolism: text("symbolism"),
  culturalSignificance: text("cultural_significance"),
  restrictions: text("restrictions"),
  variations: text("variations").array(),
  teachingMethods: text("teaching_methods"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Laws for legal and governance systems
export const laws = pgTable("laws", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  lawType: text("law_type").notNull(), // criminal, civil, religious, military, etc.
  description: text("description").notNull(),
  jurisdiction: text("jurisdiction"), // local, regional, national, international
  authority: text("authority"), // who enforces it
  penalties: text("penalties").array(),
  exceptions: text("exceptions").array(),
  precedents: text("precedents").array(),
  enforcement: text("enforcement"),
  courts: text("courts").array(),
  appeals: text("appeals"),
  amendments: text("amendments").array(),
  relatedLaws: text("related_laws").array(),
  controversy: text("controversy"),
  publicOpinion: text("public_opinion"),
  historicalContext: text("historical_context"),
  effectiveness: text("effectiveness"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Policies for organizational and governmental directives
export const policies = pgTable("policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  policyType: text("policy_type").notNull(), // governmental, organizational, diplomatic, etc.
  description: text("description").notNull(),
  scope: text("scope"), // local, regional, national, international, organizational
  authority: text("authority"), // who created/enforces it
  objectives: text("objectives").array(),
  implementation: text("implementation"),
  timeline: text("timeline"),
  resources: text("resources"),
  stakeholders: text("stakeholders").array(),
  benefits: text("benefits").array(),
  drawbacks: text("drawbacks").array(),
  publicReaction: text("public_reaction"),
  compliance: text("compliance"),
  monitoring: text("monitoring"),
  amendments: text("amendments").array(),
  relatedPolicies: text("related_policies").array(),
  effectiveness: text("effectiveness"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Potions separate from drinks - magical/alchemical concoctions
export const potions = pgTable("potions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  potionType: text("potion_type").notNull(), // healing, poison, enhancement, transformation, etc.
  description: text("description").notNull(),
  effects: text("effects").array(),
  duration: text("duration"),
  potency: text("potency"), // weak, moderate, strong, legendary, etc.
  ingredients: text("ingredients").array(),
  preparation: text("preparation"),
  brewingTime: text("brewing_time"),
  brewingDifficulty: text("brewing_difficulty"),
  rarity: text("rarity"),
  cost: text("cost"),
  sideEffects: text("side_effects").array(),
  contraindications: text("contraindications").array(),
  antidotes: text("antidotes").array(),
  weaknesses: text("weaknesses").array(),
  storage: text("storage"),
  shelfLife: text("shelf_life"),
  appearance: text("appearance"),
  taste: text("taste"),
  smell: text("smell"),
  creator: text("creator"),
  legality: text("legality"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professions for character occupations and career paths
export const professions = pgTable("professions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  professionType: text("profession_type"), // warrior, mage, merchant, craftsman, noble, etc.
  description: text("description").notNull(),
  skillsRequired: text("skills_required").array(),
  responsibilities: text("responsibilities"),
  workEnvironment: text("work_environment"),
  trainingRequired: text("training_required"),
  socialStatus: text("social_status"), // low, middle, high, nobility, etc.
  averageIncome: text("average_income"),
  riskLevel: text("risk_level"), // low, moderate, high, extreme
  physicalDemands: text("physical_demands"),
  mentalDemands: text("mental_demands"),
  commonTools: text("common_tools").array(),
  relatedProfessions: text("related_professions").array(),
  careerProgression: text("career_progression"),
  seasonalWork: boolean("seasonal_work").default(false),
  apprenticeship: text("apprenticeship"),
  guildsOrganizations: text("guilds_organizations").array(),
  historicalContext: text("historical_context"),
  culturalSignificance: text("cultural_significance"),
  genre: text("genre"),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User saved items (favorites)
export const savedItems = pgTable("saved_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  itemType: text("item_type").notNull(), // 'character', 'location', 'item', 'organization', etc.
  itemId: varchar("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserItem: sql`UNIQUE(COALESCE(${table.userId}, 'guest'), ${table.itemType}, ${table.itemId})`
}));

// Manuscripts - Rich text documents for writing
export const manuscripts = pgTable("manuscripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull().default(''), // Rich text content
  excerpt: text("excerpt"), // Auto-generated excerpt for previews
  wordCount: integer("word_count").default(0),
  tags: text("tags").array(), // User-defined tags
  status: text("status").notNull().default('draft'), // 'draft', 'published', 'archived'
  searchVector: text("search_vector"), // For full-text search - will be converted to tsvector in later phases
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Manuscript Links - Bidirectional links between manuscripts and content
export const manuscriptLinks = pgTable("manuscript_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull().references(() => manuscripts.id, { onDelete: 'cascade' }),
  targetType: text("target_type").notNull(), // 'character', 'location', 'organization', 'manuscript', etc.
  targetId: varchar("target_id").notNull(),
  contextText: text("context_text"), // Surrounding text where link appears
  linkText: text("link_text"), // The actual text of the link
  position: integer("position"), // Position in the source document
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pinned Content - User's pinned items for quick access
export const pinnedContent = pgTable("pinned_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: text("target_type").notNull(), // 'character', 'location', 'manuscript', etc.
  targetId: varchar("target_id").notNull(),
  pinOrder: integer("pin_order").default(0), // For custom ordering
  category: text("category"), // Optional grouping: 'characters', 'locations', 'research', etc.
  notes: text("notes"), // User notes about why this is pinned
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserPin: sql`UNIQUE(${table.userId}, ${table.targetType}, ${table.targetId})`
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  characters: many(characters),
  plots: many(plots),
  prompts: many(prompts),
  settings: many(settings),
  names: many(names),
  conflicts: many(conflicts),
  themes: many(themes),
  moods: many(moods),
  creatures: many(creatures),
  plants: many(plants),
  descriptions: many(descriptions),
  locations: many(locations),
  items: many(items),
  organizations: many(organizations),
  species: many(species),
  ethnicities: many(ethnicities),
  cultures: many(cultures),
  documents: many(documents),
  foods: many(foods),
  drinks: many(drinks),
  weapons: many(weapons),
  armor: many(armor),
  religions: many(religions),
  languages: many(languages),
  accessories: many(accessories),
  clothing: many(clothing),
  materials: many(materials),
  settlements: many(settlements),
  societies: many(societies),
  factions: many(factions),
  militaryUnits: many(militaryUnits),
  myths: many(myths),
  legends: many(legends),
  events: many(events),
  technologies: many(technologies),
  spells: many(spells),
  resources: many(resources),
  buildings: many(buildings),
  animals: many(animals),
  transportation: many(transportation),
  naturalLaws: many(naturalLaws),
  traditions: many(traditions),
  rituals: many(rituals),
  familyTrees: many(familyTrees),
  timelines: many(timelines),
  ceremonies: many(ceremonies),
  maps: many(maps),
  music: many(music),
  dances: many(dances),
  laws: many(laws),
  policies: many(policies),
  potions: many(potions),
  professions: many(professions),
  savedItems: many(savedItems),
  manuscripts: many(manuscripts),
  manuscriptLinks: many(manuscriptLinks),
  pinnedContent: many(pinnedContent),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
}));

export const plotsRelations = relations(plots, ({ one }) => ({
  user: one(users, {
    fields: [plots.userId],
    references: [users.id],
  }),
}));

export const promptsRelations = relations(prompts, ({ one }) => ({
  user: one(users, {
    fields: [prompts.userId],
    references: [users.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, {
    fields: [settings.userId],
    references: [users.id],
  }),
}));

export const namesRelations = relations(names, ({ one }) => ({
  user: one(users, {
    fields: [names.userId],
    references: [users.id],
  }),
}));

export const conflictsRelations = relations(conflicts, ({ one }) => ({
  user: one(users, {
    fields: [conflicts.userId],
    references: [users.id],
  }),
}));

export const themesRelations = relations(themes, ({ one }) => ({
  user: one(users, {
    fields: [themes.userId],
    references: [users.id],
  }),
}));

export const moodsRelations = relations(moods, ({ one }) => ({
  user: one(users, {
    fields: [moods.userId],
    references: [users.id],
  }),
}));

export const creaturesRelations = relations(creatures, ({ one }) => ({
  user: one(users, {
    fields: [creatures.userId],
    references: [users.id],
  }),
}));

export const plantsRelations = relations(plants, ({ one }) => ({
  user: one(users, {
    fields: [plants.userId],
    references: [users.id],
  }),
}));

export const descriptionsRelations = relations(descriptions, ({ one }) => ({
  user: one(users, {
    fields: [descriptions.userId],
    references: [users.id],
  }),
}));

export const savedItemsRelations = relations(savedItems, ({ one }) => ({
  user: one(users, {
    fields: [savedItems.userId],
    references: [users.id],
  }),
}));

// Add relations for all new content types
export const locationsRelations = relations(locations, ({ one }) => ({
  user: one(users, {
    fields: [locations.userId],
    references: [users.id],
  }),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  user: one(users, {
    fields: [items.userId],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ one }) => ({
  user: one(users, {
    fields: [organizations.userId],
    references: [users.id],
  }),
}));

export const speciesRelations = relations(species, ({ one }) => ({
  user: one(users, {
    fields: [species.userId],
    references: [users.id],
  }),
}));

export const ethnicitiesRelations = relations(ethnicities, ({ one }) => ({
  user: one(users, {
    fields: [ethnicities.userId],
    references: [users.id],
  }),
}));

export const culturesRelations = relations(cultures, ({ one }) => ({
  user: one(users, {
    fields: [cultures.userId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

export const foodsRelations = relations(foods, ({ one }) => ({
  user: one(users, {
    fields: [foods.userId],
    references: [users.id],
  }),
}));

export const drinksRelations = relations(drinks, ({ one }) => ({
  user: one(users, {
    fields: [drinks.userId],
    references: [users.id],
  }),
}));

export const weaponsRelations = relations(weapons, ({ one }) => ({
  user: one(users, {
    fields: [weapons.userId],
    references: [users.id],
  }),
}));

export const armorRelations = relations(armor, ({ one }) => ({
  user: one(users, {
    fields: [armor.userId],
    references: [users.id],
  }),
}));

export const religionsRelations = relations(religions, ({ one }) => ({
  user: one(users, {
    fields: [religions.userId],
    references: [users.id],
  }),
}));

export const languagesRelations = relations(languages, ({ one }) => ({
  user: one(users, {
    fields: [languages.userId],
    references: [users.id],
  }),
}));

export const accessoriesRelations = relations(accessories, ({ one }) => ({
  user: one(users, {
    fields: [accessories.userId],
    references: [users.id],
  }),
}));

export const clothingRelations = relations(clothing, ({ one }) => ({
  user: one(users, {
    fields: [clothing.userId],
    references: [users.id],
  }),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  user: one(users, {
    fields: [materials.userId],
    references: [users.id],
  }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  user: one(users, {
    fields: [settlements.userId],
    references: [users.id],
  }),
}));

export const societiesRelations = relations(societies, ({ one }) => ({
  user: one(users, {
    fields: [societies.userId],
    references: [users.id],
  }),
}));

export const factionsRelations = relations(factions, ({ one }) => ({
  user: one(users, {
    fields: [factions.userId],
    references: [users.id],
  }),
}));

export const militaryUnitsRelations = relations(militaryUnits, ({ one }) => ({
  user: one(users, {
    fields: [militaryUnits.userId],
    references: [users.id],
  }),
}));

export const mythsRelations = relations(myths, ({ one }) => ({
  user: one(users, {
    fields: [myths.userId],
    references: [users.id],
  }),
}));

export const legendsRelations = relations(legends, ({ one }) => ({
  user: one(users, {
    fields: [legends.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
}));

export const technologiesRelations = relations(technologies, ({ one }) => ({
  user: one(users, {
    fields: [technologies.userId],
    references: [users.id],
  }),
}));

export const spellsRelations = relations(spells, ({ one }) => ({
  user: one(users, {
    fields: [spells.userId],
    references: [users.id],
  }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  user: one(users, {
    fields: [resources.userId],
    references: [users.id],
  }),
}));

export const buildingsRelations = relations(buildings, ({ one }) => ({
  user: one(users, {
    fields: [buildings.userId],
    references: [users.id],
  }),
}));

export const animalsRelations = relations(animals, ({ one }) => ({
  user: one(users, {
    fields: [animals.userId],
    references: [users.id],
  }),
}));

export const transportationRelations = relations(transportation, ({ one }) => ({
  user: one(users, {
    fields: [transportation.userId],
    references: [users.id],
  }),
}));

export const naturalLawsRelations = relations(naturalLaws, ({ one }) => ({
  user: one(users, {
    fields: [naturalLaws.userId],
    references: [users.id],
  }),
}));

export const traditionsRelations = relations(traditions, ({ one }) => ({
  user: one(users, {
    fields: [traditions.userId],
    references: [users.id],
  }),
}));

export const ritualsRelations = relations(rituals, ({ one }) => ({
  user: one(users, {
    fields: [rituals.userId],
    references: [users.id],
  }),
}));

export const familyTreesRelations = relations(familyTrees, ({ one }) => ({
  user: one(users, {
    fields: [familyTrees.userId],
    references: [users.id],
  }),
}));

export const timelinesRelations = relations(timelines, ({ one }) => ({
  user: one(users, {
    fields: [timelines.userId],
    references: [users.id],
  }),
}));

export const ceremoniesRelations = relations(ceremonies, ({ one }) => ({
  user: one(users, {
    fields: [ceremonies.userId],
    references: [users.id],
  }),
}));

export const mapsRelations = relations(maps, ({ one }) => ({
  user: one(users, {
    fields: [maps.userId],
    references: [users.id],
  }),
}));

export const musicRelations = relations(music, ({ one }) => ({
  user: one(users, {
    fields: [music.userId],
    references: [users.id],
  }),
}));

export const dancesRelations = relations(dances, ({ one }) => ({
  user: one(users, {
    fields: [dances.userId],
    references: [users.id],
  }),
}));

export const lawsRelations = relations(laws, ({ one }) => ({
  user: one(users, {
    fields: [laws.userId],
    references: [users.id],
  }),
}));

export const policiesRelations = relations(policies, ({ one }) => ({
  user: one(users, {
    fields: [policies.userId],
    references: [users.id],
  }),
}));

export const potionsRelations = relations(potions, ({ one }) => ({
  user: one(users, {
    fields: [potions.userId],
    references: [users.id],
  }),
}));

export const professionsRelations = relations(professions, ({ one }) => ({
  user: one(users, {
    fields: [professions.userId],
    references: [users.id],
  }),
}));

export const manuscriptsRelations = relations(manuscripts, ({ one, many }) => ({
  user: one(users, {
    fields: [manuscripts.userId],
    references: [users.id],
  }),
  links: many(manuscriptLinks),
}));

export const manuscriptLinksRelations = relations(manuscriptLinks, ({ one }) => ({
  user: one(users, {
    fields: [manuscriptLinks.userId],
    references: [users.id],
  }),
  manuscript: one(manuscripts, {
    fields: [manuscriptLinks.sourceId],
    references: [manuscripts.id],
  }),
}));

export const pinnedContentRelations = relations(pinnedContent, ({ one }) => ({
  user: one(users, {
    fields: [pinnedContent.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export const updateCharacterSchema = insertCharacterSchema.partial().omit({
  userId: true,
});

export const insertPlotSchema = createInsertSchema(plots).omit({
  id: true,
  createdAt: true,
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
});

export const insertGuideSchema = createInsertSchema(guides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
});

export const insertNameSchema = createInsertSchema(names).omit({
  id: true,
  createdAt: true,
});

export const insertConflictSchema = createInsertSchema(conflicts).omit({
  id: true,
  createdAt: true,
});

export const insertThemeSchema = createInsertSchema(themes).omit({
  id: true,
  createdAt: true,
});

export const insertMoodSchema = createInsertSchema(moods).omit({
  id: true,
  createdAt: true,
});

export const insertCreatureSchema = createInsertSchema(creatures).omit({
  id: true,
  createdAt: true,
});

export const insertPlantSchema = createInsertSchema(plants).omit({
  id: true,
  createdAt: true,
});

export const insertDescriptionSchema = createInsertSchema(descriptions).omit({
  id: true,
  createdAt: true,
});

export const insertSavedItemSchema = createInsertSchema(savedItems).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for all new content types
export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertSpeciesSchema = createInsertSchema(species).omit({
  id: true,
  createdAt: true,
});

export const insertEthnicitySchema = createInsertSchema(ethnicities).omit({
  id: true,
  createdAt: true,
});

export const insertCultureSchema = createInsertSchema(cultures).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true,
  createdAt: true,
});

export const insertDrinkSchema = createInsertSchema(drinks).omit({
  id: true,
  createdAt: true,
});

export const insertWeaponSchema = createInsertSchema(weapons).omit({
  id: true,
  createdAt: true,
});

export const insertArmorSchema = createInsertSchema(armor).omit({
  id: true,
  createdAt: true,
});

export const insertReligionSchema = createInsertSchema(religions).omit({
  id: true,
  createdAt: true,
});

export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true,
  createdAt: true,
});

export const insertAccessorySchema = createInsertSchema(accessories).omit({
  id: true,
  createdAt: true,
});

export const insertClothingSchema = createInsertSchema(clothing).omit({
  id: true,
  createdAt: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
});

export const insertSettlementSchema = createInsertSchema(settlements).omit({
  id: true,
  createdAt: true,
});

export const insertSocietySchema = createInsertSchema(societies).omit({
  id: true,
  createdAt: true,
});

export const insertFactionSchema = createInsertSchema(factions).omit({
  id: true,
  createdAt: true,
});

export const insertMilitaryUnitSchema = createInsertSchema(militaryUnits).omit({
  id: true,
  createdAt: true,
});

export const insertMythSchema = createInsertSchema(myths).omit({
  id: true,
  createdAt: true,
});

export const insertLegendSchema = createInsertSchema(legends).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertTechnologySchema = createInsertSchema(technologies).omit({
  id: true,
  createdAt: true,
});

export const insertSpellSchema = createInsertSchema(spells).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export const insertBuildingSchema = createInsertSchema(buildings).omit({
  id: true,
  createdAt: true,
});

export const insertAnimalSchema = createInsertSchema(animals).omit({
  id: true,
  createdAt: true,
});

export const insertTransportationSchema = createInsertSchema(transportation).omit({
  id: true,
  createdAt: true,
});

export const insertNaturalLawSchema = createInsertSchema(naturalLaws).omit({
  id: true,
  createdAt: true,
});

export const insertTraditionSchema = createInsertSchema(traditions).omit({
  id: true,
  createdAt: true,
});

export const insertRitualSchema = createInsertSchema(rituals).omit({
  id: true,
  createdAt: true,
});

export const insertFamilyTreeSchema = createInsertSchema(familyTrees).omit({
  id: true,
  createdAt: true,
});

export const insertTimelineSchema = createInsertSchema(timelines).omit({
  id: true,
  createdAt: true,
});

export const insertCeremonySchema = createInsertSchema(ceremonies).omit({
  id: true,
  createdAt: true,
});

export const insertMapSchema = createInsertSchema(maps).omit({
  id: true,
  createdAt: true,
});

export const insertMusicSchema = createInsertSchema(music).omit({
  id: true,
  createdAt: true,
});

export const insertDanceSchema = createInsertSchema(dances).omit({
  id: true,
  createdAt: true,
});

export const insertLawSchema = createInsertSchema(laws).omit({
  id: true,
  createdAt: true,
});

export const insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
});

export const insertPotionSchema = createInsertSchema(potions).omit({
  id: true,
  createdAt: true,
});

export const insertProfessionSchema = createInsertSchema(professions).omit({
  id: true,
  createdAt: true,
});

export const insertManuscriptSchema = createInsertSchema(manuscripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertManuscriptLinkSchema = createInsertSchema(manuscriptLinks).omit({
  id: true,
  createdAt: true,
});

export const insertPinnedContentSchema = createInsertSchema(pinnedContent).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type UpdateCharacter = z.infer<typeof updateCharacterSchema>;
export type Character = typeof characters.$inferSelect;
export type InsertPlot = z.infer<typeof insertPlotSchema>;
export type Plot = typeof plots.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Guide = typeof guides.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertName = z.infer<typeof insertNameSchema>;
export type GeneratedName = typeof names.$inferSelect;
export type InsertConflict = z.infer<typeof insertConflictSchema>;
export type Conflict = typeof conflicts.$inferSelect;
export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;
export type InsertMood = z.infer<typeof insertMoodSchema>;
export type Mood = typeof moods.$inferSelect;
export type InsertCreature = z.infer<typeof insertCreatureSchema>;
export type Creature = typeof creatures.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertDescription = z.infer<typeof insertDescriptionSchema>;
export type Description = typeof descriptions.$inferSelect;
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;
export type SavedItem = typeof savedItems.$inferSelect;
export type InsertManuscript = z.infer<typeof insertManuscriptSchema>;
export type Manuscript = typeof manuscripts.$inferSelect;
export type InsertManuscriptLink = z.infer<typeof insertManuscriptLinkSchema>;
export type ManuscriptLink = typeof manuscriptLinks.$inferSelect;
export type InsertPinnedContent = z.infer<typeof insertPinnedContentSchema>;
export type PinnedContent = typeof pinnedContent.$inferSelect;

// Types for all new content types
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertSpecies = z.infer<typeof insertSpeciesSchema>;
export type Species = typeof species.$inferSelect;
export type InsertEthnicity = z.infer<typeof insertEthnicitySchema>;
export type Ethnicity = typeof ethnicities.$inferSelect;
export type InsertCulture = z.infer<typeof insertCultureSchema>;
export type Culture = typeof cultures.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type Food = typeof foods.$inferSelect;
export type InsertDrink = z.infer<typeof insertDrinkSchema>;
export type Drink = typeof drinks.$inferSelect;
export type InsertWeapon = z.infer<typeof insertWeaponSchema>;
export type Weapon = typeof weapons.$inferSelect;
export type InsertArmor = z.infer<typeof insertArmorSchema>;
export type Armor = typeof armor.$inferSelect;
export type InsertReligion = z.infer<typeof insertReligionSchema>;
export type Religion = typeof religions.$inferSelect;
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;
export type InsertAccessory = z.infer<typeof insertAccessorySchema>;
export type Accessory = typeof accessories.$inferSelect;
export type InsertClothing = z.infer<typeof insertClothingSchema>;
export type Clothing = typeof clothing.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type Settlement = typeof settlements.$inferSelect;
export type InsertSociety = z.infer<typeof insertSocietySchema>;
export type Society = typeof societies.$inferSelect;
export type InsertFaction = z.infer<typeof insertFactionSchema>;
export type Faction = typeof factions.$inferSelect;
export type InsertMilitaryUnit = z.infer<typeof insertMilitaryUnitSchema>;
export type MilitaryUnit = typeof militaryUnits.$inferSelect;
export type InsertMyth = z.infer<typeof insertMythSchema>;
export type Myth = typeof myths.$inferSelect;
export type InsertLegend = z.infer<typeof insertLegendSchema>;
export type Legend = typeof legends.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertTechnology = z.infer<typeof insertTechnologySchema>;
export type Technology = typeof technologies.$inferSelect;
export type InsertSpell = z.infer<typeof insertSpellSchema>;
export type Spell = typeof spells.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertBuilding = z.infer<typeof insertBuildingSchema>;
export type Building = typeof buildings.$inferSelect;
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type Animal = typeof animals.$inferSelect;
export type InsertTransportation = z.infer<typeof insertTransportationSchema>;
export type Transportation = typeof transportation.$inferSelect;
export type InsertNaturalLaw = z.infer<typeof insertNaturalLawSchema>;
export type NaturalLaw = typeof naturalLaws.$inferSelect;
export type InsertTradition = z.infer<typeof insertTraditionSchema>;
export type Tradition = typeof traditions.$inferSelect;
export type InsertRitual = z.infer<typeof insertRitualSchema>;
export type Ritual = typeof rituals.$inferSelect;
export type InsertFamilyTree = z.infer<typeof insertFamilyTreeSchema>;
export type FamilyTree = typeof familyTrees.$inferSelect;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;
export type Timeline = typeof timelines.$inferSelect;
export type InsertCeremony = z.infer<typeof insertCeremonySchema>;
export type Ceremony = typeof ceremonies.$inferSelect;
export type InsertMap = z.infer<typeof insertMapSchema>;
export type Map = typeof maps.$inferSelect;
export type InsertMusic = z.infer<typeof insertMusicSchema>;
export type Music = typeof music.$inferSelect;
export type InsertDance = z.infer<typeof insertDanceSchema>;
export type Dance = typeof dances.$inferSelect;
export type InsertLaw = z.infer<typeof insertLawSchema>;
export type Law = typeof laws.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policies.$inferSelect;
export type InsertPotion = z.infer<typeof insertPotionSchema>;
export type Potion = typeof potions.$inferSelect;
export type InsertProfession = z.infer<typeof insertProfessionSchema>;
export type Profession = typeof professions.$inferSelect;
