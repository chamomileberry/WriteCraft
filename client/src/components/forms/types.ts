export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "tags"
  | "date"
  | "checkbox"
  | "image"
  // Existing content types with autocomplete
  | "autocomplete-location"
  | "autocomplete-character"
  | "autocomplete-tradition"
  | "autocomplete-language"
  | "autocomplete-religion"
  | "autocomplete-organization"
  | "autocomplete-species"
  | "autocomplete-culture"
  | "autocomplete-weapon"
  | "autocomplete-building"
  | "autocomplete-plot"
  | "autocomplete-document"
  | "autocomplete-accessory"
  | "autocomplete-clothing"
  | "autocomplete-material"
  | "autocomplete-settlement"
  | "autocomplete-society"
  | "autocomplete-faction"
  | "autocomplete-military-unit"
  // New content types with autocomplete
  | "autocomplete-family-tree"
  | "autocomplete-timeline"
  | "autocomplete-ceremony"
  | "autocomplete-map"
  | "autocomplete-music"
  | "autocomplete-dance"
  | "autocomplete-law"
  | "autocomplete-policy"
  | "autocomplete-potion"
  | "autocomplete-profession"
  | "autocomplete-condition";

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: string[];
  rows?: number;
  multiple?: boolean; // For autocomplete fields: true = array, false = single value
  // Properties for autocomplete fields
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  // Properties for select fields
  customizable?: boolean;
  // Properties for tags fields
  maxTags?: number;
  // Properties for image fields
  accept?: string; // Accepted file types
  maxFileSize?: number; // Max file size in MB
  showCaption?: boolean; // Show caption input field
  captionFieldName?: string; // Name of the caption field in the form
}

export interface FormTabConfig {
  id: string;
  label: string;
  icon: string;
  fields: FormField[];
}

export interface FormGroupConfig {
  id: string;
  label: string;
  icon: string;
  sections: FormTabConfig[];
}

export interface ContentTypeFormConfig {
  title: string;
  description: string;
  icon: string;
  tabs?: FormTabConfig[]; // Keep for backward compatibility
  groups?: FormGroupConfig[]; // New grouped structure
}
