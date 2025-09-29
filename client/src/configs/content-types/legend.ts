import { ContentTypeFormConfig } from '../../components/forms/types';
import { LEGEND_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const legendConfig: ContentTypeFormConfig = {
  title: "Legend Creator",
  description: "Create detailed legends for your world",
  icon: "Shield",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Shield",
      fields: [
        { name: "title", label: "Legend Title", type: "text", placeholder: "Enter legend title...", description: "The title of this legend" },
        Fields.createTypeField("legend", LEGEND_TYPES),
        { name: "summary", label: "Summary", type: "textarea", placeholder: "Brief summary of the legend...", description: "Short summary of the legend's main story" },
        { name: "location", label: "Location", type: "text", placeholder: "Where did this take place?", description: "Geographic setting of the legend" },
        Fields.createGenreField()
      ]
    },
    {
      id: "story",
      label: "Story & Characters",
      icon: "Users",
      fields: [
        { name: "fullStory", label: "Full Story", type: "textarea", placeholder: "Tell the complete legend...", description: "The complete narrative of the legend" },
        { name: "mainCharacters", label: "Main Characters", type: "tags", placeholder: "Add main characters", description: "Key figures in the legend" },
        { name: "timeframe", label: "Timeframe", type: "text", placeholder: "When did this occur?", description: "Historical period or time when events occurred" },
        { name: "historicalBasis", label: "Historical Basis", type: "text", placeholder: "What historical truth exists?", description: "Real historical events or figures that inspired the legend" }
      ]
    },
    {
      id: "truth",
      label: "Truth & Impact",
      icon: "Search",
      fields: [
        { name: "truthElements", label: "Truth Elements", type: "text", placeholder: "What parts are likely true?", description: "Elements that may be historically accurate" },
        { name: "exaggerations", label: "Exaggerations", type: "text", placeholder: "What parts are embellished?", description: "Aspects that have been embellished over time" },
        { name: "culturalImpact", label: "Cultural Impact", type: "text", placeholder: "How has it influenced culture?", description: "Impact on culture and society" },
        { name: "modernAdaptations", label: "Modern Adaptations", type: "tags", placeholder: "Add modern adaptations", description: "Contemporary retellings and adaptations" }
      ]
    }
  ]
};

export default legendConfig;