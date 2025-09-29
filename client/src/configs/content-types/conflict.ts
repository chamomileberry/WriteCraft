import { ContentTypeFormConfig } from '../../components/forms/types';
import { CONFLICT_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const conflictConfig: ContentTypeFormConfig = {
  title: "Conflict Creator",
  description: "Create detailed conflicts for your world",
  icon: "Swords",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Swords",
      fields: [
        { name: "title", label: "Conflict Title", type: "text", placeholder: "Enter conflict title...", description: "The name of this conflict" },
        Fields.createTypeField("conflict", CONFLICT_TYPES),
        Fields.createDescriptionField("conflict"),
        { name: "stakes", label: "Stakes", type: "text", placeholder: "What's at stake?", description: "What will be won or lost" },
        Fields.createGenreField()
      ]
    },
    {
      id: "resolution",
      label: "Resolution & Impact",
      icon: "Target",
      fields: [
        { name: "obstacles", label: "Obstacles", type: "tags", placeholder: "Add obstacles", description: "Challenges and barriers to resolution" },
        { name: "potentialResolutions", label: "Potential Resolutions", type: "tags", placeholder: "Add potential resolutions", description: "Possible ways to resolve the conflict" },
        { name: "emotionalImpact", label: "Emotional Impact", type: "text", placeholder: "Emotional consequences", description: "Emotional weight and impact on characters" }
      ]
    }
  ]
};

export default conflictConfig;