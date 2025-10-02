import { ContentTypeFormConfig } from '../../components/forms/types';
import { FOOD_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const foodConfig: ContentTypeFormConfig = {
  title: "Food Creator",
  description: "Create detailed foods for your world",
  icon: "Apple",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Apple",
      fields: [
        Fields.createImageField("food"),
        Fields.createNameField("food"),
        Fields.createTypeField("food", FOOD_TYPES),
        Fields.createDescriptionField("food"),
        Fields.createOriginField(),
        Fields.createGenreField()
      ]
    },
    {
      id: "details",
      label: "Details & Properties",
      icon: "Leaf",
      fields: [
        { name: "taste", label: "Taste", type: "text", placeholder: "How does it taste?", description: "Flavor profile and taste characteristics" },
        { name: "texture", label: "Texture", type: "text", placeholder: "What's the texture like?", description: "Physical texture and mouthfeel" },
        { name: "ingredients", label: "Ingredients", type: "tags", placeholder: "Add ingredients", description: "Main ingredients or components" },
        { name: "preparation", label: "Preparation", type: "textarea", placeholder: "How is it prepared?", description: "Cooking or preparation methods" },
        { name: "nutritionalValue", label: "Nutritional Value", type: "text", placeholder: "Health benefits or effects", description: "Nutritional content and health effects" }
      ]
    },
    {
      id: "cultural",
      label: "Cultural & Economic",
      icon: "Users",
      fields: [
        Fields.createCulturalSignificanceField(),
        { name: "cost", label: "Cost", type: "text", placeholder: "How expensive is it?", description: "Economic value and affordability" },
        Fields.createRarityField(),
        { name: "seasonality", label: "Seasonality", type: "text", placeholder: "When is it available?", description: "Seasonal availability" }
      ]
    }
  ]
};

export default foodConfig;