import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, real, index, uniqueIndex, unique, customType } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Custom tsvector type for PostgreSQL full-text search
export const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

// Session storage table for Replit Auth
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for authentication and user data (Replit Auth compatible)
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  // Subscription fields
  subscriptionTier: varchar("subscription_tier").default('free'),
  grandfatheredTier: varchar("grandfathered_tier"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  trialUsed: boolean("trial_used").default(false),
  // Multi-Factor Authentication (MFA) fields
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"), // Encrypted TOTP secret
  backupCodes: text("backup_codes").array(), // Hashed backup codes for account recovery
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shares - Collaborative access to notebooks, projects, and guides
export const shares = pgTable("shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resourceType: text("resource_type").notNull(), // 'notebook', 'project', 'guide'
  resourceId: varchar("resource_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  permission: text("permission").notNull(), // 'view', 'comment', 'edit'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueShare: uniqueIndex("shares_unique_idx").on(table.resourceType, table.resourceId, table.userId)
}));

// Notebooks - Separate world bibles/collections for organizing worldbuilding content
export const notebooks = pgTable("notebooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"), // Optional color for visual organization
  icon: text("icon"), // Optional icon identifier
  imageUrl: text("image_url"), // Optional thumbnail image for visual distinction
  isDefault: boolean("is_default").default(false), // One notebook can be marked as default per user
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Ensure only one default notebook per user
  uniqueDefaultPerUser: uniqueIndex("notebooks_user_default_idx").on(table.userId).where(sql`${table.isDefault} = true`)
}));

