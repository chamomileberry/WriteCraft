import { ContentTypeFormConfig } from '../../components/forms/types';
import { MAP_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const mapConfig: ContentTypeFormConfig = {
  title: "Map Creator",
  description: "Create detailed geographical maps",
  icon: "Map",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Map",
      fields: [
        Fields.createNameField("map"),
        Fields.createTypeField("map", MAP_TYPES),
        { name: "scale", label: "Scale", type: "text", placeholder: "Map scale (e.g., 1:100,000)", description: "The scale or zoom level of this map" },
        Fields.createDescriptionField("map"),
        Fields.createGenreField()
      ]
    },
    {
      id: "geography",
      label: "Geography",
      icon: "Mountain",
      fields: [
        { name: "terrain", label: "Major Terrain", type: "tags", placeholder: "Add terrain types", description: "Mountains, forests, deserts, etc." },
        Fields.createClimateField(),
        { name: "naturalFeatures", label: "Natural Features", type: "textarea", placeholder: "Rivers, lakes, mountains...", description: "Important natural landmarks" },
        { name: "resources", label: "Natural Resources", type: "autocomplete-material", placeholder: "Search or create resources...", description: "Valuable resources found in this area" }
      ]
    },
    {
      id: "locations",
      label: "Key Locations",
      icon: "MapPin",
      fields: [
        { name: "settlements", label: "Settlements", type: "autocomplete-settlement", placeholder: "Search or create settlements...", description: "Cities, towns, and villages on this map" },
        { name: "landmarks", label: "Landmarks", type: "autocomplete-location", placeholder: "Search or create landmarks...", description: "Important places and points of interest" },
        { name: "borders", label: "Political Borders", type: "textarea", placeholder: "Describe political boundaries...", description: "Kingdoms, territories, and political divisions" },
        { name: "travelRoutes", label: "Travel Routes", type: "textarea", placeholder: "Roads, paths, shipping lanes...", description: "Major routes for travel and trade" }
      ]
    }
  ]
};

export default mapConfig;