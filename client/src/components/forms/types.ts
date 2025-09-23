export type FormFieldType = 
  | "text" 
  | "textarea" 
  | "number" 
  | "select" 
  | "tags"
  | "date"
  | "checkbox";

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: string[];
  rows?: number;
}

export interface FormTabConfig {
  id: string;
  label: string;
  icon: string;
  fields: FormField[];
}

export interface ContentTypeFormConfig {
  title: string;
  description: string;
  icon: string;
  tabs: FormTabConfig[];
}