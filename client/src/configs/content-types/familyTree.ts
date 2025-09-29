import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const familyTreeConfig: ContentTypeFormConfig = {
  title: "Family Tree Creator",
  description: "Map family lineages and relationships",
  icon: "Users",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Users",
      fields: [
        Fields.createNameField("family tree"),
        { name: "treeType", label: "Tree Type", type: "select", options: ["Lineage", "Ancestral", "Descendant", "Genealogical", "Royal", "Noble", "Other"], description: "What type of family tree is this?" },
        { name: "rootPerson", label: "Root Person", type: "autocomplete-character", placeholder: "Search or create root family member...", description: "The central person of this family tree", multiple: false },
        Fields.createDescriptionField("family tree"),
        Fields.createGenreField()
      ]
    },
    {
      id: "members",
      label: "Family Members",
      icon: "User",
      fields: [
        { name: "keyMembers", label: "Key Family Members", type: "autocomplete-character", placeholder: "Search or create family members...", description: "Important members of this family", multiple: true },
        { name: "generations", label: "Generations", type: "number", placeholder: "Number of generations", description: "How many generations does this tree span?" },
        { name: "livingMembers", label: "Living Members", type: "text", placeholder: "Number of living members", description: "How many family members are still alive?" },
        { name: "notableAncestors", label: "Notable Ancestors", type: "autocomplete-character", placeholder: "Search or create notable ancestors...", description: "Important historical family members", multiple: true }
      ]
    },
    {
      id: "heritage",
      label: "Heritage & Legacy",
      icon: "Crown",
      fields: [
        { name: "ancestralHome", label: "Ancestral Home", type: "autocomplete-location", placeholder: "Search or create ancestral location...", description: "The family's place of origin", multiple: false },
        { name: "familyTraditions", label: "Family Traditions", type: "autocomplete-tradition", placeholder: "Search or create family traditions...", description: "Important family customs and practices" },
        { name: "inheritance", label: "Inheritance", type: "textarea", placeholder: "Family inheritance and heirlooms...", description: "What passes down through generations" },
        { name: "familySecrets", label: "Family Secrets", type: "textarea", placeholder: "Hidden family secrets...", description: "Dark secrets or hidden information" }
      ]
    }
  ]
};

export default familyTreeConfig;