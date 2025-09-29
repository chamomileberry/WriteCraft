import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const naturalLawConfig: ContentTypeFormConfig = {
  title: "Natural Law Creator",
  description: "Create detailed natural laws for your world",
  icon: "Atom",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Atom",
      fields: [
        Fields.createNameField("law"),
        { name: "lawType", label: "Law Type", type: "select", options: ["Physical", "Magical", "Divine", "Quantum", "Biological", "Chemical", "Mathematical", "Metaphysical", "Other"], description: "What type of natural law is this?" },
        Fields.createDescriptionField("law"),
        { name: "scope", label: "Scope", type: "text", placeholder: "What does it affect?", description: "Range and scope of the law's influence" },
        Fields.createGenreField()
      ]
    },
    {
      id: "mechanics",
      label: "Mechanics & Principles",
      icon: "Cog",
      fields: [
        { name: "principles", label: "Principles", type: "textarea", placeholder: "Underlying principles...", description: "Core principles and mechanics" },
        { name: "exceptions", label: "Exceptions", type: "tags", placeholder: "Add exceptions", description: "Known exceptions to the law" },
        { name: "applications", label: "Applications", type: "tags", placeholder: "Add applications", description: "Practical applications and uses" },
        { name: "relatedLaws", label: "Related Laws", type: "tags", placeholder: "Add related laws", description: "Other laws that interact with this one" }
      ]
    },
    {
      id: "discovery",
      label: "Discovery & Understanding",
      icon: "Search",
      fields: [
        { name: "discovery", label: "Discovery", type: "text", placeholder: "How was it discovered?", description: "History of discovery or understanding" },
        { name: "understanding", label: "Understanding", type: "text", placeholder: "Current understanding level", description: "How well is it understood?" },
        { name: "evidence", label: "Evidence", type: "text", placeholder: "Supporting evidence", description: "Evidence that supports this law" },
        { name: "controversies", label: "Controversies", type: "text", placeholder: "Debates and controversies", description: "Scientific or philosophical controversies" },
        { name: "implications", label: "Implications", type: "text", placeholder: "What are the implications?", description: "Broader implications and consequences" }
      ]
    }
  ]
};

export default naturalLawConfig;