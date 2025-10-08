import { z } from 'zod';
import type { ContentTypeFormConfig } from '@/components/forms/types';
import { generateFormConfig, type ContentTypeConfig, commonTabs } from '@/lib/form-generator';
import * as schemas from '@shared/schema';

/**
 * Schema-driven configuration builder
 * Auto-generates form configs from Drizzle/Zod schemas with UI customization
 */

/**
 * Character content type - comprehensive worldbuilding
 */
export const characterSchemaConfig: ContentTypeConfig = {
  title: 'Character Editor',
  description: 'Create detailed characters for your world',
  icon: 'User',
  defaultTab: 'basic',
  tabs: [
    commonTabs.basic,
    commonTabs.appearance,
    commonTabs.personality,
    commonTabs.skills,
    commonTabs.relationships,
    commonTabs.background,
  ],
  fieldHints: {
    // Basic Info tab
    givenName: { tab: 'basic', order: 1, label: 'Given Name', placeholder: 'Their first name at birth' },
    familyName: { tab: 'basic', order: 2, label: 'Family Name', placeholder: 'Last name or surname' },
    middleName: { tab: 'basic', order: 3, label: 'Middle Name', placeholder: 'Middle name(s)' },
    nickname: { tab: 'basic', order: 4, label: 'Nickname', placeholder: 'What friends call them' },
    age: { tab: 'basic', order: 5 },
    gender: { tab: 'basic', order: 6 },
    species: { tab: 'basic', order: 7, endpoint: '/api/species', multiple: false },
    occupation: { tab: 'basic', order: 8, endpoint: '/api/professions', multiple: false },
    description: { tab: 'basic', order: 9, rows: 4, label: 'General Description', placeholder: 'A brief overview of this character...' },
    
    // Appearance tab
    imageUrl: { tab: 'appearance', order: 1 },
    imageCaption: { tab: 'appearance', order: 2, hidden: true },
    physicalDescription: { tab: 'appearance', order: 3, rows: 4 },
    height: { tab: 'appearance', order: 4 },
    weight: { tab: 'appearance', order: 5 },
    build: { tab: 'appearance', order: 6, rows: 3 },
    hairColor: { tab: 'appearance', order: 7 },
    hairTexture: { tab: 'appearance', order: 8 },
    hairStyle: { tab: 'appearance', order: 9 },
    eyeColor: { tab: 'appearance', order: 10 },
    skinTone: { tab: 'appearance', order: 11 },
    facialFeatures: { tab: 'appearance', order: 12, rows: 3 },
    identifyingMarks: { tab: 'appearance', order: 13, rows: 3 },
    
    // Personality tab
    personality: { tab: 'personality', order: 1, label: 'Personality Traits', placeholder: 'Add personality traits...' },
    motivation: { tab: 'personality', order: 2, rows: 3 },
    flaw: { tab: 'personality', order: 3, rows: 3 },
    strength: { tab: 'personality', order: 4, rows: 3 },
    charisma: { tab: 'personality', order: 5 },
    confidence: { tab: 'personality', order: 6 },
    
    // Skills tab
    skills: { tab: 'skills', order: 1, label: 'Skills', placeholder: 'Add skills...' },
    mainSkills: { tab: 'skills', order: 2, rows: 3 },
    strengths: { tab: 'skills', order: 3, rows: 3 },
    lackingSkills: { tab: 'skills', order: 4, rows: 3 },
    
    // Relationships tab
    keyRelationships: { tab: 'relationships', order: 1, rows: 4 },
    allies: { tab: 'relationships', order: 2, rows: 3 },
    enemies: { tab: 'relationships', order: 3, rows: 3 },
    family: { tab: 'relationships', order: 4, placeholder: 'Add family members...' },
    
    // Background tab
    backstory: { tab: 'background', order: 1, rows: 6 },
    upbringing: { tab: 'background', order: 2, rows: 4 },
    education: { tab: 'background', order: 3, rows: 3 },
    placeOfBirth: { tab: 'background', order: 4 },
    dateOfBirth: { tab: 'background', order: 5 },
  },
};

