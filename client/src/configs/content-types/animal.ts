import { ContentTypeFormConfig } from '../../components/forms/types';
import { ANIMAL_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const animalConfig: ContentTypeFormConfig = {
  title: "Animal Creator",
  description: "Create detailed animals for your world",
  icon: "Cat",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Cat",
      fields: [
        Fields.createImageField("animal"),
        Fields.createNameField("animal"),
        Fields.createTypeField("animal", ANIMAL_TYPES),
        Fields.createDescriptionField("animal"),
        Fields.createHabitatField(),
        Fields.createGenreField()
      ]
    },
    {
      id: "biology",
      label: "Biology & Behavior",
      icon: "Heart",
      fields: [
        { name: "diet", label: "Diet", type: "text", placeholder: "What does it eat?", description: "Dietary habits and food sources" },
        { name: "behavior", label: "Behavior", type: "textarea", placeholder: "How does it behave?", description: "Behavioral patterns and temperament" },
        { name: "lifespan", label: "Lifespan", type: "text", placeholder: "How long does it live?", description: "Average lifespan and lifecycle" },
        { name: "reproduction", label: "Reproduction", type: "text", placeholder: "How does it reproduce?", description: "Mating and reproductive behaviors" },
        { name: "socialStructure", label: "Social Structure", type: "text", placeholder: "How do they organize socially?", description: "Pack behavior and social organization" }
      ]
    },
    {
      id: "traits",
      label: "Traits & Abilities",
      icon: "Zap",
      fields: [
        { name: "physicalTraits", label: "Physical Traits", type: "tags", placeholder: "Add physical characteristics", description: "Notable physical features and traits" },
        Fields.createAbilitiesField(),
        { name: "intelligence", label: "Intelligence", type: "text", placeholder: "How intelligent is it?", description: "Intelligence level and cognitive abilities" },
        { name: "domestication", label: "Domestication", type: "text", placeholder: "Can it be domesticated?", description: "Relationship with civilized species" }
      ]
    }
  ]
};

export default animalConfig;