import { z } from "zod";
import {
  insertCharacterSchema,
  insertPlotSchema,
  insertPromptSchema,
  insertSettingSchema,
  insertNameSchema,
  insertConflictSchema,
  insertThemeSchema,
  insertMoodSchema,
  insertCreatureSchema,
  insertPlantSchema,
  insertDescriptionSchema,
  insertLocationSchema,
  insertItemSchema,
  insertOrganizationSchema,
  insertSpeciesSchema,
  insertEthnicitySchema,
  insertCultureSchema,
  insertDocumentSchema,
  insertFoodSchema,
  insertDrinkSchema,
  insertWeaponSchema,
  insertArmorSchema,
  insertReligionSchema,
  insertLanguageSchema,
  insertAccessorySchema,
  insertClothingSchema,
  insertMaterialSchema,
  insertSettlementSchema,
  insertSocietySchema,
  insertFactionSchema,
  insertMilitaryUnitSchema,
  insertMythSchema,
  insertLegendSchema,
  insertEventSchema,
  insertTechnologySchema,
  insertSpellSchema,
  insertResourceSchema,
  insertBuildingSchema,
  insertAnimalSchema,
  insertTransportationSchema,
  insertNaturalLawSchema,
  insertTraditionSchema,
  insertRitualSchema,
  insertFamilyTreeSchema,
  insertTimelineSchema,
  insertCeremonySchema,
  insertMapSchema,
  insertMusicSchema,
  insertDanceSchema,
  insertLawSchema,
  insertPolicySchema,
  insertPotionSchema,
  insertProfessionSchema,
} from "./schema";

/**
 * Centralized mapping of content type IDs to their Zod validation schemas
 * Used for both client-side form validation and server-side request validation
 */
export const CONTENT_TYPE_SCHEMAS: Record<string, z.ZodTypeAny> = {
  // Characters & People
  character: insertCharacterSchema,
  ethnicity: insertEthnicitySchema,
  culture: insertCultureSchema,
  profession: insertProfessionSchema,
  familyTree: insertFamilyTreeSchema,

  // Places & Locations
  location: insertLocationSchema,
  settlement: insertSettlementSchema,
  building: insertBuildingSchema,
  map: insertMapSchema,
  setting: insertSettingSchema,

  // Organizations & Groups
  organization: insertOrganizationSchema,
  society: insertSocietySchema,
  faction: insertFactionSchema,
  militaryUnit: insertMilitaryUnitSchema,

  // Creatures & Life
  species: insertSpeciesSchema,
  creature: insertCreatureSchema,
  animal: insertAnimalSchema,
  plant: insertPlantSchema,

  // Items & Objects
  item: insertItemSchema,
  weapon: insertWeaponSchema,
  armor: insertArmorSchema,
  accessory: insertAccessorySchema,
  clothing: insertClothingSchema,
  transportation: insertTransportationSchema,

  // Materials & Resources
  material: insertMaterialSchema,
  resource: insertResourceSchema,
  food: insertFoodSchema,
  drink: insertDrinkSchema,
  potion: insertPotionSchema,

  // Knowledge & Culture
  document: insertDocumentSchema,
  language: insertLanguageSchema,
  religion: insertReligionSchema,
  myth: insertMythSchema,
  legend: insertLegendSchema,
  tradition: insertTraditionSchema,
  ritual: insertRitualSchema,
  ceremony: insertCeremonySchema,
  music: insertMusicSchema,
  dance: insertDanceSchema,
  law: insertLawSchema,
  policy: insertPolicySchema,

  // Events & Time
  event: insertEventSchema,
  timeline: insertTimelineSchema,

  // Magic & Technology
  technology: insertTechnologySchema,
  spell: insertSpellSchema,
  naturalLaw: insertNaturalLawSchema,

  // Story Elements
  plot: insertPlotSchema,
  prompt: insertPromptSchema,
  conflict: insertConflictSchema,
  theme: insertThemeSchema,
  mood: insertMoodSchema,
  name: insertNameSchema,
  description: insertDescriptionSchema,
};

/**
 * Get the Zod validation schema for a content type
 * @param contentType - The content type ID
 * @returns The Zod schema or null if not found
 */
export function getContentTypeSchema(contentType: string): z.ZodTypeAny | null {
  return CONTENT_TYPE_SCHEMAS[contentType] || null;
}

/**
 * Validate data against a content type schema
 * @param contentType - The content type ID
 * @param data - The data to validate
 * @returns The validated data
 * @throws ZodError if validation fails
 */
export function validateContentType<T = any>(contentType: string, data: unknown): T {
  const schema = getContentTypeSchema(contentType);
  if (!schema) {
    throw new Error(`No validation schema found for content type: ${contentType}`);
  }
  return schema.parse(data) as T;
}
