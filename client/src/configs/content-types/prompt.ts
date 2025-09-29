import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const promptConfig: ContentTypeFormConfig = {
  title: "Writing Prompt Creator",
  description: "Create writing prompts and exercises",
  icon: "PenTool",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "PenTool",
      fields: [
        { name: "text", label: "Prompt Text", type: "textarea", placeholder: "Write your prompt here...", description: "The main writing prompt or exercise" },
        { name: "type", label: "Prompt Type", type: "select", options: ["Character Development", "Plot Hook", "Setting Description", "Dialogue", "Opening Line", "Story Structure", "World Building", "Conflict", "Other"], description: "What type of writing prompt is this?" },
        Fields.createGenreField(),
        { name: "difficulty", label: "Difficulty Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Expert"], description: "Skill level required for this prompt" }
      ]
    },
    {
      id: "details",
      label: "Details & Tags",
      icon: "Tag",
      fields: [
        { name: "wordCount", label: "Suggested Word Count", type: "text", placeholder: "e.g., 500-1000 words, 1 page, short story", description: "Recommended length for responses" },
        { name: "tags", label: "Tags", type: "tags", placeholder: "character, romance, mystery...", description: "Keywords and categories (comma-separated)" }
      ]
    }
  ]
};

export default promptConfig;