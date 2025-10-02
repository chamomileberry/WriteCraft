import { ContentTypeFormConfig } from '../../components/forms/types';
import { RESOURCE_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const resourceConfig: ContentTypeFormConfig = {
  title: "Resource Creator",
  description: "Create detailed resources for your world",
  icon: "Gem",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Gem",
      fields: [
        Fields.createImageField("resource"),
        Fields.createNameField("resource"),
        Fields.createTypeField("resource", RESOURCE_TYPES),
        Fields.createDescriptionField("resource"),
        { name: "abundance", label: "Abundance", type: "select", options: ["Abundant", "Common", "Uncommon", "Rare", "Very Rare", "Extinct"], description: "How abundant is this resource?" },
        Fields.createGenreField()
      ]
    },
    {
      id: "extraction",
      label: "Extraction & Location",
      icon: "Pickaxe",
      fields: [
        { name: "location", label: "Location", type: "text", placeholder: "Where is it found?", description: "Geographic locations where it can be found" },
        { name: "extractionMethod", label: "Extraction Method", type: "text", placeholder: "How is it extracted?", description: "Methods used to harvest or extract the resource" },
        { name: "renewability", label: "Renewability", type: "select", options: ["Renewable", "Sustainable", "Limited", "Non-renewable", "Finite"], description: "Can this resource be replenished?" },
        { name: "controlledBy", label: "Controlled By", type: "text", placeholder: "Who controls access?", description: "Organizations or entities that control this resource" }
      ]
    },
    {
      id: "economics",
      label: "Economics & Politics",
      icon: "Coins",
      fields: [
        { name: "uses", label: "Uses", type: "tags", placeholder: "Add resource uses", description: "Primary uses and applications" },
        Fields.createValueField(),
        { name: "tradeCommodity", label: "Trade Commodity", type: "text", placeholder: "Trade importance", description: "Importance in trade and commerce" },
        { name: "conflicts", label: "Conflicts", type: "text", placeholder: "Resource-related conflicts", description: "Wars or conflicts over this resource" },
        Fields.createRarityField()
      ]
    }
  ]
};

export default resourceConfig;