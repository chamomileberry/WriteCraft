import { Router } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { storage } from '../storage';
import { z } from 'zod';
import { insertImportJobSchema } from '@shared/schema';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
});

// World Anvil content type mapping to WriteCraft types
const WORLD_ANVIL_TYPE_MAPPING: { [key: string]: string } = {
  'character': 'character',
  'person': 'character',
  'location': 'location',
  'geography': 'location',
  'landmark': 'location',
  'settlement': 'settlement',
  'building': 'building',
  'organization': 'organization',
  'ethnicity': 'ethnicity',
  'species': 'species',
  'race': 'species',
  'item': 'item',
  'vehicle': 'transportation',
  'document': 'document',
  'language': 'language',
  'religion': 'religion',
  'tradition': 'tradition',
  'ritual': 'ritual',
  'military': 'militaryunit',
  'myth': 'myth',
  'legend': 'legend',
  'condition': 'condition',
  'material': 'material',
  'technology': 'technology',
  'spell': 'spell',
  'law': 'law',
  'plot': 'plot',
  'event': 'event',
  'timeline': 'timeline',
  'prose': 'document',
  'article': 'document',
  'profession': 'profession',
  'rank': 'rank',
  'transportation': 'transportation',
};

interface WorldAnvilArticle {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  category?: any; // Category is an object with id, title, etc.
  templateType?: string;
  entityClass?: string;
  state?: string;
  tags?: string | string[];
  [key: string]: any;
}

// Parse World Anvil export and map to WriteCraft structure
function parseWorldAnvilExport(zipBuffer: Buffer) {
  try {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    console.log(`[ZIP Parse] ZIP contains ${zipEntries.length} total entries`);
    console.log('[ZIP Parse] Entry structure:');
    const entrySample = zipEntries.slice(0, 10).map(e => e.entryName);
    console.log('[ZIP Parse] First 10 entries:', entrySample);

    let manifestData: any = null;
    const articles: WorldAnvilArticle[] = [];

    // Find and parse manifest.json
    const manifestEntry = zipEntries.find(entry => entry.entryName.endsWith('manifest.json'));
    if (manifestEntry) {
      try {
        manifestData = JSON.parse(manifestEntry.getData().toString('utf8'));
      } catch (e) {
        console.log('Could not parse manifest.json');
      }
    }

    // Find and parse articles.json or individual article files
    const articlesEntry = zipEntries.find(entry => entry.entryName.endsWith('articles.json'));
    if (articlesEntry) {
      try {
        const articlesData = JSON.parse(articlesEntry.getData().toString('utf8'));
        if (Array.isArray(articlesData)) {
          console.log(`[ZIP Parse] Found ${articlesData.length} articles in articles.json (array format)`);
          articles.push(...articlesData);
        } else if (articlesData.articles && Array.isArray(articlesData.articles)) {
          console.log(`[ZIP Parse] Found ${articlesData.articles.length} articles in articles.json (object format)`);
          articles.push(...articlesData.articles);
        } else {
          console.log('[ZIP Parse] articles.json exists but has unexpected format:', Object.keys(articlesData));
        }
      } catch (e) {
        console.log('[ZIP Parse] Could not parse articles.json:', e instanceof Error ? e.message : 'Unknown error');
      }
    } else {
      console.log('[ZIP Parse] No articles.json found in ZIP');
    }

    // If no articles.json, look for individual JSON files
    if (articles.length === 0) {
      console.log('[ZIP Parse] Looking for individual article files...');
      const articleFiles = zipEntries.filter(entry => 
        !entry.isDirectory && 
        entry.entryName.includes('/articles/') && 
        entry.entryName.endsWith('.json')
      );

      console.log(`[ZIP Parse] Found ${articleFiles.length} individual article files`);

      let parsed = 0;
      let failed = 0;
      articleFiles.forEach(entry => {
        try {
          const data = JSON.parse(entry.getData().toString('utf8'));
          if (data.title || data.id || data.name) {
            articles.push(data);
            parsed++;
          } else {
            console.log(`[ZIP Parse] Skipping ${entry.entryName} - no title/id/name field`);
          }
        } catch (e) {
          failed++;
          console.log(`[ZIP Parse] Could not parse ${entry.entryName}:`, e instanceof Error ? e.message : 'Unknown error');
        }
      });

      console.log(`[ZIP Parse] Successfully parsed ${parsed} articles, failed to parse ${failed} files`);
    }

    console.log(`[ZIP Parse] TOTAL ARTICLES FOUND: ${articles.length}`);

    return {
      manifest: manifestData,
      articles,
      totalItems: articles.length,
    };
  } catch (error) {
    console.error('Failed to parse ZIP file:', error);
    throw new Error('Failed to parse ZIP file');
  }
}

