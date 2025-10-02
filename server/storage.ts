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
  type Project, type InsertProject,
  type ProjectSection, type InsertProjectSection,
  type ProjectLink, type InsertProjectLink,
  type Folder, type InsertFolder,
  type Note, type InsertNote,
  // Missing content types - Import types
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
  type Timeline, type InsertTimeline,
  type Ceremony, type InsertCeremony,
  type Map, type InsertMap,
  type Music, type InsertMusic,
  type Dance, type InsertDance,
  type Law, type InsertLaw,
  type Policy, type InsertPolicy,
  type Potion, type InsertPotion,
  type ChatMessage, type InsertChatMessage,
  type Notebook, type InsertNotebook, type UpdateNotebook,
  users, characters, 
  plots, prompts, locations, settings, items, organizations,
  creatures, species, cultures, documents, foods,
  languages, religions, technologies, weapons, professions,
  savedItems, names, themes, moods, conflicts, guides, projects, projectSections, projectLinks,
  folders, notes, notebooks,
  // Missing content types - Import tables
  plants, descriptions, ethnicities, drinks, armor, accessories, clothing, materials,
  settlements, societies, factions, militaryUnits, myths, legends, events, spells,
  resources, buildings, animals, transportation, naturalLaws, traditions, rituals,
  familyTrees, timelines, ceremonies, maps, music, dances, laws, policies, potions,
  type PinnedContent, type InsertPinnedContent, pinnedContent,
  chatMessages
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, isNull, isNotNull, inArray, sql } from "drizzle-orm";

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
  
  // Notebook methods
  createNotebook(notebook: InsertNotebook): Promise<Notebook>;
  getNotebook(id: string, userId: string): Promise<Notebook | undefined>;
  getUserNotebooks(userId: string): Promise<Notebook[]>;
  updateNotebook(id: string, userId: string, updates: UpdateNotebook): Promise<Notebook | undefined>;
  deleteNotebook(id: string, userId: string): Promise<void>;
  
  // Character methods
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(id: string, userId: string, notebookId: string): Promise<Character | undefined>;
  getUserCharacters(userId: string, notebookId: string): Promise<Character[]>;
  updateCharacter(id: string, userId: string, updates: UpdateCharacter, notebookId: string): Promise<Character>;
  
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
  getLocation(id: string, userId: string, notebookId: string): Promise<Location | undefined>;
  getUserLocations(userId: string, notebookId: string): Promise<Location[]>;
  updateLocation(id: string, userId: string, updates: Partial<InsertLocation>, notebookId: string): Promise<Location>;
  deleteLocation(id: string, userId: string, notebookId: string): Promise<void>;

  // Setting methods
  createSetting(setting: InsertSetting): Promise<Setting>;
  getSetting(id: string): Promise<Setting | undefined>;
  getUserSettings(userId: string | null): Promise<Setting[]>;
  updateSetting(id: string, updates: Partial<InsertSetting>): Promise<Setting>;

  // Item methods  
  createItem(item: InsertItem): Promise<Item>;
  getItem(id: string, userId: string, notebookId: string): Promise<Item | undefined>;
  getUserItems(userId: string, notebookId: string): Promise<Item[]>;
  updateItem(id: string, userId: string, updates: Partial<InsertItem>, notebookId: string): Promise<Item>;
  deleteItem(id: string, userId: string, notebookId: string): Promise<void>;

  // Organization methods
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganization(id: string, userId: string, notebookId: string): Promise<Organization | undefined>;
  getUserOrganizations(userId: string, notebookId: string): Promise<Organization[]>;
  updateOrganization(id: string, userId: string, updates: Partial<InsertOrganization>, notebookId: string): Promise<Organization>;
  deleteOrganization(id: string, userId: string, notebookId: string): Promise<void>;

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
  getCulture(id: string, userId: string, notebookId: string): Promise<Culture | undefined>;
  getUserCultures(userId: string, notebookId: string): Promise<Culture[]>;
  updateCulture(id: string, userId: string, updates: Partial<InsertCulture>, notebookId: string): Promise<Culture>;
  deleteCulture(id: string, userId: string, notebookId: string): Promise<void>;

  // Magic system methods
  createMagic(): Promise<any>;
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


  // Profession methods
  createProfession(profession: InsertProfession): Promise<Profession>;
  getProfession(id: string): Promise<Profession | undefined>;
  getUserProfessions(userId: string | null): Promise<Profession[]>;
  updateProfession(id: string, updates: Partial<InsertProfession>): Promise<Profession>;
  deleteProfession(id: string): Promise<void>;

  // Plant methods
  createPlant(plant: InsertPlant): Promise<Plant>;
  getPlant(id: string, userId: string, notebookId: string): Promise<Plant | undefined>;
  getUserPlants(userId: string, notebookId: string): Promise<Plant[]>;
  updatePlant(id: string, userId: string, updates: Partial<InsertPlant>, notebookId: string): Promise<Plant>;
  deletePlant(id: string, userId: string, notebookId: string): Promise<void>;

  // Description methods
  createDescription(description: InsertDescription): Promise<Description>;
  getDescription(id: string): Promise<Description | undefined>;
  getUserDescriptions(userId: string | null): Promise<Description[]>;
  updateDescription(id: string, updates: Partial<InsertDescription>): Promise<Description>;
  deleteDescription(id: string): Promise<void>;

  // Ethnicity methods
  createEthnicity(ethnicity: InsertEthnicity): Promise<Ethnicity>;
  getEthnicity(id: string): Promise<Ethnicity | undefined>;
  getUserEthnicities(userId: string | null): Promise<Ethnicity[]>;
  updateEthnicity(id: string, updates: Partial<InsertEthnicity>): Promise<Ethnicity>;
  deleteEthnicity(id: string): Promise<void>;

  // Drink methods
  createDrink(drink: InsertDrink): Promise<Drink>;
  getDrink(id: string): Promise<Drink | undefined>;
  getUserDrinks(userId: string | null): Promise<Drink[]>;
  updateDrink(id: string, updates: Partial<InsertDrink>): Promise<Drink>;
  deleteDrink(id: string): Promise<void>;

  // Armor methods
  createArmor(armor: InsertArmor): Promise<Armor>;
  getArmor(id: string): Promise<Armor | undefined>;
  getUserArmor(userId: string | null): Promise<Armor[]>;
  updateArmor(id: string, updates: Partial<InsertArmor>): Promise<Armor>;
  deleteArmor(id: string): Promise<void>;

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
  getFaction(id: string, userId: string, notebookId: string): Promise<Faction | undefined>;
  getUserFaction(userId: string, notebookId: string): Promise<Faction[]>;
  updateFaction(id: string, userId: string, updates: Partial<InsertFaction>, notebookId: string): Promise<Faction>;
  deleteFaction(id: string, userId: string, notebookId: string): Promise<void>;

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
  getUserTransportation(userId: string | null): Promise<Transportation[]>;
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

  // Family Tree methods
  createFamilyTree(familyTree: InsertFamilyTree): Promise<FamilyTree>;
  getFamilyTree(id: string): Promise<FamilyTree | undefined>;
  getUserFamilyTrees(userId: string | null): Promise<FamilyTree[]>;
  updateFamilyTree(id: string, updates: Partial<InsertFamilyTree>): Promise<FamilyTree>;
  deleteFamilyTree(id: string): Promise<void>;

  // Timeline methods
  createTimeline(timeline: InsertTimeline): Promise<Timeline>;
  getTimeline(id: string): Promise<Timeline | undefined>;
  getUserTimelines(userId: string | null): Promise<Timeline[]>;
  updateTimeline(id: string, updates: Partial<InsertTimeline>): Promise<Timeline>;
  deleteTimeline(id: string): Promise<void>;

  // Ceremony methods
  createCeremony(ceremony: InsertCeremony): Promise<Ceremony>;
  getCeremony(id: string): Promise<Ceremony | undefined>;
  getUserCeremonies(userId: string | null): Promise<Ceremony[]>;
  updateCeremony(id: string, updates: Partial<InsertCeremony>): Promise<Ceremony>;
  deleteCeremony(id: string): Promise<void>;

  // Map methods
  createMap(map: InsertMap): Promise<Map>;
  getMap(id: string): Promise<Map | undefined>;
  getUserMaps(userId: string | null): Promise<Map[]>;
  updateMap(id: string, updates: Partial<InsertMap>): Promise<Map>;
  deleteMap(id: string): Promise<void>;

  // Music methods
  createMusic(music: InsertMusic): Promise<Music>;
  getMusic(id: string): Promise<Music | undefined>;
  getUserMusic(userId: string | null): Promise<Music[]>;
  updateMusic(id: string, updates: Partial<InsertMusic>): Promise<Music>;
  deleteMusic(id: string): Promise<void>;

  // Dance methods
  createDance(dance: InsertDance): Promise<Dance>;
  getDance(id: string): Promise<Dance | undefined>;
  getUserDances(userId: string | null): Promise<Dance[]>;
  updateDance(id: string, updates: Partial<InsertDance>): Promise<Dance>;
  deleteDance(id: string): Promise<void>;

  // Law methods
  createLaw(law: InsertLaw): Promise<Law>;
  getLaw(id: string): Promise<Law | undefined>;
  getUserLaws(userId: string | null): Promise<Law[]>;
  updateLaw(id: string, updates: Partial<InsertLaw>): Promise<Law>;
  deleteLaw(id: string): Promise<void>;

  // Policy methods
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  getPolicy(id: string): Promise<Policy | undefined>;
  getUserPolicies(userId: string | null): Promise<Policy[]>;
  updatePolicy(id: string, updates: Partial<InsertPolicy>): Promise<Policy>;
  deletePolicy(id: string): Promise<void>;

  // Potion methods
  createPotion(potion: InsertPotion): Promise<Potion>;
  getPotion(id: string): Promise<Potion | undefined>;
  getUserPotions(userId: string | null): Promise<Potion[]>;
  updatePotion(id: string, updates: Partial<InsertPotion>): Promise<Potion>;
  deletePotion(id: string): Promise<void>;

  // Name generator methods
  createName(name: InsertName): Promise<GeneratedName>;
  getName(id: string): Promise<GeneratedName | undefined>;
  getUserNames(userId: string | null): Promise<GeneratedName[]>;

  // Theme methods
  createTheme(theme: InsertTheme): Promise<Theme>;
  getTheme(id: string): Promise<Theme | undefined>;
  getUserThemes(userId: string | null): Promise<Theme[]>;
  updateTheme(id: string, updates: Partial<InsertTheme>): Promise<Theme>;

  // Mood methods
  createMood(mood: InsertMood): Promise<Mood>;
  getMood(id: string): Promise<Mood | undefined>;
  getUserMoods(userId: string | null): Promise<Mood[]>;

  // Conflict methods
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  getConflict(id: string): Promise<Conflict | undefined>;
  getUserConflicts(userId: string | null): Promise<Conflict[]>;
  updateConflict(id: string, updates: Partial<InsertConflict>): Promise<Conflict>;

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
  unsaveItemFromNotebook(userId: string, itemType: string, itemId: string, notebookId: string): Promise<void>;
  getUserSavedItems(userId: string, itemType?: string): Promise<SavedItem[]>;
  getUserSavedItemsByNotebook(userId: string, notebookId: string, itemType?: string): Promise<SavedItem[]>;
  isItemSaved(userId: string, itemType: string, itemId: string): Promise<boolean>;
  updateSavedItemData(savedItemId: string, userId: string, itemData: any): Promise<SavedItem | undefined>;

  // Project methods
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string, userId: string): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  updateProject(id: string, userId: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string, userId: string): Promise<void>;
  searchProjects(userId: string, query: string): Promise<Project[]>;
  
  // Project Section methods
  createProjectSection(section: InsertProjectSection): Promise<ProjectSection>;
  getProjectSection(id: string, projectId: string): Promise<ProjectSection | undefined>;
  getProjectSections(projectId: string): Promise<ProjectSection[]>;
  updateProjectSection(id: string, projectId: string, updates: Partial<InsertProjectSection>): Promise<ProjectSection>;
  deleteProjectSection(id: string, projectId: string): Promise<void>;
  reorderProjectSections(projectId: string, sectionOrders: { id: string; position: number; parentId?: string | null }[]): Promise<void>;
  
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
  unpinContent(userId: string, itemType: string, itemId: string, notebookId: string): Promise<void>;
  getUserPinnedContent(userId: string, notebookId: string, category?: string): Promise<PinnedContent[]>;
  reorderPinnedContent(userId: string, itemId: string, newOrder: number, notebookId: string): Promise<void>;
  isContentPinned(userId: string, itemType: string, itemId: string, notebookId: string): Promise<boolean>;

  // Folder methods
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFolder(id: string): Promise<Folder | undefined>;
  getUserFolders(userId: string, type?: string): Promise<Folder[]>;
  getDocumentFolders(documentId: string, userId: string): Promise<Folder[]>;
  updateFolder(id: string, userId: string, updates: Partial<InsertFolder>): Promise<Folder>;
  deleteFolder(id: string, userId: string): Promise<void>;
  getFolderHierarchy(userId: string, type: string): Promise<Folder[]>;

  // Note methods
  createNote(note: InsertNote): Promise<Note>;
  getNote(id: string): Promise<Note | undefined>;
  getUserNotes(userId: string, type?: string): Promise<Note[]>;
  getFolderNotes(folderId: string, userId: string): Promise<Note[]>;
  getDocumentNotes(documentId: string, userId: string): Promise<Note[]>;
  updateNote(id: string, userId: string, updates: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: string, userId: string): Promise<void>;
  
  // Quick note methods
  createQuickNote(userId: string, title: string, content: string): Promise<Note>;
  getUserQuickNote(userId: string): Promise<Note | undefined>;
  updateQuickNote(id: string, userId: string, updates: { title?: string; content?: string }): Promise<Note>;
  deleteQuickNote(id: string, userId: string): Promise<void>;
  
  // Chat message methods
  createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId: string, projectId?: string, guideId?: string, limit?: number): Promise<ChatMessage[]>;
  deleteChatHistory(userId: string, projectId?: string, guideId?: string): Promise<void>;
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
  
  // Notebook methods
  async createNotebook(notebook: InsertNotebook): Promise<Notebook> {
    const [newNotebook] = await db
      .insert(notebooks)
      .values(notebook)
      .returning();
    return newNotebook;
  }

  async getNotebook(id: string, userId: string): Promise<Notebook | undefined> {
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)));
    return notebook || undefined;
  }

  async getUserNotebooks(userId: string): Promise<Notebook[]> {
    return await db
      .select()
      .from(notebooks)
      .where(eq(notebooks.userId, userId))
      .orderBy(desc(notebooks.createdAt));
  }

  async updateNotebook(id: string, userId: string, updates: UpdateNotebook): Promise<Notebook | undefined> {
    const [updatedNotebook] = await db
      .update(notebooks)
      .set(updates)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
      .returning();
    return updatedNotebook || undefined;
  }

  async deleteNotebook(id: string, userId: string): Promise<void> {
    await db
      .delete(notebooks)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)));
  }
  
  // Character methods
  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db
      .insert(characters)
      .values(character)
      .returning();
    return newCharacter;
  }

  async getCharacter(id: string, userId: string, notebookId: string): Promise<Character | undefined> {
    const whereClause = and(
      eq(characters.id, id),
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId)
    );
    const [character] = await db.select().from(characters).where(whereClause);
    return character || undefined;
  }

  async getUserCharacters(userId: string, notebookId: string): Promise<Character[]> {
    const whereClause = and(
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId)
    );
    return await db.select().from(characters)
      .where(whereClause)
      .orderBy(desc(characters.createdAt));
  }

  async updateCharacter(id: string, userId: string, updates: UpdateCharacter, notebookId: string): Promise<Character> {
    const whereClause = and(
      eq(characters.id, id),
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId)
    );
    const [updatedCharacter] = await db
      .update(characters)
      .set(updates)
      .where(whereClause)
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

  async getLocation(id: string, userId: string, notebookId: string): Promise<Location | undefined> {
    const whereClause = and(
      eq(locations.id, id),
      eq(locations.userId, userId),
      eq(locations.notebookId, notebookId)
    );
    const [location] = await db.select().from(locations).where(whereClause);
    return location || undefined;
  }

  async getUserLocations(userId: string, notebookId: string): Promise<Location[]> {
    const whereClause = and(
      eq(locations.userId, userId),
      eq(locations.notebookId, notebookId)
    );
    return await db.select().from(locations)
      .where(whereClause)
      .orderBy(desc(locations.createdAt));
  }

  async updateLocation(id: string, userId: string, updates: Partial<InsertLocation>, notebookId: string): Promise<Location> {
    const whereClause = and(
      eq(locations.id, id),
      eq(locations.userId, userId),
      eq(locations.notebookId, notebookId)
    );
    const [updatedLocation] = await db
      .update(locations)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: string, userId: string, notebookId: string): Promise<void> {
    const whereClause = and(
      eq(locations.id, id),
      eq(locations.userId, userId),
      eq(locations.notebookId, notebookId)
    );
    await db.delete(locations).where(whereClause);
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

  async updateSetting(id: string, updates: Partial<InsertSetting>): Promise<Setting> {
    const [updatedSetting] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.id, id))
      .returning();
    return updatedSetting;
  }

  // Item methods
  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    return newItem;
  }

  async getItem(id: string, userId: string, notebookId: string): Promise<Item | undefined> {
    const whereClause = and(
      eq(items.id, id),
      eq(items.userId, userId),
      eq(items.notebookId, notebookId)
    );
    const [item] = await db.select().from(items).where(whereClause);
    return item || undefined;
  }

  async getUserItems(userId: string, notebookId: string): Promise<Item[]> {
    const whereClause = and(
      eq(items.userId, userId),
      eq(items.notebookId, notebookId)
    );
    return await db.select().from(items)
      .where(whereClause)
      .orderBy(desc(items.createdAt));
  }

  async updateItem(id: string, userId: string, updates: Partial<InsertItem>, notebookId: string): Promise<Item> {
    const whereClause = and(
      eq(items.id, id),
      eq(items.userId, userId),
      eq(items.notebookId, notebookId)
    );
    const [updatedItem] = await db
      .update(items)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedItem;
  }

  async deleteItem(id: string, userId: string, notebookId: string): Promise<void> {
    const whereClause = and(
      eq(items.id, id),
      eq(items.userId, userId),
      eq(items.notebookId, notebookId)
    );
    await db.delete(items).where(whereClause);
  }

  // Organization methods
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [newOrganization] = await db
      .insert(organizations)
      .values(organization)
      .returning();
    return newOrganization;
  }

  async getOrganization(id: string, userId: string, notebookId: string): Promise<Organization | undefined> {
    const whereClause = and(
      eq(organizations.id, id), 
      eq(organizations.userId, userId),
      eq(organizations.notebookId, notebookId)
    );
    const [organization] = await db.select().from(organizations).where(whereClause);
    return organization || undefined;
  }

  async getUserOrganizations(userId: string, notebookId: string): Promise<Organization[]> {
    const whereClause = and(
      eq(organizations.userId, userId),
      eq(organizations.notebookId, notebookId)
    );
    return await db.select().from(organizations)
      .where(whereClause)
      .orderBy(desc(organizations.createdAt));
  }

  async updateOrganization(id: string, userId: string, updates: Partial<InsertOrganization>, notebookId: string): Promise<Organization> {
    const whereClause = and(
      eq(organizations.id, id), 
      eq(organizations.userId, userId),
      eq(organizations.notebookId, notebookId)
    );
    const [updatedOrganization] = await db
      .update(organizations)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedOrganization;
  }

  async deleteOrganization(id: string, userId: string, notebookId: string): Promise<void> {
    const whereClause = and(
      eq(organizations.id, id), 
      eq(organizations.userId, userId),
      eq(organizations.notebookId, notebookId)
    );
    await db.delete(organizations).where(whereClause);
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
    const whereClause = and(
      eq(cultures.id, id), 
      eq(cultures.userId, userId),
      eq(cultures.notebookId, notebookId)
    );
    const [updatedCulture] = await db
      .update(cultures)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedCulture;
  }

  async deleteCulture(id: string, userId: string, notebookId: string): Promise<void> {
    const whereClause = and(
      eq(cultures.id, id), 
      eq(cultures.userId, userId),
      eq(cultures.notebookId, notebookId)
    );
    await db.delete(cultures).where(whereClause);
  }

  // Magic system methods (not implemented - table doesn't exist)
  async createMagic(): Promise<any> {
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

  // Plant methods
  async createPlant(plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db
      .insert(plants)
      .values(plant)
      .returning();
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
    const whereClause = and(
      eq(plants.id, id),
      eq(plants.userId, userId),
      eq(plants.notebookId, notebookId)
    );
    const [updatedPlant] = await db
      .update(plants)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedPlant;
  }

  async deletePlant(id: string, userId: string, notebookId: string): Promise<void> {
    const whereClause = and(
      eq(plants.id, id),
      eq(plants.userId, userId),
      eq(plants.notebookId, notebookId)
    );
    await db.delete(plants).where(whereClause);
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

  async updateDescription(id: string, updates: Partial<InsertDescription>): Promise<Description> {
    const [updatedDescription] = await db
      .update(descriptions)
      .set(updates)
      .where(eq(descriptions.id, id))
      .returning();
    return updatedDescription;
  }

  async deleteDescription(id: string): Promise<void> {
    await db.delete(descriptions).where(eq(descriptions.id, id));
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

  async updateAccessory(id: string, updates: Partial<InsertAccessory>): Promise<Accessory> {
    const [updatedAccessory] = await db
      .update(accessories)
      .set(updates)
      .where(eq(accessories.id, id))
      .returning();
    return updatedAccessory;
  }

  async deleteAccessory(id: string): Promise<void> {
    await db.delete(accessories).where(eq(accessories.id, id));
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

  async updateClothing(id: string, updates: Partial<InsertClothing>): Promise<Clothing> {
    const [updatedClothing] = await db
      .update(clothing)
      .set(updates)
      .where(eq(clothing.id, id))
      .returning();
    return updatedClothing;
  }

  async deleteClothing(id: string): Promise<void> {
    await db.delete(clothing).where(eq(clothing.id, id));
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

  async updateMaterial(id: string, updates: Partial<InsertMaterial>): Promise<Material> {
    const [updatedMaterial] = await db
      .update(materials)
      .set(updates)
      .where(eq(materials.id, id))
      .returning();
    return updatedMaterial;
  }

  async deleteMaterial(id: string): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
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

  async updateSettlement(id: string, updates: Partial<InsertSettlement>): Promise<Settlement> {
    const [updatedSettlement] = await db
      .update(settlements)
      .set(updates)
      .where(eq(settlements.id, id))
      .returning();
    return updatedSettlement;
  }

  async deleteSettlement(id: string): Promise<void> {
    await db.delete(settlements).where(eq(settlements.id, id));
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

  async updateSociety(id: string, updates: Partial<InsertSociety>): Promise<Society> {
    const [updatedSociety] = await db
      .update(societies)
      .set(updates)
      .where(eq(societies.id, id))
      .returning();
    return updatedSociety;
  }

  async deleteSociety(id: string): Promise<void> {
    await db.delete(societies).where(eq(societies.id, id));
  }

  // Faction methods
  async createFaction(faction: InsertFaction): Promise<Faction> {
    const [newFaction] = await db
      .insert(factions)
      .values(faction)
      .returning();
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
    const whereClause = and(
      eq(factions.id, id), 
      eq(factions.userId, userId),
      eq(factions.notebookId, notebookId)
    );
    const [updatedFaction] = await db
      .update(factions)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedFaction;
  }

  async deleteFaction(id: string, userId: string, notebookId: string): Promise<void> {
    const whereClause = and(
      eq(factions.id, id), 
      eq(factions.userId, userId),
      eq(factions.notebookId, notebookId)
    );
    await db.delete(factions).where(whereClause);
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

  async updateMilitaryUnit(id: string, updates: Partial<InsertMilitaryUnit>): Promise<MilitaryUnit> {
    const [updatedMilitaryUnit] = await db
      .update(militaryUnits)
      .set(updates)
      .where(eq(militaryUnits.id, id))
      .returning();
    return updatedMilitaryUnit;
  }

  async deleteMilitaryUnit(id: string): Promise<void> {
    await db.delete(militaryUnits).where(eq(militaryUnits.id, id));
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

  async updateMyth(id: string, updates: Partial<InsertMyth>): Promise<Myth> {
    const [updatedMyth] = await db
      .update(myths)
      .set(updates)
      .where(eq(myths.id, id))
      .returning();
    return updatedMyth;
  }

  async deleteMyth(id: string): Promise<void> {
    await db.delete(myths).where(eq(myths.id, id));
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

  async updateLegend(id: string, updates: Partial<InsertLegend>): Promise<Legend> {
    const [updatedLegend] = await db
      .update(legends)
      .set(updates)
      .where(eq(legends.id, id))
      .returning();
    return updatedLegend;
  }

  async deleteLegend(id: string): Promise<void> {
    await db.delete(legends).where(eq(legends.id, id));
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

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
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

  async updateSpell(id: string, updates: Partial<InsertSpell>): Promise<Spell> {
    const [updatedSpell] = await db
      .update(spells)
      .set(updates)
      .where(eq(spells.id, id))
      .returning();
    return updatedSpell;
  }

  async deleteSpell(id: string): Promise<void> {
    await db.delete(spells).where(eq(spells.id, id));
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

  async updateResource(id: string, updates: Partial<InsertResource>): Promise<Resource> {
    const [updatedResource] = await db
      .update(resources)
      .set(updates)
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  async deleteResource(id: string): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
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

  async updateBuilding(id: string, updates: Partial<InsertBuilding>): Promise<Building> {
    const [updatedBuilding] = await db
      .update(buildings)
      .set(updates)
      .where(eq(buildings.id, id))
      .returning();
    return updatedBuilding;
  }

  async deleteBuilding(id: string): Promise<void> {
    await db.delete(buildings).where(eq(buildings.id, id));
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

  async updateAnimal(id: string, updates: Partial<InsertAnimal>): Promise<Animal> {
    const [updatedAnimal] = await db
      .update(animals)
      .set(updates)
      .where(eq(animals.id, id))
      .returning();
    return updatedAnimal;
  }

  async deleteAnimal(id: string): Promise<void> {
    await db.delete(animals).where(eq(animals.id, id));
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

  async getUserTransportation(userId: string | null): Promise<Transportation[]> {
    if (userId) {
      return await db.select().from(transportation)
        .where(eq(transportation.userId, userId))
        .orderBy(desc(transportation.createdAt));
    }
    return await db.select().from(transportation)
      .orderBy(desc(transportation.createdAt))
      .limit(10);
  }

  async updateTransportation(id: string, updates: Partial<InsertTransportation>): Promise<Transportation> {
    const [updatedTransportation] = await db
      .update(transportation)
      .set(updates)
      .where(eq(transportation.id, id))
      .returning();
    return updatedTransportation;
  }

  async deleteTransportation(id: string): Promise<void> {
    await db.delete(transportation).where(eq(transportation.id, id));
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

  async updateNaturalLaw(id: string, updates: Partial<InsertNaturalLaw>): Promise<NaturalLaw> {
    const [updatedNaturalLaw] = await db
      .update(naturalLaws)
      .set(updates)
      .where(eq(naturalLaws.id, id))
      .returning();
    return updatedNaturalLaw;
  }

  async deleteNaturalLaw(id: string): Promise<void> {
    await db.delete(naturalLaws).where(eq(naturalLaws.id, id));
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

  async updateTradition(id: string, updates: Partial<InsertTradition>): Promise<Tradition> {
    const [updatedTradition] = await db
      .update(traditions)
      .set(updates)
      .where(eq(traditions.id, id))
      .returning();
    return updatedTradition;
  }

  async deleteTradition(id: string): Promise<void> {
    await db.delete(traditions).where(eq(traditions.id, id));
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

  async updateRitual(id: string, updates: Partial<InsertRitual>): Promise<Ritual> {
    const [updatedRitual] = await db
      .update(rituals)
      .set(updates)
      .where(eq(rituals.id, id))
      .returning();
    return updatedRitual;
  }

  async deleteRitual(id: string): Promise<void> {
    await db.delete(rituals).where(eq(rituals.id, id));
  }

  // Family Tree methods
  async createFamilyTree(familyTree: InsertFamilyTree): Promise<FamilyTree> {
    const [newFamilyTree] = await db
      .insert(familyTrees)
      .values(familyTree)
      .returning();
    return newFamilyTree;
  }

  async getFamilyTree(id: string): Promise<FamilyTree | undefined> {
    const [familyTree] = await db.select().from(familyTrees).where(eq(familyTrees.id, id));
    return familyTree || undefined;
  }

  async getUserFamilyTrees(userId: string | null): Promise<FamilyTree[]> {
    if (userId) {
      return await db.select().from(familyTrees)
        .where(eq(familyTrees.userId, userId))
        .orderBy(desc(familyTrees.createdAt));
    }
    return await db.select().from(familyTrees)
      .orderBy(desc(familyTrees.createdAt))
      .limit(10);
  }

  async updateFamilyTree(id: string, updates: Partial<InsertFamilyTree>): Promise<FamilyTree> {
    const [updatedFamilyTree] = await db
      .update(familyTrees)
      .set(updates)
      .where(eq(familyTrees.id, id))
      .returning();
    return updatedFamilyTree;
  }

  async deleteFamilyTree(id: string): Promise<void> {
    await db.delete(familyTrees).where(eq(familyTrees.id, id));
  }

  // Timeline methods
  async createTimeline(timeline: InsertTimeline): Promise<Timeline> {
    const [newTimeline] = await db
      .insert(timelines)
      .values(timeline)
      .returning();
    return newTimeline;
  }

  async getTimeline(id: string): Promise<Timeline | undefined> {
    const [timeline] = await db.select().from(timelines).where(eq(timelines.id, id));
    return timeline || undefined;
  }

  async getUserTimelines(userId: string | null): Promise<Timeline[]> {
    if (userId) {
      return await db.select().from(timelines)
        .where(eq(timelines.userId, userId))
        .orderBy(desc(timelines.createdAt));
    }
    return await db.select().from(timelines)
      .orderBy(desc(timelines.createdAt))
      .limit(10);
  }

  async updateTimeline(id: string, updates: Partial<InsertTimeline>): Promise<Timeline> {
    const [updatedTimeline] = await db
      .update(timelines)
      .set(updates)
      .where(eq(timelines.id, id))
      .returning();
    return updatedTimeline;
  }

  async deleteTimeline(id: string): Promise<void> {
    await db.delete(timelines).where(eq(timelines.id, id));
  }

  // Ceremony methods
  async createCeremony(ceremony: InsertCeremony): Promise<Ceremony> {
    const [newCeremony] = await db
      .insert(ceremonies)
      .values(ceremony)
      .returning();
    return newCeremony;
  }

  async getCeremony(id: string): Promise<Ceremony | undefined> {
    const [ceremony] = await db.select().from(ceremonies).where(eq(ceremonies.id, id));
    return ceremony || undefined;
  }

  async getUserCeremonies(userId: string | null): Promise<Ceremony[]> {
    if (userId) {
      return await db.select().from(ceremonies)
        .where(eq(ceremonies.userId, userId))
        .orderBy(desc(ceremonies.createdAt));
    }
    return await db.select().from(ceremonies)
      .orderBy(desc(ceremonies.createdAt))
      .limit(10);
  }

  async updateCeremony(id: string, updates: Partial<InsertCeremony>): Promise<Ceremony> {
    const [updatedCeremony] = await db
      .update(ceremonies)
      .set(updates)
      .where(eq(ceremonies.id, id))
      .returning();
    return updatedCeremony;
  }

  async deleteCeremony(id: string): Promise<void> {
    await db.delete(ceremonies).where(eq(ceremonies.id, id));
  }

  // Map methods
  async createMap(map: InsertMap): Promise<Map> {
    const [newMap] = await db
      .insert(maps)
      .values(map)
      .returning();
    return newMap;
  }

  async getMap(id: string): Promise<Map | undefined> {
    const [map] = await db.select().from(maps).where(eq(maps.id, id));
    return map || undefined;
  }

  async getUserMaps(userId: string | null): Promise<Map[]> {
    if (userId) {
      return await db.select().from(maps)
        .where(eq(maps.userId, userId))
        .orderBy(desc(maps.createdAt));
    }
    return await db.select().from(maps)
      .orderBy(desc(maps.createdAt))
      .limit(10);
  }

  async updateMap(id: string, updates: Partial<InsertMap>): Promise<Map> {
    const [updatedMap] = await db
      .update(maps)
      .set(updates)
      .where(eq(maps.id, id))
      .returning();
    return updatedMap;
  }

  async deleteMap(id: string): Promise<void> {
    await db.delete(maps).where(eq(maps.id, id));
  }

  // Music methods
  async createMusic(musicData: InsertMusic): Promise<Music> {
    const [newMusic] = await db
      .insert(music)
      .values(musicData)
      .returning();
    return newMusic;
  }

  async getMusic(id: string): Promise<Music | undefined> {
    const [musicItem] = await db.select().from(music).where(eq(music.id, id));
    return musicItem || undefined;
  }

  async getUserMusic(userId: string | null): Promise<Music[]> {
    if (userId) {
      return await db.select().from(music)
        .where(eq(music.userId, userId))
        .orderBy(desc(music.createdAt));
    }
    return await db.select().from(music)
      .orderBy(desc(music.createdAt))
      .limit(10);
  }

  async updateMusic(id: string, updates: Partial<InsertMusic>): Promise<Music> {
    const [updatedMusic] = await db
      .update(music)
      .set(updates)
      .where(eq(music.id, id))
      .returning();
    return updatedMusic;
  }

  async deleteMusic(id: string): Promise<void> {
    await db.delete(music).where(eq(music.id, id));
  }

  // Dance methods
  async createDance(dance: InsertDance): Promise<Dance> {
    const [newDance] = await db
      .insert(dances)
      .values(dance)
      .returning();
    return newDance;
  }

  async getDance(id: string): Promise<Dance | undefined> {
    const [dance] = await db.select().from(dances).where(eq(dances.id, id));
    return dance || undefined;
  }

  async getUserDances(userId: string | null): Promise<Dance[]> {
    if (userId) {
      return await db.select().from(dances)
        .where(eq(dances.userId, userId))
        .orderBy(desc(dances.createdAt));
    }
    return await db.select().from(dances)
      .orderBy(desc(dances.createdAt))
      .limit(10);
  }

  async updateDance(id: string, updates: Partial<InsertDance>): Promise<Dance> {
    const [updatedDance] = await db
      .update(dances)
      .set(updates)
      .where(eq(dances.id, id))
      .returning();
    return updatedDance;
  }

  async deleteDance(id: string): Promise<void> {
    await db.delete(dances).where(eq(dances.id, id));
  }

  // Law methods
  async createLaw(law: InsertLaw): Promise<Law> {
    const [newLaw] = await db
      .insert(laws)
      .values(law)
      .returning();
    return newLaw;
  }

  async getLaw(id: string): Promise<Law | undefined> {
    const [law] = await db.select().from(laws).where(eq(laws.id, id));
    return law || undefined;
  }

  async getUserLaws(userId: string | null): Promise<Law[]> {
    if (userId) {
      return await db.select().from(laws)
        .where(eq(laws.userId, userId))
        .orderBy(desc(laws.createdAt));
    }
    return await db.select().from(laws)
      .orderBy(desc(laws.createdAt))
      .limit(10);
  }

  async updateLaw(id: string, updates: Partial<InsertLaw>): Promise<Law> {
    const [updatedLaw] = await db
      .update(laws)
      .set(updates)
      .where(eq(laws.id, id))
      .returning();
    return updatedLaw;
  }

  async deleteLaw(id: string): Promise<void> {
    await db.delete(laws).where(eq(laws.id, id));
  }

  // Policy methods
  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    const [newPolicy] = await db
      .insert(policies)
      .values(policy)
      .returning();
    return newPolicy;
  }

  async getPolicy(id: string): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy || undefined;
  }

  async getUserPolicies(userId: string | null): Promise<Policy[]> {
    if (userId) {
      return await db.select().from(policies)
        .where(eq(policies.userId, userId))
        .orderBy(desc(policies.createdAt));
    }
    return await db.select().from(policies)
      .orderBy(desc(policies.createdAt))
      .limit(10);
  }

  async updatePolicy(id: string, updates: Partial<InsertPolicy>): Promise<Policy> {
    const [updatedPolicy] = await db
      .update(policies)
      .set(updates)
      .where(eq(policies.id, id))
      .returning();
    return updatedPolicy;
  }

  async deletePolicy(id: string): Promise<void> {
    await db.delete(policies).where(eq(policies.id, id));
  }

  // Potion methods
  async createPotion(potion: InsertPotion): Promise<Potion> {
    const [newPotion] = await db
      .insert(potions)
      .values(potion)
      .returning();
    return newPotion;
  }

  async getPotion(id: string): Promise<Potion | undefined> {
    const [potion] = await db.select().from(potions).where(eq(potions.id, id));
    return potion || undefined;
  }

  async getUserPotions(userId: string | null): Promise<Potion[]> {
    if (userId) {
      return await db.select().from(potions)
        .where(eq(potions.userId, userId))
        .orderBy(desc(potions.createdAt));
    }
    return await db.select().from(potions)
      .orderBy(desc(potions.createdAt))
      .limit(10);
  }

  async updatePotion(id: string, updates: Partial<InsertPotion>): Promise<Potion> {
    const [updatedPotion] = await db
      .update(potions)
      .set(updates)
      .where(eq(potions.id, id))
      .returning();
    return updatedPotion;
  }

  async deletePotion(id: string): Promise<void> {
    await db.delete(potions).where(eq(potions.id, id));
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

  async updateTheme(id: string, updates: Partial<InsertTheme>): Promise<Theme> {
    const [updatedTheme] = await db
      .update(themes)
      .set(updates)
      .where(eq(themes.id, id))
      .returning();
    return updatedTheme;
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

  async updateConflict(id: string, updates: Partial<InsertConflict>): Promise<Conflict> {
    const [updatedConflict] = await db
      .update(conflicts)
      .set(updates)
      .where(eq(conflicts.id, id))
      .returning();
    return updatedConflict;
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

  async unsaveItemFromNotebook(userId: string, itemType: string, itemId: string, notebookId: string): Promise<void> {
    const conditions = [];
    
    // Handle null userId for guest users  
    if (userId === 'null' || !userId) {
      conditions.push(isNull(savedItems.userId));
    } else {
      conditions.push(eq(savedItems.userId, userId));
    }
    
    conditions.push(eq(savedItems.itemType, itemType));
    conditions.push(eq(savedItems.itemId, itemId));
    conditions.push(eq(savedItems.notebookId, notebookId));
    
    await db.delete(savedItems).where(and(...conditions));
  }

  async getUserSavedItemsByNotebook(userId: string, notebookId: string, itemType?: string): Promise<SavedItem[]> {
    const conditions = [];
    
    // Handle null userId for guest users
    if (userId === 'null') {
      conditions.push(isNull(savedItems.userId));
    } else {
      conditions.push(eq(savedItems.userId, userId));
    }
    
    conditions.push(eq(savedItems.notebookId, notebookId));
    
    if (itemType) {
      conditions.push(eq(savedItems.itemType, itemType));
    }
    
    const savedItemsData = await db.select().from(savedItems)
      .where(and(...conditions))
      .orderBy(desc(savedItems.createdAt));
    
    return savedItemsData;
  }

  async updateSavedItemData(savedItemId: string, userId: string, itemData: any): Promise<SavedItem | undefined> {
    const conditions = [];
    
    // Verify the saved item belongs to this user
    conditions.push(eq(savedItems.id, savedItemId));
    
    // Handle null userId for guest users
    if (userId === 'null' || !userId) {
      conditions.push(isNull(savedItems.userId));
    } else {
      conditions.push(eq(savedItems.userId, userId));
    }
    
    const [updatedItem] = await db
      .update(savedItems)
      .set({ itemData })
      .where(and(...conditions))
      .returning();
    
    return updatedItem;
  }

  // Project methods
  async createProject(project: InsertProject): Promise<Project> {
    const result = await db
      .insert(projects)
      .values(project)
      .returning();
    return result[0];
  }

  async getProject(id: string, userId: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, id),
        eq(projects.userId, userId)
      ));
    return project || undefined;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async updateProject(id: string, userId: string, updates: Partial<InsertProject>): Promise<Project> {
    // Count words if content is being updated
    if (updates.content) {
      const plainText = (updates.content as string)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const words = plainText.split(/\s+/).filter((word: string) => word.length > 0);
      updates.wordCount = words.length;
      
      // Generate excerpt if not provided
      if (!updates.excerpt && plainText.length > 0) {
        updates.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      }
    }

    const [updatedProject] = await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(projects.id, id),
        eq(projects.userId, userId)
      ))
      .returning();
      
    if (!updatedProject) {
      throw new Error('Project not found or access denied');
    }
    
    return updatedProject;
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(projects)
      .where(and(
        eq(projects.id, id),
        eq(projects.userId, userId)
      ));
      
    if (result.rowCount === 0) {
      throw new Error('Project not found or access denied');
    }
  }

  async searchProjects(userId: string, query: string): Promise<Project[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return this.getUserProjects(userId);
    }

    // Enhanced full-text search using PostgreSQL tsvector with ranking
    const searchQuery = sql`plainto_tsquery('english', ${trimmedQuery})`;
    return await db.select({
      id: projects.id,
      title: projects.title,
      content: projects.content,
      excerpt: projects.excerpt,
      wordCount: projects.wordCount,
      tags: projects.tags,
      status: projects.status,
      searchVector: projects.searchVector,
      folderId: projects.folderId,
      userId: projects.userId,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      rank: sql<number>`ts_rank(${projects.searchVector}, ${searchQuery})`.as('rank')
    })
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        sql`${projects.searchVector} @@ ${searchQuery}`
      )
    )
    .orderBy(desc(sql`ts_rank(${projects.searchVector}, ${searchQuery})`));
  }

  // Project Section methods
  async createProjectSection(section: InsertProjectSection): Promise<ProjectSection> {
    const [result] = await db
      .insert(projectSections)
      .values(section)
      .returning();
    return result;
  }

  async getProjectSection(id: string, projectId: string): Promise<ProjectSection | undefined> {
    const [section] = await db
      .select()
      .from(projectSections)
      .where(and(
        eq(projectSections.id, id),
        eq(projectSections.projectId, projectId)
      ));
    return section || undefined;
  }

  async getProjectSections(projectId: string): Promise<ProjectSection[]> {
    return await db
      .select()
      .from(projectSections)
      .where(eq(projectSections.projectId, projectId))
      .orderBy(projectSections.position);
  }

  async updateProjectSection(id: string, projectId: string, updates: Partial<InsertProjectSection>): Promise<ProjectSection> {
    const [updatedSection] = await db
      .update(projectSections)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(projectSections.id, id),
        eq(projectSections.projectId, projectId)
      ))
      .returning();
      
    if (!updatedSection) {
      throw new Error('Section not found');
    }
    
    return updatedSection;
  }

  async deleteProjectSection(id: string, projectId: string): Promise<void> {
    await db
      .delete(projectSections)
      .where(and(
        eq(projectSections.id, id),
        eq(projectSections.projectId, projectId)
      ));
  }

  async reorderProjectSections(projectId: string, sectionOrders: { id: string; position: number; parentId?: string | null }[]): Promise<void> {
    // Update positions (and optionally parentId) for each section
    for (const { id, position, parentId } of sectionOrders) {
      const updates: any = { position, updatedAt: new Date() };
      
      // Only update parentId if it's explicitly provided
      if (parentId !== undefined) {
        updates.parentId = parentId;
      }
      
      await db
        .update(projectSections)
        .set(updates)
        .where(and(
          eq(projectSections.id, id),
          eq(projectSections.projectId, projectId)
        ));
    }
  }

  async searchAllContent(userId: string, query: string): Promise<any[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const results: any[] = [];

    try {
      // Search projects (always include these as they're user-specific)
      const projectResults = await this.searchProjects(userId, trimmedQuery);
      projectResults.forEach(item => {
        results.push({
          id: item.id,
          title: item.title,
          type: 'project',
          subtitle: item.status,
          description: item.excerpt || item.content?.substring(0, 100) + '...'
        });
      });

      // Search saved items - this includes all content saved to notebooks
      // Search within the JSONB item_data field for the query string
      const savedItemResults = await db.select().from(savedItems)
        .where(and(
          eq(savedItems.userId, userId),
          sql`${savedItems.itemData}::text ILIKE ${'%' + trimmedQuery + '%'}`
        ))
        .limit(50);
      
      // Batch fetch all notebooks for better performance
      const notebookIds = Array.from(new Set(savedItemResults.map(item => item.notebookId).filter((id): id is string => Boolean(id))));
      const notebooksMap = new Map<string, string>();
      
      if (notebookIds.length > 0) {
        const notebooksData = await db.select()
          .from(notebooks)
          .where(and(
            eq(notebooks.userId, userId),
            inArray(notebooks.id, notebookIds)
          ));
        
        notebooksData.forEach(notebook => {
          notebooksMap.set(notebook.id, notebook.name);
        });
      }

      // Process saved items into search results
      for (const savedItem of savedItemResults) {
        const itemData = savedItem.itemData as any;
        let title = 'Untitled';
        let subtitle = '';
        let description = '';

        // Extract title based on item type
        if (itemData.name) {
          title = itemData.name;
        } else if (itemData.givenName || itemData.familyName) {
          title = [itemData.givenName, itemData.familyName].filter(Boolean).join(' ') || 'Untitled Character';
        } else if (itemData.title) {
          title = itemData.title;
        }

        // Get notebook name for subtitle
        subtitle = (savedItem.notebookId ? notebooksMap.get(savedItem.notebookId) : null) || 'Unknown Notebook';

        // Get description based on type with fallbacks
        switch (savedItem.itemType) {
          case 'character':
            description = itemData.occupation || 'Character';
            if (itemData.backstory) {
              description += ' • ' + itemData.backstory.substring(0, 80);
            }
            break;
          case 'location':
            description = itemData.locationType || 'Location';
            if (itemData.description) {
              description += ' • ' + itemData.description.substring(0, 80);
            }
            break;
          case 'weapon':
            description = itemData.weaponType || 'Weapon';
            if (itemData.description) {
              description += ' • ' + itemData.description.substring(0, 80);
            }
            break;
          case 'organization':
            description = itemData.organizationType || 'Organization';
            if (itemData.purpose) {
              description += ' • ' + itemData.purpose.substring(0, 80);
            }
            break;
          case 'species':
            description = itemData.classification || 'Species';
            if (itemData.physicalDescription) {
              description += ' • ' + itemData.physicalDescription.substring(0, 80);
            }
            break;
          default:
            description = savedItem.itemType.charAt(0).toUpperCase() + savedItem.itemType.slice(1);
            if (itemData.description) {
              description += ' • ' + itemData.description.substring(0, 80);
            }
        }

        results.push({
          id: savedItem.itemId,
          title: title,
          type: savedItem.itemType,
          subtitle: subtitle,
          description: description + (description && description.includes('•') ? '...' : ''),
          notebookId: savedItem.notebookId
        });
      }

    } catch (error) {
      console.error('Error in universal search:', error);
    }

    // Remove duplicates and limit results
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex((r) => r.id === result.id && r.type === result.type)
    );

    return uniqueResults.slice(0, 20);
  }

  // Manuscript links methods - TODO: Implement when manuscript types are available
  // async createManuscriptLink(link: InsertManuscriptLink): Promise<ManuscriptLink> {
  //   const [newLink] = await db
  //     .insert(manuscriptLinks)
  //     .values(link)
  //     .returning();
  //   return newLink;
  // }

  // async getManuscriptLinks(manuscriptId: string, userId: string): Promise<ManuscriptLink[]> {
  //   return await db
  //     .select()
  //     .from(manuscriptLinks)
  //     .where(and(
  //       eq(manuscriptLinks.sourceId, manuscriptId),
  //       eq(manuscriptLinks.userId, userId)
  //     ))
  //     .orderBy(manuscriptLinks.position);
  // }

  // async updateManuscriptLink(linkId: string, updates: Partial<InsertManuscriptLink>, userId: string): Promise<ManuscriptLink> {
  //   const [updatedLink] = await db
  //     .update(manuscriptLinks)
  //     .set(updates)
  //     .where(and(
  //       eq(manuscriptLinks.id, linkId),
  //       eq(manuscriptLinks.userId, userId)
  //     ))
  //     .returning();
  //   
  //   if (!updatedLink) {
  //     throw new Error('Manuscript link not found or access denied');
  //   }
  //   
  //   return updatedLink;
  // }

  // async deleteManuscriptLink(linkId: string, userId: string): Promise<void> {
  //   const result = await db
  //     .delete(manuscriptLinks)
  //     .where(and(
  //       eq(manuscriptLinks.id, linkId),
  //       eq(manuscriptLinks.userId, userId)
  //     ));
  //   
  //   if (result.rowCount === 0) {
  //     throw new Error('Manuscript link not found or access denied');
  //   }
  // }

  // async getBacklinks(targetType: string, targetId: string, userId: string): Promise<Array<ManuscriptLink & { manuscriptTitle: string }>> {
  //   const backlinks = await db
  //     .select({
  //       id: manuscriptLinks.id,
  //       sourceId: manuscriptLinks.sourceId,
  //       targetType: manuscriptLinks.targetType,
  //       targetId: manuscriptLinks.targetId,
  //       contextText: manuscriptLinks.contextText,
  //       linkText: manuscriptLinks.linkText,
  //       position: manuscriptLinks.position,
  //       userId: manuscriptLinks.userId,
  //       createdAt: manuscriptLinks.createdAt,
  //       manuscriptTitle: manuscripts.title
  //     })
  //     .from(manuscriptLinks)
  //     .innerJoin(manuscripts, eq(manuscriptLinks.sourceId, manuscripts.id))
  //     .where(and(
  //       eq(manuscriptLinks.targetType, targetType),
  //       eq(manuscriptLinks.targetId, targetId),
  //       eq(manuscriptLinks.userId, userId)
  //     ))
  //     .orderBy(manuscriptLinks.createdAt);
  //   
  //   return backlinks;
  // }

  // async getManuscriptLinksForUser(userId: string): Promise<ManuscriptLink[]> {
  //   return await db.select().from(manuscriptLinks)
  //     .where(eq(manuscriptLinks.userId, userId))
  //     .orderBy(desc(manuscriptLinks.createdAt))
  //     .limit(100);
  // }

  // async findLinksToContent(targetType: string, targetId: string, userId: string): Promise<ManuscriptLink[]> {
  //   return await db.select().from(manuscriptLinks)
  //     .where(and(
  //       eq(manuscriptLinks.targetType, targetType),
  //       eq(manuscriptLinks.targetId, targetId),
  //       eq(manuscriptLinks.userId, userId)
  //     ));
  // }

  // Pinned content methods
  async pinContent(pin: InsertPinnedContent): Promise<PinnedContent> {
    try {
      // Validate that the notebookId is provided and user owns the notebook
      if (!pin.notebookId) {
        throw new Error('Notebook ID is required for pinning content');
      }
      
      // Verify user owns the notebook
      const userNotebook = await db
        .select()
        .from(notebooks)
        .where(and(
          eq(notebooks.id, pin.notebookId),
          eq(notebooks.userId, pin.userId)
        ))
        .limit(1);
      
      if (!userNotebook[0]) {
        throw new Error('Notebook not found or access denied');
      }
      
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
    await db
      .delete(pinnedContent)
      .where(and(
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
    
    return await db
      .select()
      .from(pinnedContent)
      .where(and(...conditions))
      .orderBy(pinnedContent.createdAt);
  }

  async reorderPinnedContent(userId: string, itemId: string, newOrder: number, notebookId: string): Promise<void> {
    await db
      .update(pinnedContent)
      .set({ pinOrder: newOrder })
      .where(and(
        eq(pinnedContent.userId, userId),
        eq(pinnedContent.id, itemId),
        eq(pinnedContent.notebookId, notebookId)
      ));
  }

  async isContentPinned(userId: string, targetType: string, targetId: string, notebookId: string): Promise<boolean> {
    const [pin] = await db
      .select()
      .from(pinnedContent)
      .where(and(
        eq(pinnedContent.userId, userId),
        eq(pinnedContent.targetType, targetType),
        eq(pinnedContent.targetId, targetId),
        eq(pinnedContent.notebookId, notebookId)
      ))
      .limit(1);
    
    return !!pin;
  }

  // Folder methods
  async createFolder(folder: InsertFolder): Promise<Folder> {
    const result = await db
      .insert(folders)
      .values(folder)
      .returning();
    return result[0];
  }

  async getFolder(id: string): Promise<Folder | undefined> {
    const [folder] = await db
      .select()
      .from(folders)
      .where(eq(folders.id, id));
    return folder || undefined;
  }

  async getUserFolders(userId: string, type?: string): Promise<Folder[]> {
    const conditions = [eq(folders.userId, userId)];
    
    if (type) {
      conditions.push(eq(folders.type, type));
    }
    
    return await db
      .select()
      .from(folders)
      .where(and(...conditions))
      .orderBy(folders.sortOrder, folders.createdAt);
  }

  async getDocumentFolders(documentId: string, userId: string): Promise<Folder[]> {
    // With the new schema, folders have direct links to guides
    return await db
      .select()
      .from(folders)
      .where(and(
        eq(folders.userId, userId),
        eq(folders.guideId, documentId)
      ))
      .orderBy(folders.sortOrder, folders.createdAt);
  }

  async updateFolder(id: string, userId: string, updates: Partial<InsertFolder>): Promise<Folder> {
    const result = await db
      .update(folders)
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
    await db
      .delete(folders)
      .where(and(
        eq(folders.id, id),
        eq(folders.userId, userId)
      ));
  }

  async getFolderHierarchy(userId: string, type: string): Promise<Folder[]> {
    // Get all folders for the user and type, ordered for hierarchy building
    return await db
      .select()
      .from(folders)
      .where(and(
        eq(folders.userId, userId),
        eq(folders.type, type)
      ))
      .orderBy(folders.sortOrder, folders.createdAt);
  }

  // Note methods
  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db
      .insert(notes)
      .values(note)
      .returning();
    return newNote;
  }

  async getNote(id: string): Promise<Note | undefined> {
    const [note] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id));
    return note || undefined;
  }

  async getUserNotes(userId: string, type?: string): Promise<Note[]> {
    const conditions = [eq(notes.userId, userId)];
    
    if (type) {
      conditions.push(eq(notes.type, type));
    }
    
    return await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .orderBy(notes.sortOrder, notes.createdAt);
  }

  async getFolderNotes(folderId: string, userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(and(
        eq(notes.folderId, folderId),
        eq(notes.userId, userId)
      ))
      .orderBy(notes.sortOrder, notes.createdAt);
  }

  async getDocumentNotes(documentId: string, userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
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
    const [updatedNote] = await db
      .update(notes)
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
    await db
      .delete(notes)
      .where(and(
        eq(notes.id, id),
        eq(notes.userId, userId)
      ));
  }

  // Quick note methods
  async createQuickNote(userId: string, title: string, content: string): Promise<Note> {
    const [newNote] = await db
      .insert(notes)
      .values({
        title,
        content,
        type: 'quick_note',
        userId,
        // Quick notes don't have parent relationships
        folderId: null,
        projectId: null,
        guideId: null,
      })
      .returning();
    return newNote;
  }

  async getUserQuickNote(userId: string): Promise<Note | undefined> {
    const [quickNote] = await db
      .select()
      .from(notes)
      .where(and(
        eq(notes.userId, userId),
        eq(notes.type, 'quick_note')
      ))
      .orderBy(desc(notes.updatedAt))
      .limit(1);
    return quickNote || undefined;
  }

  async updateQuickNote(id: string, userId: string, updates: { title?: string; content?: string }): Promise<Note> {
    const [updatedNote] = await db
      .update(notes)
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
    await db
      .delete(notes)
      .where(and(
        eq(notes.id, id),
        eq(notes.userId, userId),
        eq(notes.type, 'quick_note')
      ));
  }

  // Chat message methods
  async createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(chatMessage)
      .returning();
    return newMessage;
  }

  async getChatMessages(userId: string, projectId?: string, guideId?: string, limit = 50): Promise<ChatMessage[]> {
    let whereCondition = eq(chatMessages.userId, userId);
    
    if (projectId) {
      whereCondition = and(whereCondition, eq(chatMessages.projectId, projectId))!;
    } else if (guideId) {
      whereCondition = and(whereCondition, eq(chatMessages.guideId, guideId))!;
    } else {
      // Get general chat messages (not associated with any specific document)
      whereCondition = and(
        whereCondition, 
        isNull(chatMessages.projectId), 
        isNull(chatMessages.guideId)
      )!;
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(whereCondition)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
    
    return messages.reverse(); // Return in chronological order
  }

  async deleteChatHistory(userId: string, projectId?: string, guideId?: string): Promise<void> {
    let whereCondition = eq(chatMessages.userId, userId);
    
    if (projectId) {
      whereCondition = and(whereCondition, eq(chatMessages.projectId, projectId))!;
    } else if (guideId) {
      whereCondition = and(whereCondition, eq(chatMessages.guideId, guideId))!;
    } else {
      // Delete general chat messages (not associated with any specific document)
      whereCondition = and(
        whereCondition, 
        isNull(chatMessages.projectId), 
        isNull(chatMessages.guideId)
      )!;
    }

    await db
      .delete(chatMessages)
      .where(whereCondition);
  }
}

export const storage = new DatabaseStorage();