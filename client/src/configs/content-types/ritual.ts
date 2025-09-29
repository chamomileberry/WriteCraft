import { ContentTypeFormConfig } from '../../components/forms/types';
import { RITUAL_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const ritualConfig: ContentTypeFormConfig = {
  title: "Ritual Creator",
  description: "Create detailed rituals for your world",
  icon: "Flame",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Flame",
      fields: [
        Fields.createNameField("ritual"),
        Fields.createTypeField("ritual", RITUAL_TYPES),
        Fields.createDescriptionField("ritual"),
        Fields.createPurposeField(),
        Fields.createGenreField()
      ]
    },
    {
      id: "execution",
      label: "Execution & Requirements",
      icon: "Settings",
      fields: [
        { name: "participants", label: "Participants", type: "text", placeholder: "Who performs this ritual?", description: "Required participants and their roles" },
        { name: "requirements", label: "Requirements", type: "tags", placeholder: "Add requirements", description: "Materials, conditions, or preparations needed" },
        { name: "components", label: "Components", type: "tags", placeholder: "Add components", description: "Physical components and materials used" },
        { name: "steps", label: "Steps", type: "tags", placeholder: "Add ritual steps", description: "Sequential steps to perform the ritual" },
        Fields.createDurationField()
      ]
    },
    {
      id: "effects",
      label: "Effects & Variations",
      icon: "Sparkles",
      fields: [
        { name: "location", label: "Location", type: "text", placeholder: "Where is it performed?", description: "Required or preferred locations" },
        { name: "timing", label: "Timing", type: "text", placeholder: "When should it be performed?", description: "Optimal timing or required conditions" },
        { name: "effects", label: "Effects", type: "text", placeholder: "What are the effects?", description: "Expected outcomes and effects" },
        { name: "risks", label: "Risks", type: "text", placeholder: "What are the dangers?", description: "Potential risks and negative consequences" },
        { name: "variations", label: "Variations", type: "tags", placeholder: "Add variations", description: "Different versions or adaptations" }
      ]
    }
  ]
};

export default ritualConfig;