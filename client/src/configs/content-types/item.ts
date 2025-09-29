import { ContentTypeFormConfig } from '../../components/forms/types';
import { ITEM_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const itemConfig: ContentTypeFormConfig = {
  title: "Item Creator",
  description: "Create detailed items for your world",
  icon: "Package",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Package",
      fields: [
        Fields.createNameField("item"),
        Fields.createNotebookField(),
        Fields.createTypeField("item", ITEM_TYPES),
        Fields.createDescriptionField("item"),
        Fields.createRarityField()
      ]
    },
    {
      id: "properties",
      label: "Properties & Value",
      icon: "Gem",
      fields: [
        Fields.createValueField(),
        Fields.createWeightField(),
        Fields.createPropertiesField(),
        Fields.createMaterialsField(),
        { name: "requirements", label: "Requirements", type: "text", placeholder: "Usage requirements...", description: "Requirements to use this item effectively" }
      ]
    },
    {
      id: "lore",
      label: "Lore & Abilities",
      icon: "BookOpen",
      fields: [
        Fields.createHistoryField("item"),
        Fields.createAbilitiesField(),
        { name: "crafting", label: "Crafting", type: "text", placeholder: "How is it made?", description: "Crafting process and requirements" }
      ]
    }
  ]
};

export default itemConfig;