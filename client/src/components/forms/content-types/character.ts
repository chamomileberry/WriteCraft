import { ContentTypeFormConfig } from '../types';
import { createImageField } from '@/lib/field-definitions';

export const characterConfig: ContentTypeFormConfig = {
  title: "Character Editor",
  description: "Create detailed characters for your world",
  icon: "User",
  tabs: [
    {
      id: "basic",
      label: "Basic Info", 
      icon: "User",
      fields: [
        { name: "givenName", label: "Given Name", type: "text", placeholder: "Their first name at birth", description: "The name they were given at birth" },
        { name: "familyName", label: "Family Name", type: "text", placeholder: "Last name or surname", description: "Their family name or surname" },
        { name: "middleName", label: "Middle Name", type: "text", placeholder: "Middle name(s)", description: "Any middle names they have" },
        { name: "nickname", label: "Nickname", type: "text", placeholder: "What friends call them", description: "Common nickname or what friends call them" },
        { name: "honorificTitle", label: "Honorific Title", type: "text", placeholder: "Sir, Lady, Dr., etc.", description: "Formal titles or honors they hold" },
        { name: "prefix", label: "Prefix", type: "text", placeholder: "Mr., Ms., Lord, etc.", description: "Name prefixes used in formal address" },
        { name: "suffix", label: "Suffix", type: "text", placeholder: "Jr., Sr., III, etc.", description: "Name suffixes like Jr., Sr., III" },
        { name: "maidenName", label: "Maiden Name", type: "text", placeholder: "Name before marriage", description: "Their family name before marriage (if applicable)" },
        { name: "description", label: "General Description", type: "textarea", placeholder: "A brief overview of this character...", description: "A general description that appears on the character card in your notebook" },
        { name: "age", label: "Age", type: "number", placeholder: "Character's age...", description: "How old is this character?" },
        { name: "occupation", label: "Occupation", type: "autocomplete-profession", endpoint: "/api/professions", labelField: "name", valueField: "name", multiple: false, placeholder: "Search or select a profession...", description: "Their primary profession or role in society" },
        { name: "species", label: "Species", type: "autocomplete-species", multiple: false, placeholder: "Search or select a species...", description: "What species or race is this character?" },
        { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Non-Binary", "Agender", "Bigender", "Genderfluid", "Genderqueer", "Transgender", "Intersex", "Pangender", "Demigender", "Androgynous", "Omnigender", "Polygender"], placeholder: "Select gender identity", description: "Their gender identity and expression" },
        { name: "pronouns", label: "Pronouns", type: "select", options: ["they/them", "she/her", "he/him", "xe/xem", "ze/zir", "ey/em", "ve/ver", "fae/faer", "it/its", "she/they", "he/they", "any pronouns", "ask for pronouns"], placeholder: "Select pronouns", description: "Preferred pronouns for this character", customizable: true }
      ]
    },
    {
      id: "physical",
      label: "Physical Appearance",
      icon: "Eye", 
      fields: [
        createImageField("character"),
        { name: "physicalDescription", label: "Overall Physical Description", type: "textarea", placeholder: "Describe their general physical appearance...", description: "A comprehensive description of how they look" },
        { name: "height", label: "Height", type: "text", placeholder: "5'8\", tall, average, etc.", description: "How tall are they?" },
        { name: "heightDetail", label: "Height Details", type: "text", placeholder: "Specific height measurements", description: "More specific height information" },
        { name: "weight", label: "Weight", type: "text", placeholder: "Build and weight description", description: "Their weight and body mass" },
        { name: "build", label: "Build", type: "text", placeholder: "Muscular, slim, stocky, etc.", description: "Their overall body build and physique" },
        { name: "physicalCondition", label: "Physical Condition", type: "text", placeholder: "Fitness level, health status", description: "Their overall physical fitness and health" },
        { name: "sex", label: "Biological Sex", type: "text", placeholder: "Assigned sex at birth", description: "Their biological sex assigned at birth" },
        { name: "physicalPresentation", label: "Physical Presentation", type: "text", placeholder: "How they present physically", description: "How they present their gender physically" }
      ]
    },
    {
      id: "facial",
      label: "Facial Features",
      icon: "Smile",
      fields: [
        { name: "facialFeatures", label: "General Facial Features", type: "text", placeholder: "Sharp jawline, round face, etc.", description: "Overall facial structure and features" },
        { name: "facialDetails", label: "Detailed Facial Features", type: "textarea", placeholder: "Detailed description of facial characteristics", description: "Specific details about their facial features" },
        { name: "eyeColor", label: "Eye Color", type: "text", placeholder: "Blue, brown, green, etc.", description: "The color of their eyes" },
        { name: "hairColor", label: "Hair Color", type: "text", placeholder: "Brown, blonde, black, etc.", description: "Their natural or current hair color" },
        { name: "hairTexture", label: "Hair Texture", type: "text", placeholder: "Straight, curly, wavy, etc.", description: "The texture and type of their hair" },
        { name: "hairStyle", label: "Hair Style", type: "text", placeholder: "Long, short, braided, etc.", description: "How they style their hair" },
        { name: "skinTone", label: "Skin Tone", type: "text", placeholder: "Pale, olive, dark, etc.", description: "Their skin color and tone" },
        { name: "strikingFeatures", label: "Most Striking Features", type: "text", placeholder: "What stands out most about them", description: "The most noticeable aspects of their appearance" }
      ]
    },
    {
      id: "marks",
      label: "Marks & Features",
      icon: "Zap",
      fields: [
        { name: "identifyingMarks", label: "Identifying Marks", type: "text", placeholder: "Scars, birthmarks, tattoos, etc.", description: "Permanent marks that identify them" },
        { name: "marksPiercingsTattoos", label: "Marks, Piercings & Tattoos", type: "textarea", placeholder: "Detailed description of body modifications", description: "All body modifications, tattoos, piercings, and distinctive marks" },
        { name: "distinctiveBodyFeatures", label: "Distinctive Body Features", type: "text", placeholder: "Unique physical characteristics", description: "Unique aspects of their physical form" },
        { name: "distinctPhysicalFeatures", label: "Other Distinct Features", type: "textarea", placeholder: "Any other notable physical traits", description: "Additional distinctive physical characteristics" },
        { name: "conditions", label: "Physical Conditions", type: "text", placeholder: "Disabilities, chronic conditions", description: "Any physical conditions or disabilities" }
      ]
    },
    {
      id: "personality",
      label: "Personality & Psychology",
      icon: "Heart",
      fields: [
        { name: "personality", label: "Core Personality Traits", type: "tags", placeholder: "brave, curious, stubborn...", description: "Key personality traits that define them" },
        { name: "backstory", label: "Backstory", type: "textarea", placeholder: "Character's history and background...", description: "What shaped this character into who they are today?" },
        { name: "motivation", label: "Core Motivation", type: "textarea", placeholder: "What drives this character...", description: "What are their primary goals and desires?" },
        { name: "flaw", label: "Fatal Flaw", type: "textarea", placeholder: "Character's greatest weakness...", description: "What major flaw could lead to their downfall?" },
        { name: "strength", label: "Greatest Strength", type: "textarea", placeholder: "Character's greatest asset...", description: "What is their most powerful attribute or ability?" },
        { name: "intellectualTraits", label: "Intellectual Traits", type: "textarea", placeholder: "How they think and process information", description: "Their intellectual abilities and thinking patterns" },
        { name: "mentalHealth", label: "Mental Health", type: "textarea", placeholder: "Psychological state and wellbeing", description: "Their mental health status and psychological traits" },
        { name: "valuesEthicsMorals", label: "Values, Ethics & Morals", type: "textarea", placeholder: "What they believe is right and wrong", description: "Their moral compass and ethical beliefs" },
        { name: "frownedUponViews", label: "Controversial Views", type: "textarea", placeholder: "Beliefs others might disapprove of", description: "Views they hold that others might find objectionable" },
        { name: "secretBeliefs", label: "Secret Beliefs", type: "textarea", placeholder: "Beliefs they keep hidden", description: "Private beliefs they don't share publicly" }
      ]
    },
    {
      id: "flaws",
      label: "Flaws & Vices",
      icon: "AlertTriangle",
      fields: [
        { name: "characterFlaws", label: "Character Flaws", type: "textarea", placeholder: "Major personality flaws", description: "Significant character flaws and weaknesses" },
        { name: "addictions", label: "Addictions", type: "text", placeholder: "Substances or behaviors they're addicted to", description: "Any addictions they struggle with" },
        { name: "vices", label: "Vices", type: "text", placeholder: "Bad habits and moral failings", description: "Their vices and bad habits" },
        { name: "defects", label: "Character Defects", type: "textarea", placeholder: "Fundamental character defects", description: "Deep-seated character defects" },
        { name: "negativeEvents", label: "Traumatic Events", type: "textarea", placeholder: "Negative experiences that shaped them", description: "Traumatic or negative events in their past" },
        { name: "likes", label: "Likes & Preferences", type: "text", placeholder: "Things they enjoy", description: "What they like and prefer" },
        { name: "dislikes", label: "Dislikes & Pet Peeves", type: "text", placeholder: "Things they hate or avoid", description: "What they dislike or find annoying" }
      ]
    },
    {
      id: "skills",
      label: "Skills & Abilities",
      icon: "Star",
      fields: [
        { name: "mainSkills", label: "Primary Skills", type: "text", placeholder: "Their main areas of expertise", description: "The skills they're most proficient in" },
        { name: "strengths", label: "Strengths", type: "textarea", placeholder: "What they excel at", description: "Areas where they particularly excel" },
        { name: "positiveAspects", label: "Positive Aspects", type: "textarea", placeholder: "Their positive qualities", description: "Positive traits and aspects of their character" },
        { name: "proficiencies", label: "Proficiencies", type: "text", placeholder: "Areas of competence", description: "Skills and areas they're competent in" },
        { name: "lackingSkills", label: "Lacking Skills", type: "text", placeholder: "Areas they struggle with", description: "Skills they lack or are poor at" },
        { name: "lackingKnowledge", label: "Knowledge Gaps", type: "text", placeholder: "What they don't know", description: "Areas where they lack knowledge or understanding" },
        { name: "languages", label: "Languages", type: "tags", placeholder: "Common, Elvish, Draconic...", description: "Languages they speak" },
        { name: "languageFluencyAccent", label: "Language Details", type: "textarea", placeholder: "Fluency levels, accents, dialects", description: "Details about their language abilities and accents" }
      ]
    },
    {
      id: "supernatural",
      label: "Supernatural & Special",
      icon: "Sparkles",
      fields: [
        { name: "supernaturalPowers", label: "Supernatural Powers", type: "textarea", placeholder: "Magical or supernatural abilities", description: "Any supernatural powers they possess" },
        { name: "specialAbilities", label: "Special Abilities", type: "textarea", placeholder: "Unique talents or abilities", description: "Special abilities that set them apart" },
        { name: "mutations", label: "Mutations", type: "text", placeholder: "Physical or genetic mutations", description: "Any mutations or alterations to their biology" }
      ]
    },
    {
      id: "equipment",
      label: "Equipment & Attire",
      icon: "Package",
      fields: [
        { name: "typicalAttire", label: "Typical Attire", type: "textarea", placeholder: "How they usually dress", description: "Their typical clothing and style choices" },
        { name: "accessories", label: "Accessories", type: "text", placeholder: "Jewelry, watches, etc.", description: "Accessories they commonly wear" },
        { name: "keyEquipment", label: "Key Equipment", type: "text", placeholder: "Important tools or weapons", description: "Essential equipment they carry" },
        { name: "specializedItems", label: "Specialized Items", type: "text", placeholder: "Unique or magical items", description: "Special or unique items in their possession" }
      ]
    },
    {
      id: "background",
      label: "Life & Background",
      icon: "MapPin",
      fields: [
        { name: "currentLocation", label: "Current Location", type: "autocomplete-location", placeholder: "Search or create location...", description: "Their current place of residence", multiple: false },
        { name: "currentResidence", label: "Current Residence", type: "text", placeholder: "Details about their home", description: "Specifics about where they live" },
        { name: "dateOfBirth", label: "Date of Birth", type: "text", placeholder: "When they were born", description: "Their birth date" },
        { name: "placeOfBirth", label: "Place of Birth", type: "autocomplete-location", placeholder: "Search or create birthplace...", description: "Their birthplace", multiple: false },
        { name: "dateOfDeath", label: "Date of Death", type: "text", placeholder: "When they died (if applicable)", description: "Date of death (for deceased characters)" },
        { name: "placeOfDeath", label: "Place of Death", type: "autocomplete-location", placeholder: "Search or create location...", description: "Place of death (for deceased characters)" },
        { name: "upbringing", label: "Upbringing", type: "textarea", placeholder: "How they were raised", description: "Details about their childhood and upbringing" },
        { name: "family", label: "Family Members", type: "autocomplete-character", placeholder: "Search or create family members...", description: "Family members and relationships", multiple: true },
        { name: "education", label: "Education", type: "textarea", placeholder: "Formal education, training, apprenticeships...", description: "Their educational background and training" },
        { name: "workHistory", label: "Work History", type: "textarea", placeholder: "Previous jobs, career progression...", description: "Their employment and career history" },
        { name: "accomplishments", label: "Accomplishments", type: "textarea", placeholder: "Notable achievements, awards, victories...", description: "Their major achievements and successes" },
        { name: "religiousBelief", label: "Religious Beliefs", type: "autocomplete-religion", placeholder: "Search or create religion...", description: "Their religious or spiritual beliefs", multiple: false },
        { name: "affiliatedOrganizations", label: "Organizations", type: "autocomplete-organization", placeholder: "Search or create organizations...", description: "Organizations they're affiliated with" },
        { name: "genderUnderstanding", label: "Gender Understanding", type: "textarea", placeholder: "How they understand and express gender", description: "Their understanding and relationship with gender" },
        { name: "sexualOrientation", label: "Sexual Orientation", type: "text", placeholder: "Their romantic and sexual preferences", description: "Their sexual and romantic orientation" },
        { name: "ethnicity", label: "Ethnicity", type: "text", placeholder: "Cultural and ethnic background", description: "Their ethnic and cultural heritage" },
        { name: "genre", label: "Genre/Setting", type: "select", options: ["Fantasy", "Science Fiction", "Literary Fiction", "Mystery", "Romance", "Thriller", "Horror", "Historical Fiction", "Contemporary Fiction", "Crime", "Adventure", "Western", "Dystopian", "Post-Apocalyptic", "Steampunk", "Cyberpunk", "Space Opera", "Urban Fantasy", "Paranormal Romance", "Cozy Mystery", "Hard Boiled", "Young Adult", "Children's", "Comedy", "Satire", "Drama", "Political Fiction", "Magical Realism", "Gothic", "Noir", "Superhero", "Military", "Espionage", "Techno-Thriller", "Medical Thriller", "Legal Thriller", "Psychological Thriller", "Biographical Fiction", "Alternate History", "Time Travel", "Fairy Tale Retelling", "Mythology", "Folklore", "Other"], placeholder: "Select genre (optional)", description: "The genre or setting type this character fits into - helps with AI generation and thematic consistency" }
      ]
    },
    {
      id: "legacy",
      label: "Legacy & Influence",
      icon: "Award",
      fields: [
        { name: "worldInfluence", label: "World Influence", type: "textarea", placeholder: "How they've impacted the world", description: "Their influence on the world around them" },
        { name: "legacy", label: "Legacy", type: "textarea", placeholder: "What they'll be remembered for", description: "The legacy they leave behind" },
        { name: "rememberedBy", label: "Remembered By", type: "autocomplete-character", placeholder: "Search or create characters who remember them...", description: "Characters who remember this person", multiple: true }
      ]
    }
  ]
};

export default characterConfig;