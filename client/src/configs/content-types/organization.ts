import { ContentTypeFormConfig } from '../../components/forms/types';
import { ORGANIZATION_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const organizationConfig: ContentTypeFormConfig = {
  title: "Organization Creator",
  description: "Create detailed organizations for your world",
  icon: "Users",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Users",
      fields: [
        Fields.createNameField("organization"),
        Fields.createTypeField("organization", ORGANIZATION_TYPES),
        Fields.createPurposeField(),
        Fields.createDescriptionField("organization")
      ]
    },
    {
      id: "structure",
      label: "Structure & Leadership",
      icon: "Crown",
      fields: [
        { name: "structure", label: "Structure", type: "textarea", placeholder: "How is it organized?", description: "Organizational structure and hierarchy" },
        { name: "leadership", label: "Leadership", type: "text", placeholder: "Who leads this organization?", description: "Leadership structure and key figures" },
        { name: "members", label: "Members", type: "text", placeholder: "Who are the members?", description: "Membership composition and requirements" },
        { name: "headquarters", label: "Headquarters", type: "text", placeholder: "Where are they based?", description: "Main headquarters or base of operations" }
      ]
    },
    {
      id: "influence",
      label: "Influence & Relations",
      icon: "Globe",
      fields: [
        { name: "influence", label: "Influence", type: "text", placeholder: "How much influence do they have?", description: "Scope and level of influence" },
        { name: "resources", label: "Resources", type: "text", placeholder: "What resources do they control?", description: "Financial, material, and other resources" },
        { name: "goals", label: "Goals", type: "text", placeholder: "What are their goals?", description: "Short-term and long-term objectives" },
        Fields.createHistoryField("organization"),
        { name: "allies", label: "Allies", type: "tags", placeholder: "Add allied organizations", description: "Allied organizations and positive relationships" },
        { name: "enemies", label: "Enemies", type: "tags", placeholder: "Add enemy organizations", description: "Enemy organizations and conflicts" }
      ]
    }
  ]
};

export default organizationConfig;