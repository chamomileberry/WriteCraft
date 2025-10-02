import { ContentTypeFormConfig } from '../../components/forms/types';
import { MILITARY_UNIT_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const militaryUnitConfig: ContentTypeFormConfig = {
  title: "Military Unit Creator",
  description: "Create detailed military units for your world",
  icon: "Shield",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Shield",
      fields: [
        Fields.createImageField("militaryUnit"),
        Fields.createNameField("unit"),
        Fields.createTypeField("militaryunit", MILITARY_UNIT_TYPES),
        Fields.createDescriptionField("unit"),
        { name: "size", label: "Size", type: "text", placeholder: "How many members?", description: "Number of soldiers or personnel" },
        Fields.createGenreField()
      ]
    },
    {
      id: "organization",
      label: "Organization & Equipment",
      icon: "Sword",
      fields: [
        { name: "composition", label: "Composition", type: "text", placeholder: "Unit structure", description: "How the unit is organized and structured" },
        { name: "equipment", label: "Equipment", type: "tags", placeholder: "Add equipment", description: "Weapons, armor, and equipment used" },
        { name: "training", label: "Training", type: "text", placeholder: "Training regimen", description: "Training methods and standards" },
        { name: "specializations", label: "Specializations", type: "tags", placeholder: "Add specializations", description: "Special skills and capabilities" },
        { name: "commander", label: "Commander", type: "autocomplete-character", placeholder: "Search or create commander...", description: "Leadership and command structure", multiple: false }
      ]
    },
    {
      id: "status",
      label: "Status & History",
      icon: "Award",
      fields: [
        { name: "morale", label: "Morale", type: "text", placeholder: "Current morale", description: "Fighting spirit and motivation" },
        { name: "reputation", label: "Reputation", type: "text", placeholder: "Unit's reputation", description: "How they are viewed by others" },
        { name: "battleRecord", label: "Battle Record", type: "text", placeholder: "Combat history", description: "Notable battles and achievements" },
        { name: "currentStatus", label: "Current Status", type: "text", placeholder: "Current deployment", description: "Current assignment and location" },
        Fields.createHistoryField("unit")
      ]
    }
  ]
};

export default militaryUnitConfig;