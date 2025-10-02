import { ContentTypeFormConfig } from '../../components/forms/types';
import { BUILDING_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const buildingConfig: ContentTypeFormConfig = {
  title: "Building Editor", 
  description: "Design structures for your world",
  icon: "Building",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Building",
      fields: [
        Fields.createImageField("building"),
        Fields.createNameField("building"),
        Fields.createTypeField("building", BUILDING_TYPES),
        Fields.createDescriptionField("building"),
        { name: "genre", label: "Genre", type: "select", options: ["Fantasy", "Sci-Fi", "Modern", "Historical", "Steampunk", "Other"] }
      ]
    },
    {
      id: "structure",
      label: "Structure",
      icon: "Hammer",
      fields: [
        { name: "architecture", label: "Architecture", type: "text", placeholder: "Gothic, Roman, modern, etc." },
        Fields.createMaterialsField(),
        { name: "capacity", label: "Capacity", type: "text", placeholder: "Number of people it can hold" },
        { name: "defenses", label: "Defenses", type: "text", placeholder: "Walls, guards, magical wards, etc." },
        { name: "currentCondition", label: "Current Condition", type: "text", placeholder: "Excellent, worn, ruins, etc." }
      ]
    },
    {
      id: "purpose",
      label: "Purpose & Lore",
      icon: "Scroll",
      fields: [
        Fields.createPurposeField(),
        Fields.createHistoryField("building"),
        { name: "location", label: "Location", type: "text", placeholder: "Where in the world is it located?" },
        { name: "owner", label: "Owner", type: "text", placeholder: "Who owns or controls this building?" },
        { name: "significance", label: "Significance", type: "textarea", placeholder: "Why is this building important?..." },
        { name: "secrets", label: "Secrets", type: "textarea", placeholder: "Hidden rooms, mysteries, secrets..." }
      ]
    }
  ]
};

export default buildingConfig;