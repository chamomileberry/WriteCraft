import { ContentTypeFormConfig } from '../../components/forms/types';

// Static imports for frequently used content types (loaded immediately)
import { characterConfig } from '../../components/forms/content-types/character';
import { weaponConfig } from '../../components/forms/content-types/weapon';
import { locationConfig } from './location';
import { organizationConfig } from './organization';
import { itemConfig } from './item';
import { buildingConfig } from './building';
import { creatureConfig } from './creature';

// Import remaining configs from the original file (temporary until all are split)
import { contentTypeFormConfigs as originalConfigs } from '../../components/forms/ContentTypeFormConfig';

// Static configurations for core content types
const staticConfigs: Record<string, ContentTypeFormConfig> = {
  character: characterConfig,
  weapon: weaponConfig,
  location: locationConfig,
  organization: organizationConfig,
  item: itemConfig,
  building: buildingConfig,
  creature: creatureConfig,
  // Include remaining configs from original file to maintain functionality
  ...Object.fromEntries(
    Object.entries(originalConfigs).filter(([key]) => 
      !['character', 'weapon', 'location', 'organization', 'item', 'building', 'creature'].includes(key)
    )
  ),
};

// Dynamic import factory for less frequently used content types
// This reduces initial bundle size by only loading configs when needed
const dynamicConfigLoaders: Record<string, () => Promise<ContentTypeFormConfig>> = {
  // TODO: As more content types are split from ContentTypeFormConfig.tsx, add them here
  // Example patterns:
  // species: () => import('./species').then(m => m.default || m.speciesConfig),
  // religion: () => import('./religion').then(m => m.default || m.religionConfig),
  // technology: () => import('./technology').then(m => m.default || m.technologyConfig),
  // spell: () => import('./spell').then(m => m.default || m.spellConfig),
  // food: () => import('./food').then(m => m.default || m.foodConfig),
  // drink: () => import('./drink').then(m => m.default || m.drinkConfig),
  // armor: () => import('./armor').then(m => m.default || m.armorConfig),
  // plot: () => import('./plot').then(m => m.default || m.plotConfig),
  // language: () => import('./language').then(m => m.default || m.languageConfig),
  // culture: () => import('./culture').then(m => m.default || m.cultureConfig),
  // society: () => import('./society').then(m => m.default || m.societyConfig),
  // faction: () => import('./faction').then(m => m.default || m.factionConfig),
  // settlement: () => import('./settlement').then(m => m.default || m.settlementConfig),
  // transportation: () => import('./transportation').then(m => m.default || m.transportationConfig),
  // event: () => import('./event').then(m => m.default || m.eventConfig),
  // ceremony: () => import('./ceremony').then(m => m.default || m.ceremonyConfig),
  // music: () => import('./music').then(m => m.default || m.musicConfig),
  // dance: () => import('./dance').then(m => m.default || m.danceConfig),
  // law: () => import('./law').then(m => m.default || m.lawConfig),
  // policy: () => import('./policy').then(m => m.default || m.policyConfig),
  // potion: () => import('./potion').then(m => m.default || m.potionConfig),
  // profession: () => import('./profession').then(m => m.default || m.professionConfig),
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
 * @returns Array of all available content type keys
 */
export function getAvailableContentTypes(): string[] {
  return [
    ...Object.keys(staticConfigs),
    ...Object.keys(dynamicConfigLoaders)
  ].sort();
}

/**
 * Get content type configuration synchronously (only works for static configs)
 * @param contentType - The content type key
 * @returns Configuration or null if not available synchronously
 */
export function getStaticContentTypeConfig(contentType: string): ContentTypeFormConfig | null {
  return staticConfigs[contentType] || null;
}

/**
 * Check if a content type is available
 * @param contentType - The content type key
 * @returns True if the content type is available
 */
export function isContentTypeAvailable(contentType: string): boolean {
  return contentType in staticConfigs || contentType in dynamicConfigLoaders;
}

/**
 * Preload content type configurations for better performance
 * @param contentTypes - Array of content type keys to preload
 */
export async function preloadContentTypes(contentTypes: string[]): Promise<void> {
  const promises = contentTypes
    .filter(type => dynamicConfigLoaders[type] && !configCache.has(type))
    .map(type => getContentTypeConfig(type));
  
  await Promise.all(promises);
}

export default {
  getContentTypeConfig,
  getAvailableContentTypes,
  getStaticContentTypeConfig,
  isContentTypeAvailable,
  preloadContentTypes,
};