/**
 * Location content type
 */
export const locationSchemaConfig: ContentTypeConfig = {
  title: 'Location Editor',
  description: 'Create detailed locations for your world',
  icon: 'MapPin',
  defaultTab: 'basic',
  tabs: [
    { id: 'basic', label: 'Basic Info', icon: 'MapPin', order: 1 },
    { id: 'geography', label: 'Geography', icon: 'Mountain', order: 2 },
    { id: 'society', label: 'Society', icon: 'Users', order: 3 },
    { id: 'details', label: 'Details', icon: 'FileText', order: 4 },
  ],
  fieldHints: {
    name: { tab: 'basic', order: 1, label: 'Location Name' },
    locationType: { tab: 'basic', order: 2, label: 'Type' },
    description: { tab: 'basic', order: 3, rows: 4 },
    imageUrl: { tab: 'basic', order: 4 },
    
    geography: { tab: 'geography', order: 1, rows: 4 },
    climate: { tab: 'geography', order: 2, rows: 3 },
    notableFeatures: { tab: 'geography', order: 3, placeholder: 'Add notable features...' },
    landmarks: { tab: 'geography', order: 4, placeholder: 'Add landmarks...' },
    
    population: { tab: 'society', order: 1 },
    government: { tab: 'society', order: 2, rows: 3 },
    economy: { tab: 'society', order: 3, rows: 3 },
    culture: { tab: 'society', order: 4, rows: 3 },
    
    history: { tab: 'details', order: 1, rows: 6 },
    threats: { tab: 'details', order: 2, placeholder: 'Add threats...' },
    resources: { tab: 'details', order: 3, placeholder: 'Add resources...' },
  },
};

/**
 * Organization content type
 */
export const organizationSchemaConfig: ContentTypeConfig = {
  title: 'Organization Editor',
  description: 'Create organizations, guilds, and factions',
  icon: 'Building',
  defaultTab: 'basic',
  tabs: [
    { id: 'basic', label: 'Basic Info', icon: 'Building', order: 1 },
    { id: 'structure', label: 'Structure', icon: 'Network', order: 2 },
    { id: 'details', label: 'Details', icon: 'FileText', order: 3 },
  ],
  fieldHints: {
    name: { tab: 'basic', order: 1 },
    organizationType: { tab: 'basic', order: 2, label: 'Type' },
    purpose: { tab: 'basic', order: 3, rows: 3 },
    description: { tab: 'basic', order: 4, rows: 4 },
    imageUrl: { tab: 'basic', order: 5 },
    
    structure: { tab: 'structure', order: 1, rows: 4 },
    leadership: { tab: 'structure', order: 2, rows: 3 },
    members: { tab: 'structure', order: 3, rows: 3 },
    headquarters: { tab: 'structure', order: 4 },
    
    goals: { tab: 'details', order: 1, rows: 3 },
    history: { tab: 'details', order: 2, rows: 5 },
    allies: { tab: 'details', order: 3, placeholder: 'Add allies...' },
    enemies: { tab: 'details', order: 4, placeholder: 'Add enemies...' },
    influence: { tab: 'details', order: 5, rows: 3 },
    resources: { tab: 'details', order: 6, rows: 3 },
  },
};

/**
 * Generate form config from schema with customization
 */
function buildConfig(
  schema: z.ZodObject<any>,
  config: ContentTypeConfig
): ContentTypeFormConfig {
  return generateFormConfig(schema, config);
}

/**
 * Schema-driven configurations registry
 * These are auto-generated from Drizzle schemas with UI hints
 */
