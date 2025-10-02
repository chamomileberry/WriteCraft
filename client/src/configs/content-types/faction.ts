import { ContentTypeFormConfig } from '../../components/forms/types';
import { FACTION_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const factionConfig: ContentTypeFormConfig = {
  title: "Faction Creator",
  description: "Create detailed factions for your world",
  icon: "Flag",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Flag",
      fields: [
        Fields.createImageField("faction"),
        Fields.createNameField("faction"),
        Fields.createTypeField("faction", FACTION_TYPES),
        Fields.createDescriptionField("faction"),
        { name: "goals", label: "Goals", type: "text", placeholder: "What are their goals?", description: "Primary objectives and ambitions" },
        Fields.createGenreField()
      ]
    },
    {
      id: "organization",
      label: "Organization & Power",
      icon: "Crown",
      fields: [
        { name: "ideology", label: "Ideology", type: "text", placeholder: "Core beliefs and ideology", description: "Fundamental beliefs and principles" },
        { name: "leadership", label: "Leadership", type: "autocomplete-character", placeholder: "Search or create faction leaders...", description: "Leadership structure and key figures" },
        { name: "members", label: "Members", type: "autocomplete-character", placeholder: "Search or create faction members...", description: "Types of members and recruitment" },
        Fields.createResourcesField(),
        { name: "territory", label: "Territory", type: "autocomplete-location", placeholder: "Search or create territories...", description: "Geographic areas under their influence" },
        { name: "influence", label: "Influence", type: "text", placeholder: "How influential are they?", description: "Level of power and influence" }
      ]
    },
    {
      id: "relations",
      label: "Relations & Operations",
      icon: "Users",
      fields: [
        { name: "allies", label: "Allies", type: "autocomplete-faction", placeholder: "Search or create allied factions...", description: "Allied factions and supporters" },
        { name: "enemies", label: "Enemies", type: "autocomplete-faction", placeholder: "Search or create enemy factions...", description: "Opposing factions and rivals" },
        { name: "methods", label: "Methods", type: "text", placeholder: "How do they operate?", description: "Tactics and methods of operation" },
        { name: "secrets", label: "Secrets", type: "text", placeholder: "Hidden secrets", description: "Secret information or hidden agendas" },
        Fields.createHistoryField("faction")
      ]
    }
  ]
};

export default factionConfig;