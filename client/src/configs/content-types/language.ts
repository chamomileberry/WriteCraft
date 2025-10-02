import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const languageConfig: ContentTypeFormConfig = {
  title: "Language Creator",
  description: "Create detailed languages for your world",
  icon: "Globe",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Globe",
      fields: [
        Fields.createImageField("language"),
        Fields.createNameField("language"),
        { name: "family", label: "Language Family", type: "text", placeholder: "Germanic, Romance, Constructed, etc.", description: "What family does this language belong to?" },
        { name: "speakers", label: "Speakers", type: "text", placeholder: "Who speaks this language?", description: "Description of the people or groups who speak this language" },
        { name: "regions", label: "Regions", type: "tags", placeholder: "Add regions where it's spoken", description: "Geographic regions where this language is used" },
        { name: "status", label: "Status", type: "select", options: ["Living", "Dead", "Constructed", "Evolving", "Extinct", "Revived"], description: "Current status of the language" },
        { name: "difficulty", label: "Learning Difficulty", type: "select", options: ["Very Easy", "Easy", "Moderate", "Hard", "Very Hard"], description: "How difficult is this language to learn?" },
        Fields.createGenreField()
      ]
    },
    {
      id: "structure",
      label: "Language Structure",
      icon: "BookOpen",
      fields: [
        { name: "phonology", label: "Phonology", type: "textarea", placeholder: "Describe the sounds and pronunciation...", description: "Sound system, pronunciation rules, and phonetic characteristics" },
        { name: "grammar", label: "Grammar", type: "textarea", placeholder: "Describe grammatical rules...", description: "Grammar rules, sentence structure, and linguistic patterns" },
        { name: "vocabulary", label: "Vocabulary", type: "textarea", placeholder: "Common words and meanings...", description: "Key vocabulary, word formation patterns, and semantic features" },
        { name: "writingSystem", label: "Writing System", type: "text", placeholder: "Alphabet, logographic, syllabic, etc.", description: "How is this language written down?" }
      ]
    },
    {
      id: "culture",
      label: "Cultural Context",
      icon: "Users",
      fields: [
        { name: "commonPhrases", label: "Common Phrases", type: "tags", placeholder: "Add common phrases and expressions", description: "Frequently used phrases and their meanings" },
        { name: "culturalContext", label: "Cultural Context", type: "textarea", placeholder: "How does culture influence this language?", description: "Cultural significance and how society shapes language use" },
        Fields.createHistoryField("language"),
        { name: "variations", label: "Dialects & Variations", type: "tags", placeholder: "Add regional dialects or variations", description: "Different dialects, accents, or regional variations" }
      ]
    }
  ]
};

export default languageConfig;