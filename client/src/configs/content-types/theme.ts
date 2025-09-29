import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const themeConfig: ContentTypeFormConfig = {
  title: "Theme Creator",
  description: "Create detailed themes for your world",
  icon: "Lightbulb",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Lightbulb",
      fields: [
        { name: "title", label: "Theme Title", type: "text", placeholder: "Enter theme title...", description: "The name of this theme" },
        Fields.createDescriptionField("theme"),
        { name: "coreMessage", label: "Core Message", type: "text", placeholder: "What's the main message?", description: "Central message or idea" },
        Fields.createGenreField()
      ]
    },
    {
      id: "elements",
      label: "Elements & Examples",
      icon: "Star",
      fields: [
        { name: "symbolicElements", label: "Symbolic Elements", type: "tags", placeholder: "Add symbols", description: "Symbols and metaphors that represent the theme" },
        { name: "questions", label: "Key Questions", type: "tags", placeholder: "Add questions", description: "Questions the theme explores" },
        { name: "conflicts", label: "Related Conflicts", type: "tags", placeholder: "Add conflicts", description: "Conflicts that explore this theme" },
        { name: "examples", label: "Examples", type: "tags", placeholder: "Add examples", description: "Examples of how the theme manifests" }
      ]
    }
  ]
};

export default themeConfig;