// Import Jobs - Track World Anvil and other imports
export const importJobs = pgTable("import_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  notebookId: varchar("notebook_id").notNull().references(() => notebooks.id, { onDelete: 'cascade' }),
  source: text("source").notNull(), // 'world_anvil', 'custom', etc.
  status: text("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  progress: integer("progress").default(0), // Percentage 0-100
  totalItems: integer("total_items").default(0),
  processedItems: integer("processed_items").default(0),
  results: jsonb("results"), // Detailed results: { imported: [], failed: [], skipped: [] }
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
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
  // General description
  description: text("description"),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  // Import metadata for tracking imported characters
  importSource: varchar("import_source"), // e.g., "world_anvil", "custom"
  importExternalId: varchar("import_external_id"), // Original ID from external source
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  folderId: varchar("folder_id"), // FK constraint handled via relations
  userId: varchar("user_id"), // FK constraint handled via relations
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  // Article content for hybrid structured-to-freeform editing
  articleContent: text("article_content"), // Stores rich HTML content when converted to article format
  // Image fields
  imageUrl: text("image_url"),
  imageCaption: text("image_caption"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Visual Family Trees - Graph-based genealogical relationships
export const familyTrees = pgTable("family_trees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  layoutMode: text("layout_mode").notNull().default('manual'), // 'auto' or 'manual'
  zoom: real("zoom").default(1),
  panX: real("pan_x").default(0),
  panY: real("pan_y").default(0),
  notebookId: varchar("notebook_id").notNull().references(() => notebooks.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family Tree Members - People/nodes in the family tree
export const familyTreeMembers = pgTable("family_tree_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  treeId: varchar("tree_id").notNull().references(() => familyTrees.id, { onDelete: 'cascade' }),
  characterId: varchar("character_id").references(() => characters.id, { onDelete: 'set null' }), // null = inline node
  // Inline node fields (used when characterId is null)
  inlineName: text("inline_name"),
  inlineDateOfBirth: text("inline_date_of_birth"),
  inlineDateOfDeath: text("inline_date_of_death"),
  inlineImageUrl: text("inline_image_url"),
  // Manual positioning coordinates
  positionX: real("position_x"),
  positionY: real("position_y"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family Tree Relationships - Edges/connections between members
export const familyTreeRelationships = pgTable("family_tree_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  treeId: varchar("tree_id").notNull().references(() => familyTrees.id, { onDelete: 'cascade' }),
  fromMemberId: varchar("from_member_id").notNull().references(() => familyTreeMembers.id, { onDelete: 'cascade' }),
  toMemberId: varchar("to_member_id").notNull().references(() => familyTreeMembers.id, { onDelete: 'cascade' }),
  relationshipType: text("relationship_type").notNull(), // parent, child, sibling, marriage, adoption, stepParent, grandparent, cousin, custom
  customLabel: text("custom_label"), // for custom relationship types
  metadata: jsonb("metadata"), // flexible storage for attributes like adoption flag, marriage dates, etc.
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
  // View/Display settings
  viewMode: text("view_mode").default('list'), // 'list', 'visual', or 'gantt'
  listViewMode: text("list_view_mode").default('compact'), // 'compact' or 'timescale'
  zoom: real("zoom").default(1),
  panX: real("pan_x").default(0),
  panY: real("pan_y").default(0),
  // Metadata
  scope: text("scope"), // global, regional, local, personal, etc.
  genre: text("genre"),
  // Relationships
  notebookId: varchar("notebook_id").notNull().references(() => notebooks.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Timeline Events - Individual events on a timeline
export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timelineId: varchar("timeline_id").notNull().references(() => timelines.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type"), // battle, discovery, birth, death, meeting, etc.
  startDate: text("start_date").notNull(),
  endDate: text("end_date"), // null for point events, has value for range events
  importance: text("importance").default('moderate'), // major, moderate, minor
  category: text("category"), // user-defined categories like "Plot", "Character Arc", "World Events"
  color: text("color"), // hex color for visual timeline
  icon: text("icon"), // lucide icon name
  linkedContentId: varchar("linked_content_id"), // ID of linked character, location, etc.
  linkedContentType: text("linked_content_type"), // 'character', 'location', 'item', etc.
  positionX: real("position_x"), // horizontal position for canvas layout
  positionY: real("position_y"), // vertical position for canvas layout
  metadata: jsonb("metadata"), // flexible JSON for custom fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timeline Relationships - Connections between events
export const timelineRelationships = pgTable("timeline_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timelineId: varchar("timeline_id").notNull().references(() => timelines.id, { onDelete: 'cascade' }),
  fromEventId: varchar("from_event_id").notNull().references(() => timelineEvents.id, { onDelete: 'cascade' }),
  toEventId: varchar("to_event_id").notNull().references(() => timelineEvents.id, { onDelete: 'cascade' }),
  relationshipType: text("relationship_type").notNull(), // 'causes', 'precedes', 'concurrent', 'related'
  description: text("description"),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ranks for hierarchical positions and titles
export const ranks = pgTable("ranks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  rankType: text("rank_type"), // military, nobility, clergy, guild, etc.
  description: text("description").notNull(),
  hierarchy: integer("hierarchy"), // Numerical ranking (1 = highest, increasing numbers = lower ranks)
  authority: text("authority"),
  responsibilities: text("responsibilities").array(),
  privileges: text("privileges").array(),
  insignia: text("insignia"),
  requirements: text("requirements"),
  organizationId: text("organization_id"), // Link to organization if applicable
  superiorRanks: text("superior_ranks").array(),
  subordinateRanks: text("subordinate_ranks").array(),
  titleOfAddress: text("title_of_address"), // How to address someone with this rank
  historicalOrigin: text("historical_origin"),
  genre: text("genre"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conditions for diseases, curses, afflictions, and states
export const conditions = pgTable("conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  conditionType: text("condition_type").notNull(), // disease, curse, affliction, blessing, mutation, etc.
  description: text("description").notNull(),
  symptoms: text("symptoms").array(),
  causes: text("causes").array(),
  transmission: text("transmission"), // How it spreads
  duration: text("duration"), // temporary, permanent, chronic, etc.
  severity: text("severity"), // mild, moderate, severe, fatal
  effects: text("effects").array(), // Game/narrative effects
  treatment: text("treatment"),
  cure: text("cure"),
  prevention: text("prevention"),
  complications: text("complications").array(),
  mortality: text("mortality"), // mortality rate or risk
  prevalence: text("prevalence"), // How common it is
  affectedSpecies: text("affected_species").array(),
  culturalImpact: text("cultural_impact"),
  historicalOutbreaks: text("historical_outbreaks"),
  genre: text("genre"),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User saved items (favorites)
export const savedItems = pgTable("saved_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemType: text("item_type").notNull(), // 'character', 'location', 'item', 'organization', etc.
  itemId: varchar("item_id").notNull(),
  itemData: jsonb("item_data"), // Stores the actual item content (character names, profession details, etc.)
  notebookId: varchar("notebook_id").notNull().references(() => notebooks.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Prevent duplicate saved items: same content can't be saved twice to the same notebook
  uniqueUserNotebookItem: uniqueIndex("saved_items_unique_user_notebook_item_idx")
    .on(table.userId, table.notebookId, table.itemType, table.itemId)
}));

// Folders - Organizational structure for projects and guides
export const folders = pgTable("folders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"), // Optional color for visual organization
  type: text("type").notNull(), // 'project' or 'guide'
  parentId: varchar("parent_id"), // Self-reference handled via relations to avoid circular dependency
  projectId: varchar("project_id"), // Link to parent project
  guideId: varchar("guide_id").references(() => guides.id, { onDelete: 'cascade' }), // Link to parent guide
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sortOrder: integer("sort_order").default(0), // For custom ordering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Ensure folder has proper parent relationship when type is specified
  parentCheck: sql`CHECK (
    (${table.type} = 'project' AND ${table.projectId} IS NOT NULL AND ${table.guideId} IS NULL) OR
    (${table.type} = 'guide' AND ${table.guideId} IS NOT NULL AND ${table.projectId} IS NULL)
  )`
}));

// Notes - Sub-documents within folders (scenes for projects, individual guides for guide folders)
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull().default(''), // Rich text content
  excerpt: text("excerpt"), // Auto-generated excerpt for previews
  type: text("type").notNull(), // 'project_note', 'guide_note', or 'quick_note'
  folderId: varchar("folder_id").references(() => folders.id, { onDelete: 'cascade' }),
  projectId: varchar("project_id"), // Link to parent project
  guideId: varchar("guide_id").references(() => guides.id, { onDelete: 'cascade' }), // Link to parent guide
  sortOrder: integer("sort_order").default(0), // For custom ordering within folder
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Ensure note has proper parent relationship - project/guide notes need parent, quick notes don't
  parentCheck: sql`CHECK (
    (${table.type} = 'quick_note' AND ${table.projectId} IS NULL AND ${table.guideId} IS NULL) OR
    (${table.type} != 'quick_note' AND (
      (${table.projectId} IS NOT NULL AND ${table.guideId} IS NULL) OR
      (${table.projectId} IS NULL AND ${table.guideId} IS NOT NULL)
    ))
  )`
}));

// Projects - Rich text documents for writing (updated with folder support and AI context metadata)
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull().default(''), // Rich text content
  excerpt: text("excerpt"), // Auto-generated excerpt for previews
  wordCount: integer("word_count").default(0),
  tags: text("tags").array(), // User-defined tags
  status: text("status").notNull().default('draft'), // 'draft', 'published', 'archived'
  searchVector: tsvector("search_vector"),
  folderId: varchar("folder_id"), // Optional folder organization
  // AI Context Metadata for better assistance
  genre: text("genre"), // Primary genre of the project
  targetWordCount: integer("target_word_count"), // Writing goal for this project
  currentStage: text("current_stage"), // e.g., 'outlining', 'first draft', 'revision', 'editing'
  knownChallenges: text("known_challenges").array().default(sql`ARRAY[]::text[]`), // Writer's identified struggles
  recentMilestones: text("recent_milestones").array().default(sql`ARRAY[]::text[]`), // Recent achievements
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  searchIdx: index("project_search_idx").using("gin", table.searchVector),
}));

// Project Sections - Hierarchical structure for projects (folders and pages)
export const projectSections = pgTable("project_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  parentId: varchar("parent_id"), // Self-reference handled at database level
  title: text("title").notNull(),
  content: text("content"), // HTML content for pages
  type: text("type").notNull(), // 'folder' or 'page'
  position: integer("position").notNull(), // For ordering within parent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectIdx: index("idx_project_sections_project").on(table.projectId),
  parentIdx: index("idx_project_sections_parent").on(table.parentId),
}));

// Project Links - Bidirectional links between projects and content
export const projectLinks = pgTable("project_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  targetType: text("target_type").notNull(), // 'character', 'location', 'organization', 'project', etc.
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
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'cascade' }),
  targetType: text("target_type").notNull(), // 'character', 'location', 'project', etc.
  targetId: varchar("target_id").notNull(),
  pinOrder: integer("pin_order").default(0), // For custom ordering
  category: text("category"), // Optional grouping: 'characters', 'locations', 'research', etc.
  notes: text("notes"), // User notes about why this is pinned
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserPin: sql`UNIQUE(${table.userId}, ${table.targetType}, ${table.targetId})`
}));

// Canvases - Visual whiteboard/moodboard using Excalidraw for story planning, character relationships, world maps, etc.
export const canvases = pgTable("canvases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"), // Optional description of what this canvas is for
  data: text("data").notNull().default('{"elements":[],"appState":{},"files":{}}'), // Excalidraw JSON data
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }), // Optional project linking
  tags: text("tags").array(), // User-defined tags for organization
  isTemplate: boolean("is_template").default(false), // Mark as template for reuse
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("canvas_user_idx").on(table.userId),
  projectIdx: index("canvas_project_idx").on(table.projectId),
  templateIdx: index("canvas_template_idx").on(table.isTemplate),
}));