// Map World Anvil article to WriteCraft content
function mapArticleToContent(article: WorldAnvilArticle, userId: string, notebookId: string) {
  // World Anvil uses entityClass (e.g., "Character", "Species") or templateType (e.g., "character", "species")
  // Category is an object, not a string!
  let typeKey = '';

  // Try multiple fields to determine type
  if (article.entityClass) {
    typeKey = article.entityClass.toLowerCase();
  } else if (article.templateType) {
    typeKey = article.templateType.toLowerCase();
  } else if (article.template && typeof article.template === 'object' && article.template.title) {
    typeKey = article.template.title.toLowerCase();
  } else if (article.category && typeof article.category === 'object' && article.category.title) {
    typeKey = article.category.title.toLowerCase();
  } else if (article.type) {
    typeKey = article.type.toLowerCase();
  } else {
    typeKey = 'document';
  }

  const contentType = WORLD_ANVIL_TYPE_MAPPING[typeKey] || 'document';

  // Log the type mapping for debugging
  console.log(`[Type Mapping] Article "${article.title}": typeKey="${typeKey}" → contentType="${contentType}"`);

  // Log unmapped types to help debug
  if (!WORLD_ANVIL_TYPE_MAPPING[typeKey] && typeKey !== 'document') {
    console.log(`[Type Mapping] Unmapped type "${typeKey}" for article "${article.title}" - defaulting to document`);
  }

  // Helper function to strip World Anvil BBCode tags
  const stripBBCode = (text: string | number | string[] | object | undefined): string => {
    if (!text) return '';
    
    // Normalize all types to string FIRST
    let stringValue: string;
    if (typeof text === 'string') {
      stringValue = text;
    } else if (typeof text === 'number') {
      stringValue = String(text);
    } else if (Array.isArray(text)) {
      // Join array items, each item may need cleaning too
      stringValue = text
        .map(item => typeof item === 'string' ? item : String(item))
        .join(', ');
    } else if (typeof text === 'object') {
      stringValue = JSON.stringify(text);
    } else {
      return '';
    }
    
    // NOW run BBCode cleanup on the normalized string
    stringValue = stringValue
      .replace(/\[p\]/g, '')
      .replace(/\[\/p\]/g, '\n\n')
      .replace(/\[b\]/g, '')
      .replace(/\[\/b\]/g, '')
      .replace(/\[i\]/g, '')
      .replace(/\[\/i\]/g, '')
      .replace(/\[h[1-6]\|[^\]]+\]/g, '')
      .replace(/\[\/h[1-6]\]/g, '\n')
      .replace(/\[ul\]/g, '')
      .replace(/\[\/ul\]/g, '')
      .replace(/\[br\]/g, '\n')
      .replace(/- /g, '• ')
      .replace(/@\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Strip World Anvil links
    
    return stringValue.trim();
  };

  // Helper function to extract name from title if firstname is missing
  const extractNameFromTitle = (title: string): string => {
    if (!title) return '';
    const parts = title.split(' ');
    return parts.length > 0 ? parts[0] : '';
  };

  // Helper function to parse array fields (comma or newline separated)
  const parseArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    
    // If already an array, clean and return it
    if (Array.isArray(value)) {
      return value
        .map(item => typeof item === 'string' ? stripBBCode(item) : String(item))
        .filter(Boolean);
    }
    
    // If string, split and clean
    if (typeof value === 'string') {
      return value
        .split(/[,\n]/)
        .map(s => stripBBCode(s.trim()))
        .filter(Boolean);
    }
    
    // Fallback for other types
    return [];
  };

  // Helper function to safely extract field with multiple name attempts
  const extractField = (article: any, ...fieldNames: string[]): string => {
    for (const name of fieldNames) {
      if (article[name] !== undefined && article[name] !== null) {
        const value = article[name];
        
        // Handle object values - extract title, name, or label
        if (typeof value === 'object' && !Array.isArray(value)) {
          const readable = value.title ?? value.name ?? value.label ?? value.value;
          if (readable) {
            return stripBBCode(readable);
          }
          // Fallback to JSON.stringify only if no readable property found
        }
        
        return stripBBCode(value);
      }
    }
    return '';
  };

  // Add type-specific fields with required fields
  if (contentType === 'character') {
    // Map World Anvil character fields to our schema with comprehensive field mapping
    const characterData = {
      // Basic identity
      givenName: article.firstname || extractNameFromTitle(article.title),
      familyName: article.lastname || '',
      middleName: article.middlename || '',
      maidenName: article.maidenname || '',
      nickname: article.nickname || '',
      honorificTitle: article.honorific || '',
      suffix: article.suffix || '',

      // Core description - map from 'content' field
      description: stripBBCode(article.content || ''),

      // Physical attributes
      physicalDescription: stripBBCode(article.physique || ''),
      facialFeatures: stripBBCode(article.facialFeatures || article.facialfeatures || ''),
      eyeColor: article.eyes || '',
      hairColor: article.hair || '',
      skinTone: article.skin || '',
      height: article.height || '',
      weight: article.weight || '',
      build: stripBBCode(article.physique || ''), // Use physique as build fallback
      distinctiveBodyFeatures: stripBBCode(article.bodyFeatures || article.bodyfeatures || ''),
      identifyingMarks: stripBBCode(article.identifyingCharacteristics || article.identifyingcharacteristics || ''),
      strikingFeatures: stripBBCode(article.identifyingCharacteristics || article.identifyingcharacteristics || ''),

      // Personality and traits
      backstory: stripBBCode(article.history || ''),
      motivation: stripBBCode(article.motivation || ''),

      // Abilities and skills
      supernaturalPowers: stripBBCode(article.specialAbilities || article.specialabilities || ''),
      specialAbilities: stripBBCode(article.specialAbilities || article.specialabilities || ''),
      mainSkills: stripBBCode(article.savviesIneptitudes || article.savviesineptitudes || ''),
      strengths: stripBBCode(article.virtues || ''),
      characterFlaws: stripBBCode(article.vices || ''),

      // Clothing and appearance
      typicalAttire: stripBBCode(article.clothing || ''),

      // Demographics
      age: article.age ? parseInt(article.age) : null,
      gender: article.gender || '',
      pronouns: article.pronouns || '',
      species: article.speciesDisplay || article.speciesdisplay || '',

      // Personal information
      dateOfBirth: article.dobDisplay || article.dobdisplay || article.dob || '',
      placeOfBirth: article.birthplace || '',
      dateOfDeath: article.dodDisplay || article.doddisplay || article.dod || '',
      placeOfDeath: article.deathplace || '',
      currentResidence: article.residence || '',

      // Additional traits
      languages: article.languages ? [stripBBCode(article.languages)] : [],
      religiousBelief: article.deity || '',
      education: stripBBCode(article.education || ''),
      occupation: article.employment || '',

      // Quotes and personality
      famousQuotes: stripBBCode(article.quotes || ''),
      likes: stripBBCode(article.likesDislikes || article.likesdislikes || ''),

      // Character development fields from sidepanelcontenttop
      // This often contains "Character Description" which maps to our general description
      physicalCondition: stripBBCode(article.sidepanelcontenttop || ''),

      // Mental and emotional traits
      mentalHealth: stripBBCode(article.mentalTraumas || article.mentaltraumas || ''),
      intellectualTraits: stripBBCode(article.intellectualCharacteristics || article.intellectualcharacteristics || ''),
      valuesEthicsMorals: stripBBCode(article.morality || ''),

      // Social aspects
      presentation: stripBBCode(article.presentation || ''),
      sexualOrientation: stripBBCode(article.sexuality || ''),
      genderIdentity: stripBBCode(article.genderidentity || ''),

      // Image mapping - use portrait URL if available
      imageUrl: article.portrait?.url || '',
      imageCaption: article.portrait?.title || '',

      // Metadata
      genre: 'Fantasy', // Default genre for World Anvil imports
      notebookId: notebookId,
      userId: userId
    };
    return characterData;

  } else if (contentType === 'species') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      classification: extractField(article, 'classification', 'category', 'type'),
      physicalDescription: extractField(article, 'physicalAppearance', 'physicalappearance', 'appearance', 'content', 'description'),
      habitat: extractField(article, 'habitat', 'environment', 'location'),
      behavior: extractField(article, 'behavior', 'behaviour', 'temperament'),
      diet: extractField(article, 'diet', 'food', 'sustenance'),
      lifespan: extractField(article, 'lifespan', 'lifeSpan', 'averageLifespan', 'averagelifespan'),
      intelligence: extractField(article, 'intelligence', 'intellect', 'cognitive'),
      socialStructure: extractField(article, 'socialStructure', 'socialstructure', 'society', 'organization'),
      abilities: parseArray(article.abilities || article.specialAbilities || article.specialabilities || article.powers),
      weaknesses: parseArray(article.weaknesses || article.vulnerabilities),
      culturalTraits: extractField(article, 'culturalTraits', 'culturaltraits', 'culture', 'traditions'),
      reproduction: extractField(article, 'reproduction', 'breeding', 'lifecycle'),
      genre: 'Fantasy',
      imageUrl: article.portrait?.url || article.image?.url || '',
      imageCaption: article.portrait?.title || article.image?.title || '',
    };
  } else if (contentType === 'location') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      locationType: extractField(article, 'locationType', 'locationtype', 'type') || 'other',
      description: extractField(article, 'description', 'excerpt', 'summary'),
      geography: extractField(article, 'geography', 'terrain', 'topography', 'landscape', 'content'),
      climate: extractField(article, 'climate', 'weather'),
      population: extractField(article, 'population', 'demographics', 'inhabitants'),
      government: extractField(article, 'government', 'governance', 'ruling', 'leadership'),
      economy: extractField(article, 'economy', 'trade', 'commerce'),
      culture: extractField(article, 'culture', 'culturalNotes', 'culturalnotes'),
      history: extractField(article, 'history', 'historicalNotes', 'historicalnotes', 'background'),
      notableFeatures: parseArray(article.notableFeatures || article.notablefeatures || article.features),
      landmarks: parseArray(article.landmarks || article.monuments || article.pointsOfInterest || article.pointsofinterest),
      threats: parseArray(article.threats || article.dangers || article.hazards),
      resources: parseArray(article.resources || article.naturalResources || article.naturalresources),
      genre: 'Fantasy',
      imageUrl: article.portrait?.url || article.image?.url || '',
      imageCaption: article.portrait?.title || article.image?.title || '',
    };
  } else if (contentType === 'organization') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      organizationType: extractField(article, 'organizationType', 'organizationtype', 'type') || 'other',
      purpose: extractField(article, 'purpose', 'mission', 'goals') || 'Imported from World Anvil',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      structure: extractField(article, 'structure', 'hierarchy', 'organization'),
      leadership: extractField(article, 'leadership', 'leaders', 'commander', 'head'),
      members: extractField(article, 'members', 'membership', 'personnel'),
      headquarters: extractField(article, 'headquarters', 'base', 'location', 'seat'),
      influence: extractField(article, 'influence', 'power', 'reach'),
      resources: extractField(article, 'resources', 'assets', 'wealth'),
      goals: extractField(article, 'goals', 'objectives', 'aims', 'purpose'),
      history: extractField(article, 'history', 'background', 'origins'),
      allies: parseArray(article.allies || article.friends || article.partners),
      enemies: parseArray(article.enemies || article.rivals || article.opponents),
      genre: 'Fantasy',
      imageUrl: article.portrait?.url || article.image?.url || '',
      imageCaption: article.portrait?.title || article.image?.title || '',
    };
  } else if (contentType === 'profession') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      professionType: extractField(article, 'professionType', 'professiontype', 'type', 'category'),
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      skillsRequired: parseArray(article.skillsRequired || article.skillsrequired || article.skills || article.requirements),
      responsibilities: extractField(article, 'responsibilities', 'duties', 'tasks'),
      workEnvironment: extractField(article, 'workEnvironment', 'workenvironment', 'environment'),
      trainingRequired: extractField(article, 'trainingRequired', 'trainingrequired', 'training', 'education'),
      socialStatus: extractField(article, 'socialStatus', 'socialstatus', 'status', 'standing'),
      averageIncome: extractField(article, 'averageIncome', 'averageincome', 'income', 'pay', 'wage'),
      riskLevel: extractField(article, 'riskLevel', 'risklevel', 'danger'),
      physicalDemands: extractField(article, 'physicalDemands', 'physicaldemands', 'physical'),
      mentalDemands: extractField(article, 'mentalDemands', 'mentaldemands', 'mental'),
      commonTools: parseArray(article.commonTools || article.commontools || article.tools || article.equipment),
      relatedProfessions: parseArray(article.relatedProfessions || article.relatedprofessions || article.similar),
      careerProgression: extractField(article, 'careerProgression', 'careerprogression', 'advancement'),
      apprenticeship: extractField(article, 'apprenticeship', 'apprentice'),
      guildsOrganizations: parseArray(article.guildsOrganizations || article.guildsorganizations || article.guilds || article.organizations),
      historicalContext: extractField(article, 'historicalContext', 'historicalcontext', 'history'),
      culturalSignificance: extractField(article, 'culturalSignificance', 'culturalsignificance', 'significance'),
      genre: 'Fantasy',
    };
  } else if (contentType === 'ethnicity') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      origin: extractField(article, 'origin', 'homeland', 'birthplace'),
      physicalTraits: extractField(article, 'physicalTraits', 'physicaltraits', 'appearance', 'physicalAppearance', 'physicalappearance'),
      culturalTraits: extractField(article, 'culturalTraits', 'culturaltraits', 'culture', 'content'),
      traditions: parseArray(article.traditions || article.customs || article.practices),
      language: extractField(article, 'language', 'languages', 'tongue'),
      religion: extractField(article, 'religion', 'faith', 'belief', 'deity'),
      socialStructure: extractField(article, 'socialStructure', 'socialstructure', 'society', 'hierarchy'),
      history: extractField(article, 'history', 'background', 'origins'),
      geography: extractField(article, 'geography', 'territory', 'lands'),
      values: parseArray(article.values || article.beliefs),
      customs: parseArray(article.customs || article.practices || article.traditions),
      genre: 'Fantasy',
      imageUrl: article.portrait?.url || article.image?.url || '',
      imageCaption: article.portrait?.title || article.image?.title || '',
    };
  } else if (contentType === 'settlement') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      settlementType: extractField(article, 'settlementType', 'settlementtype', 'type') || 'town',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      population: extractField(article, 'population', 'inhabitants', 'residents'),
      government: extractField(article, 'government', 'governance', 'leadership', 'ruling'),
      economy: extractField(article, 'economy', 'trade', 'commerce', 'industry'),
      defenses: extractField(article, 'defenses', 'fortifications', 'walls', 'guards'),
      culture: extractField(article, 'culture', 'culturalNotes', 'culturalnotes'),
      history: extractField(article, 'history', 'background', 'founding'),
      geography: extractField(article, 'geography', 'location', 'terrain'),
      climate: extractField(article, 'climate', 'weather'),
      resources: parseArray(article.resources || article.naturalResources || article.naturalresources),
      threats: parseArray(article.threats || article.dangers),
      landmarks: parseArray(article.landmarks || article.monuments || article.sites),
      districts: parseArray(article.districts || article.quarters || article.wards),
      genre: 'Fantasy',
    };
  } else if (contentType === 'ritual') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      ritualType: extractField(article, 'ritualType', 'ritualtype', 'type', 'category') || 'other',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      purpose: extractField(article, 'purpose', 'goal', 'intent'),
      participants: extractField(article, 'participants', 'performers'),
      requirements: parseArray(article.requirements || article.prerequisites),
      steps: parseArray(article.steps || article.procedure || article.process),
      duration: extractField(article, 'duration', 'length', 'time'),
      location: extractField(article, 'location', 'place', 'setting'),
      timing: extractField(article, 'timing', 'when', 'schedule'),
      components: parseArray(article.components || article.materials || article.items),
      effects: extractField(article, 'effects', 'results', 'outcome'),
      risks: extractField(article, 'risks', 'dangers', 'warnings'),
      variations: parseArray(article.variations || article.alternatives),
      genre: 'Fantasy',
    };
  } else if (contentType === 'law') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      lawType: extractField(article, 'lawType', 'lawtype', 'type', 'category') || 'regulation',
      description: extractField(article, 'description', 'content', 'excerpt', 'text'),
      jurisdiction: extractField(article, 'jurisdiction', 'scope', 'territory'),
      authority: extractField(article, 'authority', 'enforcer', 'enforcement'),
      penalties: parseArray(article.penalties || article.punishment || article.sanctions),
      exceptions: parseArray(article.exceptions || article.exemptions),
      precedents: parseArray(article.precedents || article.cases),
      enforcement: extractField(article, 'enforcement', 'application'),
      courts: parseArray(article.courts || article.tribunals),
      appeals: extractField(article, 'appeals', 'appellate'),
      amendments: parseArray(article.amendments || article.changes || article.revisions),
      relatedLaws: parseArray(article.relatedLaws || article.relatedlaws || article.related),
      controversy: extractField(article, 'controversy', 'debate', 'dispute'),
      publicOpinion: extractField(article, 'publicOpinion', 'publicopinion', 'opinion'),
      historicalContext: extractField(article, 'historicalContext', 'historicalcontext', 'history'),
      effectiveness: extractField(article, 'effectiveness', 'success'),
      genre: 'Fantasy',
    };
  } else if (contentType === 'item') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      itemType: extractField(article, 'itemType', 'itemtype', 'type', 'category') || 'other',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      rarity: extractField(article, 'rarity', 'commonness'),
      value: extractField(article, 'value', 'cost', 'price', 'worth'),
      weight: extractField(article, 'weight', 'mass'),
      properties: parseArray(article.properties || article.traits || article.attributes),
      materials: parseArray(article.materials || article.composition || article.madeFrom || article.madefrom),
      history: extractField(article, 'history', 'background', 'origins', 'lore'),
      abilities: parseArray(article.abilities || article.powers || article.effects),
      requirements: extractField(article, 'requirements', 'prerequisites'),
      crafting: extractField(article, 'crafting', 'creation', 'manufacturing'),
      genre: 'Fantasy',
      imageUrl: article.portrait?.url || article.image?.url || '',
      imageCaption: article.portrait?.title || article.image?.title || '',
    };
  } else if (contentType === 'document') {
    // Documents need title at the root level, not nested
    return {
      userId,
      notebookId,
      title: article.title || article.name || 'Untitled',
      documentType: extractField(article, 'documentType', 'documenttype', 'type') || 'article',
      content: extractField(article, 'content', 'text', 'body', 'excerpt'),
      author: extractField(article, 'author', 'writer', 'creator', 'scribe'),
      language: extractField(article, 'language', 'tongue', 'script'),
      age: extractField(article, 'age', 'date', 'period', 'era'),
      condition: extractField(article, 'condition', 'state', 'preservation'),
      significance: extractField(article, 'significance', 'importance', 'value'),
      location: extractField(article, 'location', 'whereFound', 'wherefound', 'storedAt', 'storedat'),
      accessibility: extractField(article, 'accessibility', 'access', 'availability'),
      secrets: extractField(article, 'secrets', 'hiddenInfo', 'hiddeninfo', 'mysteries'),
      history: extractField(article, 'history', 'background', 'provenance'),
      genre: 'Fantasy',
      imageUrl: article.portrait?.url || article.image?.url || '',
      imageCaption: article.portrait?.title || article.image?.title || '',
    };
  } else if (contentType === 'language') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      family: extractField(article, 'family', 'languageFamily', 'languagefamily', 'group'),
      speakers: extractField(article, 'speakers', 'nativeSpeakers', 'nativespeakers', 'population'),
      regions: parseArray(article.regions || article.spokenIn || article.spokenin || article.locations),
      phonology: extractField(article, 'phonology', 'sounds', 'pronunciation'),
      grammar: extractField(article, 'grammar', 'syntax', 'structure'),
      vocabulary: extractField(article, 'vocabulary', 'lexicon', 'words'),
      writingSystem: extractField(article, 'writingSystem', 'writingsystem', 'script', 'alphabet'),
      commonPhrases: parseArray(article.commonPhrases || article.commonphrases || article.phrases),
      culturalContext: extractField(article, 'culturalContext', 'culturalcontext', 'culture', 'content'),
      history: extractField(article, 'history', 'evolution', 'development'),
      variations: parseArray(article.variations || article.dialects),
      difficulty: extractField(article, 'difficulty', 'learningDifficulty', 'learningdifficulty'),
      status: extractField(article, 'status', 'vitality', 'state'),
      genre: 'Fantasy',
    };
  } else if (contentType === 'building') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      buildingType: extractField(article, 'buildingType', 'buildingtype', 'type', 'category') || 'other',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      architecture: extractField(article, 'architecture', 'style', 'design'),
      materials: parseArray(article.materials || article.construction || article.builtFrom || article.builtfrom),
      purpose: extractField(article, 'purpose', 'function', 'use'),
      capacity: extractField(article, 'capacity', 'size', 'occupancy'),
      defenses: extractField(article, 'defenses', 'fortifications', 'security'),
      history: extractField(article, 'history', 'background', 'construction'),
      currentCondition: extractField(article, 'currentCondition', 'currentcondition', 'condition', 'state'),
      location: extractField(article, 'location', 'whereLocated', 'wherelocated', 'address'),
      owner: extractField(article, 'owner', 'ownedBy', 'ownedby', 'proprietor'),
      significance: extractField(article, 'significance', 'importance', 'notability'),
      secrets: extractField(article, 'secrets', 'hiddenFeatures', 'hiddenfeatures'),
      genre: 'Fantasy',
    };
  } else if (contentType === 'material') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      materialType: extractField(article, 'materialType', 'materialtype', 'type', 'category') || 'other',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      properties: parseArray(article.properties || article.characteristics || article.traits),
      rarity: extractField(article, 'rarity', 'commonness', 'availability'),
      value: extractField(article, 'value', 'cost', 'price', 'worth'),
      source: extractField(article, 'source', 'origin', 'foundIn', 'foundin'),
      processing: extractField(article, 'processing', 'refinement', 'preparation'),
      uses: parseArray(article.uses || article.applications || article.purposes),
      durability: extractField(article, 'durability', 'strength', 'hardness'),
      appearance: extractField(article, 'appearance', 'look', 'visual'),
      weight: extractField(article, 'weight', 'density', 'mass'),
      genre: 'Fantasy',
    };
  } else if (contentType === 'transportation') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      transportType: extractField(article, 'transportType', 'transporttype', 'vehicleType', 'vehicletype', 'type') || 'other',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      capacity: extractField(article, 'capacity', 'passengers', 'cargo'),
      speed: extractField(article, 'speed', 'velocity', 'pace'),
      range: extractField(article, 'range', 'distance', 'reach'),
      requirements: extractField(article, 'requirements', 'needs', 'prerequisites'),
      construction: extractField(article, 'construction', 'building', 'manufacturing'),
      operation: extractField(article, 'operation', 'usage', 'piloting', 'driving'),
      cost: extractField(article, 'cost', 'price', 'value'),
      rarity: extractField(article, 'rarity', 'availability', 'commonness'),
      advantages: parseArray(article.advantages || article.benefits || article.pros),
      disadvantages: parseArray(article.disadvantages || article.drawbacks || article.cons),
      culturalSignificance: extractField(article, 'culturalSignificance', 'culturalsignificance', 'significance'),
      genre: 'Fantasy',
    };
  } else if (contentType === 'rank') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      rankType: extractField(article, 'rankType', 'ranktype', 'type', 'category') || 'other',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      hierarchy: article.hierarchy ? parseInt(article.hierarchy) : null,
      authority: extractField(article, 'authority', 'power', 'jurisdiction'),
      responsibilities: parseArray(article.responsibilities || article.duties || article.obligations),
      privileges: parseArray(article.privileges || article.rights || article.benefits),
      insignia: extractField(article, 'insignia', 'symbol', 'badge', 'emblem'),
      requirements: extractField(article, 'requirements', 'prerequisites', 'qualifications'),
      organizationId: extractField(article, 'organizationId', 'organizationid', 'organization'),
      superiorRanks: parseArray(article.superiorRanks || article.superiorranks || article.above),
      subordinateRanks: parseArray(article.subordinateRanks || article.subordinateranks || article.below),
      titleOfAddress: extractField(article, 'titleOfAddress', 'titleofaddress', 'title', 'address'),
      historicalOrigin: extractField(article, 'historicalOrigin', 'historicalorigin', 'history', 'origin'),
      genre: 'Fantasy',
    };
  } else if (contentType === 'condition') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      conditionType: extractField(article, 'conditionType', 'conditiontype', 'type', 'category') || 'other',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      symptoms: parseArray(article.symptoms || article.signs || article.manifestations),
      causes: parseArray(article.causes || article.origins || article.triggers),
      transmission: extractField(article, 'transmission', 'spread', 'contagion'),
      duration: extractField(article, 'duration', 'length', 'timeframe'),
      severity: extractField(article, 'severity', 'seriousness', 'intensity'),
      effects: parseArray(article.effects || article.consequences || article.impact),
      treatment: extractField(article, 'treatment', 'remedy', 'therapy'),
      cure: extractField(article, 'cure', 'healing', 'resolution'),
      prevention: extractField(article, 'prevention', 'prophylaxis', 'avoidance'),
      complications: parseArray(article.complications || article.risks || article.dangers),
      mortality: extractField(article, 'mortality', 'deathRate', 'deathrate', 'fatality'),
      prevalence: extractField(article, 'prevalence', 'commonness', 'frequency'),
      affectedSpecies: parseArray(article.affectedSpecies || article.affectedspecies || article.targets),
      culturalImpact: extractField(article, 'culturalImpact', 'culturalimpact', 'socialImpact', 'socialimpact'),
      historicalOutbreaks: extractField(article, 'historicalOutbreaks', 'historicaloutbreaks', 'history'),
      genre: 'Fantasy',
    };
  }

  // Fallback to document
  return {
    userId,
    notebookId,
    title: article.title || 'Untitled',
    documentType: 'article',
    content: article.content || article.excerpt || 'Imported from World Anvil',
  };
}

