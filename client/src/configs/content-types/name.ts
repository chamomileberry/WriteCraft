import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const nameConfig: ContentTypeFormConfig = {
  title: "Name Creator",
  description: "Create detailed names for your world",
  icon: "Type",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Type",
      fields: [
        Fields.createImageField("name"),
        Fields.createNameField("name"),
        { name: "nameType", label: "Name Type", type: "select", options: ["Character", "Place", "Fantasy", "Historical", "Family", "Title", "Organization", "Item", "Other"], description: "What type of name is this?" },
        { name: "culture", label: "Culture", type: "text", placeholder: "Cultural origin", description: "Cultural or ethnic origin" },
        { name: "meaning", label: "Meaning", type: "text", placeholder: "What does it mean?", description: "Meaning and significance of the name" },
        Fields.createOriginField()
      ]
    }
  ]
};

export default nameConfig;