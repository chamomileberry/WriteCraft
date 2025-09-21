// Database storage implementation using PostgreSQL and Drizzle ORM
// Reference: javascript_database integration
import { 
  users, characters, plots, prompts, guides, savedItems,
  type User, type InsertUser,
  type Character, type InsertCharacter,
  type Plot, type InsertPlot,
  type Prompt, type InsertPrompt,
  type Guide, type InsertGuide,
  type SavedItem, type InsertSavedItem
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Character methods
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(id: string): Promise<Character | undefined>;
  getUserCharacters(userId: string | null): Promise<Character[]>;
  
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
  
  // Saved items methods
  async saveItem(savedItem: InsertSavedItem): Promise<SavedItem> {
    const [newSavedItem] = await db
      .insert(savedItems)
      .values(savedItem)
      .returning();
    return newSavedItem;
  }

  async unsaveItem(userId: string, itemType: string, itemId: string): Promise<void> {
    await db.delete(savedItems)
      .where(
        and(
          eq(savedItems.userId, userId),
          eq(savedItems.itemType, itemType),
          eq(savedItems.itemId, itemId)
        )
      );
  }

  async getUserSavedItems(userId: string, itemType?: string): Promise<SavedItem[]> {
    const conditions = [eq(savedItems.userId, userId)];
    
    if (itemType) {
      conditions.push(eq(savedItems.itemType, itemType));
    }
    
    return await db.select().from(savedItems)
      .where(and(...conditions))
      .orderBy(desc(savedItems.createdAt));
  }

  async isItemSaved(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const [savedItem] = await db.select().from(savedItems)
      .where(
        and(
          eq(savedItems.userId, userId),
          eq(savedItems.itemType, itemType),
          eq(savedItems.itemId, itemId)
        )
      );
    return !!savedItem;
  }
}

export const storage = new DatabaseStorage();