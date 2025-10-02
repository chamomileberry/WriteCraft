import { ContentTypeFormConfig } from '../../components/forms/types';
import { PROFESSION_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const professionConfig: ContentTypeFormConfig = {
  title: "Profession Editor",
  description: "Create and manage professions for your world",
  icon: "User",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "User",
      fields: [
        Fields.createImageField("profession"),
        Fields.createNameField("profession"),
        Fields.createTypeField("profession", PROFESSION_TYPES),
        Fields.createDescriptionField("profession"),
        { name: "socialStatus", label: "Social Status", type: "select", options: ["Low", "Middle", "High", "Nobility"], description: "Social standing of this profession" },
        Fields.createGenreField()
      ]
    },
    {
      id: "requirements",
      label: "Requirements & Skills",
      icon: "Star",
      fields: [
        { name: "skillsRequired", label: "Skills Required", type: "tags", placeholder: "Add required skills", description: "Skills and abilities needed for this profession" },
        { name: "trainingRequired", label: "Training Required", type: "text", placeholder: "What training is needed?", description: "Education or training required" },
        { name: "apprenticeship", label: "Apprenticeship", type: "text", placeholder: "Apprenticeship details", description: "Information about apprenticeship requirements" },
        { name: "physicalDemands", label: "Physical Demands", type: "select", options: ["Low", "Moderate", "High", "Extreme"], description: "Physical requirements of the job" },
        { name: "mentalDemands", label: "Mental Demands", type: "select", options: ["Low", "Moderate", "High", "Extreme"], description: "Mental and intellectual requirements" }
      ]
    },
    {
      id: "work",
      label: "Work Environment",
      icon: "Settings",
      fields: [
        { name: "responsibilities", label: "Responsibilities", type: "textarea", placeholder: "What do they do?", description: "Main duties and responsibilities" },
        { name: "workEnvironment", label: "Work Environment", type: "text", placeholder: "Where do they work?", description: "Typical work locations and conditions" },
        { name: "commonTools", label: "Common Tools", type: "tags", placeholder: "Add tools used", description: "Tools and equipment commonly used" },
        { name: "riskLevel", label: "Risk Level", type: "select", options: ["Low", "Moderate", "High", "Extreme"], description: "Danger level of this profession" },
        { name: "seasonalWork", label: "Seasonal Work", type: "checkbox", description: "Is this profession seasonal or year-round?" }
      ]
    },
    {
      id: "career",
      label: "Career & Society",
      icon: "TrendingUp",
      fields: [
        { name: "averageIncome", label: "Average Income", type: "text", placeholder: "Income level", description: "Typical earnings for this profession" },
        { name: "careerProgression", label: "Career Progression", type: "text", placeholder: "How do they advance?", description: "Career advancement opportunities" },
        { name: "relatedProfessions", label: "Related Professions", type: "tags", placeholder: "Add related professions", description: "Similar or connected professions" },
        { name: "guildsOrganizations", label: "Guilds & Organizations", type: "tags", placeholder: "Add associated groups", description: "Professional guilds or organizations" },
        { name: "historicalContext", label: "Historical Context", type: "text", placeholder: "Historical background", description: "How this profession developed historically" },
        Fields.createCulturalSignificanceField()
      ]
    }
  ]
};

export default professionConfig;