import { ContentTypeFormConfig } from '../../components/forms/types';
import { DANCE_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const danceConfig: ContentTypeFormConfig = {
  title: "Dance Creator",
  description: "Design choreographed performances",
  icon: "PersonStanding",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "PersonStanding",
      fields: [
        Fields.createNameField("dance"),
        Fields.createTypeField("dance", DANCE_TYPES),
        { name: "choreographer", label: "Choreographer", type: "autocomplete-character", placeholder: "Search or create choreographer...", description: "Who created this dance?", multiple: false },
        Fields.createDescriptionField("dance"),
        Fields.createGenreField()
      ]
    },
    {
      id: "choreography",
      label: "Choreography",
      icon: "Target",
      fields: [
        { name: "movements", label: "Key Movements", type: "textarea", placeholder: "Describe the main dance movements...", description: "Primary steps and gestures" },
        { name: "formation", label: "Formation", type: "text", placeholder: "Solo, pair, group, circle...", description: "How many dancers and their arrangement" },
        Fields.createDurationField(),
        { name: "difficulty", label: "Difficulty", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Master"], description: "How difficult is this dance to learn?" },
        { name: "accompaniment", label: "Musical Accompaniment", type: "autocomplete-music", placeholder: "Search or create music...", description: "Music that accompanies this dance", multiple: false }
      ]
    },
    {
      id: "cultural",
      label: "Cultural Context",
      icon: "Globe",
      fields: [
        { name: "culture", label: "Associated Culture", type: "autocomplete-culture", placeholder: "Search or create culture...", description: "The culture that practices this dance", multiple: false },
        { name: "occasions", label: "Occasions", type: "textarea", placeholder: "When is this dance performed?", description: "Specific events, festivals, or ceremonies" },
        { name: "costume", label: "Traditional Costume", type: "autocomplete-clothing", placeholder: "Search or create dance costume...", description: "Special clothing worn for this dance" },
        Fields.createSymbolismField(),
        { name: "restrictions", label: "Social Restrictions", type: "text", placeholder: "Who can perform this dance?", description: "Any social or cultural restrictions" }
      ]
    }
  ]
};

export default danceConfig;