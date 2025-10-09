import { Router } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { storage } from '../storage';
import { z } from 'zod';
import { insertImportJobSchema } from '@shared/schema';
import { createRateLimiter } from '../security/middleware';

const router = Router();

// Create a stricter rate limiter for import uploads (10 per 15 minutes)
const uploadRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    const filename = file.originalname.toLowerCase();
    const isZip = file.mimetype === 'application/zip' || 
                  file.mimetype === 'application/x-zip-compressed' || 
                  filename.endsWith('.zip');
    const isHtml = file.mimetype === 'text/html' || filename.endsWith('.html');
    const isRtf = file.mimetype === 'application/rtf' || 
                  file.mimetype === 'text/rtf' || 
                  filename.endsWith('.rtf');
    const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   filename.endsWith('.docx');
    const isPdf = file.mimetype === 'application/pdf' || filename.endsWith('.pdf');
    
    if (isZip || isHtml || isRtf || isDocx || isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP (World Anvil) or Campfire document files (HTML, RTF, DOCX, PDF) are allowed'));
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
  'country': 'location',
  'nation': 'location',
  'region': 'location',
  'continent': 'location',
  'territory': 'location',
  'place': 'location',
  'settlement': 'settlement',
  'city': 'settlement',
  'town': 'settlement',
  'village': 'settlement',
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

// Campfire field mapping to WriteCraft character schema
interface CampfireCharacterData {
  fullName?: string;
  bio?: string;
  physicalTraits?: {
    facialFeatures?: string[];
    physicalFeatures?: string[];
  };
  personalityTraits?: string[];
  basicInfo?: {
    [key: string]: string;
  };
  image?: string; // base64 encoded
}

// Parse Campfire HTML export and extract character data
function parseCampfireHTML(htmlBuffer: Buffer, filename: string): WorldAnvilArticle[] {
  const cheerio = require('cheerio');
  const $ = cheerio.load(htmlBuffer.toString('utf8'));
  
  console.log(`[Campfire HTML] Processing file: ${filename}`);
  
  // Extract character name from <h2> tag
  const characterName = $('h2').first().text().trim() || 'Unnamed Character';
  
  // Extract bio from the first paragraph or Bio section
  let bio = '';
  const bioPanel = $('.text-panel').first();
  if (bioPanel.length) {
    bio = bioPanel.text().trim();
  } else {
    const firstP = $('p').first();
    if (firstP.length) {
      bio = firstP.text().trim();
    }
  }
  
  // Extract physical traits
  const physicalTraits: { facialFeatures?: string[]; physicalFeatures?: string[] } = {};
  const physicalPanel = $('h3:contains("Physical Traits")').next('.list-panel');
  if (physicalPanel.length) {
    const facialSection = physicalPanel.find('h5:contains("Facial Features")');
    if (facialSection.length) {
      physicalTraits.facialFeatures = [];
      facialSection.next('ul').find('li').each((_i: number, el: any) => {
        const trait = $(el).text().trim();
        if (trait) physicalTraits.facialFeatures!.push(trait);
      });
    }
    
    const physicalSection = physicalPanel.find('h5:contains("Physical Features")');
    if (physicalSection.length) {
      physicalTraits.physicalFeatures = [];
      physicalSection.next('ul').find('li').each((_i: number, el: any) => {
        const trait = $(el).text().trim();
        if (trait) physicalTraits.physicalFeatures!.push(trait);
      });
    }
  }
  
  // Extract personality traits
  const personalityTraits: string[] = [];
  const personalityPanel = $('h3:contains("Personality Traits")').next('.list-panel');
  if (personalityPanel.length) {
    personalityPanel.find('h5').each((_i: number, el: any) => {
      const trait = $(el).text().trim();
      if (trait) personalityTraits.push(trait);
    });
  }
  
  // Extract basic information fields
  const basicInfo: { [key: string]: string } = {};
  const basicPanel = $('h3:contains("Basic Information")').next('.custom-panel');
  if (basicPanel.length) {
    basicPanel.find('div > strong').each((_i: number, el: any) => {
      const label = $(el).text().replace(':', '').trim();
      const value = $(el).parent().text().replace($(el).text(), '').replace(':', '').trim();
      if (label && value) {
        basicInfo[label] = value;
      }
    });
  }
  
  // Extract embedded image (base64)
  let imageData = '';
  const imgElement = $('.image-panel img');
  if (imgElement.length) {
    const src = imgElement.attr('src');
    if (src && src.startsWith('data:image/')) {
      imageData = src;
    }
  }
  
  console.log(`[Campfire HTML] Extracted data for: ${characterName}`);
  console.log(`[Campfire HTML] - Bio length: ${bio.length}`);
  console.log(`[Campfire HTML] - Physical traits: ${Object.values(physicalTraits).flat().length}`);
  console.log(`[Campfire HTML] - Personality traits: ${personalityTraits.length}`);
  console.log(`[Campfire HTML] - Basic info fields: ${Object.keys(basicInfo).length}`);
  console.log(`[Campfire HTML] - Has image: ${!!imageData}`);
  
  // Create article with Campfire data
  const article: WorldAnvilArticle = {
    id: `campfire-character-${Date.now()}`,
    title: characterName,
    content: bio,
    excerpt: bio.substring(0, 200),
    entityClass: 'character',
    templateType: 'character',
    tags: ['campfire-import'],
    // Store Campfire-specific data for mapping
    campfireData: {
      fullName: basicInfo['Full Name'] || characterName,
      bio,
      physicalTraits,
      personalityTraits,
      basicInfo,
      image: imageData,
    },
  };
  
  return [article];
}

// Parse Campfire RTF export (convert to text and extract data)
async function parseCampfireRTF(rtfBuffer: Buffer, filename: string): Promise<WorldAnvilArticle[]> {
  const rtfParser = require('rtf-parser');
  
  console.log(`[Campfire RTF] Processing file: ${filename}`);
  
  return new Promise((resolve, reject) => {
    rtfParser.string(rtfBuffer.toString('utf8'), (err: any, doc: any) => {
      if (err) {
        console.error('[Campfire RTF] Parse error:', err);
        reject(new Error(`Failed to parse RTF file: ${filename}`));
        return;
      }
      
      // Extract text content from RTF document
      const extractText = (content: any[]): string => {
        if (!content) return '';
        return content.map((item: any) => {
          if (typeof item === 'string') return item;
          if (item.content) return extractText(item.content);
          return '';
        }).join(' ');
      };
      
      const fullText = extractText(doc.content);
      
      // Simple text-based extraction (similar to HTML but from plain text)
      const lines = fullText.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
      
      const characterName = lines[0] || 'Unnamed Character';
      const bio = lines.find((l: string) => l.length > 50) || '';
      
      console.log(`[Campfire RTF] Extracted text from: ${characterName}`);
      
      const article: WorldAnvilArticle = {
        id: `campfire-character-rtf-${Date.now()}`,
        title: characterName,
        content: fullText,
        excerpt: bio.substring(0, 200),
        entityClass: 'character',
        templateType: 'character',
        tags: ['campfire-import', 'rtf'],
        campfireData: {
          fullName: characterName,
          bio,
        },
      };
      
      resolve([article]);
    });
  });
}

// Parse Campfire DOCX export (convert to HTML then parse)
async function parseCampfireDOCX(docxBuffer: Buffer, filename: string): Promise<WorldAnvilArticle[]> {
  const mammoth = require('mammoth');
  
  console.log(`[Campfire DOCX] Processing file: ${filename}`);
  
  try {
    const result = await mammoth.convertToHtml({ buffer: docxBuffer });
    const htmlContent = result.value;
    
    // Convert HTML to buffer and parse using HTML parser
    const htmlBuffer = Buffer.from(htmlContent, 'utf8');
    return parseCampfireHTML(htmlBuffer, filename);
  } catch (error) {
    console.error(`[Campfire DOCX] Parse error:`, error);
    throw new Error(`Failed to parse DOCX file: ${filename}`);
  }
}

// Parse Campfire PDF export (extract text)
async function parseCampfirePDF(pdfBuffer: Buffer, filename: string): Promise<WorldAnvilArticle[]> {
  const pdfParse = require('pdf-parse');
  
  console.log(`[Campfire PDF] Processing file: ${filename}`);
  
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;
    
    const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    const characterName = lines[0] || 'Unnamed Character';
    const bio = lines.find((l: string) => l.length > 50) || '';
    
    console.log(`[Campfire PDF] Extracted ${lines.length} lines of text`);
    
    const article: WorldAnvilArticle = {
      id: `campfire-character-pdf-${Date.now()}`,
      title: characterName,
      content: text,
      excerpt: bio.substring(0, 200),
      entityClass: 'character',
      templateType: 'character',
      tags: ['campfire-import', 'pdf'],
      campfireData: {
        fullName: characterName,
        bio,
      },
    };
    
    return [article];
  } catch (error) {
    console.error(`[Campfire PDF] Parse error:`, error);
    throw new Error(`Failed to parse PDF file: ${filename}`);
  }
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

  // Helper function to extract names from title, handling titles/prefixes
  const extractNamesFromTitle = (title: string): { givenName: string; familyName: string; honorificTitle: string } => {
    if (!title) return { givenName: '', familyName: '', honorificTitle: '' };
    
    const parts = title.trim().split(/\s+/);
    if (parts.length === 0) return { givenName: '', familyName: '', honorificTitle: '' };
    
    // Common multi-word honorifics (sorted by length, longest first)
    const multiWordTitles = [
      'lady in waiting',
      'lord commander', 'high priestess', 'high priest', 'grand master', 'grand duke',
      'grand duchess', 'crown prince', 'crown princess', 'prime minister', 'vice president',
      'first lady', 'knight commander', 'rear admiral', 'vice admiral'
    ];
    
    // Common single-word honorifics and titles
    const singleWordTitles = [
      'dr', 'dr.', 'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'miss',
      'sir', 'dame', 'lord', 'lady', 'professor', 'prof', 'prof.',
      'captain', 'general', 'colonel', 'major', 'admiral', 'commander',
      'king', 'queen', 'prince', 'princess', 'duke', 'duchess', 'count', 'countess',
      'baron', 'baroness', 'earl', 'viscount', 'marquess', 'knight'
    ];
    
    let honorificTitle = '';
    let nameStart = 0;
    
    // Check for multi-word titles by comparing each candidate against the start of the title
    for (const candidate of multiWordTitles) {
      const candidateWords = candidate.split(/\s+/);
      if (parts.length >= candidateWords.length) {
        const titlePrefix = parts.slice(0, candidateWords.length).join(' ').toLowerCase();
        if (titlePrefix === candidate) {
          honorificTitle = parts.slice(0, candidateWords.length).join(' ');
          nameStart = candidateWords.length;
          break;
        }
      }
    }
    
    // If no multi-word title found, check for single-word title
    if (nameStart === 0 && singleWordTitles.includes(parts[0].toLowerCase().replace(/\.$/, ''))) {
      honorificTitle = parts[0];
      nameStart = 1;
    }
    
    const nameParts = parts.slice(nameStart);
    
    if (nameParts.length === 0) {
      return { givenName: '', familyName: '', honorificTitle };
    } else if (nameParts.length === 1) {
      return { givenName: nameParts[0], familyName: '', honorificTitle };
    } else {
      // First part is given name, rest is family name
      return { 
        givenName: nameParts[0], 
        familyName: nameParts.slice(1).join(' '),
        honorificTitle 
      };
    }
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
    // Try multiple field name variations for first/last name
    const firstNameValue = extractField(article, 'firstname', 'firstName', 'first_name', 'givenName', 'givenname', 'given_name');
    const lastNameValue = extractField(article, 'lastname', 'lastName', 'last_name', 'familyName', 'familyname', 'family_name', 'surname');
    const honorificValue = extractField(article, 'honorific', 'title', 'prefix');
    
    // If no first/last name found, extract from title
    const extractedNames = (!firstNameValue && !lastNameValue) ? extractNamesFromTitle(article.title) : { givenName: '', familyName: '', honorificTitle: '' };
    
    // Map World Anvil character fields to our schema with comprehensive field mapping
    const characterData = {
      // Basic identity - use extracted names as fallback
      givenName: firstNameValue || extractedNames.givenName || 'Unnamed',
      familyName: lastNameValue || extractedNames.familyName || '',
      middleName: extractField(article, 'middlename', 'middleName', 'middle_name') || '',
      maidenName: extractField(article, 'maidenname', 'maidenName', 'maiden_name') || '',
      nickname: extractField(article, 'nickname', 'nickName', 'alias') || '',
      honorificTitle: honorificValue || extractedNames.honorificTitle || '',
      suffix: extractField(article, 'suffix', 'nameSuffix', 'namesuffix') || '',

      // Core description - map from 'content' field with multiple fallbacks
      description: extractField(article, 'content', 'description', 'excerpt', 'summary', 'sidepanelcontenttop'),

      // Physical attributes
      physicalDescription: extractField(article, 'physique', 'physicalDescription', 'physicaldescription', 'appearance', 'physicalAppearance', 'physicalappearance'),
      facialFeatures: extractField(article, 'facialFeatures', 'facialfeatures', 'facial_features', 'face'),
      eyeColor: extractField(article, 'eyes', 'eyeColor', 'eyecolor', 'eye_color'),
      hairColor: extractField(article, 'hair', 'hairColor', 'haircolor', 'hair_color'),
      skinTone: extractField(article, 'skin', 'skinTone', 'skintone', 'skin_tone', 'complexion'),
      height: extractField(article, 'height'),
      weight: extractField(article, 'weight'),
      build: extractField(article, 'physique', 'build', 'bodyType', 'bodytype', 'body_type'),
      distinctiveBodyFeatures: extractField(article, 'bodyFeatures', 'bodyfeatures', 'body_features', 'distinctiveFeatures', 'distinctivefeatures'),
      identifyingMarks: extractField(article, 'identifyingCharacteristics', 'identifyingcharacteristics', 'identifying_characteristics', 'identifyingMarks', 'identifyingmarks'),
      strikingFeatures: extractField(article, 'identifyingCharacteristics', 'identifyingcharacteristics', 'strikingFeatures', 'strikingfeatures'),

      // Personality and traits
      backstory: extractField(article, 'history', 'backstory', 'background', 'past'),
      motivation: extractField(article, 'motivation', 'motivations', 'drives', 'goals'),

      // Abilities and skills
      supernaturalPowers: extractField(article, 'specialAbilities', 'specialabilities', 'special_abilities', 'powers', 'supernaturalPowers', 'supernaturalpowers'),
      specialAbilities: extractField(article, 'specialAbilities', 'specialabilities', 'special_abilities', 'abilities'),
      mainSkills: extractField(article, 'savviesIneptitudes', 'savviesineptitudes', 'skills', 'talents'),
      strengths: extractField(article, 'virtues', 'strengths', 'positiveTraits', 'positivetraits'),
      characterFlaws: extractField(article, 'vices', 'flaws', 'weaknesses', 'negativeTraits', 'negativetraits'),

      // Clothing and appearance
      typicalAttire: extractField(article, 'clothing', 'attire', 'dress', 'outfit'),

      // Demographics
      age: article.age ? parseInt(article.age) : null,
      gender: extractField(article, 'gender', 'sex'),
      pronouns: extractField(article, 'pronouns'),
      species: extractField(article, 'speciesDisplay', 'speciesdisplay', 'species', 'race'),

      // Personal information
      dateOfBirth: extractField(article, 'dobDisplay', 'dobdisplay', 'dob', 'dateOfBirth', 'dateofbirth', 'birthdate'),
      placeOfBirth: extractField(article, 'birthplace', 'placeOfBirth', 'placeofbirth', 'birthPlace', 'birthplace'),
      dateOfDeath: extractField(article, 'dodDisplay', 'doddisplay', 'dod', 'dateOfDeath', 'dateofdeath', 'deathdate'),
      placeOfDeath: extractField(article, 'deathplace', 'placeOfDeath', 'placeofdeath', 'deathPlace'),
      currentResidence: extractField(article, 'residence', 'currentResidence', 'currentresidence', 'home', 'location'),

      // Additional traits
      languages: article.languages ? [stripBBCode(article.languages)] : [],
      religiousBelief: extractField(article, 'deity', 'religion', 'faith', 'belief'),
      education: extractField(article, 'education', 'schooling', 'training'),
      occupation: extractField(article, 'employment', 'occupation', 'job', 'profession', 'work'),

      // Quotes and personality
      famousQuotes: extractField(article, 'quotes', 'famousQuotes', 'famousquotes'),
      likes: extractField(article, 'likesDislikes', 'likesdislikes', 'likes_dislikes', 'preferences'),

      // Character development fields from sidepanelcontenttop
      physicalCondition: extractField(article, 'sidepanelcontenttop', 'physicalCondition', 'physicalcondition'),

      // Mental and emotional traits
      mentalHealth: extractField(article, 'mentalTraumas', 'mentaltraumas', 'mental_traumas', 'mentalHealth', 'mentalhealth'),
      intellectualTraits: extractField(article, 'intellectualCharacteristics', 'intellectualcharacteristics', 'intellectual_characteristics', 'intellect'),
      valuesEthicsMorals: extractField(article, 'morality', 'values', 'ethics', 'morals'),

      // Social aspects
      presentation: extractField(article, 'presentation', 'manner', 'demeanor'),
      sexualOrientation: extractField(article, 'sexuality', 'sexualOrientation', 'sexualorientation', 'sexual_orientation'),
      genderIdentity: extractField(article, 'genderidentity', 'genderIdentity', 'gender_identity'),

      // Image mapping - check multiple possible fields
      imageUrl: extractField(article, 'imageUrl', 'imageurl', 'image_url', 'picture', 'photo') 
        || article.portrait?.url 
        || article.cover?.url 
        || article.image?.url 
        || article.images?.portrait?.url
        || '',
      imageCaption: extractField(article, 'imageCaption', 'imagecaption', 'image_caption')
        || article.portrait?.title 
        || article.cover?.title 
        || article.image?.title 
        || '',

      // Metadata
      genre: 'Fantasy', // Default genre for World Anvil imports
      notebookId: notebookId,
      userId: userId,
      
      // Import tracking
      importSource: 'world_anvil',
      importExternalId: article.id || article.uuid || article.externalId || ''
    };
    return characterData;

  } else if (contentType === 'species') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      classification: extractField(article, 'classification', 'category', 'type'),
      physicalDescription: extractField(article, 'physicalAppearance', 'physicalappearance', 'appearance', 'description', 'content', 'excerpt'),
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
      imageUrl: article.portrait?.url || article.cover?.url || article.image?.url || article.images?.portrait?.url || '',
      imageCaption: article.portrait?.title || article.cover?.title || article.image?.title || '',
    };
  } else if (contentType === 'location') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      locationType: extractField(article, 'locationType', 'locationtype', 'type') || 'other',
      description: extractField(article, 'description', 'content', 'excerpt', 'summary'),
      geography: extractField(article, 'geography', 'terrain', 'topography', 'landscape'),
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
      imageUrl: article.portrait?.url || article.cover?.url || article.image?.url || article.images?.portrait?.url || '',
      imageCaption: article.portrait?.title || article.cover?.title || article.image?.title || '',
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
      physicalTraits: extractField(article, 'physicalTraits', 'physicaltraits', 'appearance', 'physicalAppearance', 'physicalappearance', 'description'),
      culturalTraits: extractField(article, 'culturalTraits', 'culturaltraits', 'culture', 'content', 'description', 'excerpt'),
      traditions: parseArray(article.traditions || article.customs || article.practices),
      language: extractField(article, 'language', 'languages', 'tongue'),
      religion: extractField(article, 'religion', 'faith', 'belief', 'deity'),
      socialStructure: extractField(article, 'socialStructure', 'socialstructure', 'society', 'hierarchy'),
      history: extractField(article, 'history', 'background', 'origins'),
      geography: extractField(article, 'geography', 'territory', 'lands'),
      values: parseArray(article.values || article.beliefs),
      customs: parseArray(article.customs || article.practices || article.traditions),
      genre: 'Fantasy',
      imageUrl: article.portrait?.url || article.cover?.url || article.image?.url || article.images?.portrait?.url || '',
      imageCaption: article.portrait?.title || article.cover?.title || article.image?.title || '',
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
      imageUrl: article.portrait?.url || article.cover?.url || article.image?.url || article.images?.portrait?.url || '',
      imageCaption: article.portrait?.title || article.cover?.title || article.image?.title || '',
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

