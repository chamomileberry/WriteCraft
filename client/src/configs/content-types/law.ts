import { ContentTypeFormConfig } from '../../components/forms/types';
import { LAW_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const lawConfig: ContentTypeFormConfig = {
  title: "Law Creator",
  description: "Create legal codes and regulations",
  icon: "Scale",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Scale",
      fields: [
        Fields.createImageField("law"),
        Fields.createNameField("law"),
        Fields.createTypeField("law", LAW_TYPES),
        { name: "jurisdiction", label: "Jurisdiction", type: "autocomplete-location", placeholder: "Search or create location...", description: "Where does this law apply?", multiple: false },
        Fields.createDescriptionField("law"),
        Fields.createGenreField()
      ]
    },
    {
      id: "details",
      label: "Legal Details",
      icon: "FileText",
      fields: [
        { name: "text", label: "Law Text", type: "textarea", placeholder: "The actual text of the law...", description: "The formal wording of the law" },
        { name: "penalties", label: "Penalties", type: "textarea", placeholder: "Punishments for breaking this law...", description: "Consequences for violations" },
        { name: "enforcement", label: "Enforcement", type: "text", placeholder: "Who enforces this law?", description: "The authority responsible for enforcement" },
        { name: "exceptions", label: "Exceptions", type: "textarea", placeholder: "Any exceptions to this law...", description: "Special circumstances where the law doesn't apply" }
      ]
    },
    {
      id: "context",
      label: "Historical Context",
      icon: "Book",
      fields: [
        { name: "creator", label: "Creator/Author", type: "autocomplete-character", placeholder: "Search or create lawmaker...", description: "Who created or sponsored this law?", multiple: false },
        { name: "dateEnacted", label: "Date Enacted", type: "text", placeholder: "When was this law created?", description: "When this law was officially established" },
        { name: "precedent", label: "Legal Precedent", type: "textarea", placeholder: "What legal precedent does this set?", description: "How this law affects future legal decisions" },
        { name: "relatedLaws", label: "Related Laws", type: "tags", placeholder: "Add related laws", description: "Other laws that interact with this one" },
        { name: "controversy", label: "Controversy", type: "textarea", placeholder: "Any controversy around this law?", description: "Public opinion and debates" }
      ]
    }
  ]
};

export default lawConfig;