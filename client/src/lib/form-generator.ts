import { z } from 'zod';
import type { ContentTypeFormConfig, FormTabConfig } from '@/components/forms/types';
import {
  analyzeZodSchema,
  fieldNameToLabel,
  generatePlaceholder,
  type FieldMetadata,
} from './schema-analyzer';

/**
 * UI customization for a field
 */
export interface FieldUIHints {
  label?: string;
  placeholder?: string;
  description?: string;
  rows?: number; // For textarea
  tab?: string; // Which tab this field belongs to
  order?: number; // Order within the tab
  hidden?: boolean; // Don't show this field in the form
  // Autocomplete specific
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  multiple?: boolean;
  // Select specific
  options?: string[];
}

/**
 * Tab configuration
 */
export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  order?: number;
}

/**
 * Content type configuration for form generation
 */
export interface ContentTypeConfig {
  title: string;
  description: string;
  icon?: string;
  tabs?: TabConfig[];
  fieldHints?: Record<string, FieldUIHints>;
  defaultTab?: string; // Tab for fields without explicit tab assignment
}

/**
 * Generate a form configuration from a Zod schema and UI hints
 */
export function generateFormConfig(
  schema: z.ZodObject<any>,
  config: ContentTypeConfig
): ContentTypeFormConfig {
  // Extract field metadata from schema
  const fieldMetadata = analyzeZodSchema(schema);

  // Filter out hidden fields and system fields
  const visibleFields = fieldMetadata.filter((field) => {
    const hints = config.fieldHints?.[field.name];
    if (hints?.hidden) return false;

    // Hide system fields by default
    const systemFields = ['id', 'userId', 'notebookId', 'createdAt', 'updatedAt', 'importSource', 'importExternalId'];
    if (systemFields.includes(field.name)) return false;

    return true;
  });

  // Group fields by tab
  const fieldsByTab = groupFieldsByTab(visibleFields, config);

  // Create tab configurations
  const tabs: FormTabConfig[] = [];

  // If tabs are explicitly configured, use them
  if (config.tabs && config.tabs.length > 0) {
    for (const tabConfig of config.tabs) {
      const tabFields = fieldsByTab.get(tabConfig.id) || [];
      
      // Sort fields by order if specified
      tabFields.sort((a, b) => {
        const aOrder = config.fieldHints?.[a.name]?.order ?? 999;
        const bOrder = config.fieldHints?.[b.name]?.order ?? 999;
        return aOrder - bOrder;
      });

      // Only add tab if it has fields
      if (tabFields.length > 0) {
        tabs.push({
          id: tabConfig.id,
          label: tabConfig.label,
          icon: tabConfig.icon || 'FileText',
          fields: tabFields.map((field) => createFormField(field, config)),
        });
      }
    }
    
    // Check if any fields were not assigned to configured tabs
    // These fields were grouped into defaultTab but that tab wasn't in the config
    const defaultTab = config.defaultTab || 'general';
    const unassignedFields = fieldsByTab.get(defaultTab) || [];
    
    if (unassignedFields.length > 0 && !config.tabs.some(t => t.id === defaultTab)) {
      // Create a tab for unassigned fields
      unassignedFields.sort((a, b) => {
        const aOrder = config.fieldHints?.[a.name]?.order ?? 999;
        const bOrder = config.fieldHints?.[b.name]?.order ?? 999;
        return aOrder - bOrder;
      });
      
      tabs.push({
        id: defaultTab,
        label: 'Other Details',
        icon: 'FileText',
        fields: unassignedFields.map((field) => createFormField(field, config)),
      });
    }
  } else {
    // Create a single "General" tab if no tabs are configured
    const allFields = Array.from(fieldsByTab.values()).flat();
    allFields.sort((a, b) => {
      const aOrder = config.fieldHints?.[a.name]?.order ?? 999;
      const bOrder = config.fieldHints?.[b.name]?.order ?? 999;
      return aOrder - bOrder;
    });

    tabs.push({
      id: 'general',
      label: 'General',
      icon: 'Settings',
      fields: allFields.map((field) => createFormField(field, config)),
    });
  }

  return {
    title: config.title,
    description: config.description,
    icon: config.icon || 'FileText',
    tabs,
  };
}

/**
 * Group fields by their assigned tab
 */
function groupFieldsByTab(
  fields: FieldMetadata[],
  config: ContentTypeConfig
): Map<string, FieldMetadata[]> {
  const fieldsByTab = new Map<string, FieldMetadata[]>();
  const defaultTab = config.defaultTab || 'general';

  for (const field of fields) {
    const hints = config.fieldHints?.[field.name];
    const tab = hints?.tab || defaultTab;

    if (!fieldsByTab.has(tab)) {
      fieldsByTab.set(tab, []);
    }

    fieldsByTab.get(tab)!.push(field);
  }

  return fieldsByTab;
}

/**
 * Create a form field configuration from field metadata
 */
function createFormField(
  metadata: FieldMetadata,
  config: ContentTypeConfig
) {
  const hints = config.fieldHints?.[metadata.name] || {};

  // Determine the final field type (hints can override)
  let fieldType = metadata.type;

  // If autocomplete field, check if it should be multiple
  if (fieldType.startsWith('autocomplete-') && metadata.isArray) {
    hints.multiple = true;
  }

  return {
    name: metadata.name,
    label: hints.label || fieldNameToLabel(metadata.name),
    type: fieldType,
    required: metadata.isRequired,
    placeholder: hints.placeholder || generatePlaceholder(metadata.name, fieldType),
    description: hints.description,
    rows: hints.rows,
    // Autocomplete specific
    endpoint: hints.endpoint,
    labelField: hints.labelField,
    valueField: hints.valueField,
    multiple: hints.multiple,
    // Select specific
    options: hints.options,
  };
}

/**
 * Helper to create common tab configurations
 */
export const commonTabs = {
  basic: { id: 'basic', label: 'Basic Info', icon: 'User', order: 1 },
  appearance: { id: 'appearance', label: 'Appearance', icon: 'Eye', order: 2 },
  personality: { id: 'personality', label: 'Personality', icon: 'Heart', order: 3 },
  background: { id: 'background', label: 'Background', icon: 'BookOpen', order: 4 },
  skills: { id: 'skills', label: 'Skills & Abilities', icon: 'Zap', order: 5 },
  relationships: { id: 'relationships', label: 'Relationships', icon: 'Users', order: 6 },
  details: { id: 'details', label: 'Details', icon: 'FileText', order: 7 },
  advanced: { id: 'advanced', label: 'Advanced', icon: 'Settings', order: 8 },
};
