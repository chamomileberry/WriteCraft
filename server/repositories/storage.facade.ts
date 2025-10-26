import { type IStorage } from '../storage';
import {
  type User, type InsertUser, type UpsertUser,
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
  type Rank, type InsertRank,
  type Condition, type InsertCondition,
  type SavedItem, type InsertSavedItem,
  type GeneratedName, type InsertName,
  type Theme, type InsertTheme,
  type Mood, type InsertMood,
  type Conflict, type InsertConflict,
  type InsertGuide, type Guide,
  type GuideCategory, type InsertGuideCategory,
  type GuideReference, type InsertGuideReference,
  type Project, type InsertProject,
  type ProjectSection, type InsertProjectSection,
  type ProjectLink, type InsertProjectLink,
  type Folder, type InsertFolder,
  type Note, type InsertNote,
  type Plant, type InsertPlant,
  type Description, type InsertDescription,
  type Ethnicity, type InsertEthnicity,
  type Drink, type InsertDrink,
  type Armor, type InsertArmor,
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
  type Spell, type InsertSpell,
  type Resource, type InsertResource,
  type Building, type InsertBuilding,
  type Animal, type InsertAnimal,
  type Transportation, type InsertTransportation,
  type NaturalLaw, type InsertNaturalLaw,
  type Tradition, type InsertTradition,
  type Ritual, type InsertRitual,
  type FamilyTree, type InsertFamilyTree,
  type FamilyTreeMember, type InsertFamilyTreeMember,
  type FamilyTreeRelationship, type InsertFamilyTreeRelationship,
  type Timeline, type InsertTimeline,
  type TimelineEvent, type InsertTimelineEvent,
  type TimelineRelationship, type InsertTimelineRelationship,
  type Ceremony, type InsertCeremony,
  type Map, type InsertMap,
  type Music, type InsertMusic,
  type Dance, type InsertDance,
  type Law, type InsertLaw,
  type Policy, type InsertPolicy,
  type Potion, type InsertPotion,
  type ChatMessage, type InsertChatMessage,
  type ConversationThread, type InsertConversationThread,
  type Notebook, type InsertNotebook, type UpdateNotebook,
  type ImportJob, type InsertImportJob, type UpdateImportJob,
  type PinnedContent, type InsertPinnedContent,
  type Canvas, type InsertCanvas,
  type UserPreferences, type InsertUserPreferences,
  type ConversationSummary, type InsertConversationSummary,
  type Feedback, type InsertFeedback
} from '@shared/schema';

import { UserRepository } from './user.repository';
import { NotebookRepository } from './notebook.repository';
import { CharacterRepository } from './character.repository';
import { FamilyTreeRepository } from './family-tree.repository';
import { ProjectRepository } from './project.repository';
import { contentRepository } from './content.repository';
import { searchRepository } from './search.repository';
import { ImportRepository } from './import.repository';
import { ShareRepository } from './share.repository';
import { db } from '../db';
import { eq, and, desc, or, ilike, isNull, sql, inArray } from 'drizzle-orm';
import { guides, savedItems, notebooks, userPreferences, conversationSummaries, conversationThreads, chatMessages, feedback } from '@shared/schema';

export class StorageFacade implements IStorage {
  private userRepository = new UserRepository();
  private notebookRepository = new NotebookRepository();
  private characterRepository = new CharacterRepository();
  private familyTreeRepository = new FamilyTreeRepository();
  private projectRepository = new ProjectRepository();
  private importRepository = new ImportRepository();
  private shareRepository = new ShareRepository();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return await this.userRepository.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await this.userRepository.getUserByUsername(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return await this.userRepository.createUser(insertUser);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    return await this.userRepository.upsertUser(user);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    return await this.userRepository.updateUser(id, updates);
  }

  async searchUsers(query: string): Promise<User[]> {
    return await this.userRepository.searchUsers(query);
  }

  // Notebook methods
  async createNotebook(notebook: InsertNotebook): Promise<Notebook> {
    return await this.notebookRepository.createNotebook(notebook);
  }

  async getNotebook(id: string, userId: string): Promise<Notebook | undefined> {
    return await this.notebookRepository.getNotebook(id, userId);
  }

  async getUserNotebooks(userId: string): Promise<Notebook[]> {
    return await this.notebookRepository.getUserNotebooks(userId);
  }

  async updateNotebook(id: string, userId: string, updates: UpdateNotebook): Promise<Notebook | undefined> {
    return await this.notebookRepository.updateNotebook(id, userId, updates);
  }

  async deleteNotebook(id: string, userId: string): Promise<void> {
    await this.notebookRepository.deleteNotebook(id, userId);
  }

  async validateNotebookOwnership(notebookId: string, userId: string): Promise<boolean> {
    return await this.notebookRepository.validateNotebookOwnership(notebookId, userId);
  }

  // Import Job methods
  async createImportJob(job: InsertImportJob): Promise<ImportJob> {
    return await this.importRepository.createImportJob(job);
  }

  async getImportJob(id: string, userId: string): Promise<ImportJob | undefined> {
    return await this.importRepository.getImportJob(id, userId);
  }

  async getUserImportJobs(userId: string): Promise<ImportJob[]> {
    return await this.importRepository.getUserImportJobs(userId);
  }

  async updateImportJob(id: string, updates: UpdateImportJob): Promise<ImportJob | undefined> {
    return await this.importRepository.updateImportJob(id, updates);
  }

  // Generic content ownership validation
  validateContentOwnership<T extends { userId?: string | null, notebookId?: string | null }>(
    content: T | undefined,
    userId: string
  ): boolean {
    if (!content) return false;
    return content.userId === userId;
  }

  // Character methods
  async createCharacter(character: InsertCharacter): Promise<Character> {
    return await this.characterRepository.createCharacter(character);
  }

  async getCharacter(id: string, userId: string, notebookId: string): Promise<Character | undefined> {
    return await this.characterRepository.getCharacter(id, userId, notebookId);
  }

  async getUserCharacters(userId: string, notebookId: string): Promise<Character[]> {
    return await this.characterRepository.getUserCharacters(userId, notebookId);
  }

  async updateCharacter(id: string, userId: string, updates: UpdateCharacter, notebookId: string): Promise<Character> {
    return await this.characterRepository.updateCharacter(id, userId, updates, notebookId);
  }

  async deleteCharacter(id: string, userId: string, notebookId: string): Promise<void> {
    await this.characterRepository.deleteCharacter(id, userId, notebookId);
  }

  async getCharactersWithIssues(userId: string, notebookId: string): Promise<{
    missingFamilyName: Character[];
    missingDescription: Character[];
    missingImage: Character[];
  }> {
    return await this.characterRepository.getCharactersWithIssues(userId, notebookId);
  }

  async getPotentialDuplicates(userId: string, notebookId: string): Promise<Character[][]> {
    return await this.characterRepository.getPotentialDuplicates(userId, notebookId);
  }

  // Plot methods
  async createPlot(plot: InsertPlot): Promise<Plot> {
    return await contentRepository.createPlot(plot);
  }

  async getPlot(id: string, userId: string, notebookId: string): Promise<Plot | undefined> {
    return await contentRepository.getPlot(id, userId, notebookId);
  }

  async getUserPlots(userId: string, notebookId: string): Promise<Plot[]> {
    return await contentRepository.getUserPlots(userId, notebookId);
  }

