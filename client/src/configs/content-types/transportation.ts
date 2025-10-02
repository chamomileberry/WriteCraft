import { ContentTypeFormConfig } from '../../components/forms/types';
import { TRANSPORTATION_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const transportationConfig: ContentTypeFormConfig = {
  title: "Transportation Creator",
  description: "Create detailed transportation for your world",
  icon: "Car",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Car",
      fields: [
        Fields.createImageField("transportation"),
        Fields.createNameField("transportation"),
        Fields.createTypeField("transportation", TRANSPORTATION_TYPES),
        Fields.createDescriptionField("transportation"),
        { name: "capacity", label: "Capacity", type: "text", placeholder: "How many can it carry?", description: "Passenger or cargo capacity" },
        Fields.createGenreField()
      ]
    },
    {
      id: "performance",
      label: "Performance & Operation",
      icon: "Zap",
      fields: [
        { name: "speed", label: "Speed", type: "text", placeholder: "How fast is it?", description: "Maximum speed and typical travel speed" },
        { name: "range", label: "Range", type: "text", placeholder: "How far can it travel?", description: "Maximum distance or range" },
        { name: "requirements", label: "Requirements", type: "text", placeholder: "What does it need to operate?", description: "Fuel, energy, or other operational requirements" },
        { name: "operation", label: "Operation", type: "text", placeholder: "How is it operated?", description: "Operation methods and controls" }
      ]
    },
    {
      id: "economics",
      label: "Economics & Culture",
      icon: "Coins",
      fields: [
        { name: "construction", label: "Construction", type: "text", placeholder: "How is it built?", description: "Construction materials and methods" },
        { name: "cost", label: "Cost", type: "text", placeholder: "How expensive is it?", description: "Purchase, maintenance, and operation costs" },
        Fields.createRarityField(),
        { name: "advantages", label: "Advantages", type: "tags", placeholder: "Add advantages", description: "Benefits and advantages" },
        { name: "disadvantages", label: "Disadvantages", type: "tags", placeholder: "Add disadvantages", description: "Limitations and drawbacks" },
        Fields.createCulturalSignificanceField()
      ]
    }
  ]
};

export default transportationConfig;