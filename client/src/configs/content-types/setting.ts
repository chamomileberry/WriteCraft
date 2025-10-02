import { ContentTypeFormConfig } from '../../components/forms/types';
import { SETTING_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const settingConfig: ContentTypeFormConfig = {
  title: "Setting Creator",
  description: "Create detailed settings for your world",
  icon: "Mountain",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Mountain",
      fields: [
        Fields.createImageField("setting"),
        Fields.createNameField("setting"),
        { name: "location", label: "Location", type: "text", placeholder: "Where is it located?", description: "Geographic location and positioning" },
        { name: "timePeriod", label: "Time Period", type: "text", placeholder: "When does it exist?", description: "Historical time period or era" },
        Fields.createTypeField("setting", SETTING_TYPES),
        Fields.createGenreField()
      ]
    },
    {
      id: "environment",
      label: "Environment & Atmosphere",
      icon: "Cloud",
      fields: [
        Fields.createDescriptionField("setting"),
        { name: "atmosphere", label: "Atmosphere", type: "text", placeholder: "What's the atmosphere like?", description: "Mood and atmospheric qualities" },
        Fields.createClimateField(),
        { name: "population", label: "Population", type: "text", placeholder: "Who lives here?", description: "Population size and demographics" }
      ]
    },
    {
      id: "features",
      label: "Features & Culture",
      icon: "Star",
      fields: [
        { name: "culturalElements", label: "Cultural Elements", type: "tags", placeholder: "Add cultural elements", description: "Cultural aspects and influences" },
        { name: "notableFeatures", label: "Notable Features", type: "tags", placeholder: "Add notable features", description: "Distinctive landmarks and features" }
      ]
    }
  ]
};

export default settingConfig;