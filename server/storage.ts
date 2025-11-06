import {
  type User,
  type InsertUser,
  type UpsertUser,
  type Character,
  type UpdateCharacter,
  type InsertCharacter,
  type Plot,
  type InsertPlot,
  type Prompt,
  type InsertPrompt,
  type Location,
  type InsertLocation,
  type Setting,
  type InsertSetting,
  type Item,
  type InsertItem,
  type Organization,
  type InsertOrganization,
  type Creature,
  type InsertCreature,
  type Species,
  type InsertSpecies,
  type Culture,
  type InsertCulture,
  type Document,
  type InsertDocument,
  type Food,
  type InsertFood,
  type Language,
  type InsertLanguage,
  type Religion,
  type InsertReligion,
  type Technology,
  type InsertTechnology,
  type Weapon,
  type InsertWeapon,
  type Profession,
  type InsertProfession,
  type Rank,
  type InsertRank,
  type Condition,
  type InsertCondition,
  type SavedItem,
  type InsertSavedItem,
  type GeneratedName,
  type InsertName,
  type Theme,
  type InsertTheme,
  type Mood,
  type InsertMood,
  type Conflict,
  type InsertConflict,
  type InsertGuide,
  type Guide,
  type GuideCategory,
  type InsertGuideCategory,
  type GuideReference,
  type InsertGuideReference,
  type Project,
  type InsertProject,
  type ProjectSection,
  type InsertProjectSection,
  type ProjectLink,
  type InsertProjectLink,
  type Folder,
  type InsertFolder,
  type Note,
  type InsertNote,
  // Missing content types - Import types
  type Plant,
  type InsertPlant,
  type Description,
  type InsertDescription,
  type Ethnicity,
  type InsertEthnicity,
  type Drink,
  type InsertDrink,
  type Armor,
  type InsertArmor,
  type Accessory,
  type InsertAccessory,
  type Clothing,
  type InsertClothing,
  type Material,
  type InsertMaterial,
  type Settlement,
  type InsertSettlement,
  type Society,
  type InsertSociety,
  type Faction,
  type InsertFaction,
  type MilitaryUnit,
  type InsertMilitaryUnit,
  type Myth,
  type InsertMyth,
  type Legend,
  type InsertLegend,
  type Event,
  type InsertEvent,
  type Spell,
  type InsertSpell,
  type Resource,
  type InsertResource,
  type Building,
  type InsertBuilding,
  type Animal,
  type InsertAnimal,
  type Transportation,
  type InsertTransportation,
  type NaturalLaw,
  type InsertNaturalLaw,
  type Tradition,
  type InsertTradition,
  type Ritual,
  type InsertRitual,
  type FamilyTree,
  type InsertFamilyTree,
  type FamilyTreeMember,
  type InsertFamilyTreeMember,
  type FamilyTreeRelationship,
  type InsertFamilyTreeRelationship,
  type Timeline,
  type InsertTimeline,
  type TimelineEvent,
  type InsertTimelineEvent,
  type TimelineRelationship,
  type InsertTimelineRelationship,
  type Ceremony,
  type InsertCeremony,
  type Map,
  type InsertMap,
  type Music,
  type InsertMusic,
  type Dance,
  type InsertDance,
  type Law,
  type InsertLaw,
  type Policy,
  type InsertPolicy,
  type Potion,
  type InsertPotion,
  type ChatMessage,
  type InsertChatMessage,
  type ConversationThread,
  type InsertConversationThread,
  type Notebook,
  type InsertNotebook,
  type UpdateNotebook,
  type ImportJob,
  type InsertImportJob,
  type UpdateImportJob,
  type UserPreferences,
  type InsertUserPreferences,
  type ConversationSummary,
  type InsertConversationSummary,
  type Feedback,
  type InsertFeedback,
  users,
  characters,
  plots,
  prompts,
  locations,
  settings,
  items,
  organizations,
  creatures,
  species,
  cultures,
  documents,
  foods,
  languages,
  religions,
  technologies,
  weapons,
  professions,
  ranks,
  conditions,
  savedItems,
  names,
  themes,
  moods,
  conflicts,
  guides,
  guideCategories,
  guideReferences,
  projects,
  projectSections,
  projectLinks,
  folders,
  notes,
  notebooks,
  importJobs,
  // Missing content types - Import tables
  plants,
  descriptions,
  ethnicities,
  drinks,
  armor,
  accessories,
  clothing,
  materials,
  settlements,
  societies,
  factions,
  militaryUnits,
  myths,
  legends,
  events,
  spells,
  resources,
  buildings,
  animals,
  transportation,
  naturalLaws,
  traditions,
  rituals,
  familyTrees,
  familyTreeMembers,
  familyTreeRelationships,
  timelines,
  timelineEvents,
  timelineRelationships,
  ceremonies,
  maps,
  music,
  dances,
  laws,
  policies,
  potions,
  type PinnedContent,
  type InsertPinnedContent,
  pinnedContent,
  type Canvas,
  type InsertCanvas,
  canvases,
  chatMessages,
  conversationThreads,
  userPreferences,
  conversationSummaries,
  feedback,
  shares,
} from "@shared/schema";
import { db } from "./db";
import {
  eq,
  desc,
  and,
  or,
  ilike,
  isNull,
  isNotNull,
  inArray,
  sql,
} from "drizzle-orm";

