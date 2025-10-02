import { ContentTypeFormConfig } from '../../components/forms/types';
import { MATERIAL_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const materialConfig: ContentTypeFormConfig = {
  title: "Material Creator",
  description: "Create detailed materials for your world",
  icon: "Package",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Package",
      fields: [
        Fields.createImageField("material"),
        Fields.createNameField("material"),
        Fields.createTypeField("material", MATERIAL_TYPES),
        Fields.createDescriptionField("material"),
        { name: "appearance", label: "Appearance", type: "text", placeholder: "What does it look like?", description: "Visual appearance and characteristics" },
        Fields.createGenreField()
      ]
    },
    {
      id: "properties",
      label: "Properties & Processing",
      icon: "Settings",
      fields: [
        { name: "properties", label: "Properties", type: "tags", placeholder: "Add material properties", description: "Physical and chemical properties" },
        { name: "durability", label: "Durability", type: "text", placeholder: "How durable is it?", description: "Strength and resistance to wear" },
        Fields.createWeightField(),
        { name: "processing", label: "Processing", type: "text", placeholder: "How is it processed?", description: "Methods to refine or work with the material" },
        { name: "source", label: "Source", type: "text", placeholder: "Where does it come from?", description: "Natural or manufactured source" }
      ]
    },
    {
      id: "economics",
      label: "Economics & Uses",
      icon: "Coins",
      fields: [
        { name: "uses", label: "Uses", type: "tags", placeholder: "Add material uses", description: "Common applications and purposes" },
        Fields.createValueField(),
        Fields.createRarityField()
      ]
    }
  ]
};

export default materialConfig;