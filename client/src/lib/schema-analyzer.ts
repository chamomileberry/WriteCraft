import { z } from 'zod';
import type { FormField, FormFieldType } from '@/components/forms/types';

/**
 * Field metadata extracted from Zod schema
 */
export interface FieldMetadata {
  name: string;
  type: FormFieldType;
  isRequired: boolean;
  isArray: boolean;
  isNullable: boolean;
}

/**
 * Extract field metadata from a Zod object schema
 */
export function analyzeZodSchema(schema: z.ZodObject<any>): FieldMetadata[] {
  const shape = schema.shape;
  const fields: FieldMetadata[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const metadata = analyzeZodField(fieldName, fieldSchema as z.ZodTypeAny);
    fields.push(metadata);
  }

  return fields;
}

/**
 * Analyze a single Zod field to extract metadata
 */
function analyzeZodField(name: string, schema: z.ZodTypeAny): FieldMetadata {
  let currentSchema = schema;
  let isNullable = false;
  let isArray = false;
  let isRequired = true;

  // Unwrap optional/nullable/default wrappers
  while (true) {
    if (currentSchema instanceof z.ZodOptional) {
      isRequired = false;
      currentSchema = currentSchema.unwrap();
    } else if (currentSchema instanceof z.ZodNullable) {
      isNullable = true;
      isRequired = false;
      currentSchema = currentSchema.unwrap();
    } else if (currentSchema instanceof z.ZodDefault) {
      isRequired = false;
      currentSchema = currentSchema.removeDefault();
    } else {
      break;
    }
  }

  // Check if it's an array
  if (currentSchema instanceof z.ZodArray) {
    isArray = true;
    currentSchema = currentSchema.element;
  }

  // Determine the field type
  const fieldType = determineFieldType(name, currentSchema, isArray);

  return {
    name,
    type: fieldType,
    isRequired,
    isArray,
    isNullable,
  };
}

/**
 * Determine the form field type based on Zod schema type and field name
 */
function determineFieldType(
  fieldName: string,
  schema: z.ZodTypeAny,
  isArray: boolean
): FormFieldType {
  // Check for specific field name patterns first
  const lowerName = fieldName.toLowerCase();

  // Image fields
  if (lowerName.includes('image') && lowerName.includes('url')) {
    return 'image';
  }

  // Date fields
  if (lowerName.includes('date') || lowerName.includes('time')) {
    return 'date';
  }

  // Special autocomplete fields based on naming conventions
  if (lowerName.includes('location') && !lowerName.includes('type')) {
    return 'autocomplete-location';
  }
  if (lowerName.includes('character')) {
    return 'autocomplete-character';
  }
  if (lowerName.includes('organization')) {
    return 'autocomplete-organization';
  }
  if (lowerName.includes('species')) {
    return 'autocomplete-species';
  }
  if (lowerName.includes('culture')) {
    return 'autocomplete-culture';
  }
  if (lowerName.includes('religion')) {
    return 'autocomplete-religion';
  }
  if (lowerName.includes('language')) {
    return 'autocomplete-language';
  }
  if (lowerName.includes('tradition')) {
    return 'autocomplete-tradition';
  }
  if (lowerName.includes('weapon')) {
    return 'autocomplete-weapon';
  }
  if (lowerName.includes('building')) {
    return 'autocomplete-building';
  }

  // Array fields (tags)
  if (isArray && schema instanceof z.ZodString) {
    return 'tags';
  }

  // Based on Zod type
  if (schema instanceof z.ZodNumber) {
    return 'number';
  }

  if (schema instanceof z.ZodBoolean) {
    return 'checkbox';
  }

  if (schema instanceof z.ZodString) {
    // Long text fields get textarea
    if (
      lowerName.includes('description') ||
      lowerName.includes('content') ||
      lowerName.includes('backstory') ||
      lowerName.includes('history') ||
      lowerName.includes('notes') ||
      lowerName.includes('summary') ||
      lowerName.includes('details') ||
      lowerName.includes('text') ||
      lowerName.includes('message')
    ) {
      return 'textarea';
    }

    // Default to text input
    return 'text';
  }

  // Default fallback
  return 'text';
}

/**
 * Convert field name to human-readable label
 * Examples: "firstName" -> "First Name", "dateOfBirth" -> "Date Of Birth"
 */
export function fieldNameToLabel(name: string): string {
  // Handle common acronyms
  const acronyms: Record<string, string> = {
    url: 'URL',
    id: 'ID',
    dna: 'DNA',
    ai: 'AI',
    api: 'API',
  };

  return name
    // Insert space before uppercase letters
    .replace(/([A-Z])/g, ' $1')
    // Replace underscores with spaces
    .replace(/_/g, ' ')
    // Capitalize first letter of each word
    .replace(/\b\w/g, (char) => char.toUpperCase())
    // Handle acronyms
    .split(' ')
    .map((word) => acronyms[word.toLowerCase()] || word)
    .join(' ')
    .trim();
}

/**
 * Generate placeholder text based on field name and type
 */
export function generatePlaceholder(
  fieldName: string,
  fieldType: FormFieldType
): string {
  const label = fieldNameToLabel(fieldName);

  if (fieldType === 'textarea') {
    return `Enter ${label.toLowerCase()}...`;
  }

  if (fieldType === 'number') {
    return `Enter ${label.toLowerCase()}`;
  }

  if (fieldType === 'tags') {
    return `Add ${label.toLowerCase()}...`;
  }

  if (fieldType.startsWith('autocomplete-')) {
    return `Search or select ${label.toLowerCase()}...`;
  }

  if (fieldType === 'date') {
    return `Select ${label.toLowerCase()}`;
  }

  if (fieldType === 'image') {
    return `Upload or enter image URL`;
  }

  return `Enter ${label.toLowerCase()}`;
}
