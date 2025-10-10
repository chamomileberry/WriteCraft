import { BaseRepository } from './base.repository';
import { db } from '../db';
import {
  // Plot types
  plots, type Plot, type InsertPlot,
  // Prompt types  
  prompts, type Prompt, type InsertPrompt,
  // Location types
  locations, type Location, type InsertLocation,
  // Setting types
  settings, type Setting, type InsertSetting,
  // Item types
  items, type Item, type InsertItem,
  // Organization types
  organizations, type Organization, type InsertOrganization,
  // Creature types
  creatures, type Creature, type InsertCreature,
  // Species types
  species, type Species, type InsertSpecies,
  // Culture types
  cultures, type Culture, type InsertCulture,
  // Document types
  documents, type Document, type InsertDocument,
  // Food types
  foods, type Food, type InsertFood,
  // Language types
  languages, type Language, type InsertLanguage,
  // Religion types
  religions, type Religion, type InsertReligion,
  // Technology types
  technologies, type Technology, type InsertTechnology,
  // Weapon types
  weapons, type Weapon, type InsertWeapon,
  // Profession types
  professions, type Profession, type InsertProfession,
  // Rank types
  ranks, type Rank, type InsertRank,
  // Condition types
  conditions, type Condition, type InsertCondition,
  // Plant types
  plants, type Plant, type InsertPlant,
  // Description types
  descriptions, type Description, type InsertDescription,
  // Ethnicity types
  ethnicities, type Ethnicity, type InsertEthnicity,
  // Drink types
  drinks, type Drink, type InsertDrink,
  // Armor types
  armor, type Armor, type InsertArmor,
  // Accessory types
  accessories, type Accessory, type InsertAccessory,
  // Clothing types
  clothing, type Clothing, type InsertClothing,
  // Material types
  materials, type Material, type InsertMaterial,
  // Settlement types
  settlements, type Settlement, type InsertSettlement,
  // Society types
  societies, type Society, type InsertSociety,
  // Faction types
  factions, type Faction, type InsertFaction,
  // MilitaryUnit types
  militaryUnits, type MilitaryUnit, type InsertMilitaryUnit,
  // Myth types
  myths, type Myth, type InsertMyth,
  // Legend types
  legends, type Legend, type InsertLegend,
  // Event types
  events, type Event, type InsertEvent,
  // Spell types
  spells, type Spell, type InsertSpell,
  // Resource types
  resources, type Resource, type InsertResource,
  // Building types
  buildings, type Building, type InsertBuilding,
  // Animal types
  animals, type Animal, type InsertAnimal,
  // Transportation types
  transportation, type Transportation, type InsertTransportation,
  // NaturalLaw types
  naturalLaws, type NaturalLaw, type InsertNaturalLaw,
  // Tradition types
  traditions, type Tradition, type InsertTradition,
  // Ritual types
  rituals, type Ritual, type InsertRitual,
  // SavedItem types
  savedItems, type SavedItem, type InsertSavedItem,
  // Name types
  names, type GeneratedName, type InsertName,
  // Theme types
  themes, type Theme, type InsertTheme,
  // Mood types
  moods, type Mood, type InsertMood,
  // Conflict types
  conflicts, type Conflict, type InsertConflict,
  // Guide types
  guides, type Guide, type InsertGuide,
  // Timeline types
  timelines, type Timeline, type InsertTimeline,
  timelineEvents, type TimelineEvent, type InsertTimelineEvent,
  timelineRelationships, type TimelineRelationship, type InsertTimelineRelationship,
  // Ceremony types
  ceremonies, type Ceremony, type InsertCeremony,
  // Map types
  maps, type Map, type InsertMap,
  // Music types
  music, type Music, type InsertMusic,
  // Dance types
  dances, type Dance, type InsertDance,
  // Law types
  laws, type Law, type InsertLaw,
  // Policy types
  policies, type Policy, type InsertPolicy,
  // Potion types
  potions, type Potion, type InsertPotion,
  // Folder types
  folders, type Folder, type InsertFolder,
  // Note types
  notes, type Note, type InsertNote,
  // ChatMessage types
  chatMessages, type ChatMessage, type InsertChatMessage,
  // PinnedContent types
  pinnedContent, type PinnedContent, type InsertPinnedContent,
  notebooks
} from '@shared/schema';
import { eq, and, or, desc, isNull, sql } from 'drizzle-orm';

export class ContentRepository extends BaseRepository {
  // ========== PLOT METHODS ==========
  async createPlot(plot: InsertPlot): Promise<Plot> {
    const [newPlot] = await db.insert(plots).values(plot).returning();
    return newPlot;
  }

  async getPlot(id: string, userId: string, notebookId: string): Promise<Plot | undefined> {
    const [plot] = await db.select().from(plots).where(and(
      eq(plots.id, id),
      eq(plots.userId, userId),
      eq(plots.notebookId, notebookId)
    ));
    return plot || undefined;
  }

  async getUserPlots(userId: string, notebookId: string): Promise<Plot[]> {
    return await db.select().from(plots)
      .where(eq(plots.userId, userId))
      .orderBy(desc(plots.createdAt));
  }

