import { ContentTypeFormConfig } from '../../components/forms/types';

export const creatureConfig: ContentTypeFormConfig = {
  title: "Creature Creator",
  description: "Create detailed creatures for your world",
  icon: "Zap",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Zap",
      fields: [
        { name: "name", label: "Creature Name", type: "text", placeholder: "Enter creature name...", description: "The name of this creature" },
        { name: "creatureType", label: "Creature Type", type: "select", options: ["Beast", "Dragon", "Humanoid", "Fey", "Fiend", "Celestial", "Construct", "Undead", "Elemental", "Aberration", "Other"], description: "What type of creature is this?" },
        { name: "habitat", label: "Habitat", type: "text", placeholder: "Where does it live?", description: "Natural environment and preferred living conditions" },
        { name: "behavior", label: "Behavior", type: "textarea", placeholder: "How does it behave?", description: "Typical behavior patterns and temperament" },
        { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Horror", "Modern", "Historical", "Other"], description: "What genre setting is this for?" }
      ]
    },
    {
      id: "physical",
      label: "Physical Description",
      icon: "Eye",
      fields: [
        { name: "physicalDescription", label: "Physical Description", type: "textarea", placeholder: "Describe their appearance...", description: "Detailed description of the creature's physical appearance" },
        { name: "abilities", label: "Abilities", type: "tags", placeholder: "Add creature abilities", description: "Special abilities, powers, or skills this creature possesses" }
      ]
    },
    {
      id: "cultural",
      label: "Cultural Significance",
      icon: "Users",
      fields: [
        { name: "culturalSignificance", label: "Cultural Significance", type: "textarea", placeholder: "What role does this creature play in cultures?", description: "How different cultures view and interact with this creature" }
      ]
    }
  ]
};

export default creatureConfig;