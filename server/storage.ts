import { 
  type User, type InsertUser, 
  type Character, type UpdateCharacter, type InsertCharacter,
  type Plot, type InsertPlot,
  type Prompt, type InsertPrompt,
  type Location, type InsertLocation,
  type Setting, type InsertSetting,
  type Item, type InsertItem,
  type Organization, type InsertOrganization,
  type Creature, type InsertCreature,
  type Species, type InsertSpecies,
  type Culture, type InsertCulture,
  type Document, type InsertDocument,
  type Food, type InsertFood,
  type Language, type InsertLanguage,
  type Religion, type InsertReligion,
  type Technology, type InsertTechnology,
  type Weapon, type InsertWeapon,
  type Profession, type InsertProfession,
  type SavedItem, type InsertSavedItem,
  type GeneratedName, type InsertName,
  type Theme, type InsertTheme,
  type Mood, type InsertMood,
  type Conflict, type InsertConflict,
  type InsertGuide, type Guide,
  type Manuscript, type InsertManuscript,
  type ManuscriptLink, type InsertManuscriptLink,
  users, characters, 
  plots, prompts, locations, settings, items, organizations,
  creatures, species, cultures, documents, foods,
  languages, religions, technologies, weapons, professions,
  savedItems, names, themes, moods, conflicts, guides, manuscripts, manuscriptLinks,
  type PinnedContent, type InsertPinnedContent, pinnedContent
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, isNull, sql } from "drizzle-orm";

// Types for content mapping
export interface ContentMapping {
  id: string;
  apiBase: string;
  label: string;
  pluralLabel: string;
  description: string;
}

