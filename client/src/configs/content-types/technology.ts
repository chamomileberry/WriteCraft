import { ContentTypeFormConfig } from '../../components/forms/types';
import { TECHNOLOGY_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const technologyConfig: ContentTypeFormConfig = {
  title: "Technology Creator",
  description: "Create detailed technologies for your world",
  icon: "Cog",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Cog",
      fields: [
        Fields.createImageField("technology"),
        Fields.createNameField("technology"),
        Fields.createTypeField("technology", TECHNOLOGY_TYPES),
        Fields.createDescriptionField("technology"),
        { name: "function", label: "Function", type: "text", placeholder: "What does it do?", description: "Primary function and purpose" },
        Fields.createGenreField()
      ]
    },
    {
      id: "mechanics",
      label: "Mechanics & Requirements",
      icon: "Settings",
      fields: [
        { name: "principles", label: "Principles", type: "textarea", placeholder: "How does it work?", description: "Underlying principles and mechanics" },
        { name: "requirements", label: "Requirements", type: "tags", placeholder: "Add requirements", description: "Materials, energy, or conditions needed to operate" },
        { name: "limitations", label: "Limitations", type: "tags", placeholder: "Add limitations", description: "Constraints and limitations on usage" },
        { name: "applications", label: "Applications", type: "tags", placeholder: "Add applications", description: "Practical applications and uses" },
        { name: "risks", label: "Risks", type: "text", placeholder: "What are the dangers?", description: "Potential risks and hazards" }
      ]
    },
    {
      id: "development",
      label: "Development & Availability",
      icon: "Lightbulb",
      fields: [
        { name: "development", label: "Development", type: "text", placeholder: "Development status", description: "Current state of development" },
        { name: "inventors", label: "Inventors", type: "text", placeholder: "Who created it?", description: "Inventors or developers" },
        Fields.createRarityField(),
        { name: "evolution", label: "Evolution", type: "text", placeholder: "How has it evolved?", description: "Historical development and future potential" }
      ]
    }
  ]
};

export default technologyConfig;