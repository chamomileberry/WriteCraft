import { ContentTypeFormConfig } from '../../components/forms/types';
import { DESCRIPTION_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const descriptionConfig: ContentTypeFormConfig = {
  title: "Description Creator",
  description: "Create detailed descriptions for your world",
  icon: "FileText",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "FileText",
      fields: [
        { name: "title", label: "Description Title", type: "text", placeholder: "Enter description title...", description: "Title for this description" },
        Fields.createTypeField("description", DESCRIPTION_TYPES),
        { name: "content", label: "Content", type: "textarea", placeholder: "Write the description...", description: "The detailed descriptive content" },
        Fields.createGenreField()
      ]
    }
  ]
};

export default descriptionConfig;