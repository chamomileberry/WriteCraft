import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { FileText, User, MapPin, Crown, Copy, Heart, Loader2, Sparkles, RefreshCw, Check, ChevronsUpDown } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
    { value: 'royal', label: 'Royal/Noble Names' },
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
    { value: 'species', label: 'Species Names' },
    { value: 'company', label: 'Company Names' },
    { value: 'brand', label: 'Brand Names' },
    { value: 'airline', label: 'Airline Names' }
  ],
  "Magic & Fantasy": [
    { value: 'wizard', label: 'Wizard Names' },
    { value: 'magic', label: 'Magic Names' },
    { value: 'artifact', label: 'Artifact Names' },
    { value: 'alchemy_ingredient', label: 'Alchemy Ingredient Names' },
    { value: 'fantasy_surname', label: 'Fantasy Surnames' }
  ],
  "Entertainment & Misc": [
    { value: 'game', label: 'Game Names' },
    { value: 'artwork', label: 'Artwork Names' },
    { value: 'battle', label: 'Battle Names' },
    { value: 'candy', label: 'Candy Names' }
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
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [nameType, setNameType] = useState('character');
  const [culture, setCulture] = useState('');
  const [nameTypeSearchOpen, setNameTypeSearchOpen] = useState(false);
  const [cultureSearchOpen, setCultureSearchOpen] = useState(false);
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

  // Get display names
  const getNameTypeLabel = () => {
    const allTypes = getAllNameTypes();
    return allTypes.find(type => type.value === nameType)?.label || 'Select name type';
  };

  const getCultureLabel = () => {
    const allEthnicities = getAllEthnicities();
    return allEthnicities.find(eth => eth.value === culture)?.label || 'Any culture';
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/names/generate', { nameType, culture });
      return await res.json() as GeneratedName[];
    },
    onSuccess: (names: GeneratedName[]) => {
      setGeneratedNames(names);
      queryClient.invalidateQueries({ queryKey: ['/api/names'] });
    },
    onError: (error) => {
      console.error('Failed to generate names:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create names. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (names: GeneratedName[]) => {
      const res = await apiRequest('POST', '/api/names', { names, nameType, culture });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Names Saved!",
        description: "Your names have been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/names'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save names. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleSave = () => {
    if (generatedNames.length > 0) {
      saveMutation.mutate(generatedNames);
    }
  };

  const handleCopy = () => {
    if (generatedNames.length > 0) {
      const nameText = `Generated ${getNameTypeLabel()} (${getCultureLabel()}):\n\n${generatedNames.map(name => `${name.name}${name.meaning ? ` - ${name.meaning}` : ''}`).join('\n')}`;

      navigator.clipboard.writeText(nameText);
      toast({
        title: "Copied to Clipboard!",
        description: "Names have been copied to your clipboard.",
      });
    }
  };

  const getNameTypeIcon = () => {
    switch (nameType) {
      case 'character': return User;
      case 'place': return MapPin;
      case 'royal': return Crown;
      default: return FileText;
    }
  };

  const NameIcon = getNameTypeIcon();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Name Generator</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find perfect names for characters, places, and fantasy elements. Generate culturally appropriate names with meanings.
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generation Options</CardTitle>
          <CardDescription>
            Customize your name generation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name Type</label>
              <Popover open={nameTypeSearchOpen} onOpenChange={setNameTypeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={nameTypeSearchOpen}
                    className="w-full justify-between"
                    data-testid="select-name-type"
                  >
                    {getNameTypeLabel()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search name types..." data-testid="input-name-type-search" />
                    <CommandList>
                      <CommandEmpty>No name type found.</CommandEmpty>
                      {Object.entries(NAME_TYPE_CATEGORIES).map(([category, types]) => (
                        <CommandGroup key={category} heading={category}>
                          {types.map((type) => (
                            <CommandItem
                              key={type.value}
                              value={type.label}
                              data-testid={`item-name-type-${type.value}`}
                              onSelect={() => {
                                setNameType(type.value);
                                setNameTypeSearchOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  nameType === type.value ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {type.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cultural Style</label>
              <Popover open={cultureSearchOpen} onOpenChange={setCultureSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cultureSearchOpen}
                    className="w-full justify-between"
                    data-testid="select-culture"
                  >
                    {getCultureLabel()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search cultural styles..." data-testid="input-culture-search" />
                    <CommandList>
                      <CommandEmpty>No cultural style found.</CommandEmpty>
                      <CommandGroup heading="Any Culture">
                        <CommandItem
                          value="Any Culture"
                          data-testid="item-culture-any"
                          onSelect={() => {
                            setCulture('');
                            setCultureSearchOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              culture === '' ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          Any Culture
                        </CommandItem>
                      </CommandGroup>
                      {Object.entries(ETHNICITY_CATEGORIES).map(([category, ethnicities]) => (
                        <CommandGroup key={category} heading={category}>
                          {ethnicities.map((ethnicity) => {
                            const value = ethnicity.toLowerCase().replace(/[^a-z0-9]/g, '_');
                            return (
                              <CommandItem
                                key={value}
                                value={ethnicity}
                                data-testid={`item-culture-${value}`}
                                onSelect={() => {
                                  setCulture(value);
                                  setCultureSearchOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    culture === value ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {ethnicity}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mb-8">
        <Button 
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-names"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Names...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Names
            </>
          )}
        </Button>
      </div>

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
                onClick={handleSave}
                disabled={saveMutation.isPending}
                variant="default"
                data-testid="button-save-names"
              >
                {saveMutation.isPending ? (
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
                onClick={handleCopy}
                variant="outline"
                data-testid="button-copy-all-names"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>

              <Button 
                onClick={handleGenerate}
                variant="outline"
                disabled={generateMutation.isPending}
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