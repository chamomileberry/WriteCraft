import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const ethnicityConfig: ContentTypeFormConfig = {
  title: "Ethnicity Creator",
  description: "Create detailed ethnicities for your world",
  icon: "Users",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Users",
      fields: [
        Fields.createImageField("ethnicity"),
        Fields.createNameField("ethnicity"),
        Fields.createOriginField(),
        { name: "physicalTraits", label: "Physical Traits", type: "text", placeholder: "Common physical characteristics", description: "Typical physical appearance and traits" },
        { name: "geography", label: "Geography", type: "autocomplete-location", placeholder: "Search locations...", description: "Geographic regions they inhabit" },
        Fields.createGenreField()
      ]
    },
    {
      id: "culture",
      label: "Culture & Society",
      icon: "Heart",
      fields: [
        { name: "culturalTraits", label: "Cultural Traits", type: "text", placeholder: "Cultural characteristics", description: "Distinctive cultural features and behaviors" },
        { name: "traditions", label: "Traditions", type: "autocomplete-tradition", placeholder: "Search traditions...", description: "Important traditions and customs" },
        { name: "language", label: "Language", type: "autocomplete-language", placeholder: "Search languages...", description: "Primary language or linguistic family" },
        { name: "religion", label: "Religion", type: "autocomplete-religion", placeholder: "Search religions...", description: "Primary religious or spiritual beliefs" },
        { name: "socialStructure", label: "Social Structure", type: "text", placeholder: "How is society organized?", description: "Social organization and hierarchy" }
      ]
    },
    {
      id: "values",
      label: "Values & History",
      icon: "BookOpen",
      fields: [
        { name: "values", label: "Core Values", type: "tags", placeholder: "Add core values", description: "Fundamental values and principles" },
        { name: "customs", label: "Customs", type: "tags", placeholder: "Add customs", description: "Daily customs and social practices" },
        Fields.createHistoryField("ethnicity")
      ]
    }
  ]
};

export default ethnicityConfig;