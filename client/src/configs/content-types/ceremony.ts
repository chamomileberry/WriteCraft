import { ContentTypeFormConfig } from '../../components/forms/types';
import { CEREMONY_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const ceremonyConfig: ContentTypeFormConfig = {
  title: "Ceremony Creator",
  description: "Design important cultural ceremonies",
  icon: "Crown",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Crown",
      fields: [
        Fields.createNameField("ceremony"),
        Fields.createTypeField("ceremony", CEREMONY_TYPES),
        Fields.createPurposeField(),
        Fields.createDescriptionField("ceremony"),
        Fields.createGenreField()
      ]
    },
    {
      id: "ritual",
      label: "Ritual & Process",
      icon: "Sparkles",
      fields: [
        { name: "steps", label: "Ceremony Steps", type: "textarea", placeholder: "Describe the ceremonial process...", description: "The sequence of events and actions" },
        Fields.createDurationField(),
        { name: "participants", label: "Participants", type: "autocomplete-character", placeholder: "Search or create participants...", description: "Who participates in this ceremony?" },
        { name: "officiant", label: "Officiant", type: "text", placeholder: "Who leads the ceremony?", description: "The person who conducts or oversees the ceremony" }
      ]
    },
    {
      id: "cultural",
      label: "Cultural Context",
      icon: "Globe",
      fields: [
        { name: "culture", label: "Associated Culture", type: "autocomplete-culture", placeholder: "Search or create culture...", description: "The culture that practices this ceremony", multiple: false },
        { name: "location", label: "Ceremony Location", type: "autocomplete-location", placeholder: "Search or create location...", description: "Where is this ceremony typically held?", multiple: false },
        { name: "requiredItems", label: "Required Items", type: "tags", placeholder: "Add ceremonial items", description: "Special objects needed for the ceremony" },
        Fields.createSymbolismField(),
        { name: "traditions", label: "Related Traditions", type: "autocomplete-tradition", placeholder: "Search or create traditions...", description: "Connected cultural traditions" }
      ]
    }
  ]
};

export default ceremonyConfig;