import { ContentTypeFormConfig } from '../../components/forms/types';
import { MUSIC_TYPES } from '@/lib/field-options';
import * as Fields from '@/lib/field-definitions';

export const musicConfig: ContentTypeFormConfig = {
  title: "Music Creator",
  description: "Create songs and musical compositions",
  icon: "Music",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Music",
      fields: [
        Fields.createNameField("song/composition"),
        Fields.createTypeField("music", MUSIC_TYPES),
        { name: "composer", label: "Composer", type: "autocomplete-character", placeholder: "Search or create composer...", description: "Who composed this music?", multiple: false },
        Fields.createDescriptionField("music"),
        Fields.createGenreField()
      ]
    },
    {
      id: "composition",
      label: "Composition",
      icon: "FileText",
      fields: [
        { name: "lyrics", label: "Lyrics", type: "textarea", placeholder: "Enter song lyrics...", description: "The words of the song (if applicable)" },
        { name: "melody", label: "Melody Description", type: "text", placeholder: "Describe the melody...", description: "How the music sounds" },
        { name: "instruments", label: "Instruments", type: "tags", placeholder: "Add instruments", description: "Musical instruments used" },
        { name: "key", label: "Musical Key", type: "text", placeholder: "E.g., C Major, A Minor", description: "The musical key or mode" },
        { name: "tempo", label: "Tempo", type: "text", placeholder: "Fast, slow, moderate...", description: "The speed and rhythm of the music" }
      ]
    },
    {
      id: "cultural",
      label: "Cultural Context",
      icon: "Globe",
      fields: [
        { name: "culture", label: "Associated Culture", type: "autocomplete-culture", placeholder: "Search or create culture...", description: "The culture this music comes from", multiple: false },
        Fields.createPurposeField(),
        { name: "occasions", label: "Occasions", type: "textarea", placeholder: "When is this music played?", description: "Specific events or occasions" },
        { name: "meaning", label: "Meaning", type: "textarea", placeholder: "What does this music mean?", description: "Cultural or personal significance" },
        { name: "variations", label: "Regional Variations", type: "textarea", placeholder: "Different versions...", description: "How the music varies by region or performer" }
      ]
    }
  ]
};

export default musicConfig;