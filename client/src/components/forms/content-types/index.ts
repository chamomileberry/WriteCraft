import { ContentTypeFormConfig } from '../types';

// Static imports for frequently used content types (loaded immediately)
import { characterConfig } from './character';
import { weaponConfig } from './weapon';

// Import the extracted configs from our new individual files
import { armorConfig } from '../../../configs/content-types/armor';
import { spellConfig } from '../../../configs/content-types/spell';
import { factionConfig } from '../../../configs/content-types/faction';
import { plotConfig } from '../../../configs/content-types/plot';
import { religionConfig } from '../../../configs/content-types/religion';
import { languageConfig } from '../../../configs/content-types/language';
import { cultureConfig } from '../../../configs/content-types/culture';
import { speciesConfig } from '../../../configs/content-types/species';
import { foodConfig } from '../../../configs/content-types/food';
import { drinkConfig } from '../../../configs/content-types/drink';
import { settlementConfig } from '../../../configs/content-types/settlement';
import { societyConfig } from '../../../configs/content-types/society';
import { technologyConfig } from '../../../configs/content-types/technology';
import { animalConfig } from '../../../configs/content-types/animal';
import { plantConfig } from '../../../configs/content-types/plant';
import { resourceConfig } from '../../../configs/content-types/resource';
import { ethnicityConfig } from '../../../configs/content-types/ethnicity';
import { eventConfig } from '../../../configs/content-types/event';
import { familyTreeConfig } from '../../../configs/content-types/familyTree';
import { timelineConfig } from '../../../configs/content-types/timeline';
import { promptConfig } from '../../../configs/content-types/prompt';
import { documentConfig } from '../../../configs/content-types/document';
import { mapConfig } from '../../../configs/content-types/map';
import { settingConfig } from '../../../configs/content-types/setting';
import { nameConfig } from '../../../configs/content-types/name';
import { conflictConfig } from '../../../configs/content-types/conflict';
import { themeConfig } from '../../../configs/content-types/theme';
import { moodConfig } from '../../../configs/content-types/mood';
import { descriptionConfig } from '../../../configs/content-types/description';
import { buildingConfig } from '../../../configs/content-types/building';
import { creatureConfig } from '../../../configs/content-types/creature';
import { itemConfig } from '../../../configs/content-types/item';
import { locationConfig } from '../../../configs/content-types/location';
import { organizationConfig } from '../../../configs/content-types/organization';

// Import remaining configs from the original file (temporary until all are split)
import { contentTypeFormConfigs as originalConfigs } from '../ContentTypeFormConfig';

// Static configurations for core content types
const staticConfigs: Record<string, ContentTypeFormConfig> = {
  character: characterConfig,
  weapon: weaponConfig,
  armor: armorConfig,
  spell: spellConfig,
  faction: factionConfig,
  plot: plotConfig,
  religion: religionConfig,
  language: languageConfig,
  culture: cultureConfig,
  species: speciesConfig,
  food: foodConfig,
  drink: drinkConfig,
  settlement: settlementConfig,
  society: societyConfig,
  technology: technologyConfig,
  animal: animalConfig,
  plant: plantConfig,
  resource: resourceConfig,
  ethnicity: ethnicityConfig,
  event: eventConfig,
  familyTree: familyTreeConfig,
  timeline: timelineConfig,
  prompt: promptConfig,
  document: documentConfig,
  map: mapConfig,
  setting: settingConfig,
  name: nameConfig,
  conflict: conflictConfig,
  theme: themeConfig,
  mood: moodConfig,
  description: descriptionConfig,
  building: buildingConfig,
  creature: creatureConfig,
  item: itemConfig,
  location: locationConfig,
  organization: organizationConfig,
  // Include all remaining configs from original file to maintain functionality
  ...Object.fromEntries(
    Object.entries(originalConfigs).filter(([key]) => ![
      'character', 'weapon', 'armor', 'spell', 'faction', 'plot',
      'religion', 'language', 'culture', 'species', 'food', 'drink', 
      'settlement', 'society', 'technology', 'animal', 'plant', 'resource', 
      'ethnicity', 'event', 'familyTree', 'timeline', 'prompt', 'document', 
      'map', 'setting', 'name', 'conflict', 'theme', 'mood', 'description', 
      'building', 'creature', 'item', 'location', 'organization'
    ].includes(key))
  ),
};

// Dynamic import factory for less frequently used content types
// This reduces initial bundle size by only loading configs when needed
// TODO: As you split more content types from ContentTypeFormConfig.tsx, add them here
const dynamicConfigLoaders: Record<string, () => Promise<ContentTypeFormConfig>> = {
  // Example of how to add more content types:
  // location: () => import('./location').then(m => m.default || m.locationConfig),
  // organization: () => import('./organization').then(m => m.default || m.organizationConfig),
};

