import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { FileText, User, MapPin, Crown, Copy, Heart, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useGenerator } from "@/hooks/useGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { useToast } from "@/hooks/use-toast";
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";
import type { GeneratedName } from "@shared/schema";

// Comprehensive name type categories
const NAME_TYPE_CATEGORIES = {
  "Human & Character": [
    { value: 'human', label: 'Human Names' },
    { value: 'character', label: 'Character Names' },
    { value: 'detective', label: 'Detective Names' },
    { value: 'cowboy', label: 'Cowboy Names' },
    { value: 'knight', label: 'Knight Names' },
    { value: 'pirate', label: 'Pirate Names' },
    { value: 'ninja', label: 'Ninja Names' },
    { value: 'assassin', label: 'Assassin Names' },
    { value: 'samurai', label: 'Samurai Names' },
    { value: 'warrior', label: 'Warrior Names' },
    { value: 'bounty_hunter', label: 'Bounty Hunter Names' },
    { value: 'bandit', label: 'Bandit Names' },
    { value: 'barbarian', label: 'Barbarian Names' },
    { value: 'caveman', label: 'Cavemen Names' },
    { value: 'medieval', label: 'Medieval Names' },
    { value: 'royal_noble', label: 'Royal/Noble Names' },
    { value: 'servant', label: 'Servant Names' },
    { value: 'prophet', label: 'Prophet Names' },
    { value: 'killer', label: 'Killer Names' },
    { value: 'evil_villain', label: 'Evil Villain Names' },
    { value: 'mad_scientist', label: 'Mad Scientist Names' },
    { value: 'boxer', label: 'Boxer Names' }
  ],
  "Fantasy Races & Creatures": [
    { value: 'elf', label: 'Elven Names' },
    { value: 'dark_elf', label: 'Dark Elf Names' },
    { value: 'dwarf', label: 'Dwarven Names' },
    { value: 'hobbit', label: 'Hobbit Names' },
    { value: 'gnome', label: 'Gnome Names' },
    { value: 'goblin', label: 'Goblin Names' },
    { value: 'orc', label: 'Orc Names' },
    { value: 'troll', label: 'Troll Names' },
    { value: 'ogre', label: 'Ogre Names' },
    { value: 'giant', label: 'Giant Names' },
    { value: 'centaur', label: 'Centaur Names' },
    { value: 'minotaur', label: 'Minotaur Names' },
    { value: 'lizardfolk', label: 'Lizardfolk Names' },
    { value: 'fairy', label: 'Fairy Names' },
    { value: 'pixie', label: 'Pixie Names' },
    { value: 'dryad', label: 'Dryad Names' },
    { value: 'fantasy_race', label: 'Fantasy Race Names' },
    { value: 'fantasy_creature', label: 'Fantasy Creature Names' },
    { value: 'legendary_creature', label: 'Legendary Creature Names' }
  ],
  "Mythical & Supernatural": [
    { value: 'dragon', label: 'Dragon Names' },
    { value: 'phoenix', label: 'Phoenix Names' },
    { value: 'unicorn', label: 'Unicorn Names' },
    { value: 'griffin', label: 'Griffin Names' },
    { value: 'hydra', label: 'Hydra Names' },
    { value: 'wyvern', label: 'Wyvern Names' },
    { value: 'angel', label: 'Angel Names' },
    { value: 'demon', label: 'Demon Names' },
    { value: 'deity', label: 'Deity Names' },
    { value: 'genie', label: 'Genie Names' },
    { value: 'elemental', label: 'Elemental Names' },
    { value: 'banshee', label: 'Banshee Names' },
    { value: 'harpy', label: 'Harpy Names' },
    { value: 'succubus', label: 'Succubus Names' },
    { value: 'valkyrie', label: 'Valkyrie Names' },
    { value: 'gargoyle', label: 'Gargoyle Names' },
    { value: 'golem', label: 'Golem Names' },
    { value: 'gorgon', label: 'Gorgon Names' },
    { value: 'guardian', label: 'Guardian Names' },
    { value: 'titan', label: 'Titan Names' }
  ],
  "Horror & Dark": [
    { value: 'vampire', label: 'Vampire Names' },
    { value: 'vampire_clan', label: 'Vampire Clan Names' },
    { value: 'werewolf', label: 'Werewolf Names' },
    { value: 'ghost', label: 'Ghost Names' },
    { value: 'ghoul', label: 'Ghoul Names' },
    { value: 'zombie', label: 'Zombie Names' },
    { value: 'monster', label: 'Monster Names' },
    { value: 'witch', label: 'Witch Names' },
    { value: 'witch_coven', label: 'Witch Coven Names' },
    { value: 'necromancer', label: 'Necromancer Names' },
    { value: 'apocalypse', label: 'Apocalypse Names' },
    { value: 'yeti', label: 'Yeti Names' },
    { value: 'imp', label: 'Imp Names' }
  ],
  "Sci-Fi & Future": [
    { value: 'alien', label: 'Alien Names' },
    { value: 'robot', label: 'Robot Names' },
    { value: 'ai', label: 'AI Names' },
    { value: 'mecha', label: 'Mecha Names' },
    { value: 'mutant', label: 'Mutant Names' },
    { value: 'cyberpunk', label: 'Cyberpunk Names' },
    { value: 'steampunk', label: 'Steampunk Names' },
    { value: 'futuristic', label: 'Futuristic Names' },
    { value: 'code', label: 'Code Names' },
    { value: 'superhero', label: 'Superhero Names' },
    { value: 'superhero_team', label: 'Superhero Team Names' }
  ],
  "Animals & Nature": [
    { value: 'animal_species', label: 'Animal Species Names' },
    { value: 'fantasy_animal', label: 'Fantasy Animal Names' },
    { value: 'pet', label: 'Pet Names' },
    { value: 'horse', label: 'Horse Names' },
    { value: 'sea_creature', label: 'Sea Creature Names' },
    { value: 'insect_species', label: 'Insect Species Names' },
    { value: 'arachnid', label: 'Arachnid Names' },
    { value: 'mermaid', label: 'Mermaid Names' },
    { value: 'siren', label: 'Siren Names' },
    { value: 'selkie', label: 'Selkie Names' },
    { value: 'druid_grove', label: 'Druid Grove Names' }
  ],
  "Locations & Places": [
    { value: 'location', label: 'Location Names' },
    { value: 'city', label: 'City Names' },
    { value: 'town', label: 'Town Names' },
    { value: 'village', label: 'Village Names' },
    { value: 'kingdom', label: 'Kingdom Names' },
    { value: 'empire', label: 'Empire Names' },
    { value: 'forest', label: 'Forest Names' },
    { value: 'mountain', label: 'Mountain Names' },
    { value: 'desert', label: 'Desert Names' },
    { value: 'island', label: 'Island Names' },
    { value: 'tavern', label: 'Tavern Names' },
    { value: 'dungeon', label: 'Dungeon Names' },
    { value: 'castle', label: 'Castle Names' },
    { value: 'temple', label: 'Temple Names' }
  ],
  "Organizations & Groups": [
    { value: 'clan', label: 'Clan/Family Names' },
    { value: 'army', label: 'Army Names' },
    { value: 'group', label: 'Group Names' },
    { value: 'sorority', label: 'Sorority Names' },
    { value: 'culture', label: 'Culture Names' },
    { value: 'company', label: 'Company Names' },
    { value: 'brand', label: 'Brand Names' },
    { value: 'airline', label: 'Airline Names' },
    { value: 'faction', label: 'Faction Names' },
    { value: 'council', label: 'Council Names' },
    { value: 'cult', label: 'Cult Names' },
    { value: 'organization', label: 'Organization Names' },
    { value: 'fraternity', label: 'Fraternity Names' },
    { value: 'gang', label: 'Gang Names' },
    { value: 'government', label: 'Government Names' },
    { value: 'guild', label: 'Guild Names' },
    { value: 'law_enforcement', label: 'Law Enforcement Agency Names' },
    { value: 'military_division', label: 'Military Division Names' },
    { value: 'mob', label: 'Mob Names' },
    { value: 'political_party', label: 'Political Party Names' },
    { value: 'society', label: 'Society Names' },
    { value: 'secret_order', label: 'Secret Order Names' },
    { value: 'sports_team', label: 'Sports Team Names' },
    { value: 'space_fleet', label: 'Space Fleet Names' },
    { value: 'tribe', label: 'Tribe Names' },
    { value: 'tribal', label: 'Tribal Names' },
    { value: 'crew', label: 'Crew Names' },
    { value: 'rebellion', label: 'Rebellion Names' }
  ],
  "Magic & Fantasy": [
    { value: 'wizard', label: 'Wizard Names' },
    { value: 'magic', label: 'Magic Names' },
    { value: 'artifact', label: 'Artifact Names' },
    { value: 'alchemy_ingredient', label: 'Alchemy Ingredient Names' },
    { value: 'fantasy_surname', label: 'Fantasy Surnames' }
  ],
  "Medical & Health": [
    { value: 'virus', label: 'Virus Names' },
    { value: 'pandemic', label: 'Pandemic Names' },
    { value: 'disease', label: 'Disease Names' },
    { value: 'illness', label: 'Illness Names' },
    { value: 'condition', label: 'Condition Names' },
    { value: 'medicine', label: 'Medicine Names' },
    { value: 'ailment', label: 'Ailment Names' },
    { value: 'cure', label: 'Cure Names' },
    { value: 'poison', label: 'Poison Names' },
    { value: 'potion', label: 'Potion Names' }
  ],
  "Science & Nature": [
    { value: 'constellation', label: 'Constellation Names' },
    { value: 'crop', label: 'Crop Names' },
    { value: 'plant_species', label: 'Plant Species Names' },
    { value: 'dinosaur', label: 'Dinosaur Names' },
    { value: 'mineral', label: 'Mineral Names' },
    { value: 'gemstone', label: 'Gemstone Names' },
    { value: 'herb', label: 'Herb Names' },
    { value: 'spice', label: 'Spice Names' },
    { value: 'fruit', label: 'Fruit Names' },
    { value: 'vegetable', label: 'Vegetable Names' },
    { value: 'fungus', label: 'Fungus Names' },
    { value: 'element', label: 'Element Names' },
    { value: 'molecule', label: 'Molecule Names' },
    { value: 'mutant_plant', label: 'Mutant Plant Names' },
    { value: 'natural_disaster', label: 'Natural Disaster Names' },
    { value: 'fantasy_plant', label: 'Fantasy Plant Names' },
    { value: 'fantasy_species', label: 'Fantasy Species Names' },
    { value: 'scientific', label: 'Scientific Names' }
  ],
  "Entertainment & Media": [
    { value: 'game', label: 'Game Names' },
    { value: 'video_game', label: 'Video Game Names' },
    { value: 'dj', label: 'DJ Names' },
    { value: 'band', label: 'Band Names' },
    { value: 'album', label: 'Album Names' },
    { value: 'magazine', label: 'Magazine Names' },
    { value: 'newspaper', label: 'Newspaper Names' },
    { value: 'musician', label: 'Musician Names' },
    { value: 'celebrity', label: 'Celebrity Names' },
    { value: 'record_label', label: 'Record Label Names' },
    { value: 'book', label: 'Book Names' },
    { value: 'wrestler', label: 'Wrestler Names' },
    { value: 'wrestling_move', label: 'Wrestling Move Names' }
  ],
  "Food & Drink": [
    { value: 'drink', label: 'Drink Names' },
    { value: 'food', label: 'Food Names' },
    { value: 'candy', label: 'Candy Names' }
  ],
  "Arts & Culture": [
    { value: 'colour', label: 'Colour Names' },
    { value: 'dance', label: 'Dance Names' },
    { value: 'instrument', label: 'Instrument Names' },
    { value: 'jewelry', label: 'Jewelry Names' },
    { value: 'music', label: 'Music Names' },
    { value: 'martial_arts', label: 'Martial Arts Names' },
    { value: 'artwork', label: 'Artwork Names' }
  ],
  "Military & Combat": [
    { value: 'military_rank', label: 'Military Rank Names' },
    { value: 'mercenary', label: 'Mercenary Names' },
    { value: 'military_operation', label: 'Military Operation Names' },
    { value: 'weapon', label: 'Weapon Names' },
    { value: 'battle', label: 'Battle Names' }
  ],
  "Culture & Society": [
    { value: 'language', label: 'Language Names' },
    { value: 'holiday', label: 'Holiday Names' },
    { value: 'tradition', label: 'Tradition Names' },
    { value: 'ritual', label: 'Ritual Names' },
    { value: 'religion', label: 'Religion Names' },
    { value: 'time_period', label: 'Time Period Names' },
    { value: 'season', label: 'Season Names' }
  ],
  "Transportation & Technology": [
    { value: 'railway', label: 'Railway Names' },
    { value: 'rocketship', label: 'Rocketship Names' },
    { value: 'space_station', label: 'Space Station Names' },
    { value: 'satellite', label: 'Satellite Names' },
    { value: 'vehicle', label: 'Vehicle Names' }
  ],
  "Professional & Trades": [
    { value: 'fantasy_profession', label: 'Fantasy Profession Names' },
    { value: 'profession', label: 'Profession Names' },
    { value: 'noble', label: 'Noble Names' },
    { value: 'royal_title', label: 'Royal Title Names' }
  ],
  "Performance & Entertainment": [
    { value: 'clown', label: 'Clown Names' },
    { value: 'drag_king', label: 'Drag King Names' },
    { value: 'drag_queen', label: 'Drag Queen Names' },
    { value: 'roller_derby', label: 'Roller Derby Names' },
    { value: 'mascot', label: 'Mascot Names' }
  ],
  "Fantasy & Magic Extended": [
    { value: 'enchantment', label: 'Enchantment Names' },
    { value: 'magic_school', label: 'Magic School Names' },
    { value: 'spell', label: 'Spell Names' },
    { value: 'rune', label: 'Rune Names' },
    { value: 'superpower', label: 'Superpower Names' }
  ],
  "Miscellaneous": [
    { value: 'currency', label: 'Currency Names' },
    { value: 'curse', label: 'Curse Names' },
    { value: 'date', label: 'Date Names' },
    { value: 'drug', label: 'Drug Names' },
    { value: 'blackmarket', label: 'Blackmarket Names' },
    { value: 'hacker', label: 'Hacker Names' },
    { value: 'heist', label: 'Heist Names' },
    { value: 'material', label: 'Material Names' },
    { value: 'measurement', label: 'Measurement Names' },
    { value: 'ride', label: 'Ride Names' },
    { value: 'tool', label: 'Tool Names' },
    { value: 'treaty', label: 'Treaty Names' },
    { value: 'document', label: 'Document Names' },
    { value: 'username', label: 'Usernames' },
    { value: 'mobster', label: 'Mobster Names' }
  ]
};

