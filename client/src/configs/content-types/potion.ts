import { ContentTypeFormConfig } from '../../components/forms/types';
import { POTION_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const potionConfig: ContentTypeFormConfig = {
  title: "Potion Creator",
  description: "Create magical brews and elixirs",
  icon: "FlaskConical",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "FlaskConical",
      fields: [
        Fields.createImageField("potion"),
        Fields.createNameField("potion"),
        Fields.createTypeField("potion", POTION_TYPES),
        Fields.createRarityField(),
        Fields.createDescriptionField("potion"),
        Fields.createGenreField()
      ]
    },
    {
      id: "properties",
      label: "Properties & Effects",
      icon: "Zap",
      fields: [
        { name: "effect", label: "Primary Effect", type: "textarea", placeholder: "What does this potion do?", description: "The main magical or chemical effect" },
        Fields.createDurationField(),
        { name: "onset", label: "Onset Time", type: "text", placeholder: "How quickly does it work?", description: "Time before effects begin" },
        { name: "sideEffects", label: "Side Effects", type: "textarea", placeholder: "Any negative side effects?", description: "Unwanted or dangerous effects" },
        { name: "appearance", label: "Appearance", type: "text", placeholder: "Color, texture, smell...", description: "What does the potion look like?" }
      ]
    },
    {
      id: "creation",
      label: "Creation & Usage",
      icon: "Sparkles",
      fields: [
        { name: "ingredients", label: "Ingredients", type: "autocomplete-material", placeholder: "Search or create ingredients...", description: "Materials needed to create this potion" },
        { name: "recipe", label: "Recipe", type: "textarea", placeholder: "How is this potion made?", description: "Step-by-step brewing instructions" },
        { name: "difficulty", label: "Brewing Difficulty", type: "select", options: ["Trivial", "Easy", "Moderate", "Hard", "Extreme", "Legendary"], description: "How difficult is this to brew?" },
        { name: "creator", label: "Original Creator", type: "autocomplete-character", placeholder: "Search or create alchemist...", description: "Who first created this potion?", multiple: false },
        { name: "cost", label: "Market Value", type: "text", placeholder: "How much does it cost?", description: "Typical price or trade value" },
        { name: "dosage", label: "Dosage", type: "text", placeholder: "How much to consume?", description: "Recommended amount for desired effect" }
      ]
    }
  ]
};

export default potionConfig;