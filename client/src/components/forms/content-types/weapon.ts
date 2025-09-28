import { ContentTypeFormConfig } from '../types';
import { 
  createRarityField,
  createValueField,
  createMaterialsField
} from '@/lib/field-definitions';

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
        // Using original custom text to preserve exact UX
        { name: "name", label: "Weapon Name", type: "text", placeholder: "Enter weapon name..." },
        { name: "weaponType", label: "Weapon Type", type: "select", options: ["Sword", "Bow", "Staff", "Dagger", "Axe", "Mace", "Spear", "Crossbow", "Wand", "Other"] },
        { name: "description", label: "Description", type: "textarea", placeholder: "Detailed description of the weapon...", description: "What does this weapon look like and how does it function?" },
        { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Modern", "Historical", "Steampunk", "Other"] }
      ]
    },
    {
      id: "stats",
      label: "Combat Stats",
      icon: "Zap",
      fields: [
        { name: "damage", label: "Damage", type: "text", placeholder: "Damage rating or dice (e.g., 1d8+2)" },
        { name: "range", label: "Range", type: "text", placeholder: "Melee, 100 feet, etc." },
        { name: "weight", label: "Weight", type: "text", placeholder: "3 lbs, heavy, light, etc." },
        { name: "requirements", label: "Requirements", type: "text", placeholder: "Strength needed, training required, etc." },
        { name: "maintenance", label: "Maintenance", type: "textarea", placeholder: "How to care for and maintain this weapon..." }
      ]
    },
    {
      id: "crafting",
      label: "Crafting & Lore",
      icon: "Wrench",
      fields: [
        // Using shared field where text exactly matches original
        createMaterialsField(),
        { name: "craftsmanship", label: "Craftsmanship", type: "text", placeholder: "Masterwork, crude, ornate, etc." },
        { name: "enchantments", label: "Enchantments", type: "tags", placeholder: "fire damage, glowing, etc.", description: "Magical properties (comma-separated)" },
        // Using original custom text to preserve exact UX
        { name: "history", label: "History", type: "textarea", placeholder: "The weapon's origin story and past owners..." },
        // Using shared fields where text exactly matches original
        createRarityField(),
        createValueField()
      ]
    }
  ]
};

export default weaponConfig;