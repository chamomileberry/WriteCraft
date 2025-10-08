import { z } from "zod";

/**
 * Comprehensive Zod schema for validating AI-generated character data
 * Provides fallback values for missing or invalid fields
 */

// Base validation schema for AI character generation response
export const aiCharacterSchema = z.object({
  // Required name fields (fallbacks provided if missing)
  givenName: z.string().min(1, "Given name is required").default("Unknown"),
  familyName: z.string().min(1, "Family name is required").default(""),
  middleName: z.string().optional().default(""),
  maidenName: z.string().optional().default(""),
  nickname: z.string().optional().default(""),
  honorificTitle: z.string().optional().default(""),
  suffix: z.string().optional().default(""),
  prefix: z.string().optional().default(""),
  
  // Core identity fields
  age: z.number().int().min(0).max(10000).optional().nullable(),
  gender: z.string().optional().default(""),
  sex: z.string().optional().default(""),
  genderIdentity: z.string().optional().default(""),
  pronouns: z.string().optional().default(""),
  species: z.string().optional().default("Human"),
  ethnicity: z.string().optional().default(""),
  
  // Personality and character traits
  personality: z.array(z.string()).optional().default([]),
  motivation: z.string().optional().default(""),
  flaw: z.string().optional().default(""),
  strength: z.string().optional().default(""),
  
  // Background and story
  backstory: z.string().optional().default(""),
  occupation: z.string().optional().default(""),
  genre: z.string().optional().default(""),
  
  // Physical description - basic
  height: z.string().optional().default(""),
  heightDetail: z.string().optional().default(""),
  weight: z.string().optional().default(""),
  build: z.string().optional().default(""),
  hairColor: z.string().optional().default(""),
  hairTexture: z.string().optional().default(""),
  hairStyle: z.string().optional().default(""),
  eyeColor: z.string().optional().default(""),
  skinTone: z.string().optional().default(""),
  facialFeatures: z.string().optional().default(""),
  identifyingMarks: z.string().optional().default(""),
  physicalDescription: z.string().optional().default(""),
  physicalPresentation: z.string().optional().default(""),
  
  // Location and relationships
  currentLocation: z.string().optional().default(""),
  currentResidence: z.string().optional().default(""),
  placeOfBirth: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  placeOfDeath: z.string().optional().default(""),
  dateOfDeath: z.string().optional().default(""),
  
  // Health and conditions
  conditions: z.string().optional().default(""),
  
  // Relationships and affiliations
  family: z.array(z.string()).optional().default([]),
  religiousBelief: z.string().optional().default(""),
  affiliatedOrganizations: z.string().optional().default(""),
  
  // General description
  description: z.string().optional().default(""),
  
  // Additional metadata fields
  imageUrl: z.string().url().optional().nullable(),
  imagePrompt: z.string().optional().default(""),
  
  // Goals and relationships (extended)
  goals: z.string().optional().default(""),
  relationships: z.string().optional().default(""),
  allies: z.string().optional().default(""),
  enemies: z.string().optional().default(""),
  
  // Voice and mannerisms
  speechPattern: z.string().optional().default(""),
  mannerisms: z.string().optional().default(""),
});

export type AICharacterData = z.infer<typeof aiCharacterSchema>;

/**
 * Validates and applies fallbacks to AI-generated character data
 * @param rawData Raw data from AI response
 * @returns Validated character data with fallbacks applied
 */