// Upload and start import job
router.post('/upload', upload.single('file'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get or create a default notebook for imports
    let notebookId = req.body.notebookId;

    // Validate the notebook exists and belongs to the user
    if (notebookId) {
      const notebook = await storage.getNotebook(notebookId, userId);
      if (!notebook) {
        console.log(`[Import] Invalid notebookId ${notebookId} for user ${userId}, will create new notebook`);
        notebookId = null;
      }
    }

    if (!notebookId) {
      // Get user's notebooks, use first one or create a default import notebook
      const notebooks = await storage.getUserNotebooks(userId);
      if (notebooks.length > 0) {
        notebookId = notebooks[0].id;
        console.log(`[Import] Using existing notebook ${notebookId}: ${notebooks[0].name}`);
      } else {
        // Create a default import notebook
        const defaultNotebook = await storage.createNotebook({
          userId,
          name: 'Imported Content',
          description: 'Content imported from World Anvil',
        });
        notebookId = defaultNotebook.id;
        console.log(`[Import] Created new notebook ${notebookId}: ${defaultNotebook.name}`);
      }
    }

    console.log(`[Import] Final notebookId: ${notebookId} for user: ${userId}`);

    // Parse the ZIP file
    const parsed = parseWorldAnvilExport(req.file.buffer);

    // Create import job
    const job = await storage.createImportJob({
      userId,
      notebookId,
      source: 'world_anvil',
      status: 'pending',
      totalItems: parsed.totalItems,
      processedItems: 0,
      progress: 0,
    });

    // Start processing in background
    processImport(job.id, parsed, userId, notebookId).catch(console.error);

    res.json({
      jobId: job.id,
      totalItems: parsed.totalItems,
      status: 'processing',
    });
  } catch (error) {
    console.error('Import start error:', error);
    res.status(500).json({
      error: 'Failed to start import'
    });
  }
});

