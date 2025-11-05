import { ContentTypeFormConfig } from "../../components/forms/types";

// Static imports for frequently used content types (loaded immediately)
import { characterConfig } from "../../components/forms/content-types/character";

// Static configurations for core content types
const staticConfigs: Record<string, ContentTypeFormConfig> = {
  character: characterConfig,
};

// Dynamic import factory for less frequently used content types
// This reduces initial bundle size by only loading configs when needed
// All content types are now schema-driven (except character which is static)
const dynamicConfigLoaders: Record<
  string,
  () => Promise<ContentTypeFormConfig>
> = {};

// Cache for dynamically loaded configs to avoid re-loading
const configCache = new Map<string, ContentTypeFormConfig>();

/**
 * Get a content type configuration
 * @param contentType - The content type key
 * @returns Promise that resolves to the configuration
 */
export async function getContentTypeConfig(
  contentType: string,
): Promise<ContentTypeFormConfig | null> {
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
      console.error(
        `Failed to load config for content type: ${contentType}`,
        error,
      );
      return null;
    }
  }

  // Try schema-driven config (auto-generated from Drizzle schemas)
  try {
    const { getSchemaDrivenConfig } = await import("../schema-driven-configs");
    const config = getSchemaDrivenConfig(contentType);
    if (config) {
      configCache.set(contentType, config);
      return config;
    }
  } catch (error) {
    console.error(
      `Failed to load schema-driven config for content type: ${contentType}`,
      error,
    );
  }

  // Fallback: Try to load from original monolithic file (only loads when needed)
  try {
    const { contentTypeFormConfigs } = await import(
      "../../components/forms/ContentTypeFormConfig"
    );
    const config = contentTypeFormConfigs[contentType];
    if (config) {
      configCache.set(contentType, config);
      return config;
    }
  } catch (error) {
    console.error(
      `Failed to load fallback config for content type: ${contentType}`,
      error,
    );
  }

  // Content type not found
  console.warn(`No configuration found for content type: ${contentType}`);
  return null;
}

// Hardcoded list of all known content types (extracted from monolithic file)
// This provides immediate access without loading the large file
const ALL_CONTENT_TYPES = [
  // Static configs (loaded immediately)
  "character",
  "weapon",
  "location",
  "organization",
  "item",
  "building",
  "creature",
  // Dynamic/fallback configs (loaded on demand)
  "plot",
  "language",
  "species",
  "food",
  "drink",
  "armor",
  "religion",
  "technology",
  "spell",
  "animal",
  "resource",
  "ethnicity",
  "culture",
  "document",
  "accessory",
  "clothing",
  "material",
  "settlement",
  "society",
  "faction",
  "militaryUnit",
  "transportation",
  "naturalLaw",
  "tradition",
  "ritual",
  "setting",
  "name",
  "conflict",
  "theme",
  "mood",
  "plant",
  "description",
  "myth",
  "legend",
  "event",
  "familyTree",
  "timeline",
  "map",
  "ceremony",
  "music",
  "dance",
  "law",
  "policy",
  "potion",
  "prompt",
  "profession",
];

/**
 * Get all available content type keys (synchronous, no imports)
 * @returns Array of all available content type keys
 */
export function getAvailableContentTypes(): string[] {
  return ALL_CONTENT_TYPES.slice(); // Return a copy to prevent mutation
}

/**
 * Get content type configuration synchronously (only works for static configs)
 * @param contentType - The content type key
 * @returns Configuration or null if not available synchronously
 */
export function getStaticContentTypeConfig(
  contentType: string,
): ContentTypeFormConfig | null {
  return staticConfigs[contentType] || null;
}

/**
 * Check if a content type is available
 * @param contentType - The content type key
 * @returns True if the content type is available
 */
export function isContentTypeAvailable(contentType: string): boolean {
  return ALL_CONTENT_TYPES.includes(contentType);
}

/**
 * Preload content type configurations for better performance
 * @param contentTypes - Array of content type keys to preload
 */
export async function preloadContentTypes(
  contentTypes: string[],
): Promise<void> {
  const promises = contentTypes
    .filter((type) => dynamicConfigLoaders[type] && !configCache.has(type))
    .map((type) => getContentTypeConfig(type));

  await Promise.all(promises);
}

export default {
  getContentTypeConfig,
  getAvailableContentTypes,
  getStaticContentTypeConfig,
  isContentTypeAvailable,
  preloadContentTypes,
};