// Cache for dynamically loaded configs to avoid re-loading
const configCache = new Map<string, ContentTypeFormConfig>();

/**
 * Get a content type configuration
 * @param contentType - The content type key
 * @returns Promise that resolves to the configuration
 */
export async function getContentTypeConfig(contentType: string): Promise<ContentTypeFormConfig | null> {
  // Check static configs first (immediate availability)
  if (staticConfigs[contentType]) {
    return staticConfigs[contentType];
  }

  // Check cache for previously loaded dynamic configs
  if (configCache.has(contentType)) {
    return configCache.get(contentType)!;
  }

  // Load dynamic config if available
  if (dynamicConfigLoaders[contentType]) {
    try {
      const config = await dynamicConfigLoaders[contentType]();
      configCache.set(contentType, config);
      return config;
    } catch (error) {
      console.error(`Failed to load config for content type: ${contentType}`, error);
      return null;
    }
  }

  // Content type not found
  console.warn(`No configuration found for content type: ${contentType}`);
  return null;
}

/**
 * Get all available content type keys
 * This includes both static and dynamic configs
 */
export function getAvailableContentTypes(): string[] {
  return [
    ...Object.keys(staticConfigs),
    ...Object.keys(dynamicConfigLoaders)
  ].sort();
}

/**
 * Check if a content type is available
 */
export function isContentTypeAvailable(contentType: string): boolean {
  return contentType in staticConfigs || contentType in dynamicConfigLoaders;
}

/**
 * Preload specific content type configurations
 * Useful for preloading configs that will be needed soon
 */
export async function preloadContentTypes(contentTypes: string[]): Promise<void> {
  const loadPromises = contentTypes
    .filter(type => dynamicConfigLoaders[type] && !configCache.has(type))
    .map(async type => {
      try {
        const config = await dynamicConfigLoaders[type]();
        configCache.set(type, config);
      } catch (error) {
        console.error(`Failed to preload config for: ${type}`, error);
      }
    });

  await Promise.all(loadPromises);
}

// Export the original structure for backward compatibility
// This will be removed once all components are updated to use the new async API
export const contentTypeFormConfigs: Record<string, ContentTypeFormConfig> = {
  ...staticConfigs,
  // Note: Dynamic configs are not included here as they require async loading
  // Use getContentTypeConfig() for accessing all content types
};

// Re-export individual configs for direct imports if needed
export { characterConfig } from './character';
export { weaponConfig } from './weapon';
export { armorConfig } from '../../../configs/content-types/armor';
export { spellConfig } from '../../../configs/content-types/spell';
export { factionConfig } from '../../../configs/content-types/faction';
export { plotConfig } from '../../../configs/content-types/plot';
export { religionConfig } from '../../../configs/content-types/religion';
export { languageConfig } from '../../../configs/content-types/language';
export { cultureConfig } from '../../../configs/content-types/culture';
export { speciesConfig } from '../../../configs/content-types/species';
export { foodConfig } from '../../../configs/content-types/food';
export { drinkConfig } from '../../../configs/content-types/drink';
export { settlementConfig } from '../../../configs/content-types/settlement';
export { societyConfig } from '../../../configs/content-types/society';
export { technologyConfig } from '../../../configs/content-types/technology';
export { animalConfig } from '../../../configs/content-types/animal';
export { plantConfig } from '../../../configs/content-types/plant';
export { resourceConfig } from '../../../configs/content-types/resource';
export { ethnicityConfig } from '../../../configs/content-types/ethnicity';
export { eventConfig } from '../../../configs/content-types/event';
export { familyTreeConfig } from '../../../configs/content-types/familyTree';
export { timelineConfig } from '../../../configs/content-types/timeline';
export { promptConfig } from '../../../configs/content-types/prompt';
export { documentConfig } from '../../../configs/content-types/document';
export { mapConfig } from '../../../configs/content-types/map';
export { settingConfig } from '../../../configs/content-types/setting';
export { nameConfig } from '../../../configs/content-types/name';
export { conflictConfig } from '../../../configs/content-types/conflict';
export { themeConfig } from '../../../configs/content-types/theme';
export { moodConfig } from '../../../configs/content-types/mood';
export { descriptionConfig } from '../../../configs/content-types/description';
export { buildingConfig } from '../../../configs/content-types/building';
export { creatureConfig } from '../../../configs/content-types/creature';
export { itemConfig } from '../../../configs/content-types/item';
export { locationConfig } from '../../../configs/content-types/location';
export { organizationConfig } from '../../../configs/content-types/organization';