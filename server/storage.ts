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
  type FamilyTreeMember, type InsertFamilyTreeMember,
  type FamilyTreeRelationship, type InsertFamilyTreeRelationship,
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
  familyTrees, familyTreeMembers, familyTreeRelationships, timelines, ceremonies, maps, music, dances, laws, policies, potions,
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
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Notebook methods
  createNotebook(notebook: InsertNotebook): Promise<Notebook>;
  getNotebook(id: string, userId: string): Promise<Notebook | undefined>;
  getUserNotebooks(userId: string): Promise<Notebook[]>;
  updateNotebook(id: string, userId: string, updates: UpdateNotebook): Promise<Notebook | undefined>;
  deleteNotebook(id: string, userId: string): Promise<void>;
  validateNotebookOwnership(notebookId: string, userId: string): Promise<boolean>;
  
  // Generic content ownership validation
  validateContentOwnership<T extends { userId?: string | null, notebookId?: string | null }>(
    content: T | undefined, 
    userId: string
  ): boolean;
  
  // Character methods
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(id: string, userId: string, notebookId: string): Promise<Character | undefined>;
  getUserCharacters(userId: string, notebookId: string): Promise<Character[]>;
  updateCharacter(id: string, userId: string, updates: UpdateCharacter, notebookId: string): Promise<Character>;
  deleteCharacter(id: string, userId: string, notebookId: string): Promise<void>;
  
  // Plot methods
  createPlot(plot: InsertPlot): Promise<Plot>;
  getPlot(id: string, userId: string, notebookId: string): Promise<Plot | undefined>;
  getUserPlots(userId: string, notebookId: string): Promise<Plot[]>;
  
  // Prompt methods
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPrompt(id: string, userId: string, notebookId: string): Promise<Prompt | undefined>;
  getUserPrompts(userId: string, notebookId: string): Promise<Prompt[]>;
  getRandomPrompts(count?: number): Promise<Prompt[]>;
  
  // Location methods
  createLocation(location: InsertLocation): Promise<Location>;
  getLocation(id: string, userId: string, notebookId: string): Promise<Location | undefined>;
  getUserLocations(userId: string, notebookId: string): Promise<Location[]>;
  updateLocation(id: string, userId: string, updates: Partial<InsertLocation>, notebookId: string): Promise<Location>;
  deleteLocation(id: string, userId: string, notebookId: string): Promise<void>;

  // Setting methods
  createSetting(setting: InsertSetting): Promise<Setting>;
  getSetting(id: string, userId: string, notebookId: string): Promise<Setting | undefined>;
  getUserSettings(userId: string, notebookId: string): Promise<Setting[]>;
  updateSetting(id: string, userId: string, updates: Partial<InsertSetting>): Promise<Setting>;

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
  getCreature(id: string, userId: string, notebookId: string): Promise<Creature | undefined>;
  getUserCreatures(userId: string, notebookId: string): Promise<Creature[]>;
  updateCreature(id: string, userId: string, updates: Partial<InsertCreature>): Promise<Creature>;

  // Species methods
  createSpecies(species: InsertSpecies): Promise<Species>;
  getSpecies(id: string, userId: string, notebookId: string): Promise<Species | undefined>;
  getUserSpecies(userId: string, notebookId: string): Promise<Species[]>;
  updateSpecies(id: string, userId: string, updates: Partial<InsertSpecies>): Promise<Species>;
  deleteSpecies(id: string, userId: string): Promise<void>;

  // Culture methods
  createCulture(culture: InsertCulture): Promise<Culture>;
  getCulture(id: string, userId: string, notebookId: string): Promise<Culture | undefined>;
  getUserCultures(userId: string, notebookId: string): Promise<Culture[]>;
  updateCulture(id: string, userId: string, updates: Partial<InsertCulture>, notebookId: string): Promise<Culture>;
  deleteCulture(id: string, userId: string, notebookId: string): Promise<void>;

  // Magic system methods
  createMagic(): Promise<any>;
  getMagic(id: string): Promise<any | undefined>;
  getUserMagic(userId: string, notebookId: string): Promise<any[]>;
  updateMagic(id: string, userId: string, updates: any): Promise<any>;

  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string, userId: string, notebookId: string): Promise<Document | undefined>;
  getUserDocuments(userId: string, notebookId: string): Promise<Document[]>;
  updateDocument(id: string, userId: string, updates: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string, userId: string): Promise<void>;

  // Food methods
  createFood(food: InsertFood): Promise<Food>;
  getFood(id: string, userId: string, notebookId: string): Promise<Food | undefined>;
  getUserFoods(userId: string, notebookId: string): Promise<Food[]>;
  updateFood(id: string, userId: string, updates: Partial<InsertFood>): Promise<Food>;
  deleteFood(id: string, userId: string): Promise<void>;

  // Language methods
  createLanguage(language: InsertLanguage): Promise<Language>;
  getLanguage(id: string, userId: string, notebookId: string): Promise<Language | undefined>;
  getUserLanguages(userId: string, notebookId: string): Promise<Language[]>;
  updateLanguage(id: string, userId: string, updates: Partial<InsertLanguage>): Promise<Language>;
  deleteLanguage(id: string, userId: string): Promise<void>;

  // Religion methods
  createReligion(religion: InsertReligion): Promise<Religion>;
  getReligion(id: string, userId: string, notebookId: string): Promise<Religion | undefined>;
  getUserReligions(userId: string, notebookId: string): Promise<Religion[]>;
  updateReligion(id: string, userId: string, updates: Partial<InsertReligion>): Promise<Religion>;
  deleteReligion(id: string, userId: string): Promise<void>;

  // Technology methods
  createTechnology(technology: InsertTechnology): Promise<Technology>;
  getTechnology(id: string, userId: string, notebookId: string): Promise<Technology | undefined>;
  getUserTechnologies(userId: string, notebookId: string): Promise<Technology[]>;
  updateTechnology(id: string, userId: string, updates: Partial<InsertTechnology>): Promise<Technology>;
  deleteTechnology(id: string, userId: string): Promise<void>;

  // Weapon methods
  createWeapon(weapon: InsertWeapon): Promise<Weapon>;
  getWeapon(id: string, userId: string, notebookId: string): Promise<Weapon | undefined>;
  getUserWeapons(userId: string, notebookId: string): Promise<Weapon[]>;
  updateWeapon(id: string, userId: string, notebookId: string, updates: Partial<InsertWeapon>): Promise<Weapon>;
  deleteWeapon(id: string, userId: string, notebookId: string): Promise<void>;


  // Profession methods
  createProfession(profession: InsertProfession): Promise<Profession>;
  getProfession(id: string, userId: string, notebookId: string): Promise<Profession | undefined>;
  getUserProfessions(userId: string, notebookId: string): Promise<Profession[]>;
  updateProfession(id: string, userId: string, updates: Partial<InsertProfession>): Promise<Profession>;
  deleteProfession(id: string, userId: string): Promise<void>;

  // Plant methods
  createPlant(plant: InsertPlant): Promise<Plant>;
  getPlant(id: string, userId: string, notebookId: string): Promise<Plant | undefined>;
  getUserPlants(userId: string, notebookId: string): Promise<Plant[]>;
  updatePlant(id: string, userId: string, updates: Partial<InsertPlant>, notebookId: string): Promise<Plant>;
  deletePlant(id: string, userId: string, notebookId: string): Promise<void>;

  // Description methods
  createDescription(description: InsertDescription): Promise<Description>;
  getDescription(id: string, userId: string, notebookId: string): Promise<Description | undefined>;
  getUserDescriptions(userId: string, notebookId: string): Promise<Description[]>;
  updateDescription(id: string, userId: string, updates: Partial<InsertDescription>): Promise<Description>;
  deleteDescription(id: string, userId: string): Promise<void>;

  // Ethnicity methods
  createEthnicity(ethnicity: InsertEthnicity): Promise<Ethnicity>;
  getEthnicity(id: string, userId: string, notebookId: string): Promise<Ethnicity | undefined>;
  getUserEthnicities(userId: string, notebookId: string): Promise<Ethnicity[]>;
  updateEthnicity(id: string, userId: string, updates: Partial<InsertEthnicity>): Promise<Ethnicity>;
  deleteEthnicity(id: string, userId: string): Promise<void>;

  // Drink methods
  createDrink(drink: InsertDrink): Promise<Drink>;
  getDrink(id: string, userId: string, notebookId: string): Promise<Drink | undefined>;
  getUserDrinks(userId: string, notebookId: string): Promise<Drink[]>;
  updateDrink(id: string, userId: string, updates: Partial<InsertDrink>): Promise<Drink>;
  deleteDrink(id: string, userId: string): Promise<void>;

  // Armor methods
  createArmor(armor: InsertArmor): Promise<Armor>;
  getArmor(id: string, userId: string, notebookId: string): Promise<Armor | undefined>;
  getUserArmor(userId: string, notebookId: string): Promise<Armor[]>;
  updateArmor(id: string, userId: string, updates: Partial<InsertArmor>): Promise<Armor>;
  deleteArmor(id: string, userId: string): Promise<void>;

  // Accessory methods
  createAccessory(accessory: InsertAccessory): Promise<Accessory>;
  getAccessory(id: string, userId: string, notebookId: string): Promise<Accessory | undefined>;
  getUserAccessories(userId: string, notebookId: string): Promise<Accessory[]>;
  updateAccessory(id: string, userId: string, updates: Partial<InsertAccessory>): Promise<Accessory>;
  deleteAccessory(id: string, userId: string): Promise<void>;

  // Clothing methods
  createClothing(clothing: InsertClothing): Promise<Clothing>;
  getClothing(id: string, userId: string, notebookId: string): Promise<Clothing | undefined>;
  getUserClothing(userId: string, notebookId: string): Promise<Clothing[]>;
  updateClothing(id: string, userId: string, updates: Partial<InsertClothing>): Promise<Clothing>;
  deleteClothing(id: string, userId: string): Promise<void>;

  // Material methods
  createMaterial(material: InsertMaterial): Promise<Material>;
  getMaterial(id: string, userId: string, notebookId: string): Promise<Material | undefined>;
  getUserMaterials(userId: string, notebookId: string): Promise<Material[]>;
  updateMaterial(id: string, userId: string, updates: Partial<InsertMaterial>): Promise<Material>;
  deleteMaterial(id: string, userId: string): Promise<void>;

  // Settlement methods
  createSettlement(settlement: InsertSettlement): Promise<Settlement>;
  getSettlement(id: string, userId: string, notebookId: string): Promise<Settlement | undefined>;
  getUserSettlements(userId: string, notebookId: string): Promise<Settlement[]>;
  updateSettlement(id: string, userId: string, updates: Partial<InsertSettlement>): Promise<Settlement>;
  deleteSettlement(id: string, userId: string): Promise<void>;

  // Society methods
  createSociety(society: InsertSociety): Promise<Society>;
  getSociety(id: string, userId: string, notebookId: string): Promise<Society | undefined>;
  getUserSocieties(userId: string, notebookId: string): Promise<Society[]>;
  updateSociety(id: string, userId: string, updates: Partial<InsertSociety>): Promise<Society>;
  deleteSociety(id: string, userId: string): Promise<void>;

  // Faction methods
  createFaction(faction: InsertFaction): Promise<Faction>;
  getFaction(id: string, userId: string, notebookId: string): Promise<Faction | undefined>;
  getUserFaction(userId: string, notebookId: string): Promise<Faction[]>;
  updateFaction(id: string, userId: string, updates: Partial<InsertFaction>, notebookId: string): Promise<Faction>;
  deleteFaction(id: string, userId: string, notebookId: string): Promise<void>;

  // Military Unit methods
  createMilitaryUnit(militaryUnit: InsertMilitaryUnit): Promise<MilitaryUnit>;
  getMilitaryUnit(id: string, userId: string, notebookId: string): Promise<MilitaryUnit | undefined>;
  getUserMilitaryUnits(userId: string, notebookId: string): Promise<MilitaryUnit[]>;
  updateMilitaryUnit(id: string, userId: string, updates: Partial<InsertMilitaryUnit>): Promise<MilitaryUnit>;
  deleteMilitaryUnit(id: string, userId: string): Promise<void>;

  // Myth methods
  createMyth(myth: InsertMyth): Promise<Myth>;
  getMyth(id: string, userId: string, notebookId: string): Promise<Myth | undefined>;
  getUserMyths(userId: string, notebookId: string): Promise<Myth[]>;
  updateMyth(id: string, userId: string, updates: Partial<InsertMyth>): Promise<Myth>;
  deleteMyth(id: string, userId: string): Promise<void>;

  // Legend methods
  createLegend(legend: InsertLegend): Promise<Legend>;
  getLegend(id: string, userId: string, notebookId: string): Promise<Legend | undefined>;
  getUserLegends(userId: string, notebookId: string): Promise<Legend[]>;
  updateLegend(id: string, userId: string, updates: Partial<InsertLegend>): Promise<Legend>;
  deleteLegend(id: string, userId: string): Promise<void>;

  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string, userId: string, notebookId: string): Promise<Event | undefined>;
  getUserEvents(userId: string, notebookId: string): Promise<Event[]>;
  updateEvent(id: string, userId: string, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string, userId: string): Promise<void>;

  // Spell methods
  createSpell(spell: InsertSpell): Promise<Spell>;
  getSpell(id: string, userId: string, notebookId: string): Promise<Spell | undefined>;
  getUserSpells(userId: string, notebookId: string): Promise<Spell[]>;
  updateSpell(id: string, userId: string, updates: Partial<InsertSpell>): Promise<Spell>;
  deleteSpell(id: string, userId: string): Promise<void>;

  // Resource methods
  createResource(resource: InsertResource): Promise<Resource>;
  getResource(id: string, userId: string, notebookId: string): Promise<Resource | undefined>;
  getUserResources(userId: string, notebookId: string): Promise<Resource[]>;
  updateResource(id: string, userId: string, updates: Partial<InsertResource>): Promise<Resource>;
  deleteResource(id: string, userId: string): Promise<void>;

  // Building methods
  createBuilding(building: InsertBuilding): Promise<Building>;
  getBuilding(id: string, userId: string, notebookId: string): Promise<Building | undefined>;
  getUserBuildings(userId: string, notebookId: string): Promise<Building[]>;
  updateBuilding(id: string, userId: string, updates: Partial<InsertBuilding>): Promise<Building>;
  deleteBuilding(id: string, userId: string): Promise<void>;

  // Animal methods
  createAnimal(animal: InsertAnimal): Promise<Animal>;
  getAnimal(id: string, userId: string, notebookId: string): Promise<Animal | undefined>;
  getUserAnimals(userId: string, notebookId: string): Promise<Animal[]>;
  updateAnimal(id: string, userId: string, updates: Partial<InsertAnimal>): Promise<Animal>;
  deleteAnimal(id: string, userId: string): Promise<void>;

  // Transportation methods
  createTransportation(transportation: InsertTransportation): Promise<Transportation>;
  getTransportation(id: string, userId: string, notebookId: string): Promise<Transportation | undefined>;
  getUserTransportation(userId: string, notebookId: string): Promise<Transportation[]>;
  updateTransportation(id: string, userId: string, updates: Partial<InsertTransportation>): Promise<Transportation>;
  deleteTransportation(id: string, userId: string): Promise<void>;

  // Natural Law methods
  createNaturalLaw(naturalLaw: InsertNaturalLaw): Promise<NaturalLaw>;
  getNaturalLaw(id: string, userId: string, notebookId: string): Promise<NaturalLaw | undefined>;
  getUserNaturalLaws(userId: string, notebookId: string): Promise<NaturalLaw[]>;
  updateNaturalLaw(id: string, userId: string, updates: Partial<InsertNaturalLaw>): Promise<NaturalLaw>;
  deleteNaturalLaw(id: string, userId: string): Promise<void>;

  // Tradition methods
  createTradition(tradition: InsertTradition): Promise<Tradition>;
  getTradition(id: string, userId: string, notebookId: string): Promise<Tradition | undefined>;
  getUserTraditions(userId: string, notebookId: string): Promise<Tradition[]>;
  updateTradition(id: string, userId: string, updates: Partial<InsertTradition>): Promise<Tradition>;
  deleteTradition(id: string, userId: string): Promise<void>;

  // Ritual methods
  createRitual(ritual: InsertRitual): Promise<Ritual>;
  getRitual(id: string, userId: string, notebookId: string): Promise<Ritual | undefined>;
  getUserRituals(userId: string, notebookId: string): Promise<Ritual[]>;
  updateRitual(id: string, userId: string, updates: Partial<InsertRitual>): Promise<Ritual>;
  deleteRitual(id: string, userId: string): Promise<void>;

  // Family Tree methods
  createFamilyTree(familyTree: InsertFamilyTree): Promise<FamilyTree>;
  getFamilyTree(id: string, userId: string, notebookId: string): Promise<FamilyTree | undefined>;
  getUserFamilyTrees(userId: string, notebookId: string): Promise<FamilyTree[]>;
  updateFamilyTree(id: string, userId: string, updates: Partial<InsertFamilyTree>): Promise<FamilyTree>;
  deleteFamilyTree(id: string, userId: string): Promise<void>;
  
  // Family Tree Member methods
  createFamilyTreeMember(member: InsertFamilyTreeMember): Promise<FamilyTreeMember>;
  getFamilyTreeMembers(treeId: string, userId: string): Promise<FamilyTreeMember[]>;
  updateFamilyTreeMember(id: string, userId: string, updates: Partial<InsertFamilyTreeMember>): Promise<FamilyTreeMember>;
  deleteFamilyTreeMember(id: string, userId: string, treeId: string): Promise<void>;
  
  // Family Tree Relationship methods
  createFamilyTreeRelationship(relationship: InsertFamilyTreeRelationship): Promise<FamilyTreeRelationship>;
  getFamilyTreeRelationships(treeId: string, userId: string): Promise<FamilyTreeRelationship[]>;
  updateFamilyTreeRelationship(id: string, userId: string, updates: Partial<InsertFamilyTreeRelationship>): Promise<FamilyTreeRelationship>;
  deleteFamilyTreeRelationship(id: string, userId: string, treeId: string): Promise<void>;

  // Timeline methods
  createTimeline(timeline: InsertTimeline): Promise<Timeline>;
  getTimeline(id: string, userId: string, notebookId: string): Promise<Timeline | undefined>;
  getUserTimelines(userId: string, notebookId: string): Promise<Timeline[]>;
  updateTimeline(id: string, userId: string, updates: Partial<InsertTimeline>): Promise<Timeline>;
  deleteTimeline(id: string, userId: string): Promise<void>;

  // Ceremony methods
  createCeremony(ceremony: InsertCeremony): Promise<Ceremony>;
  getCeremony(id: string, userId: string, notebookId: string): Promise<Ceremony | undefined>;
  getUserCeremonies(userId: string, notebookId: string): Promise<Ceremony[]>;
  updateCeremony(id: string, userId: string, updates: Partial<InsertCeremony>): Promise<Ceremony>;
  deleteCeremony(id: string, userId: string): Promise<void>;

  // Map methods
  createMap(map: InsertMap): Promise<Map>;
  getMap(id: string, userId: string, notebookId: string): Promise<Map | undefined>;
  getUserMaps(userId: string, notebookId: string): Promise<Map[]>;
  updateMap(id: string, userId: string, updates: Partial<InsertMap>): Promise<Map>;
  deleteMap(id: string, userId: string): Promise<void>;

  // Music methods
  createMusic(music: InsertMusic): Promise<Music>;
  getMusic(id: string, userId: string, notebookId: string): Promise<Music | undefined>;
  getUserMusic(userId: string, notebookId: string): Promise<Music[]>;
  updateMusic(id: string, userId: string, updates: Partial<InsertMusic>): Promise<Music>;
  deleteMusic(id: string, userId: string): Promise<void>;

  // Dance methods
  createDance(dance: InsertDance): Promise<Dance>;
  getDance(id: string, userId: string, notebookId: string): Promise<Dance | undefined>;
  getUserDances(userId: string, notebookId: string): Promise<Dance[]>;
  updateDance(id: string, userId: string, updates: Partial<InsertDance>): Promise<Dance>;
  deleteDance(id: string, userId: string): Promise<void>;

  // Law methods
  createLaw(law: InsertLaw): Promise<Law>;
  getLaw(id: string, userId: string, notebookId: string): Promise<Law | undefined>;
  getUserLaws(userId: string, notebookId: string): Promise<Law[]>;
  updateLaw(id: string, userId: string, updates: Partial<InsertLaw>): Promise<Law>;
  deleteLaw(id: string, userId: string): Promise<void>;

  // Policy methods
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  getPolicy(id: string, userId: string, notebookId: string): Promise<Policy | undefined>;
  getUserPolicies(userId: string, notebookId: string): Promise<Policy[]>;
  updatePolicy(id: string, userId: string, updates: Partial<InsertPolicy>): Promise<Policy>;
  deletePolicy(id: string, userId: string): Promise<void>;

  // Potion methods
  createPotion(potion: InsertPotion): Promise<Potion>;
  getPotion(id: string, userId: string, notebookId: string): Promise<Potion | undefined>;
  getUserPotions(userId: string, notebookId: string): Promise<Potion[]>;
  updatePotion(id: string, userId: string, updates: Partial<InsertPotion>): Promise<Potion>;
  deletePotion(id: string, userId: string): Promise<void>;

  // Name generator methods
  createName(name: InsertName): Promise<GeneratedName>;
  getName(id: string, userId: string, notebookId: string): Promise<GeneratedName | undefined>;
  getUserNames(userId: string, notebookId: string): Promise<GeneratedName[]>;

  // Theme methods
  createTheme(theme: InsertTheme): Promise<Theme>;
  getTheme(id: string, userId: string, notebookId: string): Promise<Theme | undefined>;
  getUserThemes(userId: string, notebookId: string): Promise<Theme[]>;
  updateTheme(id: string, userId: string, updates: Partial<InsertTheme>): Promise<Theme>;

  // Mood methods
  createMood(mood: InsertMood): Promise<Mood>;
  getMood(id: string, userId: string, notebookId: string): Promise<Mood | undefined>;
  getUserMoods(userId: string, notebookId: string): Promise<Mood[]>;

  // Conflict methods
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  getConflict(id: string, userId: string, notebookId: string): Promise<Conflict | undefined>;
  getUserConflicts(userId: string, notebookId: string): Promise<Conflict[]>;
  updateConflict(id: string, userId: string, updates: Partial<InsertConflict>): Promise<Conflict>;

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
  getFolder(id: string, userId: string): Promise<Folder | undefined>;
  getUserFolders(userId: string, type?: string): Promise<Folder[]>;
  getDocumentFolders(documentId: string, userId: string): Promise<Folder[]>;
  updateFolder(id: string, userId: string, updates: Partial<InsertFolder>): Promise<Folder>;
  deleteFolder(id: string, userId: string): Promise<void>;
  getFolderHierarchy(userId: string, type: string): Promise<Folder[]>;

  // Note methods
  createNote(note: InsertNote): Promise<Note>;
  getNote(id: string, userId: string): Promise<Note | undefined>;
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
    // Note: This method is deprecated - users are now identified by email with Replit Auth
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
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
    // Validate ownership before deleting
    const [existing] = await db.select().from(notebooks).where(eq(notebooks.id, id));
    if (!existing) {
      throw new Error('Notebook not found');
    }
    if (existing.userId !== userId) {
      throw new Error('Unauthorized: You do not own this notebook');
    }

    await db
      .delete(notebooks)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)));
  }

  async validateNotebookOwnership(notebookId: string, userId: string): Promise<boolean> {
    const [notebook] = await db
      .select()
      .from(notebooks)
      .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)))
      .limit(1);
    return !!notebook;
  }

  validateContentOwnership<T extends { userId?: string | null, notebookId?: string | null }>(
    content: T | undefined, 
    userId: string
  ): boolean {
    if (!content) return false;
    // Content must have matching userId
    return content.userId === userId;
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
    // Validate ownership
    const [existing] = await db.select().from(characters).where(eq(characters.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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

  async deleteCharacter(id: string, userId: string, notebookId: string): Promise<void> {
    // Validate ownership and notebook association
    const [existing] = await db.select().from(characters).where(eq(characters.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    if (!existing || existing.notebookId !== notebookId) {
      throw new Error('Character not found in the specified notebook');
    }

    const whereClause = and(
      eq(characters.id, id),
      eq(characters.userId, userId),
      eq(characters.notebookId, notebookId)
    );
    await db.delete(characters).where(whereClause);
  }
  
  // Plot methods
  async createPlot(plot: InsertPlot): Promise<Plot> {
    const [newPlot] = await db
      .insert(plots)
      .values(plot)
      .returning();
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
  
  // Prompt methods
  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [newPrompt] = await db
      .insert(prompts)
      .values(prompt)
      .returning();
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
    // Validate ownership
    const [existing] = await db.select().from(locations).where(eq(locations.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(locations).where(eq(locations.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(settings).where(eq(settings.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(items).where(eq(items.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(items).where(eq(items.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(organizations).where(eq(organizations.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(organizations).where(eq(organizations.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(creatures).where(eq(creatures.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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

  async updateSpecies(id: string, userId: string, updates: Partial<InsertSpecies>): Promise<Species> {
    // First, get the species to validate ownership
    const [existing] = await db.select().from(species).where(eq(species.id, id));
    
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    
    const [updatedSpecies] = await db
      .update(species)
      .set(updates)
      .where(eq(species.id, id))
      .returning();
    return updatedSpecies;
  }

  async deleteSpecies(id: string, userId: string): Promise<void> {
    // First, get the species to validate ownership
    const [existing] = await db.select().from(species).where(eq(species.id, id));
    
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }
    
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
    // Validate ownership
    const [existing] = await db.select().from(cultures).where(eq(cultures.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
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
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
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
    // Validate ownership
    const [existing] = await db.select().from(documents).where(eq(documents.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedDocument] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(documents).where(eq(documents.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(foods).where(eq(foods.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedFood] = await db
      .update(foods)
      .set(updates)
      .where(eq(foods.id, id))
      .returning();
    return updatedFood;
  }

  async deleteFood(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(foods).where(eq(foods.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(languages).where(eq(languages.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedLanguage] = await db
      .update(languages)
      .set(updates)
      .where(eq(languages.id, id))
      .returning();
    return updatedLanguage;
  }

  async deleteLanguage(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(languages).where(eq(languages.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(religions).where(eq(religions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedReligion] = await db
      .update(religions)
      .set(updates)
      .where(eq(religions.id, id))
      .returning();
    return updatedReligion;
  }

  async deleteReligion(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(religions).where(eq(religions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(technologies).where(eq(technologies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedTechnology] = await db
      .update(technologies)
      .set(updates)
      .where(eq(technologies.id, id))
      .returning();
    return updatedTechnology;
  }

  async deleteTechnology(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(technologies).where(eq(technologies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(weapons).where(eq(weapons.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const whereClause = and(
      eq(weapons.id, id),
      eq(weapons.userId, userId),
      eq(weapons.notebookId, notebookId)
    );
    const [updatedWeapon] = await db
      .update(weapons)
      .set(updates)
      .where(whereClause)
      .returning();
    return updatedWeapon;
  }

  async deleteWeapon(id: string, userId: string, notebookId: string): Promise<void> {
    // Validate ownership
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


  // Profession methods
  async createProfession(profession: InsertProfession): Promise<Profession> {
    const [newProfession] = await db
      .insert(professions)
      .values(profession)
      .returning();
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
    // Validate ownership
    const [existing] = await db.select().from(professions).where(eq(professions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedProfession] = await db
      .update(professions)
      .set(updates)
      .where(eq(professions.id, id))
      .returning();
    return updatedProfession;
  }

  async deleteProfession(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(professions).where(eq(professions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(plants).where(eq(plants.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
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

  // Description methods
  async createDescription(description: InsertDescription): Promise<Description> {
    const [newDescription] = await db
      .insert(descriptions)
      .values(description)
      .returning();
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
    // Validate ownership
    const [existing] = await db.select().from(descriptions).where(eq(descriptions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedDescription] = await db
      .update(descriptions)
      .set(updates)
      .where(eq(descriptions.id, id))
      .returning();
    return updatedDescription;
  }

  async deleteDescription(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(descriptions).where(eq(descriptions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(ethnicities).where(eq(ethnicities.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedEthnicity] = await db
      .update(ethnicities)
      .set(updates)
      .where(eq(ethnicities.id, id))
      .returning();
    return updatedEthnicity;
  }

  async deleteEthnicity(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(ethnicities).where(eq(ethnicities.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(drinks).where(eq(drinks.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedDrink] = await db
      .update(drinks)
      .set(updates)
      .where(eq(drinks.id, id))
      .returning();
    return updatedDrink;
  }

  async deleteDrink(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(drinks).where(eq(drinks.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(armor).where(eq(armor.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedArmor] = await db
      .update(armor)
      .set(updates)
      .where(eq(armor.id, id))
      .returning();
    return updatedArmor;
  }

  async deleteArmor(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(armor).where(eq(armor.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(accessories).where(eq(accessories.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedAccessory] = await db
      .update(accessories)
      .set(updates)
      .where(eq(accessories.id, id))
      .returning();
    return updatedAccessory;
  }

  async deleteAccessory(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(accessories).where(eq(accessories.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(clothing).where(eq(clothing.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedClothing] = await db
      .update(clothing)
      .set(updates)
      .where(eq(clothing.id, id))
      .returning();
    return updatedClothing;
  }

  async deleteClothing(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(clothing).where(eq(clothing.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(materials).where(eq(materials.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedMaterial] = await db
      .update(materials)
      .set(updates)
      .where(eq(materials.id, id))
      .returning();
    return updatedMaterial;
  }

  async deleteMaterial(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(materials).where(eq(materials.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(settlements).where(eq(settlements.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedSettlement] = await db
      .update(settlements)
      .set(updates)
      .where(eq(settlements.id, id))
      .returning();
    return updatedSettlement;
  }

  async deleteSettlement(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(settlements).where(eq(settlements.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(societies).where(eq(societies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedSociety] = await db
      .update(societies)
      .set(updates)
      .where(eq(societies.id, id))
      .returning();
    return updatedSociety;
  }

  async deleteSociety(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(societies).where(eq(societies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(factions).where(eq(factions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
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

  // Military Unit methods
  async createMilitaryUnit(militaryUnit: InsertMilitaryUnit): Promise<MilitaryUnit> {
    const [newMilitaryUnit] = await db
      .insert(militaryUnits)
      .values(militaryUnit)
      .returning();
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
    // Validate ownership
    const [existing] = await db.select().from(militaryUnits).where(eq(militaryUnits.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedMilitaryUnit] = await db
      .update(militaryUnits)
      .set(updates)
      .where(eq(militaryUnits.id, id))
      .returning();
    return updatedMilitaryUnit;
  }

  async deleteMilitaryUnit(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(militaryUnits).where(eq(militaryUnits.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(myths).where(eq(myths.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedMyth] = await db
      .update(myths)
      .set(updates)
      .where(eq(myths.id, id))
      .returning();
    return updatedMyth;
  }

  async deleteMyth(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(myths).where(eq(myths.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(legends).where(eq(legends.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedLegend] = await db
      .update(legends)
      .set(updates)
      .where(eq(legends.id, id))
      .returning();
    return updatedLegend;
  }

  async deleteLegend(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(legends).where(eq(legends.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(events).where(eq(events.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedEvent] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(events).where(eq(events.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(spells).where(eq(spells.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedSpell] = await db
      .update(spells)
      .set(updates)
      .where(eq(spells.id, id))
      .returning();
    return updatedSpell;
  }

  async deleteSpell(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(spells).where(eq(spells.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(resources).where(eq(resources.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedResource] = await db
      .update(resources)
      .set(updates)
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  async deleteResource(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(resources).where(eq(resources.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(buildings).where(eq(buildings.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedBuilding] = await db
      .update(buildings)
      .set(updates)
      .where(eq(buildings.id, id))
      .returning();
    return updatedBuilding;
  }

  async deleteBuilding(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(buildings).where(eq(buildings.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(animals).where(eq(animals.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedAnimal] = await db
      .update(animals)
      .set(updates)
      .where(eq(animals.id, id))
      .returning();
    return updatedAnimal;
  }

  async deleteAnimal(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(animals).where(eq(animals.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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

  async getTransportation(id: string, userId: string, notebookId: string): Promise<Transportation | undefined> {
    const [transportationItem] = await db.select().from(transportation).where(and(
      eq(transportation.id, id),
      eq(transportation.userId, userId),
      eq(transportation.notebookId, notebookId)
    ));
    return transportationItem || undefined;
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
    // Validate ownership
    const [existing] = await db.select().from(transportation).where(eq(transportation.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedTransportation] = await db
      .update(transportation)
      .set(updates)
      .where(eq(transportation.id, id))
      .returning();
    return updatedTransportation;
  }

  async deleteTransportation(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(transportation).where(eq(transportation.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(naturalLaws).where(eq(naturalLaws.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedNaturalLaw] = await db
      .update(naturalLaws)
      .set(updates)
      .where(eq(naturalLaws.id, id))
      .returning();
    return updatedNaturalLaw;
  }

  async deleteNaturalLaw(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(naturalLaws).where(eq(naturalLaws.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(traditions).where(eq(traditions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedTradition] = await db
      .update(traditions)
      .set(updates)
      .where(eq(traditions.id, id))
      .returning();
    return updatedTradition;
  }

  async deleteTradition(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(traditions).where(eq(traditions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(rituals).where(eq(rituals.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedRitual] = await db
      .update(rituals)
      .set(updates)
      .where(eq(rituals.id, id))
      .returning();
    return updatedRitual;
  }

  async deleteRitual(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(rituals).where(eq(rituals.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    await db.delete(rituals).where(eq(rituals.id, id));
  }

  // Family Tree methods
  async createFamilyTree(familyTree: InsertFamilyTree): Promise<FamilyTree> {
    const [newFamilyTree] = await db
      .insert(familyTrees)
      .values(familyTree)
      .returning();
    
    // Automatically save to saved_items for notebook display
    if (newFamilyTree.notebookId && newFamilyTree.userId) {
      await this.saveItem({
        userId: newFamilyTree.userId,
        notebookId: newFamilyTree.notebookId,
        itemType: 'familytree',
        itemId: newFamilyTree.id,
        itemData: {
          name: newFamilyTree.name,
          description: newFamilyTree.description
        }
      });
    }
    
    return newFamilyTree;
  }

  async getFamilyTree(id: string, userId: string, notebookId: string): Promise<FamilyTree | undefined> {
    const [familyTree] = await db.select().from(familyTrees).where(and(
      eq(familyTrees.id, id),
      eq(familyTrees.userId, userId),
      eq(familyTrees.notebookId, notebookId)
    ));
    return familyTree || undefined;
  }

  async getUserFamilyTrees(userId: string, notebookId: string): Promise<FamilyTree[]> {
    return await db.select().from(familyTrees)
      .where(and(
        eq(familyTrees.userId, userId),
        eq(familyTrees.notebookId, notebookId)
      ))
      .orderBy(desc(familyTrees.createdAt));
  }

  async updateFamilyTree(id: string, userId: string, updates: Partial<InsertFamilyTree>): Promise<FamilyTree> {
    // Validate ownership
    const [existing] = await db.select().from(familyTrees).where(eq(familyTrees.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedFamilyTree] = await db
      .update(familyTrees)
      .set(updates)
      .where(eq(familyTrees.id, id))
      .returning();
    
    // Update saved_items entry if name or description changed
    if (updates.name !== undefined || updates.description !== undefined) {
      await db
        .update(savedItems)
        .set({
          itemData: {
            name: updatedFamilyTree.name,
            description: updatedFamilyTree.description
          }
        })
        .where(and(
          eq(savedItems.itemId, id),
          eq(savedItems.itemType, 'familytree')
        ));
    }
    
    return updatedFamilyTree;
  }

  async deleteFamilyTree(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(familyTrees).where(eq(familyTrees.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    await db.delete(familyTrees).where(eq(familyTrees.id, id));
  }

  // Family Tree Member methods
  async createFamilyTreeMember(member: InsertFamilyTreeMember): Promise<FamilyTreeMember> {
    const [newMember] = await db
      .insert(familyTreeMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async getFamilyTreeMembers(treeId: string, userId: string): Promise<any[]> {
    // Validate tree ownership
    const [tree] = await db.select().from(familyTrees).where(eq(familyTrees.id, treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    // Fetch members with character data using LEFT JOIN
    const rows = await db
      .select()
      .from(familyTreeMembers)
      .leftJoin(characters, eq(familyTreeMembers.characterId, characters.id))
      .where(eq(familyTreeMembers.treeId, treeId))
      .orderBy(desc(familyTreeMembers.createdAt));
    
    // Reshape the data to nest character inside member
    const members = rows.map(row => ({
      ...row.family_tree_members,
      character: row.characters ? {
        id: row.characters.id,
        givenName: row.characters.givenName,
        familyName: row.characters.familyName,
        middleName: row.characters.middleName,
        nickname: row.characters.nickname,
        imageUrl: row.characters.imageUrl,
        dateOfBirth: row.characters.dateOfBirth,
        dateOfDeath: row.characters.dateOfDeath,
      } : null
    }));
    
    return members;
  }

  async updateFamilyTreeMember(id: string, userId: string, updates: Partial<InsertFamilyTreeMember>): Promise<FamilyTreeMember> {
    // Validate ownership via tree
    const [existing] = await db.select().from(familyTreeMembers).where(eq(familyTreeMembers.id, id));
    if (!existing) {
      throw new Error('Member not found');
    }
    
    const [tree] = await db.select().from(familyTrees).where(eq(familyTrees.id, existing.treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updated] = await db.update(familyTreeMembers)
      .set(updates)
      .where(eq(familyTreeMembers.id, id))
      .returning();
    
    return updated;
  }

  async deleteFamilyTreeMember(id: string, userId: string, treeId: string): Promise<void> {
    // Validate ownership via tree
    const [tree] = await db.select().from(familyTrees).where(eq(familyTrees.id, treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    await db.delete(familyTreeMembers).where(and(
      eq(familyTreeMembers.id, id),
      eq(familyTreeMembers.treeId, treeId)
    ));
  }

  // Family Tree Relationship methods
  async createFamilyTreeRelationship(relationship: InsertFamilyTreeRelationship): Promise<FamilyTreeRelationship> {
    const [newRelationship] = await db
      .insert(familyTreeRelationships)
      .values(relationship)
      .returning();
    return newRelationship;
  }

  async getFamilyTreeRelationships(treeId: string, userId: string): Promise<FamilyTreeRelationship[]> {
    // Validate tree ownership
    const [tree] = await db.select().from(familyTrees).where(eq(familyTrees.id, treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    return await db.select().from(familyTreeRelationships)
      .where(eq(familyTreeRelationships.treeId, treeId))
      .orderBy(desc(familyTreeRelationships.createdAt));
  }

  async updateFamilyTreeRelationship(id: string, userId: string, updates: Partial<InsertFamilyTreeRelationship>): Promise<FamilyTreeRelationship> {
    // Validate ownership via tree
    const [existing] = await db.select().from(familyTreeRelationships).where(eq(familyTreeRelationships.id, id));
    if (!existing) {
      throw new Error('Relationship not found');
    }
    
    const [tree] = await db.select().from(familyTrees).where(eq(familyTrees.id, existing.treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updated] = await db.update(familyTreeRelationships)
      .set(updates)
      .where(eq(familyTreeRelationships.id, id))
      .returning();
    
    return updated;
  }

  async deleteFamilyTreeRelationship(id: string, userId: string, treeId: string): Promise<void> {
    // Validate ownership via tree
    const [tree] = await db.select().from(familyTrees).where(eq(familyTrees.id, treeId));
    if (!this.validateContentOwnership(tree, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    await db.delete(familyTreeRelationships).where(and(
      eq(familyTreeRelationships.id, id),
      eq(familyTreeRelationships.treeId, treeId)
    ));
  }

  // Timeline methods
  async createTimeline(timeline: InsertTimeline): Promise<Timeline> {
    const [newTimeline] = await db
      .insert(timelines)
      .values(timeline)
      .returning();
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
    // Validate ownership
    const [existing] = await db.select().from(timelines).where(eq(timelines.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedTimeline] = await db
      .update(timelines)
      .set(updates)
      .where(eq(timelines.id, id))
      .returning();
    return updatedTimeline;
  }

  async deleteTimeline(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(timelines).where(eq(timelines.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(ceremonies).where(eq(ceremonies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedCeremony] = await db
      .update(ceremonies)
      .set(updates)
      .where(eq(ceremonies.id, id))
      .returning();
    return updatedCeremony;
  }

  async deleteCeremony(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(ceremonies).where(eq(ceremonies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(maps).where(eq(maps.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedMap] = await db
      .update(maps)
      .set(updates)
      .where(eq(maps.id, id))
      .returning();
    return updatedMap;
  }

  async deleteMap(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(maps).where(eq(maps.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(music).where(eq(music.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedMusic] = await db
      .update(music)
      .set(updates)
      .where(eq(music.id, id))
      .returning();
    return updatedMusic;
  }

  async deleteMusic(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(music).where(eq(music.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(dances).where(eq(dances.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedDance] = await db
      .update(dances)
      .set(updates)
      .where(eq(dances.id, id))
      .returning();
    return updatedDance;
  }

  async deleteDance(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(dances).where(eq(dances.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(laws).where(eq(laws.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedLaw] = await db
      .update(laws)
      .set(updates)
      .where(eq(laws.id, id))
      .returning();
    return updatedLaw;
  }

  async deleteLaw(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(laws).where(eq(laws.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(policies).where(eq(policies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedPolicy] = await db
      .update(policies)
      .set(updates)
      .where(eq(policies.id, id))
      .returning();
    return updatedPolicy;
  }

  async deletePolicy(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(policies).where(eq(policies.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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
    // Validate ownership
    const [existing] = await db.select().from(potions).where(eq(potions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

    const [updatedPotion] = await db
      .update(potions)
      .set(updates)
      .where(eq(potions.id, id))
      .returning();
    return updatedPotion;
  }

  async deletePotion(id: string, userId: string): Promise<void> {
    // Validate ownership
    const [existing] = await db.select().from(potions).where(eq(potions.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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

  // Theme methods
  async createTheme(theme: InsertTheme): Promise<Theme> {
    const [newTheme] = await db
      .insert(themes)
      .values(theme)
      .returning();
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
    // Validate ownership
    const [existing] = await db.select().from(themes).where(eq(themes.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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

  // Conflict methods
  async createConflict(conflict: InsertConflict): Promise<Conflict> {
    const [newConflict] = await db
      .insert(conflicts)
      .values(conflict)
      .returning();
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
    // Validate ownership
    const [existing] = await db.select().from(conflicts).where(eq(conflicts.id, id));
    if (!this.validateContentOwnership(existing, userId)) {
      throw new Error('Unauthorized: You do not own this content');
    }

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

  // Project link methods (stub implementations)
  async createProjectLink(link: InsertProjectLink): Promise<ProjectLink> {
    throw new Error('ProjectLink functionality not yet implemented');
  }

  async getProjectLinks(projectId: string, userId: string): Promise<ProjectLink[]> {
    return [];
  }

  async getProjectLinksForUser(userId: string): Promise<ProjectLink[]> {
    return [];
  }

  async deleteProjectLink(id: string, userId: string): Promise<void> {
    // Stub - no-op
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

  // Project links methods - TODO: Implement when project link types are available
  // Note: Previously called "manuscript links" - renamed to "project links" for clarity
  // async createProjectLink(link: InsertProjectLink): Promise<ProjectLink> {
  //   const [newLink] = await db
  //     .insert(projectLinks)
  //     .values(link)
  //     .returning();
  //   return newLink;
  // }

  // async getProjectLinks(projectId: string, userId: string): Promise<ProjectLink[]> {
  //   return await db
  //     .select()
  //     .from(projectLinks)
  //     .where(and(
  //       eq(projectLinks.sourceId, projectId),
  //       eq(projectLinks.userId, userId)
  //     ))
  //     .orderBy(projectLinks.position);
  // }

  // async updateProjectLink(linkId: string, updates: Partial<InsertProjectLink>, userId: string): Promise<ProjectLink> {
  //   const [updatedLink] = await db
  //     .update(projectLinks)
  //     .set(updates)
  //     .where(and(
  //       eq(projectLinks.id, linkId),
  //       eq(projectLinks.userId, userId)
  //     ))
  //     .returning();
  //   
  //   if (!updatedLink) {
  //     throw new Error('Project link not found or access denied');
  //   }
  //   
  //   return updatedLink;
  // }

  // async deleteProjectLink(linkId: string, userId: string): Promise<void> {
  //   const result = await db
  //     .delete(projectLinks)
  //     .where(and(
  //       eq(projectLinks.id, linkId),
  //       eq(projectLinks.userId, userId)
  //     ));
  //   
  //   if (result.rowCount === 0) {
  //     throw new Error('Project link not found or access denied');
  //   }
  // }

  // async getBacklinks(targetType: string, targetId: string, userId: string): Promise<Array<ProjectLink & { projectTitle: string }>> {
  //   const backlinks = await db
  //     .select({
  //       id: projectLinks.id,
  //       sourceId: projectLinks.sourceId,
  //       targetType: projectLinks.targetType,
  //       targetId: projectLinks.targetId,
  //       contextText: projectLinks.contextText,
  //       linkText: projectLinks.linkText,
  //       position: projectLinks.position,
  //       userId: projectLinks.userId,
  //       createdAt: projectLinks.createdAt,
  //       projectTitle: projects.title
  //     })
  //     .from(projectLinks)
  //     .innerJoin(projects, eq(projectLinks.sourceId, projects.id))
  //     .where(and(
  //       eq(projectLinks.targetType, targetType),
  //       eq(projectLinks.targetId, targetId),
  //       eq(projectLinks.userId, userId)
  //     ))
  //     .orderBy(projectLinks.createdAt);
  //   
  //   return backlinks;
  // }

  // async getProjectLinksForUser(userId: string): Promise<ProjectLink[]> {
  //   return await db.select().from(projectLinks)
  //     .where(eq(projectLinks.userId, userId))
  //     .orderBy(desc(projectLinks.createdAt))
  //     .limit(100);
  // }

  // async findLinksToContent(targetType: string, targetId: string, userId: string): Promise<ProjectLink[]> {
  //   return await db.select().from(projectLinks)
  //     .where(and(
  //       eq(projectLinks.targetType, targetType),
  //       eq(projectLinks.targetId, targetId),
  //       eq(projectLinks.userId, userId)
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

  async getFolder(id: string, userId: string): Promise<Folder | undefined> {
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(
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

  async getNote(id: string, userId: string): Promise<Note | undefined> {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(
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