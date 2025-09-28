import { ContentTypeFormConfig } from '../types';

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
        { name: "materials", label: "Materials", type: "tags", placeholder: "steel, wood, leather...", description: "Materials used in construction (comma-separated)" },
        { name: "craftsmanship", label: "Craftsmanship", type: "text", placeholder: "Masterwork, crude, ornate, etc." },
        { name: "enchantments", label: "Enchantments", type: "tags", placeholder: "fire damage, glowing, etc.", description: "Magical properties (comma-separated)" },
        { name: "history", label: "History", type: "textarea", placeholder: "The weapon's origin story and past owners..." },
        { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"] },
        { name: "value", label: "Value", type: "text", placeholder: "500 gold, priceless, etc." }
      ]
    }
  ]
};

export default weaponConfig;