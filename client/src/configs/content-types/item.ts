import { ContentTypeFormConfig } from '../../components/forms/types';

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
        { name: "name", label: "Item Name", type: "text", placeholder: "Enter item name...", description: "The name of this item" },
        { name: "itemType", label: "Item Type", type: "select", options: ["Weapon", "Armor", "Tool", "Magic Item", "Artifact", "Consumable", "Trade Good", "Art Object", "Document", "Other"], description: "What type of item is this?" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Describe this item...", description: "Detailed description of the item" },
        { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"], description: "How rare is this item?" }
      ]
    },
    {
      id: "properties",
      label: "Properties & Value",
      icon: "Gem",
      fields: [
        { name: "value", label: "Value", type: "text", placeholder: "Item's worth...", description: "Economic value or cost" },
        { name: "weight", label: "Weight", type: "text", placeholder: "How heavy is it?", description: "Physical weight and portability" },
        { name: "properties", label: "Properties", type: "tags", placeholder: "Add item properties", description: "Special properties and characteristics" },
        { name: "materials", label: "Materials", type: "tags", placeholder: "Add materials used", description: "Materials used in construction" },
        { name: "requirements", label: "Requirements", type: "text", placeholder: "Usage requirements...", description: "Requirements to use this item effectively" }
      ]
    },
    {
      id: "lore",
      label: "Lore & Abilities",
      icon: "BookOpen",
      fields: [
        { name: "history", label: "History", type: "textarea", placeholder: "Item's history...", description: "Historical background and origin" },
        { name: "abilities", label: "Abilities", type: "tags", placeholder: "Add special abilities", description: "Magical or special abilities the item grants" },
        { name: "crafting", label: "Crafting", type: "text", placeholder: "How is it made?", description: "Crafting process and requirements" }
      ]
    }
  ]
};

export default itemConfig;