// Conversation Threads - Organize and manage chat conversations with topics and branching
export const conversationThreads = pgTable("conversation_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }), // Optional - links to specific project
  guideId: varchar("guide_id").references(() => guides.id, { onDelete: 'cascade' }), // Optional - links to specific guide
  title: text("title").notNull(), // Auto-generated or user-defined title
  summary: text("summary"), // Brief summary of conversation for search
  tags: text("tags").array(), // Auto-generated topic tags (e.g., ['character development', 'Marcus', 'plot structure'])
  parentThreadId: varchar("parent_thread_id").references((): any => conversationThreads.id, { onDelete: 'set null' }), // For branching conversations
  isActive: boolean("is_active").default(true), // Active thread or archived
  messageCount: integer("message_count").default(0), // Cached count of messages
  lastActivityAt: timestamp("last_activity_at").defaultNow(), // For sorting by recency
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("conversation_threads_user_id_idx").on(table.userId),
  projectIdIdx: index("conversation_threads_project_id_idx").on(table.projectId),
  guideIdIdx: index("conversation_threads_guide_id_idx").on(table.guideId),
  parentThreadIdx: index("conversation_threads_parent_id_idx").on(table.parentThreadId),
  activeIdx: index("conversation_threads_active_idx").on(table.isActive),
  lastActivityIdx: index("conversation_threads_last_activity_idx").on(table.lastActivityAt),
  tagsIdx: index("conversation_threads_tags_idx").on(table.tags), // For tag-based search
}));

// Chat Messages - Persistent chat history for Writing Assistant
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  threadId: varchar("thread_id").references(() => conversationThreads.id, { onDelete: 'cascade' }), // Links message to conversation thread
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }), // Optional - links to specific project
  guideId: varchar("guide_id").references(() => guides.id, { onDelete: 'cascade' }), // Optional - links to specific guide
  type: text("type").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(), // Message content
  metadata: jsonb("metadata"), // Optional metadata like analysis results, suggestions, etc.
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("chat_messages_user_id_idx").on(table.userId),
  threadIdIdx: index("chat_messages_thread_id_idx").on(table.threadId),
  projectIdIdx: index("chat_messages_project_id_idx").on(table.projectId),
  guideIdIdx: index("chat_messages_guide_id_idx").on(table.guideId),
  createdAtIdx: index("chat_messages_created_at_idx").on(table.createdAt),
}));

// User Preferences - Writing preferences and AI interaction settings
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  experienceLevel: text("experience_level"), // 'beginner', 'intermediate', 'advanced', 'new_to_worldbuilding', 'experienced_worldbuilder'
  preferredGenres: text("preferred_genres").array(), // Array of genres the user writes
  writingGoals: text("writing_goals").array(), // e.g., ['finish novel', 'improve dialogue', 'publish']
  feedbackStyle: text("feedback_style"), // 'direct', 'gentle', 'technical', 'conceptual'
  targetWordCount: integer("target_word_count"), // General writing goal
  writingSchedule: text("writing_schedule"), // 'daily', 'weekly', 'whenever'
  preferredTone: text("preferred_tone"), // AI assistant tone preference
  
  // Response format preferences for personalized AI interactions
  responseFormat: text("response_format"), // 'bullets', 'paragraphs', 'mixed', 'adaptive'
  detailLevel: text("detail_level"), // 'brief', 'moderate', 'comprehensive'
  examplesPreference: text("examples_preference"), // 'frequent', 'occasional', 'minimal'
  
  // Onboarding tracking
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingStep: integer("onboarding_step").default(0), // Current step in onboarding process
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("user_preferences_user_id_idx").on(table.userId),
}));

// Conversation Summaries - Persistent memory of key insights from conversations
export const conversationSummaries = pgTable("conversation_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'cascade' }), // Optional - project-specific
  guideId: varchar("guide_id").references(() => guides.id, { onDelete: 'cascade' }), // Optional - guide-specific
  keyChallenges: text("key_challenges").array().default(sql`ARRAY[]::text[]`), // Ongoing struggles
  breakthroughs: text("breakthroughs").array().default(sql`ARRAY[]::text[]`), // Important discoveries
  recurringQuestions: text("recurring_questions").array().default(sql`ARRAY[]::text[]`), // Patterns in questions
  lastDiscussedTopics: text("last_discussed_topics").array().default(sql`ARRAY[]::text[]`), // Recent conversation themes
  writerProgress: text("writer_progress"), // Summary of overall progress
  lastDiscussed: timestamp("last_discussed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("conversation_summaries_user_id_idx").on(table.userId),
  projectIdIdx: index("conversation_summaries_project_id_idx").on(table.projectId),
  guideIdIdx: index("conversation_summaries_guide_id_idx").on(table.guideId),
  lastDiscussedIdx: index("conversation_summaries_last_discussed_idx").on(table.lastDiscussed),
  // Unique constraint using coalesce to handle NULLs properly (NULLs become empty strings)
  uniqueScopeIdx: uniqueIndex("conversation_summaries_unique_scope")
    .on(table.userId, sql`coalesce(${table.projectId}, '')`, sql`coalesce(${table.guideId}, '')`),
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
  notebooks: many(notebooks),
  projects: many(projects),
  projectLinks: many(projectLinks),
  pinnedContent: many(pinnedContent),
  chatMessages: many(chatMessages),
}));

