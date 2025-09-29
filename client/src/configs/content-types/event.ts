import { ContentTypeFormConfig } from '../../components/forms/types';
import { EVENT_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const eventConfig: ContentTypeFormConfig = {
  title: "Event Creator",
  description: "Create detailed events for your world",
  icon: "Calendar",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Calendar",
      fields: [
        Fields.createNameField("event"),
        Fields.createTypeField("event", EVENT_TYPES),
        Fields.createDescriptionField("event"),
        { name: "date", label: "Date", type: "text", placeholder: "When did it occur?", description: "Date or time period when the event occurred" },
        Fields.createGenreField()
      ]
    },
    {
      id: "details",
      label: "Details & Participants",
      icon: "Users",
      fields: [
        { name: "location", label: "Location", type: "autocomplete-location", placeholder: "Where did it happen?", description: "Geographic location where the event took place" },
        { name: "participants", label: "Participants", type: "autocomplete-character", placeholder: "Add participants", description: "Key individuals, groups, or organizations involved" },
        Fields.createDurationField(),
        { name: "scale", label: "Scale", type: "text", placeholder: "How big was the impact?", description: "Scale and scope of the event's impact" }
      ]
    },
    {
      id: "impact",
      label: "Causes & Consequences",
      icon: "Target",
      fields: [
        { name: "causes", label: "Causes", type: "text", placeholder: "What caused this event?", description: "Underlying causes and triggers" },
        { name: "consequences", label: "Consequences", type: "text", placeholder: "What were the results?", description: "Immediate and long-term consequences" },
        { name: "significance", label: "Significance", type: "text", placeholder: "Why is it important?", description: "Historical or cultural significance" },
        { name: "legacy", label: "Legacy", type: "text", placeholder: "What legacy did it leave?", description: "Lasting impact and legacy" },
        { name: "documentation", label: "Documentation", type: "text", placeholder: "How was it recorded?", description: "How the event was documented or remembered" },
        { name: "conflictingAccounts", label: "Conflicting Accounts", type: "text", placeholder: "Are there different versions?", description: "Different perspectives or conflicting historical accounts" }
      ]
    }
  ]
};

export default eventConfig;