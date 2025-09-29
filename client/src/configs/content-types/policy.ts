import { ContentTypeFormConfig } from '../../components/forms/types';
import { POLICY_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const policyConfig: ContentTypeFormConfig = {
  title: "Policy Creator",
  description: "Design governance and administrative policies",
  icon: "FileText",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "FileText",
      fields: [
        Fields.createNameField("policy"),
        Fields.createTypeField("policy", POLICY_TYPES),
        { name: "organization", label: "Governing Organization", type: "autocomplete-organization", placeholder: "Search or create organization...", description: "The organization that implements this policy", multiple: false },
        Fields.createDescriptionField("policy"),
        Fields.createGenreField()
      ]
    },
    {
      id: "implementation",
      label: "Implementation",
      icon: "Target",
      fields: [
        { name: "objectives", label: "Objectives", type: "textarea", placeholder: "What does this policy aim to achieve?", description: "The main goals and objectives" },
        { name: "guidelines", label: "Guidelines", type: "textarea", placeholder: "How should this policy be implemented?", description: "Specific implementation guidelines" },
        { name: "scope", label: "Scope", type: "text", placeholder: "Who does this policy affect?", description: "The range of people or areas affected" },
        { name: "budget", label: "Budget", type: "text", placeholder: "Cost and funding", description: "Financial resources allocated" }
      ]
    },
    {
      id: "governance",
      label: "Governance & Impact",
      icon: "Crown",
      fields: [
        { name: "authority", label: "Authority", type: "autocomplete-character", placeholder: "Search or create responsible official...", description: "Who has authority over this policy?", multiple: false },
        { name: "dateImplemented", label: "Date Implemented", type: "text", placeholder: "When was this policy implemented?", description: "When this policy went into effect" },
        { name: "review", label: "Review Process", type: "text", placeholder: "How is this policy reviewed?", description: "Regular review and update procedures" },
        { name: "publicOpinion", label: "Public Opinion", type: "textarea", placeholder: "How do people view this policy?", description: "Public reception and criticism" },
        { name: "effectiveness", label: "Effectiveness", type: "text", placeholder: "How effective is this policy?", description: "Measured success and outcomes" }
      ]
    }
  ]
};

export default policyConfig;