export const notebooksRelations = relations(notebooks, ({ one, many }) => ({
  user: one(users, {
    fields: [notebooks.userId],
    references: [users.id],
  }),
  characters: many(characters),
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
  settings: many(settings),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [characters.notebookId],
    references: [notebooks.id],
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
  notebook: one(notebooks, {
    fields: [settings.notebookId],
    references: [notebooks.id],
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
  notebook: one(notebooks, {
    fields: [savedItems.notebookId],
    references: [notebooks.id],
  }),
}));

// Add relations for all new content types
export const locationsRelations = relations(locations, ({ one }) => ({
  user: one(users, {
    fields: [locations.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [locations.notebookId],
    references: [notebooks.id],
  }),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  user: one(users, {
    fields: [items.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [items.notebookId],
    references: [notebooks.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ one }) => ({
  user: one(users, {
    fields: [organizations.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [organizations.notebookId],
    references: [notebooks.id],
  }),
}));

export const speciesRelations = relations(species, ({ one }) => ({
  user: one(users, {
    fields: [species.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [species.notebookId],
    references: [notebooks.id],
  }),
}));

export const ethnicitiesRelations = relations(ethnicities, ({ one }) => ({
  user: one(users, {
    fields: [ethnicities.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [ethnicities.notebookId],
    references: [notebooks.id],
  }),
}));

export const culturesRelations = relations(cultures, ({ one }) => ({
  user: one(users, {
    fields: [cultures.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [cultures.notebookId],
    references: [notebooks.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [documents.notebookId],
    references: [notebooks.id],
  }),
}));

export const foodsRelations = relations(foods, ({ one }) => ({
  user: one(users, {
    fields: [foods.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [foods.notebookId],
    references: [notebooks.id],
  }),
}));

export const drinksRelations = relations(drinks, ({ one }) => ({
  user: one(users, {
    fields: [drinks.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [drinks.notebookId],
    references: [notebooks.id],
  }),
}));

export const weaponsRelations = relations(weapons, ({ one }) => ({
  user: one(users, {
    fields: [weapons.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [weapons.notebookId],
    references: [notebooks.id],
  }),
}));

export const armorRelations = relations(armor, ({ one }) => ({
  user: one(users, {
    fields: [armor.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [armor.notebookId],
    references: [notebooks.id],
  }),
}));

export const religionsRelations = relations(religions, ({ one }) => ({
  user: one(users, {
    fields: [religions.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [religions.notebookId],
    references: [notebooks.id],
  }),
}));

export const languagesRelations = relations(languages, ({ one }) => ({
  user: one(users, {
    fields: [languages.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [languages.notebookId],
    references: [notebooks.id],
  }),
}));

export const accessoriesRelations = relations(accessories, ({ one }) => ({
  user: one(users, {
    fields: [accessories.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [accessories.notebookId],
    references: [notebooks.id],
  }),
}));

export const clothingRelations = relations(clothing, ({ one }) => ({
  user: one(users, {
    fields: [clothing.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [clothing.notebookId],
    references: [notebooks.id],
  }),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  user: one(users, {
    fields: [materials.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [materials.notebookId],
    references: [notebooks.id],
  }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  user: one(users, {
    fields: [settlements.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [settlements.notebookId],
    references: [notebooks.id],
  }),
}));

export const societiesRelations = relations(societies, ({ one }) => ({
  user: one(users, {
    fields: [societies.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [societies.notebookId],
    references: [notebooks.id],
  }),
}));

export const factionsRelations = relations(factions, ({ one }) => ({
  user: one(users, {
    fields: [factions.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [factions.notebookId],
    references: [notebooks.id],
  }),
}));

export const militaryUnitsRelations = relations(militaryUnits, ({ one }) => ({
  user: one(users, {
    fields: [militaryUnits.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [militaryUnits.notebookId],
    references: [notebooks.id],
  }),
}));

export const mythsRelations = relations(myths, ({ one }) => ({
  user: one(users, {
    fields: [myths.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [myths.notebookId],
    references: [notebooks.id],
  }),
}));

export const legendsRelations = relations(legends, ({ one }) => ({
  user: one(users, {
    fields: [legends.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [legends.notebookId],
    references: [notebooks.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [events.notebookId],
    references: [notebooks.id],
  }),
}));

export const technologiesRelations = relations(technologies, ({ one }) => ({
  user: one(users, {
    fields: [technologies.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [technologies.notebookId],
    references: [notebooks.id],
  }),
}));

export const spellsRelations = relations(spells, ({ one }) => ({
  user: one(users, {
    fields: [spells.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [spells.notebookId],
    references: [notebooks.id],
  }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  user: one(users, {
    fields: [resources.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [resources.notebookId],
    references: [notebooks.id],
  }),
}));

export const buildingsRelations = relations(buildings, ({ one }) => ({
  user: one(users, {
    fields: [buildings.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [buildings.notebookId],
    references: [notebooks.id],
  }),
}));

export const animalsRelations = relations(animals, ({ one }) => ({
  user: one(users, {
    fields: [animals.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [animals.notebookId],
    references: [notebooks.id],
  }),
}));

export const transportationRelations = relations(transportation, ({ one }) => ({
  user: one(users, {
    fields: [transportation.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [transportation.notebookId],
    references: [notebooks.id],
  }),
}));

export const naturalLawsRelations = relations(naturalLaws, ({ one }) => ({
  user: one(users, {
    fields: [naturalLaws.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [naturalLaws.notebookId],
    references: [notebooks.id],
  }),
}));

export const traditionsRelations = relations(traditions, ({ one }) => ({
  user: one(users, {
    fields: [traditions.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [traditions.notebookId],
    references: [notebooks.id],
  }),
}));

export const ritualsRelations = relations(rituals, ({ one }) => ({
  user: one(users, {
    fields: [rituals.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [rituals.notebookId],
    references: [notebooks.id],
  }),
}));

export const familyTreesRelations = relations(familyTrees, ({ one, many }) => ({
  user: one(users, {
    fields: [familyTrees.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [familyTrees.notebookId],
    references: [notebooks.id],
  }),
  members: many(familyTreeMembers),
  relationships: many(familyTreeRelationships),
}));

export const familyTreeMembersRelations = relations(familyTreeMembers, ({ one }) => ({
  tree: one(familyTrees, {
    fields: [familyTreeMembers.treeId],
    references: [familyTrees.id],
  }),
  character: one(characters, {
    fields: [familyTreeMembers.characterId],
    references: [characters.id],
  }),
}));

export const familyTreeRelationshipsRelations = relations(familyTreeRelationships, ({ one }) => ({
  tree: one(familyTrees, {
    fields: [familyTreeRelationships.treeId],
    references: [familyTrees.id],
  }),
  fromMember: one(familyTreeMembers, {
    fields: [familyTreeRelationships.fromMemberId],
    references: [familyTreeMembers.id],
  }),
  toMember: one(familyTreeMembers, {
    fields: [familyTreeRelationships.toMemberId],
    references: [familyTreeMembers.id],
  }),
}));

export const timelinesRelations = relations(timelines, ({ one }) => ({
  user: one(users, {
    fields: [timelines.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [timelines.notebookId],
    references: [notebooks.id],
  }),
}));

export const ceremoniesRelations = relations(ceremonies, ({ one }) => ({
  user: one(users, {
    fields: [ceremonies.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [ceremonies.notebookId],
    references: [notebooks.id],
  }),
}));

export const mapsRelations = relations(maps, ({ one }) => ({
  user: one(users, {
    fields: [maps.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [maps.notebookId],
    references: [notebooks.id],
  }),
}));

export const musicRelations = relations(music, ({ one }) => ({
  user: one(users, {
    fields: [music.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [music.notebookId],
    references: [notebooks.id],
  }),
}));

export const dancesRelations = relations(dances, ({ one }) => ({
  user: one(users, {
    fields: [dances.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [dances.notebookId],
    references: [notebooks.id],
  }),
}));

export const lawsRelations = relations(laws, ({ one }) => ({
  user: one(users, {
    fields: [laws.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [laws.notebookId],
    references: [notebooks.id],
  }),
}));

export const policiesRelations = relations(policies, ({ one }) => ({
  user: one(users, {
    fields: [policies.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [policies.notebookId],
    references: [notebooks.id],
  }),
}));

export const potionsRelations = relations(potions, ({ one }) => ({
  user: one(users, {
    fields: [potions.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [potions.notebookId],
    references: [notebooks.id],
  }),
}));

export const professionsRelations = relations(professions, ({ one }) => ({
  user: one(users, {
    fields: [professions.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [professions.notebookId],
    references: [notebooks.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  folder: one(folders, {
    fields: [projects.folderId],
    references: [folders.id],
  }),
  links: many(projectLinks),
  notes: many(notes),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(users, {
    fields: [folders.userId],
    references: [users.id],
  }),
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
  }),
  children: many(folders),
  projects: many(projects),
  guides: many(guides),
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  folder: one(folders, {
    fields: [notes.folderId],
    references: [folders.id],
  }),
  project: one(projects, {
    fields: [notes.projectId],
    references: [projects.id],
  }),
  guide: one(guides, {
    fields: [notes.guideId],
    references: [guides.id],
  }),
}));

export const guidesRelations = relations(guides, ({ one, many }) => ({
  user: one(users, {
    fields: [guides.userId],
    references: [users.id],
  }),
  folder: one(folders, {
    fields: [guides.folderId],
    references: [folders.id],
  }),
  notes: many(notes),
}));

export const projectLinksRelations = relations(projectLinks, ({ one }) => ({
  user: one(users, {
    fields: [projectLinks.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [projectLinks.sourceId],
    references: [projects.id],
  }),
}));

export const pinnedContentRelations = relations(pinnedContent, ({ one }) => ({
  user: one(users, {
    fields: [pinnedContent.userId],
    references: [users.id],
  }),
}));

export const conversationThreadsRelations = relations(conversationThreads, ({ one, many }) => ({
  user: one(users, {
    fields: [conversationThreads.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [conversationThreads.projectId],
    references: [projects.id],
  }),
  guide: one(guides, {
    fields: [conversationThreads.guideId],
    references: [guides.id],
  }),
  parentThread: one(conversationThreads, {
    fields: [conversationThreads.parentThreadId],
    references: [conversationThreads.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  thread: one(conversationThreads, {
    fields: [chatMessages.threadId],
    references: [conversationThreads.id],
  }),
  project: one(projects, {
    fields: [chatMessages.projectId],
    references: [projects.id],
  }),
  guide: one(guides, {
    fields: [chatMessages.guideId],
    references: [guides.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertShareSchema = createInsertSchema(shares).omit({
  id: true,
  createdAt: true,
});

export const insertNotebookSchema = createInsertSchema(notebooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNotebookSchema = insertNotebookSchema.partial().omit({
  userId: true,
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

export const updatePlantSchema = insertPlantSchema.partial().omit({
  userId: true,
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
  updatedAt: true,
});

export const insertFamilyTreeMemberSchema = createInsertSchema(familyTreeMembers).omit({
  id: true,
  createdAt: true,
});

export const insertFamilyTreeRelationshipSchema = createInsertSchema(familyTreeRelationships).omit({
  id: true,
  createdAt: true,
});

export const insertTimelineSchema = createInsertSchema(timelines).omit({
  id: true,
  createdAt: true,
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimelineRelationshipSchema = createInsertSchema(timelineRelationships).omit({
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

export const insertRankSchema = createInsertSchema(ranks).omit({
  id: true,
  createdAt: true,
});

export const insertConditionSchema = createInsertSchema(conditions).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSectionSchema = createInsertSchema(projectSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectLinkSchema = createInsertSchema(projectLinks).omit({
  id: true,
  createdAt: true,
});

export const insertPinnedContentSchema = createInsertSchema(pinnedContent).omit({
  id: true,
  createdAt: true,
});

export const insertCanvasSchema = createInsertSchema(canvases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationThreadSchema = createInsertSchema(conversationThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActivityAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertShare = z.infer<typeof insertShareSchema>;
export type Share = typeof shares.$inferSelect;
export type InsertNotebook = z.infer<typeof insertNotebookSchema>;
export type UpdateNotebook = z.infer<typeof updateNotebookSchema>;
export type Notebook = typeof notebooks.$inferSelect;
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
export type UpdatePlant = z.infer<typeof updatePlantSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertDescription = z.infer<typeof insertDescriptionSchema>;
export type Description = typeof descriptions.$inferSelect;
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;
export type SavedItem = typeof savedItems.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProjectSection = z.infer<typeof insertProjectSectionSchema>;
export type ProjectSection = typeof projectSections.$inferSelect;

// Extended types for hierarchical project structure
export interface ProjectSectionWithChildren extends ProjectSection {
  children?: ProjectSectionWithChildren[];
}

export interface ProjectSectionUpdate {
  title?: string;
  content?: string;
  position?: number;
  parentId?: string | null;
}

export interface ProjectSectionReorder {
  id: string;
  parentId: string | null;
  position: number;
}

export interface ProjectWithSections extends Project {
  sections?: ProjectSectionWithChildren[];
}

export interface FlatProjectSection extends ProjectSection {
  depth: number;
  hasChildren: boolean;
  isExpanded?: boolean;
}

export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertProjectLink = z.infer<typeof insertProjectLinkSchema>;
export type ProjectLink = typeof projectLinks.$inferSelect;
export type InsertPinnedContent = z.infer<typeof insertPinnedContentSchema>;
export type PinnedContent = typeof pinnedContent.$inferSelect;
export type InsertCanvas = z.infer<typeof insertCanvasSchema>;
export type Canvas = typeof canvases.$inferSelect;
export type InsertConversationThread = z.infer<typeof insertConversationThreadSchema>;
export type ConversationThread = typeof conversationThreads.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

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
export type InsertFamilyTreeMember = z.infer<typeof insertFamilyTreeMemberSchema>;
export type FamilyTreeMember = typeof familyTreeMembers.$inferSelect;
export type InsertFamilyTreeRelationship = z.infer<typeof insertFamilyTreeRelationshipSchema>;
export type FamilyTreeRelationship = typeof familyTreeRelationships.$inferSelect;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;
export type Timeline = typeof timelines.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineRelationship = z.infer<typeof insertTimelineRelationshipSchema>;
export type TimelineRelationship = typeof timelineRelationships.$inferSelect;
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

export type InsertRank = z.infer<typeof insertRankSchema>;
export type Rank = typeof ranks.$inferSelect;

export type InsertCondition = z.infer<typeof insertConditionSchema>;
export type Condition = typeof conditions.$inferSelect;

// Banned Phrases - AI writing style guidelines
export const bannedPhrases = pgTable("banned_phrases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phrase: text("phrase").notNull(),
  category: text("category").notNull(), // 'forbidden_phrase', 'banned_transition', 'word_replacement', 'robotic_pattern'
  replacement: text("replacement"), // For word_replacement category, suggested alternatives
  isActive: boolean("is_active").default(true),
  notes: text("notes"), // Optional notes about why it's banned or when to use alternatives
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBannedPhraseSchema = createInsertSchema(bannedPhrases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBannedPhrase = z.infer<typeof insertBannedPhraseSchema>;
export type BannedPhrase = typeof bannedPhrases.$inferSelect;

// Import Jobs schemas and types
export const insertImportJobSchema = createInsertSchema(importJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const updateImportJobSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  progress: z.number().min(0).max(100).optional(),
  totalItems: z.number().optional(),
  processedItems: z.number().optional(),
  results: z.any().optional(),
  errorMessage: z.string().optional(),
  completedAt: z.date().optional(),
});

export type InsertImportJob = z.infer<typeof insertImportJobSchema>;
export type UpdateImportJob = z.infer<typeof updateImportJobSchema>;
export type ImportJob = typeof importJobs.$inferSelect;

// User Preferences schemas and types
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Conversation Summaries schemas and types
export const insertConversationSummarySchema = createInsertSchema(conversationSummaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConversationSummary = z.infer<typeof insertConversationSummarySchema>;
export type ConversationSummary = typeof conversationSummaries.$inferSelect;

// User Subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  tier: varchar("tier").notNull(), // 'free', 'author', 'professional', 'team'
  status: varchar("status").notNull(), // 'active', 'past_due', 'canceled', 'trialing'
  
  // Stripe Integration
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripePriceId: varchar("stripe_price_id"),
  
  // Billing Cycle
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  
  // Trial Management
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  
  // Pause Management
  pausedAt: timestamp("paused_at"),
  resumesAt: timestamp("resumes_at"),
  pauseReason: text("pause_reason"),
  
  // Grace Period Management (7-day warning before strict enforcement)
  gracePeriodStart: timestamp("grace_period_start"),
  gracePeriodEnd: timestamp("grace_period_end"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueStripeCustomer: uniqueIndex("user_subscriptions_stripe_customer_idx").on(table.stripeCustomerId),
  uniqueStripeSubscription: uniqueIndex("user_subscriptions_stripe_subscription_idx").on(table.stripeSubscriptionId),
}));

// AI Usage Logs
export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Usage Details
  operationType: varchar("operation_type").notNull(), // 'character_gen', 'chat', 'edit', 'proofread', etc.
  model: varchar("model").notNull(), // 'claude-sonnet-4', 'claude-haiku-3-5'
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  cachedTokens: integer("cached_tokens").default(0),
  
  // Cost Calculation (in cents)
  estimatedCostCents: integer("estimated_cost_cents").notNull(),
  
  // Context
  projectId: varchar("project_id").references(() => projects.id, { onDelete: 'set null' }),
  notebookId: varchar("notebook_id").references(() => notebooks.id, { onDelete: 'set null' }),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userDateIdx: index("ai_usage_logs_user_date_idx").on(table.userId, table.createdAt),
  userOperationIdx: index("ai_usage_logs_user_operation_idx").on(table.userId, table.operationType),
}));

// Daily Usage Summaries (for performance)
export const aiUsageDailySummary = pgTable("ai_usage_daily_summary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text("date").notNull(), // Store as 'YYYY-MM-DD' text for easier querying
  
  // Aggregated Counts
  totalOperations: integer("total_operations").default(0),
  totalInputTokens: integer("total_input_tokens").default(0),
  totalOutputTokens: integer("total_output_tokens").default(0),
  totalCostCents: integer("total_cost_cents").default(0),
  
  // By Operation Type (JSONB for flexibility)
  operationsBreakdown: jsonb("operations_breakdown").default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueUserDate: uniqueIndex("ai_usage_daily_summary_user_date_idx").on(table.userId, table.date),
}));

// Team Memberships
export const teamMemberships = pgTable("team_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamSubscriptionId: varchar("team_subscription_id").notNull().references(() => userSubscriptions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar("role").notNull(), // 'owner', 'admin', 'member'
  
  // Permissions
  canEdit: boolean("can_edit").default(true),
  canComment: boolean("can_comment").default(true),
  canInvite: boolean("can_invite").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueTeamUser: uniqueIndex("team_memberships_team_user_idx").on(table.teamSubscriptionId, table.userId),
}));

// Team Invitations - Pending invites to join teams
export const teamInvitations = pgTable("team_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamSubscriptionId: varchar("team_subscription_id").notNull().references(() => userSubscriptions.id, { onDelete: 'cascade' }),
  email: varchar("email").notNull(),
  role: varchar("role").notNull(), // 'admin', 'member'
  
  // Permissions
  canEdit: boolean("can_edit").default(true),
  canComment: boolean("can_comment").default(true),
  canInvite: boolean("can_invite").default(false),
  
  // Invitation Details
  invitedBy: varchar("invited_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar("token").notNull().unique(), // Unique token for accepting invitation
  expiresAt: timestamp("expires_at").notNull(), // Invitations expire after 7 days
  
  // Status
  status: varchar("status").notNull().default('pending'), // 'pending', 'accepted', 'expired', 'revoked'
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  teamEmailIdx: uniqueIndex("team_invitations_team_email_idx").on(table.teamSubscriptionId, table.email).where(sql`${table.status} = 'pending'`),
  tokenIdx: index("team_invitations_token_idx").on(table.token),
}));

// Team Activity Feed - Track team member actions
export const teamActivity = pgTable("team_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamSubscriptionId: varchar("team_subscription_id").notNull().references(() => userSubscriptions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Activity Details
  activityType: varchar("activity_type").notNull(), // 'member_joined', 'member_removed', 'role_changed', 'content_created', 'content_edited', 'content_deleted'
  resourceType: varchar("resource_type"), // 'notebook', 'project', 'character', etc.
  resourceId: varchar("resource_id"),
  resourceName: text("resource_name"),
  
  // Additional Context
  metadata: jsonb("metadata").default({}), // Flexible field for activity-specific data
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  teamCreatedIdx: index("team_activity_team_created_idx").on(table.teamSubscriptionId, table.createdAt),
  userCreatedIdx: index("team_activity_user_created_idx").on(table.userId, table.createdAt),
}));

// Lifetime Deal Tracking
export const lifetimeSubscriptions = pgTable("lifetime_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Purchase Details
  purchaseDate: timestamp("purchase_date").defaultNow(),
  purchasePriceCents: integer("purchase_price_cents").notNull(),
  tierEquivalent: varchar("tier_equivalent").notNull(), // 'professional'
  
  // Usage Limits (for lifetime users)
  dailyGenerationLimit: integer("daily_generation_limit").default(50),
  
  // Status
  isActive: boolean("is_active").default(true),
}, (table) => ({
  uniqueUser: uniqueIndex("lifetime_subscriptions_user_idx").on(table.userId),
}));

// Billing Alerts - Payment failures and trial warnings
export const billingAlerts = pgTable("billing_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Alert Details
  type: varchar("type").notNull(), // 'payment_failed', 'trial_expiring', 'trial_expired', 'subscription_canceled', 'invoice_due'
  severity: varchar("severity").notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Related Resources
  stripeInvoiceId: varchar("stripe_invoice_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  
  // Status
  status: varchar("status").notNull().default('unread'), // 'unread', 'read', 'resolved', 'dismissed'
  dismissedAt: timestamp("dismissed_at"),
  resolvedAt: timestamp("resolved_at"),
  
  // Metadata
  metadata: jsonb("metadata").default({}), // Additional context (retry count, due amount, etc.)
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userStatusIdx: index("billing_alerts_user_status_idx").on(table.userId, table.status),
  typeIdx: index("billing_alerts_type_idx").on(table.type),
  createdAtIdx: index("billing_alerts_created_at_idx").on(table.createdAt),
}));

// Discount Codes - Promotional codes for subscription discounts
export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Code Details
  code: varchar("code").notNull().unique(), // The actual code users enter
  name: text("name").notNull(), // Admin-friendly name/description
  
  // Discount Type and Value
  type: varchar("type").notNull(), // 'percentage' or 'fixed'
  value: integer("value").notNull(), // Percentage (1-100) or cents for fixed
  
  // Applicable Tiers
  applicableTiers: text("applicable_tiers").array().notNull(), // ['professional', 'team'] - which tiers this code works for
  
  // Usage Limits
  maxUses: integer("max_uses"), // Null = unlimited
  currentUses: integer("current_uses").default(0).notNull(),
  maxUsesPerUser: integer("max_uses_per_user").default(1).notNull(), // How many times a single user can use this code
  
  // Duration (for percentage discounts with Stripe coupons)
  duration: varchar("duration").default('once'), // 'once', 'repeating', 'forever'
  durationInMonths: integer("duration_in_months"), // Required if duration is 'repeating'
  
  // Validity Period
  startsAt: timestamp("starts_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Null = no expiration
  
  // Status
  active: boolean("active").default(true).notNull(),
  
  // Stripe Integration
  stripeCouponId: varchar("stripe_coupon_id"), // Linked Stripe coupon for percentage discounts
  
  // Metadata
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }), // Admin who created this
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  codeIdx: index("discount_codes_code_idx").on(table.code),
  activeIdx: index("discount_codes_active_idx").on(table.active),
  expiresAtIdx: index("discount_codes_expires_at_idx").on(table.expiresAt),
}));

// Discount Code Usage - Track who used which codes
export const discountCodeUsage = pgTable("discount_code_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  discountCodeId: varchar("discount_code_id").notNull().references(() => discountCodes.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: varchar("subscription_id").references(() => userSubscriptions.id, { onDelete: 'set null' }),
  
  // Discount Applied
  discountAmount: integer("discount_amount").notNull(), // Amount saved in cents
  
  usedAt: timestamp("used_at").defaultNow(),
}, (table) => ({
  userCodeIdx: index("discount_code_usage_user_code_idx").on(table.userId, table.discountCodeId),
  discountCodeIdx: index("discount_code_usage_code_idx").on(table.discountCodeId),
}));

// API Keys - Programmatic access for Professional+ users
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Key Details
  name: text("name").notNull(), // User-friendly name for the key
  keyHash: text("key_hash").notNull(), // Bcrypt hash of the actual key (never store plaintext)
  prefix: varchar("prefix", { length: 16 }).notNull(), // First 16 chars for display (e.g., "wc_live_abc12345...")
  
  // Permissions & Scoping
  scope: varchar("scope").notNull().default('read'), // 'read', 'write', 'admin'
  allowedEndpoints: text("allowed_endpoints").array(), // Null = all endpoints, or specific endpoints like ['/api/v1/projects', '/api/v1/characters']
  
  // Rate Limiting (Professional: 5,000/month, Team: 25,000/month)
  monthlyRateLimit: integer("monthly_rate_limit").notNull().default(5000),
  currentMonthUsage: integer("current_month_usage").default(0).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  usageResetDate: timestamp("usage_reset_date").notNull(), // Reset on this date each month
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"), // Null = no expiration
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  
  // Security
  lastRotatedAt: timestamp("last_rotated_at"),
  ipWhitelist: text("ip_whitelist").array(), // Null = any IP, or specific IPs
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userActiveIdx: index("api_keys_user_active_idx").on(table.userId, table.isActive),
  prefixIdx: index("api_keys_prefix_idx").on(table.prefix),
  keyHashIdx: index("api_keys_key_hash_idx").on(table.keyHash),
}));

// API Key Usage Logs - Detailed request tracking
export const apiKeyUsageLogs = pgTable("api_key_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKeyId: varchar("api_key_id").notNull().references(() => apiKeys.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Request Details
  endpoint: text("endpoint").notNull(), // e.g., '/api/v1/projects'
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, PUT, DELETE
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"), // In milliseconds
  
  // Context
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  
  // Error tracking
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  keyDateIdx: index("api_key_usage_logs_key_date_idx").on(table.apiKeyId, table.createdAt),
  userDateIdx: index("api_key_usage_logs_user_date_idx").on(table.userId, table.createdAt),
  endpointIdx: index("api_key_usage_logs_endpoint_idx").on(table.endpoint),
}));

// Intrusion Detection System (IDS) Tables

// Track intrusion attempts and suspicious activity
export const intrusionAttempts = pgTable("intrusion_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Identity
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }), // Nullable - attacker might not be authenticated
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  
  // Attack Details
  attackType: varchar("attack_type").notNull(), // 'BRUTE_FORCE', 'SQL_INJECTION', 'XSS', 'UNAUTHORIZED_ACCESS', 'RATE_LIMIT_EXCEEDED'
  endpoint: text("endpoint"), // Which endpoint was targeted
  payload: text("payload"), // Sanitized/logged attack payload for analysis
  severity: varchar("severity").notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  
  // Response
  blocked: boolean("blocked").default(false), // Whether request was blocked
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  ipAddressIdx: index("intrusion_attempts_ip_idx").on(table.ipAddress),
  attackTypeIdx: index("intrusion_attempts_type_idx").on(table.attackType),
  severityIdx: index("intrusion_attempts_severity_idx").on(table.severity),
  createdAtIdx: index("intrusion_attempts_created_at_idx").on(table.createdAt),
}));

// Track blocked IPs
export const ipBlocks = pgTable("ip_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: varchar("ip_address").notNull(),
  reason: text("reason").notNull(), // Why this IP was blocked
  severity: varchar("severity").notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  
  // Blocking Details
  blockedAt: timestamp("blocked_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Null means permanent block
  isActive: boolean("is_active").default(true),
  
  // Reference to intrusion attempts
  intrusionAttemptId: varchar("intrusion_attempt_id").references(() => intrusionAttempts.id, { onDelete: 'set null' }),
  
  // Manual vs Automatic
  autoBlocked: boolean("auto_blocked").default(true), // True if blocked by IDS, false if manual admin block
  blockedBy: varchar("blocked_by").references(() => users.id, { onDelete: 'set null' }), // Admin who manually blocked (if applicable)
}, (table) => ({
  uniqueActiveIp: uniqueIndex("ip_blocks_unique_active_ip_idx").on(table.ipAddress).where(sql`${table.isActive} = true`),
  ipAddressIdx: index("ip_blocks_ip_idx").on(table.ipAddress),
  expiresAtIdx: index("ip_blocks_expires_at_idx").on(table.expiresAt),
}));

// Security Alerts for Admin Dashboard
export const securityAlerts = pgTable("security_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Alert Details
  alertType: varchar("alert_type").notNull(), // 'MULTIPLE_FAILED_LOGINS', 'SUSPICIOUS_PATTERN', 'IP_BLOCKED', 'PRIVILEGE_ESCALATION'
  severity: varchar("severity").notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  message: text("message").notNull(),
  details: jsonb("details"), // Additional context (IP, user, patterns detected, etc.)
  
  // Status
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id, { onDelete: 'set null' }),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  severityIdx: index("security_alerts_severity_idx").on(table.severity),
  acknowledgedIdx: index("security_alerts_acknowledged_idx").on(table.acknowledged),
  createdAtIdx: index("security_alerts_created_at_idx").on(table.createdAt),
}));

// API Key Rotation Tracking
export const apiKeyRotations = pgTable("api_key_rotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Key Identification
  keyName: varchar("key_name").notNull().unique(), // e.g., 'ANTHROPIC_API_KEY', 'MFA_ENCRYPTION_KEY', 'OPENAI_API_KEY'
  keyType: varchar("key_type").notNull(), // 'external_api', 'encryption', 'signing', 'database'
  description: text("description"), // Human-readable description of the key's purpose
  
  // Rotation Schedule
  rotationIntervalDays: integer("rotation_interval_days").notNull().default(90), // Default 90 days
  lastRotatedAt: timestamp("last_rotated_at").defaultNow(),
  nextRotationDue: timestamp("next_rotation_due").notNull(),
  
  // Status and Notifications
  rotationStatus: varchar("rotation_status").notNull().default('current'), // 'current', 'due', 'overdue', 'rotated'
  notificationSent: boolean("notification_sent").default(false),
  lastNotificationSentAt: timestamp("last_notification_sent_at"),
  
  // Rotation History
  rotationCount: integer("rotation_count").default(0),
  lastRotatedBy: varchar("last_rotated_by").references(() => users.id, { onDelete: 'set null' }),
  
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  nextRotationIdx: index("api_key_rotations_next_rotation_idx").on(table.nextRotationDue),
  statusIdx: index("api_key_rotations_status_idx").on(table.rotationStatus),
}));

// API Key Rotation Audit Log
export const apiKeyRotationAudit = pgTable("api_key_rotation_audit", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Reference
  keyRotationId: varchar("key_rotation_id").notNull().references(() => apiKeyRotations.id, { onDelete: 'cascade' }),
  
  // Rotation Details
  action: varchar("action").notNull(), // 'created', 'rotated', 'notification_sent', 'skipped', 'failed'
  performedBy: varchar("performed_by").references(() => users.id, { onDelete: 'set null' }), // Admin who performed action
  notes: text("notes"),
  
  // Metadata
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => ({
  keyRotationIdx: index("api_key_rotation_audit_key_idx").on(table.keyRotationId),
  timestampIdx: index("api_key_rotation_audit_timestamp_idx").on(table.timestamp),
}));

// Insert schemas and types for subscription tables
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAiUsageDailySummarySchema = createInsertSchema(aiUsageDailySummary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMembershipSchema = createInsertSchema(teamMemberships).omit({
  id: true,
  createdAt: true,
});

export const insertLifetimeSubscriptionSchema = createInsertSchema(lifetimeSubscriptions).omit({
  id: true,
  purchaseDate: true,
});

export const insertTeamInvitationSchema = createInsertSchema(teamInvitations).omit({
  id: true,
  createdAt: true,
});

export const insertTeamActivitySchema = createInsertSchema(teamActivity).omit({
  id: true,
  createdAt: true,
});

export const insertBillingAlertSchema = createInsertSchema(billingAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  currentUses: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  code: z.string().min(3).max(50).toUpperCase(),
  value: z.number().min(1),
  applicableTiers: z.array(z.enum(['professional', 'team'])).min(1),
});

export const insertDiscountCodeUsageSchema = createInsertSchema(discountCodeUsage).omit({
  id: true,
  usedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  keyHash: true, // Never set hash directly, use service to generate
  prefix: true, // Generated by service
  currentMonthUsage: true,
  lastUsedAt: true,
  usageResetDate: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1).max(100),
  scope: z.enum(['read', 'write', 'admin']).default('read'),
});

export const insertApiKeyUsageLogSchema = createInsertSchema(apiKeyUsageLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;
export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertAiUsageDailySummary = z.infer<typeof insertAiUsageDailySummarySchema>;
export type AiUsageDailySummary = typeof aiUsageDailySummary.$inferSelect;
export type InsertTeamMembership = z.infer<typeof insertTeamMembershipSchema>;
export type TeamMembership = typeof teamMemberships.$inferSelect;
export type InsertLifetimeSubscription = z.infer<typeof insertLifetimeSubscriptionSchema>;
export type LifetimeSubscription = typeof lifetimeSubscriptions.$inferSelect;
export type InsertTeamInvitation = z.infer<typeof insertTeamInvitationSchema>;
export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamActivity = z.infer<typeof insertTeamActivitySchema>;
export type TeamActivity = typeof teamActivity.$inferSelect;
export type InsertBillingAlert = z.infer<typeof insertBillingAlertSchema>;
export type BillingAlert = typeof billingAlerts.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCodeUsage = z.infer<typeof insertDiscountCodeUsageSchema>;
export type DiscountCodeUsage = typeof discountCodeUsage.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKeyUsageLog = z.infer<typeof insertApiKeyUsageLogSchema>;
export type ApiKeyUsageLog = typeof apiKeyUsageLogs.$inferSelect;

// IDS schemas and types
export const insertIntrusionAttemptSchema = createInsertSchema(intrusionAttempts).omit({
  id: true,
  createdAt: true,
});

export const insertIpBlockSchema = createInsertSchema(ipBlocks).omit({
  id: true,
  blockedAt: true,
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts).omit({
  id: true,
  createdAt: true,
});

export type InsertIntrusionAttempt = z.infer<typeof insertIntrusionAttemptSchema>;
export type IntrusionAttempt = typeof intrusionAttempts.$inferSelect;
export type InsertIpBlock = z.infer<typeof insertIpBlockSchema>;
export type IpBlock = typeof ipBlocks.$inferSelect;
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
export type SecurityAlert = typeof securityAlerts.$inferSelect;

// API Key Rotation schemas and types
export const insertApiKeyRotationSchema = createInsertSchema(apiKeyRotations).omit({
  id: true,
  lastRotatedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeyRotationAuditSchema = createInsertSchema(apiKeyRotationAudit).omit({
  id: true,
  timestamp: true,
});

export type InsertApiKeyRotation = z.infer<typeof insertApiKeyRotationSchema>;
export type ApiKeyRotation = typeof apiKeyRotations.$inferSelect;
export type InsertApiKeyRotationAudit = z.infer<typeof insertApiKeyRotationAuditSchema>;
export type ApiKeyRotationAudit = typeof apiKeyRotationAudit.$inferSelect;
