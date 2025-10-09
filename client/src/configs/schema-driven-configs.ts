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
    // Basic Info tab - image first!
    imageUrl: { tab: 'basic', order: 1 },
    givenName: { tab: 'basic', order: 2, label: 'Given Name', placeholder: 'Their first name at birth' },
    familyName: { tab: 'basic', order: 3, label: 'Family Name', placeholder: 'Last name or surname' },
    middleName: { tab: 'basic', order: 4, label: 'Middle Name', placeholder: 'Middle name(s)' },
    nickname: { tab: 'basic', order: 5, label: 'Nickname', placeholder: 'What friends call them' },
    age: { tab: 'basic', order: 6 },
    gender: { tab: 'basic', order: 7 },
    species: { tab: 'basic', order: 8, endpoint: '/api/species', multiple: false },
    occupation: { tab: 'basic', order: 9, endpoint: '/api/professions', multiple: false },
    description: { tab: 'basic', order: 10, rows: 4, label: 'General Description', placeholder: 'A brief overview of this character...' },
    
    // Appearance tab
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
    imageUrl: { tab: 'basic', order: 1 },
    name: { tab: 'basic', order: 2, label: 'Location Name' },
    locationType: { tab: 'basic', order: 3, label: 'Type' },
    description: { tab: 'basic', order: 4, rows: 4 },
    
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
    imageUrl: { tab: 'basic', order: 1 },
    name: { tab: 'basic', order: 2 },
    organizationType: { tab: 'basic', order: 3, label: 'Type' },
    purpose: { tab: 'basic', order: 4, rows: 3 },
    description: { tab: 'basic', order: 5, rows: 4 },
    
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

  accessory: () => buildConfig(schemas.insertAccessorySchema, {
    title: 'Accessory Designer',
    description: 'Create jewelry, belts, and wearable items',
    icon: 'Gem',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'details', label: 'Details', icon: 'Sparkles', order: 2 },
      { id: 'cultural', label: 'Cultural Context', icon: 'Globe', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Accessory Name' },
      accessoryType: { tab: 'basic', order: 3, label: 'Type' },
      description: { tab: 'basic', order: 4, rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      appearance: { tab: 'details', order: 1, rows: 3, placeholder: 'How does it look?' },
      materials: { tab: 'details', order: 2, endpoint: '/api/materials', multiple: true, placeholder: 'What is it made of?' },
      functionality: { tab: 'details', order: 3, rows: 3, placeholder: 'What does it do?' },
      value: { tab: 'details', order: 4, placeholder: 'How much is it worth?' },
      rarity: { tab: 'details', order: 5 },
      enchantments: { tab: 'details', order: 6, placeholder: 'Magical properties...' },
      
      culturalSignificance: { tab: 'cultural', order: 1, label: 'Cultural Significance', rows: 3 },
      history: { tab: 'cultural', order: 2, rows: 3, placeholder: 'History and origins...' },
    },
  }),

  clothing: () => buildConfig(schemas.insertClothingSchema, {
    title: 'Clothing Designer',
    description: 'Create garments and fashion items',
    icon: 'Shirt',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'design', label: 'Design', icon: 'Palette', order: 2 },
      { id: 'cultural', label: 'Cultural Context', icon: 'Globe', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Garment Name' },
      clothingType: { tab: 'basic', order: 3, label: 'Type' },
      description: { tab: 'basic', order: 4, rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      style: { tab: 'design', order: 1, placeholder: 'Fashion style...' },
      colors: { tab: 'design', order: 2, placeholder: 'Primary colors...' },
      materials: { tab: 'design', order: 3, endpoint: '/api/materials', multiple: true, placeholder: 'Fabrics and materials...' },
      durability: { tab: 'design', order: 4 },
      cost: { tab: 'design', order: 5, placeholder: 'How much does it cost?' },
      
      socialClass: { tab: 'cultural', order: 1, label: 'Social Class', placeholder: 'Who wears this?' },
      occasion: { tab: 'cultural', order: 2, placeholder: 'When is it worn?' },
      climate: { tab: 'cultural', order: 3, placeholder: 'Suitable climate...' },
      culturalContext: { tab: 'cultural', order: 4, label: 'Cultural Context', rows: 3 },
    },
  }),

  material: () => buildConfig(schemas.insertMaterialSchema, {
    title: 'Material Creator',
    description: 'Create metals, fabrics, and raw materials',
    icon: 'Box',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'properties', label: 'Properties', icon: 'Zap', order: 2 },
      { id: 'production', label: 'Production & Usage', icon: 'Settings', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Material Name' },
      materialType: { tab: 'basic', order: 3, label: 'Type' },
      description: { tab: 'basic', order: 4, rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      properties: { tab: 'properties', order: 1, placeholder: 'Physical properties...' },
      appearance: { tab: 'properties', order: 2, rows: 3, placeholder: 'How does it look?' },
      durability: { tab: 'properties', order: 3 },
      weight: { tab: 'properties', order: 4 },
      rarity: { tab: 'properties', order: 5 },
      value: { tab: 'properties', order: 6, placeholder: 'Market value...' },
      
      source: { tab: 'production', order: 1, rows: 3, placeholder: 'Where does it come from?' },
      processing: { tab: 'production', order: 2, rows: 3, placeholder: 'How is it processed?' },
      uses: { tab: 'production', order: 3, placeholder: 'What is it used for?' },
    },
  }),

  militaryUnit: () => buildConfig(schemas.insertMilitaryUnitSchema, {
    title: 'Military Unit Designer',
    description: 'Create armed forces and tactical units',
    icon: 'Shield',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'structure', label: 'Structure & Equipment', icon: 'Users', order: 2 },
      { id: 'history', label: 'History & Status', icon: 'Book', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Unit Name' },
      unitType: { tab: 'basic', order: 3, label: 'Type' },
      description: { tab: 'basic', order: 4, rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      size: { tab: 'structure', order: 1, placeholder: 'Unit size (number of troops)' },
      composition: { tab: 'structure', order: 2, rows: 3, placeholder: 'What is the unit made up of?' },
      commander: { tab: 'structure', order: 3, endpoint: '/api/characters', multiple: false, placeholder: 'Who commands this unit?' },
      equipment: { tab: 'structure', order: 4, placeholder: 'Weapons and equipment...' },
      training: { tab: 'structure', order: 5, rows: 3, placeholder: 'How are they trained?' },
      specializations: { tab: 'structure', order: 6, placeholder: 'Special skills or tactics...' },
      
      history: { tab: 'history', order: 1, rows: 4, placeholder: 'Unit history and formation...' },
      battleRecord: { tab: 'history', order: 2, label: 'Battle Record', rows: 3, placeholder: 'Notable battles and campaigns...' },
      reputation: { tab: 'history', order: 3, rows: 3, placeholder: 'How are they perceived?' },
      morale: { tab: 'history', order: 4, placeholder: 'Current morale level' },
      currentStatus: { tab: 'history', order: 5, label: 'Current Status', placeholder: 'Where are they now?' },
    },
  }),

  transportation: () => buildConfig(schemas.insertTransportationSchema, {
    title: 'Transportation Designer',
    description: 'Create vehicles and travel methods',
    icon: 'Ship',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'specs', label: 'Specifications', icon: 'Settings', order: 2 },
      { id: 'usage', label: 'Operation & Usage', icon: 'Zap', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Vehicle/Transport Name' },
      transportType: { tab: 'basic', order: 3, label: 'Type' },
      description: { tab: 'basic', order: 4, rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      capacity: { tab: 'specs', order: 1, placeholder: 'How many people/cargo?' },
      speed: { tab: 'specs', order: 2, placeholder: 'How fast does it go?' },
      range: { tab: 'specs', order: 3, placeholder: 'Travel distance' },
      rarity: { tab: 'specs', order: 4 },
      cost: { tab: 'specs', order: 5, placeholder: 'How much does it cost?' },
      
      requirements: { tab: 'usage', order: 1, rows: 3, placeholder: 'What is needed to use this?' },
      operation: { tab: 'usage', order: 2, rows: 3, placeholder: 'How is it operated?' },
      construction: { tab: 'usage', order: 3, rows: 3, placeholder: 'How is it built?' },
      advantages: { tab: 'usage', order: 4, placeholder: 'Benefits of using this...' },
      disadvantages: { tab: 'usage', order: 5, placeholder: 'Drawbacks or limitations...' },
      culturalSignificance: { tab: 'usage', order: 6, label: 'Cultural Significance', rows: 3 },
    },
  }),

  naturalLaw: () => buildConfig(schemas.insertNaturalLawSchema, {
    title: 'Natural Law Designer',
    description: 'Create physical, magical, or divine laws',
    icon: 'Atom',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'principles', label: 'Principles', icon: 'BookOpen', order: 2 },
      { id: 'applications', label: 'Applications & Impact', icon: 'Lightbulb', order: 3 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Law Name' },
      lawType: { tab: 'basic', order: 3, label: 'Type' },
      description: { tab: 'basic', order: 4, rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      scope: { tab: 'principles', order: 1, rows: 3, placeholder: 'What does this law govern?' },
      principles: { tab: 'principles', order: 2, rows: 4, placeholder: 'Core principles and mechanics...' },
      exceptions: { tab: 'principles', order: 3, placeholder: 'Exceptions to the law...' },
      evidence: { tab: 'principles', order: 4, rows: 3, placeholder: 'How is this law proven?' },
      
      discovery: { tab: 'applications', order: 1, rows: 3, placeholder: 'How was this discovered?' },
      applications: { tab: 'applications', order: 2, placeholder: 'Practical applications...' },
      implications: { tab: 'applications', order: 3, rows: 3, placeholder: 'What are the consequences?' },
      relatedLaws: { tab: 'applications', order: 4, label: 'Related Laws', placeholder: 'Connected laws...' },
      understanding: { tab: 'applications', order: 5, rows: 3, placeholder: 'How well is it understood?' },
      controversies: { tab: 'applications', order: 6, rows: 3, placeholder: 'Debates or disputes...' },
    },
  }),

  resource: () => buildConfig(schemas.insertResourceSchema, {
    title: 'Resource Designer',
    description: 'Create natural, magical, or manufactured resources',
    icon: 'Gem',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'properties', label: 'Properties & Value', icon: 'Sparkles', order: 2 },
      { id: 'economics', label: 'Economics & Politics', icon: 'DollarSign', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Resource Name' },
      resourceType: { tab: 'basic', order: 2, label: 'Type' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      abundance: { tab: 'properties', order: 1, placeholder: 'How plentiful is it?' },
      location: { tab: 'properties', order: 2, rows: 3, placeholder: 'Where is it found?' },
      extractionMethod: { tab: 'properties', order: 3, label: 'Extraction Method', rows: 3, placeholder: 'How is it extracted?' },
      uses: { tab: 'properties', order: 4, placeholder: 'What is it used for?' },
      value: { tab: 'properties', order: 5, placeholder: 'Economic value' },
      rarity: { tab: 'properties', order: 6 },
      renewability: { tab: 'properties', order: 7, placeholder: 'Is it renewable?' },
      
      tradeCommodity: { tab: 'economics', order: 1, label: 'Trade Commodity', placeholder: 'Is it traded? How?' },
      controlledBy: { tab: 'economics', order: 2, label: 'Controlled By', placeholder: 'Who controls this resource?' },
      conflicts: { tab: 'economics', order: 3, rows: 3, placeholder: 'Conflicts over this resource...' },
    },
  }),

  animal: () => buildConfig(schemas.insertAnimalSchema, {
    title: 'Animal Designer',
    description: 'Create creatures and wildlife',
    icon: 'Bird',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'biology', label: 'Biology & Behavior', icon: 'Heart', order: 2 },
      { id: 'culture', label: 'Cultural Role', icon: 'Users', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Animal Name' },
      animalType: { tab: 'basic', order: 2, label: 'Type' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      habitat: { tab: 'biology', order: 1, rows: 3, placeholder: 'Where does it live?' },
      diet: { tab: 'biology', order: 2, placeholder: 'What does it eat?' },
      behavior: { tab: 'biology', order: 3, rows: 3, placeholder: 'How does it behave?' },
      physicalTraits: { tab: 'biology', order: 4, label: 'Physical Traits', rows: 3, placeholder: 'Physical characteristics...' },
      size: { tab: 'biology', order: 5, placeholder: 'How big is it?' },
      domestication: { tab: 'biology', order: 6, rows: 2, placeholder: 'Can it be domesticated?' },
      intelligence: { tab: 'biology', order: 7, placeholder: 'Intelligence level' },
      abilities: { tab: 'biology', order: 8, placeholder: 'Special abilities...' },
      lifecycle: { tab: 'biology', order: 9, rows: 3, placeholder: 'Life cycle and reproduction...' },
      
      culturalRole: { tab: 'culture', order: 1, label: 'Cultural Role', rows: 3, placeholder: 'Role in society and culture...' },
      threats: { tab: 'culture', order: 2, placeholder: 'Threats to this species...' },
    },
  }),

  plant: () => buildConfig(schemas.insertPlantSchema, {
    title: 'Plant Designer',
    description: 'Create flora and vegetation',
    icon: 'Leaf',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'botany', label: 'Botany & Habitat', icon: 'Sprout', order: 2 },
    ],
    fieldHints: {
      imageUrl: { tab: 'basic', order: 1 },
      name: { tab: 'basic', order: 2, label: 'Plant Name' },
      scientificName: { tab: 'basic', order: 3, label: 'Scientific Name' },
      type: { tab: 'basic', order: 4 },
      description: { tab: 'basic', order: 5, rows: 4 },
      genre: { tab: 'basic', order: 6 },
      
      characteristics: { tab: 'botany', order: 1, placeholder: 'Key characteristics...' },
      habitat: { tab: 'botany', order: 2, rows: 3, placeholder: 'Where does it grow?' },
      careInstructions: { tab: 'botany', order: 3, label: 'Care Instructions', rows: 3, placeholder: 'How to care for it...' },
      bloomingSeason: { tab: 'botany', order: 4, label: 'Blooming Season' },
      hardinessZone: { tab: 'botany', order: 5, label: 'Hardiness Zone', placeholder: 'Growing zones...' },
    },
  }),

  settlement: () => buildConfig(schemas.insertSettlementSchema, {
    title: 'Settlement Designer',
    description: 'Create cities, towns, and communities',
    icon: 'Building2',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'governance', label: 'Governance & Economy', icon: 'Landmark', order: 2 },
      { id: 'features', label: 'Features & Geography', icon: 'Map', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Settlement Name' },
      settlementType: { tab: 'basic', order: 2, label: 'Type' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      population: { tab: 'governance', order: 1, placeholder: 'Population size' },
      government: { tab: 'governance', order: 2, rows: 3, placeholder: 'How is it governed?' },
      economy: { tab: 'governance', order: 3, rows: 3, placeholder: 'Economic system and trade...' },
      culture: { tab: 'governance', order: 4, rows: 3, placeholder: 'Cultural characteristics...' },
      history: { tab: 'governance', order: 5, rows: 4, placeholder: 'Settlement history...' },
      
      geography: { tab: 'features', order: 1, rows: 3, placeholder: 'Geographical features...' },
      climate: { tab: 'features', order: 2, placeholder: 'Climate and weather' },
      defenses: { tab: 'features', order: 3, rows: 3, placeholder: 'Defenses and fortifications...' },
      resources: { tab: 'features', order: 4, placeholder: 'Available resources...' },
      threats: { tab: 'features', order: 5, placeholder: 'Threats and dangers...' },
      landmarks: { tab: 'features', order: 6, placeholder: 'Notable landmarks...' },
      districts: { tab: 'features', order: 7, placeholder: 'Districts and neighborhoods...' },
    },
  }),

  society: () => buildConfig(schemas.insertSocietySchema, {
    title: 'Society Designer',
    description: 'Create social structures and civilizations',
    icon: 'Users',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'structure', label: 'Structure & Culture', icon: 'Network', order: 2 },
      { id: 'institutions', label: 'Institutions', icon: 'Building', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Society Name' },
      societyType: { tab: 'basic', order: 2, label: 'Type' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      structure: { tab: 'structure', order: 1, rows: 3, placeholder: 'Social structure and hierarchy...' },
      leadership: { tab: 'structure', order: 2, rows: 3, placeholder: 'Leadership and power structure...' },
      laws: { tab: 'structure', order: 3, rows: 3, placeholder: 'Legal system...' },
      values: { tab: 'structure', order: 4, placeholder: 'Core values...' },
      customs: { tab: 'structure', order: 5, placeholder: 'Customs and traditions...' },
      history: { tab: 'structure', order: 6, rows: 4, placeholder: 'Society history...' },
      
      economy: { tab: 'institutions', order: 1, rows: 3, placeholder: 'Economic system...' },
      technology: { tab: 'institutions', order: 2, rows: 3, placeholder: 'Technology level...' },
      education: { tab: 'institutions', order: 3, rows: 3, placeholder: 'Education system...' },
      military: { tab: 'institutions', order: 4, rows: 3, placeholder: 'Military organization...' },
      religion: { tab: 'institutions', order: 5, rows: 3, placeholder: 'Religious institutions...' },
      arts: { tab: 'institutions', order: 6, rows: 3, placeholder: 'Arts and culture...' },
    },
  }),

  technology: () => buildConfig(schemas.insertTechnologySchema, {
    title: 'Technology Designer',
    description: 'Create innovations and inventions',
    icon: 'Cpu',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'mechanics', label: 'Mechanics & Function', icon: 'Cog', order: 2 },
      { id: 'development', label: 'Development & Impact', icon: 'TrendingUp', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Technology Name' },
      technologyType: { tab: 'basic', order: 2, label: 'Type' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      function: { tab: 'mechanics', order: 1, rows: 3, placeholder: 'What does it do?' },
      principles: { tab: 'mechanics', order: 2, rows: 3, placeholder: 'How does it work?' },
      requirements: { tab: 'mechanics', order: 3, placeholder: 'Requirements to use...' },
      limitations: { tab: 'mechanics', order: 4, placeholder: 'Limitations and constraints...' },
      applications: { tab: 'mechanics', order: 5, placeholder: 'Practical applications...' },
      rarity: { tab: 'mechanics', order: 6 },
      risks: { tab: 'mechanics', order: 7, rows: 3, placeholder: 'Risks and dangers...' },
      
      development: { tab: 'development', order: 1, rows: 3, placeholder: 'How was it developed?' },
      inventors: { tab: 'development', order: 2, placeholder: 'Who invented it?' },
      evolution: { tab: 'development', order: 3, rows: 3, placeholder: 'How has it evolved?' },
    },
  }),

  event: () => buildConfig(schemas.insertEventSchema, {
    title: 'Event Designer',
    description: 'Create historical events and occurrences',
    icon: 'Calendar',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'details', label: 'Event Details', icon: 'Info', order: 2 },
      { id: 'impact', label: 'Impact & Legacy', icon: 'Sparkles', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Event Name' },
      eventType: { tab: 'basic', order: 2, label: 'Type' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      date: { tab: 'details', order: 1, placeholder: 'When did it occur?' },
      location: { tab: 'details', order: 2, placeholder: 'Where did it happen?' },
      participants: { tab: 'details', order: 3, placeholder: 'Who was involved?' },
      duration: { tab: 'details', order: 4, placeholder: 'How long did it last?' },
      scale: { tab: 'details', order: 5, placeholder: 'Scale of the event' },
      causes: { tab: 'details', order: 6, rows: 3, placeholder: 'What caused it?' },
      
      consequences: { tab: 'impact', order: 1, rows: 3, placeholder: 'What were the results?' },
      significance: { tab: 'impact', order: 2, rows: 3, placeholder: 'Why is it important?' },
      legacy: { tab: 'impact', order: 3, rows: 3, placeholder: 'Lasting impact...' },
      documentation: { tab: 'impact', order: 4, rows: 3, placeholder: 'How is it documented?' },
      conflictingAccounts: { tab: 'impact', order: 5, label: 'Conflicting Accounts', rows: 3, placeholder: 'Different versions of the story...' },
    },
  }),

  religion: () => buildConfig(schemas.insertReligionSchema, {
    title: 'Religion Designer',
    description: 'Create belief systems and faiths',
    icon: 'Church',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'beliefs', label: 'Beliefs & Practices', icon: 'BookOpen', order: 2 },
      { id: 'organization', label: 'Organization & Influence', icon: 'Users', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Religion Name' },
      description: { tab: 'basic', order: 2, rows: 4 },
      genre: { tab: 'basic', order: 3 },
      
      beliefs: { tab: 'beliefs', order: 1, placeholder: 'Core beliefs and tenets...' },
      practices: { tab: 'beliefs', order: 2, placeholder: 'Religious practices and rituals...' },
      deities: { tab: 'beliefs', order: 3, placeholder: 'Gods, goddesses, or divine beings...' },
      morality: { tab: 'beliefs', order: 4, rows: 3, placeholder: 'Moral code and ethics...' },
      afterlife: { tab: 'beliefs', order: 5, rows: 3, placeholder: 'Views on afterlife...' },
      scriptures: { tab: 'beliefs', order: 6, rows: 3, placeholder: 'Sacred texts and writings...' },
      ceremonies: { tab: 'beliefs', order: 7, placeholder: 'Ceremonies and celebrations...' },
      symbols: { tab: 'beliefs', order: 8, placeholder: 'Religious symbols...' },
      
      hierarchy: { tab: 'organization', order: 1, rows: 3, placeholder: 'Religious hierarchy and structure...' },
      followers: { tab: 'organization', order: 2, placeholder: 'Who follows this religion?' },
      influence: { tab: 'organization', order: 3, rows: 3, placeholder: 'Influence on society...' },
      history: { tab: 'organization', order: 4, rows: 4, placeholder: 'Religious history...' },
    },
  }),

  language: () => buildConfig(schemas.insertLanguageSchema, {
    title: 'Language Designer',
    description: 'Create languages and communication systems',
    icon: 'Languages',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'linguistics', label: 'Linguistics', icon: 'Book', order: 2 },
      { id: 'culture', label: 'Cultural Context', icon: 'Globe', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Language Name' },
      family: { tab: 'basic', order: 2, placeholder: 'Language family' },
      status: { tab: 'basic', order: 3, placeholder: 'Living, dead, constructed, etc.' },
      speakers: { tab: 'basic', order: 4, placeholder: 'Number of speakers' },
      regions: { tab: 'basic', order: 5, placeholder: 'Regions where spoken...' },
      genre: { tab: 'basic', order: 6 },
      
      phonology: { tab: 'linguistics', order: 1, rows: 3, placeholder: 'Sound system...' },
      grammar: { tab: 'linguistics', order: 2, rows: 3, placeholder: 'Grammatical structure...' },
      vocabulary: { tab: 'linguistics', order: 3, rows: 3, placeholder: 'Vocabulary and word formation...' },
      writingSystem: { tab: 'linguistics', order: 4, label: 'Writing System', rows: 3, placeholder: 'Writing system...' },
      commonPhrases: { tab: 'linguistics', order: 5, label: 'Common Phrases', placeholder: 'Common phrases and expressions...' },
      variations: { tab: 'linguistics', order: 6, placeholder: 'Dialects and variations...' },
      difficulty: { tab: 'linguistics', order: 7, placeholder: 'Learning difficulty' },
      
      culturalContext: { tab: 'culture', order: 1, label: 'Cultural Context', rows: 3, placeholder: 'Cultural significance...' },
      history: { tab: 'culture', order: 2, rows: 4, placeholder: 'Language history and evolution...' },
    },
  }),

  faction: () => buildConfig(schemas.insertFactionSchema, {
    title: 'Faction Designer',
    description: 'Create organizations and groups',
    icon: 'Flag',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'identity', label: 'Identity & Goals', icon: 'Target', order: 2 },
      { id: 'power', label: 'Power & Relations', icon: 'Swords', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Faction Name' },
      factionType: { tab: 'basic', order: 2, label: 'Type' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      goals: { tab: 'identity', order: 1, rows: 3, placeholder: 'What are their goals?' },
      ideology: { tab: 'identity', order: 2, rows: 3, placeholder: 'Ideology and beliefs...' },
      leadership: { tab: 'identity', order: 3, rows: 3, placeholder: 'Leadership structure...' },
      members: { tab: 'identity', order: 4, placeholder: 'Who are the members?' },
      methods: { tab: 'identity', order: 5, rows: 3, placeholder: 'Methods and tactics...' },
      secrets: { tab: 'identity', order: 6, rows: 3, placeholder: 'Hidden agendas and secrets...' },
      
      resources: { tab: 'power', order: 1, rows: 3, placeholder: 'Available resources...' },
      territory: { tab: 'power', order: 2, rows: 3, placeholder: 'Controlled territory...' },
      influence: { tab: 'power', order: 3, rows: 3, placeholder: 'Sphere of influence...' },
      allies: { tab: 'power', order: 4, placeholder: 'Allied factions...' },
      enemies: { tab: 'power', order: 5, placeholder: 'Enemy factions...' },
      history: { tab: 'power', order: 6, rows: 4, placeholder: 'Faction history...' },
    },
  }),

  weapon: () => buildConfig(schemas.insertWeaponSchema, {
    title: 'Weapon Designer',
    description: 'Create weapons and armaments',
    icon: 'Sword',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'properties', label: 'Properties & Stats', icon: 'Zap', order: 2 },
      { id: 'lore', label: 'Lore & History', icon: 'BookOpen', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Weapon Name' },
      weaponType: { tab: 'basic', order: 2, label: 'Type', placeholder: 'Sword, bow, staff, etc.' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      damage: { tab: 'properties', order: 1, placeholder: 'Damage rating' },
      range: { tab: 'properties', order: 2, placeholder: 'Range or reach' },
      weight: { tab: 'properties', order: 3, placeholder: 'Weight' },
      materials: { tab: 'properties', order: 4, placeholder: 'Materials used...' },
      craftsmanship: { tab: 'properties', order: 5, rows: 3, placeholder: 'Quality and craftsmanship...' },
      enchantments: { tab: 'properties', order: 6, placeholder: 'Magical enhancements...' },
      rarity: { tab: 'properties', order: 7, placeholder: 'Common, rare, legendary, etc.' },
      value: { tab: 'properties', order: 8, placeholder: 'Monetary value' },
      requirements: { tab: 'properties', order: 9, rows: 2, placeholder: 'Requirements to use...' },
      maintenance: { tab: 'properties', order: 10, rows: 2, placeholder: 'Maintenance needs...' },
      
      history: { tab: 'lore', order: 1, rows: 4, placeholder: 'History and origin...' },
      imageUrl: { tab: 'basic', order: 1, label: 'Image URL' },
      imageCaption: { tab: 'lore', order: 3, label: 'Image Caption' },
      articleContent: { tab: 'lore', order: 4, label: 'Article Content', rows: 6, placeholder: 'Rich content for article format...' },
    },
  }),

  building: () => buildConfig(schemas.insertBuildingSchema, {
    title: 'Building Designer',
    description: 'Create buildings and structures',
    icon: 'Building',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'details', label: 'Structure Details', icon: 'Home', order: 2 },
      { id: 'significance', label: 'Significance & Secrets', icon: 'Key', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Building Name' },
      buildingType: { tab: 'basic', order: 2, label: 'Type', placeholder: 'Temple, castle, shop, house, etc.' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      architecture: { tab: 'details', order: 1, rows: 3, placeholder: 'Architectural style...' },
      materials: { tab: 'details', order: 2, placeholder: 'Building materials...' },
      purpose: { tab: 'details', order: 3, rows: 2, placeholder: 'Purpose and function...' },
      capacity: { tab: 'details', order: 4, placeholder: 'Capacity' },
      defenses: { tab: 'details', order: 5, rows: 2, placeholder: 'Defensive features...' },
      currentCondition: { tab: 'details', order: 6, label: 'Current Condition', rows: 2, placeholder: 'State of repair...' },
      location: { tab: 'details', order: 7, placeholder: 'Location' },
      owner: { tab: 'details', order: 8, placeholder: 'Owner' },
      
      history: { tab: 'significance', order: 1, rows: 4, placeholder: 'Building history...' },
      significance: { tab: 'significance', order: 2, rows: 3, placeholder: 'Cultural or historical significance...' },
      secrets: { tab: 'significance', order: 3, rows: 3, placeholder: 'Hidden secrets...' },
    },
  }),

  creature: () => buildConfig(schemas.insertCreatureSchema, {
    title: 'Creature Designer',
    description: 'Create creatures and beings',
    icon: 'Bug',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'biology', label: 'Biology & Behavior', icon: 'Eye', order: 2 },
      { id: 'lore', label: 'Lore & Significance', icon: 'Scroll', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Creature Name' },
      creatureType: { tab: 'basic', order: 2, label: 'Type' },
      habitat: { tab: 'basic', order: 3, placeholder: 'Where does it live?' },
      physicalDescription: { tab: 'basic', order: 4, label: 'Physical Description', rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      abilities: { tab: 'biology', order: 1, placeholder: 'Special abilities...' },
      behavior: { tab: 'biology', order: 2, rows: 4, placeholder: 'Behavior patterns...' },
      
      culturalSignificance: { tab: 'lore', order: 1, label: 'Cultural Significance', rows: 4, placeholder: 'Significance in culture...' },
      imageUrl: { tab: 'basic', order: 1, label: 'Image URL' },
      imageCaption: { tab: 'lore', order: 3, label: 'Image Caption' },
      articleContent: { tab: 'lore', order: 4, label: 'Article Content', rows: 6, placeholder: 'Rich content for article format...' },
    },
  }),

  item: () => buildConfig(schemas.insertItemSchema, {
    title: 'Item Designer',
    description: 'Create items and objects',
    icon: 'Package',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'properties', label: 'Properties & Crafting', icon: 'Sparkles', order: 2 },
      { id: 'lore', label: 'Lore & History', icon: 'BookOpen', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Item Name' },
      itemType: { tab: 'basic', order: 2, label: 'Type', placeholder: 'Weapon, armor, tool, magic, etc.' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      rarity: { tab: 'properties', order: 1, placeholder: 'Rarity level' },
      value: { tab: 'properties', order: 2, placeholder: 'Value' },
      weight: { tab: 'properties', order: 3, placeholder: 'Weight' },
      properties: { tab: 'properties', order: 4, placeholder: 'Special properties...' },
      materials: { tab: 'properties', order: 5, placeholder: 'Materials...' },
      abilities: { tab: 'properties', order: 6, placeholder: 'Special abilities...' },
      requirements: { tab: 'properties', order: 7, rows: 2, placeholder: 'Requirements to use...' },
      crafting: { tab: 'properties', order: 8, rows: 3, placeholder: 'How it\'s crafted...' },
      
      history: { tab: 'lore', order: 1, rows: 4, placeholder: 'Item history...' },
      imageUrl: { tab: 'basic', order: 1, label: 'Image URL' },
      imageCaption: { tab: 'lore', order: 3, label: 'Image Caption' },
      articleContent: { tab: 'lore', order: 4, label: 'Article Content', rows: 6, placeholder: 'Rich content for article format...' },
    },
  }),

  location: () => buildConfig(schemas.insertLocationSchema, {
    title: 'Location Designer',
    description: 'Create locations and places',
    icon: 'MapPin',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'details', label: 'Details & Features', icon: 'Mountain', order: 2 },
      { id: 'society', label: 'Society & History', icon: 'Users', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Location Name' },
      locationType: { tab: 'basic', order: 2, label: 'Type', placeholder: 'City, forest, dungeon, etc.' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      geography: { tab: 'details', order: 1, rows: 3, placeholder: 'Geographic features...' },
      climate: { tab: 'details', order: 2, rows: 2, placeholder: 'Climate and weather...' },
      notableFeatures: { tab: 'details', order: 3, placeholder: 'Notable features...' },
      landmarks: { tab: 'details', order: 4, placeholder: 'Key landmarks...' },
      resources: { tab: 'details', order: 5, placeholder: 'Available resources...' },
      threats: { tab: 'details', order: 6, placeholder: 'Dangers and threats...' },
      
      population: { tab: 'society', order: 1, placeholder: 'Population size' },
      government: { tab: 'society', order: 2, rows: 2, placeholder: 'Government type...' },
      economy: { tab: 'society', order: 3, rows: 2, placeholder: 'Economic system...' },
      culture: { tab: 'society', order: 4, rows: 3, placeholder: 'Cultural aspects...' },
      history: { tab: 'society', order: 5, rows: 4, placeholder: 'Historical background...' },
      imageUrl: { tab: 'basic', order: 1, label: 'Image URL' },
      imageCaption: { tab: 'society', order: 7, label: 'Image Caption' },
      articleContent: { tab: 'society', order: 8, label: 'Article Content', rows: 6, placeholder: 'Rich content for article format...' },
    },
  }),

  organization: () => buildConfig(schemas.insertOrganizationSchema, {
    title: 'Organization Designer',
    description: 'Create organizations and groups',
    icon: 'Building2',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'structure', label: 'Structure & Members', icon: 'Network', order: 2 },
      { id: 'influence', label: 'Influence & Relations', icon: 'Globe', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Organization Name' },
      organizationType: { tab: 'basic', order: 2, label: 'Type', placeholder: 'Guild, faction, government, etc.' },
      purpose: { tab: 'basic', order: 3, rows: 2 },
      description: { tab: 'basic', order: 4, rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      structure: { tab: 'structure', order: 1, rows: 3, placeholder: 'Organizational structure...' },
      leadership: { tab: 'structure', order: 2, rows: 3, placeholder: 'Leadership hierarchy...' },
      members: { tab: 'structure', order: 3, rows: 3, placeholder: 'Member information...' },
      headquarters: { tab: 'structure', order: 4, placeholder: 'Headquarters location' },
      
      influence: { tab: 'influence', order: 1, rows: 3, placeholder: 'Sphere of influence...' },
      resources: { tab: 'influence', order: 2, rows: 2, placeholder: 'Available resources...' },
      goals: { tab: 'influence', order: 3, rows: 3, placeholder: 'Goals and objectives...' },
      allies: { tab: 'influence', order: 4, placeholder: 'Allied organizations...' },
      enemies: { tab: 'influence', order: 5, placeholder: 'Enemy organizations...' },
      history: { tab: 'influence', order: 6, rows: 4, placeholder: 'Organizational history...' },
      imageUrl: { tab: 'basic', order: 1, label: 'Image URL' },
      imageCaption: { tab: 'influence', order: 8, label: 'Image Caption' },
      articleContent: { tab: 'influence', order: 9, label: 'Article Content', rows: 6, placeholder: 'Rich content for article format...' },
    },
  }),

  conflict: () => buildConfig(schemas.insertConflictSchema, {
    title: 'Conflict Designer',
    description: 'Create conflicts and tensions',
    icon: 'Zap',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'details', label: 'Conflict Details', icon: 'AlertCircle', order: 2 },
    ],
    fieldHints: {
      title: { tab: 'basic', order: 2 },
      type: { tab: 'basic', order: 2, placeholder: 'Internal, external, interpersonal, etc.' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      stakes: { tab: 'details', order: 1, rows: 3, placeholder: 'What\'s at stake?' },
      obstacles: { tab: 'details', order: 2, placeholder: 'Obstacles to overcome...' },
      potentialResolutions: { tab: 'details', order: 3, label: 'Potential Resolutions', placeholder: 'Possible resolutions...' },
      emotionalImpact: { tab: 'details', order: 4, label: 'Emotional Impact', rows: 3, placeholder: 'Emotional impact on characters...' },
      imageUrl: { tab: 'basic', order: 1, label: 'Image URL' },
      imageCaption: { tab: 'details', order: 6, label: 'Image Caption' },
      articleContent: { tab: 'details', order: 7, label: 'Article Content', rows: 6, placeholder: 'Rich content for article format...' },
    },
  }),

  theme: () => buildConfig(schemas.insertThemeSchema, {
    title: 'Theme Designer',
    description: 'Create themes and messages',
    icon: 'Lightbulb',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'elements', label: 'Elements & Examples', icon: 'Sparkles', order: 2 },
    ],
    fieldHints: {
      title: { tab: 'basic', order: 2 },
      description: { tab: 'basic', order: 2, rows: 4 },
      coreMessage: { tab: 'basic', order: 3, label: 'Core Message', rows: 3, placeholder: 'Central message or idea...' },
      genre: { tab: 'basic', order: 4 },
      
      symbolicElements: { tab: 'elements', order: 1, label: 'Symbolic Elements', placeholder: 'Symbolic elements...' },
      questions: { tab: 'elements', order: 2, placeholder: 'Questions raised...' },
      conflicts: { tab: 'elements', order: 3, placeholder: 'Related conflicts...' },
      examples: { tab: 'elements', order: 4, placeholder: 'Examples in story...' },
      imageUrl: { tab: 'basic', order: 1, label: 'Image URL' },
      imageCaption: { tab: 'elements', order: 6, label: 'Image Caption' },
      articleContent: { tab: 'elements', order: 7, label: 'Article Content', rows: 6, placeholder: 'Rich content for article format...' },
    },
  }),

  mood: () => buildConfig(schemas.insertMoodSchema, {
    title: 'Mood Designer',
    description: 'Create moods and atmospheres',
    icon: 'CloudRain',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'sensory', label: 'Sensory Details', icon: 'Eye', order: 2 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Mood Name' },
      description: { tab: 'basic', order: 2, rows: 4 },
      emotionalTone: { tab: 'basic', order: 3, label: 'Emotional Tone', rows: 3, placeholder: 'Emotional tone and feeling...' },
      
      sensoryDetails: { tab: 'sensory', order: 1, label: 'Sensory Details', placeholder: 'Sensory details...' },
      colorAssociations: { tab: 'sensory', order: 2, label: 'Color Associations', placeholder: 'Associated colors...' },
      weatherElements: { tab: 'sensory', order: 3, label: 'Weather Elements', placeholder: 'Weather elements...' },
      lightingEffects: { tab: 'sensory', order: 4, label: 'Lighting Effects', placeholder: 'Lighting effects...' },
      soundscape: { tab: 'sensory', order: 5, placeholder: 'Sounds and ambient noise...' },
    },
  }),

  description: () => buildConfig(schemas.insertDescriptionSchema, {
    title: 'Description Generator',
    description: 'Generate vivid descriptions',
    icon: 'FileText',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Details', icon: 'FileText', order: 1 },
    ],
    fieldHints: {
      title: { tab: 'basic', order: 2 },
      content: { tab: 'basic', order: 2, rows: 8 },
      descriptionType: { tab: 'basic', order: 3, label: 'Type', placeholder: 'Armor, weapon, clothing, etc.' },
      genre: { tab: 'basic', order: 4 },
      tags: { tab: 'basic', order: 5 },
    },
  }),

  name: () => buildConfig(schemas.insertNameSchema, {
    title: 'Name Generator',
    description: 'Generate unique names',
    icon: 'User',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Name Details', icon: 'FileText', order: 1 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2 },
      meaning: { tab: 'basic', order: 2, rows: 2, placeholder: 'What does the name mean?' },
      origin: { tab: 'basic', order: 3, rows: 2, placeholder: 'Origin of the name' },
      nameType: { tab: 'basic', order: 4, label: 'Type', placeholder: 'Character, place, fantasy, etc.' },
      culture: { tab: 'basic', order: 5, placeholder: 'Cultural background' },
    },
  }),

  map: () => buildConfig(schemas.insertMapSchema, {
    title: 'Map Designer',
    description: 'Create maps and cartography',
    icon: 'Map',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'geography', label: 'Geography', icon: 'Mountain', order: 2 },
      { id: 'features', label: 'Features & Details', icon: 'MapPin', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Map Name' },
      mapType: { tab: 'basic', order: 2, label: 'Type', placeholder: 'World, regional, city, dungeon, political, etc.' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      scale: { tab: 'geography', order: 1, placeholder: 'Global, continental, regional, local, etc.' },
      dimensions: { tab: 'geography', order: 2, placeholder: 'Map dimensions' },
      terrain: { tab: 'geography', order: 3, placeholder: 'Terrain types...' },
      climate: { tab: 'geography', order: 4, rows: 2, placeholder: 'Climate zones...' },
      
      keyLocations: { tab: 'features', order: 1, label: 'Key Locations', placeholder: 'Important locations...' },
      landmarks: { tab: 'features', order: 2, placeholder: 'Notable landmarks...' },
      politicalBoundaries: { tab: 'features', order: 3, label: 'Political Boundaries', placeholder: 'Political boundaries...' },
      traderoutes: { tab: 'features', order: 4, label: 'Trade Routes', placeholder: 'Trade routes...' },
      dangerZones: { tab: 'features', order: 5, label: 'Danger Zones', placeholder: 'Dangerous areas...' },
      resources: { tab: 'features', order: 6, placeholder: 'Available resources...' },
      hiddenFeatures: { tab: 'features', order: 7, label: 'Hidden Features', placeholder: 'Secret or hidden features...' },
      legends: { tab: 'features', order: 8, placeholder: 'Map legends and symbols...' },
      mapMaker: { tab: 'features', order: 9, label: 'Map Maker', placeholder: 'Who created this map?' },
      accuracy: { tab: 'features', order: 10, placeholder: 'Precise, rough, outdated, etc.' },
    },
  }),

  setting: () => buildConfig(schemas.insertSettingSchema, {
    title: 'Setting Generator',
    description: 'Create settings and environments',
    icon: 'Globe',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'details', label: 'Details & Atmosphere', icon: 'Cloud', order: 2 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Setting Name' },
      location: { tab: 'basic', order: 2 },
      timePeriod: { tab: 'basic', order: 3, label: 'Time Period' },
      settingType: { tab: 'basic', order: 4, label: 'Type' },
      description: { tab: 'basic', order: 5, rows: 4 },
      genre: { tab: 'basic', order: 6 },
      
      population: { tab: 'details', order: 1 },
      climate: { tab: 'details', order: 2, rows: 2 },
      atmosphere: { tab: 'details', order: 3, rows: 3 },
      culturalElements: { tab: 'details', order: 4, label: 'Cultural Elements', placeholder: 'Cultural aspects...' },
      notableFeatures: { tab: 'details', order: 5, label: 'Notable Features', placeholder: 'Notable features...' },
      imageUrl: { tab: 'basic', order: 1, label: 'Image URL' },
      imageCaption: { tab: 'details', order: 7, label: 'Image Caption' },
      articleContent: { tab: 'details', order: 8, label: 'Article Content', rows: 6, placeholder: 'Rich content for article format...' },
    },
  }),

  armor: () => buildConfig(schemas.insertArmorSchema, {
    title: 'Armor Designer',
    description: 'Create armor and protective gear',
    icon: 'Shield',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'properties', label: 'Properties & Stats', icon: 'Shield', order: 2 },
      { id: 'lore', label: 'Lore & History', icon: 'BookOpen', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Armor Name' },
      armorType: { tab: 'basic', order: 2, label: 'Type', placeholder: 'Light, medium, heavy, shield, etc.' },
      description: { tab: 'basic', order: 3, rows: 4 },
      genre: { tab: 'basic', order: 4 },
      
      protection: { tab: 'properties', order: 1, rows: 2, placeholder: 'Protection level...' },
      weight: { tab: 'properties', order: 2, placeholder: 'Weight' },
      materials: { tab: 'properties', order: 3, placeholder: 'Materials used...' },
      coverage: { tab: 'properties', order: 4, rows: 2, placeholder: 'Body coverage...' },
      mobility: { tab: 'properties', order: 5, rows: 2, placeholder: 'Impact on mobility...' },
      enchantments: { tab: 'properties', order: 6, placeholder: 'Magical enhancements...' },
      craftsmanship: { tab: 'properties', order: 7, rows: 2, placeholder: 'Quality and craftsmanship...' },
      rarity: { tab: 'properties', order: 8, placeholder: 'Rarity level' },
      value: { tab: 'properties', order: 9, placeholder: 'Monetary value' },
      maintenance: { tab: 'properties', order: 10, rows: 2, placeholder: 'Maintenance needs...' },
      
      history: { tab: 'lore', order: 1, rows: 4, placeholder: 'History and origin...' },
    },
  }),

  spell: () => buildConfig(schemas.insertSpellSchema, {
    title: 'Spell Designer',
    description: 'Create spells and magic',
    icon: 'Wand2',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'mechanics', label: 'Spell Mechanics', icon: 'Sparkles', order: 2 },
      { id: 'lore', label: 'Lore & Variations', icon: 'BookOpen', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Spell Name' },
      school: { tab: 'basic', order: 2, placeholder: 'Evocation, divination, etc.' },
      level: { tab: 'basic', order: 3, placeholder: 'Spell level' },
      description: { tab: 'basic', order: 4, rows: 4 },
      genre: { tab: 'basic', order: 5 },
      
      components: { tab: 'mechanics', order: 1, placeholder: 'Spell components...' },
      castingTime: { tab: 'mechanics', order: 2, label: 'Casting Time' },
      range: { tab: 'mechanics', order: 3 },
      duration: { tab: 'mechanics', order: 4 },
      effect: { tab: 'mechanics', order: 5, rows: 3, placeholder: 'Spell effects...' },
      limitations: { tab: 'mechanics', order: 6, rows: 2, placeholder: 'Limitations and restrictions...' },
      rarity: { tab: 'mechanics', order: 7, placeholder: 'Spell rarity' },
      
      origin: { tab: 'lore', order: 1, rows: 3, placeholder: 'Origin of the spell...' },
      variations: { tab: 'lore', order: 2, placeholder: 'Spell variations...' },
      risks: { tab: 'lore', order: 3, rows: 3, placeholder: 'Risks and dangers...' },
    },
  }),

  plot: () => buildConfig(schemas.insertPlotSchema, {
    title: 'Plot Structure Generator',
    description: 'Create plot structures and story arcs',
    icon: 'Network',
    defaultTab: 'structure',
    tabs: [
      { id: 'structure', label: 'Story Structure', icon: 'GitBranch', order: 1 },
      { id: 'elements', label: 'Story Elements', icon: 'Sparkles', order: 2 },
    ],
    fieldHints: {
      setup: { tab: 'structure', order: 1, rows: 3 },
      incitingIncident: { tab: 'structure', order: 2, label: 'Inciting Incident', rows: 3 },
      firstPlotPoint: { tab: 'structure', order: 3, label: 'First Plot Point', rows: 3 },
      midpoint: { tab: 'structure', order: 4, rows: 3 },
      secondPlotPoint: { tab: 'structure', order: 5, label: 'Second Plot Point', rows: 3 },
      climax: { tab: 'structure', order: 6, rows: 3 },
      resolution: { tab: 'structure', order: 7, rows: 3 },
      
      theme: { tab: 'elements', order: 1, rows: 2 },
      conflict: { tab: 'elements', order: 2, rows: 3 },
      genre: { tab: 'elements', order: 3 },
      storyStructure: { tab: 'elements', order: 4, label: 'Story Structure', placeholder: 'Three-act, hero\'s journey, etc.' },
    },
  }),

  familyTree: () => buildConfig(schemas.insertFamilyTreeSchema, {
    title: 'Family Tree Designer',
    description: 'Create family trees and genealogy',
    icon: 'Users',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Tree Details', icon: 'FileText', order: 1 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Family Tree Name' },
      description: { tab: 'basic', order: 2, rows: 4 },
      layoutMode: { tab: 'basic', order: 3, label: 'Layout Mode', placeholder: 'Auto or manual' },
      zoom: { tab: 'basic', order: 4, placeholder: 'Zoom level (default: 1)' },
      panX: { tab: 'basic', order: 5, label: 'Pan X', placeholder: 'Horizontal pan position' },
      panY: { tab: 'basic', order: 6, label: 'Pan Y', placeholder: 'Vertical pan position' },
    },
  }),

  timeline: () => buildConfig(schemas.insertTimelineSchema, {
    title: 'Timeline Designer',
    description: 'Create timelines and chronologies',
    icon: 'Calendar',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Basic Info', icon: 'FileText', order: 1 },
      { id: 'events', label: 'Events & Periods', icon: 'Clock', order: 2 },
      { id: 'changes', label: 'Changes & Advances', icon: 'TrendingUp', order: 3 },
    ],
    fieldHints: {
      name: { tab: 'basic', order: 2, label: 'Timeline Name' },
      description: { tab: 'basic', order: 2, rows: 4 },
      timelineType: { tab: 'basic', order: 3, label: 'Type', placeholder: 'Historical, character, world, campaign, etc.' },
      timeScale: { tab: 'basic', order: 4, label: 'Time Scale', placeholder: 'Years, decades, centuries, millennia, etc.' },
      scope: { tab: 'basic', order: 5, placeholder: 'Global, regional, local, personal, etc.' },
      genre: { tab: 'basic', order: 6 },
      
      startDate: { tab: 'events', order: 1, label: 'Start Date' },
      endDate: { tab: 'events', order: 2, label: 'End Date' },
      majorEvents: { tab: 'events', order: 3, label: 'Major Events', placeholder: 'Key events...' },
      keyFigures: { tab: 'events', order: 4, label: 'Key Figures', placeholder: 'Important figures...' },
      culturalPeriods: { tab: 'events', order: 5, label: 'Cultural Periods', placeholder: 'Cultural periods...' },
      wars: { tab: 'events', order: 6, placeholder: 'Wars and conflicts...' },
      naturalDisasters: { tab: 'events', order: 7, label: 'Natural Disasters', placeholder: 'Natural disasters...' },
      
      discoveries: { tab: 'changes', order: 1, placeholder: 'Major discoveries...' },
      politicalChanges: { tab: 'changes', order: 2, label: 'Political Changes', placeholder: 'Political changes...' },
      technologicalAdvances: { tab: 'changes', order: 3, label: 'Technological Advances', placeholder: 'Technological advances...' },
    },
  }),

  prompt: () => buildConfig(schemas.insertPromptSchema, {
    title: 'Writing Prompt Generator',
    description: 'Generate writing prompts',
    icon: 'FileEdit',
    defaultTab: 'basic',
    tabs: [
      { id: 'basic', label: 'Prompt Details', icon: 'FileText', order: 1 },
    ],
    fieldHints: {
      text: { tab: 'basic', order: 2, rows: 6 },
      genre: { tab: 'basic', order: 2 },
      difficulty: { tab: 'basic', order: 3 },
      type: { tab: 'basic', order: 4 },
      wordCount: { tab: 'basic', order: 5, label: 'Word Count' },
      tags: { tab: 'basic', order: 6 },
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
