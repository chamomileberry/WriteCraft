import { ContentTypeFormConfig } from '../../components/forms/types';
import { ACCESSORY_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const accessoryConfig: ContentTypeFormConfig = {
  title: "Accessory Creator",
  description: "Create detailed accessories for your world",
  icon: "Watch",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Watch",
      fields: [
        Fields.createImageField("accessory"),
        Fields.createNameField("accessory"),
        Fields.createTypeField("accessory", ACCESSORY_TYPES),
        Fields.createDescriptionField("accessory"),
        { name: "appearance", label: "Appearance", type: "text", placeholder: "What does it look like?", description: "Visual appearance and design" },
        Fields.createGenreField()
      ]
    },
    {
      id: "properties",
      label: "Properties & Materials",
      icon: "Gem",
      fields: [
        Fields.createMaterialsField(),
        { name: "functionality", label: "Functionality", type: "text", placeholder: "What does it do?", description: "Practical functions or purposes" },
        Fields.createValueField(),
        Fields.createRarityField()
      ]
    },
    {
      id: "lore",
      label: "Lore & Magic",
      icon: "Sparkles",
      fields: [
        { name: "enchantments", label: "Enchantments", type: "tags", placeholder: "Add magical properties", description: "Magical enchantments or properties" },
        Fields.createCulturalSignificanceField(),
        Fields.createHistoryField("accessory")
      ]
    }
  ]
};

export default accessoryConfig;