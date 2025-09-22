// Database storage implementation using PostgreSQL and Drizzle ORM
// Reference: javascript_database integration
import { 
  users, characters, plots, prompts, guides, savedItems,
  settings, names, conflicts, themes, moods, creatures, plants, descriptions,
  type User, type InsertUser,
  type Character, type InsertCharacter, type UpdateCharacter,
  type Plot, type InsertPlot,
  type Prompt, type InsertPrompt,
  type Guide, type InsertGuide,
  type SavedItem, type InsertSavedItem,
  type Setting, type InsertSetting,
  type GeneratedName, type InsertName,
  type Conflict, type InsertConflict,
  type Theme, type InsertTheme,
  type Mood, type InsertMood,
  type Creature, type InsertCreature,
  type Plant, type InsertPlant,
  type Description, type InsertDescription
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, isNull } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  getRandomPrompts(count: number, genre?: string): Promise<Prompt[]>;
  
  // Guide methods
  createGuide(guide: InsertGuide): Promise<Guide>;
  getGuide(id: string): Promise<Guide | undefined>;
  getAllGuides(): Promise<Guide[]>;
  searchGuides(query: string, category?: string, difficulty?: string): Promise<Guide[]>;
  
  // Setting methods
  createSetting(setting: InsertSetting): Promise<Setting>;
  getSetting(id: string): Promise<Setting | undefined>;
  getUserSettings(userId: string | null): Promise<Setting[]>;
  
  // Name methods
  createNames(names: InsertName[]): Promise<GeneratedName[]>;
  getName(id: string): Promise<GeneratedName | undefined>;
  getUserNames(userId: string | null): Promise<GeneratedName[]>;
  
  // Conflict methods
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  getConflict(id: string): Promise<Conflict | undefined>;
  getUserConflicts(userId: string | null): Promise<Conflict[]>;
  
  // Theme methods
  createTheme(theme: InsertTheme): Promise<Theme>;
  getTheme(id: string): Promise<Theme | undefined>;
  getUserThemes(userId: string | null): Promise<Theme[]>;
  
  // Mood methods
  createMood(mood: InsertMood): Promise<Mood>;
  getMood(id: string): Promise<Mood | undefined>;
  getUserMoods(userId: string | null): Promise<Mood[]>;
  
  // Creature methods
  createCreature(creature: InsertCreature): Promise<Creature>;
  getCreature(id: string): Promise<Creature | undefined>;
  getUserCreatures(userId: string | null): Promise<Creature[]>;
  
  // Plant methods
  createPlant(plant: InsertPlant): Promise<Plant>;
  getPlant(id: string): Promise<Plant | undefined>;
  getUserPlants(userId: string | null): Promise<Plant[]>;
  
  // Description methods
  createDescription(description: InsertDescription): Promise<Description>;
  getDescription(id: string): Promise<Description | undefined>;
  getUserDescriptions(userId: string | null): Promise<Description[]>;
  
  // Saved items methods
  saveItem(savedItem: InsertSavedItem): Promise<SavedItem>;
  unsaveItem(userId: string, itemType: string, itemId: string): Promise<void>;
  getUserSavedItems(userId: string, itemType?: string): Promise<SavedItem[]>;
  isItemSaved(userId: string, itemType: string, itemId: string): Promise<boolean>;
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

  async getRandomPrompts(count: number, genre?: string): Promise<Prompt[]> {
    if (genre) {
      return await db.select().from(prompts)
        .where(eq(prompts.genre, genre))
        .orderBy(desc(prompts.createdAt))
        .limit(count);
    }
    
    // For now, just return the most recent prompts. In production, you'd want proper random sampling
    return await db.select().from(prompts)
      .orderBy(desc(prompts.createdAt))
      .limit(count);
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

  async getAllGuides(): Promise<Guide[]> {
    return await db.select().from(guides)
      .where(eq(guides.published, true))
      .orderBy(desc(guides.createdAt));
  }

  async searchGuides(query: string, category?: string, difficulty?: string): Promise<Guide[]> {
    const conditions = [eq(guides.published, true)];
    
    if (query) {
      const searchCondition = or(
        ilike(guides.title, `%${query}%`),
        ilike(guides.description, `%${query}%`),
        ilike(guides.content, `%${query}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }
    
    if (category && category !== 'All') {
      conditions.push(eq(guides.category, category));
    }
    
    if (difficulty && difficulty !== 'All') {
      conditions.push(eq(guides.difficulty, difficulty));
    }
    
    return await db.select().from(guides)
      .where(and(...conditions))
      .orderBy(desc(guides.rating), desc(guides.createdAt));
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
  
  // Name methods
  async createNames(namesList: InsertName[]): Promise<GeneratedName[]> {
    const newNames = await db
      .insert(names)
      .values(namesList)
      .returning();
    return newNames;
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
  
  // Plant methods
  async createPlant(plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db
      .insert(plants)
      .values(plant)
      .returning();
    return newPlant;
  }

  async getPlant(id: string): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant || undefined;
  }

  async getUserPlants(userId: string | null): Promise<Plant[]> {
    if (userId) {
      return await db.select().from(plants)
        .where(eq(plants.userId, userId))
        .orderBy(desc(plants.createdAt));
    }
    return await db.select().from(plants)
      .orderBy(desc(plants.createdAt))
      .limit(10);
  }
  
  // Description methods
  async createDescription(description: InsertDescription): Promise<Description> {
    const [newDescription] = await db
      .insert(descriptions)
      .values(description)
      .returning();
    return newDescription;
  }

  async getDescription(id: string): Promise<Description | undefined> {
    const [description] = await db.select().from(descriptions).where(eq(descriptions.id, id));
    return description || undefined;
  }

  async getUserDescriptions(userId: string | null): Promise<Description[]> {
    if (userId) {
      return await db.select().from(descriptions)
        .where(eq(descriptions.userId, userId))
        .orderBy(desc(descriptions.createdAt));
    }
    return await db.select().from(descriptions)
      .orderBy(desc(descriptions.createdAt))
      .limit(10);
  }
  
  // Saved items methods
  async saveItem(savedItem: InsertSavedItem): Promise<SavedItem> {
    const [newSavedItem] = await db
      .insert(savedItems)
      .values(savedItem)
      .returning();
    return newSavedItem;
  }

  async unsaveItem(userId: string, itemType: string, itemId: string): Promise<void> {
    const userCondition = userId === 'null' 
      ? isNull(savedItems.userId)
      : eq(savedItems.userId, userId);
      
    await db.delete(savedItems)
      .where(
        and(
          userCondition,
          eq(savedItems.itemType, itemType),
          eq(savedItems.itemId, itemId)
        )
      );
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
    
    // Populate itemData for each saved item
    const populatedItems = await Promise.all(
      savedItemsData.map(async (item) => {
        let itemData = null;
        
        try {
          switch (item.itemType) {
            case 'character':
              itemData = await this.getCharacter(item.itemId);
              break;
            case 'setting':
              itemData = await this.getSetting(item.itemId);
              break;
            case 'creature':
              itemData = await this.getCreature(item.itemId);
              break;
            case 'description':
              itemData = await this.getDescription(item.itemId);
              break;
            default:
              console.warn(`Unknown item type: ${item.itemType}`);
          }
        } catch (error) {
          console.error(`Failed to load ${item.itemType} with id ${item.itemId}:`, error);
        }
        
        return { ...item, itemData };
      })
    );
    
    return populatedItems;
  }

  async isItemSaved(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const userCondition = userId === 'null' 
      ? isNull(savedItems.userId)
      : eq(savedItems.userId, userId);
      
    const [savedItem] = await db.select().from(savedItems)
      .where(
        and(
          userCondition,
          eq(savedItems.itemType, itemType),
          eq(savedItems.itemId, itemId)
        )
      );
    return !!savedItem;
  }
}

export const storage = new DatabaseStorage();