  // Prompt methods
  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    return await contentRepository.createPrompt(prompt);
  }

  async getPrompt(id: string, userId: string, notebookId: string): Promise<Prompt | undefined> {
    return await contentRepository.getPrompt(id, userId, notebookId);
  }

  async getUserPrompts(userId: string, notebookId: string): Promise<Prompt[]> {
    return await contentRepository.getUserPrompts(userId, notebookId);
  }

  async getRandomPrompts(count?: number): Promise<Prompt[]> {
    return await contentRepository.getRandomPrompts(count);
  }

  // Location methods
  async createLocation(location: InsertLocation): Promise<Location> {
    return await contentRepository.createLocation(location);
  }

  async getLocation(id: string, userId: string, notebookId: string): Promise<Location | undefined> {
    return await contentRepository.getLocation(id, userId, notebookId);
  }

  async getUserLocations(userId: string, notebookId: string): Promise<Location[]> {
    return await contentRepository.getUserLocations(userId, notebookId);
  }

  async updateLocation(id: string, userId: string, updates: Partial<InsertLocation>, notebookId: string): Promise<Location> {
    return await contentRepository.updateLocation(id, userId, updates, notebookId);
  }

  async deleteLocation(id: string, userId: string, notebookId: string): Promise<void> {
    await contentRepository.deleteLocation(id, userId, notebookId);
  }

  // Setting methods
  async createSetting(setting: InsertSetting): Promise<Setting> {
    return await contentRepository.createSetting(setting);
  }

  async getSetting(id: string, userId: string, notebookId: string): Promise<Setting | undefined> {
    return await contentRepository.getSetting(id, userId, notebookId);
  }

  async getUserSettings(userId: string, notebookId: string): Promise<Setting[]> {
    return await contentRepository.getUserSettings(userId, notebookId);
  }

  async updateSetting(id: string, userId: string, updates: Partial<InsertSetting>): Promise<Setting> {
    return await contentRepository.updateSetting(id, userId, updates);
  }

  // Item methods
  async createItem(item: InsertItem): Promise<Item> {
    return await contentRepository.createItem(item);
  }

  async getItem(id: string, userId: string, notebookId: string): Promise<Item | undefined> {
    return await contentRepository.getItem(id, userId, notebookId);
  }

  async getUserItems(userId: string, notebookId: string): Promise<Item[]> {
    return await contentRepository.getUserItems(userId, notebookId);
  }

  async updateItem(id: string, userId: string, updates: Partial<InsertItem>, notebookId: string): Promise<Item> {
    return await contentRepository.updateItem(id, userId, updates, notebookId);
  }

  async deleteItem(id: string, userId: string, notebookId: string): Promise<void> {
    await contentRepository.deleteItem(id, userId, notebookId);
  }

  // Organization methods
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    return await contentRepository.createOrganization(organization);
  }

  async getOrganization(id: string, userId: string, notebookId: string): Promise<Organization | undefined> {
    return await contentRepository.getOrganization(id, userId, notebookId);
  }

  async getUserOrganizations(userId: string, notebookId: string): Promise<Organization[]> {
    return await contentRepository.getUserOrganizations(userId, notebookId);
  }

  async updateOrganization(id: string, userId: string, updates: Partial<InsertOrganization>, notebookId: string): Promise<Organization> {
    return await contentRepository.updateOrganization(id, userId, updates, notebookId);
  }

  async deleteOrganization(id: string, userId: string, notebookId: string): Promise<void> {
    await contentRepository.deleteOrganization(id, userId, notebookId);
  }

  // Creature methods
  async createCreature(creature: InsertCreature): Promise<Creature> {
    return await contentRepository.createCreature(creature);
  }

  async getCreature(id: string, userId: string, notebookId: string): Promise<Creature | undefined> {
    return await contentRepository.getCreature(id, userId, notebookId);
  }

  async getUserCreatures(userId: string, notebookId: string): Promise<Creature[]> {
    return await contentRepository.getUserCreatures(userId, notebookId);
  }

  async updateCreature(id: string, userId: string, updates: Partial<InsertCreature>): Promise<Creature> {
    return await contentRepository.updateCreature(id, userId, updates);
  }

  // Species methods
  async createSpecies(species: InsertSpecies): Promise<Species> {
    return await contentRepository.createSpecies(species);
  }

  async getSpecies(id: string, userId: string, notebookId: string): Promise<Species | undefined> {
    return await contentRepository.getSpecies(id, userId, notebookId);
  }

  async getUserSpecies(userId: string, notebookId: string): Promise<Species[]> {
    return await contentRepository.getUserSpecies(userId, notebookId);
  }

  async findSpeciesByName(name: string, notebookId: string): Promise<Species | undefined> {
    return await contentRepository.findSpeciesByName(name, notebookId);
  }

  async updateSpecies(id: string, userId: string, updates: Partial<InsertSpecies>): Promise<Species> {
    return await contentRepository.updateSpecies(id, userId, updates);
  }

  async deleteSpecies(id: string, userId: string): Promise<void> {
    await contentRepository.deleteSpecies(id, userId);
  }

  // Culture methods
  async createCulture(culture: InsertCulture): Promise<Culture> {
    return await contentRepository.createCulture(culture);
  }

  async getCulture(id: string, userId: string, notebookId: string): Promise<Culture | undefined> {
    return await contentRepository.getCulture(id, userId, notebookId);
  }

  async getUserCultures(userId: string, notebookId: string): Promise<Culture[]> {
    return await contentRepository.getUserCultures(userId, notebookId);
  }

  async updateCulture(id: string, userId: string, updates: Partial<InsertCulture>, notebookId: string): Promise<Culture> {
    return await contentRepository.updateCulture(id, userId, updates, notebookId);
  }

  async deleteCulture(id: string, userId: string, notebookId: string): Promise<void> {
    await contentRepository.deleteCulture(id, userId, notebookId);
  }

  // Magic system methods (not implemented - table doesn't exist)
  async createMagic(): Promise<any> {
    throw new Error('Magic system not implemented');
  }

  async getMagic(id: string): Promise<any | undefined> {
    return undefined;
  }

  async getUserMagic(userId: string, notebookId: string): Promise<any[]> {
    return [];
  }

  async updateMagic(id: string, userId: string, updates: any): Promise<any> {
    throw new Error('Magic system not implemented');
  }

  // Document methods
  async createDocument(document: InsertDocument): Promise<Document> {
    return await contentRepository.createDocument(document);
  }

  async getDocument(id: string, userId: string, notebookId: string): Promise<Document | undefined> {
    return await contentRepository.getDocument(id, userId, notebookId);
  }

  async getUserDocuments(userId: string, notebookId: string): Promise<Document[]> {
    return await contentRepository.getUserDocuments(userId, notebookId);
  }

  async updateDocument(id: string, userId: string, updates: Partial<InsertDocument>): Promise<Document> {
    return await contentRepository.updateDocument(id, userId, updates);
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    await contentRepository.deleteDocument(id, userId);
  }

  // Food methods
  async createFood(food: InsertFood): Promise<Food> {
    return await contentRepository.createFood(food);
  }

  async getFood(id: string, userId: string, notebookId: string): Promise<Food | undefined> {
    return await contentRepository.getFood(id, userId, notebookId);
  }

  async getUserFoods(userId: string, notebookId: string): Promise<Food[]> {
    return await contentRepository.getUserFoods(userId, notebookId);
  }

  async updateFood(id: string, userId: string, updates: Partial<InsertFood>): Promise<Food> {
    return await contentRepository.updateFood(id, userId, updates);
  }

  async deleteFood(id: string, userId: string): Promise<void> {
    await contentRepository.deleteFood(id, userId);
  }

  // Language methods
  async createLanguage(language: InsertLanguage): Promise<Language> {
    return await contentRepository.createLanguage(language);
  }

  async getLanguage(id: string, userId: string, notebookId: string): Promise<Language | undefined> {
    return await contentRepository.getLanguage(id, userId, notebookId);
  }

  async getUserLanguages(userId: string, notebookId: string): Promise<Language[]> {
    return await contentRepository.getUserLanguages(userId, notebookId);
  }

  async updateLanguage(id: string, userId: string, updates: Partial<InsertLanguage>): Promise<Language> {
    return await contentRepository.updateLanguage(id, userId, updates);
  }

  async deleteLanguage(id: string, userId: string): Promise<void> {
    await contentRepository.deleteLanguage(id, userId);
  }

  // Religion methods
  async createReligion(religion: InsertReligion): Promise<Religion> {
    return await contentRepository.createReligion(religion);
  }

  async getReligion(id: string, userId: string, notebookId: string): Promise<Religion | undefined> {
    return await contentRepository.getReligion(id, userId, notebookId);
  }

  async getUserReligions(userId: string, notebookId: string): Promise<Religion[]> {
    return await contentRepository.getUserReligions(userId, notebookId);
  }

  async updateReligion(id: string, userId: string, updates: Partial<InsertReligion>): Promise<Religion> {
    return await contentRepository.updateReligion(id, userId, updates);
  }

  async deleteReligion(id: string, userId: string): Promise<void> {
    await contentRepository.deleteReligion(id, userId);
  }

  // Technology methods
  async createTechnology(technology: InsertTechnology): Promise<Technology> {
    return await contentRepository.createTechnology(technology);
  }

  async getTechnology(id: string, userId: string, notebookId: string): Promise<Technology | undefined> {
    return await contentRepository.getTechnology(id, userId, notebookId);
  }

  async getUserTechnologies(userId: string, notebookId: string): Promise<Technology[]> {
    return await contentRepository.getUserTechnologies(userId, notebookId);
  }

  async updateTechnology(id: string, userId: string, updates: Partial<InsertTechnology>): Promise<Technology> {
    return await contentRepository.updateTechnology(id, userId, updates);
  }

  async deleteTechnology(id: string, userId: string): Promise<void> {
    await contentRepository.deleteTechnology(id, userId);
  }

  // Weapon methods
  async createWeapon(weapon: InsertWeapon): Promise<Weapon> {
    return await contentRepository.createWeapon(weapon);
  }

  async getWeapon(id: string, userId: string, notebookId: string): Promise<Weapon | undefined> {
    return await contentRepository.getWeapon(id, userId, notebookId);
  }

  async getUserWeapons(userId: string, notebookId: string): Promise<Weapon[]> {
    return await contentRepository.getUserWeapons(userId, notebookId);
  }

  async updateWeapon(id: string, userId: string, notebookId: string, updates: Partial<InsertWeapon>): Promise<Weapon> {
    return await contentRepository.updateWeapon(id, userId, notebookId, updates);
  }

  async deleteWeapon(id: string, userId: string, notebookId: string): Promise<void> {
    await contentRepository.deleteWeapon(id, userId, notebookId);
  }

  // Profession methods
  async createProfession(profession: InsertProfession): Promise<Profession> {
    return await contentRepository.createProfession(profession);
  }

  async getProfession(id: string, userId: string, notebookId: string): Promise<Profession | undefined> {
    return await contentRepository.getProfession(id, userId, notebookId);
  }

  async getUserProfessions(userId: string, notebookId: string): Promise<Profession[]> {
    return await contentRepository.getUserProfessions(userId, notebookId);
  }

  async updateProfession(id: string, userId: string, updates: Partial<InsertProfession>): Promise<Profession> {
    return await contentRepository.updateProfession(id, userId, updates);
  }

  async deleteProfession(id: string, userId: string): Promise<void> {
    await contentRepository.deleteProfession(id, userId);
  }

  // Rank methods
  async createRank(rank: InsertRank): Promise<Rank> {
    return await contentRepository.createRank(rank);
  }

  async getRank(id: string, userId: string, notebookId: string): Promise<Rank | undefined> {
    return await contentRepository.getRank(id, userId, notebookId);
  }

  async getUserRanks(userId: string, notebookId: string): Promise<Rank[]> {
    return await contentRepository.getUserRanks(userId, notebookId);
  }

  async updateRank(id: string, userId: string, updates: Partial<InsertRank>): Promise<Rank> {
    return await contentRepository.updateRank(id, userId, updates);
  }

  async deleteRank(id: string, userId: string): Promise<void> {
    await contentRepository.deleteRank(id, userId);
  }

  // Condition methods
  async createCondition(condition: InsertCondition): Promise<Condition> {
    return await contentRepository.createCondition(condition);
  }

  async getCondition(id: string, userId: string, notebookId: string): Promise<Condition | undefined> {
    return await contentRepository.getCondition(id, userId, notebookId);
  }

  async getUserConditions(userId: string, notebookId: string): Promise<Condition[]> {
    return await contentRepository.getUserConditions(userId, notebookId);
  }

  async updateCondition(id: string, userId: string, updates: Partial<InsertCondition>): Promise<Condition> {
    return await contentRepository.updateCondition(id, userId, updates);
  }

  async deleteCondition(id: string, userId: string): Promise<void> {
    await contentRepository.deleteCondition(id, userId);
  }

  // Plant methods
  async createPlant(plant: InsertPlant): Promise<Plant> {
    return await contentRepository.createPlant(plant);
  }

  async getPlant(id: string, userId: string, notebookId: string): Promise<Plant | undefined> {
    return await contentRepository.getPlant(id, userId, notebookId);
  }

  async getUserPlants(userId: string, notebookId: string): Promise<Plant[]> {
    return await contentRepository.getUserPlants(userId, notebookId);
  }

  async updatePlant(id: string, userId: string, updates: Partial<InsertPlant>, notebookId: string): Promise<Plant> {
    return await contentRepository.updatePlant(id, userId, updates, notebookId);
  }

  async deletePlant(id: string, userId: string, notebookId: string): Promise<void> {
    await contentRepository.deletePlant(id, userId, notebookId);
  }

  // Description methods
  async createDescription(description: InsertDescription): Promise<Description> {
    return await contentRepository.createDescription(description);
  }

  async getDescription(id: string, userId: string, notebookId: string): Promise<Description | undefined> {
    return await contentRepository.getDescription(id, userId, notebookId);
  }

  async getUserDescriptions(userId: string, notebookId: string): Promise<Description[]> {
    return await contentRepository.getUserDescriptions(userId, notebookId);
  }

  async updateDescription(id: string, userId: string, updates: Partial<InsertDescription>): Promise<Description> {
    return await contentRepository.updateDescription(id, userId, updates);
  }

  async deleteDescription(id: string, userId: string): Promise<void> {
    await contentRepository.deleteDescription(id, userId);
  }

  // Ethnicity methods
  async createEthnicity(ethnicity: InsertEthnicity): Promise<Ethnicity> {
    return await contentRepository.createEthnicity(ethnicity);
  }

  async getEthnicity(id: string, userId: string, notebookId: string): Promise<Ethnicity | undefined> {
    return await contentRepository.getEthnicity(id, userId, notebookId);
  }

  async getUserEthnicities(userId: string, notebookId: string): Promise<Ethnicity[]> {
    return await contentRepository.getUserEthnicities(userId, notebookId);
  }

  async updateEthnicity(id: string, userId: string, updates: Partial<InsertEthnicity>): Promise<Ethnicity> {
    return await contentRepository.updateEthnicity(id, userId, updates);
  }

  async deleteEthnicity(id: string, userId: string): Promise<void> {
    await contentRepository.deleteEthnicity(id, userId);
  }

  // Drink methods
  async createDrink(drink: InsertDrink): Promise<Drink> {
    return await contentRepository.createDrink(drink);
  }

  async getDrink(id: string, userId: string, notebookId: string): Promise<Drink | undefined> {
    return await contentRepository.getDrink(id, userId, notebookId);
  }

  async getUserDrinks(userId: string, notebookId: string): Promise<Drink[]> {
    return await contentRepository.getUserDrinks(userId, notebookId);
  }

  async updateDrink(id: string, userId: string, updates: Partial<InsertDrink>): Promise<Drink> {
    return await contentRepository.updateDrink(id, userId, updates);
  }

  async deleteDrink(id: string, userId: string): Promise<void> {
    await contentRepository.deleteDrink(id, userId);
  }

  // Armor methods
  async createArmor(armor: InsertArmor): Promise<Armor> {
    return await contentRepository.createArmor(armor);
  }

  async getArmor(id: string, userId: string, notebookId: string): Promise<Armor | undefined> {
    return await contentRepository.getArmor(id, userId, notebookId);
  }

  async getUserArmor(userId: string, notebookId: string): Promise<Armor[]> {
    return await contentRepository.getUserArmor(userId, notebookId);
  }

  async updateArmor(id: string, userId: string, updates: Partial<InsertArmor>): Promise<Armor> {
    return await contentRepository.updateArmor(id, userId, updates);
  }

  async deleteArmor(id: string, userId: string): Promise<void> {
    await contentRepository.deleteArmor(id, userId);
  }

  // Accessory methods
  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    return await contentRepository.createAccessory(accessory);
  }

  async getAccessory(id: string, userId: string, notebookId: string): Promise<Accessory | undefined> {
    return await contentRepository.getAccessory(id, userId, notebookId);
  }

  async getUserAccessories(userId: string, notebookId: string): Promise<Accessory[]> {
    return await contentRepository.getUserAccessories(userId, notebookId);
  }

  async updateAccessory(id: string, userId: string, updates: Partial<InsertAccessory>): Promise<Accessory> {
    return await contentRepository.updateAccessory(id, userId, updates);
  }

  async deleteAccessory(id: string, userId: string): Promise<void> {
    await contentRepository.deleteAccessory(id, userId);
  }

  // Clothing methods
  async createClothing(clothing: InsertClothing): Promise<Clothing> {
    return await contentRepository.createClothing(clothing);
  }

  async getClothing(id: string, userId: string, notebookId: string): Promise<Clothing | undefined> {
    return await contentRepository.getClothing(id, userId, notebookId);
  }

  async getUserClothing(userId: string, notebookId: string): Promise<Clothing[]> {
    return await contentRepository.getUserClothing(userId, notebookId);
  }

  async updateClothing(id: string, userId: string, updates: Partial<InsertClothing>): Promise<Clothing> {
    return await contentRepository.updateClothing(id, userId, updates);
  }

  async deleteClothing(id: string, userId: string): Promise<void> {
    await contentRepository.deleteClothing(id, userId);
  }

  // Material methods
  async createMaterial(material: InsertMaterial): Promise<Material> {
    return await contentRepository.createMaterial(material);
  }

  async getMaterial(id: string, userId: string, notebookId: string): Promise<Material | undefined> {
    return await contentRepository.getMaterial(id, userId, notebookId);
  }

  async getUserMaterials(userId: string, notebookId: string): Promise<Material[]> {
    return await contentRepository.getUserMaterials(userId, notebookId);
  }

  async updateMaterial(id: string, userId: string, updates: Partial<InsertMaterial>): Promise<Material> {
    return await contentRepository.updateMaterial(id, userId, updates);
  }

  async deleteMaterial(id: string, userId: string): Promise<void> {
    await contentRepository.deleteMaterial(id, userId);
  }

  // Settlement methods
  async createSettlement(settlement: InsertSettlement): Promise<Settlement> {
    return await contentRepository.createSettlement(settlement);
  }

  async getSettlement(id: string, userId: string, notebookId: string): Promise<Settlement | undefined> {
    return await contentRepository.getSettlement(id, userId, notebookId);
  }

  async getUserSettlements(userId: string, notebookId: string): Promise<Settlement[]> {
    return await contentRepository.getUserSettlements(userId, notebookId);
  }

  async updateSettlement(id: string, userId: string, updates: Partial<InsertSettlement>): Promise<Settlement> {
    return await contentRepository.updateSettlement(id, userId, updates);
  }

  async deleteSettlement(id: string, userId: string): Promise<void> {
    await contentRepository.deleteSettlement(id, userId);
  }

  // Society methods
  async createSociety(society: InsertSociety): Promise<Society> {
    return await contentRepository.createSociety(society);
  }

  async getSociety(id: string, userId: string, notebookId: string): Promise<Society | undefined> {
    return await contentRepository.getSociety(id, userId, notebookId);
  }

  async getUserSocieties(userId: string, notebookId: string): Promise<Society[]> {
    return await contentRepository.getUserSocieties(userId, notebookId);
  }

  async updateSociety(id: string, userId: string, updates: Partial<InsertSociety>): Promise<Society> {
    return await contentRepository.updateSociety(id, userId, updates);
  }

  async deleteSociety(id: string, userId: string): Promise<void> {
    await contentRepository.deleteSociety(id, userId);
  }

  // Faction methods
  async createFaction(faction: InsertFaction): Promise<Faction> {
    return await contentRepository.createFaction(faction);
  }

  async getFaction(id: string, userId: string, notebookId: string): Promise<Faction | undefined> {
    return await contentRepository.getFaction(id, userId, notebookId);
  }

  async getUserFaction(userId: string, notebookId: string): Promise<Faction[]> {
    return await contentRepository.getUserFaction(userId, notebookId);
  }

  async updateFaction(id: string, userId: string, updates: Partial<InsertFaction>, notebookId: string): Promise<Faction> {
    return await contentRepository.updateFaction(id, userId, updates, notebookId);
  }

  async deleteFaction(id: string, userId: string, notebookId: string): Promise<void> {
    await contentRepository.deleteFaction(id, userId, notebookId);
  }

  // Military Unit methods
  async createMilitaryUnit(militaryUnit: InsertMilitaryUnit): Promise<MilitaryUnit> {
    return await contentRepository.createMilitaryUnit(militaryUnit);
  }

  async getMilitaryUnit(id: string, userId: string, notebookId: string): Promise<MilitaryUnit | undefined> {
    return await contentRepository.getMilitaryUnit(id, userId, notebookId);
  }

  async getUserMilitaryUnits(userId: string, notebookId: string): Promise<MilitaryUnit[]> {
    return await contentRepository.getUserMilitaryUnits(userId, notebookId);
  }

  async updateMilitaryUnit(id: string, userId: string, updates: Partial<InsertMilitaryUnit>): Promise<MilitaryUnit> {
    return await contentRepository.updateMilitaryUnit(id, userId, updates);
  }

  async deleteMilitaryUnit(id: string, userId: string): Promise<void> {
    await contentRepository.deleteMilitaryUnit(id, userId);
  }

  // Myth methods
  async createMyth(myth: InsertMyth): Promise<Myth> {
    return await contentRepository.createMyth(myth);
  }

  async getMyth(id: string, userId: string, notebookId: string): Promise<Myth | undefined> {
    return await contentRepository.getMyth(id, userId, notebookId);
  }

  async getUserMyths(userId: string, notebookId: string): Promise<Myth[]> {
    return await contentRepository.getUserMyths(userId, notebookId);
  }

  async updateMyth(id: string, userId: string, updates: Partial<InsertMyth>): Promise<Myth> {
    return await contentRepository.updateMyth(id, userId, updates);
  }

  async deleteMyth(id: string, userId: string): Promise<void> {
    await contentRepository.deleteMyth(id, userId);
  }

  // Legend methods
  async createLegend(legend: InsertLegend): Promise<Legend> {
    return await contentRepository.createLegend(legend);
  }

  async getLegend(id: string, userId: string, notebookId: string): Promise<Legend | undefined> {
    return await contentRepository.getLegend(id, userId, notebookId);
  }

  async getUserLegends(userId: string, notebookId: string): Promise<Legend[]> {
    return await contentRepository.getUserLegends(userId, notebookId);
  }

  async updateLegend(id: string, userId: string, updates: Partial<InsertLegend>): Promise<Legend> {
    return await contentRepository.updateLegend(id, userId, updates);
  }

  async deleteLegend(id: string, userId: string): Promise<void> {
    await contentRepository.deleteLegend(id, userId);
  }

  // Event methods
  async createEvent(event: InsertEvent): Promise<Event> {
    return await contentRepository.createEvent(event);
  }

  async getEvent(id: string, userId: string, notebookId: string): Promise<Event | undefined> {
    return await contentRepository.getEvent(id, userId, notebookId);
  }

  async getUserEvents(userId: string, notebookId: string): Promise<Event[]> {
    return await contentRepository.getUserEvents(userId, notebookId);
  }

  async updateEvent(id: string, userId: string, updates: Partial<InsertEvent>): Promise<Event> {
    return await contentRepository.updateEvent(id, userId, updates);
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    await contentRepository.deleteEvent(id, userId);
  }

  // Spell methods
  async createSpell(spell: InsertSpell): Promise<Spell> {
    return await contentRepository.createSpell(spell);
  }

  async getSpell(id: string, userId: string, notebookId: string): Promise<Spell | undefined> {
    return await contentRepository.getSpell(id, userId, notebookId);
  }

  async getUserSpells(userId: string, notebookId: string): Promise<Spell[]> {
    return await contentRepository.getUserSpells(userId, notebookId);
  }

  async updateSpell(id: string, userId: string, updates: Partial<InsertSpell>): Promise<Spell> {
    return await contentRepository.updateSpell(id, userId, updates);
  }

  async deleteSpell(id: string, userId: string): Promise<void> {
    await contentRepository.deleteSpell(id, userId);
  }

  // Resource methods
  async createResource(resource: InsertResource): Promise<Resource> {
    return await contentRepository.createResource(resource);
  }

  async getResource(id: string, userId: string, notebookId: string): Promise<Resource | undefined> {
    return await contentRepository.getResource(id, userId, notebookId);
  }

  async getUserResources(userId: string, notebookId: string): Promise<Resource[]> {
    return await contentRepository.getUserResources(userId, notebookId);
  }

  async updateResource(id: string, userId: string, updates: Partial<InsertResource>): Promise<Resource> {
    return await contentRepository.updateResource(id, userId, updates);
  }

  async deleteResource(id: string, userId: string): Promise<void> {
    await contentRepository.deleteResource(id, userId);
  }

  // Building methods
  async createBuilding(building: InsertBuilding): Promise<Building> {
    return await contentRepository.createBuilding(building);
  }

  async getBuilding(id: string, userId: string, notebookId: string): Promise<Building | undefined> {
    return await contentRepository.getBuilding(id, userId, notebookId);
  }

  async getUserBuildings(userId: string, notebookId: string): Promise<Building[]> {
    return await contentRepository.getUserBuildings(userId, notebookId);
  }

  async updateBuilding(id: string, userId: string, updates: Partial<InsertBuilding>): Promise<Building> {
    return await contentRepository.updateBuilding(id, userId, updates);
  }

  async deleteBuilding(id: string, userId: string): Promise<void> {
    await contentRepository.deleteBuilding(id, userId);
  }

  // Animal methods
  async createAnimal(animal: InsertAnimal): Promise<Animal> {
    return await contentRepository.createAnimal(animal);
  }

  async getAnimal(id: string, userId: string, notebookId: string): Promise<Animal | undefined> {
    return await contentRepository.getAnimal(id, userId, notebookId);
  }

  async getUserAnimals(userId: string, notebookId: string): Promise<Animal[]> {
    return await contentRepository.getUserAnimals(userId, notebookId);
  }

  async updateAnimal(id: string, userId: string, updates: Partial<InsertAnimal>): Promise<Animal> {
    return await contentRepository.updateAnimal(id, userId, updates);
  }

  async deleteAnimal(id: string, userId: string): Promise<void> {
    await contentRepository.deleteAnimal(id, userId);
  }

  // Transportation methods
  async createTransportation(transportation: InsertTransportation): Promise<Transportation> {
    return await contentRepository.createTransportation(transportation);
  }

  async getTransportation(id: string, userId: string, notebookId: string): Promise<Transportation | undefined> {
    return await contentRepository.getTransportation(id, userId, notebookId);
  }

  async getUserTransportation(userId: string, notebookId: string): Promise<Transportation[]> {
    return await contentRepository.getUserTransportation(userId, notebookId);
  }

  async updateTransportation(id: string, userId: string, updates: Partial<InsertTransportation>): Promise<Transportation> {
    return await contentRepository.updateTransportation(id, userId, updates);
  }

  async deleteTransportation(id: string, userId: string): Promise<void> {
    await contentRepository.deleteTransportation(id, userId);
  }

  // Natural Law methods
  async createNaturalLaw(naturalLaw: InsertNaturalLaw): Promise<NaturalLaw> {
    return await contentRepository.createNaturalLaw(naturalLaw);
  }

  async getNaturalLaw(id: string, userId: string, notebookId: string): Promise<NaturalLaw | undefined> {
    return await contentRepository.getNaturalLaw(id, userId, notebookId);
  }

  async getUserNaturalLaws(userId: string, notebookId: string): Promise<NaturalLaw[]> {
    return await contentRepository.getUserNaturalLaws(userId, notebookId);
  }

  async updateNaturalLaw(id: string, userId: string, updates: Partial<InsertNaturalLaw>): Promise<NaturalLaw> {
    return await contentRepository.updateNaturalLaw(id, userId, updates);
  }

  async deleteNaturalLaw(id: string, userId: string): Promise<void> {
    await contentRepository.deleteNaturalLaw(id, userId);
  }

  // Tradition methods
  async createTradition(tradition: InsertTradition): Promise<Tradition> {
    return await contentRepository.createTradition(tradition);
  }

  async getTradition(id: string, userId: string, notebookId: string): Promise<Tradition | undefined> {
    return await contentRepository.getTradition(id, userId, notebookId);
  }

  async getUserTraditions(userId: string, notebookId: string): Promise<Tradition[]> {
    return await contentRepository.getUserTraditions(userId, notebookId);
  }

  async updateTradition(id: string, userId: string, updates: Partial<InsertTradition>): Promise<Tradition> {
    return await contentRepository.updateTradition(id, userId, updates);
  }

  async deleteTradition(id: string, userId: string): Promise<void> {
    await contentRepository.deleteTradition(id, userId);
  }

  // Ritual methods
  async createRitual(ritual: InsertRitual): Promise<Ritual> {
    return await contentRepository.createRitual(ritual);
  }

  async getRitual(id: string, userId: string, notebookId: string): Promise<Ritual | undefined> {
    return await contentRepository.getRitual(id, userId, notebookId);
  }

  async getUserRituals(userId: string, notebookId: string): Promise<Ritual[]> {
    return await contentRepository.getUserRituals(userId, notebookId);
  }

  async updateRitual(id: string, userId: string, updates: Partial<InsertRitual>): Promise<Ritual> {
    return await contentRepository.updateRitual(id, userId, updates);
  }

  async deleteRitual(id: string, userId: string): Promise<void> {
    await contentRepository.deleteRitual(id, userId);
  }

  // Family Tree methods
  async createFamilyTree(familyTree: InsertFamilyTree): Promise<FamilyTree> {
    return await this.familyTreeRepository.createFamilyTree(familyTree);
  }

  async getFamilyTree(id: string, userId: string, notebookId: string): Promise<FamilyTree | undefined> {
    return await this.familyTreeRepository.getFamilyTree(id, userId, notebookId);
  }

  async getUserFamilyTrees(userId: string, notebookId: string): Promise<FamilyTree[]> {
    return await this.familyTreeRepository.getUserFamilyTrees(userId, notebookId);
  }

  async updateFamilyTree(id: string, userId: string, updates: Partial<InsertFamilyTree>): Promise<FamilyTree> {
    return await this.familyTreeRepository.updateFamilyTree(id, userId, updates);
  }

  async deleteFamilyTree(id: string, userId: string): Promise<void> {
    await this.familyTreeRepository.deleteFamilyTree(id, userId);
  }

  // Family Tree Member methods
  async createFamilyTreeMember(member: InsertFamilyTreeMember): Promise<FamilyTreeMember> {
    return await this.familyTreeRepository.createFamilyTreeMember(member);
  }

  async getFamilyTreeMembers(treeId: string, userId: string): Promise<FamilyTreeMember[]> {
    return await this.familyTreeRepository.getFamilyTreeMembers(treeId, userId);
  }

  async updateFamilyTreeMember(id: string, userId: string, updates: Partial<InsertFamilyTreeMember>): Promise<FamilyTreeMember> {
    return await this.familyTreeRepository.updateFamilyTreeMember(id, userId, updates);
  }

  async deleteFamilyTreeMember(id: string, userId: string, treeId: string): Promise<void> {
    await this.familyTreeRepository.deleteFamilyTreeMember(id, userId, treeId);
  }

  // Family Tree Relationship methods
  async createFamilyTreeRelationship(relationship: InsertFamilyTreeRelationship): Promise<FamilyTreeRelationship> {
    return await this.familyTreeRepository.createFamilyTreeRelationship(relationship);
  }

  async getFamilyTreeRelationships(treeId: string, userId: string): Promise<FamilyTreeRelationship[]> {
    return await this.familyTreeRepository.getFamilyTreeRelationships(treeId, userId);
  }

  async updateFamilyTreeRelationship(id: string, userId: string, updates: Partial<InsertFamilyTreeRelationship>): Promise<FamilyTreeRelationship> {
    return await this.familyTreeRepository.updateFamilyTreeRelationship(id, userId, updates);
  }

  async deleteFamilyTreeRelationship(id: string, userId: string, treeId: string): Promise<void> {
    await this.familyTreeRepository.deleteFamilyTreeRelationship(id, userId, treeId);
  }

  // Timeline methods
  async createTimeline(timeline: InsertTimeline): Promise<Timeline> {
    return await contentRepository.createTimeline(timeline);
  }

  async getTimeline(id: string, userId: string, notebookId: string): Promise<Timeline | undefined> {
    return await contentRepository.getTimeline(id, userId, notebookId);
  }

  async getUserTimelines(userId: string, notebookId: string): Promise<Timeline[]> {
    return await contentRepository.getUserTimelines(userId, notebookId);
  }

  async updateTimeline(id: string, userId: string, updates: Partial<InsertTimeline>): Promise<Timeline> {
    return await contentRepository.updateTimeline(id, userId, updates);
  }

  async deleteTimeline(id: string, userId: string): Promise<void> {
    await contentRepository.deleteTimeline(id, userId);
  }

  // Ceremony methods
  async createCeremony(ceremony: InsertCeremony): Promise<Ceremony> {
    return await contentRepository.createCeremony(ceremony);
  }

  async getCeremony(id: string, userId: string, notebookId: string): Promise<Ceremony | undefined> {
    return await contentRepository.getCeremony(id, userId, notebookId);
  }

  async getUserCeremonies(userId: string, notebookId: string): Promise<Ceremony[]> {
    return await contentRepository.getUserCeremonies(userId, notebookId);
  }

  async updateCeremony(id: string, userId: string, updates: Partial<InsertCeremony>): Promise<Ceremony> {
    return await contentRepository.updateCeremony(id, userId, updates);
  }

  async deleteCeremony(id: string, userId: string): Promise<void> {
    await contentRepository.deleteCeremony(id, userId);
  }

  // Map methods
  async createCanvasMap(map: InsertMap): Promise<Map> {
    return await contentRepository.createCanvasMap(map);
  }

  async getCanvasMap(id: string, userId: string, notebookId: string): Promise<Map | undefined> {
    return await contentRepository.getCanvasMap(id, userId, notebookId);
  }

  async getUserCanvasMaps(userId: string, notebookId: string): Promise<Map[]> {
    return await contentRepository.getUserCanvasMaps(userId, notebookId);
  }

  async updateCanvasMap(id: string, userId: string, updates: Partial<InsertMap>): Promise<Map> {
    return await contentRepository.updateCanvasMap(id, userId, updates);
  }

  async deleteCanvasMap(id: string, userId: string): Promise<void> {
    await contentRepository.deleteCanvasMap(id, userId);
  }

  // Music methods
  async createMusic(music: InsertMusic): Promise<Music> {
    return await contentRepository.createMusic(music);
  }

  async getMusic(id: string, userId: string, notebookId: string): Promise<Music | undefined> {
    return await contentRepository.getMusic(id, userId, notebookId);
  }

  async getUserMusic(userId: string, notebookId: string): Promise<Music[]> {
    return await contentRepository.getUserMusic(userId, notebookId);
  }

  async updateMusic(id: string, userId: string, updates: Partial<InsertMusic>): Promise<Music> {
    return await contentRepository.updateMusic(id, userId, updates);
  }

  async deleteMusic(id: string, userId: string): Promise<void> {
    await contentRepository.deleteMusic(id, userId);
  }

  // Dance methods
  async createDance(dance: InsertDance): Promise<Dance> {
    return await contentRepository.createDance(dance);
  }

  async getDance(id: string, userId: string, notebookId: string): Promise<Dance | undefined> {
    return await contentRepository.getDance(id, userId, notebookId);
  }

  async getUserDances(userId: string, notebookId: string): Promise<Dance[]> {
    return await contentRepository.getUserDances(userId, notebookId);
  }

  async updateDance(id: string, userId: string, updates: Partial<InsertDance>): Promise<Dance> {
    return await contentRepository.updateDance(id, userId, updates);
  }

  async deleteDance(id: string, userId: string): Promise<void> {
    await contentRepository.deleteDance(id, userId);
  }

  // Law methods
  async createLaw(law: InsertLaw): Promise<Law> {
    return await contentRepository.createLaw(law);
  }

  async getLaw(id: string, userId: string, notebookId: string): Promise<Law | undefined> {
    return await contentRepository.getLaw(id, userId, notebookId);
  }

  async getUserLaws(userId: string, notebookId: string): Promise<Law[]> {
    return await contentRepository.getUserLaws(userId, notebookId);
  }

  async updateLaw(id: string, userId: string, updates: Partial<InsertLaw>): Promise<Law> {
    return await contentRepository.updateLaw(id, userId, updates);
  }

  async deleteLaw(id: string, userId: string): Promise<void> {
    await contentRepository.deleteLaw(id, userId);
  }

  // Policy methods
  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    return await contentRepository.createPolicy(policy);
  }

  async getPolicy(id: string, userId: string, notebookId: string): Promise<Policy | undefined> {
    return await contentRepository.getPolicy(id, userId, notebookId);
  }

  async getUserPolicies(userId: string, notebookId: string): Promise<Policy[]> {
    return await contentRepository.getUserPolicies(userId, notebookId);
  }

  async updatePolicy(id: string, userId: string, updates: Partial<InsertPolicy>): Promise<Policy> {
    return await contentRepository.updatePolicy(id, userId, updates);
  }

  async deletePolicy(id: string, userId: string): Promise<void> {
    await contentRepository.deletePolicy(id, userId);
  }

  // Potion methods
  async createPotion(potion: InsertPotion): Promise<Potion> {
    return await contentRepository.createPotion(potion);
  }

  async getPotion(id: string, userId: string, notebookId: string): Promise<Potion | undefined> {
    return await contentRepository.getPotion(id, userId, notebookId);
  }

  async getUserPotions(userId: string, notebookId: string): Promise<Potion[]> {
    return await contentRepository.getUserPotions(userId, notebookId);
  }

  async updatePotion(id: string, userId: string, updates: Partial<InsertPotion>): Promise<Potion> {
    return await contentRepository.updatePotion(id, userId, updates);
  }

  async deletePotion(id: string, userId: string): Promise<void> {
    await contentRepository.deletePotion(id, userId);
  }

  // Name generator methods
  async createName(name: InsertName): Promise<GeneratedName> {
    return await contentRepository.createName(name);
  }

  async getName(id: string, userId: string, notebookId: string): Promise<GeneratedName | undefined> {
    return await contentRepository.getName(id, userId, notebookId);
  }

  async getUserNames(userId: string, notebookId: string): Promise<GeneratedName[]> {
    return await contentRepository.getUserNames(userId, notebookId);
  }

  // Theme methods
  async createTheme(theme: InsertTheme): Promise<Theme> {
    return await contentRepository.createTheme(theme);
  }

  async getTheme(id: string, userId: string, notebookId: string): Promise<Theme | undefined> {
    return await contentRepository.getTheme(id, userId, notebookId);
  }

  async getUserThemes(userId: string, notebookId: string): Promise<Theme[]> {
    return await contentRepository.getUserThemes(userId, notebookId);
  }

  async updateTheme(id: string, userId: string, updates: Partial<InsertTheme>): Promise<Theme> {
    return await contentRepository.updateTheme(id, userId, updates);
  }

  // Mood methods
  async createMood(mood: InsertMood): Promise<Mood> {
    return await contentRepository.createMood(mood);
  }

  async getMood(id: string, userId: string, notebookId: string): Promise<Mood | undefined> {
    return await contentRepository.getMood(id, userId, notebookId);
  }

  async getUserMoods(userId: string, notebookId: string): Promise<Mood[]> {
    return await contentRepository.getUserMoods(userId, notebookId);
  }

  // Conflict methods
  async createConflict(conflict: InsertConflict): Promise<Conflict> {
    return await contentRepository.createConflict(conflict);
  }

  async getConflict(id: string, userId: string, notebookId: string): Promise<Conflict | undefined> {
    return await contentRepository.getConflict(id, userId, notebookId);
  }

  async getUserConflicts(userId: string, notebookId: string): Promise<Conflict[]> {
    return await contentRepository.getUserConflicts(userId, notebookId);
  }

  async updateConflict(id: string, userId: string, updates: Partial<InsertConflict>): Promise<Conflict> {
    return await contentRepository.updateConflict(id, userId, updates);
  }

  // Guide methods
  async createGuide(guide: InsertGuide): Promise<Guide> {
    return await contentRepository.createGuide(guide);
  }

  async getGuide(id: string): Promise<Guide | undefined> {
    return await contentRepository.getGuide(id);
  }

  async getGuides(category?: string): Promise<Guide[]> {
    const conditions = category ? [eq(guides.category, category)] : [];
    return await db.select().from(guides)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(guides.createdAt));
  }

  async searchGuides(query: string, category?: string): Promise<Guide[]> {
    const searchPattern = `%${query}%`;
    const conditions = [
      or(
        ilike(guides.title, searchPattern),
        ilike(guides.content, searchPattern)
      )
    ];
    if (category) {
      conditions.push(eq(guides.category, category));
    }
    return await db.select().from(guides)
      .where(and(...conditions))
      .orderBy(desc(guides.createdAt));
  }

  async updateGuide(id: string, updates: Partial<InsertGuide>): Promise<Guide | undefined> {
    return await contentRepository.updateGuide(id, updates);
  }

  async deleteGuide(id: string): Promise<boolean> {
    return await contentRepository.deleteGuide(id);
  }

  // Guide category methods
  async createGuideCategory(category: InsertGuideCategory): Promise<GuideCategory> {
    return await contentRepository.createGuideCategory(category);
  }

  async getGuideCategories(): Promise<any[]> {
    return await contentRepository.getGuideCategories();
  }

  async updateGuideCategory(id: string, updates: Partial<InsertGuideCategory>): Promise<GuideCategory | undefined> {
    return await contentRepository.updateGuideCategory(id, updates);
  }

  async deleteGuideCategory(id: string): Promise<boolean> {
    return await contentRepository.deleteGuideCategory(id);
  }

  async reorderGuideCategories(categoryOrders: Array<{ id: string; order: number }>): Promise<void> {
    return await contentRepository.reorderGuideCategories(categoryOrders);
  }

  // Guide reference methods
  async createGuideReference(reference: InsertGuideReference): Promise<GuideReference> {
    return await contentRepository.createGuideReference(reference);
  }

  async getGuideReferences(sourceGuideId: string): Promise<GuideReference[]> {
    return await contentRepository.getGuideReferences(sourceGuideId);
  }

  async getGuideReferencedBy(targetGuideId: string): Promise<GuideReference[]> {
    return await contentRepository.getGuideReferencedBy(targetGuideId);
  }

  async deleteGuideReferences(sourceGuideId: string): Promise<void> {
    return await contentRepository.deleteGuideReferences(sourceGuideId);
  }

  async syncGuideReferences(sourceGuideId: string, targetGuideIds: string[]): Promise<void> {
    return await contentRepository.syncGuideReferences(sourceGuideId, targetGuideIds);
  }

  // Saved item methods
  async saveItem(savedItem: InsertSavedItem): Promise<SavedItem> {
    return await contentRepository.saveItem(savedItem);
  }

  async unsaveItem(userId: string, itemType: string, itemId: string): Promise<void> {
    await contentRepository.unsaveItem(userId, itemType, itemId);
  }

  async unsaveItemFromNotebook(userId: string, itemType: string, itemId: string, notebookId: string): Promise<void> {
    await db.delete(savedItems)
      .where(and(
        eq(savedItems.userId, userId),
        eq(savedItems.itemType, itemType),
        eq(savedItems.itemId, itemId),
        eq(savedItems.notebookId, notebookId)
      ));
  }

  async getUserSavedItems(userId: string, itemType?: string): Promise<SavedItem[]> {
    return await contentRepository.getUserSavedItems(userId, itemType);
  }

  async getUserSavedItemsByNotebook(userId: string, notebookId: string, itemType?: string): Promise<SavedItem[]> {
    const conditions = [
      eq(savedItems.userId, userId),
      eq(savedItems.notebookId, notebookId)
    ];
    if (itemType) {
      conditions.push(eq(savedItems.itemType, itemType));
    }
    return await db.select().from(savedItems)
      .where(and(...conditions))
      .orderBy(desc(savedItems.createdAt));
  }

  async getSavedItemsByNotebookBatch(userId: string, notebookId: string): Promise<SavedItem[]> {
    const [notebook] = await db.select()
      .from(notebooks)
      .where(and(
        eq(notebooks.id, notebookId),
        eq(notebooks.userId, userId)
      ))
      .limit(1);

    if (!notebook) {
      return [];
    }

    return await db.select().from(savedItems)
      .where(and(
        eq(savedItems.userId, userId),
        eq(savedItems.notebookId, notebookId)
      ))
      .orderBy(desc(savedItems.createdAt));
  }

  async isItemSaved(userId: string, itemType: string, itemId: string): Promise<boolean> {
    return await contentRepository.isItemSaved(userId, itemType, itemId);
  }

  async updateSavedItemData(savedItemId: string, userId: string, itemData: any): Promise<SavedItem | undefined> {
    const [updated] = await db.update(savedItems)
      .set({ 
        itemData
      })
      .where(and(
        eq(savedItems.id, savedItemId),
        eq(savedItems.userId, userId)
      ))
      .returning();
    return updated || undefined;
  }

  async updateSavedItemDataByItem(userId: string, itemType: string, itemId: string, notebookId: string, itemData: any): Promise<SavedItem | undefined> {
    const [updated] = await db.update(savedItems)
      .set({ 
        itemData
      })
      .where(and(
        eq(savedItems.userId, userId),
        eq(savedItems.itemType, itemType),
        eq(savedItems.itemId, itemId),
        eq(savedItems.notebookId, notebookId)
      ))
      .returning();
    return updated || undefined;
  }

  async updateSavedItemType(savedItemId: string, userId: string, newItemType: string): Promise<SavedItem | undefined> {
    const [updated] = await db.update(savedItems)
      .set({ 
        itemType: newItemType
      })
      .where(and(
        eq(savedItems.id, savedItemId),
        eq(savedItems.userId, userId)
      ))
      .returning();
    return updated || undefined;
  }

  // Project methods
  async createProject(project: InsertProject): Promise<Project> {
    return await this.projectRepository.createProject(project);
  }

  async getProject(id: string, userId: string): Promise<Project | undefined> {
    return await this.projectRepository.getProject(id, userId);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await this.projectRepository.getUserProjects(userId);
  }

  async updateProject(id: string, userId: string, updates: Partial<InsertProject>): Promise<Project> {
    return await this.projectRepository.updateProject(id, userId, updates);
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    await this.projectRepository.deleteProject(id, userId);
  }

  async searchProjects(userId: string, query: string): Promise<Project[]> {
    return await searchRepository.searchProjects(userId, query);
  }

  // Project Section methods
  async createProjectSection(section: InsertProjectSection): Promise<ProjectSection> {
    return await this.projectRepository.createProjectSection(section);
  }

  async getProjectSection(id: string, projectId: string): Promise<ProjectSection | undefined> {
    return await this.projectRepository.getProjectSection(id, projectId);
  }

  async getProjectSections(projectId: string): Promise<ProjectSection[]> {
    return await this.projectRepository.getProjectSections(projectId);
  }

  async updateProjectSection(id: string, projectId: string, updates: Partial<InsertProjectSection>): Promise<ProjectSection> {
    return await this.projectRepository.updateProjectSection(id, projectId, updates);
  }

  async deleteProjectSection(id: string, projectId: string): Promise<void> {
    await this.projectRepository.deleteProjectSection(id, projectId);
  }

  async reorderProjectSections(projectId: string, sectionOrders: { id: string; position: number; parentId?: string | null }[]): Promise<void> {
    await this.projectRepository.reorderProjectSections(projectId, sectionOrders);
  }

  // Universal search method
  async searchAllContent(userId: string, query: string): Promise<any[]> {
    return await searchRepository.searchAllContent(userId, query);
  }

  // Project links methods
  async createProjectLink(link: InsertProjectLink): Promise<ProjectLink> {
    return await this.projectRepository.createProjectLink(link);
  }

  async getProjectLinks(projectId: string, userId: string): Promise<ProjectLink[]> {
    return await this.projectRepository.getProjectLinks(projectId, userId);
  }

  async getProjectLinksForUser(userId: string): Promise<ProjectLink[]> {
    return await this.projectRepository.getProjectLinksForUser(userId);
  }

  async deleteProjectLink(id: string, userId: string): Promise<void> {
    await this.projectRepository.deleteProjectLink(id, userId);
  }

  // Pinned content methods
  async pinContent(pin: InsertPinnedContent): Promise<PinnedContent> {
    return await contentRepository.pinContent(pin);
  }

  async unpinContent(userId: string, itemType: string, itemId: string, notebookId: string): Promise<void> {
    await contentRepository.unpinContent(userId, itemType, itemId, notebookId);
  }

  async getUserPinnedContent(userId: string, notebookId: string, category?: string): Promise<PinnedContent[]> {
    return await contentRepository.getUserPinnedContent(userId, notebookId, category);
  }

  async reorderPinnedContent(userId: string, itemId: string, newOrder: number, notebookId: string): Promise<void> {
    await contentRepository.reorderPinnedContent(userId, itemId, newOrder, notebookId);
  }

  async isContentPinned(userId: string, itemType: string, itemId: string, notebookId: string): Promise<boolean> {
    return await contentRepository.isContentPinned(userId, itemType, itemId, notebookId);
  }

  // Canvas methods
  async createCanvas(canvas: InsertCanvas): Promise<Canvas> {
    return await contentRepository.createCanvas(canvas);
  }

  async getCanvas(id: string, userId: string): Promise<Canvas | undefined> {
    return await contentRepository.getCanvas(id, userId);
  }

  async getUserCanvases(userId: string): Promise<Canvas[]> {
    return await contentRepository.getUserCanvases(userId);
  }

  async getProjectCanvases(projectId: string, userId: string): Promise<Canvas[]> {
    return await contentRepository.getProjectCanvases(projectId, userId);
  }

  async updateCanvas(id: string, userId: string, updates: Partial<InsertCanvas>): Promise<Canvas> {
    return await contentRepository.updateCanvas(id, userId, updates);
  }

  async deleteCanvas(id: string, userId: string): Promise<void> {
    await contentRepository.deleteCanvas(id, userId);
  }

  // Folder methods
  async createFolder(folder: InsertFolder): Promise<Folder> {
    return await contentRepository.createFolder(folder);
  }

  async getFolder(id: string, userId: string): Promise<Folder | undefined> {
    return await contentRepository.getFolder(id, userId);
  }

  async getUserFolders(userId: string, type?: string): Promise<Folder[]> {
    return await contentRepository.getUserFolders(userId, type);
  }

  async getDocumentFolders(documentId: string, userId: string): Promise<Folder[]> {
    return await contentRepository.getDocumentFolders(documentId, userId);
  }

  async updateFolder(id: string, userId: string, updates: Partial<InsertFolder>): Promise<Folder> {
    return await contentRepository.updateFolder(id, userId, updates);
  }

  async deleteFolder(id: string, userId: string): Promise<void> {
    await contentRepository.deleteFolder(id, userId);
  }

  async getFolderHierarchy(userId: string, type: string): Promise<Folder[]> {
    return await contentRepository.getFolderHierarchy(userId, type);
  }

  // Note methods
  async createNote(note: InsertNote): Promise<Note> {
    return await contentRepository.createNote(note);
  }

  async getNote(id: string, userId: string): Promise<Note | undefined> {
    return await contentRepository.getNote(id, userId);
  }

  async getUserNotes(userId: string, type?: string): Promise<Note[]> {
    return await contentRepository.getUserNotes(userId, type);
  }

  async getFolderNotes(folderId: string, userId: string): Promise<Note[]> {
    return await contentRepository.getFolderNotes(folderId, userId);
  }

  async getDocumentNotes(documentId: string, userId: string): Promise<Note[]> {
    return await contentRepository.getDocumentNotes(documentId, userId);
  }

  async updateNote(id: string, userId: string, updates: Partial<InsertNote>): Promise<Note> {
    return await contentRepository.updateNote(id, userId, updates);
  }

  async deleteNote(id: string, userId: string): Promise<void> {
    await contentRepository.deleteNote(id, userId);
  }

  // Quick note methods
  async createQuickNote(userId: string, title: string, content: string): Promise<Note> {
    return await contentRepository.createQuickNote(userId, title, content);
  }

  async getUserQuickNote(userId: string): Promise<Note | undefined> {
    return await contentRepository.getUserQuickNote(userId);
  }

  async getQuickNoteById(id: string, userId: string): Promise<Note | undefined> {
    return await contentRepository.getQuickNoteById(id, userId);
  }

  async updateQuickNote(id: string, userId: string, updates: { title?: string; content?: string }): Promise<Note> {
    return await contentRepository.updateQuickNote(id, userId, updates);
  }

  async deleteQuickNote(id: string, userId: string): Promise<void> {
    await contentRepository.deleteQuickNote(id, userId);
  }

  // Chat message methods
  async createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage> {
    return await contentRepository.createChatMessage(chatMessage);
  }

  async getChatMessages(userId: string, projectId?: string, guideId?: string, limit?: number): Promise<ChatMessage[]> {
    return await contentRepository.getChatMessages(userId, projectId, guideId, limit);
  }

  async deleteChatHistory(userId: string, projectId?: string, guideId?: string): Promise<void> {
    await contentRepository.deleteChatHistory(userId, projectId, guideId);
  }

  // Timeline Event methods  
  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    return await contentRepository.createTimelineEvent(event);
  }

  async getTimelineEvent(id: string, userId: string, timelineId: string): Promise<TimelineEvent | undefined> {
    return await contentRepository.getTimelineEvent(id, userId, timelineId);
  }

  async getTimelineEvents(timelineId: string, userId: string): Promise<TimelineEvent[]> {
    return await contentRepository.getTimelineEvents(timelineId, userId);
  }

  async updateTimelineEvent(id: string, userId: string, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent> {
    return await contentRepository.updateTimelineEvent(id, userId, updates);
  }

  async deleteTimelineEvent(id: string, userId: string, timelineId: string): Promise<void> {
    await contentRepository.deleteTimelineEvent(id, userId, timelineId);
  }

  // Timeline Relationship methods
  async createTimelineRelationship(relationship: InsertTimelineRelationship): Promise<TimelineRelationship> {
    return await contentRepository.createTimelineRelationship(relationship);
  }

  async getTimelineRelationships(timelineId: string, userId: string): Promise<TimelineRelationship[]> {
    return await contentRepository.getTimelineRelationships(timelineId, userId);
  }

  async updateTimelineRelationship(id: string, userId: string, updates: Partial<InsertTimelineRelationship>): Promise<TimelineRelationship> {
    return await contentRepository.updateTimelineRelationship(id, userId, updates);
  }

  async deleteTimelineRelationship(id: string, userId: string, timelineId: string): Promise<void> {
    await contentRepository.deleteTimelineRelationship(id, userId, timelineId);
  }

  // User preferences methods
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs || undefined;
  }

  async upsertUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [result] = await db
      .insert(userPreferences)
      .values({ ...preferences, userId })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...preferences, updatedAt: new Date() }
      })
      .returning();
    return result;
  }

  // Conversation summary methods
  async getConversationSummary(userId: string, projectId?: string | null, guideId?: string | null): Promise<ConversationSummary | undefined> {
    const conditions = [eq(conversationSummaries.userId, userId)];

    // Always apply scope constraints - use NULL for undefined/null parameters
    conditions.push(projectId ? eq(conversationSummaries.projectId, projectId) : isNull(conversationSummaries.projectId));
    conditions.push(guideId ? eq(conversationSummaries.guideId, guideId) : isNull(conversationSummaries.guideId));

    const [summary] = await db
      .select()
      .from(conversationSummaries)
      .where(and(...conditions));
    return summary || undefined;
  }

  async upsertConversationSummary(summary: InsertConversationSummary): Promise<ConversationSummary> {
    const existingSummary = await this.getConversationSummary(
      summary.userId,
      summary.projectId || null,
      summary.guideId || null
    );

    if (existingSummary) {
      const [updated] = await db
        .update(conversationSummaries)
        .set({ ...summary, updatedAt: new Date() })
        .where(eq(conversationSummaries.id, existingSummary.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(conversationSummaries)
        .values(summary)
        .returning();
      return created;
    }
  }

  async updateConversationSummary(id: string, userId: string, updates: Partial<InsertConversationSummary>): Promise<ConversationSummary | undefined> {
    const [updated] = await db
      .update(conversationSummaries)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(conversationSummaries.id, id), eq(conversationSummaries.userId, userId)))
      .returning();
    return updated || undefined;
  }

  // Feedback methods
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [created] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return created;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt));
  }

  async getFeedback(id: string): Promise<Feedback | undefined> {
    const [result] = await db
      .select()
      .from(feedback)
      .where(eq(feedback.id, id));
    return result || undefined;
  }

  async updateFeedbackStatus(id: string, status: string): Promise<Feedback | undefined> {
    const [updated] = await db
      .update(feedback)
      .set({ status, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return updated || undefined;
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  async markFeedbackReplyAsRead(feedbackId: string, userId: string): Promise<Feedback | undefined> {
    const [updated] = await db
      .update(feedback)
      .set({ repliedAt: new Date(), readAt: new Date(), updatedAt: new Date() })
      .where(and(eq(feedback.id, feedbackId), eq(feedback.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async getUnreadReplyCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql`COUNT(*)` })
      .from(feedback)
      .where(and(
        eq(feedback.userId, userId),
        isNull(feedback.readAt)
      ));
    return result.count;
  }

  async replyToFeedback(feedbackId: string, reply: string, adminUserId: string): Promise<Feedback | undefined> {
    const [updated] = await db
      .update(feedback)
      .set({ reply, repliedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(feedback.id, feedbackId), eq(feedback.adminUserId, adminUserId)))
      .returning();
    return updated || undefined;
  }

  // Conversation thread methods
  async createConversationThread(thread: InsertConversationThread): Promise<ConversationThread> {
    const [newThread] = await db
      .insert(conversationThreads)
      .values(thread)
      .returning();
    return newThread;
  }

  async getConversationThread(id: string, userId: string): Promise<ConversationThread | undefined> {
    const [thread] = await db
      .select()
      .from(conversationThreads)
      .where(and(
        eq(conversationThreads.id, id),
        eq(conversationThreads.userId, userId)
      ));
    return thread || undefined;
  }

  async getConversationThreads(filters: { userId: string, projectId?: string, guideId?: string, isActive?: boolean }): Promise<ConversationThread[]> {
    const conditions = [eq(conversationThreads.userId, filters.userId)];

    // Add projectId filter if provided
    if (filters.projectId !== undefined) {
      conditions.push(eq(conversationThreads.projectId, filters.projectId));
    }

    // Add guideId filter if provided
    if (filters.guideId !== undefined) {
      conditions.push(eq(conversationThreads.guideId, filters.guideId));
    }

    // Add isActive filter if provided
    if (filters.isActive !== undefined) {
      conditions.push(eq(conversationThreads.isActive, filters.isActive));
    }

    return await db
      .select()
      .from(conversationThreads)
      .where(and(...conditions))
      .orderBy(desc(conversationThreads.lastActivityAt));
  }

  async searchConversationThreads(userId: string, query: string, filters?: { projectId?: string, guideId?: string }): Promise<ConversationThread[]> {
    const searchPattern = `%${query}%`;
    const conditions = [eq(conversationThreads.userId, userId)];

    // Add optional filters
    if (filters?.projectId) {
      conditions.push(eq(conversationThreads.projectId, filters.projectId));
    }
    if (filters?.guideId) {
      conditions.push(eq(conversationThreads.guideId, filters.guideId));
    }

    // Search in title, summary, and tags
    const searchConditions = or(
      ilike(conversationThreads.title, searchPattern),
      ilike(conversationThreads.summary, searchPattern),
      sql`EXISTS (
        SELECT 1 FROM unnest(${conversationThreads.tags}) AS tag 
        WHERE tag ILIKE ${searchPattern}
      )`
    );

    conditions.push(searchConditions!);

    // Get matching threads
    const threads = await db
      .select()
      .from(conversationThreads)
      .where(and(...conditions))
      .orderBy(desc(conversationThreads.lastActivityAt));

    // Also search in chat message content
    const messageConditions = [eq(chatMessages.userId, userId)];
    if (filters?.projectId) {
      messageConditions.push(eq(chatMessages.projectId, filters.projectId));
    }
    if (filters?.guideId) {
      messageConditions.push(eq(chatMessages.guideId, filters.guideId));
    }
    messageConditions.push(ilike(chatMessages.content, searchPattern));

    const matchingMessages = await db
      .select({
        threadId: chatMessages.threadId
      })
      .from(chatMessages)
      .where(and(...messageConditions))
      .groupBy(chatMessages.threadId);

    // Get threads for matching messages
    const messageThreadIds = matchingMessages
      .map(m => m.threadId)
      .filter((id): id is string => id !== null);

    let messageThreads: ConversationThread[] = [];
    if (messageThreadIds.length > 0) {
      const messageThreadConditions = [
        eq(conversationThreads.userId, userId),
        inArray(conversationThreads.id, messageThreadIds)
      ];

      messageThreads = await db
        .select()
        .from(conversationThreads)
        .where(and(...messageThreadConditions))
        .orderBy(desc(conversationThreads.lastActivityAt));
    }

    // Combine and deduplicate results
    const allThreads = [...threads, ...messageThreads];
    const uniqueThreads = Array.from(
      new Map(allThreads.map(t => [t.id, t])).values()
    );

    // Sort by lastActivityAt descending
    return uniqueThreads.sort((a, b) => {
      const dateA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const dateB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async updateConversationThread(id: string, userId: string, updates: Partial<InsertConversationThread>): Promise<ConversationThread | undefined> {
    const [updated] = await db
      .update(conversationThreads)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(
        eq(conversationThreads.id, id),
        eq(conversationThreads.userId, userId)
      ))
      .returning();
    return updated || undefined;
  }

  async updateThreadActivity(threadId: string, userId: string): Promise<void> {
    await db
      .update(conversationThreads)
      .set({
        lastActivityAt: new Date(),
        messageCount: sql`${conversationThreads.messageCount} + 1`
      })
      .where(and(
        eq(conversationThreads.id, threadId),
        eq(conversationThreads.userId, userId)
      ));
  }

  async deleteConversationThread(id: string, userId: string): Promise<void> {
    // Validate ownership before deleting
    const [existing] = await db
      .select()
      .from(conversationThreads)
      .where(eq(conversationThreads.id, id));

    if (!existing) {
      throw new Error('Conversation thread not found');
    }
    if (existing.userId !== userId) {
      throw new Error('Unauthorized: You do not own this conversation thread');
    }

    // Delete the thread (cascade will handle messages)
    await db
      .delete(conversationThreads)
      .where(and(
        eq(conversationThreads.id, id),
        eq(conversationThreads.userId, userId)
      ));
  }

  async getChatMessagesByThread(threadId: string, userId: string, limit?: number): Promise<ChatMessage[]> {
    return await contentRepository.getChatMessagesByThread(threadId, userId, limit);
  }
}

export const storageFacade = new StorageFacade();