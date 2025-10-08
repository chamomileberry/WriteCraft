import { ContentTypeFormConfig } from '../types';

// Static imports for frequently used content types (loaded immediately)
import { characterConfig } from './character';

// Import the extracted configs from our new individual files
import { armorConfig } from '../../../configs/content-types/armor';
import { spellConfig } from '../../../configs/content-types/spell';
import { plotConfig } from '../../../configs/content-types/plot';
import { foodConfig } from '../../../configs/content-types/food';
import { drinkConfig } from '../../../configs/content-types/drink';
import { ethnicityConfig } from '../../../configs/content-types/ethnicity';
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
import { locationConfig } from '../../../configs/content-types/location';
import { organizationConfig } from '../../../configs/content-types/organization';

// Import remaining configs from the original file (temporary until all are split)
import { contentTypeFormConfigs as originalConfigs } from '../ContentTypeFormConfig';

// Static configurations for core content types
const staticConfigs: Record<string, ContentTypeFormConfig> = {
  character: characterConfig,
  armor: armorConfig,
  spell: spellConfig,
  plot: plotConfig,
  food: foodConfig,
  drink: drinkConfig,
  ethnicity: ethnicityConfig,
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
  location: locationConfig,
  organization: organizationConfig,
  // Include all remaining configs from original file to maintain functionality
  ...Object.fromEntries(
    Object.entries(originalConfigs).filter(([key]) => ![
      'character', 'armor', 'spell', 'plot',
      'food', 'drink', 
      'ethnicity', 'familyTree', 'timeline', 'prompt', 'document', 
      'map', 'setting', 'name', 'conflict', 'theme', 'mood', 'description', 
      'location', 'organization'
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
export { armorConfig } from '../../../configs/content-types/armor';
export { spellConfig } from '../../../configs/content-types/spell';
export { plotConfig } from '../../../configs/content-types/plot';
export { foodConfig } from '../../../configs/content-types/food';
export { drinkConfig } from '../../../configs/content-types/drink';
export { ethnicityConfig } from '../../../configs/content-types/ethnicity';
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
export { locationConfig } from '../../../configs/content-types/location';
export { organizationConfig } from '../../../configs/content-types/organization';