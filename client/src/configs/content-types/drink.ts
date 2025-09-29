import { ContentTypeFormConfig } from '../../components/forms/types';
import { DRINK_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const drinkConfig: ContentTypeFormConfig = {
  title: "Drink Creator",
  description: "Create detailed drinks for your world",
  icon: "Cup",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Cup",
      fields: [
        Fields.createNameField("drink"),
        Fields.createTypeField("drink", DRINK_TYPES),
        Fields.createDescriptionField("drink"),
        { name: "alcoholContent", label: "Alcohol Content", type: "text", placeholder: "Alcohol percentage or strength", description: "Alcoholic strength if applicable" },
        Fields.createGenreField()
      ]
    },
    {
      id: "properties",
      label: "Properties & Effects",
      icon: "Zap",
      fields: [
        { name: "taste", label: "Taste", type: "text", placeholder: "How does it taste?", description: "Flavor profile and taste characteristics" },
        { name: "appearance", label: "Appearance", type: "text", placeholder: "What does it look like?", description: "Visual appearance and color" },
        { name: "ingredients", label: "Ingredients", type: "tags", placeholder: "Add ingredients", description: "Main ingredients or components" },
        { name: "preparation", label: "Preparation", type: "textarea", placeholder: "How is it made?", description: "Brewing or preparation methods" },
        { name: "effects", label: "Effects", type: "text", placeholder: "What effects does it have?", description: "Physical or magical effects when consumed" }
      ]
    },
    {
      id: "cultural",
      label: "Cultural & Economic",
      icon: "Users",
      fields: [
        Fields.createOriginField(),
        Fields.createCulturalSignificanceField(),
        { name: "cost", label: "Cost", type: "text", placeholder: "How expensive is it?", description: "Economic value and affordability" },
        Fields.createRarityField()
      ]
    }
  ]
};

export default drinkConfig;