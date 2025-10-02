import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const cultureConfig: ContentTypeFormConfig = {
  title: "Culture Creator",
  description: "Create detailed cultures for your world",
  icon: "Globe",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Globe",
      fields: [
        Fields.createImageField("culture"),
        Fields.createNameField("culture"),
        Fields.createDescriptionField("culture"),
        { name: "language", label: "Language", type: "text", placeholder: "Primary language", description: "Main language spoken by this culture" },
        { name: "governance", label: "Governance", type: "text", placeholder: "How are they governed?", description: "Political system and governance structure" },
        Fields.createGenreField()
      ]
    },
    {
      id: "society",
      label: "Society & Values",
      icon: "Heart",
      fields: [
        { name: "values", label: "Core Values", type: "tags", placeholder: "Add core values", description: "Fundamental cultural values" },
        { name: "beliefs", label: "Beliefs", type: "tags", placeholder: "Add beliefs", description: "Important beliefs and worldviews" },
        { name: "socialNorms", label: "Social Norms", type: "tags", placeholder: "Add social norms", description: "Expected behaviors and social rules" },
        { name: "family", label: "Family Structure", type: "text", placeholder: "Family organization", description: "How families are structured and function" },
        { name: "education", label: "Education", type: "text", placeholder: "Educational practices", description: "How knowledge is transmitted and learning occurs" }
      ]
    },
    {
      id: "practices",
      label: "Practices & Arts",
      icon: "Palette",
      fields: [
        { name: "traditions", label: "Traditions", type: "tags", placeholder: "Add traditions", description: "Important cultural traditions" },
        { name: "ceremonies", label: "Ceremonies", type: "tags", placeholder: "Add ceremonies", description: "Important ceremonies and rituals" },
        { name: "arts", label: "Arts", type: "text", placeholder: "Artistic traditions", description: "Art forms and creative expressions" },
        { name: "technology", label: "Technology", type: "text", placeholder: "Technological level", description: "Technological development and innovations" },
        Fields.createEconomyField()
      ]
    }
  ]
};

export default cultureConfig;