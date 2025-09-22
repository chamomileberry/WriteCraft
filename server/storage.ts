// Database storage implementation using PostgreSQL and Drizzle ORM
// Reference: javascript_database integration
import { 
  users, characters, plots, prompts, guides, savedItems,
  settings, names, conflicts, themes, moods, creatures, plants, descriptions,
  locations, items, organizations, species, ethnicities, cultures, documents,
  foods, drinks, weapons, armor, religions, languages, accessories, clothing,
  materials, settlements, societies, factions, militaryUnits, myths, legends,
  events, technologies, spells, resources, buildings, animals, transportation,
  naturalLaws, traditions, rituals,
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
  type Description, type InsertDescription,
  type Location, type InsertLocation,
  type Item, type InsertItem,
  type Organization, type InsertOrganization,
  type Species, type InsertSpecies,
  type Ethnicity, type InsertEthnicity,
  type Culture, type InsertCulture,
  type Document, type InsertDocument,
  type Food, type InsertFood,
  type Drink, type InsertDrink,
  type Weapon, type InsertWeapon,
  type Armor, type InsertArmor,
  type Religion, type InsertReligion,
  type Language, type InsertLanguage,
  type Accessory, type InsertAccessory,
  type Clothing, type InsertClothing,
  type Material, type InsertMaterial,
  type Settlement, type InsertSettlement,
  type Society, type InsertSociety,
  type Faction, type InsertFaction,
  type MilitaryUnit, type InsertMilitaryUnit,
  type Myth, type InsertMyth,
  type Legend, type InsertLegend,
  type Event, type InsertEvent,
  type Technology, type InsertTechnology,
  type Spell, type InsertSpell,
  type Resource, type InsertResource,
  type Building, type InsertBuilding,
  type Animal, type InsertAnimal,
  type Transportation, type InsertTransportation,
  type NaturalLaw, type InsertNaturalLaw,
  type Tradition, type InsertTradition,
  type Ritual, type InsertRitual
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
  
  // Location methods
  createLocation(location: InsertLocation): Promise<Location>;
  getLocation(id: string): Promise<Location | undefined>;
  getUserLocations(userId: string | null): Promise<Location[]>;
  updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;
  
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
  
  // Species methods
  createSpecies(species: InsertSpecies): Promise<Species>;
  getSpecies(id: string): Promise<Species | undefined>;
  getUserSpecies(userId: string | null): Promise<Species[]>;
  updateSpecies(id: string, updates: Partial<InsertSpecies>): Promise<Species>;
  deleteSpecies(id: string): Promise<void>;
  
  // Ethnicity methods
  createEthnicity(ethnicity: InsertEthnicity): Promise<Ethnicity>;
  getEthnicity(id: string): Promise<Ethnicity | undefined>;
  getUserEthnicities(userId: string | null): Promise<Ethnicity[]>;
  updateEthnicity(id: string, updates: Partial<InsertEthnicity>): Promise<Ethnicity>;
  deleteEthnicity(id: string): Promise<void>;
  
  // Culture methods
  createCulture(culture: InsertCulture): Promise<Culture>;
  getCulture(id: string): Promise<Culture | undefined>;
  getUserCultures(userId: string | null): Promise<Culture[]>;
  updateCulture(id: string, updates: Partial<InsertCulture>): Promise<Culture>;
  deleteCulture(id: string): Promise<void>;
  
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
  
  // Drink methods
  createDrink(drink: InsertDrink): Promise<Drink>;
  getDrink(id: string): Promise<Drink | undefined>;
  getUserDrinks(userId: string | null): Promise<Drink[]>;
  updateDrink(id: string, updates: Partial<InsertDrink>): Promise<Drink>;
  deleteDrink(id: string): Promise<void>;
  
  // Weapon methods
  createWeapon(weapon: InsertWeapon): Promise<Weapon>;
  getWeapon(id: string): Promise<Weapon | undefined>;
  getUserWeapons(userId: string | null): Promise<Weapon[]>;
  updateWeapon(id: string, updates: Partial<InsertWeapon>): Promise<Weapon>;
  deleteWeapon(id: string): Promise<void>;
  
  // Armor methods
  createArmor(armor: InsertArmor): Promise<Armor>;
  getArmor(id: string): Promise<Armor | undefined>;
  getUserArmor(userId: string | null): Promise<Armor[]>;
  updateArmor(id: string, updates: Partial<InsertArmor>): Promise<Armor>;
  deleteArmor(id: string): Promise<void>;
  
  // Religion methods
  createReligion(religion: InsertReligion): Promise<Religion>;
  getReligion(id: string): Promise<Religion | undefined>;
  getUserReligions(userId: string | null): Promise<Religion[]>;
  updateReligion(id: string, updates: Partial<InsertReligion>): Promise<Religion>;
  deleteReligion(id: string): Promise<void>;
  
  // Language methods
  createLanguage(language: InsertLanguage): Promise<Language>;
  getLanguage(id: string): Promise<Language | undefined>;
  getUserLanguages(userId: string | null): Promise<Language[]>;
  updateLanguage(id: string, updates: Partial<InsertLanguage>): Promise<Language>;
  deleteLanguage(id: string): Promise<void>;
  
  // Accessory methods
  createAccessory(accessory: InsertAccessory): Promise<Accessory>;
  getAccessory(id: string): Promise<Accessory | undefined>;
  getUserAccessories(userId: string | null): Promise<Accessory[]>;
  updateAccessory(id: string, updates: Partial<InsertAccessory>): Promise<Accessory>;
  deleteAccessory(id: string): Promise<void>;
  
  // Clothing methods
  createClothing(clothing: InsertClothing): Promise<Clothing>;
  getClothing(id: string): Promise<Clothing | undefined>;
  getUserClothing(userId: string | null): Promise<Clothing[]>;
  updateClothing(id: string, updates: Partial<InsertClothing>): Promise<Clothing>;
  deleteClothing(id: string): Promise<void>;
  
  // Material methods
  createMaterial(material: InsertMaterial): Promise<Material>;
  getMaterial(id: string): Promise<Material | undefined>;
  getUserMaterials(userId: string | null): Promise<Material[]>;
  updateMaterial(id: string, updates: Partial<InsertMaterial>): Promise<Material>;
  deleteMaterial(id: string): Promise<void>;
  
  // Settlement methods
  createSettlement(settlement: InsertSettlement): Promise<Settlement>;
  getSettlement(id: string): Promise<Settlement | undefined>;
  getUserSettlements(userId: string | null): Promise<Settlement[]>;
  updateSettlement(id: string, updates: Partial<InsertSettlement>): Promise<Settlement>;
  deleteSettlement(id: string): Promise<void>;
  
  // Society methods
  createSociety(society: InsertSociety): Promise<Society>;
  getSociety(id: string): Promise<Society | undefined>;
  getUserSocieties(userId: string | null): Promise<Society[]>;
  updateSociety(id: string, updates: Partial<InsertSociety>): Promise<Society>;
  deleteSociety(id: string): Promise<void>;
  
  // Faction methods
  createFaction(faction: InsertFaction): Promise<Faction>;
  getFaction(id: string): Promise<Faction | undefined>;
  getUserFactions(userId: string | null): Promise<Faction[]>;
  updateFaction(id: string, updates: Partial<InsertFaction>): Promise<Faction>;
  deleteFaction(id: string): Promise<void>;
  
  // Military Unit methods
  createMilitaryUnit(militaryUnit: InsertMilitaryUnit): Promise<MilitaryUnit>;
  getMilitaryUnit(id: string): Promise<MilitaryUnit | undefined>;
  getUserMilitaryUnits(userId: string | null): Promise<MilitaryUnit[]>;
  updateMilitaryUnit(id: string, updates: Partial<InsertMilitaryUnit>): Promise<MilitaryUnit>;
  deleteMilitaryUnit(id: string): Promise<void>;
  
  // Myth methods
  createMyth(myth: InsertMyth): Promise<Myth>;
  getMyth(id: string): Promise<Myth | undefined>;
  getUserMyths(userId: string | null): Promise<Myth[]>;
  updateMyth(id: string, updates: Partial<InsertMyth>): Promise<Myth>;
  deleteMyth(id: string): Promise<void>;
  
  // Legend methods
  createLegend(legend: InsertLegend): Promise<Legend>;
  getLegend(id: string): Promise<Legend | undefined>;
  getUserLegends(userId: string | null): Promise<Legend[]>;
  updateLegend(id: string, updates: Partial<InsertLegend>): Promise<Legend>;
  deleteLegend(id: string): Promise<void>;
  
  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getUserEvents(userId: string | null): Promise<Event[]>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  // Technology methods
  createTechnology(technology: InsertTechnology): Promise<Technology>;
  getTechnology(id: string): Promise<Technology | undefined>;
  getUserTechnologies(userId: string | null): Promise<Technology[]>;
  updateTechnology(id: string, updates: Partial<InsertTechnology>): Promise<Technology>;
  deleteTechnology(id: string): Promise<void>;
  
  // Spell methods
  createSpell(spell: InsertSpell): Promise<Spell>;
  getSpell(id: string): Promise<Spell | undefined>;
  getUserSpells(userId: string | null): Promise<Spell[]>;
  updateSpell(id: string, updates: Partial<InsertSpell>): Promise<Spell>;
  deleteSpell(id: string): Promise<void>;
  
  // Resource methods
  createResource(resource: InsertResource): Promise<Resource>;
  getResource(id: string): Promise<Resource | undefined>;
  getUserResources(userId: string | null): Promise<Resource[]>;
  updateResource(id: string, updates: Partial<InsertResource>): Promise<Resource>;
  deleteResource(id: string): Promise<void>;
  
  // Building methods
  createBuilding(building: InsertBuilding): Promise<Building>;
  getBuilding(id: string): Promise<Building | undefined>;
  getUserBuildings(userId: string | null): Promise<Building[]>;
  updateBuilding(id: string, updates: Partial<InsertBuilding>): Promise<Building>;
  deleteBuilding(id: string): Promise<void>;
  
  // Animal methods
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  getAnimal(id: string): Promise<Animal | undefined>;
  getUserAnimals(userId: string | null): Promise<Animal[]>;
  updateAnimal(id: string, updates: Partial<InsertAnimal>): Promise<Animal>;
  deleteAnimal(id: string): Promise<void>;
  
  // Transportation methods
  createTransportation(transportation: InsertTransportation): Promise<Transportation>;
  getTransportation(id: string): Promise<Transportation | undefined>;
  getUserTransportations(userId: string | null): Promise<Transportation[]>;
  updateTransportation(id: string, updates: Partial<InsertTransportation>): Promise<Transportation>;
  deleteTransportation(id: string): Promise<void>;
  
  // Natural Law methods
  createNaturalLaw(naturalLaw: InsertNaturalLaw): Promise<NaturalLaw>;
  getNaturalLaw(id: string): Promise<NaturalLaw | undefined>;
  getUserNaturalLaws(userId: string | null): Promise<NaturalLaw[]>;
  updateNaturalLaw(id: string, updates: Partial<InsertNaturalLaw>): Promise<NaturalLaw>;
  deleteNaturalLaw(id: string): Promise<void>;
  
  // Tradition methods
  createTradition(tradition: InsertTradition): Promise<Tradition>;
  getTradition(id: string): Promise<Tradition | undefined>;
  getUserTraditions(userId: string | null): Promise<Tradition[]>;
  updateTradition(id: string, updates: Partial<InsertTradition>): Promise<Tradition>;
  deleteTradition(id: string): Promise<void>;
  
  // Ritual methods
  createRitual(ritual: InsertRitual): Promise<Ritual>;
  getRitual(id: string): Promise<Ritual | undefined>;
  getUserRituals(userId: string | null): Promise<Ritual[]>;
  updateRitual(id: string, updates: Partial<InsertRitual>): Promise<Ritual>;
  deleteRitual(id: string): Promise<void>;

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

  // Species methods
  async createSpecies(speciesData: InsertSpecies): Promise<Species> {
    const [newSpecies] = await db
      .insert(species)
      .values(speciesData)
      .returning();
    return newSpecies;
  }

  async getSpecies(id: string): Promise<Species | undefined> {
    const [speciesItem] = await db.select().from(species).where(eq(species.id, id));
    return speciesItem || undefined;
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

  // Ethnicity methods
  async createEthnicity(ethnicity: InsertEthnicity): Promise<Ethnicity> {
    const [newEthnicity] = await db
      .insert(ethnicities)
      .values(ethnicity)
      .returning();
    return newEthnicity;
  }

  async getEthnicity(id: string): Promise<Ethnicity | undefined> {
    const [ethnicity] = await db.select().from(ethnicities).where(eq(ethnicities.id, id));
    return ethnicity || undefined;
  }

  async getUserEthnicities(userId: string | null): Promise<Ethnicity[]> {
    if (userId) {
      return await db.select().from(ethnicities)
        .where(eq(ethnicities.userId, userId))
        .orderBy(desc(ethnicities.createdAt));
    }
    return await db.select().from(ethnicities)
      .orderBy(desc(ethnicities.createdAt))
      .limit(10);
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

  // Drink methods
  async createDrink(drink: InsertDrink): Promise<Drink> {
    const [newDrink] = await db
      .insert(drinks)
      .values(drink)
      .returning();
    return newDrink;
  }

  async getDrink(id: string): Promise<Drink | undefined> {
    const [drink] = await db.select().from(drinks).where(eq(drinks.id, id));
    return drink || undefined;
  }

  async getUserDrinks(userId: string | null): Promise<Drink[]> {
    if (userId) {
      return await db.select().from(drinks)
        .where(eq(drinks.userId, userId))
        .orderBy(desc(drinks.createdAt));
    }
    return await db.select().from(drinks)
      .orderBy(desc(drinks.createdAt))
      .limit(10);
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

  // Armor methods
  async createArmor(armorData: InsertArmor): Promise<Armor> {
    const [newArmor] = await db
      .insert(armor)
      .values(armorData)
      .returning();
    return newArmor;
  }

  async getArmor(id: string): Promise<Armor | undefined> {
    const [armorItem] = await db.select().from(armor).where(eq(armor.id, id));
    return armorItem || undefined;
  }

  async getUserArmor(userId: string | null): Promise<Armor[]> {
    if (userId) {
      return await db.select().from(armor)
        .where(eq(armor.userId, userId))
        .orderBy(desc(armor.createdAt));
    }
    return await db.select().from(armor)
      .orderBy(desc(armor.createdAt))
      .limit(10);
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

  // Accessory methods
  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    const [newAccessory] = await db
      .insert(accessories)
      .values(accessory)
      .returning();
    return newAccessory;
  }

  async getAccessory(id: string): Promise<Accessory | undefined> {
    const [accessory] = await db.select().from(accessories).where(eq(accessories.id, id));
    return accessory || undefined;
  }

  async getUserAccessories(userId: string | null): Promise<Accessory[]> {
    if (userId) {
      return await db.select().from(accessories)
        .where(eq(accessories.userId, userId))
        .orderBy(desc(accessories.createdAt));
    }
    return await db.select().from(accessories)
      .orderBy(desc(accessories.createdAt))
      .limit(10);
  }

  // Clothing methods
  async createClothing(clothingData: InsertClothing): Promise<Clothing> {
    const [newClothing] = await db
      .insert(clothing)
      .values(clothingData)
      .returning();
    return newClothing;
  }

  async getClothing(id: string): Promise<Clothing | undefined> {
    const [clothingItem] = await db.select().from(clothing).where(eq(clothing.id, id));
    return clothingItem || undefined;
  }

  async getUserClothing(userId: string | null): Promise<Clothing[]> {
    if (userId) {
      return await db.select().from(clothing)
        .where(eq(clothing.userId, userId))
        .orderBy(desc(clothing.createdAt));
    }
    return await db.select().from(clothing)
      .orderBy(desc(clothing.createdAt))
      .limit(10);
  }

  // Material methods
  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [newMaterial] = await db
      .insert(materials)
      .values(material)
      .returning();
    return newMaterial;
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material || undefined;
  }

  async getUserMaterials(userId: string | null): Promise<Material[]> {
    if (userId) {
      return await db.select().from(materials)
        .where(eq(materials.userId, userId))
        .orderBy(desc(materials.createdAt));
    }
    return await db.select().from(materials)
      .orderBy(desc(materials.createdAt))
      .limit(10);
  }

  // Settlement methods
  async createSettlement(settlement: InsertSettlement): Promise<Settlement> {
    const [newSettlement] = await db
      .insert(settlements)
      .values(settlement)
      .returning();
    return newSettlement;
  }

  async getSettlement(id: string): Promise<Settlement | undefined> {
    const [settlement] = await db.select().from(settlements).where(eq(settlements.id, id));
    return settlement || undefined;
  }

  async getUserSettlements(userId: string | null): Promise<Settlement[]> {
    if (userId) {
      return await db.select().from(settlements)
        .where(eq(settlements.userId, userId))
        .orderBy(desc(settlements.createdAt));
    }
    return await db.select().from(settlements)
      .orderBy(desc(settlements.createdAt))
      .limit(10);
  }

  // Society methods
  async createSociety(society: InsertSociety): Promise<Society> {
    const [newSociety] = await db
      .insert(societies)
      .values(society)
      .returning();
    return newSociety;
  }

  async getSociety(id: string): Promise<Society | undefined> {
    const [society] = await db.select().from(societies).where(eq(societies.id, id));
    return society || undefined;
  }

  async getUserSocieties(userId: string | null): Promise<Society[]> {
    if (userId) {
      return await db.select().from(societies)
        .where(eq(societies.userId, userId))
        .orderBy(desc(societies.createdAt));
    }
    return await db.select().from(societies)
      .orderBy(desc(societies.createdAt))
      .limit(10);
  }

  // Faction methods
  async createFaction(faction: InsertFaction): Promise<Faction> {
    const [newFaction] = await db
      .insert(factions)
      .values(faction)
      .returning();
    return newFaction;
  }

  async getFaction(id: string): Promise<Faction | undefined> {
    const [faction] = await db.select().from(factions).where(eq(factions.id, id));
    return faction || undefined;
  }

  async getUserFactions(userId: string | null): Promise<Faction[]> {
    if (userId) {
      return await db.select().from(factions)
        .where(eq(factions.userId, userId))
        .orderBy(desc(factions.createdAt));
    }
    return await db.select().from(factions)
      .orderBy(desc(factions.createdAt))
      .limit(10);
  }

  // Military Unit methods
  async createMilitaryUnit(militaryUnit: InsertMilitaryUnit): Promise<MilitaryUnit> {
    const [newMilitaryUnit] = await db
      .insert(militaryUnits)
      .values(militaryUnit)
      .returning();
    return newMilitaryUnit;
  }

  async getMilitaryUnit(id: string): Promise<MilitaryUnit | undefined> {
    const [militaryUnit] = await db.select().from(militaryUnits).where(eq(militaryUnits.id, id));
    return militaryUnit || undefined;
  }

  async getUserMilitaryUnits(userId: string | null): Promise<MilitaryUnit[]> {
    if (userId) {
      return await db.select().from(militaryUnits)
        .where(eq(militaryUnits.userId, userId))
        .orderBy(desc(militaryUnits.createdAt));
    }
    return await db.select().from(militaryUnits)
      .orderBy(desc(militaryUnits.createdAt))
      .limit(10);
  }

  // Myth methods
  async createMyth(myth: InsertMyth): Promise<Myth> {
    const [newMyth] = await db
      .insert(myths)
      .values(myth)
      .returning();
    return newMyth;
  }

  async getMyth(id: string): Promise<Myth | undefined> {
    const [myth] = await db.select().from(myths).where(eq(myths.id, id));
    return myth || undefined;
  }

  async getUserMyths(userId: string | null): Promise<Myth[]> {
    if (userId) {
      return await db.select().from(myths)
        .where(eq(myths.userId, userId))
        .orderBy(desc(myths.createdAt));
    }
    return await db.select().from(myths)
      .orderBy(desc(myths.createdAt))
      .limit(10);
  }

  // Legend methods
  async createLegend(legend: InsertLegend): Promise<Legend> {
    const [newLegend] = await db
      .insert(legends)
      .values(legend)
      .returning();
    return newLegend;
  }

  async getLegend(id: string): Promise<Legend | undefined> {
    const [legend] = await db.select().from(legends).where(eq(legends.id, id));
    return legend || undefined;
  }

  async getUserLegends(userId: string | null): Promise<Legend[]> {
    if (userId) {
      return await db.select().from(legends)
        .where(eq(legends.userId, userId))
        .orderBy(desc(legends.createdAt));
    }
    return await db.select().from(legends)
      .orderBy(desc(legends.createdAt))
      .limit(10);
  }

  // Event methods
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getUserEvents(userId: string | null): Promise<Event[]> {
    if (userId) {
      return await db.select().from(events)
        .where(eq(events.userId, userId))
        .orderBy(desc(events.createdAt));
    }
    return await db.select().from(events)
      .orderBy(desc(events.createdAt))
      .limit(10);
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

  // Spell methods
  async createSpell(spell: InsertSpell): Promise<Spell> {
    const [newSpell] = await db
      .insert(spells)
      .values(spell)
      .returning();
    return newSpell;
  }

  async getSpell(id: string): Promise<Spell | undefined> {
    const [spell] = await db.select().from(spells).where(eq(spells.id, id));
    return spell || undefined;
  }

  async getUserSpells(userId: string | null): Promise<Spell[]> {
    if (userId) {
      return await db.select().from(spells)
        .where(eq(spells.userId, userId))
        .orderBy(desc(spells.createdAt));
    }
    return await db.select().from(spells)
      .orderBy(desc(spells.createdAt))
      .limit(10);
  }

  // Resource methods
  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db
      .insert(resources)
      .values(resource)
      .returning();
    return newResource;
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async getUserResources(userId: string | null): Promise<Resource[]> {
    if (userId) {
      return await db.select().from(resources)
        .where(eq(resources.userId, userId))
        .orderBy(desc(resources.createdAt));
    }
    return await db.select().from(resources)
      .orderBy(desc(resources.createdAt))
      .limit(10);
  }

  // Building methods
  async createBuilding(building: InsertBuilding): Promise<Building> {
    const [newBuilding] = await db
      .insert(buildings)
      .values(building)
      .returning();
    return newBuilding;
  }

  async getBuilding(id: string): Promise<Building | undefined> {
    const [building] = await db.select().from(buildings).where(eq(buildings.id, id));
    return building || undefined;
  }

  async getUserBuildings(userId: string | null): Promise<Building[]> {
    if (userId) {
      return await db.select().from(buildings)
        .where(eq(buildings.userId, userId))
        .orderBy(desc(buildings.createdAt));
    }
    return await db.select().from(buildings)
      .orderBy(desc(buildings.createdAt))
      .limit(10);
  }

  // Animal methods
  async createAnimal(animal: InsertAnimal): Promise<Animal> {
    const [newAnimal] = await db
      .insert(animals)
      .values(animal)
      .returning();
    return newAnimal;
  }

  async getAnimal(id: string): Promise<Animal | undefined> {
    const [animal] = await db.select().from(animals).where(eq(animals.id, id));
    return animal || undefined;
  }

  async getUserAnimals(userId: string | null): Promise<Animal[]> {
    if (userId) {
      return await db.select().from(animals)
        .where(eq(animals.userId, userId))
        .orderBy(desc(animals.createdAt));
    }
    return await db.select().from(animals)
      .orderBy(desc(animals.createdAt))
      .limit(10);
  }

  // Transportation methods
  async createTransportation(transportationData: InsertTransportation): Promise<Transportation> {
    const [newTransportation] = await db
      .insert(transportation)
      .values(transportationData)
      .returning();
    return newTransportation;
  }

  async getTransportation(id: string): Promise<Transportation | undefined> {
    const [transportationItem] = await db.select().from(transportation).where(eq(transportation.id, id));
    return transportationItem || undefined;
  }

  async getUserTransportations(userId: string | null): Promise<Transportation[]> {
    if (userId) {
      return await db.select().from(transportation)
        .where(eq(transportation.userId, userId))
        .orderBy(desc(transportation.createdAt));
    }
    return await db.select().from(transportation)
      .orderBy(desc(transportation.createdAt))
      .limit(10);
  }

  // Natural Law methods
  async createNaturalLaw(naturalLaw: InsertNaturalLaw): Promise<NaturalLaw> {
    const [newNaturalLaw] = await db
      .insert(naturalLaws)
      .values(naturalLaw)
      .returning();
    return newNaturalLaw;
  }

  async getNaturalLaw(id: string): Promise<NaturalLaw | undefined> {
    const [naturalLaw] = await db.select().from(naturalLaws).where(eq(naturalLaws.id, id));
    return naturalLaw || undefined;
  }

  async getUserNaturalLaws(userId: string | null): Promise<NaturalLaw[]> {
    if (userId) {
      return await db.select().from(naturalLaws)
        .where(eq(naturalLaws.userId, userId))
        .orderBy(desc(naturalLaws.createdAt));
    }
    return await db.select().from(naturalLaws)
      .orderBy(desc(naturalLaws.createdAt))
      .limit(10);
  }

  // Tradition methods
  async createTradition(tradition: InsertTradition): Promise<Tradition> {
    const [newTradition] = await db
      .insert(traditions)
      .values(tradition)
      .returning();
    return newTradition;
  }

  async getTradition(id: string): Promise<Tradition | undefined> {
    const [tradition] = await db.select().from(traditions).where(eq(traditions.id, id));
    return tradition || undefined;
  }

  async getUserTraditions(userId: string | null): Promise<Tradition[]> {
    if (userId) {
      return await db.select().from(traditions)
        .where(eq(traditions.userId, userId))
        .orderBy(desc(traditions.createdAt));
    }
    return await db.select().from(traditions)
      .orderBy(desc(traditions.createdAt))
      .limit(10);
  }

  // Ritual methods
  async createRitual(ritual: InsertRitual): Promise<Ritual> {
    const [newRitual] = await db
      .insert(rituals)
      .values(ritual)
      .returning();
    return newRitual;
  }

  async getRitual(id: string): Promise<Ritual | undefined> {
    const [ritual] = await db.select().from(rituals).where(eq(rituals.id, id));
    return ritual || undefined;
  }

  async getUserRituals(userId: string | null): Promise<Ritual[]> {
    if (userId) {
      return await db.select().from(rituals)
        .where(eq(rituals.userId, userId))
        .orderBy(desc(rituals.createdAt));
    }
    return await db.select().from(rituals)
      .orderBy(desc(rituals.createdAt))
      .limit(10);
  }

  // Update/Delete methods for new content types
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

  async updateEthnicity(id: string, updates: Partial<InsertEthnicity>): Promise<Ethnicity> {
    const [updatedEthnicity] = await db
      .update(ethnicities)
      .set(updates)
      .where(eq(ethnicities.id, id))
      .returning();
    return updatedEthnicity;
  }

  async deleteEthnicity(id: string): Promise<void> {
    await db.delete(ethnicities).where(eq(ethnicities.id, id));
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

  async updateDrink(id: string, updates: Partial<InsertDrink>): Promise<Drink> {
    const [updatedDrink] = await db
      .update(drinks)
      .set(updates)
      .where(eq(drinks.id, id))
      .returning();
    return updatedDrink;
  }

  async deleteDrink(id: string): Promise<void> {
    await db.delete(drinks).where(eq(drinks.id, id));
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

  async updateArmor(id: string, updates: Partial<InsertArmor>): Promise<Armor> {
    const [updatedArmor] = await db
      .update(armor)
      .set(updates)
      .where(eq(armor.id, id))
      .returning();
    return updatedArmor;
  }

  async deleteArmor(id: string): Promise<void> {
    await db.delete(armor).where(eq(armor.id, id));
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