  // ========== PROMPT METHODS ==========
  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [newPrompt] = await db.insert(prompts).values(prompt).returning();
    return newPrompt;
  }

  async getPrompt(id: string, userId: string, notebookId: string): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(and(
      eq(prompts.id, id),
      eq(prompts.userId, userId),
      eq(prompts.notebookId, notebookId)
    ));
    return prompt || undefined;
  }

  async getUserPrompts(userId: string, notebookId: string): Promise<Prompt[]> {
    return await db.select().from(prompts)
      .where(eq(prompts.userId, userId))
      .orderBy(desc(prompts.createdAt));
  }

  async getRandomPrompts(count = 5): Promise<Prompt[]> {
    return await db.select().from(prompts)
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }

  // ========== LOCATION METHODS ==========
  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async getLocation(id: string, userId: string, notebookId: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(and(
      eq(locations.id, id),
      eq(locations.userId, userId),
      eq(locations.notebookId, notebookId)
    ));
    return location || undefined;
  }

  async getUserLocations(userId: string, notebookId: string): Promise<Location[]> {
    return await db.select().from(locations)
      .where(and(
        eq(locations.userId, userId),
        eq(locations.notebookId, notebookId)
      ))
      .orderBy(desc(locations.createdAt));
  }

  async updateLocation(id: string, userId: string, updates: Partial<InsertLocation>, notebookId: string): Promise<Location> {
    const [existing] = await db.select().from(locations).where(eq(locations.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedLocation] = await db.update(locations)
      .set(updates)
      .where(and(
        eq(locations.id, id),
        eq(locations.userId, userId),
        eq(locations.notebookId, notebookId)
      ))
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: string, userId: string, notebookId: string): Promise<void> {
    const [existing] = await db.select().from(locations).where(eq(locations.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(locations).where(and(
      eq(locations.id, id),
      eq(locations.userId, userId),
      eq(locations.notebookId, notebookId)
    ));
  }

  // ========== SETTING METHODS ==========
  async createSetting(setting: InsertSetting): Promise<Setting> {
    const [newSetting] = await db.insert(settings).values(setting).returning();
    return newSetting;
  }

  async getSetting(id: string, userId: string, notebookId: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(and(
      eq(settings.id, id),
      eq(settings.userId, userId),
      eq(settings.notebookId, notebookId)
    ));
    return setting || undefined;
  }

  async getUserSettings(userId: string, notebookId: string): Promise<Setting[]> {
    return await db.select().from(settings)
      .where(and(
        eq(settings.userId, userId),
        eq(settings.notebookId, notebookId)
      ))
      .orderBy(desc(settings.createdAt));
  }

  async updateSetting(id: string, userId: string, updates: Partial<InsertSetting>): Promise<Setting> {
    const [existing] = await db.select().from(settings).where(eq(settings.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedSetting] = await db.update(settings)
      .set(updates)
      .where(eq(settings.id, id))
      .returning();
    return updatedSetting;
  }

  // ========== ITEM METHODS ==========
  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async getItem(id: string, userId: string, notebookId: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(and(
      eq(items.id, id),
      eq(items.userId, userId),
      eq(items.notebookId, notebookId)
    ));
    return item || undefined;
  }

  async getUserItems(userId: string, notebookId: string): Promise<Item[]> {
    return await db.select().from(items)
      .where(and(
        eq(items.userId, userId),
        eq(items.notebookId, notebookId)
      ))
      .orderBy(desc(items.createdAt));
  }

  async updateItem(id: string, userId: string, updates: Partial<InsertItem>, notebookId: string): Promise<Item> {
    const [existing] = await db.select().from(items).where(eq(items.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedItem] = await db.update(items)
      .set(updates)
      .where(and(
        eq(items.id, id),
        eq(items.userId, userId),
        eq(items.notebookId, notebookId)
      ))
      .returning();
    return updatedItem;
  }

  async deleteItem(id: string, userId: string, notebookId: string): Promise<void> {
    const [existing] = await db.select().from(items).where(eq(items.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(items).where(and(
      eq(items.id, id),
      eq(items.userId, userId),
      eq(items.notebookId, notebookId)
    ));
  }

  // ... (Continuing with all other content types following the same pattern)
  // This file is getting very large, so I'll continue with the remaining methods

  // ========== ORGANIZATION METHODS ==========
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [newOrganization] = await db.insert(organizations).values(organization).returning();
    return newOrganization;
  }

  async getOrganization(id: string, userId: string, notebookId: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(and(
      eq(organizations.id, id),
      eq(organizations.userId, userId),
      eq(organizations.notebookId, notebookId)
    ));
    return organization || undefined;
  }

  async getUserOrganizations(userId: string, notebookId: string): Promise<Organization[]> {
    return await db.select().from(organizations)
      .where(and(
        eq(organizations.userId, userId),
        eq(organizations.notebookId, notebookId)
      ))
      .orderBy(desc(organizations.createdAt));
  }

  async updateOrganization(id: string, userId: string, updates: Partial<InsertOrganization>, notebookId: string): Promise<Organization> {
    const [existing] = await db.select().from(organizations).where(eq(organizations.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedOrganization] = await db.update(organizations)
      .set(updates)
      .where(and(
        eq(organizations.id, id),
        eq(organizations.userId, userId),
        eq(organizations.notebookId, notebookId)
      ))
      .returning();
    return updatedOrganization;
  }

  async deleteOrganization(id: string, userId: string, notebookId: string): Promise<void> {
    const [existing] = await db.select().from(organizations).where(eq(organizations.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(organizations).where(and(
      eq(organizations.id, id),
      eq(organizations.userId, userId),
      eq(organizations.notebookId, notebookId)
    ));
  }

  // ========== CREATURE METHODS ==========
  async createCreature(creature: InsertCreature): Promise<Creature> {
    const [newCreature] = await db.insert(creatures).values(creature).returning();
    return newCreature;
  }

  async getCreature(id: string, userId: string, notebookId: string): Promise<Creature | undefined> {
    const [creature] = await db.select().from(creatures).where(and(
      eq(creatures.id, id),
      eq(creatures.userId, userId),
      eq(creatures.notebookId, notebookId)
    ));
    return creature || undefined;
  }

  async getUserCreatures(userId: string, notebookId: string): Promise<Creature[]> {
    return await db.select().from(creatures)
      .where(and(
        eq(creatures.userId, userId),
        eq(creatures.notebookId, notebookId)
      ))
      .orderBy(desc(creatures.createdAt));
  }

  async updateCreature(id: string, userId: string, updates: Partial<InsertCreature>): Promise<Creature> {
    const [existing] = await db.select().from(creatures).where(eq(creatures.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedCreature] = await db.update(creatures)
      .set(updates)
      .where(eq(creatures.id, id))
      .returning();
    return updatedCreature;
  }

  // ========== SPECIES METHODS ==========
  async createSpecies(speciesData: InsertSpecies): Promise<Species> {
    const [newSpecies] = await db.insert(species).values(speciesData).returning();
    return newSpecies;
  }

  async getSpecies(id: string, userId: string, notebookId: string): Promise<Species | undefined> {
    const [sp] = await db.select().from(species).where(and(
      eq(species.id, id),
      eq(species.userId, userId),
      eq(species.notebookId, notebookId)
    ));
    return sp || undefined;
  }

  async getUserSpecies(userId: string, notebookId: string): Promise<Species[]> {
    return await db.select().from(species)
      .where(and(
        eq(species.userId, userId),
        eq(species.notebookId, notebookId)
      ))
      .orderBy(desc(species.createdAt));
  }

  async findSpeciesByName(name: string, notebookId: string): Promise<Species | undefined> {
    const [sp] = await db.select().from(species).where(and(
      eq(species.name, name),
      eq(species.notebookId, notebookId)
    ));
    return sp || undefined;
  }

  async updateSpecies(id: string, userId: string, updates: Partial<InsertSpecies>): Promise<Species> {
    const [existing] = await db.select().from(species).where(eq(species.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedSpecies] = await db.update(species)
      .set(updates)
      .where(eq(species.id, id))
      .returning();
    return updatedSpecies;
  }

  async deleteSpecies(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(species).where(eq(species.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(species).where(eq(species.id, id));
  }

  // ========== CULTURE METHODS ==========
  async createCulture(culture: InsertCulture): Promise<Culture> {
    const [newCulture] = await db.insert(cultures).values(culture).returning();
    return newCulture;
  }

  async getCulture(id: string, userId: string, notebookId: string): Promise<Culture | undefined> {
    const whereClause = and(
      eq(cultures.id, id),
      eq(cultures.userId, userId),
      eq(cultures.notebookId, notebookId)
    );
    const [culture] = await db.select().from(cultures).where(whereClause);
    return culture || undefined;
  }

  async getUserCultures(userId: string, notebookId: string): Promise<Culture[]> {
    const whereClause = and(
      eq(cultures.userId, userId),
      eq(cultures.notebookId, notebookId)
    );
    return await db.select().from(cultures)
      .where(whereClause)
      .orderBy(desc(cultures.createdAt));
  }

  async updateCulture(id: string, userId: string, updates: Partial<InsertCulture>, notebookId: string): Promise<Culture> {
    const [existing] = await db.select().from(cultures).where(eq(cultures.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const whereClause = and(
      eq(cultures.id, id),
      eq(cultures.userId, userId),
      eq(cultures.notebookId, notebookId)
    );
    const [updatedCulture] = await db.update(cultures)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedCulture;
  }

  async deleteCulture(id: string, userId: string, notebookId: string): Promise<void> {
    const [existing] = await db.select().from(cultures).where(eq(cultures.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const whereClause = and(
      eq(cultures.id, id),
      eq(cultures.userId, userId),
      eq(cultures.notebookId, notebookId)
    );
    await db.delete(cultures).where(whereClause);
  }

  // ========== DOCUMENT METHODS ==========
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async getDocument(id: string, userId: string, notebookId: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(and(
      eq(documents.id, id),
      eq(documents.userId, userId),
      eq(documents.notebookId, notebookId)
    ));
    return document || undefined;
  }

  async getUserDocuments(userId: string, notebookId: string): Promise<Document[]> {
    return await db.select().from(documents)
      .where(and(
        eq(documents.userId, userId),
        eq(documents.notebookId, notebookId)
      ))
      .orderBy(desc(documents.createdAt));
  }

  async updateDocument(id: string, userId: string, updates: Partial<InsertDocument>): Promise<Document> {
    const [existing] = await db.select().from(documents).where(eq(documents.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedDocument] = await db.update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(documents).where(eq(documents.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(documents).where(eq(documents.id, id));
  }

  // ========== FOOD METHODS ==========
  async createFood(food: InsertFood): Promise<Food> {
    const [newFood] = await db.insert(foods).values(food).returning();
    return newFood;
  }

  async getFood(id: string, userId: string, notebookId: string): Promise<Food | undefined> {
    const [food] = await db.select().from(foods).where(and(
      eq(foods.id, id),
      eq(foods.userId, userId),
      eq(foods.notebookId, notebookId)
    ));
    return food || undefined;
  }

  async getUserFoods(userId: string, notebookId: string): Promise<Food[]> {
    return await db.select().from(foods)
      .where(and(
        eq(foods.userId, userId),
        eq(foods.notebookId, notebookId)
      ))
      .orderBy(desc(foods.createdAt));
  }

  async updateFood(id: string, userId: string, updates: Partial<InsertFood>): Promise<Food> {
    const [existing] = await db.select().from(foods).where(eq(foods.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedFood] = await db.update(foods)
      .set(updates)
      .where(eq(foods.id, id))
      .returning();
    return updatedFood;
  }

  async deleteFood(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(foods).where(eq(foods.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(foods).where(eq(foods.id, id));
  }

  // ========== LANGUAGE METHODS ==========
  async createLanguage(language: InsertLanguage): Promise<Language> {
    const [newLanguage] = await db.insert(languages).values(language).returning();
    return newLanguage;
  }

  async getLanguage(id: string, userId: string, notebookId: string): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(and(
      eq(languages.id, id),
      eq(languages.userId, userId),
      eq(languages.notebookId, notebookId)
    ));
    return language || undefined;
  }

  async getUserLanguages(userId: string, notebookId: string): Promise<Language[]> {
    return await db.select().from(languages)
      .where(and(
        eq(languages.userId, userId),
        eq(languages.notebookId, notebookId)
      ))
      .orderBy(desc(languages.createdAt));
  }

  async updateLanguage(id: string, userId: string, updates: Partial<InsertLanguage>): Promise<Language> {
    const [existing] = await db.select().from(languages).where(eq(languages.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedLanguage] = await db.update(languages)
      .set(updates)
      .where(eq(languages.id, id))
      .returning();
    return updatedLanguage;
  }

  async deleteLanguage(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(languages).where(eq(languages.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(languages).where(eq(languages.id, id));
  }

  // ========== RELIGION METHODS ==========
  async createReligion(religion: InsertReligion): Promise<Religion> {
    const [newReligion] = await db.insert(religions).values(religion).returning();
    return newReligion;
  }

  async getReligion(id: string, userId: string, notebookId: string): Promise<Religion | undefined> {
    const [religion] = await db.select().from(religions).where(and(
      eq(religions.id, id),
      eq(religions.userId, userId),
      eq(religions.notebookId, notebookId)
    ));
    return religion || undefined;
  }

  async getUserReligions(userId: string, notebookId: string): Promise<Religion[]> {
    return await db.select().from(religions)
      .where(and(
        eq(religions.userId, userId),
        eq(religions.notebookId, notebookId)
      ))
      .orderBy(desc(religions.createdAt));
  }

  async updateReligion(id: string, userId: string, updates: Partial<InsertReligion>): Promise<Religion> {
    const [existing] = await db.select().from(religions).where(eq(religions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedReligion] = await db.update(religions)
      .set(updates)
      .where(eq(religions.id, id))
      .returning();
    return updatedReligion;
  }

  async deleteReligion(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(religions).where(eq(religions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(religions).where(eq(religions.id, id));
  }

  // ========== TECHNOLOGY METHODS ==========
  async createTechnology(technology: InsertTechnology): Promise<Technology> {
    const [newTechnology] = await db.insert(technologies).values(technology).returning();
    return newTechnology;
  }

  async getTechnology(id: string, userId: string, notebookId: string): Promise<Technology | undefined> {
    const [technology] = await db.select().from(technologies).where(and(
      eq(technologies.id, id),
      eq(technologies.userId, userId),
      eq(technologies.notebookId, notebookId)
    ));
    return technology || undefined;
  }

  async getUserTechnologies(userId: string, notebookId: string): Promise<Technology[]> {
    return await db.select().from(technologies)
      .where(and(
        eq(technologies.userId, userId),
        eq(technologies.notebookId, notebookId)
      ))
      .orderBy(desc(technologies.createdAt));
  }

  async updateTechnology(id: string, userId: string, updates: Partial<InsertTechnology>): Promise<Technology> {
    const [existing] = await db.select().from(technologies).where(eq(technologies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedTechnology] = await db.update(technologies)
      .set(updates)
      .where(eq(technologies.id, id))
      .returning();
    return updatedTechnology;
  }

  async deleteTechnology(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(technologies).where(eq(technologies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(technologies).where(eq(technologies.id, id));
  }

  // ========== WEAPON METHODS ==========
  async createWeapon(weapon: InsertWeapon): Promise<Weapon> {
    const [newWeapon] = await db.insert(weapons).values(weapon).returning();
    return newWeapon;
  }

  async getWeapon(id: string, userId: string, notebookId: string): Promise<Weapon | undefined> {
    const whereClause = and(
      eq(weapons.id, id),
      eq(weapons.userId, userId),
      eq(weapons.notebookId, notebookId)
    );
    const [weapon] = await db.select().from(weapons).where(whereClause);
    return weapon || undefined;
  }

  async getUserWeapons(userId: string, notebookId: string): Promise<Weapon[]> {
    const whereClause = and(
      eq(weapons.userId, userId),
      eq(weapons.notebookId, notebookId)
    );
    return await db.select().from(weapons)
      .where(whereClause)
      .orderBy(desc(weapons.createdAt));
  }

  async updateWeapon(id: string, userId: string, notebookId: string, updates: Partial<InsertWeapon>): Promise<Weapon> {
    const [existing] = await db.select().from(weapons).where(eq(weapons.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const whereClause = and(
      eq(weapons.id, id),
      eq(weapons.userId, userId),
      eq(weapons.notebookId, notebookId)
    );
    const [updatedWeapon] = await db.update(weapons)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedWeapon;
  }

  async deleteWeapon(id: string, userId: string, notebookId: string): Promise<void> {
    const [existing] = await db.select().from(weapons).where(eq(weapons.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const whereClause = and(
      eq(weapons.id, id),
      eq(weapons.userId, userId),
      eq(weapons.notebookId, notebookId)
    );
    await db.delete(weapons).where(whereClause);
  }

  // ========== PROFESSION METHODS ==========
  async createProfession(profession: InsertProfession): Promise<Profession> {
    const [newProfession] = await db.insert(professions).values(profession).returning();
    return newProfession;
  }

  async getProfession(id: string, userId: string, notebookId: string): Promise<Profession | undefined> {
    const [profession] = await db.select().from(professions).where(and(
      eq(professions.id, id),
      eq(professions.userId, userId),
      eq(professions.notebookId, notebookId)
    ));
    return profession || undefined;
  }

  async getUserProfessions(userId: string, notebookId: string): Promise<Profession[]> {
    return await db.select().from(professions)
      .where(and(
        eq(professions.userId, userId),
        eq(professions.notebookId, notebookId)
      ))
      .orderBy(desc(professions.createdAt));
  }

  async updateProfession(id: string, userId: string, updates: Partial<InsertProfession>): Promise<Profession> {
    const [existing] = await db.select().from(professions).where(eq(professions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedProfession] = await db.update(professions)
      .set(updates)
      .where(eq(professions.id, id))
      .returning();
    return updatedProfession;
  }

  async deleteProfession(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(professions).where(eq(professions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(professions).where(eq(professions.id, id));
  }

  // ========== RANK METHODS ==========
  async createRank(rank: InsertRank): Promise<Rank> {
    const [newRank] = await db.insert(ranks).values(rank).returning();
    return newRank;
  }

  async getRank(id: string, userId: string, notebookId: string): Promise<Rank | undefined> {
    const [rank] = await db.select().from(ranks).where(and(
      eq(ranks.id, id),
      eq(ranks.userId, userId),
      eq(ranks.notebookId, notebookId)
    ));
    return rank || undefined;
  }

  async getUserRanks(userId: string, notebookId: string): Promise<Rank[]> {
    return await db.select().from(ranks)
      .where(and(
        eq(ranks.userId, userId),
        eq(ranks.notebookId, notebookId)
      ))
      .orderBy(desc(ranks.createdAt));
  }

  async updateRank(id: string, userId: string, updates: Partial<InsertRank>): Promise<Rank> {
    const [existing] = await db.select().from(ranks).where(eq(ranks.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedRank] = await db.update(ranks)
      .set(updates)
      .where(eq(ranks.id, id))
      .returning();
    return updatedRank;
  }

  async deleteRank(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(ranks).where(eq(ranks.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(ranks).where(eq(ranks.id, id));
  }

  // ========== CONDITION METHODS ==========
  async createCondition(condition: InsertCondition): Promise<Condition> {
    const [newCondition] = await db.insert(conditions).values(condition).returning();
    return newCondition;
  }

  async getCondition(id: string, userId: string, notebookId: string): Promise<Condition | undefined> {
    const [condition] = await db.select().from(conditions).where(and(
      eq(conditions.id, id),
      eq(conditions.userId, userId),
      eq(conditions.notebookId, notebookId)
    ));
    return condition || undefined;
  }

  async getUserConditions(userId: string, notebookId: string): Promise<Condition[]> {
    return await db.select().from(conditions)
      .where(and(
        eq(conditions.userId, userId),
        eq(conditions.notebookId, notebookId)
      ))
      .orderBy(desc(conditions.createdAt));
  }

  async updateCondition(id: string, userId: string, updates: Partial<InsertCondition>): Promise<Condition> {
    const [existing] = await db.select().from(conditions).where(eq(conditions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedCondition] = await db.update(conditions)
      .set(updates)
      .where(eq(conditions.id, id))
      .returning();
    return updatedCondition;
  }

  async deleteCondition(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(conditions).where(eq(conditions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(conditions).where(eq(conditions.id, id));
  }

  // ========== PLANT METHODS ==========
  async createPlant(plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db.insert(plants).values(plant).returning();
    return newPlant;
  }

  async getPlant(id: string, userId: string, notebookId: string): Promise<Plant | undefined> {
    const whereClause = and(
      eq(plants.id, id),
      eq(plants.userId, userId),
      eq(plants.notebookId, notebookId)
    );
    const [plant] = await db.select().from(plants).where(whereClause);
    return plant || undefined;
  }

  async getUserPlants(userId: string, notebookId: string): Promise<Plant[]> {
    const whereClause = and(
      eq(plants.userId, userId),
      eq(plants.notebookId, notebookId)
    );
    return await db.select().from(plants)
      .where(whereClause)
      .orderBy(desc(plants.createdAt));
  }

  async updatePlant(id: string, userId: string, updates: Partial<InsertPlant>, notebookId: string): Promise<Plant> {
    const [existing] = await db.select().from(plants).where(eq(plants.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const whereClause = and(
      eq(plants.id, id),
      eq(plants.userId, userId),
      eq(plants.notebookId, notebookId)
    );
    const [updatedPlant] = await db.update(plants)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedPlant;
  }

  async deletePlant(id: string, userId: string, notebookId: string): Promise<void> {
    const [existing] = await db.select().from(plants).where(eq(plants.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const whereClause = and(
      eq(plants.id, id),
      eq(plants.userId, userId),
      eq(plants.notebookId, notebookId)
    );
    await db.delete(plants).where(whereClause);
  }

  // ========== DESCRIPTION METHODS ==========
  async createDescription(description: InsertDescription): Promise<Description> {
    const [newDescription] = await db.insert(descriptions).values(description).returning();
    return newDescription;
  }

  async getDescription(id: string, userId: string, notebookId: string): Promise<Description | undefined> {
    const [description] = await db.select().from(descriptions).where(and(
      eq(descriptions.id, id),
      eq(descriptions.userId, userId),
      eq(descriptions.notebookId, notebookId)
    ));
    return description || undefined;
  }

  async getUserDescriptions(userId: string, notebookId: string): Promise<Description[]> {
    return await db.select().from(descriptions)
      .where(eq(descriptions.userId, userId))
      .orderBy(desc(descriptions.createdAt));
  }

  async updateDescription(id: string, userId: string, updates: Partial<InsertDescription>): Promise<Description> {
    const [existing] = await db.select().from(descriptions).where(eq(descriptions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedDescription] = await db.update(descriptions)
      .set(updates)
      .where(eq(descriptions.id, id))
      .returning();
    return updatedDescription;
  }

  async deleteDescription(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(descriptions).where(eq(descriptions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(descriptions).where(eq(descriptions.id, id));
  }

  // ========== ETHNICITY METHODS ==========
  async createEthnicity(ethnicity: InsertEthnicity): Promise<Ethnicity> {
    const [newEthnicity] = await db.insert(ethnicities).values(ethnicity).returning();
    return newEthnicity;
  }

  async getEthnicity(id: string, userId: string, notebookId: string): Promise<Ethnicity | undefined> {
    const [ethnicity] = await db.select().from(ethnicities).where(and(
      eq(ethnicities.id, id),
      eq(ethnicities.userId, userId),
      eq(ethnicities.notebookId, notebookId)
    ));
    return ethnicity || undefined;
  }

  async getUserEthnicities(userId: string, notebookId: string): Promise<Ethnicity[]> {
    return await db.select().from(ethnicities)
      .where(and(
        eq(ethnicities.userId, userId),
        eq(ethnicities.notebookId, notebookId)
      ))
      .orderBy(desc(ethnicities.createdAt));
  }

  async updateEthnicity(id: string, userId: string, updates: Partial<InsertEthnicity>): Promise<Ethnicity> {
    const [existing] = await db.select().from(ethnicities).where(eq(ethnicities.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedEthnicity] = await db.update(ethnicities)
      .set(updates)
      .where(eq(ethnicities.id, id))
      .returning();
    return updatedEthnicity;
  }

  async deleteEthnicity(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(ethnicities).where(eq(ethnicities.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(ethnicities).where(eq(ethnicities.id, id));
  }

  // ========== DRINK METHODS ==========
  async createDrink(drink: InsertDrink): Promise<Drink> {
    const [newDrink] = await db.insert(drinks).values(drink).returning();
    return newDrink;
  }

  async getDrink(id: string, userId: string, notebookId: string): Promise<Drink | undefined> {
    const [drink] = await db.select().from(drinks).where(and(
      eq(drinks.id, id),
      eq(drinks.userId, userId),
      eq(drinks.notebookId, notebookId)
    ));
    return drink || undefined;
  }

  async getUserDrinks(userId: string, notebookId: string): Promise<Drink[]> {
    return await db.select().from(drinks)
      .where(and(
        eq(drinks.userId, userId),
        eq(drinks.notebookId, notebookId)
      ))
      .orderBy(desc(drinks.createdAt));
  }

  async updateDrink(id: string, userId: string, updates: Partial<InsertDrink>): Promise<Drink> {
    const [existing] = await db.select().from(drinks).where(eq(drinks.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedDrink] = await db.update(drinks)
      .set(updates)
      .where(eq(drinks.id, id))
      .returning();
    return updatedDrink;
  }

  async deleteDrink(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(drinks).where(eq(drinks.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(drinks).where(eq(drinks.id, id));
  }

  // ========== ARMOR METHODS ==========
  async createArmor(armorData: InsertArmor): Promise<Armor> {
    const [newArmor] = await db.insert(armor).values(armorData).returning();
    return newArmor;
  }

  async getArmor(id: string, userId: string, notebookId: string): Promise<Armor | undefined> {
    const [armorItem] = await db.select().from(armor).where(and(
      eq(armor.id, id),
      eq(armor.userId, userId),
      eq(armor.notebookId, notebookId)
    ));
    return armorItem || undefined;
  }

  async getUserArmor(userId: string, notebookId: string): Promise<Armor[]> {
    return await db.select().from(armor)
      .where(and(
        eq(armor.userId, userId),
        eq(armor.notebookId, notebookId)
      ))
      .orderBy(desc(armor.createdAt));
  }

  async updateArmor(id: string, userId: string, updates: Partial<InsertArmor>): Promise<Armor> {
    const [existing] = await db.select().from(armor).where(eq(armor.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedArmor] = await db.update(armor)
      .set(updates)
      .where(eq(armor.id, id))
      .returning();
    return updatedArmor;
  }

  async deleteArmor(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(armor).where(eq(armor.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(armor).where(eq(armor.id, id));
  }

  // ========== ACCESSORY METHODS ==========
  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    const [newAccessory] = await db.insert(accessories).values(accessory).returning();
    return newAccessory;
  }

  async getAccessory(id: string, userId: string, notebookId: string): Promise<Accessory | undefined> {
    const [accessory] = await db.select().from(accessories).where(and(
      eq(accessories.id, id),
      eq(accessories.userId, userId),
      eq(accessories.notebookId, notebookId)
    ));
    return accessory || undefined;
  }

  async getUserAccessories(userId: string, notebookId: string): Promise<Accessory[]> {
    return await db.select().from(accessories)
      .where(and(
        eq(accessories.userId, userId),
        eq(accessories.notebookId, notebookId)
      ))
      .orderBy(desc(accessories.createdAt));
  }

  async updateAccessory(id: string, userId: string, updates: Partial<InsertAccessory>): Promise<Accessory> {
    const [existing] = await db.select().from(accessories).where(eq(accessories.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedAccessory] = await db.update(accessories)
      .set(updates)
      .where(eq(accessories.id, id))
      .returning();
    return updatedAccessory;
  }

  async deleteAccessory(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(accessories).where(eq(accessories.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(accessories).where(eq(accessories.id, id));
  }

  // ========== CLOTHING METHODS ==========
  async createClothing(clothingData: InsertClothing): Promise<Clothing> {
    const [newClothing] = await db.insert(clothing).values(clothingData).returning();
    return newClothing;
  }

  async getClothing(id: string, userId: string, notebookId: string): Promise<Clothing | undefined> {
    const [clothingItem] = await db.select().from(clothing).where(and(
      eq(clothing.id, id),
      eq(clothing.userId, userId),
      eq(clothing.notebookId, notebookId)
    ));
    return clothingItem || undefined;
  }

  async getUserClothing(userId: string, notebookId: string): Promise<Clothing[]> {
    return await db.select().from(clothing)
      .where(and(
        eq(clothing.userId, userId),
        eq(clothing.notebookId, notebookId)
      ))
      .orderBy(desc(clothing.createdAt));
  }

  async updateClothing(id: string, userId: string, updates: Partial<InsertClothing>): Promise<Clothing> {
    const [existing] = await db.select().from(clothing).where(eq(clothing.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedClothing] = await db.update(clothing)
      .set(updates)
      .where(eq(clothing.id, id))
      .returning();
    return updatedClothing;
  }

  async deleteClothing(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(clothing).where(eq(clothing.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(clothing).where(eq(clothing.id, id));
  }

  // ========== MATERIAL METHODS ==========
  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [newMaterial] = await db.insert(materials).values(material).returning();
    return newMaterial;
  }

  async getMaterial(id: string, userId: string, notebookId: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(and(
      eq(materials.id, id),
      eq(materials.userId, userId),
      eq(materials.notebookId, notebookId)
    ));
    return material || undefined;
  }

  async getUserMaterials(userId: string, notebookId: string): Promise<Material[]> {
    return await db.select().from(materials)
      .where(and(
        eq(materials.userId, userId),
        eq(materials.notebookId, notebookId)
      ))
      .orderBy(desc(materials.createdAt));
  }

  async updateMaterial(id: string, userId: string, updates: Partial<InsertMaterial>): Promise<Material> {
    const [existing] = await db.select().from(materials).where(eq(materials.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedMaterial] = await db.update(materials)
      .set(updates)
      .where(eq(materials.id, id))
      .returning();
    return updatedMaterial;
  }

  async deleteMaterial(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(materials).where(eq(materials.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(materials).where(eq(materials.id, id));
  }

  // ========== SETTLEMENT METHODS ==========
  async createSettlement(settlement: InsertSettlement): Promise<Settlement> {
    const [newSettlement] = await db.insert(settlements).values(settlement).returning();
    return newSettlement;
  }

  async getSettlement(id: string, userId: string, notebookId: string): Promise<Settlement | undefined> {
    const [settlement] = await db.select().from(settlements).where(and(
      eq(settlements.id, id),
      eq(settlements.userId, userId),
      eq(settlements.notebookId, notebookId)
    ));
    return settlement || undefined;
  }

  async getUserSettlements(userId: string, notebookId: string): Promise<Settlement[]> {
    return await db.select().from(settlements)
      .where(and(
        eq(settlements.userId, userId),
        eq(settlements.notebookId, notebookId)
      ))
      .orderBy(desc(settlements.createdAt));
  }

  async updateSettlement(id: string, userId: string, updates: Partial<InsertSettlement>): Promise<Settlement> {
    const [existing] = await db.select().from(settlements).where(eq(settlements.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedSettlement] = await db.update(settlements)
      .set(updates)
      .where(eq(settlements.id, id))
      .returning();
    return updatedSettlement;
  }

  async deleteSettlement(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(settlements).where(eq(settlements.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(settlements).where(eq(settlements.id, id));
  }

  // ========== SOCIETY METHODS ==========
  async createSociety(society: InsertSociety): Promise<Society> {
    const [newSociety] = await db.insert(societies).values(society).returning();
    return newSociety;
  }

  async getSociety(id: string, userId: string, notebookId: string): Promise<Society | undefined> {
    const [society] = await db.select().from(societies).where(and(
      eq(societies.id, id),
      eq(societies.userId, userId),
      eq(societies.notebookId, notebookId)
    ));
    return society || undefined;
  }

  async getUserSocieties(userId: string, notebookId: string): Promise<Society[]> {
    return await db.select().from(societies)
      .where(and(
        eq(societies.userId, userId),
        eq(societies.notebookId, notebookId)
      ))
      .orderBy(desc(societies.createdAt));
  }

  async updateSociety(id: string, userId: string, updates: Partial<InsertSociety>): Promise<Society> {
    const [existing] = await db.select().from(societies).where(eq(societies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedSociety] = await db.update(societies)
      .set(updates)
      .where(eq(societies.id, id))
      .returning();
    return updatedSociety;
  }

  async deleteSociety(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(societies).where(eq(societies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(societies).where(eq(societies.id, id));
  }

  // ========== FACTION METHODS ==========
  async createFaction(faction: InsertFaction): Promise<Faction> {
    const [newFaction] = await db.insert(factions).values(faction).returning();
    return newFaction;
  }

  async getFaction(id: string, userId: string, notebookId: string): Promise<Faction | undefined> {
    const whereClause = and(
      eq(factions.id, id),
      eq(factions.userId, userId),
      eq(factions.notebookId, notebookId)
    );
    const [faction] = await db.select().from(factions).where(whereClause);
    return faction || undefined;
  }

  async getUserFaction(userId: string, notebookId: string): Promise<Faction[]> {
    const whereClause = and(
      eq(factions.userId, userId),
      eq(factions.notebookId, notebookId)
    );
    return await db.select().from(factions)
      .where(whereClause)
      .orderBy(desc(factions.createdAt));
  }

  async updateFaction(id: string, userId: string, updates: Partial<InsertFaction>, notebookId: string): Promise<Faction> {
    const [existing] = await db.select().from(factions).where(eq(factions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const whereClause = and(
      eq(factions.id, id),
      eq(factions.userId, userId),
      eq(factions.notebookId, notebookId)
    );
    const [updatedFaction] = await db.update(factions)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedFaction;
  }

  async deleteFaction(id: string, userId: string, notebookId: string): Promise<void> {
    const [existing] = await db.select().from(factions).where(eq(factions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const whereClause = and(
      eq(factions.id, id),
      eq(factions.userId, userId),
      eq(factions.notebookId, notebookId)
    );
    await db.delete(factions).where(whereClause);
  }

  // ========== MILITARY UNIT METHODS ==========
  async createMilitaryUnit(militaryUnit: InsertMilitaryUnit): Promise<MilitaryUnit> {
    const [newMilitaryUnit] = await db.insert(militaryUnits).values(militaryUnit).returning();
    return newMilitaryUnit;
  }

  async getMilitaryUnit(id: string, userId: string, notebookId: string): Promise<MilitaryUnit | undefined> {
    const [militaryUnit] = await db.select().from(militaryUnits).where(and(
      eq(militaryUnits.id, id),
      eq(militaryUnits.userId, userId),
      eq(militaryUnits.notebookId, notebookId)
    ));
    return militaryUnit || undefined;
  }

  async getUserMilitaryUnits(userId: string, notebookId: string): Promise<MilitaryUnit[]> {
    return await db.select().from(militaryUnits)
      .where(and(
        eq(militaryUnits.userId, userId),
        eq(militaryUnits.notebookId, notebookId)
      ))
      .orderBy(desc(militaryUnits.createdAt));
  }

  async updateMilitaryUnit(id: string, userId: string, updates: Partial<InsertMilitaryUnit>): Promise<MilitaryUnit> {
    const [existing] = await db.select().from(militaryUnits).where(eq(militaryUnits.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedMilitaryUnit] = await db.update(militaryUnits)
      .set(updates)
      .where(eq(militaryUnits.id, id))
      .returning();
    return updatedMilitaryUnit;
  }

  async deleteMilitaryUnit(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(militaryUnits).where(eq(militaryUnits.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(militaryUnits).where(eq(militaryUnits.id, id));
  }

  // ========== MYTH METHODS ==========
  async createMyth(myth: InsertMyth): Promise<Myth> {
    const [newMyth] = await db.insert(myths).values(myth).returning();
    return newMyth;
  }

  async getMyth(id: string, userId: string, notebookId: string): Promise<Myth | undefined> {
    const [myth] = await db.select().from(myths).where(and(
      eq(myths.id, id),
      eq(myths.userId, userId),
      eq(myths.notebookId, notebookId)
    ));
    return myth || undefined;
  }

  async getUserMyths(userId: string, notebookId: string): Promise<Myth[]> {
    return await db.select().from(myths)
      .where(and(
        eq(myths.userId, userId),
        eq(myths.notebookId, notebookId)
      ))
      .orderBy(desc(myths.createdAt));
  }

  async updateMyth(id: string, userId: string, updates: Partial<InsertMyth>): Promise<Myth> {
    const [existing] = await db.select().from(myths).where(eq(myths.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedMyth] = await db.update(myths)
      .set(updates)
      .where(eq(myths.id, id))
      .returning();
    return updatedMyth;
  }

  async deleteMyth(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(myths).where(eq(myths.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(myths).where(eq(myths.id, id));
  }

  // ========== LEGEND METHODS ==========
  async createLegend(legend: InsertLegend): Promise<Legend> {
    const [newLegend] = await db.insert(legends).values(legend).returning();
    return newLegend;
  }

  async getLegend(id: string, userId: string, notebookId: string): Promise<Legend | undefined> {
    const [legend] = await db.select().from(legends).where(and(
      eq(legends.id, id),
      eq(legends.userId, userId),
      eq(legends.notebookId, notebookId)
    ));
    return legend || undefined;
  }

  async getUserLegends(userId: string, notebookId: string): Promise<Legend[]> {
    return await db.select().from(legends)
      .where(and(
        eq(legends.userId, userId),
        eq(legends.notebookId, notebookId)
      ))
      .orderBy(desc(legends.createdAt));
  }

  async updateLegend(id: string, userId: string, updates: Partial<InsertLegend>): Promise<Legend> {
    const [existing] = await db.select().from(legends).where(eq(legends.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedLegend] = await db.update(legends)
      .set(updates)
      .where(eq(legends.id, id))
      .returning();
    return updatedLegend;
  }

  async deleteLegend(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(legends).where(eq(legends.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(legends).where(eq(legends.id, id));
  }

  // ========== EVENT METHODS ==========
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvent(id: string, userId: string, notebookId: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(and(
      eq(events.id, id),
      eq(events.userId, userId),
      eq(events.notebookId, notebookId)
    ));
    return event || undefined;
  }

  async getUserEvents(userId: string, notebookId: string): Promise<Event[]> {
    return await db.select().from(events)
      .where(and(
        eq(events.userId, userId),
        eq(events.notebookId, notebookId)
      ))
      .orderBy(desc(events.createdAt));
  }

  async updateEvent(id: string, userId: string, updates: Partial<InsertEvent>): Promise<Event> {
    const [existing] = await db.select().from(events).where(eq(events.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedEvent] = await db.update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(events).where(eq(events.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(events).where(eq(events.id, id));
  }

  // ========== SPELL METHODS ==========
  async createSpell(spell: InsertSpell): Promise<Spell> {
    const [newSpell] = await db.insert(spells).values(spell).returning();
    return newSpell;
  }

  async getSpell(id: string, userId: string, notebookId: string): Promise<Spell | undefined> {
    const [spell] = await db.select().from(spells).where(and(
      eq(spells.id, id),
      eq(spells.userId, userId),
      eq(spells.notebookId, notebookId)
    ));
    return spell || undefined;
  }

  async getUserSpells(userId: string, notebookId: string): Promise<Spell[]> {
    return await db.select().from(spells)
      .where(and(
        eq(spells.userId, userId),
        eq(spells.notebookId, notebookId)
      ))
      .orderBy(desc(spells.createdAt));
  }

  async updateSpell(id: string, userId: string, updates: Partial<InsertSpell>): Promise<Spell> {
    const [existing] = await db.select().from(spells).where(eq(spells.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedSpell] = await db.update(spells)
      .set(updates)
      .where(eq(spells.id, id))
      .returning();
    return updatedSpell;
  }

  async deleteSpell(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(spells).where(eq(spells.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(spells).where(eq(spells.id, id));
  }

  // ========== RESOURCE METHODS ==========
  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async getResource(id: string, userId: string, notebookId: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(and(
      eq(resources.id, id),
      eq(resources.userId, userId),
      eq(resources.notebookId, notebookId)
    ));
    return resource || undefined;
  }

  async getUserResources(userId: string, notebookId: string): Promise<Resource[]> {
    return await db.select().from(resources)
      .where(and(
        eq(resources.userId, userId),
        eq(resources.notebookId, notebookId)
      ))
      .orderBy(desc(resources.createdAt));
  }

  async updateResource(id: string, userId: string, updates: Partial<InsertResource>): Promise<Resource> {
    const [existing] = await db.select().from(resources).where(eq(resources.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedResource] = await db.update(resources)
      .set(updates)
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  async deleteResource(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(resources).where(eq(resources.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(resources).where(eq(resources.id, id));
  }

  // ========== BUILDING METHODS ==========
  async createBuilding(building: InsertBuilding): Promise<Building> {
    const [newBuilding] = await db.insert(buildings).values(building).returning();
    return newBuilding;
  }

  async getBuilding(id: string, userId: string, notebookId: string): Promise<Building | undefined> {
    const [building] = await db.select().from(buildings).where(and(
      eq(buildings.id, id),
      eq(buildings.userId, userId),
      eq(buildings.notebookId, notebookId)
    ));
    return building || undefined;
  }

  async getUserBuildings(userId: string, notebookId: string): Promise<Building[]> {
    return await db.select().from(buildings)
      .where(and(
        eq(buildings.userId, userId),
        eq(buildings.notebookId, notebookId)
      ))
      .orderBy(desc(buildings.createdAt));
  }

  async updateBuilding(id: string, userId: string, updates: Partial<InsertBuilding>): Promise<Building> {
    const [existing] = await db.select().from(buildings).where(eq(buildings.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedBuilding] = await db.update(buildings)
      .set(updates)
      .where(eq(buildings.id, id))
      .returning();
    return updatedBuilding;
  }

  async deleteBuilding(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(buildings).where(eq(buildings.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(buildings).where(eq(buildings.id, id));
  }

  // ========== ANIMAL METHODS ==========
  async createAnimal(animal: InsertAnimal): Promise<Animal> {
    const [newAnimal] = await db.insert(animals).values(animal).returning();
    return newAnimal;
  }

  async getAnimal(id: string, userId: string, notebookId: string): Promise<Animal | undefined> {
    const [animal] = await db.select().from(animals).where(and(
      eq(animals.id, id),
      eq(animals.userId, userId),
      eq(animals.notebookId, notebookId)
    ));
    return animal || undefined;
  }

  async getUserAnimals(userId: string, notebookId: string): Promise<Animal[]> {
    return await db.select().from(animals)
      .where(and(
        eq(animals.userId, userId),
        eq(animals.notebookId, notebookId)
      ))
      .orderBy(desc(animals.createdAt));
  }

  async updateAnimal(id: string, userId: string, updates: Partial<InsertAnimal>): Promise<Animal> {
    const [existing] = await db.select().from(animals).where(eq(animals.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedAnimal] = await db.update(animals)
      .set(updates)
      .where(eq(animals.id, id))
      .returning();
    return updatedAnimal;
  }

  async deleteAnimal(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(animals).where(eq(animals.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(animals).where(eq(animals.id, id));
  }

  // ========== TRANSPORTATION METHODS ==========
  async createTransportation(transportData: InsertTransportation): Promise<Transportation> {
    const [newTransportation] = await db.insert(transportation).values(transportData).returning();
    return newTransportation;
  }

  async getTransportation(id: string, userId: string, notebookId: string): Promise<Transportation | undefined> {
    const [transportItem] = await db.select().from(transportation).where(and(
      eq(transportation.id, id),
      eq(transportation.userId, userId),
      eq(transportation.notebookId, notebookId)
    ));
    return transportItem || undefined;
  }

  async getUserTransportation(userId: string, notebookId: string): Promise<Transportation[]> {
    return await db.select().from(transportation)
      .where(and(
        eq(transportation.userId, userId),
        eq(transportation.notebookId, notebookId)
      ))
      .orderBy(desc(transportation.createdAt));
  }

  async updateTransportation(id: string, userId: string, updates: Partial<InsertTransportation>): Promise<Transportation> {
    const [existing] = await db.select().from(transportation).where(eq(transportation.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedTransportation] = await db.update(transportation)
      .set(updates)
      .where(eq(transportation.id, id))
      .returning();
    return updatedTransportation;
  }

  async deleteTransportation(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(transportation).where(eq(transportation.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(transportation).where(eq(transportation.id, id));
  }

  // ========== NATURAL LAW METHODS ==========
  async createNaturalLaw(naturalLaw: InsertNaturalLaw): Promise<NaturalLaw> {
    const [newNaturalLaw] = await db.insert(naturalLaws).values(naturalLaw).returning();
    return newNaturalLaw;
  }

  async getNaturalLaw(id: string, userId: string, notebookId: string): Promise<NaturalLaw | undefined> {
    const [naturalLaw] = await db.select().from(naturalLaws).where(and(
      eq(naturalLaws.id, id),
      eq(naturalLaws.userId, userId),
      eq(naturalLaws.notebookId, notebookId)
    ));
    return naturalLaw || undefined;
  }

  async getUserNaturalLaws(userId: string, notebookId: string): Promise<NaturalLaw[]> {
    return await db.select().from(naturalLaws)
      .where(and(
        eq(naturalLaws.userId, userId),
        eq(naturalLaws.notebookId, notebookId)
      ))
      .orderBy(desc(naturalLaws.createdAt));
  }

  async updateNaturalLaw(id: string, userId: string, updates: Partial<InsertNaturalLaw>): Promise<NaturalLaw> {
    const [existing] = await db.select().from(naturalLaws).where(eq(naturalLaws.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedNaturalLaw] = await db.update(naturalLaws)
      .set(updates)
      .where(eq(naturalLaws.id, id))
      .returning();
    return updatedNaturalLaw;
  }

  async deleteNaturalLaw(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(naturalLaws).where(eq(naturalLaws.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(naturalLaws).where(eq(naturalLaws.id, id));
  }

  // ========== TRADITION METHODS ==========
  async createTradition(tradition: InsertTradition): Promise<Tradition> {
    const [newTradition] = await db.insert(traditions).values(tradition).returning();
    return newTradition;
  }

  async getTradition(id: string, userId: string, notebookId: string): Promise<Tradition | undefined> {
    const [tradition] = await db.select().from(traditions).where(and(
      eq(traditions.id, id),
      eq(traditions.userId, userId),
      eq(traditions.notebookId, notebookId)
    ));
    return tradition || undefined;
  }

  async getUserTraditions(userId: string, notebookId: string): Promise<Tradition[]> {
    return await db.select().from(traditions)
      .where(and(
        eq(traditions.userId, userId),
        eq(traditions.notebookId, notebookId)
      ))
      .orderBy(desc(traditions.createdAt));
  }

  async updateTradition(id: string, userId: string, updates: Partial<InsertTradition>): Promise<Tradition> {
    const [existing] = await db.select().from(traditions).where(eq(traditions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedTradition] = await db.update(traditions)
      .set(updates)
      .where(eq(traditions.id, id))
      .returning();
    return updatedTradition;
  }

  async deleteTradition(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(traditions).where(eq(traditions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(traditions).where(eq(traditions.id, id));
  }

  // ========== RITUAL METHODS ==========
  async createRitual(ritual: InsertRitual): Promise<Ritual> {
    const [newRitual] = await db.insert(rituals).values(ritual).returning();
    return newRitual;
  }

  async getRitual(id: string, userId: string, notebookId: string): Promise<Ritual | undefined> {
    const [ritual] = await db.select().from(rituals).where(and(
      eq(rituals.id, id),
      eq(rituals.userId, userId),
      eq(rituals.notebookId, notebookId)
    ));
    return ritual || undefined;
  }

  async getUserRituals(userId: string, notebookId: string): Promise<Ritual[]> {
    return await db.select().from(rituals)
      .where(and(
        eq(rituals.userId, userId),
        eq(rituals.notebookId, notebookId)
      ))
      .orderBy(desc(rituals.createdAt));
  }

  async updateRitual(id: string, userId: string, updates: Partial<InsertRitual>): Promise<Ritual> {
    const [existing] = await db.select().from(rituals).where(eq(rituals.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedRitual] = await db.update(rituals)
      .set(updates)
      .where(eq(rituals.id, id))
      .returning();
    return updatedRitual;
  }

  async deleteRitual(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(rituals).where(eq(rituals.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(rituals).where(eq(rituals.id, id));
  }

  // ========== SAVED ITEM METHODS ==========
  async saveItem(savedItem: InsertSavedItem): Promise<SavedItem> {
    try {
      const [newSavedItem] = await db.insert(savedItems).values(savedItem).returning();
      return newSavedItem;
    } catch (error: any) {
      if (error?.code === '23505' || error?.message?.includes('unique')) {
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

  // ========== NAME METHODS ==========
  async createName(name: InsertName): Promise<GeneratedName> {
    const [newName] = await db.insert(names).values(name).returning();
    return newName;
  }

  async getName(id: string, userId: string, notebookId: string): Promise<GeneratedName | undefined> {
    const [name] = await db.select().from(names).where(and(
      eq(names.id, id),
      eq(names.userId, userId),
      eq(names.notebookId, notebookId)
    ));
    return name || undefined;
  }

  async getUserNames(userId: string, notebookId: string): Promise<GeneratedName[]> {
    return await db.select().from(names)
      .where(eq(names.userId, userId))
      .orderBy(desc(names.createdAt));
  }

  async updateName(id: string, userId: string, updates: Partial<InsertName>): Promise<GeneratedName> {
    const [existing] = await db.select().from(names).where(eq(names.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedName] = await db.update(names)
      .set(updates)
      .where(eq(names.id, id))
      .returning();
    return updatedName;
  }

  async deleteName(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(names).where(eq(names.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(names).where(eq(names.id, id));
  }

  // ========== THEME METHODS ==========
  async createTheme(theme: InsertTheme): Promise<Theme> {
    const [newTheme] = await db.insert(themes).values(theme).returning();
    return newTheme;
  }

  async getTheme(id: string, userId: string, notebookId: string): Promise<Theme | undefined> {
    const [theme] = await db.select().from(themes).where(and(
      eq(themes.id, id),
      eq(themes.userId, userId),
      eq(themes.notebookId, notebookId)
    ));
    return theme || undefined;
  }

  async getUserThemes(userId: string, notebookId: string): Promise<Theme[]> {
    return await db.select().from(themes)
      .where(and(
        eq(themes.userId, userId),
        eq(themes.notebookId, notebookId)
      ))
      .orderBy(desc(themes.createdAt));
  }

  async updateTheme(id: string, userId: string, updates: Partial<InsertTheme>): Promise<Theme> {
    const [existing] = await db.select().from(themes).where(eq(themes.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedTheme] = await db.update(themes)
      .set(updates)
      .where(eq(themes.id, id))
      .returning();
    return updatedTheme;
  }

  async deleteTheme(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(themes).where(eq(themes.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(themes).where(eq(themes.id, id));
  }

  // ========== MOOD METHODS ==========
  async createMood(mood: InsertMood): Promise<Mood> {
    const [newMood] = await db.insert(moods).values(mood).returning();
    return newMood;
  }

  async getMood(id: string, userId: string, notebookId: string): Promise<Mood | undefined> {
    const [mood] = await db.select().from(moods).where(and(
      eq(moods.id, id),
      eq(moods.userId, userId),
      eq(moods.notebookId, notebookId)
    ));
    return mood || undefined;
  }

  async getUserMoods(userId: string, notebookId: string): Promise<Mood[]> {
    return await db.select().from(moods)
      .where(eq(moods.userId, userId))
      .orderBy(desc(moods.createdAt));
  }

  async updateMood(id: string, userId: string, updates: Partial<InsertMood>): Promise<Mood> {
    const [existing] = await db.select().from(moods).where(eq(moods.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedMood] = await db.update(moods)
      .set(updates)
      .where(eq(moods.id, id))
      .returning();
    return updatedMood;
  }

  async deleteMood(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(moods).where(eq(moods.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(moods).where(eq(moods.id, id));
  }

  // ========== CONFLICT METHODS ==========
  async createConflict(conflict: InsertConflict): Promise<Conflict> {
    const [newConflict] = await db.insert(conflicts).values(conflict).returning();
    return newConflict;
  }

  async getConflict(id: string, userId: string, notebookId: string): Promise<Conflict | undefined> {
    const [conflict] = await db.select().from(conflicts).where(and(
      eq(conflicts.id, id),
      eq(conflicts.userId, userId),
      eq(conflicts.notebookId, notebookId)
    ));
    return conflict || undefined;
  }

  async getUserConflicts(userId: string, notebookId: string): Promise<Conflict[]> {
    return await db.select().from(conflicts)
      .where(and(
        eq(conflicts.userId, userId),
        eq(conflicts.notebookId, notebookId)
      ))
      .orderBy(desc(conflicts.createdAt));
  }

  async updateConflict(id: string, userId: string, updates: Partial<InsertConflict>): Promise<Conflict> {
    const [existing] = await db.select().from(conflicts).where(eq(conflicts.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedConflict] = await db.update(conflicts)
      .set(updates)
      .where(eq(conflicts.id, id))
      .returning();
    return updatedConflict;
  }

  async deleteConflict(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(conflicts).where(eq(conflicts.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(conflicts).where(eq(conflicts.id, id));
  }

  // ========== GUIDE METHODS ==========
  async createGuide(guide: InsertGuide): Promise<Guide> {
    const [newGuide] = await db.insert(guides).values(guide).returning();
    return newGuide;
  }

  async getGuide(id: string): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guides).where(eq(guides.id, id));
    return guide || undefined;
  }

  async getUserGuides(userId: string, notebookId: string): Promise<Guide[]> {
    return await db.select().from(guides)
      .where(and(
        eq(guides.userId, userId),
        eq(guides.notebookId, notebookId)
      ))
      .orderBy(desc(guides.createdAt));
  }

  async updateGuide(id: string, updates: Partial<InsertGuide>): Promise<Guide | undefined> {
    const [updatedGuide] = await db.update(guides)
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

  // ========== TIMELINE METHODS ==========
  async createTimeline(timeline: InsertTimeline): Promise<Timeline> {
    const [newTimeline] = await db.insert(timelines).values(timeline).returning();
    return newTimeline;
  }

  async getTimeline(id: string, userId: string, notebookId: string): Promise<Timeline | undefined> {
    const [timeline] = await db.select().from(timelines).where(and(
      eq(timelines.id, id),
      eq(timelines.userId, userId),
      eq(timelines.notebookId, notebookId)
    ));
    return timeline || undefined;
  }

  async getUserTimelines(userId: string, notebookId: string): Promise<Timeline[]> {
    return await db.select().from(timelines)
      .where(and(
        eq(timelines.userId, userId),
        eq(timelines.notebookId, notebookId)
      ))
      .orderBy(desc(timelines.createdAt));
  }

  async updateTimeline(id: string, userId: string, updates: Partial<InsertTimeline>): Promise<Timeline> {
    const [existing] = await db.select().from(timelines).where(eq(timelines.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedTimeline] = await db.update(timelines)
      .set(updates)
      .where(eq(timelines.id, id))
      .returning();
    return updatedTimeline;
  }

  async deleteTimeline(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(timelines).where(eq(timelines.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(timelines).where(eq(timelines.id, id));
  }

  // ========== TIMELINE EVENT METHODS ==========
  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const [newEvent] = await db.insert(timelineEvents).values(event).returning();
    return newEvent;
  }

  async getTimelineEvent(id: string, userId: string, timelineId: string): Promise<any> {
    const [timeline] = await db.select().from(timelines).where(eq(timelines.id, timelineId));
    if (!this.validateContentOwnership(timeline, userId)) {
      throw new Error('Unauthorized: You do not own this timeline');
    }

    const [event] = await db.select().from(timelineEvents).where(and(
      eq(timelineEvents.id, id),
      eq(timelineEvents.timelineId, timelineId)
    ));
    return event || undefined;
  }

  async getTimelineEvents(timelineId: string, userId: string): Promise<any[]> {
    const [timeline] = await db.select().from(timelines).where(eq(timelines.id, timelineId));
    if (!this.validateContentOwnership(timeline, userId)) {
      throw new Error('Unauthorized: You do not own this timeline');
    }

    return await db.select().from(timelineEvents)
      .where(eq(timelineEvents.timelineId, timelineId))
      .orderBy(timelineEvents.startDate);
  }

  async updateTimelineEvent(id: string, userId: string, updates: any): Promise<any> {
    const [existing] = await db.select().from(timelineEvents).where(eq(timelineEvents.id, id));
    if (!existing) {
      throw new Error('Timeline event not found');
    }

    const [timeline] = await db.select().from(timelines).where(eq(timelines.id, existing.timelineId));
    if (!this.validateContentOwnership(timeline, userId)) {
      throw new Error('Unauthorized: You do not own this timeline');
    }

    const [updatedEvent] = await db
      .update(timelineEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(timelineEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteTimelineEvent(id: string, userId: string, timelineId: string): Promise<void> {
    const [timeline] = await db.select().from(timelines).where(eq(timelines.id, timelineId));
    if (!this.validateContentOwnership(timeline, userId)) {
      throw new Error('Unauthorized: You do not own this timeline');
    }

    await db.delete(timelineEvents).where(and(
      eq(timelineEvents.id, id),
      eq(timelineEvents.timelineId, timelineId)
    ));
  }

  // ========== TIMELINE RELATIONSHIP METHODS ==========
  async createTimelineRelationship(relationship: InsertTimelineRelationship): Promise<TimelineRelationship> {
    const [newRelationship] = await db.insert(timelineRelationships).values(relationship).returning();
    return newRelationship;
  }

  async getTimelineRelationships(timelineId: string, userId: string): Promise<any[]> {
    const [timeline] = await db.select().from(timelines).where(eq(timelines.id, timelineId));
    if (!this.validateContentOwnership(timeline, userId)) {
      throw new Error('Unauthorized: You do not own this timeline');
    }

    return await db.select().from(timelineRelationships)
      .where(eq(timelineRelationships.timelineId, timelineId))
      .orderBy(desc(timelineRelationships.createdAt));
  }

  async updateTimelineRelationship(id: string, userId: string, updates: any): Promise<any> {
    const [existing] = await db.select().from(timelineRelationships).where(eq(timelineRelationships.id, id));
    if (!existing) {
      throw new Error('Timeline relationship not found');
    }

    const [timeline] = await db.select().from(timelines).where(eq(timelines.id, existing.timelineId));
    if (!this.validateContentOwnership(timeline, userId)) {
      throw new Error('Unauthorized: You do not own this timeline');
    }

    const [updated] = await db
      .update(timelineRelationships)
      .set(updates)
      .where(eq(timelineRelationships.id, id))
      .returning();
    return updated;
  }

  async deleteTimelineRelationship(id: string, userId: string, timelineId: string): Promise<void> {
    const [timeline] = await db.select().from(timelines).where(eq(timelines.id, timelineId));
    if (!this.validateContentOwnership(timeline, userId)) {
      throw new Error('Unauthorized: You do not own this timeline');
    }

    await db.delete(timelineRelationships).where(and(
      eq(timelineRelationships.id, id),
      eq(timelineRelationships.timelineId, timelineId)
    ));
  }

  // ========== CEREMONY METHODS ==========
  async createCeremony(ceremony: InsertCeremony): Promise<Ceremony> {
    const [newCeremony] = await db.insert(ceremonies).values(ceremony).returning();
    return newCeremony;
  }

  async getCeremony(id: string, userId: string, notebookId: string): Promise<Ceremony | undefined> {
    const [ceremony] = await db.select().from(ceremonies).where(and(
      eq(ceremonies.id, id),
      eq(ceremonies.userId, userId),
      eq(ceremonies.notebookId, notebookId)
    ));
    return ceremony || undefined;
  }

  async getUserCeremonies(userId: string, notebookId: string): Promise<Ceremony[]> {
    return await db.select().from(ceremonies)
      .where(and(
        eq(ceremonies.userId, userId),
        eq(ceremonies.notebookId, notebookId)
      ))
      .orderBy(desc(ceremonies.createdAt));
  }

  async updateCeremony(id: string, userId: string, updates: Partial<InsertCeremony>): Promise<Ceremony> {
    const [existing] = await db.select().from(ceremonies).where(eq(ceremonies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedCeremony] = await db.update(ceremonies)
      .set(updates)
      .where(eq(ceremonies.id, id))
      .returning();
    return updatedCeremony;
  }

  async deleteCeremony(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(ceremonies).where(eq(ceremonies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(ceremonies).where(eq(ceremonies.id, id));
  }

  // ========== MAP METHODS ==========
  async createMap(map: InsertMap): Promise<Map> {
    const [newMap] = await db.insert(maps).values(map).returning();
    return newMap;
  }

  async getMap(id: string, userId: string, notebookId: string): Promise<Map | undefined> {
    const [map] = await db.select().from(maps).where(and(
      eq(maps.id, id),
      eq(maps.userId, userId),
      eq(maps.notebookId, notebookId)
    ));
    return map || undefined;
  }

  async getUserMaps(userId: string, notebookId: string): Promise<Map[]> {
    return await db.select().from(maps)
      .where(and(
        eq(maps.userId, userId),
        eq(maps.notebookId, notebookId)
      ))
      .orderBy(desc(maps.createdAt));
  }

  async updateMap(id: string, userId: string, updates: Partial<InsertMap>): Promise<Map> {
    const [existing] = await db.select().from(maps).where(eq(maps.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedMap] = await db.update(maps)
      .set(updates)
      .where(eq(maps.id, id))
      .returning();
    return updatedMap;
  }

  async deleteMap(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(maps).where(eq(maps.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(maps).where(eq(maps.id, id));
  }

  // ========== MUSIC METHODS ==========
  async createMusic(musicData: InsertMusic): Promise<Music> {
    const [newMusic] = await db.insert(music).values(musicData).returning();
    return newMusic;
  }

  async getMusic(id: string, userId: string, notebookId: string): Promise<Music | undefined> {
    const [musicItem] = await db.select().from(music).where(and(
      eq(music.id, id),
      eq(music.userId, userId),
      eq(music.notebookId, notebookId)
    ));
    return musicItem || undefined;
  }

  async getUserMusic(userId: string, notebookId: string): Promise<Music[]> {
    return await db.select().from(music)
      .where(and(
        eq(music.userId, userId),
        eq(music.notebookId, notebookId)
      ))
      .orderBy(desc(music.createdAt));
  }

  async updateMusic(id: string, userId: string, updates: Partial<InsertMusic>): Promise<Music> {
    const [existing] = await db.select().from(music).where(eq(music.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedMusic] = await db.update(music)
      .set(updates)
      .where(eq(music.id, id))
      .returning();
    return updatedMusic;
  }

  async deleteMusic(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(music).where(eq(music.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(music).where(eq(music.id, id));
  }

  // ========== DANCE METHODS ==========
  async createDance(dance: InsertDance): Promise<Dance> {
    const [newDance] = await db.insert(dances).values(dance).returning();
    return newDance;
  }

  async getDance(id: string, userId: string, notebookId: string): Promise<Dance | undefined> {
    const [dance] = await db.select().from(dances).where(and(
      eq(dances.id, id),
      eq(dances.userId, userId),
      eq(dances.notebookId, notebookId)
    ));
    return dance || undefined;
  }

  async getUserDances(userId: string, notebookId: string): Promise<Dance[]> {
    return await db.select().from(dances)
      .where(and(
        eq(dances.userId, userId),
        eq(dances.notebookId, notebookId)
      ))
      .orderBy(desc(dances.createdAt));
  }

  async updateDance(id: string, userId: string, updates: Partial<InsertDance>): Promise<Dance> {
    const [existing] = await db.select().from(dances).where(eq(dances.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedDance] = await db.update(dances)
      .set(updates)
      .where(eq(dances.id, id))
      .returning();
    return updatedDance;
  }

  async deleteDance(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(dances).where(eq(dances.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(dances).where(eq(dances.id, id));
  }

  // ========== LAW METHODS ==========
  async createLaw(law: InsertLaw): Promise<Law> {
    const [newLaw] = await db.insert(laws).values(law).returning();
    return newLaw;
  }

  async getLaw(id: string, userId: string, notebookId: string): Promise<Law | undefined> {
    const [law] = await db.select().from(laws).where(and(
      eq(laws.id, id),
      eq(laws.userId, userId),
      eq(laws.notebookId, notebookId)
    ));
    return law || undefined;
  }

  async getUserLaws(userId: string, notebookId: string): Promise<Law[]> {
    return await db.select().from(laws)
      .where(and(
        eq(laws.userId, userId),
        eq(laws.notebookId, notebookId)
      ))
      .orderBy(desc(laws.createdAt));
  }

  async updateLaw(id: string, userId: string, updates: Partial<InsertLaw>): Promise<Law> {
    const [existing] = await db.select().from(laws).where(eq(laws.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedLaw] = await db.update(laws)
      .set(updates)
      .where(eq(laws.id, id))
      .returning();
    return updatedLaw;
  }

  async deleteLaw(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(laws).where(eq(laws.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(laws).where(eq(laws.id, id));
  }

  // ========== POLICY METHODS ==========
  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    const [newPolicy] = await db.insert(policies).values(policy).returning();
    return newPolicy;
  }

  async getPolicy(id: string, userId: string, notebookId: string): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(and(
      eq(policies.id, id),
      eq(policies.userId, userId),
      eq(policies.notebookId, notebookId)
    ));
    return policy || undefined;
  }

  async getUserPolicies(userId: string, notebookId: string): Promise<Policy[]> {
    return await db.select().from(policies)
      .where(and(
        eq(policies.userId, userId),
        eq(policies.notebookId, notebookId)
      ))
      .orderBy(desc(policies.createdAt));
  }

  async updatePolicy(id: string, userId: string, updates: Partial<InsertPolicy>): Promise<Policy> {
    const [existing] = await db.select().from(policies).where(eq(policies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedPolicy] = await db.update(policies)
      .set(updates)
      .where(eq(policies.id, id))
      .returning();
    return updatedPolicy;
  }

  async deletePolicy(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(policies).where(eq(policies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(policies).where(eq(policies.id, id));
  }

  // ========== POTION METHODS ==========
  async createPotion(potion: InsertPotion): Promise<Potion> {
    const [newPotion] = await db.insert(potions).values(potion).returning();
    return newPotion;
  }

  async getPotion(id: string, userId: string, notebookId: string): Promise<Potion | undefined> {
    const [potion] = await db.select().from(potions).where(and(
      eq(potions.id, id),
      eq(potions.userId, userId),
      eq(potions.notebookId, notebookId)
    ));
    return potion || undefined;
  }

  async getUserPotions(userId: string, notebookId: string): Promise<Potion[]> {
    return await db.select().from(potions)
      .where(and(
        eq(potions.userId, userId),
        eq(potions.notebookId, notebookId)
      ))
      .orderBy(desc(potions.createdAt));
  }

  async updatePotion(id: string, userId: string, updates: Partial<InsertPotion>): Promise<Potion> {
    const [existing] = await db.select().from(potions).where(eq(potions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    const [updatedPotion] = await db.update(potions)
      .set(updates)
      .where(eq(potions.id, id))
      .returning();
    return updatedPotion;
  }

  async deletePotion(id: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(potions).where(eq(potions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    await db.delete(potions).where(eq(potions.id, id));
  }

  // ========== FOLDER METHODS ==========
  async createFolder(folder: InsertFolder): Promise<Folder> {
    const result = await db.insert(folders).values(folder).returning();
    return result[0];
  }

  async getFolder(id: string, userId: string): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(and(
      eq(folders.id, id),
      eq(folders.userId, userId)
    ));
    return folder || undefined;
  }

  async getUserFolders(userId: string, type?: string): Promise<Folder[]> {
    const conditions = [eq(folders.userId, userId)];
    if (type) {
      conditions.push(eq(folders.type, type));
    }
    return await db.select().from(folders)
      .where(and(...conditions))
      .orderBy(folders.sortOrder, folders.createdAt);
  }

  async getDocumentFolders(documentId: string, userId: string): Promise<Folder[]> {
    return await db.select().from(folders)
      .where(and(
        eq(folders.userId, userId),
        eq(folders.guideId, documentId)
      ))
      .orderBy(folders.sortOrder, folders.createdAt);
  }

  async updateFolder(id: string, userId: string, updates: Partial<InsertFolder>): Promise<Folder> {
    const result = await db.update(folders)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(folders.id, id),
        eq(folders.userId, userId)
      ))
      .returning();
    const updatedFolder = result[0];
    if (!updatedFolder) {
      throw new Error("Folder not found or unauthorized");
    }
    return updatedFolder;
  }

  async deleteFolder(id: string, userId: string): Promise<void> {
    await db.delete(folders).where(and(
      eq(folders.id, id),
      eq(folders.userId, userId)
    ));
  }

  async getFolderHierarchy(userId: string, type: string): Promise<Folder[]> {
    return await db.select().from(folders)
      .where(and(
        eq(folders.userId, userId),
        eq(folders.type, type)
      ))
      .orderBy(folders.sortOrder, folders.createdAt);
  }

  // ========== NOTE METHODS ==========
  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async getNote(id: string, userId: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(and(
      eq(notes.id, id),
      eq(notes.userId, userId)
    ));
    return note || undefined;
  }

  async getUserNotes(userId: string, type?: string): Promise<Note[]> {
    const conditions = [eq(notes.userId, userId)];
    if (type) {
      conditions.push(eq(notes.type, type));
    }
    return await db.select().from(notes)
      .where(and(...conditions))
      .orderBy(notes.sortOrder, notes.createdAt);
  }

  async getFolderNotes(folderId: string, userId: string): Promise<Note[]> {
    return await db.select().from(notes)
      .where(and(
        eq(notes.folderId, folderId),
        eq(notes.userId, userId)
      ))
      .orderBy(notes.sortOrder, notes.createdAt);
  }

  async getDocumentNotes(documentId: string, userId: string): Promise<Note[]> {
    return await db.select().from(notes)
      .where(and(
        or(
          eq(notes.projectId, documentId),
          eq(notes.guideId, documentId)
        ),
        eq(notes.userId, userId)
      ))
      .orderBy(notes.sortOrder, notes.createdAt);
  }

  async updateNote(id: string, userId: string, updates: Partial<InsertNote>): Promise<Note> {
    const [updatedNote] = await db.update(notes)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(notes.id, id),
        eq(notes.userId, userId)
      ))
      .returning();
    if (!updatedNote) {
      throw new Error("Note not found or unauthorized");
    }
    return updatedNote;
  }

  async deleteNote(id: string, userId: string): Promise<void> {
    await db.delete(notes).where(and(
      eq(notes.id, id),
      eq(notes.userId, userId)
    ));
  }

  async createQuickNote(userId: string, title: string, content: string): Promise<Note> {
    const [newNote] = await db.insert(notes).values({
      title,
      content,
      type: 'quick_note',
      userId,
      folderId: null,
      projectId: null,
      guideId: null,
    }).returning();
    return newNote;
  }

  async getUserQuickNote(userId: string): Promise<Note | undefined> {
    const [quickNote] = await db.select().from(notes)
      .where(and(
        eq(notes.userId, userId),
        eq(notes.type, 'quick_note')
      ))
      .orderBy(desc(notes.updatedAt))
      .limit(1);
    return quickNote || undefined;
  }

  async getQuickNoteById(id: string, userId: string): Promise<Note | undefined> {
    const [quickNote] = await db.select().from(notes)
      .where(and(
        eq(notes.id, id),
        eq(notes.userId, userId),
        eq(notes.type, 'quick_note')
      ));
    return quickNote || undefined;
  }

  async updateQuickNote(id: string, userId: string, updates: { title?: string; content?: string }): Promise<Note> {
    const [updatedNote] = await db.update(notes)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(notes.id, id),
        eq(notes.userId, userId),
        eq(notes.type, 'quick_note')
      ))
      .returning();
    if (!updatedNote) {
      throw new Error("Quick note not found or unauthorized");
    }
    return updatedNote;
  }

  async deleteQuickNote(id: string, userId: string): Promise<void> {
    await db.delete(notes).where(and(
      eq(notes.id, id),
      eq(notes.userId, userId),
      eq(notes.type, 'quick_note')
    ));
  }

  // ========== CHAT MESSAGE METHODS ==========
  async createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(chatMessage).returning();
    return newMessage;
  }

  async getChatMessages(userId: string, projectId?: string, guideId?: string, limit = 50): Promise<ChatMessage[]> {
    let whereCondition = eq(chatMessages.userId, userId);
    if (projectId) {
      whereCondition = and(whereCondition, eq(chatMessages.projectId, projectId))!;
    } else if (guideId) {
      whereCondition = and(whereCondition, eq(chatMessages.guideId, guideId))!;
    } else {
      whereCondition = and(
        whereCondition,
        isNull(chatMessages.projectId),
        isNull(chatMessages.guideId)
      )!;
    }
    const messages = await db.select().from(chatMessages)
      .where(whereCondition)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
    return messages.reverse();
  }

  async deleteChatHistory(userId: string, projectId?: string, guideId?: string): Promise<void> {
    let whereCondition = eq(chatMessages.userId, userId);
    if (projectId) {
      whereCondition = and(whereCondition, eq(chatMessages.projectId, projectId))!;
    } else if (guideId) {
      whereCondition = and(whereCondition, eq(chatMessages.guideId, guideId))!;
    } else {
      whereCondition = and(
        whereCondition,
        isNull(chatMessages.projectId),
        isNull(chatMessages.guideId)
      )!;
    }
    await db.delete(chatMessages).where(whereCondition);
  }

  // ========== PINNED CONTENT METHODS ==========
  async pinContent(pin: InsertPinnedContent): Promise<PinnedContent> {
    try {
      if (!pin.notebookId) {
        throw new Error('Notebook ID is required for pinning content');
      }
      const userNotebook = await db.select().from(notebooks)
        .where(and(
          eq(notebooks.id, pin.notebookId),
          eq(notebooks.userId, pin.userId)
        ))
        .limit(1);
      if (!userNotebook[0]) {
        throw new Error('Notebook not found or access denied');
      }
      const [newPin] = await db.insert(pinnedContent).values(pin).returning();
      return newPin;
    } catch (error: any) {
      if (error?.code === '23505' || error?.message?.includes('unique')) {
        const existing = await db.select().from(pinnedContent)
          .where(and(
            eq(pinnedContent.userId, pin.userId),
            eq(pinnedContent.targetType, pin.targetType),
            eq(pinnedContent.targetId, pin.targetId),
            eq(pinnedContent.notebookId, pin.notebookId!)
          ))
          .limit(1);
        if (existing[0]) return existing[0];
      }
      throw error;
    }
  }

  async unpinContent(userId: string, targetType: string, targetId: string, notebookId: string): Promise<void> {
    await db.delete(pinnedContent).where(and(
      eq(pinnedContent.userId, userId),
      eq(pinnedContent.targetType, targetType),
      eq(pinnedContent.targetId, targetId),
      eq(pinnedContent.notebookId, notebookId)
    ));
  }

  async getUserPinnedContent(userId: string, notebookId: string, category?: string): Promise<PinnedContent[]> {
    const conditions = [
      eq(pinnedContent.userId, userId),
      eq(pinnedContent.notebookId, notebookId)
    ];
    if (category) {
      conditions.push(eq(pinnedContent.category, category));
    }
    return await db.select().from(pinnedContent)
      .where(and(...conditions))
      .orderBy(pinnedContent.createdAt);
  }

  async reorderPinnedContent(userId: string, itemId: string, newOrder: number, notebookId: string): Promise<void> {
    await db.update(pinnedContent)
      .set({ pinOrder: newOrder })
      .where(and(
        eq(pinnedContent.userId, userId),
        eq(pinnedContent.id, itemId),
        eq(pinnedContent.notebookId, notebookId)
      ));
  }

  async isContentPinned(userId: string, targetType: string, targetId: string, notebookId: string): Promise<boolean> {
    const [pin] = await db.select().from(pinnedContent)
      .where(and(
        eq(pinnedContent.userId, userId),
        eq(pinnedContent.targetType, targetType),
        eq(pinnedContent.targetId, targetId),
        eq(pinnedContent.notebookId, notebookId)
      ))
      .limit(1);
    return !!pin;
  }
}

export const contentRepository = new ContentRepository();
