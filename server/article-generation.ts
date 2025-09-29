import { storage } from "./storage";

/**
 * HTML escaping utility to prevent XSS attacks
 * Escapes HTML special characters in user-supplied content
 */
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Helper to create safe HTML list from array of strings
 */
function createSafeList(items: string[] | null | undefined): string {
  if (!items || items.length === 0) return '';
  const safeItems = items.map(item => `<li>${escapeHtml(item)}</li>`).join('\n');
  return `<ul>\n${safeItems}\n</ul>`;
}

/**
 * Helper to create safe HTML paragraph with optional label
 */
function createSafeParagraph(label: string | null, content: string | null | undefined): string {
  if (!content) return '';
  const safeContent = escapeHtml(content);
  if (label) {
    return `<p><strong>${escapeHtml(label)}:</strong> ${safeContent}</p>`;
  }
  return `<p>${safeContent}</p>`;
}

/**
 * Generate article content for characters
 */
function generateCharacterArticle(character: any): string {
  const sections: string[] = [];
  
  // Header with character name
  if (character.givenName || character.familyName) {
    const fullName = [character.givenName, character.familyName].filter(Boolean).join(' ');
    sections.push(`<h1>${escapeHtml(fullName)}</h1>`);
    if (character.nickname) {
      sections.push(`<p><em>Also known as: ${escapeHtml(character.nickname)}</em></p>`);
    }
  }
  
  // Basic Information
  const basicInfo: string[] = [];
  if (character.age) basicInfo.push(createSafeParagraph('Age', character.age));
  if (character.occupation) basicInfo.push(createSafeParagraph('Occupation', character.occupation));
  if (character.species) basicInfo.push(createSafeParagraph('Species', character.species));
  if (character.currentLocation) basicInfo.push(createSafeParagraph('Location', character.currentLocation));
  
  if (basicInfo.length > 0) {
    sections.push(`<h2>Basic Information</h2>`);
    sections.push(basicInfo.join('\n'));
  }
  
  // Physical Description
  if (character.physicalDescription || character.height || character.build || character.hairColor || character.eyeColor) {
    sections.push(`<h2>Physical Appearance</h2>`);
    if (character.physicalDescription) {
      sections.push(createSafeParagraph(null, character.physicalDescription));
    }
    
    const physicalDetails: string[] = [];
    if (character.height) physicalDetails.push(createSafeParagraph('Height', character.height));
    if (character.build) physicalDetails.push(createSafeParagraph('Build', character.build));
    if (character.hairColor) physicalDetails.push(createSafeParagraph('Hair', character.hairColor));
    if (character.eyeColor) physicalDetails.push(createSafeParagraph('Eyes', character.eyeColor));
    
    if (physicalDetails.length > 0) {
      sections.push(physicalDetails.join('\n'));
    }
  }
  
  // Personality & Psychology
  if (character.personality || character.motivation || character.flaw || character.strength) {
    sections.push(`<h2>Personality</h2>`);
    if (character.personality) {
      sections.push(createSafeParagraph('Personality', character.personality));
    }
    if (character.motivation) {
      sections.push(createSafeParagraph('Motivation', character.motivation));
    }
    if (character.strength) {
      sections.push(createSafeParagraph('Strength', character.strength));
    }
    if (character.flaw) {
      sections.push(createSafeParagraph('Flaw', character.flaw));
    }
  }
  
  // Backstory
  if (character.backstory) {
    sections.push(`<h2>Background</h2>`);
    sections.push(createSafeParagraph(null, character.backstory));
  }
  
  // Skills & Abilities
  if (character.mainSkills || character.proficiencies || character.supernaturalPowers) {
    sections.push(`<h2>Skills & Abilities</h2>`);
    if (character.mainSkills) {
      sections.push(createSafeParagraph('Main Skills', character.mainSkills));
    }
    if (character.proficiencies) {
      sections.push(createSafeParagraph('Proficiencies', character.proficiencies));
    }
    if (character.supernaturalPowers) {
      sections.push(createSafeParagraph('Supernatural Powers', character.supernaturalPowers));
    }
  }
  
  // Relationships
  if (character.family || character.allies || character.enemies) {
    sections.push(`<h2>Relationships</h2>`);
    if (character.family) {
      const familyText = Array.isArray(character.family) ? character.family.join(', ') : character.family;
      sections.push(createSafeParagraph('Family', familyText));
    }
    if (character.allies) {
      sections.push(createSafeParagraph('Allies', character.allies));
    }
    if (character.enemies) {
      sections.push(createSafeParagraph('Enemies', character.enemies));
    }
  }
  
  return sections.join('\n\n');
}

