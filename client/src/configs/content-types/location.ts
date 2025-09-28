import { ContentTypeFormConfig } from '../../components/forms/types';

export const locationConfig: ContentTypeFormConfig = {
  title: "Location Creator", 
  description: "Create detailed locations for your world",
  icon: "MapPin",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "MapPin",
      fields: [
        { name: "name", label: "Location Name", type: "text", placeholder: "Enter location name...", description: "The name of this place" },
        { name: "locationType", label: "Location Type", type: "select", options: ["City", "Town", "Village", "Forest", "Mountain", "Desert", "Ocean", "River", "Cave", "Dungeon", "Castle", "Temple", "Ruins", "Other"], description: "What type of location is this?" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Describe this location...", description: "General description of the location" },
        { name: "geography", label: "Geography", type: "text", placeholder: "Geographic features...", description: "Physical geographic characteristics" },
        { name: "climate", label: "Climate", type: "text", placeholder: "Weather and climate...", description: "Climate and weather patterns" }
      ]
    },
    {
      id: "society",
      label: "Society & Culture",
      icon: "Users",
      fields: [
        { name: "population", label: "Population", type: "text", placeholder: "Who lives here?", description: "Population size and demographics" },
        { name: "government", label: "Government", type: "text", placeholder: "How is it governed?", description: "Political structure and leadership" },
        { name: "economy", label: "Economy", type: "text", placeholder: "Economic activities...", description: "Economic system and primary industries" },
        { name: "culture", label: "Culture", type: "text", placeholder: "Cultural characteristics...", description: "Cultural practices and traditions" }
      ]
    },
    {
      id: "features",
      label: "Features & History",
      icon: "BookOpen",
      fields: [
        { name: "history", label: "History", type: "textarea", placeholder: "Historical background...", description: "Historical events and background" },
        { name: "notableFeatures", label: "Notable Features", type: "tags", placeholder: "Add notable features", description: "Distinctive landmarks or characteristics" },
        { name: "landmarks", label: "Landmarks", type: "tags", placeholder: "Add landmarks", description: "Important landmarks and points of interest" },
        { name: "threats", label: "Threats", type: "tags", placeholder: "Add potential dangers", description: "Dangers or threats that exist here" },
        { name: "resources", label: "Resources", type: "tags", placeholder: "Add available resources", description: "Natural resources and materials available" }
      ]
    }
  ]
};

export default locationConfig;