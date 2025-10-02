import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const plantConfig: ContentTypeFormConfig = {
  title: "Plant Creator",
  description: "Create detailed plants for your world",
  icon: "Flower",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Flower",
      fields: [
        Fields.createImageField("plant"),
        Fields.createNameField("plant"),
        { name: "scientificName", label: "Scientific Name", type: "text", placeholder: "Scientific classification", description: "Scientific or botanical name" },
        { name: "type", label: "Plant Type", type: "select", options: ["Tree", "Shrub", "Herb", "Flower", "Grass", "Vine", "Moss", "Fern", "Mushroom", "Algae", "Other"], description: "What type of plant is this?" },
        Fields.createDescriptionField("plant"),
        Fields.createGenreField()
      ]
    },
    {
      id: "growing",
      label: "Growing & Habitat",
      icon: "MapPin",
      fields: [
        Fields.createHabitatField(),
        { name: "careInstructions", label: "Care Instructions", type: "text", placeholder: "How to care for it", description: "Growing and care requirements" },
        { name: "bloomingSeason", label: "Blooming Season", type: "text", placeholder: "When does it bloom?", description: "Flowering or fruiting season" },
        { name: "hardinessZone", label: "Hardiness Zone", type: "text", placeholder: "Climate requirements", description: "Climate tolerance and hardiness" }
      ]
    },
    {
      id: "characteristics",
      label: "Characteristics",
      icon: "Leaf",
      fields: [
        { name: "characteristics", label: "Characteristics", type: "tags", placeholder: "Add characteristics", description: "Notable physical and biological traits" }
      ]
    }
  ]
};

export default plantConfig;