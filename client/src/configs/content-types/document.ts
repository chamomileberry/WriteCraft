import { ContentTypeFormConfig } from '../../components/forms/types';
import { DOCUMENT_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const documentConfig: ContentTypeFormConfig = {
  title: "Document Creator",
  description: "Create detailed documents for your world",
  icon: "FileText",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "FileText",
      fields: [
        { name: "title", label: "Document Title", type: "text", placeholder: "Enter document title...", description: "The title of this document" },
        Fields.createTypeField("document", DOCUMENT_TYPES),
        { name: "author", label: "Author", type: "text", placeholder: "Who created this?", description: "The original author or creator" },
        { name: "language", label: "Language", type: "text", placeholder: "What language is it in?", description: "The language the document is written in" },
        Fields.createGenreField()
      ]
    },
    {
      id: "content",
      label: "Content & Condition",
      icon: "Edit",
      fields: [
        { name: "content", label: "Content", type: "textarea", placeholder: "Document contents...", description: "The main text or content of the document" },
        { name: "age", label: "Age", type: "text", placeholder: "How old is it?", description: "Age of the document" },
        { name: "condition", label: "Condition", type: "select", options: ["Pristine", "Good", "Fair", "Poor", "Damaged", "Fragmentary"], description: "Physical condition of the document" },
        { name: "accessibility", label: "Accessibility", type: "text", placeholder: "Who can access it?", description: "Who has access to this document" }
      ]
    },
    {
      id: "significance",
      label: "Significance & Secrets",
      icon: "Lock",
      fields: [
        { name: "significance", label: "Significance", type: "text", placeholder: "Why is it important?", description: "Historical or cultural significance" },
        { name: "location", label: "Location", type: "text", placeholder: "Where is it kept?", description: "Current location or repository" },
        { name: "secrets", label: "Secrets", type: "text", placeholder: "Hidden information", description: "Secret or hidden information within the document" },
        Fields.createHistoryField("document")
      ]
    }
  ]
};

export default documentConfig;