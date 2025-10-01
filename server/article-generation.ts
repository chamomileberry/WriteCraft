import { storage } from "./storage";
import type {
  Setting, Conflict, Theme, Creature, Plant, Item, Organization,
  Species, Ethnicity, Culture, Document, Food, Drink
} from '@shared/schema';

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
 * Generate article content for settings
 */
function generateSettingArticle(setting: Setting): string {
  const sections: string[] = [];

  // Header
  if (setting.name) {
    sections.push(`<h1>${escapeHtml(setting.name)}</h1>`);
    if (setting.settingType) {
      sections.push(`<p><em>Type: ${escapeHtml(setting.settingType)}</em></p>`);
    }
  }

  // Basic Information
  const basicInfo: string[] = [];
  if (setting.location) basicInfo.push(createSafeParagraph('Location', setting.location));
  if (setting.timePeriod) basicInfo.push(createSafeParagraph('Time Period', setting.timePeriod));
  if (setting.population) basicInfo.push(createSafeParagraph('Population', setting.population));
  if (setting.climate) basicInfo.push(createSafeParagraph('Climate', setting.climate));

  if (basicInfo.length > 0) {
    sections.push(`<h2>Basic Information</h2>`);
    sections.push(basicInfo.join('\n'));
  }

  // Description & Atmosphere
  if (setting.description) {
    sections.push(`<h2>Description</h2>`);
    sections.push(createSafeParagraph(null, setting.description));
  }

  if (setting.atmosphere) {
    sections.push(`<h2>Atmosphere</h2>`);
    sections.push(createSafeParagraph(null, setting.atmosphere));
  }

  // Cultural Elements
  if (setting.culturalElements && setting.culturalElements.length > 0) {
    sections.push(`<h2>Cultural Elements</h2>`);
    sections.push(createSafeList(setting.culturalElements));
  }

  // Notable Features
  if (setting.notableFeatures && setting.notableFeatures.length > 0) {
    sections.push(`<h2>Notable Features</h2>`);
    sections.push(createSafeList(setting.notableFeatures));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for conflicts
 */
function generateConflictArticle(conflict: Conflict): string {
  const sections: string[] = [];

  // Header
  if (conflict.title) {
    sections.push(`<h1>${escapeHtml(conflict.title)}</h1>`);
    if (conflict.type) {
      sections.push(`<p><em>Type: ${escapeHtml(conflict.type)}</em></p>`);
    }
  }

  // Description
  if (conflict.description) {
    sections.push(`<h2>Overview</h2>`);
    sections.push(createSafeParagraph(null, conflict.description));
  }

  // Stakes & Impact
  if (conflict.stakes) {
    sections.push(`<h2>Stakes</h2>`);
    sections.push(createSafeParagraph(null, conflict.stakes));
  }

  if (conflict.emotionalImpact) {
    sections.push(`<h2>Emotional Impact</h2>`);
    sections.push(createSafeParagraph(null, conflict.emotionalImpact));
  }

  // Obstacles
  if (conflict.obstacles && conflict.obstacles.length > 0) {
    sections.push(`<h2>Obstacles</h2>`);
    sections.push(createSafeList(conflict.obstacles));
  }

  // Potential Resolutions
  if (conflict.potentialResolutions && conflict.potentialResolutions.length > 0) {
    sections.push(`<h2>Potential Resolutions</h2>`);
    sections.push(createSafeList(conflict.potentialResolutions));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for themes
 */
function generateThemeArticle(theme: Theme): string {
  const sections: string[] = [];

  // Header
  if (theme.title) {
    sections.push(`<h1>${escapeHtml(theme.title)}</h1>`);
  }

  // Description & Core Message
  if (theme.description) {
    sections.push(`<h2>Description</h2>`);
    sections.push(createSafeParagraph(null, theme.description));
  }

  if (theme.coreMessage) {
    sections.push(`<h2>Core Message</h2>`);
    sections.push(createSafeParagraph(null, theme.coreMessage));
  }

  // Symbolic Elements
  if (theme.symbolicElements && theme.symbolicElements.length > 0) {
    sections.push(`<h2>Symbolic Elements</h2>`);
    sections.push(createSafeList(theme.symbolicElements));
  }

  // Questions
  if (theme.questions && theme.questions.length > 0) {
    sections.push(`<h2>Key Questions</h2>`);
    sections.push(createSafeList(theme.questions));
  }

  // Conflicts
  if (theme.conflicts && theme.conflicts.length > 0) {
    sections.push(`<h2>Related Conflicts</h2>`);
    sections.push(createSafeList(theme.conflicts));
  }

  // Examples
  if (theme.examples && theme.examples.length > 0) {
    sections.push(`<h2>Examples</h2>`);
    sections.push(createSafeList(theme.examples));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for creatures
 */
function generateCreatureArticle(creature: Creature): string {
  const sections: string[] = [];

  // Header
  if (creature.name) {
    sections.push(`<h1>${escapeHtml(creature.name)}</h1>`);
    if (creature.creatureType) {
      sections.push(`<p><em>Type: ${escapeHtml(creature.creatureType)}</em></p>`);
    }
  }

  // Physical Description
  if (creature.physicalDescription) {
    sections.push(`<h2>Physical Description</h2>`);
    sections.push(createSafeParagraph(null, creature.physicalDescription));
  }

  // Habitat & Behavior
  if (creature.habitat) {
    sections.push(`<h2>Habitat</h2>`);
    sections.push(createSafeParagraph(null, creature.habitat));
  }

  if (creature.behavior) {
    sections.push(`<h2>Behavior</h2>`);
    sections.push(createSafeParagraph(null, creature.behavior));
  }

  // Abilities
  if (creature.abilities && creature.abilities.length > 0) {
    sections.push(`<h2>Abilities</h2>`);
    sections.push(createSafeList(creature.abilities));
  }

  // Cultural Significance
  if (creature.culturalSignificance) {
    sections.push(`<h2>Cultural Significance</h2>`);
    sections.push(createSafeParagraph(null, creature.culturalSignificance));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for plants
 */
function generatePlantArticle(plant: any): string {
  const sections: string[] = [];

  // Header
  if (plant.name) {
    sections.push(`<h1>${escapeHtml(plant.name)}</h1>`);
    if (plant.scientificName) {
      sections.push(`<p><em>Scientific Name: ${escapeHtml(plant.scientificName)}</em></p>`);
    }
    if (plant.type) {
      sections.push(`<p><em>Type: ${escapeHtml(plant.type)}</em></p>`);
    }
  }

  // Description
  if (plant.description) {
    sections.push(`<h2>Description</h2>`);
    sections.push(createSafeParagraph(null, plant.description));
  }

  // Characteristics
  if (plant.characteristics && Array.isArray(plant.characteristics) && plant.characteristics.length > 0) {
    sections.push(`<h2>Characteristics</h2>`);
    sections.push(createSafeList(plant.characteristics));
  }

  // Growing Information
  const growingInfo: string[] = [];
  if (plant.habitat) growingInfo.push(createSafeParagraph('Habitat', plant.habitat));
  if (plant.hardinessZone) growingInfo.push(createSafeParagraph('Hardiness Zone', plant.hardinessZone));
  if (plant.bloomingSeason) growingInfo.push(createSafeParagraph('Blooming Season', plant.bloomingSeason));

  if (growingInfo.length > 0) {
    sections.push(`<h2>Growing Information</h2>`);
    sections.push(growingInfo.join('\n'));
  }

  // Care Instructions
  if (plant.careInstructions) {
    sections.push(`<h2>Care Instructions</h2>`);
    sections.push(createSafeParagraph(null, plant.careInstructions));
  }

  // If no content was generated, provide a fallback
  if (sections.length === 0) {
    sections.push(`<h1>Plant Information</h1>`);
    sections.push(`<p>No detailed information available for this plant.</p>`);
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for items
 */
function generateItemArticle(item: Item): string {
  const sections: string[] = [];

  // Header
  if (item.name) {
    sections.push(`<h1>${escapeHtml(item.name)}</h1>`);
    if (item.itemType) {
      sections.push(`<p><em>Type: ${escapeHtml(item.itemType)}</em></p>`);
    }
  }

  // Description
  if (item.description) {
    sections.push(`<h2>Description</h2>`);
    sections.push(createSafeParagraph(null, item.description));
  }

  // Basic Properties
  const basicProps: string[] = [];
  if (item.rarity) basicProps.push(createSafeParagraph('Rarity', item.rarity));
  if (item.value) basicProps.push(createSafeParagraph('Value', item.value));
  if (item.weight) basicProps.push(createSafeParagraph('Weight', item.weight));

  if (basicProps.length > 0) {
    sections.push(`<h2>Properties</h2>`);
    sections.push(basicProps.join('\n'));
  }

  // Materials
  if (item.materials && item.materials.length > 0) {
    sections.push(`<h2>Materials</h2>`);
    sections.push(createSafeList(item.materials));
  }

  // Special Properties
  if (item.properties && item.properties.length > 0) {
    sections.push(`<h2>Special Properties</h2>`);
    sections.push(createSafeList(item.properties));
  }

  // Abilities
  if (item.abilities && item.abilities.length > 0) {
    sections.push(`<h2>Abilities</h2>`);
    sections.push(createSafeList(item.abilities));
  }

  // History & Crafting
  if (item.history) {
    sections.push(`<h2>History</h2>`);
    sections.push(createSafeParagraph(null, item.history));
  }

  if (item.crafting) {
    sections.push(`<h2>Crafting</h2>`);
    sections.push(createSafeParagraph(null, item.crafting));
  }

  if (item.requirements) {
    sections.push(`<h2>Requirements</h2>`);
    sections.push(createSafeParagraph(null, item.requirements));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for organizations
 */
function generateOrganizationArticle(organization: Organization): string {
  const sections: string[] = [];

  // Header
  if (organization.name) {
    sections.push(`<h1>${escapeHtml(organization.name)}</h1>`);
    if (organization.organizationType) {
      sections.push(`<p><em>Type: ${escapeHtml(organization.organizationType)}</em></p>`);
    }
  }

  // Purpose & Description
  if (organization.purpose) {
    sections.push(`<h2>Purpose</h2>`);
    sections.push(createSafeParagraph(null, organization.purpose));
  }

  if (organization.description) {
    sections.push(`<h2>Description</h2>`);
    sections.push(createSafeParagraph(null, organization.description));
  }

  // Structure & Leadership
  if (organization.structure) {
    sections.push(`<h2>Structure</h2>`);
    sections.push(createSafeParagraph(null, organization.structure));
  }

  if (organization.leadership) {
    sections.push(`<h2>Leadership</h2>`);
    sections.push(createSafeParagraph(null, organization.leadership));
  }

  // Members & Operations
  if (organization.members) {
    sections.push(`<h2>Members</h2>`);
    sections.push(createSafeParagraph(null, organization.members));
  }

  if (organization.headquarters) {
    sections.push(`<h2>Headquarters</h2>`);
    sections.push(createSafeParagraph(null, organization.headquarters));
  }

  // Goals & Influence
  if (organization.goals) {
    sections.push(`<h2>Goals</h2>`);
    sections.push(createSafeParagraph(null, organization.goals));
  }

  if (organization.influence) {
    sections.push(`<h2>Influence</h2>`);
    sections.push(createSafeParagraph(null, organization.influence));
  }

  // Resources
  if (organization.resources) {
    sections.push(`<h2>Resources</h2>`);
    sections.push(createSafeParagraph(null, organization.resources));
  }

  // History
  if (organization.history) {
    sections.push(`<h2>History</h2>`);
    sections.push(createSafeParagraph(null, organization.history));
  }

  // Allies & Enemies
  if (organization.allies && organization.allies.length > 0) {
    sections.push(`<h2>Allies</h2>`);
    sections.push(createSafeList(organization.allies));
  }

  if (organization.enemies && organization.enemies.length > 0) {
    sections.push(`<h2>Enemies</h2>`);
    sections.push(createSafeList(organization.enemies));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for species
 */
function generateSpeciesArticle(species: Species): string {
  const sections: string[] = [];

  // Header
  if (species.name) {
    sections.push(`<h1>${escapeHtml(species.name)}</h1>`);
    if (species.classification) {
      sections.push(`<p><em>Classification: ${escapeHtml(species.classification)}</em></p>`);
    }
  }

  // Physical Description
  if (species.physicalDescription) {
    sections.push(`<h2>Physical Description</h2>`);
    sections.push(createSafeParagraph(null, species.physicalDescription));
  }

  // Habitat & Behavior
  if (species.habitat) {
    sections.push(`<h2>Habitat</h2>`);
    sections.push(createSafeParagraph(null, species.habitat));
  }

  if (species.behavior) {
    sections.push(`<h2>Behavior</h2>`);
    sections.push(createSafeParagraph(null, species.behavior));
  }

  // Biology
  const biologyInfo: string[] = [];
  if (species.diet) biologyInfo.push(createSafeParagraph('Diet', species.diet));
  if (species.lifespan) biologyInfo.push(createSafeParagraph('Lifespan', species.lifespan));
  if (species.reproduction) biologyInfo.push(createSafeParagraph('Reproduction', species.reproduction));

  if (biologyInfo.length > 0) {
    sections.push(`<h2>Biology</h2>`);
    sections.push(biologyInfo.join('\n'));
  }

  // Intelligence & Social Structure
  if (species.intelligence) {
    sections.push(`<h2>Intelligence</h2>`);
    sections.push(createSafeParagraph(null, species.intelligence));
  }

  if (species.socialStructure) {
    sections.push(`<h2>Social Structure</h2>`);
    sections.push(createSafeParagraph(null, species.socialStructure));
  }

  // Cultural Traits
  if (species.culturalTraits) {
    sections.push(`<h2>Cultural Traits</h2>`);
    sections.push(createSafeParagraph(null, species.culturalTraits));
  }

  // Abilities & Weaknesses
  if (species.abilities && species.abilities.length > 0) {
    sections.push(`<h2>Abilities</h2>`);
    sections.push(createSafeList(species.abilities));
  }

  if (species.weaknesses && species.weaknesses.length > 0) {
    sections.push(`<h2>Weaknesses</h2>`);
    sections.push(createSafeList(species.weaknesses));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for ethnicities
 */
function generateEthnicityArticle(ethnicity: Ethnicity): string {
  const sections: string[] = [];

  // Header
  if (ethnicity.name) {
    sections.push(`<h1>${escapeHtml(ethnicity.name)}</h1>`);
  }

  // Origin & Geography
  if (ethnicity.origin) {
    sections.push(`<h2>Origin</h2>`);
    sections.push(createSafeParagraph(null, ethnicity.origin));
  }

  if (ethnicity.geography) {
    sections.push(`<h2>Geography</h2>`);
    sections.push(createSafeParagraph(null, ethnicity.geography));
  }

  // Physical & Cultural Traits
  if (ethnicity.physicalTraits) {
    sections.push(`<h2>Physical Traits</h2>`);
    sections.push(createSafeParagraph(null, ethnicity.physicalTraits));
  }

  if (ethnicity.culturalTraits) {
    sections.push(`<h2>Cultural Traits</h2>`);
    sections.push(createSafeParagraph(null, ethnicity.culturalTraits));
  }

  // Language & Religion
  if (ethnicity.language) {
    sections.push(`<h2>Language</h2>`);
    sections.push(createSafeParagraph(null, ethnicity.language));
  }

  if (ethnicity.religion) {
    sections.push(`<h2>Religion</h2>`);
    sections.push(createSafeParagraph(null, ethnicity.religion));
  }

  // Social Structure
  if (ethnicity.socialStructure) {
    sections.push(`<h2>Social Structure</h2>`);
    sections.push(createSafeParagraph(null, ethnicity.socialStructure));
  }

  // History
  if (ethnicity.history) {
    sections.push(`<h2>History</h2>`);
    sections.push(createSafeParagraph(null, ethnicity.history));
  }

  // Traditions
  if (ethnicity.traditions && ethnicity.traditions.length > 0) {
    sections.push(`<h2>Traditions</h2>`);
    sections.push(createSafeList(ethnicity.traditions));
  }

  // Values & Customs
  if (ethnicity.values && ethnicity.values.length > 0) {
    sections.push(`<h2>Values</h2>`);
    sections.push(createSafeList(ethnicity.values));
  }

  if (ethnicity.customs && ethnicity.customs.length > 0) {
    sections.push(`<h2>Customs</h2>`);
    sections.push(createSafeList(ethnicity.customs));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for cultures
 */
function generateCultureArticle(culture: Culture): string {
  const sections: string[] = [];

  // Header
  if (culture.name) {
    sections.push(`<h1>${escapeHtml(culture.name)}</h1>`);
  }

  // Description
  if (culture.description) {
    sections.push(`<h2>Overview</h2>`);
    sections.push(createSafeParagraph(null, culture.description));
  }

  // Values & Beliefs
  if (culture.values && culture.values.length > 0) {
    sections.push(`<h2>Values</h2>`);
    sections.push(createSafeList(culture.values));
  }

  if (culture.beliefs && culture.beliefs.length > 0) {
    sections.push(`<h2>Beliefs</h2>`);
    sections.push(createSafeList(culture.beliefs));
  }

  // Social Structure
  if (culture.socialNorms && culture.socialNorms.length > 0) {
    sections.push(`<h2>Social Norms</h2>`);
    sections.push(createSafeList(culture.socialNorms));
  }

  if (culture.governance) {
    sections.push(`<h2>Governance</h2>`);
    sections.push(createSafeParagraph(null, culture.governance));
  }

  // Language & Arts
  if (culture.language) {
    sections.push(`<h2>Language</h2>`);
    sections.push(createSafeParagraph(null, culture.language));
  }

  if (culture.arts) {
    sections.push(`<h2>Arts</h2>`);
    sections.push(createSafeParagraph(null, culture.arts));
  }

  // Society & Economy
  if (culture.economy) {
    sections.push(`<h2>Economy</h2>`);
    sections.push(createSafeParagraph(null, culture.economy));
  }

  if (culture.education) {
    sections.push(`<h2>Education</h2>`);
    sections.push(createSafeParagraph(null, culture.education));
  }

  if (culture.family) {
    sections.push(`<h2>Family Structure</h2>`);
    sections.push(createSafeParagraph(null, culture.family));
  }

  if (culture.technology) {
    sections.push(`<h2>Technology</h2>`);
    sections.push(createSafeParagraph(null, culture.technology));
  }

  // Traditions & Ceremonies
  if (culture.traditions && culture.traditions.length > 0) {
    sections.push(`<h2>Traditions</h2>`);
    sections.push(createSafeList(culture.traditions));
  }

  if (culture.ceremonies && culture.ceremonies.length > 0) {
    sections.push(`<h2>Ceremonies</h2>`);
    sections.push(createSafeList(culture.ceremonies));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for documents
 */
function generateDocumentArticle(document: Document): string {
  const sections: string[] = [];

  // Header
  if (document.title) {
    sections.push(`<h1>${escapeHtml(document.title)}</h1>`);
    if (document.documentType) {
      sections.push(`<p><em>Type: ${escapeHtml(document.documentType)}</em></p>`);
    }
  }

  // Content
  if (document.content) {
    sections.push(`<h2>Content</h2>`);
    sections.push(createSafeParagraph(null, document.content));
  }

  // Authorship & Details
  const documentInfo: string[] = [];
  if (document.author) documentInfo.push(createSafeParagraph('Author', document.author));
  if (document.language) documentInfo.push(createSafeParagraph('Language', document.language));
  if (document.age) documentInfo.push(createSafeParagraph('Age', document.age));
  if (document.condition) documentInfo.push(createSafeParagraph('Condition', document.condition));

  if (documentInfo.length > 0) {
    sections.push(`<h2>Document Information</h2>`);
    sections.push(documentInfo.join('\n'));
  }

  // Significance & Location
  if (document.significance) {
    sections.push(`<h2>Significance</h2>`);
    sections.push(createSafeParagraph(null, document.significance));
  }

  if (document.location) {
    sections.push(`<h2>Location</h2>`);
    sections.push(createSafeParagraph(null, document.location));
  }

  if (document.accessibility) {
    sections.push(`<h2>Accessibility</h2>`);
    sections.push(createSafeParagraph(null, document.accessibility));
  }

  // History & Secrets
  if (document.history) {
    sections.push(`<h2>History</h2>`);
    sections.push(createSafeParagraph(null, document.history));
  }

  if (document.secrets) {
    sections.push(`<h2>Hidden Knowledge</h2>`);
    sections.push(createSafeParagraph(null, document.secrets));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for foods
 */
function generateFoodArticle(food: Food): string {
  const sections: string[] = [];

  // Header
  if (food.name) {
    sections.push(`<h1>${escapeHtml(food.name)}</h1>`);
    if (food.foodType) {
      sections.push(`<p><em>Type: ${escapeHtml(food.foodType)}</em></p>`);
    }
  }

  // Description
  if (food.description) {
    sections.push(`<h2>Description</h2>`);
    sections.push(createSafeParagraph(null, food.description));
  }

  // Ingredients & Preparation
  if (food.ingredients && food.ingredients.length > 0) {
    sections.push(`<h2>Ingredients</h2>`);
    sections.push(createSafeList(food.ingredients));
  }

  if (food.preparation) {
    sections.push(`<h2>Preparation</h2>`);
    sections.push(createSafeParagraph(null, food.preparation));
  }

  // Sensory Properties
  const sensoryInfo: string[] = [];
  if (food.taste) sensoryInfo.push(createSafeParagraph('Taste', food.taste));
  if (food.texture) sensoryInfo.push(createSafeParagraph('Texture', food.texture));

  if (sensoryInfo.length > 0) {
    sections.push(`<h2>Taste & Texture</h2>`);
    sections.push(sensoryInfo.join('\n'));
  }

  // Cultural & Nutritional Info
  if (food.origin) {
    sections.push(`<h2>Origin</h2>`);
    sections.push(createSafeParagraph(null, food.origin));
  }

  if (food.culturalSignificance) {
    sections.push(`<h2>Cultural Significance</h2>`);
    sections.push(createSafeParagraph(null, food.culturalSignificance));
  }

  if (food.nutritionalValue) {
    sections.push(`<h2>Nutritional Value</h2>`);
    sections.push(createSafeParagraph(null, food.nutritionalValue));
  }

  // Practical Information
  const practicalInfo: string[] = [];
  if (food.cost) practicalInfo.push(createSafeParagraph('Cost', food.cost));
  if (food.rarity) practicalInfo.push(createSafeParagraph('Rarity', food.rarity));
  if (food.preservation) practicalInfo.push(createSafeParagraph('Preservation', food.preservation));

  if (practicalInfo.length > 0) {
    sections.push(`<h2>Practical Information</h2>`);
    sections.push(practicalInfo.join('\n'));
  }

  return sections.join('\n\n');
}

/**
 * Generate article content for drinks
 */
function generateDrinkArticle(drink: Drink): string {
  const sections: string[] = [];

  // Header
  if (drink.name) {
    sections.push(`<h1>${escapeHtml(drink.name)}</h1>`);
    if (drink.drinkType) {
      sections.push(`<p><em>Type: ${escapeHtml(drink.drinkType)}</em></p>`);
    }
  }

  // Description
  if (drink.description) {
    sections.push(`<h2>Description</h2>`);
    sections.push(createSafeParagraph(null, drink.description));
  }

  // Ingredients & Preparation
  if (drink.ingredients && drink.ingredients.length > 0) {
    sections.push(`<h2>Ingredients</h2>`);
    sections.push(createSafeList(drink.ingredients));
  }

  if (drink.preparation) {
    sections.push(`<h2>Preparation</h2>`);
    sections.push(createSafeParagraph(null, drink.preparation));
  }

  // Properties
  const drinkProps: string[] = [];
  if (drink.alcoholContent) drinkProps.push(createSafeParagraph('Alcohol Content', drink.alcoholContent));
  if (drink.taste) drinkProps.push(createSafeParagraph('Taste', drink.taste));
  if (drink.appearance) drinkProps.push(createSafeParagraph('Appearance', drink.appearance));

  if (drinkProps.length > 0) {
    sections.push(`<h2>Properties</h2>`);
    sections.push(drinkProps.join('\n'));
  }

  // Effects
  if (drink.effects) {
    sections.push(`<h2>Effects</h2>`);
    sections.push(createSafeParagraph(null, drink.effects));
  }

  // Cultural Information
  if (drink.origin) {
    sections.push(`<h2>Origin</h2>`);
    sections.push(createSafeParagraph(null, drink.origin));
  }

  if (drink.culturalSignificance) {
    sections.push(`<h2>Cultural Significance</h2>`);
    sections.push(createSafeParagraph(null, drink.culturalSignificance));
  }

  // Practical Information
  const practicalInfo: string[] = [];
  if (drink.cost) practicalInfo.push(createSafeParagraph('Cost', drink.cost));
  if (drink.rarity) practicalInfo.push(createSafeParagraph('Rarity', drink.rarity));

  if (practicalInfo.length > 0) {
    sections.push(`<h2>Availability</h2>`);
    sections.push(practicalInfo.join('\n'));
  }

  return sections.join('\n\n');
}

/**
 * Content type article generators mapping
 */
const articleGenerators = {
  characters: generateCharacterArticle,
  locations: generateLocationArticle,
  settings: generateSettingArticle,
  conflicts: generateConflictArticle,
  themes: generateThemeArticle,
  creatures: generateCreatureArticle,
  plants: generatePlantArticle,
  items: generateItemArticle,
  organizations: generateOrganizationArticle,
  species: generateSpeciesArticle,
  ethnicities: generateEthnicityArticle,
  cultures: generateCultureArticle,
  documents: generateDocumentArticle,
  foods: generateFoodArticle,
  drinks: generateDrinkArticle,
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
    case 'settings':
      content = await storage.getSetting(contentId);
      break;
    case 'conflicts':
      content = await storage.getConflict(contentId);
      break;
    case 'themes':
      content = await storage.getTheme(contentId);
      break;
    case 'creatures':
      content = await storage.getCreature(contentId);
      break;
    case 'plants':
      content = await storage.getPlant(contentId, userId, notebookId);
      break;
    case 'items':
      content = await storage.getItem(contentId, userId, notebookId);
      break;
    case 'organizations':
      content = await storage.getOrganization(contentId, userId, notebookId);
      break;
    case 'species':
      content = await storage.getSpecies(contentId);
      break;
    case 'ethnicities':
      content = await storage.getEthnicity(contentId);
      break;
    case 'cultures':
      content = await storage.getCulture(contentId, userId, notebookId);
      break;
    case 'documents':
      content = await storage.getDocument(contentId);
      break;
    case 'foods':
      content = await storage.getFood(contentId);
      break;
    case 'drinks':
      content = await storage.getDrink(contentId);
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
    case 'settings':
      updatedContent = await storage.updateSetting(contentId, { articleContent });
      break;
    case 'conflicts':
      updatedContent = await storage.updateConflict(contentId, { articleContent });
      break;
    case 'themes':
      updatedContent = await storage.updateTheme(contentId, { articleContent });
      break;
    case 'creatures':
      updatedContent = await storage.updateCreature(contentId, { articleContent });
      break;
    case 'plants':
      updatedContent = await storage.updatePlant(contentId, userId, { articleContent }, notebookId);
      break;
    case 'items':
      updatedContent = await storage.updateItem(contentId, userId, { articleContent }, notebookId);
      break;
    case 'organizations':
      updatedContent = await storage.updateOrganization(contentId, userId, { articleContent }, notebookId);
      break;
    case 'species':
      updatedContent = await storage.updateSpecies(contentId, { articleContent });
      break;
    case 'ethnicities':
      updatedContent = await storage.updateEthnicity(contentId, { articleContent });
      break;
    case 'cultures':
      updatedContent = await storage.updateCulture(contentId, userId, { articleContent }, notebookId);
      break;
    case 'documents':
      updatedContent = await storage.updateDocument(contentId, { articleContent });
      break;
    case 'foods':
      updatedContent = await storage.updateFood(contentId, { articleContent });
      break;
    case 'drinks':
      updatedContent = await storage.updateDrink(contentId, { articleContent });
      break;
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }

  return updatedContent;
}