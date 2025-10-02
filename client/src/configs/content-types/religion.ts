import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const religionConfig: ContentTypeFormConfig = {
  title: "Religion Creator",
  description: "Create detailed religions for your world",
  icon: "Church",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Church",
      fields: [
        Fields.createImageField("religion"),
        Fields.createNameField("religion"),
        Fields.createDescriptionField("religion"),
        { name: "followers", label: "Followers", type: "text", placeholder: "Who follows this religion?", description: "Description of the faithful and adherents" },
        { name: "influence", label: "Influence", type: "text", placeholder: "How influential is it?", description: "Social and political influence" },
        Fields.createGenreField()
      ]
    },
    {
      id: "beliefs",
      label: "Beliefs & Practices",
      icon: "Heart",
      fields: [
        { name: "beliefs", label: "Core Beliefs", type: "tags", placeholder: "Add core beliefs", description: "Fundamental beliefs and doctrines" },
        { name: "practices", label: "Practices", type: "tags", placeholder: "Add religious practices", description: "Regular practices and rituals" },
        { name: "deities", label: "Deities", type: "tags", placeholder: "Add deities or divine figures", description: "Gods, goddesses, or divine entities" },
        { name: "morality", label: "Morality", type: "text", placeholder: "Moral and ethical code", description: "Moral teachings and ethical guidelines" },
        { name: "afterlife", label: "Afterlife", type: "text", placeholder: "Beliefs about death and afterlife", description: "Teachings about death and what comes after" }
      ]
    },
    {
      id: "organization",
      label: "Organization & Culture",
      icon: "Users",
      fields: [
        { name: "hierarchy", label: "Hierarchy", type: "text", placeholder: "Religious organization structure", description: "Organizational structure and leadership" },
        { name: "ceremonies", label: "Ceremonies", type: "tags", placeholder: "Add ceremonies and rituals", description: "Important ceremonies and ritual practices" },
        { name: "symbols", label: "Symbols", type: "tags", placeholder: "Add religious symbols", description: "Sacred symbols and iconography" },
        { name: "scriptures", label: "Scriptures", type: "text", placeholder: "Holy texts and writings", description: "Sacred texts and religious writings" },
        Fields.createHistoryField("religion")
      ]
    }
  ]
};

export default religionConfig;