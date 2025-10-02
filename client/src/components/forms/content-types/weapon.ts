import { ContentTypeFormConfig } from '../types';
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
        Fields.createNameField("weapon"),                    // <-- Replace manual name field
        Fields.createTypeField("weapon", WEAPON_TYPES),      // <-- Replace manual type field
        Fields.createDescriptionField("weapon"),             // <-- Replace manual description
        Fields.createGenreField()                            // <-- Replace manual genre field
      ]
    },
    {
      id: "stats",
      label: "Combat Stats",
      icon: "Zap",
      fields: [
        { name: "damage", label: "Damage", type: "text", placeholder: "Damage rating or dice (e.g., 1d8+2)" },
        { name: "range", label: "Range", type: "text", placeholder: "Melee, 100 feet, etc." },
        Fields.createWeightField(),                          // <-- Replace manual weight field
        { name: "requirements", label: "Requirements", type: "text", placeholder: "Strength needed, training required, etc." },
        { name: "maintenance", label: "Maintenance", type: "textarea", placeholder: "How to care for and maintain this weapon..." }
      ]
    },
    {
      id: "crafting",
      label: "Crafting & Lore",
      icon: "Wrench",
      fields: [
        Fields.createMaterialsField(),                       // <-- Already using this!
        { name: "craftsmanship", label: "Craftsmanship", type: "text", placeholder: "Masterwork, crude, ornate, etc." },
        { name: "enchantments", label: "Enchantments", type: "tags", placeholder: "fire damage, glowing, etc.", description: "Magical properties (comma-separated)" },
        Fields.createHistoryField("weapon"),                 // <-- Replace manual history field
        Fields.createRarityField(),                          // <-- Changed from createRarityField()
        Fields.createValueField()                            // <-- Changed from createValueField()
      ]
    }
  ]
};

export default weaponConfig;