// Upload and start import job (with stricter rate limiting)
router.post('/upload', uploadRateLimiter, upload.array('file'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
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

    // Process all uploaded files
    const allArticles: WorldAnvilArticle[] = [];
    let importSource = 'unknown';
    const files = req.files as Express.Multer.File[];

    for (const file of files) {
      const filename = file.originalname.toLowerCase();
      const isZip = file.mimetype === 'application/zip' || 
                    file.mimetype === 'application/x-zip-compressed' || 
                    filename.endsWith('.zip');
      const isHtml = file.mimetype === 'text/html' || filename.endsWith('.html');
      const isRtf = file.mimetype === 'application/rtf' || 
                    file.mimetype === 'text/rtf' || 
                    filename.endsWith('.rtf');
      const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                     filename.endsWith('.docx');
      const isPdf = file.mimetype === 'application/pdf' || filename.endsWith('.pdf');

      if (isZip) {
        console.log(`[Import] Processing World Anvil ZIP: ${file.originalname}`);
        const parsed = parseWorldAnvilExport(file.buffer);
        allArticles.push(...parsed.articles);
        importSource = 'world_anvil';
      } else if (isHtml) {
        console.log(`[Import] Processing Campfire HTML: ${file.originalname}`);
        const articles = parseCampfireHTML(file.buffer, file.originalname);
        allArticles.push(...articles);
        if (importSource === 'unknown' || importSource === 'campfire') {
          importSource = 'campfire';
        } else {
          importSource = 'mixed';
        }
      } else if (isRtf) {
        console.log(`[Import] Processing Campfire RTF: ${file.originalname}`);
        const articles = await parseCampfireRTF(file.buffer, file.originalname);
        allArticles.push(...articles);
        if (importSource === 'unknown' || importSource === 'campfire') {
          importSource = 'campfire';
        } else {
          importSource = 'mixed';
        }
      } else if (isDocx) {
        console.log(`[Import] Processing Campfire DOCX: ${file.originalname}`);
        const articles = await parseCampfireDOCX(file.buffer, file.originalname);
        allArticles.push(...articles);
        if (importSource === 'unknown' || importSource === 'campfire') {
          importSource = 'campfire';
        } else {
          importSource = 'mixed';
        }
      } else if (isPdf) {
        console.log(`[Import] Processing Campfire PDF: ${file.originalname}`);
        const articles = await parseCampfirePDF(file.buffer, file.originalname);
        allArticles.push(...articles);
        if (importSource === 'unknown' || importSource === 'campfire') {
          importSource = 'campfire';
        } else {
          importSource = 'mixed';
        }
      } else {
        console.warn(`[Import] Unknown file type: ${file.originalname}`);
      }
    }

    console.log(`[Import] Total articles from all files: ${allArticles.length}`);

    // Create import job
    const job = await storage.createImportJob({
      userId,
      notebookId,
      source: importSource,
      status: 'pending',
      totalItems: allArticles.length,
      processedItems: 0,
      progress: 0,
    });

    // Start processing in background
    processImport(job.id, { articles: allArticles, totalItems: allArticles.length }, userId, notebookId).catch(console.error);

    res.json({
      jobId: job.id,
      totalItems: allArticles.length,
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

    // Batch fetch ALL existing saved items for this notebook in ONE query (Issue 1 fix)
    const existingItems = await storage.getSavedItemsByNotebookBatch(userId, notebookId);
    console.log(`[Import ${jobId}] Found ${existingItems.length} existing saved items in notebook`);

    // Build in-memory Sets for O(1) duplicate detection
    // Set 1: Check by itemType:itemId
    const existingIdsSet = new Set(
      existingItems.map(item => `${item.itemType}:${item.itemId}`)
    );
    // Set 2: Check by itemType:displayName (full name for characters, name for others)
    const existingTitlesSet = new Set(
      existingItems
        .map(item => {
          const itemType = item.itemType;
          let displayName = '';
          
          if (itemType === 'character' && item.itemData) {
            const given = item.itemData.givenName || '';
            const family = item.itemData.familyName || '';
            displayName = [given, family].filter(Boolean).join(' ').trim();
          } else if (item.itemData?.name) {
            displayName = item.itemData.name;
          } else if (item.itemData?.title) {
            displayName = item.itemData.title;
          }
          
          return displayName ? `${itemType}:${displayName.toLowerCase().trim()}` : null;
        })
        .filter(Boolean) as string[]
    );

    console.log(`[Import ${jobId}] Built duplicate detection Sets: ${existingIdsSet.size} IDs, ${existingTitlesSet.size} titles`);

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
          // Check if species with this name already exists in the notebook
          const existingSpecies = await storage.findSpeciesByName(article.title, notebookId);
          
          if (existingSpecies) {
            // Use existing species instead of creating duplicate
            createdItem = existingSpecies;
            console.log(`[Import ${jobId}] ↻ Reusing existing species: ${article.title}`);
          } else {
            // Create new species
            createdItem = await storage.createSpecies(mapped as any);
            results.imported.push(createdItem.id);
            console.log(`[Import ${jobId}] ✓ Created species: ${article.title}`);
          }
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

        // Create saved_items entry for notebook visibility (with duplicate detection)
        if (createdItem) {
          try {
            // O(1) duplicate detection using in-memory Sets (Issue 1 & 2 fix)
            const itemKey = `${contentType}:${createdItem.id}`;
            
            // Get display name from created item (full name for characters, name for others)
            let displayName = '';
            if (contentType === 'character') {
              const given = createdItem.givenName || '';
              const family = createdItem.familyName || '';
              displayName = [given, family].filter(Boolean).join(' ').trim();
            } else {
              displayName = createdItem.name || createdItem.title || '';
            }
            const titleKey = displayName ? `${contentType}:${displayName.toLowerCase().trim()}` : null;

            // Check both ID and title for duplicates
            const isDuplicateById = existingIdsSet.has(itemKey);
            const isDuplicateByTitle = titleKey ? existingTitlesSet.has(titleKey) : false;

            if (isDuplicateById) {
              // Skip creating duplicate saved_item (matched by ID)
              const skipReason = `${article.title} (${contentType}) - already exists in notebook (ID match)`;
              results.skipped.push(skipReason);
              console.log(`[Import ${jobId}] ⊘ Skipped duplicate (ID match): ${skipReason}`);
            } else if (isDuplicateByTitle) {
              // Skip creating duplicate saved_item (matched by title)
              const skipReason = `${article.title} (${contentType}) - already exists in notebook (title match)`;
              results.skipped.push(skipReason);
              console.log(`[Import ${jobId}] ⊘ Skipped duplicate (title match): ${skipReason}`);
            } else {
              // Create new saved_item
              const savedItem = await storage.saveItem({
                userId,
                notebookId,
                itemType: contentType,
                itemId: createdItem.id,
                itemData: createdItem
              });
              
              // Add to Sets to prevent duplicates within same import
              existingIdsSet.add(itemKey);
              if (titleKey) {
                existingTitlesSet.add(titleKey);
              }
              
              console.log(`[Import ${jobId}] ✓ Created saved_item ${savedItem.id} for ${contentType} "${article.title}" in notebook ${notebookId}`);
            }
          } catch (saveError) {
            console.error(`[Import ${jobId}] ✗ Failed to check/create saved_item for ${contentType} "${article.title}":`, saveError);
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