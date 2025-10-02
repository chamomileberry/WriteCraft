import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const speciesConfig: ContentTypeFormConfig = {
  title: "Species Creator",
  description: "Create detailed species for your world",
  icon: "Zap",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Zap",
      fields: [
        Fields.createImageField("species"),
        Fields.createNameField("species"),
        { name: "classification", label: "Classification", type: "text", placeholder: "Scientific or fantasy classification", description: "Taxonomic or fantasy classification" },
        { name: "physicalDescription", label: "Physical Description", type: "textarea", placeholder: "Describe their appearance...", description: "Detailed physical characteristics" },
        Fields.createHabitatField()
      ]
    },
    {
      id: "biology",
      label: "Biology & Behavior",
      icon: "Heart",
      fields: [
        { name: "behavior", label: "Behavior", type: "textarea", placeholder: "How do they behave?", description: "Behavioral patterns and traits" },
        { name: "diet", label: "Diet", type: "text", placeholder: "What do they eat?", description: "Dietary habits and food sources" },
        { name: "lifespan", label: "Lifespan", type: "text", placeholder: "How long do they live?", description: "Average lifespan and lifecycle" },
        { name: "intelligence", label: "Intelligence", type: "text", placeholder: "How intelligent are they?", description: "Intelligence level and cognitive abilities" },
        { name: "reproduction", label: "Reproduction", type: "text", placeholder: "How do they reproduce?", description: "Reproductive methods and mating behaviors" }
      ]
    },
    {
      id: "society",
      label: "Society & Traits",
      icon: "Users",
      fields: [
        { name: "socialStructure", label: "Social Structure", type: "text", placeholder: "How do they organize socially?", description: "Social organization and group dynamics" },
        Fields.createAbilitiesField(),
        { name: "weaknesses", label: "Weaknesses", type: "tags", placeholder: "Add weaknesses", description: "Vulnerabilities or limitations" },
        { name: "culturalTraits", label: "Cultural Traits", type: "text", placeholder: "Cultural characteristics...", description: "Cultural behaviors and traditions" }
      ]
    }
  ]
};

export default speciesConfig;