export const schemaDrivenConfigs: Record<string, () => ContentTypeFormConfig> = {
  // Already implemented with manual configs - keep using those for now
  // character: () => buildConfig(schemas.insertCharacterSchema, characterSchemaConfig),
  // location: () => buildConfig(schemas.insertLocationSchema, locationSchemaConfig),
  // organization: () => buildConfig(schemas.insertOrganizationSchema, organizationSchemaConfig),
  
  // Auto-generated configs for content types without manual configs yet
  species: () => buildConfig(schemas.insertSpeciesSchema, {
    title: 'Species Editor',
    description: 'Create species and races for your world',
    icon: 'Dna',
    defaultTab: 'general',
  }),
  
  ethnicity: () => buildConfig(schemas.insertEthnicitySchema, {
    title: 'Ethnicity Editor',
    description: 'Create ethnic groups and cultures',
    icon: 'Users',
    defaultTab: 'general',
  }),
  
  culture: () => buildConfig(schemas.insertCultureSchema, {
    title: 'Culture Editor', 
    description: 'Create cultural groups and traditions',
    icon: 'Globe',
    defaultTab: 'general',
  }),
  
  document: () => buildConfig(schemas.insertDocumentSchema, {
    title: 'Document Editor',
    description: 'Create in-world documents and texts',
    icon: 'FileText',
    defaultTab: 'general',
  }),
  
  food: () => buildConfig(schemas.insertFoodSchema, {
    title: 'Food Editor',
    description: 'Create dishes and cuisine',
    icon: 'Apple',
    defaultTab: 'general',
  }),
  
  drink: () => buildConfig(schemas.insertDrinkSchema, {
    title: 'Drink Editor',
    description: 'Create beverages and drinks',
    icon: 'Coffee',
    defaultTab: 'general',
  }),
  
  rank: () => buildConfig(schemas.insertRankSchema, {
    title: 'Rank Editor',
    description: 'Create military ranks, nobility titles, and hierarchies',
    icon: 'Award',
    defaultTab: 'general',
  }),
  
  condition: () => buildConfig(schemas.insertConditionSchema, {
    title: 'Condition Editor',
    description: 'Create diseases, curses, afflictions, and blessings',
    icon: 'HeartPulse',
    defaultTab: 'general',
  }),
  
  profession: () => buildConfig(schemas.insertProfessionSchema, {
    title: 'Profession Editor',
    description: 'Create and manage professions for your world',
    icon: 'Briefcase',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'User', order: 1 },
      { id: 'requirements', label: 'Requirements & Skills', icon: 'Star', order: 2 },
      { id: 'work', label: 'Work Environment', icon: 'Settings', order: 3 },
      { id: 'career', label: 'Career & Society', icon: 'TrendingUp', order: 4 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Profession Name' },
      professionType: { tab: 'basic', order: 3, label: 'Type' },
      description: { tab: 'basic', order: 4, rows: 4 },
      socialStatus: { tab: 'basic', order: 5, label: 'Social Status' },
      genre: { tab: 'basic', order: 6 },
      
      skillsRequired: { tab: 'requirements', order: 1, label: 'Skills Required', placeholder: 'Add required skills...' },
      trainingRequired: { tab: 'requirements', order: 2, placeholder: 'What training is needed?' },
      apprenticeship: { tab: 'requirements', order: 3, placeholder: 'Apprenticeship details' },
      physicalDemands: { tab: 'requirements', order: 4, label: 'Physical Demands' },
      mentalDemands: { tab: 'requirements', order: 5, label: 'Mental Demands' },
      
      responsibilities: { tab: 'work', order: 1, rows: 3, placeholder: 'What do they do?' },
      workEnvironment: { tab: 'work', order: 2, placeholder: 'Where do they work?' },
      commonTools: { tab: 'work', order: 3, label: 'Common Tools', placeholder: 'Add tools used...' },
      riskLevel: { tab: 'work', order: 4, label: 'Risk Level' },
      seasonalWork: { tab: 'work', order: 5, label: 'Seasonal Work' },
      
      averageIncome: { tab: 'career', order: 1, label: 'Average Income', placeholder: 'Income level' },
      careerProgression: { tab: 'career', order: 2, placeholder: 'How do they advance?' },
      relatedProfessions: { tab: 'career', order: 3, placeholder: 'Add related professions...' },
      guildsOrganizations: { tab: 'career', order: 4, label: 'Guilds & Organizations', placeholder: 'Add associated groups...' },
      historicalContext: { tab: 'career', order: 5, placeholder: 'Historical background' },
      culturalSignificance: { tab: 'career', order: 6 },
    },
  }),
  
  potion: () => buildConfig(schemas.insertPotionSchema, {
    title: 'Potion Creator',
    description: 'Create magical brews and elixirs',
    icon: 'FlaskConical',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FlaskConical', order: 1 },
      { id: 'properties', label: 'Properties & Effects', icon: 'Zap', order: 2 },
      { id: 'creation', label: 'Creation & Usage', icon: 'Sparkles', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Potion Name' },
      potionType: { tab: 'basic', order: 3, label: 'Type' },
      rarity: { tab: 'basic', order: 4 },
      description: { tab: 'basic', order: 5, rows: 4 },
      genre: { tab: 'basic', order: 6 },
      
      effects: { tab: 'properties', order: 1, label: 'Primary Effects', placeholder: 'What does this potion do?' },
      duration: { tab: 'properties', order: 2 },
      potency: { tab: 'properties', order: 3, label: 'Potency' },
      sideEffects: { tab: 'properties', order: 4, placeholder: 'Any negative side effects?' },
      appearance: { tab: 'properties', order: 5, placeholder: 'Color, texture, smell...' },
      
      ingredients: { tab: 'creation', order: 1, endpoint: '/api/materials', placeholder: 'Add ingredients...' },
      preparation: { tab: 'creation', order: 2, label: 'Recipe', rows: 4, placeholder: 'How is this potion made?' },
      brewingDifficulty: { tab: 'creation', order: 3, label: 'Brewing Difficulty' },
      brewingTime: { tab: 'creation', order: 4 },
      cost: { tab: 'creation', order: 5, label: 'Market Value', placeholder: 'How much does it cost?' },
      storage: { tab: 'creation', order: 6 },
      shelfLife: { tab: 'creation', order: 7, label: 'Shelf Life' },
    },
  }),
  
  law: () => buildConfig(schemas.insertLawSchema, {
    title: 'Law Creator',
    description: 'Create legal codes and regulations',
    icon: 'Scale',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'Scale', order: 1 },
      { id: 'details', label: 'Legal Details', icon: 'FileText', order: 2 },
      { id: 'context', label: 'Historical Context', icon: 'Book', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Law Name' },
      lawType: { tab: 'basic', order: 3, label: 'Type' },
      jurisdiction: { tab: 'basic', order: 4, endpoint: '/api/locations', multiple: false, placeholder: 'Where does this law apply?' },
      description: { tab: 'basic', order: 5, rows: 4 },
      genre: { tab: 'basic', order: 6 },
      
      text: { tab: 'details', order: 1, label: 'Law Text', rows: 4, placeholder: 'The actual text of the law...' },
      penalties: { tab: 'details', order: 2, rows: 3, placeholder: 'Punishments for breaking this law...' },
      enforcement: { tab: 'details', order: 3, placeholder: 'Who enforces this law?' },
      exceptions: { tab: 'details', order: 4, rows: 3, placeholder: 'Any exceptions to this law...' },
      
      creator: { tab: 'context', order: 1, label: 'Creator/Author', endpoint: '/api/characters', multiple: false, placeholder: 'Who created this law?' },
      dateEnacted: { tab: 'context', order: 2, label: 'Date Enacted', placeholder: 'When was this law created?' },
      precedent: { tab: 'context', order: 3, label: 'Legal Precedent', rows: 3 },
      relatedLaws: { tab: 'context', order: 4, placeholder: 'Add related laws...' },
      controversy: { tab: 'context', order: 5, rows: 3, placeholder: 'Any controversy around this law?' },
    },
  }),
  
  policy: () => buildConfig(schemas.insertPolicySchema, {
    title: 'Policy Creator',
    description: 'Design governance and administrative policies',
    icon: 'FileText',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'implementation', label: 'Implementation', icon: 'Target', order: 2 },
      { id: 'governance', label: 'Governance & Impact', icon: 'Crown', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Policy Name' },
      policyType: { tab: 'basic', order: 3, label: 'Type' },
      organization: { tab: 'basic', order: 4, endpoint: '/api/organizations', multiple: false, placeholder: 'Governing organization...' },
      description: { tab: 'basic', order: 5, rows: 4 },
      genre: { tab: 'basic', order: 6 },
      
      objectives: { tab: 'implementation', order: 1, rows: 3, placeholder: 'What does this policy aim to achieve?' },
      guidelines: { tab: 'implementation', order: 2, rows: 3, placeholder: 'How should this policy be implemented?' },
      scope: { tab: 'implementation', order: 3, placeholder: 'Who does this policy affect?' },
      budget: { tab: 'implementation', order: 4, placeholder: 'Cost and funding' },
      
      authority: { tab: 'governance', order: 1, endpoint: '/api/characters', multiple: false, placeholder: 'Responsible official...' },
      dateImplemented: { tab: 'governance', order: 2, label: 'Date Implemented', placeholder: 'When was this implemented?' },
      review: { tab: 'governance', order: 3, label: 'Review Process', placeholder: 'How is this policy reviewed?' },
      publicOpinion: { tab: 'governance', order: 4, label: 'Public Opinion', rows: 3, placeholder: 'How do people view this policy?' },
      effectiveness: { tab: 'governance', order: 5, placeholder: 'How effective is this policy?' },
    },
  }),

  ceremony: () => buildConfig(schemas.insertCeremonySchema, {
    title: 'Ceremony Designer',
    description: 'Create formal events and rituals',
    icon: 'Sparkles',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'details', label: 'Event Details', icon: 'Calendar', order: 2 },
      { id: 'cultural', label: 'Cultural Elements', icon: 'Users', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Ceremony Name' },
      ceremonyType: { tab: 'basic', order: 3, label: 'Type' },
      purpose: { tab: 'basic', order: 4, rows: 3, placeholder: 'What is the purpose of this ceremony?' },
      description: { tab: 'basic', order: 5, rows: 4 },
      genre: { tab: 'basic', order: 6 },
      
      location: { tab: 'details', order: 1, endpoint: '/api/locations', multiple: false, placeholder: 'Where is this held?' },
      officiant: { tab: 'details', order: 2, endpoint: '/api/characters', multiple: false, placeholder: 'Who officiates?' },
      participants: { tab: 'details', order: 3, placeholder: 'Who participates?' },
      duration: { tab: 'details', order: 4, placeholder: 'How long does it last?' },
      season: { tab: 'details', order: 5, placeholder: 'When is it held?' },
      frequency: { tab: 'details', order: 6, placeholder: 'How often is it performed?' },
      
      traditions: { tab: 'cultural', order: 1, placeholder: 'Ceremonial traditions...' },
      symbolism: { tab: 'cultural', order: 2, placeholder: 'Symbolic meanings...' },
      requiredItems: { tab: 'cultural', order: 3, label: 'Required Items', placeholder: 'Items needed for the ceremony...' },
      dress: { tab: 'cultural', order: 4, label: 'Attire', placeholder: 'What do participants wear?' },
      music: { tab: 'cultural', order: 5, endpoint: '/api/music', multiple: true, placeholder: 'Music performed...' },
      food: { tab: 'cultural', order: 6, endpoint: '/api/food', multiple: true, placeholder: 'Foods served...' },
      gifts: { tab: 'cultural', order: 7, placeholder: 'Gifts exchanged...' },
      significance: { tab: 'cultural', order: 8, rows: 3, placeholder: 'Cultural significance...' },
      restrictions: { tab: 'cultural', order: 9, placeholder: 'Who cannot attend or participate?' },
      variations: { tab: 'cultural', order: 10, rows: 3, placeholder: 'Regional or cultural variations...' },
    },
  }),

  music: () => buildConfig(schemas.insertMusicSchema, {
    title: 'Music Composer',
    description: 'Create songs and musical compositions',
    icon: 'Music',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'composition', label: 'Composition', icon: 'Music', order: 2 },
      { id: 'cultural', label: 'Cultural Context', icon: 'Globe', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Song/Piece Name' },
      musicType: { tab: 'basic', order: 3, label: 'Type' },
      composer: { tab: 'basic', order: 4, endpoint: '/api/characters', multiple: false, placeholder: 'Who composed this?' },
      description: { tab: 'basic', order: 5, rows: 4 },
      genre: { tab: 'basic', order: 6 },
      
      instruments: { tab: 'composition', order: 1, placeholder: 'Instruments used...' },
      performers: { tab: 'composition', order: 2, placeholder: 'Who performs this?' },
      vocals: { tab: 'composition', order: 3, placeholder: 'Solo, chorus, none...' },
      lyrics: { tab: 'composition', order: 4, rows: 6, placeholder: 'Song lyrics (if any)...' },
      tempo: { tab: 'composition', order: 5, placeholder: 'Fast, slow, moderate...' },
      mood: { tab: 'composition', order: 6, placeholder: 'Joyful, melancholic, epic...' },
      musicalStyle: { tab: 'composition', order: 7, label: 'Musical Style', placeholder: 'Classical, folk, modern...' },
      length: { tab: 'composition', order: 8, placeholder: 'Duration of the piece' },
      difficulty: { tab: 'composition', order: 9, placeholder: 'Easy, moderate, difficult...' },
      variations: { tab: 'composition', order: 10, placeholder: 'Different versions...' },
      
      culturalOrigin: { tab: 'cultural', order: 1, label: 'Cultural Origin', endpoint: '/api/cultures', multiple: false },
      occasion: { tab: 'cultural', order: 2, placeholder: 'When is this performed?' },
      significance: { tab: 'cultural', order: 3, rows: 3, placeholder: 'Cultural or historical significance...' },
      popularity: { tab: 'cultural', order: 4, placeholder: 'How well-known is this?' },
    },
  }),

  dance: () => buildConfig(schemas.insertDanceSchema, {
    title: 'Dance Choreographer',
    description: 'Design choreographed performances',
    icon: 'PersonStanding',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'performance', label: 'Performance', icon: 'Users', order: 2 },
      { id: 'cultural', label: 'Cultural Context', icon: 'Globe', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Dance Name' },
      danceType: { tab: 'basic', order: 3, label: 'Type' },
      origin: { tab: 'basic', order: 4, endpoint: '/api/locations', multiple: false, placeholder: 'Where did this originate?' },
      description: { tab: 'basic', order: 5, rows: 4 },
      genre: { tab: 'basic', order: 6 },
      
      movements: { tab: 'performance', order: 1, placeholder: 'Key dance movements...' },
      formations: { tab: 'performance', order: 2, placeholder: 'Dance formations (circle, line, etc.)...' },
      participants: { tab: 'performance', order: 3, placeholder: 'Solo, pair, group...' },
      music: { tab: 'performance', order: 4, endpoint: '/api/music', multiple: true, placeholder: 'Music for this dance...' },
      costumes: { tab: 'performance', order: 5, rows: 3, placeholder: 'What do dancers wear?' },
      props: { tab: 'performance', order: 6, placeholder: 'Props used (ribbons, sticks, etc.)...' },
      duration: { tab: 'performance', order: 7, placeholder: 'How long is the dance?' },
      difficulty: { tab: 'performance', order: 8, placeholder: 'Easy, moderate, difficult...' },
      teachingMethods: { tab: 'performance', order: 9, label: 'Teaching Methods', rows: 3, placeholder: 'How is this dance taught?' },
      
      occasion: { tab: 'cultural', order: 1, placeholder: 'When is this performed?' },
      symbolism: { tab: 'cultural', order: 2, rows: 3, placeholder: 'What does this dance symbolize?' },
      culturalSignificance: { tab: 'cultural', order: 3, label: 'Cultural Significance', rows: 3, placeholder: 'Cultural importance...' },
      restrictions: { tab: 'cultural', order: 4, placeholder: 'Who can or cannot perform this?' },
      variations: { tab: 'cultural', order: 5, placeholder: 'Regional variations...' },
    },
  }),

  tradition: () => buildConfig(schemas.insertTraditionSchema, {
    title: 'Tradition Builder',
    description: 'Create cultural customs and practices',
    icon: 'Sparkles',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'practice', label: 'Practice', icon: 'Users', order: 2 },
      { id: 'cultural', label: 'Cultural Significance', icon: 'Globe', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Tradition Name' },
      traditionType: { tab: 'basic', order: 3, label: 'Type' },
      description: { tab: 'basic', order: 4, rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      origin: { tab: 'practice', order: 1, endpoint: '/api/locations', multiple: false, placeholder: 'Where did this originate?' },
      purpose: { tab: 'practice', order: 2, rows: 3, placeholder: 'Why is this practiced?' },
      participants: { tab: 'practice', order: 3, placeholder: 'Who participates?' },
      procedure: { tab: 'practice', order: 4, rows: 4, placeholder: 'How is this tradition carried out?' },
      timing: { tab: 'practice', order: 5, placeholder: 'When is this practiced?' },
      location: { tab: 'practice', order: 6, endpoint: '/api/locations', multiple: false, placeholder: 'Where is this practiced?' },
      
      symbolism: { tab: 'cultural', order: 1, rows: 3, placeholder: 'Symbolic meanings...' },
      significance: { tab: 'cultural', order: 2, rows: 3, placeholder: 'Cultural importance...' },
      modernPractice: { tab: 'cultural', order: 3, label: 'Modern Practice', rows: 3, placeholder: 'How is this practiced today?' },
      variations: { tab: 'cultural', order: 4, placeholder: 'Regional or cultural variations...' },
      relatedTraditions: { tab: 'cultural', order: 5, label: 'Related Traditions', placeholder: 'Similar traditions...' },
    },
  }),

  ritual: () => buildConfig(schemas.insertRitualSchema, {
    title: 'Ritual Designer',
    description: 'Create religious and magical rituals',
    icon: 'Sparkles',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'execution', label: 'Execution', icon: 'Zap', order: 2 },
      { id: 'requirements', label: 'Requirements & Effects', icon: 'Shield', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Ritual Name' },
      ritualType: { tab: 'basic', order: 3, label: 'Type' },
      purpose: { tab: 'basic', order: 4, rows: 3, placeholder: 'What is the purpose of this ritual?' },
      description: { tab: 'basic', order: 5, rows: 4 },
      genre: { tab: 'basic', order: 6 },
      
      steps: { tab: 'execution', order: 1, placeholder: 'Ritual steps in order...' },
      participants: { tab: 'execution', order: 2, placeholder: 'Who performs this?' },
      duration: { tab: 'execution', order: 3, placeholder: 'How long does it take?' },
      location: { tab: 'execution', order: 4, endpoint: '/api/locations', multiple: false, placeholder: 'Where is this performed?' },
      timing: { tab: 'execution', order: 5, placeholder: 'When must this be performed?' },
      
      requirements: { tab: 'requirements', order: 1, placeholder: 'What is needed...' },
      components: { tab: 'requirements', order: 2, placeholder: 'Materials and components...' },
      effects: { tab: 'requirements', order: 3, rows: 3, placeholder: 'What happens when performed?' },
      risks: { tab: 'requirements', order: 4, rows: 3, placeholder: 'Dangers or risks...' },
      variations: { tab: 'requirements', order: 5, placeholder: 'Different versions...' },
    },
  }),

  myth: () => buildConfig(schemas.insertMythSchema, {
    title: 'Myth Creator',
    description: 'Craft creation myths and legendary tales',
    icon: 'BookOpen',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'story', label: 'Story', icon: 'BookOpen', order: 2 },
      { id: 'cultural', label: 'Cultural Context', icon: 'Globe', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      title: { tab: 'basic', order: 2, label: 'Myth Title' },
      mythType: { tab: 'basic', order: 3, label: 'Type' },
      summary: { tab: 'basic', order: 4, rows: 4, placeholder: 'Brief summary of the myth...' },
      genre: { tab: 'basic', order: 5 },
      
      fullStory: { tab: 'story', order: 1, label: 'Full Story', rows: 10, placeholder: 'The complete myth...' },
      characters: { tab: 'story', order: 2, endpoint: '/api/characters', multiple: true, placeholder: 'Key characters in the myth...' },
      themes: { tab: 'story', order: 3, placeholder: 'Major themes...' },
      moralLesson: { tab: 'story', order: 4, label: 'Moral Lesson', rows: 3, placeholder: 'What lesson does this teach?' },
      
      culturalOrigin: { tab: 'cultural', order: 1, label: 'Cultural Origin', endpoint: '/api/cultures', multiple: false },
      symbolism: { tab: 'cultural', order: 2, rows: 3, placeholder: 'Symbolic meanings...' },
      variations: { tab: 'cultural', order: 3, placeholder: 'Different versions of this myth...' },
      modernRelevance: { tab: 'cultural', order: 4, label: 'Modern Relevance', rows: 3, placeholder: 'How is this relevant today?' },
      relatedMyths: { tab: 'cultural', order: 5, label: 'Related Myths', placeholder: 'Similar myths...' },
    },
  }),

  legend: () => buildConfig(schemas.insertLegendSchema, {
    title: 'Legend Builder',
    description: 'Create historical and heroic legends',
    icon: 'Crown',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'story', label: 'Story', icon: 'BookOpen', order: 2 },
      { id: 'truth', label: 'Truth & Impact', icon: 'Scale', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      title: { tab: 'basic', order: 2, label: 'Legend Title' },
      legendType: { tab: 'basic', order: 3, label: 'Type' },
      summary: { tab: 'basic', order: 4, rows: 4, placeholder: 'Brief summary of the legend...' },
      genre: { tab: 'basic', order: 5 },
      
      fullStory: { tab: 'story', order: 1, label: 'Full Story', rows: 10, placeholder: 'The complete legend...' },
      mainCharacters: { tab: 'story', order: 2, label: 'Main Characters', endpoint: '/api/characters', multiple: true },
      location: { tab: 'story', order: 3, endpoint: '/api/locations', multiple: false, placeholder: 'Where did this take place?' },
      timeframe: { tab: 'story', order: 4, placeholder: 'When did this happen?' },
      
      historicalBasis: { tab: 'truth', order: 1, label: 'Historical Basis', rows: 3, placeholder: 'Real events this is based on...' },
      truthElements: { tab: 'truth', order: 2, label: 'Elements of Truth', rows: 3, placeholder: 'What parts are true?' },
      exaggerations: { tab: 'truth', order: 3, rows: 3, placeholder: 'What parts are exaggerated?' },
      culturalImpact: { tab: 'truth', order: 4, label: 'Cultural Impact', rows: 3, placeholder: 'How has this affected culture?' },
      modernAdaptations: { tab: 'truth', order: 5, label: 'Modern Adaptations', placeholder: 'Modern retellings...' },
    },
  }),
};

/**
 * Get a schema-driven config by content type
 */
export function getSchemaDrivenConfig(contentType: string): ContentTypeFormConfig | null {
  const generator = schemaDrivenConfigs[contentType];
  return generator ? generator() : null;
}
