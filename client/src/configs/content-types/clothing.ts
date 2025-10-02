import { ContentTypeFormConfig } from '../../components/forms/types';
import { CLOTHING_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const clothingConfig: ContentTypeFormConfig = {
  title: "Clothing Creator",
  description: "Create detailed clothing for your world",
  icon: "Shirt",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Shirt",
      fields: [
        Fields.createImageField("clothing"),
        Fields.createNameField("clothing"),
        Fields.createTypeField("clothing", CLOTHING_TYPES),
        Fields.createDescriptionField("clothing"),
        { name: "style", label: "Style", type: "text", placeholder: "Fashion style", description: "Fashion style and aesthetic" },
        Fields.createGenreField()
      ]
    },
    {
      id: "materials",
      label: "Materials & Colors",
      icon: "Palette",
      fields: [
        Fields.createMaterialsField(),
        { name: "colors", label: "Colors", type: "tags", placeholder: "Add colors", description: "Primary colors and patterns" },
        { name: "durability", label: "Durability", type: "text", placeholder: "How durable is it?", description: "Durability and wear resistance" },
        Fields.createClimateField()
      ]
    },
    {
      id: "social",
      label: "Social & Cultural",
      icon: "Users",
      fields: [
        { name: "socialClass", label: "Social Class", type: "text", placeholder: "Associated social class", description: "Which social classes typically wear this" },
        { name: "culturalContext", label: "Cultural Context", type: "text", placeholder: "Cultural significance", description: "Cultural meaning and context" },
        { name: "occasion", label: "Occasion", type: "text", placeholder: "When is it worn?", description: "Appropriate occasions and events" },
        { name: "cost", label: "Cost", type: "text", placeholder: "How expensive is it?", description: "Economic cost and affordability" }
      ]
    }
  ]
};

export default clothingConfig;