import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const timelineConfig: ContentTypeFormConfig = {
  title: "Timeline Creator",
  description: "Create chronological sequences of events",
  icon: "Clock",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Clock",
      fields: [
        Fields.createImageField("timeline"),
        Fields.createNameField("timeline"),
        { name: "timelineType", label: "Timeline Type", type: "select", options: ["Historical", "Personal", "Fictional", "Political", "Cultural", "Military", "Scientific", "Other"], description: "What type of timeline is this?" },
        { name: "scope", label: "Scope", type: "text", placeholder: "Geographic or thematic scope", description: "What area or theme does this timeline cover?" },
        { name: "timeScale", label: "Time Scale", type: "select", options: ["Years", "Decades", "Centuries", "Millennia", "Days", "Months", "Ages", "Other"], description: "What time scale does this timeline use?" },
        Fields.createDescriptionField("timeline")
      ]
    },
    {
      id: "events",
      label: "Key Events",
      icon: "Target",
      fields: [
        { name: "majorEvents", label: "Major Events", type: "tags", placeholder: "Add major events", description: "Key events in this timeline" },
        { name: "startDate", label: "Start Date", type: "text", placeholder: "When does this timeline begin?", description: "The beginning point of this timeline" },
        { name: "endDate", label: "End Date", type: "text", placeholder: "When does this timeline end?", description: "The ending point of this timeline (if applicable)" },
        { name: "turningPoints", label: "Turning Points", type: "textarea", placeholder: "Describe major turning points...", description: "Critical moments that changed everything" }
      ]
    },
    {
      id: "context",
      label: "Historical Context",
      icon: "Book",
      fields: [
        { name: "keyFigures", label: "Key Figures", type: "autocomplete-character", placeholder: "Search or create important people...", description: "Important people in this timeline" },
        { name: "locations", label: "Important Locations", type: "autocomplete-location", placeholder: "Search or create key locations...", description: "Significant places in this timeline" },
        { name: "culturalImpact", label: "Cultural Impact", type: "textarea", placeholder: "Cultural significance and impact...", description: "How this timeline affected culture and society" },
        { name: "technologicalAdvances", label: "Technological Advances", type: "tags", placeholder: "Add technological developments", description: "Technology that emerged during this period" }
      ]
    }
  ]
};

export default timelineConfig;