import { ContentTypeFormConfig } from '../../components/forms/types';
import { SOCIETY_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const societyConfig: ContentTypeFormConfig = {
  title: "Society Creator",
  description: "Create detailed societies for your world",
  icon: "Users",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Users",
      fields: [
        Fields.createImageField("society"),
        Fields.createNameField("society"),
        Fields.createTypeField("society", SOCIETY_TYPES),
        Fields.createDescriptionField("society"),
        { name: "structure", label: "Structure", type: "text", placeholder: "Social structure", description: "How society is organized and structured" },
        Fields.createGenreField()
      ]
    },
    {
      id: "governance",
      label: "Governance & Law",
      icon: "Scale",
      fields: [
        { name: "leadership", label: "Leadership", type: "text", placeholder: "How is it led?", description: "Leadership structure and authority" },
        { name: "laws", label: "Laws", type: "text", placeholder: "Legal system", description: "Legal system and justice" },
        { name: "values", label: "Core Values", type: "tags", placeholder: "Add core values", description: "Fundamental societal values" },
        { name: "customs", label: "Customs", type: "tags", placeholder: "Add customs", description: "Important customs and traditions" }
      ]
    },
    {
      id: "systems",
      label: "Systems & Culture",
      icon: "Cog",
      fields: [
        Fields.createEconomyField(),
        { name: "technology", label: "Technology", type: "text", placeholder: "Technological level", description: "Technological advancement and tools" },
        { name: "education", label: "Education", type: "text", placeholder: "Educational system", description: "How knowledge is shared and preserved" },
        { name: "military", label: "Military", type: "text", placeholder: "Military organization", description: "Military structure and defense" },
        { name: "religion", label: "Religion", type: "text", placeholder: "Religious practices", description: "Spiritual beliefs and practices" },
        { name: "arts", label: "Arts", type: "text", placeholder: "Artistic traditions", description: "Art, music, and cultural expressions" },
        Fields.createHistoryField("society")
      ]
    }
  ]
};

export default societyConfig;