// Process import in background
async function processImport(
  jobId: string,
  parsed: { articles: WorldAnvilArticle[]; totalItems: number },
  userId: string,
  notebookId: string
) {
  const results = {
    imported: [] as string[],
    failed: [] as Array<{ title: string; error: string }>,
    skipped: [] as string[],
  };

  try {
    await storage.updateImportJob(jobId, { status: 'processing' });
    console.log(`[Import ${jobId}] Starting import of ${parsed.totalItems} articles`);

    for (let i = 0; i < parsed.articles.length; i++) {
      const article = parsed.articles[i];

      try {
        // Log article structure for first 3 items to understand the data
        if (i < 3) {
          console.log(`[Import ${jobId}] Article ${i + 1} structure:`, JSON.stringify({
            title: article.title,
            entityClass: article.entityClass,
            templateType: article.templateType,
            template: article.template,
            category: article.category,
            type: article.type,
            availableKeys: Object.keys(article).slice(0, 20)
          }, null, 2));
        }

        const mapped = mapArticleToContent(article, userId, notebookId);
        // Don't extract contentType from mapped - it's not a field, the mapped object IS the data

        // Determine content type from the original article
        let contentType = 'document';

        if (article.entityClass) {
          contentType = WORLD_ANVIL_TYPE_MAPPING[article.entityClass.toLowerCase()] || 'document';
        } else if (article.templateType) {
          contentType = WORLD_ANVIL_TYPE_MAPPING[article.templateType.toLowerCase()] || 'document';
        } else if (article.template && typeof article.template === 'object' && article.template.title) {
          contentType = WORLD_ANVIL_TYPE_MAPPING[article.template.title.toLowerCase()] || 'document';
        } else if (article.category && typeof article.category === 'object' && article.category.title) {
          contentType = WORLD_ANVIL_TYPE_MAPPING[article.category.title.toLowerCase()] || 'document';
        } else if (article.type) {
          contentType = WORLD_ANVIL_TYPE_MAPPING[article.type.toLowerCase()] || 'document';
        }

        console.log(`[Import ${jobId}] Processing ${i + 1}/${parsed.totalItems}: "${article.title}" → ${contentType}`);

        // Import based on content type
        let createdItem: any = null;

        if (contentType === 'character') {
          console.log(`[Import ${jobId}] Processing character: ${article.title}`);
          console.log(`[Import ${jobId}] Mapped fields:`, {
            givenName: mapped.givenName,
            familyName: mapped.familyName,
            description: mapped.description ? `${mapped.description.substring(0, 50)}...` : 'none',
            imageUrl: mapped.imageUrl || 'none',
            physicalDescription: mapped.physicalDescription ? 'present' : 'none',
          });
          createdItem = await storage.createCharacter(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created character: ${article.title}`);
        } else if (contentType === 'location') {
          createdItem = await storage.createLocation(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created location: ${article.title}`);
        } else if (contentType === 'organization') {
          createdItem = await storage.createOrganization(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created organization: ${article.title}`);
        } else if (contentType === 'species') {
          createdItem = await storage.createSpecies(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created species: ${article.title}`);
        } else if (contentType === 'profession') {
          createdItem = await storage.createProfession(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created profession: ${article.title}`);
        } else if (contentType === 'ethnicity') {
          createdItem = await storage.createEthnicity(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created ethnicity: ${article.title}`);
        } else if (contentType === 'settlement') {
          createdItem = await storage.createSettlement(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created settlement: ${article.title}`);
        } else if (contentType === 'ritual') {
          createdItem = await storage.createRitual(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created ritual: ${article.title}`);
        } else if (contentType === 'law') {
          createdItem = await storage.createLaw(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created law: ${article.title}`);
        } else if (contentType === 'item') {
          createdItem = await storage.createItem(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created item: ${article.title}`);
        } else if (contentType === 'document') {
          createdItem = await storage.createDocument(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created document: ${article.title}`);
        } else if (contentType === 'language') {
          createdItem = await storage.createLanguage(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created language: ${article.title}`);
        } else if (contentType === 'building') {
          createdItem = await storage.createBuilding(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created building: ${article.title}`);
        } else if (contentType === 'material') {
          createdItem = await storage.createMaterial(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created material: ${article.title}`);
        } else if (contentType === 'transportation') {
          createdItem = await storage.createTransportation(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created transportation: ${article.title}`);
        } else if (contentType === 'rank') {
          createdItem = await storage.createRank(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created rank: ${article.title}`);
        } else if (contentType === 'condition') {
          createdItem = await storage.createCondition(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created condition: ${article.title}`);
        } else {
          // Skip unsupported types for now
          const skipReason = `${article.title} (type: ${contentType}, original: ${article.templateType || article.entityClass || 'unknown'})`;
          results.skipped.push(skipReason);
          console.log(`[Import ${jobId}] ⊘ Skipped (unsupported type): ${skipReason}`);
        }

        // Create saved_items entry for notebook visibility
        if (createdItem) {
          try {
            const savedItem = await storage.saveItem({
              userId,
              notebookId,
              itemType: contentType,
              itemId: createdItem.id,
              itemData: createdItem
            });
            console.log(`[Import ${jobId}] ✓ Created saved_item ${savedItem.id} for ${contentType} "${article.title}" in notebook ${notebookId}`);
          } catch (saveError) {
            console.error(`[Import ${jobId}] ✗ Failed to create saved_item for ${contentType} "${article.title}":`, saveError);
            // Don't fail the whole import, but log it
          }
        }

        // Update progress every 10 items or on last item
        if ((i + 1) % 10 === 0 || i === parsed.totalItems - 1) {
          const progress = Math.round(((i + 1) / parsed.totalItems) * 100);
          console.log(`[Import ${jobId}] Progress update: ${i + 1}/${parsed.totalItems} (${progress}%)`);
          await storage.updateImportJob(jobId, {
            processedItems: i + 1,
            progress,
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.failed.push({
          title: article.title || 'Untitled',
          error: errorMsg,
        });
        console.error(`[Import ${jobId}] ✗ Failed: ${article.title} - ${errorMsg}`);
      }
    }

    console.log(`[Import ${jobId}] Completed: ${results.imported.length} imported, ${results.skipped.length} skipped, ${results.failed.length} failed`);

    // Mark as completed
    await storage.updateImportJob(jobId, {
      status: 'completed',
      processedItems: parsed.totalItems,
      progress: 100,
      results,
      completedAt: new Date(),
    });

    console.log(`[Import ${jobId}] Import job marked as completed in database with status: completed`);
  } catch (error) {
    await storage.updateImportJob(jobId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });
  }
}

// Get import job status
router.get('/status/:jobId', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { jobId } = req.params;

    const job = await storage.getImportJob(jobId, userId);

    if (!job) {
      return res.status(404).json({ error: 'Import job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Import status error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get import status'
    });
  }
});

// Get all import jobs for user
router.get('/history', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const jobs = await storage.getUserImportJobs(userId);
    res.json(jobs);
  } catch (error) {
    console.error('Import history error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get import history'
    });
  }
});

export default router;