export function validateAndApplyFallbacks(rawData: unknown): AICharacterData {
  try {
    // First attempt: strict validation
    const validated = aiCharacterSchema.parse(rawData);
    return validated;
  } catch (error) {
    // If strict validation fails, apply fallbacks field by field
    if (error instanceof z.ZodError) {
      console.warn("Character validation errors found, applying fallbacks:", error.errors);
      
      // Create a safe copy with type coercion and fallbacks
      const safeData: any = typeof rawData === 'object' && rawData !== null ? { ...rawData } : {};
      
      // Apply critical fallbacks
      if (!safeData.givenName || typeof safeData.givenName !== 'string' || safeData.givenName.trim() === '') {
        safeData.givenName = 'Unknown';
      }
      
      if (!safeData.familyName || typeof safeData.familyName !== 'string') {
        safeData.familyName = '';
      }
      
      // Ensure arrays are valid
      if (!Array.isArray(safeData.personality)) {
        safeData.personality = [];
      }
      
      if (!Array.isArray(safeData.family)) {
        safeData.family = [];
      }
      
      // Ensure age is a valid number or null
      if (typeof safeData.age !== 'number' || isNaN(safeData.age) || safeData.age < 0) {
        safeData.age = null;
      }
      
      // Default species to Human if not provided
      if (!safeData.species || typeof safeData.species !== 'string') {
        safeData.species = 'Human';
      }
      
      // Try validation again with fallbacks
      try {
        return aiCharacterSchema.parse(safeData);
      } catch (secondError) {
        console.error("Character validation failed even with fallbacks:", secondError);
        
        // Return absolute minimal valid character
        return {
          givenName: 'Unknown',
          familyName: '',
          middleName: '',
          maidenName: '',
          nickname: '',
          honorificTitle: '',
          suffix: '',
          prefix: '',
          age: null,
          gender: '',
          sex: '',
          genderIdentity: '',
          pronouns: '',
          species: 'Human',
          ethnicity: '',
          personality: [],
          motivation: '',
          flaw: '',
          strength: '',
          backstory: '',
          occupation: '',
          genre: '',
          height: '',
          heightDetail: '',
          weight: '',
          build: '',
          hairColor: '',
          hairTexture: '',
          hairStyle: '',
          eyeColor: '',
          skinTone: '',
          facialFeatures: '',
          identifyingMarks: '',
          physicalDescription: '',
          physicalPresentation: '',
          currentLocation: '',
          currentResidence: '',
          placeOfBirth: '',
          dateOfBirth: '',
          placeOfDeath: '',
          dateOfDeath: '',
          conditions: '',
          family: [],
          religiousBelief: '',
          affiliatedOrganizations: '',
          description: '',
          imageUrl: null,
          imagePrompt: '',
          goals: '',
          relationships: '',
          allies: '',
          enemies: '',
          speechPattern: '',
          mannerisms: '',
        };
      }
    }
    
    // For non-Zod errors, return minimal valid character
    console.error("Unexpected validation error:", error);
    return {
      givenName: 'Unknown',
      familyName: '',
      middleName: '',
      maidenName: '',
      nickname: '',
      honorificTitle: '',
      suffix: '',
      prefix: '',
      age: null,
      gender: '',
      sex: '',
      genderIdentity: '',
      pronouns: '',
      species: 'Human',
      ethnicity: '',
      personality: [],
      motivation: '',
      flaw: '',
      strength: '',
      backstory: '',
      occupation: '',
      genre: '',
      height: '',
      heightDetail: '',
      weight: '',
      build: '',
      hairColor: '',
      hairTexture: '',
      hairStyle: '',
      eyeColor: '',
      skinTone: '',
      facialFeatures: '',
      identifyingMarks: '',
      physicalDescription: '',
      physicalPresentation: '',
      currentLocation: '',
      currentResidence: '',
      placeOfBirth: '',
      dateOfBirth: '',
      placeOfDeath: '',
      dateOfDeath: '',
      conditions: '',
      family: [],
      religiousBelief: '',
      affiliatedOrganizations: '',
      description: '',
      imageUrl: null,
      imagePrompt: '',
      goals: '',
      relationships: '',
      allies: '',
      enemies: '',
      speechPattern: '',
      mannerisms: '',
    };
  }
}

/**
 * Helper function to extract character name from validated data
 * @param data Validated character data
 * @returns Full name string
 */
export function getCharacterFullName(data: AICharacterData): string {
  const parts = [
    data.prefix,
    data.honorificTitle,
    data.givenName,
    data.middleName,
    data.familyName,
    data.suffix,
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(' ') : data.nickname || 'Unknown Character';
}
