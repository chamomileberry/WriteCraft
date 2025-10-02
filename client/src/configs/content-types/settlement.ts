import { ContentTypeFormConfig } from '../../components/forms/types';
import { SETTLEMENT_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const settlementConfig: ContentTypeFormConfig = {
  title: "Settlement Creator",
  description: "Create detailed settlements for your world",
  icon: "Home",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Home",
      fields: [
        Fields.createImageField("settlement"),
        Fields.createNameField("settlement"),
        Fields.createTypeField("settlement", SETTLEMENT_TYPES),
        Fields.createDescriptionField("settlement"),
        Fields.createPopulationField(),
        Fields.createGenreField()
      ]
    },
    {
      id: "governance",
      label: "Governance & Society",
      icon: "Crown",
      fields: [
        Fields.createGovernmentField(),
        Fields.createEconomyField(),
        Fields.createCultureField(),
        { name: "defenses", label: "Defenses", type: "text", placeholder: "How is it defended?", description: "Military defenses and fortifications" }
      ]
    },
    {
      id: "geography",
      label: "Geography & Features",
      icon: "MapPin",
      fields: [
        { name: "geography", label: "Geography", type: "text", placeholder: "Geographic features", description: "Terrain and geographic setting" },
        Fields.createClimateField(),
        Fields.createResourcesField(),
        { name: "landmarks", label: "Landmarks", type: "tags", placeholder: "Add landmarks", description: "Notable buildings and locations" },
        { name: "districts", label: "Districts", type: "tags", placeholder: "Add districts", description: "Different areas or neighborhoods" },
        { name: "threats", label: "Threats", type: "tags", placeholder: "Add threats", description: "Dangers and challenges facing the settlement" },
        Fields.createHistoryField("settlement")
      ]
    }
  ]
};

export default settlementConfig;