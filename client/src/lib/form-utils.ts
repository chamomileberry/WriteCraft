import { z } from "zod";
import { ContentTypeFormConfig } from "@/components/forms/types";

/**
 * Generate a Zod schema from form configuration
 */
export function generateFormSchema(config: ContentTypeFormConfig): z.ZodSchema {
  const schemaObject: Record<string, z.ZodTypeAny> = {};
  
  (config.tabs || []).forEach(tab => {
    tab.fields.forEach(field => {
      let fieldSchema: z.ZodTypeAny;
      
      switch (field.type) {
        case "number":
          fieldSchema = z.number().nullable();
          break;
        case "tags":
          fieldSchema = z.array(z.string()).nullable();
          break;
        case "checkbox":
          fieldSchema = z.boolean().nullable();
          break;
        default:
          // Handle autocomplete types based on their multiple property
          if (field.type.startsWith("autocomplete-")) {
            // Schema depends on multiple property: true = array, false/undefined = string
            fieldSchema = field.multiple === true 
              ? z.array(z.string()).nullable()
              : z.string().nullable();
          } else {
            // Regular text fields
            fieldSchema = z.string().nullable();
          }
      }
      
      if (field.required) {
        if (field.type === "tags" || 
            (field.type.startsWith("autocomplete-") && field.multiple === true)) {
          fieldSchema = z.array(z.string()).min(1, `${field.label} is required`);
        } else if (field.type === "number") {
          fieldSchema = z.number({ required_error: `${field.label} is required` });
        } else if (field.type === "checkbox") {
          fieldSchema = z.boolean().refine(val => val === true, {
            message: `${field.label} is required`
          });
        } else {
          fieldSchema = z.string().min(1, `${field.label} is required`);
        }
      }
      
      schemaObject[field.name] = fieldSchema;
    });
  });
  
  return z.object(schemaObject);
}

/**
 * Get default values from form configuration and initial data
 */
export function getFormDefaultValues(config: ContentTypeFormConfig, initialData?: Record<string, any>): Record<string, any> {
  const defaults: Record<string, any> = {};
  
  (config.tabs || []).forEach(tab => {
    tab.fields.forEach(field => {
      const initialValue = initialData?.[field.name];
      
      switch (field.type) {
        case "number":
          defaults[field.name] = initialValue ?? null;
          break;
        case "tags":
          // Convert comma-separated string to array or use array directly
          if (typeof initialValue === "string") {
            defaults[field.name] = initialValue ? initialValue.split(",").map(s => s.trim()).filter(Boolean) : [];
          } else if (Array.isArray(initialValue)) {
            defaults[field.name] = initialValue;
          } else {
            defaults[field.name] = [];
          }
          break;
        case "checkbox":
          defaults[field.name] = initialValue ?? false;
          break;
        default:
          // Handle autocomplete types based on their multiple property
          if (field.type.startsWith("autocomplete-")) {
            if (field.multiple === true) {
              defaults[field.name] = Array.isArray(initialValue) ? initialValue : [];
            } else {
              defaults[field.name] = initialValue ?? "";
            }
          } else {
            defaults[field.name] = initialValue ?? "";
          }
      }
    });
  });
  
  return defaults;
}