import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const spellConfig: ContentTypeFormConfig = {
  title: "Spell Creator",
  description: "Create detailed spells for your world",
  icon: "Sparkles",
  tabs: [
    {
      id: "basic",
      label: "Basic Info",
      icon: "Sparkles",
      fields: [
        Fields.createImageField("spell"),
        Fields.createNameField("spell"),
        { name: "school", label: "School of Magic", type: "select", options: ["Evocation", "Divination", "Enchantment", "Illusion", "Necromancy", "Transmutation", "Conjuration", "Abjuration", "Elemental", "Other"], description: "Which school of magic does this belong to?" },
        { name: "level", label: "Spell Level", type: "select", options: ["Cantrip", "1st Level", "2nd Level", "3rd Level", "4th Level", "5th Level", "6th Level", "7th Level", "8th Level", "9th Level", "Epic"], description: "Power level of the spell" },
        Fields.createDescriptionField("spell"),
        Fields.createGenreField()
      ]
    },
    {
      id: "mechanics",
      label: "Mechanics & Casting",
      icon: "Wand",
      fields: [
        { name: "components", label: "Components", type: "tags", placeholder: "Add spell components", description: "Verbal, somatic, or material components needed" },
        { name: "castingTime", label: "Casting Time", type: "text", placeholder: "How long to cast?", description: "Time required to cast the spell" },
        { name: "range", label: "Range", type: "text", placeholder: "Spell's range", description: "Distance the spell can reach" },
        Fields.createDurationField(),
        Fields.createEffectField()
      ]
    },
    {
      id: "lore",
      label: "Lore & Variations",
      icon: "BookOpen",
      fields: [
        Fields.createOriginField(),
        { name: "variations", label: "Variations", type: "tags", placeholder: "Add spell variations", description: "Different versions or modifications of the spell" },
        { name: "limitations", label: "Limitations", type: "text", placeholder: "What are the limits?", description: "Constraints and limitations on the spell" },
        { name: "risks", label: "Risks", type: "text", placeholder: "Dangers of casting", description: "Potential risks or backlash from casting" },
        Fields.createRarityField()
      ]
    }
  ]
};

export default spellConfig;