// Comprehensive ethnicity and cultural background options (same as character generator)
const ETHNICITY_CATEGORIES = {
  "European": [
    "British/English", "Irish", "Scottish", "Welsh", "French", "German", "Italian", "Spanish", "Portuguese", 
    "Dutch", "Belgian", "Swiss", "Austrian", "Polish", "Czech", "Slovak", "Hungarian", "Romanian", 
    "Bulgarian", "Croatian", "Serbian", "Bosnian", "Albanian", "Greek", "Maltese", "Nordic/Scandinavian", 
    "Norwegian", "Swedish", "Danish", "Finnish", "Icelandic", "Russian", "Ukrainian", "Belarusian", 
    "Estonian", "Latvian", "Lithuanian"
  ],
  "East Asian": [
    "Chinese (Han)", "Japanese", "Korean", "Taiwanese", "Hong Kong Chinese", "Tibetan", "Mongolian", 
    "Vietnamese", "Thai", "Cambodian/Khmer", "Laotian", "Burmese/Myanmar", "Filipino", "Indonesian", 
    "Malaysian", "Singaporean", "Brunei"
  ],
  "South Asian": [
    "Indian (Northern)", "Indian (Southern)", "Pakistani", "Bangladeshi", "Sri Lankan", "Nepali", 
    "Bhutanese", "Maldivian", "Afghan", "Punjabi", "Bengali", "Tamil", "Telugu", "Marathi", 
    "Gujarati", "Kashmiri"
  ],
  "Middle Eastern": [
    "Arab", "Palestinian", "Lebanese", "Syrian", "Jordanian", "Iraqi", "Saudi Arabian", "Emirati", 
    "Qatari", "Kuwaiti", "Bahraini", "Omani", "Yemeni", "Egyptian", "Moroccan", "Tunisian", 
    "Algerian", "Libyan", "Persian/Iranian", "Turkish", "Kurdish", "Armenian", "Georgian", "Azerbaijani"
  ],
  "African": [
    "Nigerian", "Ghanaian", "Senegalese", "Malian", "Ivorian", "Burkinabe", "Kenyan", "Ethiopian", 
    "Tanzanian", "Ugandan", "Rwandan", "South African", "Zimbabwean", "Botswanan", "Namibian", 
    "Congolese", "Cameroonian", "Sudanese", "Eritrean", "Somali", "Liberian", "Sierra Leonean", 
    "Gambian", "Guinean", "Malawian", "Zambian", "Mozambican", "Angolan", "Gabonese", 
    "Equatorial Guinean", "Central African", "Chadian", "Mauritanian", "Djiboutian", "Swahili", 
    "Yoruba", "Igbo", "Hausa", "Zulu", "Xhosa", "Amhara", "Oromo"
  ],
  "Latin American": [
    "Mexican", "Brazilian", "Colombian", "Argentinian", "Venezuelan", "Peruvian", "Ecuadorian", 
    "Bolivian", "Chilean", "Paraguayan", "Uruguayan", "Guatemalan", "Honduran", "Salvadoran", 
    "Nicaraguan", "Costa Rican", "Panamanian", "Cuban", "Dominican", "Puerto Rican", "Jamaican", 
    "Trinidadian", "Barbadian", "Guyanese", "Surinamese", "Belizean", "Haitian"
  ],
  "Indigenous & Native": [
    "Native American (Cherokee)", "Native American (Navajo)", "Native American (Sioux)", 
    "Native American (Apache)", "Native American (Iroquois)", "Native American (Pueblo)", 
    "Native American (Chippewa)", "Native American (Choctaw)", "Native American (Creek)", 
    "Native American (Seminole)", "Inuit", "First Nations (Cree)", "First Nations (Ojibwe)", 
    "First Nations (Mi'kmaq)", "Métis", "Aboriginal Australian", "Torres Strait Islander", "Maori", 
    "Pacific Islander (Samoan)", "Pacific Islander (Tongan)", "Pacific Islander (Fijian)", 
    "Pacific Islander (Hawaiian)", "Maya", "Aztec/Nahuatl", "Inca/Quechua", "Guarani", "Mapuche"
  ],
  "Mixed Heritage": [
    "Afro-Caribbean", "Anglo-Indian", "Eurasian", "Blasian (Black + Asian)", 
    "Mestizo (Indigenous + European)", "Mulatto (African + European)", "Hapa (Half Asian Pacific)", 
    "Creole", "Cape Coloured", "Pardo (Brazilian mixed)", "Multiracial", "Biracial"
  ],
  "Jewish Diaspora": [
    "Ashkenazi Jewish", "Sephardic Jewish", "Mizrahi Jewish", "Ethiopian Jewish", "Indian Jewish", "Bukharian Jewish"
  ],
  "Other Groups": [
    "Roma/Romani", "Sinti", "Bedouin", "Tuareg", "Berber/Amazigh", "Kurmanji Kurdish", "Sorani Kurdish",
    "Kazakh", "Uzbek", "Turkmen", "Kyrgyz", "Tajik", "Uyghur"
  ],
  "Fantasy & Fictional": [
    "Elvish", "Dwarven", "Orcish", "Draconic", "Celestial", "Infernal", "Primordial", "Sylvan"
  ]
};