// Export storage types for improved type safety and error handling
export {
  AppError,
  type AppErrorCode,
  type StorageOptions,
  type Cursor,
  type PaginationParams,
  type PaginatedResult,
  createCursor,
  decodeCursor,
  type UpdateResult,
  type DeleteResult,
  type CreateResult,
  type SearchResult,
  type Json,
  validateShape,
  parseSavedItemData,
} from "./storage-types";

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
  getUser(
    id: string,
    opts?: import("./storage-types").StorageOptions,
  ): Promise<User | undefined>;
  getUserByUsername(
    username: string,
    opts?: import("./storage-types").StorageOptions,
  ): Promise<User | undefined>;
  createUser(
    insertUser: InsertUser,
    opts?: import("./storage-types").StorageOptions,
  ): Promise<import("./storage-types").CreateResult<User>>;
  upsertUser(
    user: UpsertUser,
    opts?: import("./storage-types").StorageOptions,
  ): Promise<User>;
  updateUser(
    id: string,
    updates: Partial<InsertUser>,
    opts?: import("./storage-types").StorageOptions,
  ): Promise<import("./storage-types").UpdateResult<User>>;
  searchUsers(
    query: string,
    pagination?: import("./storage-types").PaginationParams,
    opts?: import("./storage-types").StorageOptions,
  ): Promise<import("./storage-types").PaginatedResult<User>>;

  // Notebook methods
  createNotebook(notebook: InsertNotebook): Promise<Notebook>;
  getNotebook(id: string, userId: string): Promise<Notebook | undefined>;
  getUserNotebooks(userId: string): Promise<Notebook[]>;
  updateNotebook(
    id: string,
    userId: string,
    updates: UpdateNotebook,
  ): Promise<Notebook | undefined>;
  deleteNotebook(id: string, userId: string): Promise<void>;
  validateNotebookOwnership(
    notebookId: string,
    userId: string,
  ): Promise<boolean>;

  // Import Job methods
  createImportJob(job: InsertImportJob): Promise<ImportJob>;
  getImportJob(id: string, userId: string): Promise<ImportJob | undefined>;
  getUserImportJobs(userId: string): Promise<ImportJob[]>;
  updateImportJob(
    id: string,
    updates: UpdateImportJob,
  ): Promise<ImportJob | undefined>;

  // Generic content ownership validation
  validateContentOwnership<
    T extends { userId?: string | null; notebookId?: string | null },
  >(
    content: T | undefined,
    userId: string,
  ): boolean;

  // Character methods
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Character | undefined>;
  getUserCharacters(userId: string, notebookId: string): Promise<Character[]>;
  updateCharacter(
    id: string,
    userId: string,
    updates: UpdateCharacter,
    notebookId: string,
  ): Promise<Character>;
  deleteCharacter(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<void>;
  getCharactersWithIssues(
    userId: string,
    notebookId: string,
  ): Promise<{
    missingFamilyName: Character[];
    missingDescription: Character[];
    missingImage: Character[];
  }>;
  getPotentialDuplicates(
    userId: string,
    notebookId: string,
  ): Promise<Character[][]>;

  // Plot methods
  createPlot(plot: InsertPlot): Promise<Plot>;
  getPlot(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Plot | undefined>;
  getUserPlots(userId: string, notebookId: string): Promise<Plot[]>;

  // Prompt methods
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPrompt(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Prompt | undefined>;
  getUserPrompts(userId: string, notebookId: string): Promise<Prompt[]>;
  getRandomPrompts(count?: number): Promise<Prompt[]>;

  // Location methods
  createLocation(location: InsertLocation): Promise<Location>;
  getLocation(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Location | undefined>;
  getUserLocations(userId: string, notebookId: string): Promise<Location[]>;
  updateLocation(
    id: string,
    userId: string,
    updates: Partial<InsertLocation>,
    notebookId: string,
  ): Promise<Location>;
  deleteLocation(id: string, userId: string, notebookId: string): Promise<void>;

  // Setting methods
  createSetting(setting: InsertSetting): Promise<Setting>;
  getSetting(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Setting | undefined>;
  getUserSettings(userId: string, notebookId: string): Promise<Setting[]>;
  updateSetting(
    id: string,
    userId: string,
    updates: Partial<InsertSetting>,
  ): Promise<Setting>;

  // Item methods
  createItem(item: InsertItem): Promise<Item>;
  getItem(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Item | undefined>;
  getUserItems(userId: string, notebookId: string): Promise<Item[]>;
  updateItem(
    id: string,
    userId: string,
    updates: Partial<InsertItem>,
    notebookId: string,
  ): Promise<Item>;
  deleteItem(id: string, userId: string, notebookId: string): Promise<void>;

  // Organization methods
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganization(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Organization | undefined>;
  getUserOrganizations(
    userId: string,
    notebookId: string,
  ): Promise<Organization[]>;
  updateOrganization(
    id: string,
    userId: string,
    updates: Partial<InsertOrganization>,
    notebookId: string,
  ): Promise<Organization>;
  deleteOrganization(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<void>;

  // Creature methods
  createCreature(creature: InsertCreature): Promise<Creature>;
  getCreature(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Creature | undefined>;
  getUserCreatures(userId: string, notebookId: string): Promise<Creature[]>;
  updateCreature(
    id: string,
    userId: string,
    updates: Partial<InsertCreature>,
  ): Promise<Creature>;

  // Species methods
  createSpecies(species: InsertSpecies): Promise<Species>;
  getSpecies(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Species | undefined>;
  getUserSpecies(userId: string, notebookId: string): Promise<Species[]>;
  findSpeciesByName(
    name: string,
    notebookId: string,
  ): Promise<Species | undefined>;
  updateSpecies(
    id: string,
    userId: string,
    updates: Partial<InsertSpecies>,
  ): Promise<Species>;
  deleteSpecies(id: string, userId: string): Promise<void>;

  // Culture methods
  createCulture(culture: InsertCulture): Promise<Culture>;
  getCulture(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Culture | undefined>;
  getUserCultures(userId: string, notebookId: string): Promise<Culture[]>;
  updateCulture(
    id: string,
    userId: string,
    updates: Partial<InsertCulture>,
    notebookId: string,
  ): Promise<Culture>;
  deleteCulture(id: string, userId: string, notebookId: string): Promise<void>;

  // Magic system methods
  createMagic(): Promise<any>;
  getMagic(id: string): Promise<any | undefined>;
  getUserMagic(userId: string, notebookId: string): Promise<any[]>;
  updateMagic(id: string, userId: string, updates: any): Promise<any>;

  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Document | undefined>;
  getUserDocuments(userId: string, notebookId: string): Promise<Document[]>;
  updateDocument(
    id: string,
    userId: string,
    updates: Partial<InsertDocument>,
  ): Promise<Document>;
  deleteDocument(id: string, userId: string): Promise<void>;

  // Food methods
  createFood(food: InsertFood): Promise<Food>;
  getFood(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Food | undefined>;
  getUserFoods(userId: string, notebookId: string): Promise<Food[]>;
  updateFood(
    id: string,
    userId: string,
    updates: Partial<InsertFood>,
  ): Promise<Food>;
  deleteFood(id: string, userId: string): Promise<void>;

  // Language methods
  createLanguage(language: InsertLanguage): Promise<Language>;
  getLanguage(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Language | undefined>;
  getUserLanguages(userId: string, notebookId: string): Promise<Language[]>;
  updateLanguage(
    id: string,
    userId: string,
    updates: Partial<InsertLanguage>,
  ): Promise<Language>;
  deleteLanguage(id: string, userId: string): Promise<void>;

  // Religion methods
  createReligion(religion: InsertReligion): Promise<Religion>;
  getReligion(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Religion | undefined>;
  getUserReligions(userId: string, notebookId: string): Promise<Religion[]>;
  updateReligion(
    id: string,
    userId: string,
    updates: Partial<InsertReligion>,
  ): Promise<Religion>;
  deleteReligion(id: string, userId: string): Promise<void>;

  // Technology methods
  createTechnology(technology: InsertTechnology): Promise<Technology>;
  getTechnology(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Technology | undefined>;
  getUserTechnologies(
    userId: string,
    notebookId: string,
  ): Promise<Technology[]>;
  updateTechnology(
    id: string,
    userId: string,
    updates: Partial<InsertTechnology>,
  ): Promise<Technology>;
  deleteTechnology(id: string, userId: string): Promise<void>;

  // Weapon methods
  createWeapon(weapon: InsertWeapon): Promise<Weapon>;
  getWeapon(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Weapon | undefined>;
  getUserWeapons(userId: string, notebookId: string): Promise<Weapon[]>;
  updateWeapon(
    id: string,
    userId: string,
    notebookId: string,
    updates: Partial<InsertWeapon>,
  ): Promise<Weapon>;
  deleteWeapon(id: string, userId: string, notebookId: string): Promise<void>;

  // Profession methods
  createProfession(profession: InsertProfession): Promise<Profession>;
  getProfession(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Profession | undefined>;
  getUserProfessions(userId: string, notebookId: string): Promise<Profession[]>;
  updateProfession(
    id: string,
    userId: string,
    updates: Partial<InsertProfession>,
  ): Promise<Profession>;
  deleteProfession(id: string, userId: string): Promise<void>;

  // Rank methods
  createRank(rank: InsertRank): Promise<Rank>;
  getRank(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Rank | undefined>;
  getUserRanks(userId: string, notebookId: string): Promise<Rank[]>;
  updateRank(
    id: string,
    userId: string,
    updates: Partial<InsertRank>,
  ): Promise<Rank>;
  deleteRank(id: string, userId: string): Promise<void>;

  // Condition methods
  createCondition(condition: InsertCondition): Promise<Condition>;
  getCondition(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Condition | undefined>;
  getUserConditions(userId: string, notebookId: string): Promise<Condition[]>;
  updateCondition(
    id: string,
    userId: string,
    updates: Partial<InsertCondition>,
  ): Promise<Condition>;
  deleteCondition(id: string, userId: string): Promise<void>;

  // Plant methods
  createPlant(plant: InsertPlant): Promise<Plant>;
  getPlant(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Plant | undefined>;
  getUserPlants(userId: string, notebookId: string): Promise<Plant[]>;
  updatePlant(
    id: string,
    userId: string,
    updates: Partial<InsertPlant>,
    notebookId: string,
  ): Promise<Plant>;
  deletePlant(id: string, userId: string, notebookId: string): Promise<void>;

  // Description methods
  createDescription(description: InsertDescription): Promise<Description>;
  getDescription(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Description | undefined>;
  getUserDescriptions(
    userId: string,
    notebookId: string,
  ): Promise<Description[]>;
  updateDescription(
    id: string,
    userId: string,
    updates: Partial<InsertDescription>,
  ): Promise<Description>;
  deleteDescription(id: string, userId: string): Promise<void>;

  // Ethnicity methods
  createEthnicity(ethnicity: InsertEthnicity): Promise<Ethnicity>;
  getEthnicity(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Ethnicity | undefined>;
  getUserEthnicities(userId: string, notebookId: string): Promise<Ethnicity[]>;
  updateEthnicity(
    id: string,
    userId: string,
    updates: Partial<InsertEthnicity>,
  ): Promise<Ethnicity>;
  deleteEthnicity(id: string, userId: string): Promise<void>;

  // Drink methods
  createDrink(drink: InsertDrink): Promise<Drink>;
  getDrink(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Drink | undefined>;
  getUserDrinks(userId: string, notebookId: string): Promise<Drink[]>;
  updateDrink(
    id: string,
    userId: string,
    updates: Partial<InsertDrink>,
  ): Promise<Drink>;
  deleteDrink(id: string, userId: string): Promise<void>;

  // Armor methods
  createArmor(armor: InsertArmor): Promise<Armor>;
  getArmor(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Armor | undefined>;
  getUserArmor(userId: string, notebookId: string): Promise<Armor[]>;
  updateArmor(
    id: string,
    userId: string,
    updates: Partial<InsertArmor>,
  ): Promise<Armor>;
  deleteArmor(id: string, userId: string): Promise<void>;

  // Accessory methods
  createAccessory(accessory: InsertAccessory): Promise<Accessory>;
  getAccessory(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Accessory | undefined>;
  getUserAccessories(userId: string, notebookId: string): Promise<Accessory[]>;
  updateAccessory(
    id: string,
    userId: string,
    updates: Partial<InsertAccessory>,
  ): Promise<Accessory>;
  deleteAccessory(id: string, userId: string): Promise<void>;

  // Clothing methods
  createClothing(clothing: InsertClothing): Promise<Clothing>;
  getClothing(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Clothing | undefined>;
  getUserClothing(userId: string, notebookId: string): Promise<Clothing[]>;
  updateClothing(
    id: string,
    userId: string,
    updates: Partial<InsertClothing>,
  ): Promise<Clothing>;
  deleteClothing(id: string, userId: string): Promise<void>;

  // Material methods
  createMaterial(material: InsertMaterial): Promise<Material>;
  getMaterial(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Material | undefined>;
  getUserMaterials(userId: string, notebookId: string): Promise<Material[]>;
  updateMaterial(
    id: string,
    userId: string,
    updates: Partial<InsertMaterial>,
  ): Promise<Material>;
  deleteMaterial(id: string, userId: string): Promise<void>;

  // Settlement methods
  createSettlement(settlement: InsertSettlement): Promise<Settlement>;
  getSettlement(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Settlement | undefined>;
  getUserSettlements(userId: string, notebookId: string): Promise<Settlement[]>;
  updateSettlement(
    id: string,
    userId: string,
    updates: Partial<InsertSettlement>,
  ): Promise<Settlement>;
  deleteSettlement(id: string, userId: string): Promise<void>;

  // Society methods
  createSociety(society: InsertSociety): Promise<Society>;
  getSociety(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Society | undefined>;
  getUserSocieties(userId: string, notebookId: string): Promise<Society[]>;
  updateSociety(
    id: string,
    userId: string,
    updates: Partial<InsertSociety>,
  ): Promise<Society>;
  deleteSociety(id: string, userId: string): Promise<void>;

  // Faction methods
  createFaction(faction: InsertFaction): Promise<Faction>;
  getFaction(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Faction | undefined>;
  getUserFaction(userId: string, notebookId: string): Promise<Faction[]>;
  updateFaction(
    id: string,
    userId: string,
    updates: Partial<InsertFaction>,
    notebookId: string,
  ): Promise<Faction>;
  deleteFaction(id: string, userId: string, notebookId: string): Promise<void>;

  // Military Unit methods
  createMilitaryUnit(militaryUnit: InsertMilitaryUnit): Promise<MilitaryUnit>;
  getMilitaryUnit(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<MilitaryUnit | undefined>;
  getUserMilitaryUnits(
    userId: string,
    notebookId: string,
  ): Promise<MilitaryUnit[]>;
  updateMilitaryUnit(
    id: string,
    userId: string,
    updates: Partial<InsertMilitaryUnit>,
  ): Promise<MilitaryUnit>;
  deleteMilitaryUnit(id: string, userId: string): Promise<void>;

  // Myth methods
  createMyth(myth: InsertMyth): Promise<Myth>;
  getMyth(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Myth | undefined>;
  getUserMyths(userId: string, notebookId: string): Promise<Myth[]>;
  updateMyth(
    id: string,
    userId: string,
    updates: Partial<InsertMyth>,
  ): Promise<Myth>;
  deleteMyth(id: string, userId: string): Promise<void>;

  // Legend methods
  createLegend(legend: InsertLegend): Promise<Legend>;
  getLegend(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Legend | undefined>;
  getUserLegends(userId: string, notebookId: string): Promise<Legend[]>;
  updateLegend(
    id: string,
    userId: string,
    updates: Partial<InsertLegend>,
  ): Promise<Legend>;
  deleteLegend(id: string, userId: string): Promise<void>;

  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Event | undefined>;
  getUserEvents(userId: string, notebookId: string): Promise<Event[]>;
  updateEvent(
    id: string,
    userId: string,
    updates: Partial<InsertEvent>,
  ): Promise<Event>;
  deleteEvent(id: string, userId: string): Promise<void>;

  // Spell methods
  createSpell(spell: InsertSpell): Promise<Spell>;
  getSpell(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Spell | undefined>;
  getUserSpells(userId: string, notebookId: string): Promise<Spell[]>;
  updateSpell(
    id: string,
    userId: string,
    updates: Partial<InsertSpell>,
  ): Promise<Spell>;
  deleteSpell(id: string, userId: string): Promise<void>;

  // Resource methods
  createResource(resource: InsertResource): Promise<Resource>;
  getResource(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Resource | undefined>;
  getUserResources(userId: string, notebookId: string): Promise<Resource[]>;
  updateResource(
    id: string,
    userId: string,
    updates: Partial<InsertResource>,
  ): Promise<Resource>;
  deleteResource(id: string, userId: string): Promise<void>;

  // Building methods
  createBuilding(building: InsertBuilding): Promise<Building>;
  getBuilding(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Building | undefined>;
  getUserBuildings(userId: string, notebookId: string): Promise<Building[]>;
  updateBuilding(
    id: string,
    userId: string,
    updates: Partial<InsertBuilding>,
  ): Promise<Building>;
  deleteBuilding(id: string, userId: string): Promise<void>;

  // Animal methods
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  getAnimal(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Animal | undefined>;
  getUserAnimals(userId: string, notebookId: string): Promise<Animal[]>;
  updateAnimal(
    id: string,
    userId: string,
    updates: Partial<InsertAnimal>,
  ): Promise<Animal>;
  deleteAnimal(id: string, userId: string): Promise<void>;

  // Transportation methods
  createTransportation(
    transportation: InsertTransportation,
  ): Promise<Transportation>;
  getTransportation(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Transportation | undefined>;
  getUserTransportation(
    userId: string,
    notebookId: string,
  ): Promise<Transportation[]>;
  updateTransportation(
    id: string,
    userId: string,
    updates: Partial<InsertTransportation>,
  ): Promise<Transportation>;
  deleteTransportation(id: string, userId: string): Promise<void>;

  // Natural Law methods
  createNaturalLaw(naturalLaw: InsertNaturalLaw): Promise<NaturalLaw>;
  getNaturalLaw(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<NaturalLaw | undefined>;
  getUserNaturalLaws(userId: string, notebookId: string): Promise<NaturalLaw[]>;
  updateNaturalLaw(
    id: string,
    userId: string,
    updates: Partial<InsertNaturalLaw>,
  ): Promise<NaturalLaw>;
  deleteNaturalLaw(id: string, userId: string): Promise<void>;

  // Tradition methods
  createTradition(tradition: InsertTradition): Promise<Tradition>;
  getTradition(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Tradition | undefined>;
  getUserTraditions(userId: string, notebookId: string): Promise<Tradition[]>;
  updateTradition(
    id: string,
    userId: string,
    updates: Partial<InsertTradition>,
  ): Promise<Tradition>;
  deleteTradition(id: string, userId: string): Promise<void>;

  // Ritual methods
  createRitual(ritual: InsertRitual): Promise<Ritual>;
  getRitual(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Ritual | undefined>;
  getUserRituals(userId: string, notebookId: string): Promise<Ritual[]>;
  updateRitual(
    id: string,
    userId: string,
    updates: Partial<InsertRitual>,
  ): Promise<Ritual>;
  deleteRitual(id: string, userId: string): Promise<void>;

  // Family Tree methods
  createFamilyTree(familyTree: InsertFamilyTree): Promise<FamilyTree>;
  getFamilyTree(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<FamilyTree | undefined>;
  getUserFamilyTrees(userId: string, notebookId: string): Promise<FamilyTree[]>;
  updateFamilyTree(
    id: string,
    userId: string,
    updates: Partial<InsertFamilyTree>,
  ): Promise<FamilyTree>;
  deleteFamilyTree(id: string, userId: string): Promise<void>;

  // Family Tree Member methods
  createFamilyTreeMember(
    member: InsertFamilyTreeMember,
  ): Promise<FamilyTreeMember>;
  getFamilyTreeMembers(
    treeId: string,
    userId: string,
  ): Promise<FamilyTreeMember[]>;
  updateFamilyTreeMember(
    id: string,
    userId: string,
    updates: Partial<InsertFamilyTreeMember>,
  ): Promise<FamilyTreeMember>;
  deleteFamilyTreeMember(
    id: string,
    userId: string,
    treeId: string,
  ): Promise<void>;

  // Family Tree Relationship methods
  createFamilyTreeRelationship(
    relationship: InsertFamilyTreeRelationship,
  ): Promise<FamilyTreeRelationship>;
  getFamilyTreeRelationships(
    treeId: string,
    userId: string,
  ): Promise<FamilyTreeRelationship[]>;
  updateFamilyTreeRelationship(
    id: string,
    userId: string,
    updates: Partial<InsertFamilyTreeRelationship>,
  ): Promise<FamilyTreeRelationship>;
  deleteFamilyTreeRelationship(
    id: string,
    userId: string,
    treeId: string,
  ): Promise<void>;

  // Timeline methods
  createTimeline(timeline: InsertTimeline): Promise<Timeline>;
  getTimeline(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Timeline | undefined>;
  getUserTimelines(userId: string, notebookId: string): Promise<Timeline[]>;
  updateTimeline(
    id: string,
    userId: string,
    updates: Partial<InsertTimeline>,
  ): Promise<Timeline>;
  deleteTimeline(id: string, userId: string): Promise<void>;

  // Timeline Event methods
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  getTimelineEvent(
    id: string,
    userId: string,
    timelineId: string,
  ): Promise<TimelineEvent | undefined>;
  getTimelineEvents(
    timelineId: string,
    userId: string,
  ): Promise<TimelineEvent[]>;
  getTimelineEventsForNotebook(
    notebookId: string,
    userId: string,
  ): Promise<TimelineEvent[]>;
  updateTimelineEvent(
    id: string,
    userId: string,
    updates: Partial<InsertTimelineEvent>,
  ): Promise<TimelineEvent>;
  deleteTimelineEvent(
    id: string,
    userId: string,
    timelineId: string,
  ): Promise<void>;

  // Timeline Relationship methods
  createTimelineRelationship(
    relationship: InsertTimelineRelationship,
  ): Promise<TimelineRelationship>;
  getTimelineRelationships(
    timelineId: string,
    userId: string,
  ): Promise<TimelineRelationship[]>;
  updateTimelineRelationship(
    id: string,
    userId: string,
    updates: Partial<InsertTimelineRelationship>,
  ): Promise<TimelineRelationship>;
  deleteTimelineRelationship(
    id: string,
    userId: string,
    timelineId: string,
  ): Promise<void>;

  // Ceremony methods
  createCeremony(ceremony: InsertCeremony): Promise<Ceremony>;
  getCeremony(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Ceremony | undefined>;
  getUserCeremonies(userId: string, notebookId: string): Promise<Ceremony[]>;
  updateCeremony(
    id: string,
    userId: string,
    updates: Partial<InsertCeremony>,
  ): Promise<Ceremony>;
  deleteCeremony(id: string, userId: string): Promise<void>;

  // Map methods
  createMap(map: InsertMap): Promise<Map>;
  getMap(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Map | undefined>;
  getUserMaps(userId: string, notebookId: string): Promise<Map[]>;
  updateMap(
    id: string,
    userId: string,
    updates: Partial<InsertMap>,
  ): Promise<Map>;
  deleteMap(id: string, userId: string): Promise<void>;

  // Music methods
  createMusic(music: InsertMusic): Promise<Music>;
  getMusic(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Music | undefined>;
  getUserMusic(userId: string, notebookId: string): Promise<Music[]>;
  updateMusic(
    id: string,
    userId: string,
    updates: Partial<InsertMusic>,
  ): Promise<Music>;
  deleteMusic(id: string, userId: string): Promise<void>;

  // Dance methods
  createDance(dance: InsertDance): Promise<Dance>;
  getDance(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Dance | undefined>;
  getUserDances(userId: string, notebookId: string): Promise<Dance[]>;
  updateDance(
    id: string,
    userId: string,
    updates: Partial<InsertDance>,
  ): Promise<Dance>;
  deleteDance(id: string, userId: string): Promise<void>;

  // Law methods
  createLaw(law: InsertLaw): Promise<Law>;
  getLaw(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Law | undefined>;
  getUserLaws(userId: string, notebookId: string): Promise<Law[]>;
  updateLaw(
    id: string,
    userId: string,
    updates: Partial<InsertLaw>,
  ): Promise<Law>;
  deleteLaw(id: string, userId: string): Promise<void>;

  // Policy methods
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  getPolicy(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Policy | undefined>;
  getUserPolicies(userId: string, notebookId: string): Promise<Policy[]>;
  updatePolicy(
    id: string,
    userId: string,
    updates: Partial<InsertPolicy>,
  ): Promise<Policy>;
  deletePolicy(id: string, userId: string): Promise<void>;

  // Potion methods
  createPotion(potion: InsertPotion): Promise<Potion>;
  getPotion(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Potion | undefined>;
  getUserPotions(userId: string, notebookId: string): Promise<Potion[]>;
  updatePotion(
    id: string,
    userId: string,
    updates: Partial<InsertPotion>,
  ): Promise<Potion>;
  deletePotion(id: string, userId: string): Promise<void>;

  // Name generator methods
  createName(name: InsertName): Promise<GeneratedName>;
  getName(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<GeneratedName | undefined>;
  getUserNames(userId: string, notebookId: string): Promise<GeneratedName[]>;

  // Theme methods
  createTheme(theme: InsertTheme): Promise<Theme>;
  getTheme(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Theme | undefined>;
  getUserThemes(userId: string, notebookId: string): Promise<Theme[]>;
  updateTheme(
    id: string,
    userId: string,
    updates: Partial<InsertTheme>,
  ): Promise<Theme>;

  // Mood methods
  createMood(mood: InsertMood): Promise<Mood>;
  getMood(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Mood | undefined>;
  getUserMoods(userId: string, notebookId: string): Promise<Mood[]>;

  // Conflict methods
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  getConflict(
    id: string,
    userId: string,
    notebookId: string,
  ): Promise<Conflict | undefined>;
  getUserConflicts(userId: string, notebookId: string): Promise<Conflict[]>;
  updateConflict(
    id: string,
    userId: string,
    updates: Partial<InsertConflict>,
  ): Promise<Conflict>;

  // Guide methods
  createGuide(guide: InsertGuide): Promise<Guide>;
  getGuide(id: string): Promise<Guide | undefined>;
  getGuides(category?: string): Promise<Guide[]>;
  searchGuides(query: string, category?: string): Promise<Guide[]>;
  updateGuide(
    id: string,
    updates: Partial<InsertGuide>,
  ): Promise<Guide | undefined>;
  deleteGuide(id: string): Promise<boolean>;

  // Guide category methods
  createGuideCategory(category: InsertGuideCategory): Promise<GuideCategory>;
  getGuideCategories(): Promise<any[]>; // Returns hierarchical structure with children
  updateGuideCategory(
    id: string,
    updates: Partial<InsertGuideCategory>,
  ): Promise<GuideCategory | undefined>;
  deleteGuideCategory(id: string): Promise<boolean>;
  reorderGuideCategories(
    categoryOrders: Array<{ id: string; order: number }>,
  ): Promise<void>;

  // Guide reference methods
  createGuideReference(
    reference: InsertGuideReference,
  ): Promise<GuideReference>;
  getGuideReferences(sourceGuideId: string): Promise<GuideReference[]>;
  getGuideReferencedBy(targetGuideId: string): Promise<GuideReference[]>;
  deleteGuideReferences(sourceGuideId: string): Promise<void>;
  syncGuideReferences(
    sourceGuideId: string,
    targetGuideIds: string[],
  ): Promise<void>;

  // Saved item methods
  saveItem(savedItem: InsertSavedItem): Promise<SavedItem>;
  unsaveItem(userId: string, itemType: string, itemId: string): Promise<void>;
  unsaveItemFromNotebook(
    userId: string,
    itemType: string,
    itemId: string,
    notebookId: string,
  ): Promise<void>;
  getUserSavedItems(userId: string, itemType?: string): Promise<SavedItem[]>;
  getUserSavedItemsByNotebook(
    userId: string,
    notebookId: string,
    itemType?: string,
  ): Promise<SavedItem[]>;
  getSavedItemsByNotebookBatch(
    userId: string,
    notebookId: string,
  ): Promise<SavedItem[]>;
  isItemSaved(
    userId: string,
    itemType: string,
    itemId: string,
  ): Promise<boolean>;
  updateSavedItemData(
    savedItemId: string,
    userId: string,
    itemData: any,
  ): Promise<SavedItem | undefined>;
  updateSavedItemDataByItem(
    userId: string,
    itemType: string,
    itemId: string,
    notebookId: string,
    itemData: any,
  ): Promise<SavedItem | undefined>;
  updateSavedItemType(
    savedItemId: string,
    userId: string,
    newItemType: string,
  ): Promise<SavedItem | undefined>;

  // Project methods
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string, userId: string): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  updateProject(
    id: string,
    userId: string,
    updates: Partial<InsertProject>,
  ): Promise<Project>;
  deleteProject(id: string, userId: string): Promise<void>;
  searchProjects(userId: string, query: string): Promise<Project[]>;

  // Project Section methods
  createProjectSection(section: InsertProjectSection): Promise<ProjectSection>;
  getProjectSection(
    id: string,
    projectId: string,
  ): Promise<ProjectSection | undefined>;
  getProjectSections(projectId: string): Promise<ProjectSection[]>;
  updateProjectSection(
    id: string,
    projectId: string,
    updates: Partial<InsertProjectSection>,
  ): Promise<ProjectSection>;
  deleteProjectSection(id: string, projectId: string): Promise<void>;
  reorderProjectSections(
    projectId: string,
    sectionOrders: { id: string; position: number; parentId?: string | null }[],
  ): Promise<void>;

  // Universal search method
  searchAllContent(userId: string, query: string): Promise<any[]>;

  // Project links methods
  createProjectLink(link: InsertProjectLink): Promise<ProjectLink>;
  getProjectLinks(projectId: string, userId: string): Promise<ProjectLink[]>;
  getProjectLinksForUser(userId: string): Promise<ProjectLink[]>;
  deleteProjectLink(id: string, userId: string): Promise<void>;
  // findLinksToContent method commented out due to manuscript link dependencies

  // Pinned content methods
  pinContent(pin: InsertPinnedContent): Promise<PinnedContent>;
  unpinContent(
    userId: string,
    itemType: string,
    itemId: string,
    notebookId: string,
  ): Promise<void>;
  getUserPinnedContent(
    userId: string,
    notebookId: string,
    category?: string,
  ): Promise<PinnedContent[]>;
  reorderPinnedContent(
    userId: string,
    itemId: string,
    newOrder: number,
    notebookId: string,
  ): Promise<void>;
  isContentPinned(
    userId: string,
    itemType: string,
    itemId: string,
    notebookId: string,
  ): Promise<boolean>;

  // Canvas methods
  createCanvas(canvas: InsertCanvas): Promise<Canvas>;
  getCanvas(id: string, userId: string): Promise<Canvas | undefined>;
  getUserCanvases(userId: string): Promise<Canvas[]>;
  getProjectCanvases(projectId: string, userId: string): Promise<Canvas[]>;
  updateCanvas(
    id: string,
    userId: string,
    updates: Partial<InsertCanvas>,
  ): Promise<Canvas>;
  deleteCanvas(id: string, userId: string): Promise<void>;

  // Folder methods
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFolder(id: string, userId: string): Promise<Folder | undefined>;
  getUserFolders(userId: string, type?: string): Promise<Folder[]>;
  getDocumentFolders(documentId: string, userId: string): Promise<Folder[]>;
  updateFolder(
    id: string,
    userId: string,
    updates: Partial<InsertFolder>,
  ): Promise<Folder>;
  deleteFolder(id: string, userId: string): Promise<void>;
  getFolderHierarchy(userId: string, type: string): Promise<Folder[]>;

  // Note methods
  createNote(note: InsertNote): Promise<Note>;
  getNote(id: string, userId: string): Promise<Note | undefined>;
  getUserNotes(userId: string, type?: string): Promise<Note[]>;
  getFolderNotes(folderId: string, userId: string): Promise<Note[]>;
  getDocumentNotes(documentId: string, userId: string): Promise<Note[]>;
  updateNote(
    id: string,
    userId: string,
    updates: Partial<InsertNote>,
  ): Promise<Note>;
  deleteNote(id: string, userId: string): Promise<void>;

  // Quick note methods
  createQuickNote(
    userId: string,
    title: string,
    content: string,
  ): Promise<Note>;
  getUserQuickNote(userId: string): Promise<Note | undefined>;
  getQuickNoteById(id: string, userId: string): Promise<Note | undefined>;
  updateQuickNote(
    id: string,
    userId: string,
    updates: { title?: string; content?: string },
  ): Promise<Note>;
  deleteQuickNote(id: string, userId: string): Promise<void>;

  // Conversation thread methods
  createConversationThread(
    thread: InsertConversationThread,
  ): Promise<ConversationThread>;
  getConversationThread(
    id: string,
    userId: string,
  ): Promise<ConversationThread | undefined>;
  getConversationThreads(filters: {
    userId: string;
    projectId?: string;
    guideId?: string;
    isActive?: boolean;
  }): Promise<ConversationThread[]>;
  searchConversationThreads(
    userId: string,
    query: string,
    filters?: { projectId?: string; guideId?: string },
  ): Promise<ConversationThread[]>;
  updateConversationThread(
    id: string,
    userId: string,
    updates: Partial<InsertConversationThread>,
  ): Promise<ConversationThread | undefined>;
  updateThreadActivity(threadId: string, userId: string): Promise<void>;
  deleteConversationThread(id: string, userId: string): Promise<void>;

  // Chat message methods
  createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(
    userId: string,
    projectId?: string,
    guideId?: string,
    limit?: number,
  ): Promise<ChatMessage[]>;
  getChatMessagesByThread(
    threadId: string,
    userId: string,
    limit?: number,
  ): Promise<ChatMessage[]>;
  deleteChatHistory(
    userId: string,
    projectId?: string,
    guideId?: string,
  ): Promise<void>;

  // User preferences methods
  getUserPreferences(
    userId: string,
    opts?: import("./storage-types").StorageOptions,
  ): Promise<UserPreferences | undefined>;
  upsertUserPreferences(
    userId: string,
    preferences: Partial<InsertUserPreferences>,
    opts?: import("./storage-types").StorageOptions,
  ): Promise<UserPreferences>;

  // Conversation summary methods
  getConversationSummary(
    userId: string,
    projectId?: string,
    guideId?: string,
  ): Promise<ConversationSummary | undefined>;
  upsertConversationSummary(
    summary: InsertConversationSummary,
  ): Promise<ConversationSummary>;
  updateConversationSummary(
    id: string,
    userId: string,
    updates: Partial<InsertConversationSummary>,
  ): Promise<ConversationSummary | undefined>;

  // Feedback methods
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
  getFeedback(id: string): Promise<Feedback | undefined>;
  updateFeedbackStatus(
    id: string,
    status: string,
  ): Promise<Feedback | undefined>;
}

// Export the storage facade that delegates to modular repositories
export { storageFacade as storage } from "./repositories/storage.facade";
