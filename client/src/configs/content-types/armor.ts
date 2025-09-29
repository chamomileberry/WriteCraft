import { ContentTypeFormConfig } from '../../components/forms/types';
import { ARMOR_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const armorConfig: ContentTypeFormConfig = {
  title: "Armor Creator",
  description: "Create detailed armor for your world",
  icon: "Shield",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Shield",
      fields: [
        Fields.createNameField("armor"),
        Fields.createTypeField("armor", ARMOR_TYPES),
        Fields.createDescriptionField("armor"),
        { name: "protection", label: "Protection", type: "text", placeholder: "How much protection does it offer?", description: "Level and type of protection provided" },
        Fields.createGenreField()
      ]
    },
    {
      id: "properties",
      label: "Properties & Materials",
      icon: "Hammer",
      fields: [
        Fields.createWeightField(),
        Fields.createMaterialsField(),
        { name: "coverage", label: "Coverage", type: "text", placeholder: "What body parts does it cover?", description: "Areas of the body protected" },
        { name: "mobility", label: "Mobility", type: "text", placeholder: "How does it affect movement?", description: "Impact on wearer's mobility and dexterity" },
        { name: "craftsmanship", label: "Craftsmanship", type: "text", placeholder: "Quality of construction", description: "Level of skill and quality in creation" }
      ]
    },
    {
      id: "lore",
      label: "Lore & Value",
      icon: "BookOpen",
      fields: [
        { name: "enchantments", label: "Enchantments", type: "tags", placeholder: "Add magical enhancements", description: "Magical properties and enchantments" },
        Fields.createHistoryField("armor"),
        Fields.createValueField(),
        Fields.createRarityField(),
        { name: "maintenance", label: "Maintenance", type: "text", placeholder: "Care requirements", description: "How to maintain and care for the armor" }
      ]
    }
  ]
};

export default armorConfig;