// Content type storage interface
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Character methods
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(id: string): Promise<Character | undefined>;
  getUserCharacters(userId: string | null): Promise<Character[]>;
  updateCharacter(id: string, updates: UpdateCharacter): Promise<Character>;
  
  // Plot methods
  createPlot(plot: InsertPlot): Promise<Plot>;
  getPlot(id: string): Promise<Plot | undefined>;
  getUserPlots(userId: string | null): Promise<Plot[]>;
  
  // Prompt methods
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPrompt(id: string): Promise<Prompt | undefined>;
  getUserPrompts(userId: string | null): Promise<Prompt[]>;
  getRandomPrompts(count?: number): Promise<Prompt[]>;
  
  // Location methods
  createLocation(location: InsertLocation): Promise<Location>;
  getLocation(id: string): Promise<Location | undefined>;
  getUserLocations(userId: string | null): Promise<Location[]>;
  updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;

  // Setting methods
  createSetting(setting: InsertSetting): Promise<Setting>;
  getSetting(id: string): Promise<Setting | undefined>;
  getUserSettings(userId: string | null): Promise<Setting[]>;

  // Item methods  
  createItem(item: InsertItem): Promise<Item>;
  getItem(id: string): Promise<Item | undefined>;
  getUserItems(userId: string | null): Promise<Item[]>;
  updateItem(id: string, updates: Partial<InsertItem>): Promise<Item>;
  deleteItem(id: string): Promise<void>;

  // Organization methods
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getUserOrganizations(userId: string | null): Promise<Organization[]>;
  updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization>;
  deleteOrganization(id: string): Promise<void>;

  // Creature methods
  createCreature(creature: InsertCreature): Promise<Creature>;
  getCreature(id: string): Promise<Creature | undefined>;
  getUserCreatures(userId: string | null): Promise<Creature[]>;
  updateCreature(id: string, updates: Partial<InsertCreature>): Promise<Creature>;

  // Species methods
  createSpecies(species: InsertSpecies): Promise<Species>;
  getSpecies(id: string): Promise<Species | undefined>;
  getUserSpecies(userId: string | null): Promise<Species[]>;
  updateSpecies(id: string, updates: Partial<InsertSpecies>): Promise<Species>;
  deleteSpecies(id: string): Promise<void>;

  // Culture methods
  createCulture(culture: InsertCulture): Promise<Culture>;
  getCulture(id: string): Promise<Culture | undefined>;
  getUserCultures(userId: string | null): Promise<Culture[]>;
  updateCulture(id: string, updates: Partial<InsertCulture>): Promise<Culture>;
  deleteCulture(id: string): Promise<void>;

  // Magic system methods
  createMagic(magic: any): Promise<any>;
  getMagic(id: string): Promise<any | undefined>;
  getUserMagic(userId: string | null): Promise<any[]>;
  updateMagic(id: string, updates: any): Promise<any>;

  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getUserDocuments(userId: string | null): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Food methods
  createFood(food: InsertFood): Promise<Food>;
  getFood(id: string): Promise<Food | undefined>;
  getUserFoods(userId: string | null): Promise<Food[]>;
  updateFood(id: string, updates: Partial<InsertFood>): Promise<Food>;
  deleteFood(id: string): Promise<void>;

  // Language methods
  createLanguage(language: InsertLanguage): Promise<Language>;
  getLanguage(id: string): Promise<Language | undefined>;
  getUserLanguages(userId: string | null): Promise<Language[]>;
  updateLanguage(id: string, updates: Partial<InsertLanguage>): Promise<Language>;
  deleteLanguage(id: string): Promise<void>;

  // Religion methods
  createReligion(religion: InsertReligion): Promise<Religion>;
  getReligion(id: string): Promise<Religion | undefined>;
  getUserReligions(userId: string | null): Promise<Religion[]>;
  updateReligion(id: string, updates: Partial<InsertReligion>): Promise<Religion>;
  deleteReligion(id: string): Promise<void>;

  // Technology methods
  createTechnology(technology: InsertTechnology): Promise<Technology>;
  getTechnology(id: string): Promise<Technology | undefined>;
  getUserTechnologies(userId: string | null): Promise<Technology[]>;
  updateTechnology(id: string, updates: Partial<InsertTechnology>): Promise<Technology>;
  deleteTechnology(id: string): Promise<void>;

  // Weapon methods
  createWeapon(weapon: InsertWeapon): Promise<Weapon>;
  getWeapon(id: string): Promise<Weapon | undefined>;
  getUserWeapons(userId: string | null): Promise<Weapon[]>;
  updateWeapon(id: string, updates: Partial<InsertWeapon>): Promise<Weapon>;
  deleteWeapon(id: string): Promise<void>;

  // Vehicle methods
  createVehicle(vehicle: any): Promise<any>;
  getVehicle(id: string): Promise<any | undefined>;
  getUserVehicles(userId: string | null): Promise<any[]>;
  updateVehicle(id: string, updates: any): Promise<any>;

  // Profession methods
  createProfession(profession: InsertProfession): Promise<Profession>;
  getProfession(id: string): Promise<Profession | undefined>;
  getUserProfessions(userId: string | null): Promise<Profession[]>;
  updateProfession(id: string, updates: Partial<InsertProfession>): Promise<Profession>;
  deleteProfession(id: string): Promise<void>;

  // Name generator methods
  createName(name: InsertName): Promise<GeneratedName>;
  getName(id: string): Promise<GeneratedName | undefined>;
  getUserNames(userId: string | null): Promise<GeneratedName[]>;

  // Theme methods
  createTheme(theme: InsertTheme): Promise<Theme>;
  getTheme(id: string): Promise<Theme | undefined>;
  getUserThemes(userId: string | null): Promise<Theme[]>;

  // Mood methods
  createMood(mood: InsertMood): Promise<Mood>;
  getMood(id: string): Promise<Mood | undefined>;
  getUserMoods(userId: string | null): Promise<Mood[]>;

  // Conflict methods
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  getConflict(id: string): Promise<Conflict | undefined>;
  getUserConflicts(userId: string | null): Promise<Conflict[]>;

  // Guide methods
  createGuide(guide: InsertGuide): Promise<Guide>;
  getGuide(id: string): Promise<Guide | undefined>;
  getGuides(category?: string): Promise<Guide[]>;
  searchGuides(query: string, category?: string): Promise<Guide[]>;
  updateGuide(id: string, updates: Partial<InsertGuide>): Promise<Guide | undefined>;
  deleteGuide(id: string): Promise<boolean>;

  // Saved item methods
  saveItem(savedItem: InsertSavedItem): Promise<SavedItem>;
  unsaveItem(userId: string, itemType: string, itemId: string): Promise<void>;
  getUserSavedItems(userId: string, itemType?: string): Promise<SavedItem[]>;
  isItemSaved(userId: string, itemType: string, itemId: string): Promise<boolean>;

  // Manuscript methods
  createManuscript(manuscript: InsertManuscript): Promise<Manuscript>;
  getManuscript(id: string, userId: string): Promise<Manuscript | undefined>;
  getUserManuscripts(userId: string): Promise<Manuscript[]>;
  updateManuscript(id: string, userId: string, updates: Partial<InsertManuscript>): Promise<Manuscript>;
  deleteManuscript(id: string, userId: string): Promise<void>;
  searchManuscripts(userId: string, query: string): Promise<Manuscript[]>;
  
  // Universal search method
  searchAllContent(userId: string, query: string): Promise<any[]>;

  // Manuscript links methods
  createManuscriptLink(link: InsertManuscriptLink): Promise<ManuscriptLink>;
  getManuscriptLinks(manuscriptId: string, userId: string): Promise<ManuscriptLink[]>;
  getManuscriptLinksForUser(userId: string): Promise<ManuscriptLink[]>;
  deleteManuscriptLink(id: string, userId: string): Promise<void>;
  findLinksToContent(targetType: string, targetId: string, userId: string): Promise<ManuscriptLink[]>;

  // Pinned content methods
  pinContent(pin: InsertPinnedContent): Promise<PinnedContent>;
  unpinContent(userId: string, itemType: string, itemId: string): Promise<void>;
  getUserPinnedContent(userId: string, category?: string): Promise<PinnedContent[]>;
  reorderPinnedContent(userId: string, itemId: string, newOrder: number): Promise<void>;
  isContentPinned(userId: string, itemType: string, itemId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Character methods
  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db
      .insert(characters)
      .values(character)
      .returning();
    return newCharacter;
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }

  async getUserCharacters(userId: string | null): Promise<Character[]> {
    if (userId) {
      return await db.select().from(characters)
        .where(eq(characters.userId, userId))
        .orderBy(desc(characters.createdAt));
    }
    return await db.select().from(characters)
      .orderBy(desc(characters.createdAt))
      .limit(10);
  }

  async updateCharacter(id: string, updates: UpdateCharacter): Promise<Character> {
    const [updatedCharacter] = await db
      .update(characters)
      .set(updates)
      .where(eq(characters.id, id))
      .returning();
    return updatedCharacter;
  }
  
  // Plot methods
  async createPlot(plot: InsertPlot): Promise<Plot> {
    const [newPlot] = await db
      .insert(plots)
      .values(plot)
      .returning();
    return newPlot;
  }

  async getPlot(id: string): Promise<Plot | undefined> {
    const [plot] = await db.select().from(plots).where(eq(plots.id, id));
    return plot || undefined;
  }

  async getUserPlots(userId: string | null): Promise<Plot[]> {
    if (userId) {
      return await db.select().from(plots)
        .where(eq(plots.userId, userId))
        .orderBy(desc(plots.createdAt));
    }
    return await db.select().from(plots)
      .orderBy(desc(plots.createdAt))
      .limit(10);
  }
  
  // Prompt methods
  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [newPrompt] = await db
      .insert(prompts)
      .values(prompt)
      .returning();
    return newPrompt;
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt || undefined;
  }

  async getUserPrompts(userId: string | null): Promise<Prompt[]> {
    if (userId) {
      return await db.select().from(prompts)
        .where(eq(prompts.userId, userId))
        .orderBy(desc(prompts.createdAt));
    }
    return await db.select().from(prompts)
      .orderBy(desc(prompts.createdAt))
      .limit(10);
  }

  async getRandomPrompts(count = 5): Promise<Prompt[]> {
    return await db.select().from(prompts)
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }
  
  // Location methods
  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db
      .insert(locations)
      .values(location)
      .returning();
    return newLocation;
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async getUserLocations(userId: string | null): Promise<Location[]> {
    if (userId) {
      return await db.select().from(locations)
        .where(eq(locations.userId, userId))
        .orderBy(desc(locations.createdAt));
    }
    return await db.select().from(locations)
      .orderBy(desc(locations.createdAt))
      .limit(10);
  }

  async updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location> {
    const [updatedLocation] = await db
      .update(locations)
      .set(updates)
      .where(eq(locations.id, id))
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  // Setting methods
  async createSetting(setting: InsertSetting): Promise<Setting> {
    const [newSetting] = await db
      .insert(settings)
      .values(setting)
      .returning();
    return newSetting;
  }

  async getSetting(id: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.id, id));
    return setting || undefined;
  }

  async getUserSettings(userId: string | null): Promise<Setting[]> {
    if (userId) {
      return await db.select().from(settings)
        .where(eq(settings.userId, userId))
        .orderBy(desc(settings.createdAt));
    }
    return await db.select().from(settings)
      .orderBy(desc(settings.createdAt))
      .limit(10);
  }

  // Item methods
  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    return newItem;
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async getUserItems(userId: string | null): Promise<Item[]> {
    if (userId) {
      return await db.select().from(items)
        .where(eq(items.userId, userId))
        .orderBy(desc(items.createdAt));
    }
    return await db.select().from(items)
      .orderBy(desc(items.createdAt))
      .limit(10);
  }

  async updateItem(id: string, updates: Partial<InsertItem>): Promise<Item> {
    const [updatedItem] = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  // Organization methods
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [newOrganization] = await db
      .insert(organizations)
      .values(organization)
      .returning();
    return newOrganization;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization || undefined;
  }

  async getUserOrganizations(userId: string | null): Promise<Organization[]> {
    if (userId) {
      return await db.select().from(organizations)
        .where(eq(organizations.userId, userId))
        .orderBy(desc(organizations.createdAt));
    }
    return await db.select().from(organizations)
      .orderBy(desc(organizations.createdAt))
      .limit(10);
  }

  async updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization> {
    const [updatedOrganization] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, id))
      .returning();
    return updatedOrganization;
  }

  async deleteOrganization(id: string): Promise<void> {
    await db.delete(organizations).where(eq(organizations.id, id));
  }

  // Creature methods
  async createCreature(creature: InsertCreature): Promise<Creature> {
    const [newCreature] = await db
      .insert(creatures)
      .values(creature)
      .returning();
    return newCreature;
  }

  async getCreature(id: string): Promise<Creature | undefined> {
    const [creature] = await db.select().from(creatures).where(eq(creatures.id, id));
    return creature || undefined;
  }

  async getUserCreatures(userId: string | null): Promise<Creature[]> {
    if (userId) {
      return await db.select().from(creatures)
        .where(eq(creatures.userId, userId))
        .orderBy(desc(creatures.createdAt));
    }
    return await db.select().from(creatures)
      .orderBy(desc(creatures.createdAt))
      .limit(10);
  }

  async updateCreature(id: string, updates: Partial<InsertCreature>): Promise<Creature> {
    const [updatedCreature] = await db
      .update(creatures)
      .set(updates)
      .where(eq(creatures.id, id))
      .returning();
    return updatedCreature;
  }

  // Species methods
  async createSpecies(speciesData: InsertSpecies): Promise<Species> {
    const [newSpecies] = await db
      .insert(species)
      .values(speciesData)
      .returning();
    return newSpecies;
  }

  async getSpecies(id: string): Promise<Species | undefined> {
    const [sp] = await db.select().from(species).where(eq(species.id, id));
    return sp || undefined;
  }

  async getUserSpecies(userId: string | null): Promise<Species[]> {
    if (userId) {
      return await db.select().from(species)
        .where(eq(species.userId, userId))
        .orderBy(desc(species.createdAt));
    }
    return await db.select().from(species)
      .orderBy(desc(species.createdAt))
      .limit(10);
  }

  async updateSpecies(id: string, updates: Partial<InsertSpecies>): Promise<Species> {
    const [updatedSpecies] = await db
      .update(species)
      .set(updates)
      .where(eq(species.id, id))
      .returning();
    return updatedSpecies;
  }

  async deleteSpecies(id: string): Promise<void> {
    await db.delete(species).where(eq(species.id, id));
  }

  // Culture methods
  async createCulture(culture: InsertCulture): Promise<Culture> {
    const [newCulture] = await db
      .insert(cultures)
      .values(culture)
      .returning();
    return newCulture;
  }

  async getCulture(id: string): Promise<Culture | undefined> {
    const [culture] = await db.select().from(cultures).where(eq(cultures.id, id));
    return culture || undefined;
  }

  async getUserCultures(userId: string | null): Promise<Culture[]> {
    if (userId) {
      return await db.select().from(cultures)
        .where(eq(cultures.userId, userId))
        .orderBy(desc(cultures.createdAt));
    }
    return await db.select().from(cultures)
      .orderBy(desc(cultures.createdAt))
      .limit(10);
  }

  async updateCulture(id: string, updates: Partial<InsertCulture>): Promise<Culture> {
    const [updatedCulture] = await db
      .update(cultures)
      .set(updates)
      .where(eq(cultures.id, id))
      .returning();
    return updatedCulture;
  }

  async deleteCulture(id: string): Promise<void> {
    await db.delete(cultures).where(eq(cultures.id, id));
  }

  // Magic system methods (not implemented - table doesn't exist)
  async createMagic(magic: any): Promise<any> {
    throw new Error('Magic system not implemented');
  }

  async getMagic(id: string): Promise<any | undefined> {
    return undefined;
  }

  async getUserMagic(userId: string | null): Promise<any[]> {
    return [];
  }

  async updateMagic(id: string, updates: any): Promise<any> {
    throw new Error('Magic system not implemented');
  }

  // Document methods
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getUserDocuments(userId: string | null): Promise<Document[]> {
    if (userId) {
      return await db.select().from(documents)
        .where(eq(documents.userId, userId))
        .orderBy(desc(documents.createdAt));
    }
    return await db.select().from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(10);
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Food methods
  async createFood(food: InsertFood): Promise<Food> {
    const [newFood] = await db
      .insert(foods)
      .values(food)
      .returning();
    return newFood;
  }

  async getFood(id: string): Promise<Food | undefined> {
    const [food] = await db.select().from(foods).where(eq(foods.id, id));
    return food || undefined;
  }

  async getUserFoods(userId: string | null): Promise<Food[]> {
    if (userId) {
      return await db.select().from(foods)
        .where(eq(foods.userId, userId))
        .orderBy(desc(foods.createdAt));
    }
    return await db.select().from(foods)
      .orderBy(desc(foods.createdAt))
      .limit(10);
  }

  async updateFood(id: string, updates: Partial<InsertFood>): Promise<Food> {
    const [updatedFood] = await db
      .update(foods)
      .set(updates)
      .where(eq(foods.id, id))
      .returning();
    return updatedFood;
  }

  async deleteFood(id: string): Promise<void> {
    await db.delete(foods).where(eq(foods.id, id));
  }

  // Language methods
  async createLanguage(language: InsertLanguage): Promise<Language> {
    const [newLanguage] = await db
      .insert(languages)
      .values(language)
      .returning();
    return newLanguage;
  }

  async getLanguage(id: string): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.id, id));
    return language || undefined;
  }

  async getUserLanguages(userId: string | null): Promise<Language[]> {
    if (userId) {
      return await db.select().from(languages)
        .where(eq(languages.userId, userId))
        .orderBy(desc(languages.createdAt));
    }
    return await db.select().from(languages)
      .orderBy(desc(languages.createdAt))
      .limit(10);
  }

  async updateLanguage(id: string, updates: Partial<InsertLanguage>): Promise<Language> {
    const [updatedLanguage] = await db
      .update(languages)
      .set(updates)
      .where(eq(languages.id, id))
      .returning();
    return updatedLanguage;
  }

  async deleteLanguage(id: string): Promise<void> {
    await db.delete(languages).where(eq(languages.id, id));
  }

  // Religion methods
  async createReligion(religion: InsertReligion): Promise<Religion> {
    const [newReligion] = await db
      .insert(religions)
      .values(religion)
      .returning();
    return newReligion;
  }

  async getReligion(id: string): Promise<Religion | undefined> {
    const [religion] = await db.select().from(religions).where(eq(religions.id, id));
    return religion || undefined;
  }

  async getUserReligions(userId: string | null): Promise<Religion[]> {
    if (userId) {
      return await db.select().from(religions)
        .where(eq(religions.userId, userId))
        .orderBy(desc(religions.createdAt));
    }
    return await db.select().from(religions)
      .orderBy(desc(religions.createdAt))
      .limit(10);
  }

  async updateReligion(id: string, updates: Partial<InsertReligion>): Promise<Religion> {
    const [updatedReligion] = await db
      .update(religions)
      .set(updates)
      .where(eq(religions.id, id))
      .returning();
    return updatedReligion;
  }

  async deleteReligion(id: string): Promise<void> {
    await db.delete(religions).where(eq(religions.id, id));
  }

  // Technology methods
  async createTechnology(technology: InsertTechnology): Promise<Technology> {
    const [newTechnology] = await db
      .insert(technologies)
      .values(technology)
      .returning();
    return newTechnology;
  }

  async getTechnology(id: string): Promise<Technology | undefined> {
    const [technology] = await db.select().from(technologies).where(eq(technologies.id, id));
    return technology || undefined;
  }

  async getUserTechnologies(userId: string | null): Promise<Technology[]> {
    if (userId) {
      return await db.select().from(technologies)
        .where(eq(technologies.userId, userId))
        .orderBy(desc(technologies.createdAt));
    }
    return await db.select().from(technologies)
      .orderBy(desc(technologies.createdAt))
      .limit(10);
  }

  async updateTechnology(id: string, updates: Partial<InsertTechnology>): Promise<Technology> {
    const [updatedTechnology] = await db
      .update(technologies)
      .set(updates)
      .where(eq(technologies.id, id))
      .returning();
    return updatedTechnology;
  }

  async deleteTechnology(id: string): Promise<void> {
    await db.delete(technologies).where(eq(technologies.id, id));
  }

  // Weapon methods
  async createWeapon(weapon: InsertWeapon): Promise<Weapon> {
    const [newWeapon] = await db
      .insert(weapons)
      .values(weapon)
      .returning();
    return newWeapon;
  }

  async getWeapon(id: string): Promise<Weapon | undefined> {
    const [weapon] = await db.select().from(weapons).where(eq(weapons.id, id));
    return weapon || undefined;
  }

  async getUserWeapons(userId: string | null): Promise<Weapon[]> {
    if (userId) {
      return await db.select().from(weapons)
        .where(eq(weapons.userId, userId))
        .orderBy(desc(weapons.createdAt));
    }
    return await db.select().from(weapons)
      .orderBy(desc(weapons.createdAt))
      .limit(10);
  }

  async updateWeapon(id: string, updates: Partial<InsertWeapon>): Promise<Weapon> {
    const [updatedWeapon] = await db
      .update(weapons)
      .set(updates)
      .where(eq(weapons.id, id))
      .returning();
    return updatedWeapon;
  }

  async deleteWeapon(id: string): Promise<void> {
    await db.delete(weapons).where(eq(weapons.id, id));
  }

  // Vehicle methods (not implemented - table doesn't exist)
  async createVehicle(vehicle: any): Promise<any> {
    throw new Error('Vehicle system not implemented');
  }

  async getVehicle(id: string): Promise<any | undefined> {
    return undefined;
  }

  async getUserVehicles(userId: string | null): Promise<any[]> {
    return [];
  }

  async updateVehicle(id: string, updates: any): Promise<any> {
    throw new Error('Vehicle system not implemented');
  }

  // Profession methods
  async createProfession(profession: InsertProfession): Promise<Profession> {
    const [newProfession] = await db
      .insert(professions)
      .values(profession)
      .returning();
    return newProfession;
  }

  async getProfession(id: string): Promise<Profession | undefined> {
    const [profession] = await db.select().from(professions).where(eq(professions.id, id));
    return profession || undefined;
  }

  async getUserProfessions(userId: string | null): Promise<Profession[]> {
    if (userId) {
      return await db.select().from(professions)
        .where(eq(professions.userId, userId))
        .orderBy(desc(professions.createdAt));
    }
    return await db.select().from(professions)
      .orderBy(desc(professions.createdAt))
      .limit(10);
  }

  async updateProfession(id: string, updates: Partial<InsertProfession>): Promise<Profession> {
    const [updatedProfession] = await db
      .update(professions)
      .set(updates)
      .where(eq(professions.id, id))
      .returning();
    return updatedProfession;
  }

  async deleteProfession(id: string): Promise<void> {
    await db.delete(professions).where(eq(professions.id, id));
  }

  // Name generator methods
  async createName(name: InsertName): Promise<GeneratedName> {
    const [newName] = await db
      .insert(names)
      .values(name)
      .returning();
    return newName;
  }

  async getName(id: string): Promise<GeneratedName | undefined> {
    const [name] = await db.select().from(names).where(eq(names.id, id));
    return name || undefined;
  }

  async getUserNames(userId: string | null): Promise<GeneratedName[]> {
    if (userId) {
      return await db.select().from(names)
        .where(eq(names.userId, userId))
        .orderBy(desc(names.createdAt));
    }
    return await db.select().from(names)
      .orderBy(desc(names.createdAt))
      .limit(10);
  }

  // Theme methods
  async createTheme(theme: InsertTheme): Promise<Theme> {
    const [newTheme] = await db
      .insert(themes)
      .values(theme)
      .returning();
    return newTheme;
  }

  async getTheme(id: string): Promise<Theme | undefined> {
    const [theme] = await db.select().from(themes).where(eq(themes.id, id));
    return theme || undefined;
  }

  async getUserThemes(userId: string | null): Promise<Theme[]> {
    if (userId) {
      return await db.select().from(themes)
        .where(eq(themes.userId, userId))
        .orderBy(desc(themes.createdAt));
    }
    return await db.select().from(themes)
      .orderBy(desc(themes.createdAt))
      .limit(10);
  }

  // Mood methods
  async createMood(mood: InsertMood): Promise<Mood> {
    const [newMood] = await db
      .insert(moods)
      .values(mood)
      .returning();
    return newMood;
  }

  async getMood(id: string): Promise<Mood | undefined> {
    const [mood] = await db.select().from(moods).where(eq(moods.id, id));
    return mood || undefined;
  }

  async getUserMoods(userId: string | null): Promise<Mood[]> {
    if (userId) {
      return await db.select().from(moods)
        .where(eq(moods.userId, userId))
        .orderBy(desc(moods.createdAt));
    }
    return await db.select().from(moods)
      .orderBy(desc(moods.createdAt))
      .limit(10);
  }

  // Conflict methods
  async createConflict(conflict: InsertConflict): Promise<Conflict> {
    const [newConflict] = await db
      .insert(conflicts)
      .values(conflict)
      .returning();
    return newConflict;
  }

  async getConflict(id: string): Promise<Conflict | undefined> {
    const [conflict] = await db.select().from(conflicts).where(eq(conflicts.id, id));
    return conflict || undefined;
  }

  async getUserConflicts(userId: string | null): Promise<Conflict[]> {
    if (userId) {
      return await db.select().from(conflicts)
        .where(eq(conflicts.userId, userId))
        .orderBy(desc(conflicts.createdAt));
    }
    return await db.select().from(conflicts)
      .orderBy(desc(conflicts.createdAt))
      .limit(10);
  }

  // Guide methods
  async createGuide(guide: InsertGuide): Promise<Guide> {
    const [newGuide] = await db
      .insert(guides)
      .values(guide)
      .returning();
    return newGuide;
  }

  async getGuide(id: string): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guides).where(eq(guides.id, id));
    return guide || undefined;
  }

  async getGuides(category?: string): Promise<Guide[]> {
    if (category) {
      return await db.select().from(guides)
        .where(eq(guides.category, category))
        .orderBy(guides.title);
    }
    return await db.select().from(guides).orderBy(guides.title);
  }

  async searchGuides(query: string, category?: string): Promise<Guide[]> {
    const conditions = [];
    
    if (category) {
      conditions.push(eq(guides.category, category));
    }
    
    conditions.push(
      or(
        ilike(guides.title, `%${query}%`),
        ilike(guides.content, `%${query}%`)
      )
    );
    
    return await db.select().from(guides)
      .where(and(...conditions))
      .orderBy(guides.title)
      .limit(20);
  }

  async updateGuide(id: string, updates: Partial<InsertGuide>): Promise<Guide | undefined> {
    const [updatedGuide] = await db
      .update(guides)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(guides.id, id))
      .returning();
    return updatedGuide;
  }

  async deleteGuide(id: string): Promise<boolean> {
    const deletedGuides = await db.delete(guides)
      .where(eq(guides.id, id))
      .returning({ id: guides.id });
    return deletedGuides.length > 0;
  }

  // Saved item methods
  async saveItem(savedItem: InsertSavedItem): Promise<SavedItem> {
    try {
      const [newSavedItem] = await db
        .insert(savedItems)
        .values(savedItem)
        .returning();
      return newSavedItem;
    } catch (error: any) {
      // Check for unique constraint violation
      if (error?.code === '23505' || error?.message?.includes('unique')) {
        // Item already saved, return existing
        const existing = await db.select().from(savedItems)
          .where(and(
            savedItem.userId ? eq(savedItems.userId, savedItem.userId) : isNull(savedItems.userId),
            eq(savedItems.itemType, savedItem.itemType),
            eq(savedItems.itemId, savedItem.itemId)
          ))
          .limit(1);
        if (existing[0]) return existing[0];
      }
      throw error;
    }
  }

  async unsaveItem(userId: string, itemType: string, itemId: string): Promise<void> {
    const conditions = [];
    
    // Handle null userId for guest users  
    if (userId === 'null' || !userId) {
      conditions.push(isNull(savedItems.userId));
    } else {
      conditions.push(eq(savedItems.userId, userId));
    }
    
    conditions.push(eq(savedItems.itemType, itemType));
    conditions.push(eq(savedItems.itemId, itemId));
    
    await db.delete(savedItems).where(and(...conditions));
  }

  async getUserSavedItems(userId: string, itemType?: string): Promise<SavedItem[]> {
    const conditions = [];
    
    // Handle null userId for guest users
    if (userId === 'null') {
      conditions.push(isNull(savedItems.userId));
    } else {
      conditions.push(eq(savedItems.userId, userId));
    }
    
    if (itemType) {
      conditions.push(eq(savedItems.itemType, itemType));
    }
    
    const savedItemsData = await db.select().from(savedItems)
      .where(and(...conditions))
      .orderBy(desc(savedItems.createdAt));
    
    return savedItemsData;
  }

  async isItemSaved(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const conditions = [];
    
    // Handle null userId for guest users
    if (userId === 'null' || !userId) {
      conditions.push(isNull(savedItems.userId));
    } else {
      conditions.push(eq(savedItems.userId, userId));
    }
    
    conditions.push(eq(savedItems.itemType, itemType));
    conditions.push(eq(savedItems.itemId, itemId));
    
    const [saved] = await db.select().from(savedItems)
      .where(and(...conditions))
      .limit(1);
    return !!saved;
  }

  // Manuscript methods
  async createManuscript(manuscript: InsertManuscript): Promise<Manuscript> {
    const [newManuscript] = await db
      .insert(manuscripts)
      .values(manuscript)
      .returning();
    return newManuscript;
  }

  async getManuscript(id: string, userId: string): Promise<Manuscript | undefined> {
    const [manuscript] = await db
      .select()
      .from(manuscripts)
      .where(and(
        eq(manuscripts.id, id),
        eq(manuscripts.userId, userId)
      ));
    return manuscript || undefined;
  }

  async getUserManuscripts(userId: string): Promise<Manuscript[]> {
    return await db
      .select()
      .from(manuscripts)
      .where(eq(manuscripts.userId, userId))
      .orderBy(desc(manuscripts.updatedAt));
  }

  async updateManuscript(id: string, userId: string, updates: Partial<InsertManuscript>): Promise<Manuscript> {
    // Count words if content is being updated
    if (updates.content) {
      const plainText = updates.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const words = plainText.split(/\s+/).filter(word => word.length > 0);
      updates.wordCount = words.length;
      
      // Generate excerpt if not provided
      if (!updates.excerpt && plainText.length > 0) {
        updates.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      }
    }

    const [updatedManuscript] = await db
      .update(manuscripts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(manuscripts.id, id),
        eq(manuscripts.userId, userId)
      ))
      .returning();
      
    if (!updatedManuscript) {
      throw new Error('Manuscript not found or access denied');
    }
    
    return updatedManuscript;
  }

  async deleteManuscript(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(manuscripts)
      .where(and(
        eq(manuscripts.id, id),
        eq(manuscripts.userId, userId)
      ));
      
    if (result.rowCount === 0) {
      throw new Error('Manuscript not found or access denied');
    }
  }

  async searchManuscripts(userId: string, query: string): Promise<Manuscript[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return this.getUserManuscripts(userId);
    }

    // Enhanced full-text search using PostgreSQL tsvector with ranking
    const searchQuery = sql`plainto_tsquery('english', ${trimmedQuery})`;
    return await db.select({
      id: manuscripts.id,
      title: manuscripts.title,
      content: manuscripts.content,
      excerpt: manuscripts.excerpt,
      wordCount: manuscripts.wordCount,
      tags: manuscripts.tags,
      status: manuscripts.status,
      searchVector: manuscripts.searchVector,
      userId: manuscripts.userId,
      createdAt: manuscripts.createdAt,
      updatedAt: manuscripts.updatedAt,
      rank: sql<number>`ts_rank(${manuscripts.searchVector}, ${searchQuery})`.as('rank')
    })
    .from(manuscripts)
    .where(
      and(
        eq(manuscripts.userId, userId),
        sql`${manuscripts.searchVector} @@ ${searchQuery}`
      )
    )
    .orderBy(desc(sql`ts_rank(${manuscripts.searchVector}, ${searchQuery})`));
  }

  async searchAllContent(userId: string, query: string): Promise<any[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const results: any[] = [];

    try {
      // Search manuscripts (always include these as they're user-specific)
      const manuscriptResults = await this.searchManuscripts(userId, trimmedQuery);
      manuscriptResults.forEach(item => {
        results.push({
          id: item.id,
          title: item.title,
          type: 'manuscript',
          subtitle: item.status,
          description: item.excerpt || item.content?.substring(0, 100) + '...'
        });
      });

      // Search characters - include all user characters
      const characterResults = await db.select().from(characters)
        .where(
          and(
            eq(characters.userId, userId),
            or(
              ilike(characters.givenName, `%${trimmedQuery}%`),
              ilike(characters.familyName, `%${trimmedQuery}%`),
              ilike(characters.occupation, `%${trimmedQuery}%`)
            )
          )
        )
        .limit(20);
      
      for (const character of characterResults) {
        
        const fullName = [character.givenName, character.familyName].filter(Boolean).join(' ').trim() || 'Untitled Character';
        
        // Try to fetch linked profession if occupation looks like an ID
        let professionName = character.occupation || 'Character';
        if (character.occupation && character.occupation.match(/^[a-f0-9-]{36}$/)) {
          // Looks like a UUID, try to fetch the profession
          try {
            const profession = await this.getProfession(character.occupation);
            if (profession) {
              professionName = profession.name;
            }
          } catch (error) {
            console.error('Failed to fetch profession:', error);
          }
        }
        
        results.push({
          id: character.id,
          title: fullName,
          type: 'character',
          subtitle: professionName,
          description: character.backstory?.substring(0, 100) + '...' || 'No description available'
        });
      }

      // Search professions - include all user professions
      const professionResults = await db.select().from(professions)
        .where(
          and(
            eq(professions.userId, userId),
            or(
              ilike(professions.name, `%${trimmedQuery}%`),
              ilike(professions.description, `%${trimmedQuery}%`)
            )
          )
        )
        .limit(10);
      
      for (const profession of professionResults) {
        
        results.push({
          id: profession.id,
          title: profession.name,
          type: 'profession',
          subtitle: profession.professionType || 'Profession',
          description: profession.description?.substring(0, 100) + '...'
        });
      }

      // Search locations - include all user locations
      const locationResults = await db.select().from(locations)
        .where(and(
          eq(locations.userId, userId),
          sql`${locations.name} ILIKE ${'%' + trimmedQuery + '%'}`
        ))
        .limit(10);
      
      locationResults.forEach(item => {
        
        results.push({
          id: item.id,
          title: item.name,
          type: 'location',
          subtitle: item.locationType,
          description: item.description?.substring(0, 100) + '...'
        });
      });

      // Search organizations - include all user organizations
      const organizationResults = await db.select().from(organizations)
        .where(and(
          eq(organizations.userId, userId),
          sql`${organizations.name} ILIKE ${'%' + trimmedQuery + '%'}`
        ))
        .limit(10);
      
      organizationResults.forEach(item => {
        
        results.push({
          id: item.id,
          title: item.name,
          type: 'organization',
          subtitle: item.organizationType,
          description: item.purpose?.substring(0, 100) + '...'
        });
      });

      // Search species - include all user species
      const speciesResults = await db.select().from(species)
        .where(and(
          eq(species.userId, userId),
          sql`${species.name} ILIKE ${'%' + trimmedQuery + '%'}`
        ))
        .limit(10);
      
      speciesResults.forEach(item => {
        
        results.push({
          id: item.id,
          title: item.name,
          type: 'species',
          subtitle: item.classification,
          description: item.physicalDescription?.substring(0, 100) + '...'
        });
      });

      // Search cultures - include all user cultures
      const cultureResults = await db.select().from(cultures)
        .where(and(
          eq(cultures.userId, userId),
          sql`${cultures.name} ILIKE ${'%' + trimmedQuery + '%'}`
        ))
        .limit(10);
      
      cultureResults.forEach(item => {
        
        results.push({
          id: item.id,
          title: item.name,
          type: 'culture',
          subtitle: item.governance,
          description: item.description?.substring(0, 100) + '...'
        });
      });

      // Search items - include all user items
      const itemResults = await db.select().from(items)
        .where(and(
          eq(items.userId, userId),
          sql`${items.name} ILIKE ${'%' + trimmedQuery + '%'}`
        ))
        .limit(10);
      
      itemResults.forEach(item => {
        
        results.push({
          id: item.id,
          title: item.name,
          type: 'item',
          subtitle: item.itemType,
          description: item.description?.substring(0, 100) + '...'
        });
      });

    } catch (error) {
      console.error('Error in universal search:', error);
    }

    // Remove duplicates and limit results
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex((r) => r.id === result.id && r.type === result.type)
    );

    return uniqueResults.slice(0, 20);
  }

  // Manuscript links methods
  async createManuscriptLink(link: InsertManuscriptLink): Promise<ManuscriptLink> {
    const [newLink] = await db
      .insert(manuscriptLinks)
      .values(link)
      .returning();
    return newLink;
  }

  async getManuscriptLinks(manuscriptId: string, userId: string): Promise<ManuscriptLink[]> {
    return await db
      .select()
      .from(manuscriptLinks)
      .where(and(
        eq(manuscriptLinks.sourceId, manuscriptId),
        eq(manuscriptLinks.userId, userId)
      ))
      .orderBy(manuscriptLinks.position);
  }

  async updateManuscriptLink(linkId: string, updates: Partial<InsertManuscriptLink>, userId: string): Promise<ManuscriptLink> {
    const [updatedLink] = await db
      .update(manuscriptLinks)
      .set(updates)
      .where(and(
        eq(manuscriptLinks.id, linkId),
        eq(manuscriptLinks.userId, userId)
      ))
      .returning();
    
    if (!updatedLink) {
      throw new Error('Manuscript link not found or access denied');
    }
    
    return updatedLink;
  }

  async deleteManuscriptLink(linkId: string, userId: string): Promise<void> {
    const result = await db
      .delete(manuscriptLinks)
      .where(and(
        eq(manuscriptLinks.id, linkId),
        eq(manuscriptLinks.userId, userId)
      ));
    
    if (result.rowCount === 0) {
      throw new Error('Manuscript link not found or access denied');
    }
  }

  async getBacklinks(targetType: string, targetId: string, userId: string): Promise<Array<ManuscriptLink & { manuscriptTitle: string }>> {
    const backlinks = await db
      .select({
        id: manuscriptLinks.id,
        sourceId: manuscriptLinks.sourceId,
        targetType: manuscriptLinks.targetType,
        targetId: manuscriptLinks.targetId,
        contextText: manuscriptLinks.contextText,
        linkText: manuscriptLinks.linkText,
        position: manuscriptLinks.position,
        userId: manuscriptLinks.userId,
        createdAt: manuscriptLinks.createdAt,
        manuscriptTitle: manuscripts.title
      })
      .from(manuscriptLinks)
      .innerJoin(manuscripts, eq(manuscriptLinks.sourceId, manuscripts.id))
      .where(and(
        eq(manuscriptLinks.targetType, targetType),
        eq(manuscriptLinks.targetId, targetId),
        eq(manuscriptLinks.userId, userId)
      ))
      .orderBy(manuscriptLinks.createdAt);
    
    return backlinks;
  }

  async getManuscriptLinksForUser(userId: string): Promise<ManuscriptLink[]> {
    return await db.select().from(manuscriptLinks)
      .where(eq(manuscriptLinks.userId, userId))
      .orderBy(desc(manuscriptLinks.createdAt))
      .limit(100);
  }

  async findLinksToContent(targetType: string, targetId: string, userId: string): Promise<ManuscriptLink[]> {
    return await db.select().from(manuscriptLinks)
      .where(and(
        eq(manuscriptLinks.targetType, targetType),
        eq(manuscriptLinks.targetId, targetId),
        eq(manuscriptLinks.userId, userId)
      ));
  }

  // Pinned content methods
  async pinContent(pin: InsertPinnedContent): Promise<PinnedContent> {
    try {
      const [newPin] = await db
        .insert(pinnedContent)
        .values(pin)
        .returning();
      return newPin;
    } catch (error: any) {
      // Check for unique constraint violation
      if (error?.code === '23505' || error?.message?.includes('unique')) {
        // Item already pinned
        const existing = await db.select().from(pinnedContent)
          .where(and(
            eq(pinnedContent.userId, pin.userId),
            eq(pinnedContent.targetType, pin.targetType),
            eq(pinnedContent.targetId, pin.targetId)
          ))
          .limit(1);
        if (existing[0]) return existing[0];
      }
      throw error;
    }
  }

  async unpinContent(userId: string, targetType: string, targetId: string): Promise<void> {
    await db
      .delete(pinnedContent)
      .where(and(
        eq(pinnedContent.userId, userId),
        eq(pinnedContent.targetType, targetType),
        eq(pinnedContent.targetId, targetId)
      ));
  }

  async getUserPinnedContent(userId: string, category?: string): Promise<PinnedContent[]> {
    const conditions = [eq(pinnedContent.userId, userId)];
    
    if (category) {
      conditions.push(eq(pinnedContent.category, category));
    }
    
    return await db
      .select()
      .from(pinnedContent)
      .where(and(...conditions))
      .orderBy(pinnedContent.createdAt);
  }

  async reorderPinnedContent(userId: string, itemId: string, newOrder: number): Promise<void> {
    // Note: sortOrder field doesn't exist in schema, so this won't work
    // The method signature is maintained for compatibility
    throw new Error('sortOrder field not available in pinnedContent table');
  }

  async isContentPinned(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const [pin] = await db
      .select()
      .from(pinnedContent)
      .where(and(
        eq(pinnedContent.userId, userId),
        eq(pinnedContent.targetType, targetType),
        eq(pinnedContent.targetId, targetId)
      ))
      .limit(1);
    
    return !!pin;
  }
}

export const storage = new DatabaseStorage();