/**
 * Generate article content for locations
 */
function generateLocationArticle(location: any): string {
  const sections: string[] = [];
  
  // Header with location name
  if (location.name) {
    sections.push(`<h1>${escapeHtml(location.name)}</h1>`);
    if (location.locationType) {
      sections.push(`<p><em>Type: ${escapeHtml(location.locationType)}</em></p>`);
    }
  }
  
  // General Description
  if (location.description) {
    sections.push(`<h2>Overview</h2>`);
    sections.push(createSafeParagraph(null, location.description));
  }
  
  // Geography & Environment
  if (location.geography || location.climate) {
    sections.push(`<h2>Geography & Climate</h2>`);
    if (location.geography) {
      sections.push(createSafeParagraph('Geography', location.geography));
    }
    if (location.climate) {
      sections.push(createSafeParagraph('Climate', location.climate));
    }
  }
  
  // Population & Government
  if (location.population || location.government) {
    sections.push(`<h2>Society & Governance</h2>`);
    if (location.population) {
      sections.push(createSafeParagraph('Population', location.population));
    }
    if (location.government) {
      sections.push(createSafeParagraph('Government', location.government));
    }
  }
  
  // Economy & Culture
  if (location.economy || location.culture) {
    sections.push(`<h2>Economy & Culture</h2>`);
    if (location.economy) {
      sections.push(createSafeParagraph('Economy', location.economy));
    }
    if (location.culture) {
      sections.push(createSafeParagraph('Culture', location.culture));
    }
  }
  
  // History
  if (location.history) {
    sections.push(`<h2>History</h2>`);
    sections.push(createSafeParagraph(null, location.history));
  }
  
  // Notable Features
  if (location.notableFeatures && location.notableFeatures.length > 0) {
    sections.push(`<h2>Notable Features</h2>`);
    sections.push(createSafeList(location.notableFeatures));
  }
  
  // Landmarks
  if (location.landmarks && location.landmarks.length > 0) {
    sections.push(`<h2>Landmarks</h2>`);
    sections.push(createSafeList(location.landmarks));
  }
  
  // Resources & Threats
  if (location.resources && location.resources.length > 0) {
    sections.push(`<h2>Resources</h2>`);
    sections.push(createSafeList(location.resources));
  }
  
  if (location.threats && location.threats.length > 0) {
    sections.push(`<h2>Threats & Dangers</h2>`);
    sections.push(createSafeList(location.threats));
  }
  
  return sections.join('\n\n');
}

/**
 * Content type article generators mapping
 */
const articleGenerators = {
  characters: generateCharacterArticle,
  locations: generateLocationArticle,
  // TODO: Add remaining content types
} as const;

export type SupportedContentType = keyof typeof articleGenerators;

/**
 * Central article generation service
 * Handles notebook/user validation and generates safe HTML articles
 */
export async function generateArticleForContent(
  contentType: SupportedContentType,
  contentId: string,
  userId: string,
  notebookId: string
): Promise<any> {
  // Validate user owns the notebook
  const userNotebook = await storage.getNotebook(notebookId, userId);
  if (!userNotebook) {
    throw new Error('Notebook not found or access denied');
  }
  
  // Get the content based on type
  let content: any;
  switch (contentType) {
    case 'characters':
      content = await storage.getCharacter(contentId, userId, notebookId);
      break;
    case 'locations':
      content = await storage.getLocation(contentId, userId, notebookId);
      break;
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
  
  if (!content) {
    throw new Error('Content not found');
  }
  
  // Generate safe HTML article
  const generator = articleGenerators[contentType];
  const articleContent = generator(content);
  
  // Update the content with generated article
  let updatedContent: any;
  switch (contentType) {
    case 'characters':
      updatedContent = await storage.updateCharacter(contentId, userId, { articleContent }, notebookId);
      break;
    case 'locations':
      updatedContent = await storage.updateLocation(contentId, userId, { articleContent }, notebookId);
      break;
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
  
  return updatedContent;
}