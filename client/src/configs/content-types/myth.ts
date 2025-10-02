import { ContentTypeFormConfig } from '../../components/forms/types';
import { MYTH_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const mythConfig: ContentTypeFormConfig = {
  title: "Myth Creator",
  description: "Create detailed myths for your world",
  icon: "Crown",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Crown",
      fields: [
        Fields.createImageField("myth"),
        { name: "title", label: "Myth Title", type: "text", placeholder: "Enter myth title...", description: "The title of this myth" },
        Fields.createTypeField("myth", MYTH_TYPES),
        { name: "summary", label: "Summary", type: "textarea", placeholder: "Brief summary of the myth...", description: "Short summary of the myth's main story" },
        { name: "culturalOrigin", label: "Cultural Origin", type: "text", placeholder: "Which culture does this come from?", description: "The culture or people this myth originates from" },
        Fields.createGenreField()
      ]
    },
    {
      id: "story",
      label: "Story & Characters",
      icon: "BookOpen",
      fields: [
        { name: "fullStory", label: "Full Story", type: "textarea", placeholder: "Tell the complete myth...", description: "The complete narrative of the myth" },
        { name: "characters", label: "Characters", type: "tags", placeholder: "Add mythical characters", description: "Key figures and characters in the myth" },
        { name: "themes", label: "Themes", type: "tags", placeholder: "Add themes", description: "Major themes and motifs" },
        Fields.createSymbolismField()
      ]
    },
    {
      id: "impact",
      label: "Impact & Variations",
      icon: "Star",
      fields: [
        { name: "moralLesson", label: "Moral Lesson", type: "text", placeholder: "What lesson does it teach?", description: "The moral or lesson conveyed by the myth" },
        { name: "modernRelevance", label: "Modern Relevance", type: "text", placeholder: "Contemporary significance", description: "How this myth relates to modern times" },
        { name: "variations", label: "Variations", type: "tags", placeholder: "Add variations", description: "Different versions or regional variations" },
        { name: "relatedMyths", label: "Related Myths", type: "tags", placeholder: "Add related myths", description: "Connected or similar myths" }
      ]
    }
  ]
};

export default mythConfig;