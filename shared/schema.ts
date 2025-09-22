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
  name: text("name").notNull(),
  age: integer("age").notNull(),
  occupation: text("occupation").notNull(),
  personality: text("personality").array().notNull(),
  backstory: text("backstory").notNull(),
  motivation: text("motivation").notNull(),
  flaw: text("flaw").notNull(),
  strength: text("strength").notNull(),
  gender: text("gender"),
  genre: text("genre"),
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

// User saved items (favorites)
export const savedItems = pgTable("saved_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemType: text("item_type").notNull(), // 'character', 'plot', 'prompt', 'guide'
  itemId: varchar("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserItem: sql`UNIQUE(${table.userId}, ${table.itemType}, ${table.itemId})`
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
  savedItems: many(savedItems),
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

export const savedItemsRelations = relations(savedItems, ({ one }) => ({
  user: one(users, {
    fields: [savedItems.userId],
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

export const insertSavedItemSchema = createInsertSchema(savedItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
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
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;
export type SavedItem = typeof savedItems.$inferSelect;
