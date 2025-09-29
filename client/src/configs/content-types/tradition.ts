import { ContentTypeFormConfig } from '../../components/forms/types';
import { TRADITION_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const traditionConfig: ContentTypeFormConfig = {
  title: "Tradition Creator",
  description: "Create detailed traditions for your world",
  icon: "Calendar",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Calendar",
      fields: [
        Fields.createNameField("tradition"),
        Fields.createTypeField("tradition", TRADITION_TYPES),
        Fields.createDescriptionField("tradition"),
        Fields.createOriginField(),
        Fields.createGenreField()
      ]
    },
    {
      id: "practice",
      label: "Practice & Participation",
      icon: "Users",
      fields: [
        Fields.createPurposeField(),
        { name: "participants", label: "Participants", type: "text", placeholder: "Who participates?", description: "Who takes part in this tradition" },
        { name: "procedure", label: "Procedure", type: "textarea", placeholder: "How is it performed?", description: "Step-by-step procedure and activities" },
        { name: "timing", label: "Timing", type: "text", placeholder: "When does it occur?", description: "Timing and frequency of the tradition" },
        { name: "location", label: "Location", type: "text", placeholder: "Where does it take place?", description: "Typical locations for the tradition" }
      ]
    },
    {
      id: "meaning",
      label: "Meaning & Evolution",
      icon: "Heart",
      fields: [
        Fields.createSymbolismField(),
        { name: "significance", label: "Significance", type: "text", placeholder: "Cultural significance", description: "Importance to the community or culture" },
        { name: "modernPractice", label: "Modern Practice", type: "text", placeholder: "How is it practiced today?", description: "Current state and modern adaptations" },
        { name: "variations", label: "Variations", type: "tags", placeholder: "Add variations", description: "Regional or cultural variations" },
        { name: "relatedTraditions", label: "Related Traditions", type: "tags", placeholder: "Add related traditions", description: "Connected or similar traditions" }
      ]
    }
  ]
};

export default traditionConfig;