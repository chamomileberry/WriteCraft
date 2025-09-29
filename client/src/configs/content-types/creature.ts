import { ContentTypeFormConfig } from '../../components/forms/types';
import { CREATURE_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const creatureConfig: ContentTypeFormConfig = {
  title: "Creature Creator",
  description: "Create detailed creatures for your world",
  icon: "Zap",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Zap",
      fields: [
        Fields.createNameField("creature"),
        Fields.createTypeField("creature", CREATURE_TYPES),
        Fields.createHabitatField(),
        Fields.createBehaviorField(),
        { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Horror", "Modern", "Historical", "Other"], description: "What genre setting is this for?" }
      ]
    },
    {
      id: "physical",
      label: "Physical Description",
      icon: "Eye",
      fields: [
        { name: "physicalDescription", label: "Physical Description", type: "textarea", placeholder: "Describe their appearance...", description: "Detailed description of the creature's physical appearance" },
        Fields.createAbilitiesField()
      ]
    },
    {
      id: "cultural",
      label: "Cultural Significance",
      icon: "Users",
      fields: [
        Fields.createCulturalSignificanceField()
      ]
    }
  ]
};

export default creatureConfig;