export default function NameGenerator() {
  const [nameType, setNameType] = useState('character');
  const [culture, setCulture] = useState('');
  const { user } = useAuth();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before generating names.'
  });
  const { toast } = useToast();

  // Helper functions to get all name types and ethnicities
  const getAllNameTypes = () => {
    return Object.entries(NAME_TYPE_CATEGORIES).flatMap(([category, types]) => 
      types.map(type => ({ ...type, category }))
    );
  };

  const getAllEthnicities = () => {
    return Object.entries(ETHNICITY_CATEGORIES).flatMap(([category, ethnicities]) => 
      ethnicities.map(ethnicity => ({ value: ethnicity.toLowerCase().replace(/[^a-z0-9]/g, '_'), label: ethnicity, category }))
    );
  };

  // Convert categories to format expected by SearchableSelect
  const getNameTypeCategorizedOptions = () => {
    const result: Record<string, string[]> = {};
    Object.entries(NAME_TYPE_CATEGORIES).forEach(([category, types]) => {
      result[category] = types.map(type => type.value);
    });
    return result;
  };

  const getEthnicityCategorizedOptions = () => {
    const result: Record<string, string[]> = {};
    Object.entries(ETHNICITY_CATEGORIES).forEach(([category, ethnicities]) => {
      result[category] = ethnicities.map(ethnicity => ethnicity.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    });
    return result;
  };

  // Get display names
  const getNameTypeLabel = () => {
    const allTypes = getAllNameTypes();
    return allTypes.find(type => type.value === nameType)?.label || 'Select name type';
  };

  const getCultureLabel = () => {
    const allEthnicities = getAllEthnicities();
    return allEthnicities.find(eth => eth.value === culture)?.label || 'Any culture';
  };

  const generator = useGenerator<GeneratedName[]>({
    generateEndpoint: '/api/names/generate',
    getGenerateParams: () => ({ nameType, culture }),
    resolveResultId: (names) => names[0]?.id,
    saveEndpoint: '/api/names',
    prepareSavePayload: (names) => ({ 
      names, 
      nameType, 
      culture,
      notebookId 
    }),
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (names) => {
      const nameText = `Generated ${getNameTypeLabel()} (${getCultureLabel()}):\n\n${names.map(name => `${name.name}${name.meaning ? ` - ${name.meaning}` : ''}`).join('\n')}`;
      return nameText;
    },
    itemTypeName: 'names',
    userId: user?.id ?? undefined,
    notebookId: notebookId ?? undefined,
    invalidateOnSave: [['/api/saved-items', user?.id ?? undefined]],
  });

  const generatedNames = generator.result || [];

  const getNameTypeIcon = () => {
    switch (nameType) {
      case 'character':
      case 'human': return User;
      case 'location':
      case 'city':
      case 'town':
      case 'village':
      case 'kingdom':
      case 'empire': return MapPin;
      case 'royal_noble':
      case 'royal_title':
      case 'noble': return Crown;
      default: return FileText;
    }
  };

  const NameIcon = getNameTypeIcon();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Name Generator</CardTitle>
          <CardDescription>
            Find perfect names for characters, places, and fantasy elements. Generate culturally appropriate names with meanings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratorNotebookControls />
          
          <div className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name Type</label>
                <SearchableSelect
                  value={nameType}
                  onValueChange={setNameType}
                  placeholder="Select name type..."
                  categorizedOptions={getNameTypeCategorizedOptions()}
                  testId="select-name-type"
                  formatLabel={(value) => {
                    const allTypes = getAllNameTypes();
                    return allTypes.find(type => type.value === value)?.label || value;
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Cultural Style</label>
                <SearchableSelect
                  value={culture}
                  onValueChange={setCulture}
                  placeholder="Any culture..."
                  categorizedOptions={getEthnicityCategorizedOptions()}
                  testId="select-culture"
                  allowEmpty={true}
                  emptyLabel="Any Culture"
                  formatLabel={(value) => {
                    if (!value) return "Any Culture";
                    const allEthnicities = getAllEthnicities();
                    return allEthnicities.find(eth => eth.value === value)?.label || value;
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={generator.generate}
              disabled={generator.isGenerating}
              data-testid="button-generate-names"
            >
              {generator.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Names"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedNames.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <NameIcon className="h-6 w-6 text-primary" />
                  Generated {getNameTypeLabel()}
                </CardTitle>
                <CardDescription className="mt-2">
                  {getCultureLabel()} style names
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {generatedNames.map((name, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold" data-testid={`text-name-${index}`}>
                        {name.name}
                      </h3>
                      {name.meaning && (
                        <p className="text-muted-foreground mt-1" data-testid={`text-meaning-${index}`}>
                          Meaning: {name.meaning}
                        </p>
                      )}
                      {name.origin && (
                        <Badge variant="secondary" className="mt-2">
                          {name.origin}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(name.name);
                        toast({
                          title: "Copied!",
                          description: `"${name.name}" copied to clipboard.`,
                        });
                      }}
                      data-testid={`button-copy-name-${index}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={generator.saveToCollection}
                disabled={generator.isSaving}
                variant="default"
                data-testid="button-save-names"
              >
                {generator.isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Save All Names
                  </>
                )}
              </Button>
              
              <Button 
                onClick={generator.copyToClipboard}
                variant="outline"
                data-testid="button-copy-all-names"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>

              <Button 
                onClick={generator.generate}
                variant="outline"
                disabled={generator.isGenerating}
                data-testid="button-regenerate-names"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedNames.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Generate Names</h3>
            <p className="text-muted-foreground">
              Choose your options above and click generate to create perfect names for your story
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}