import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const moodConfig: ContentTypeFormConfig = {
  title: "Mood Creator",
  description: "Create detailed moods for your world",
  icon: "Palette",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Palette",
      fields: [
        Fields.createNameField("mood"),
        Fields.createDescriptionField("mood"),
        { name: "emotionalTone", label: "Emotional Tone", type: "text", placeholder: "Overall emotional feeling", description: "The primary emotional atmosphere" }
      ]
    },
    {
      id: "sensory",
      label: "Sensory Details",
      icon: "Eye",
      fields: [
        { name: "sensoryDetails", label: "Sensory Details", type: "tags", placeholder: "Add sensory details", description: "Details that engage the five senses" },
        { name: "colorAssociations", label: "Color Associations", type: "tags", placeholder: "Add colors", description: "Colors that evoke this mood" },
        { name: "lightingEffects", label: "Lighting Effects", type: "tags", placeholder: "Add lighting effects", description: "Lighting that creates this mood" },
        { name: "weatherElements", label: "Weather Elements", type: "tags", placeholder: "Add weather elements", description: "Weather conditions that enhance the mood" },
        { name: "soundscape", label: "Soundscape", type: "tags", placeholder: "Add sounds", description: "Sounds and audio that create this atmosphere" }
      ]
    }
  ]
};

export default moodConfig;