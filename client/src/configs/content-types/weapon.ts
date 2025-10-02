import { ContentTypeFormConfig } from '../../components/forms/types';
import { WEAPON_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const weaponConfig: ContentTypeFormConfig = {
  title: "Weapon Editor",
  description: "Design weapons for your world",
  icon: "Sword",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Sword",
      fields: [
        Fields.createImageField("weapon"),
        Fields.createNameField("weapon"),
        Fields.createTypeField("weapon", WEAPON_TYPES),
        Fields.createDescriptionField("weapon"),
        Fields.createGenreField()
      ]
    },
    {
      id: "stats",
      label: "Combat Stats",
      icon: "Zap",
      fields: [
        { name: "damage", label: "Damage", type: "text", placeholder: "Damage rating or dice (e.g., 1d8+2)" },
        { name: "range", label: "Range", type: "text", placeholder: "Melee, 100 feet, etc." },
        Fields.createWeightField(),
        { name: "requirements", label: "Requirements", type: "text", placeholder: "Strength needed, training required, etc." },
        { name: "maintenance", label: "Maintenance", type: "textarea", placeholder: "How to care for and maintain this weapon..." }
      ]
    },
    {
      id: "crafting",
      label: "Crafting & Lore",
      icon: "Wrench",
      fields: [
        Fields.createMaterialsField(),
        { name: "craftsmanship", label: "Craftsmanship", type: "text", placeholder: "Masterwork, crude, ornate, etc." },
        { name: "enchantments", label: "Enchantments", type: "tags", placeholder: "fire damage, glowing, etc.", description: "Magical properties (comma-separated)" },
        Fields.createHistoryField("weapon"),
        Fields.createRarityField(),
        Fields.createValueField()
      ]
    }
  ]
};

export default weaponConfig;