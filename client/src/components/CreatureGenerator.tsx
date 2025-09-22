import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Rabbit, MapPin, Eye, Zap, Heart, Copy, Loader2, Sparkles, Check, ChevronsUpDown, Brain, Globe } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Creature } from "@shared/schema";

// Genre categories - same as other generators
const GENRE_CATEGORIES = {
  "General Fiction": [
    "fiction", "drama", "literary fiction", "political fiction", "musical fiction", 
    "sports fiction", "suspense fiction"
  ],
  "Science Fiction": [
    "science fiction", "cyberpunk", "dystopian", "post-apocalyptic", "steampunk", 
    "dieselpunk", "nanopunk", "solarpunk", "atompunk", "clockpunk", "postcyberpunk", 
    "utopian", "comedy sci-fi", "feminist sci-fi", "gothic sci-fi", "climate fiction", 
    "parallel world sci-fi", "libertarian sci-fi", "mecha sci-fi", "military sci-fi", 
    "social sci-fi", "anthropological sci-fi", "space opera", "space western", 
    "subterranean sci-fi", "tech noir", "alien invasion", "scientific romance", 
    "dying earth", "quantum fiction"
  ],
  "Fantasy": [
    "fantasy", "contemporary fantasy", "cozy fantasy", "dark fantasy", "high fantasy", 
    "fantasy comedy", "gothic fantasy", "historical fantasy", "low fantasy", "mythpunk", 
    "mythic fantasy", "mythopoeia", "magic realism", "romantic fantasy", "science fantasy", 
    "supernatural fantasy", "heroic fantasy", "portal fantasy", "medieval fantasy", 
    "prehistoric fantasy"
  ],
  "Horror": [
    "horror", "comedy horror", "gothic horror", "zombie horror", "dark romanticism", 
    "cosmic horror", "werewolf fiction", "vampire literature", "psychological horror", 
    "techno-horror", "apocalyptic", "zombie apocalypse", "monster literature", "weird fiction"
  ],
  "Mystery & Crime": [
    "mystery", "crime fiction", "detective", "historical mystery", "noir", "cozy mystery", 
    "legal thriller", "caper", "spy fiction"
  ],
  "Thriller": [
    "thriller", "psychological thriller", "techno-thriller", "political thriller"
  ],
  "Romance": [
    "romance", "paranormal romance", "contemporary romance", "medical romance", 
    "thriller romance", "historical romance", "inspirational romance", "romantic suspense", 
    "western romance", "young adult romance", "chivalric romance"
  ],
  "Western": [
    "western", "horror western", "science fiction western", "weird western", "fantasy western"
  ],
  "Young Adult & New Adult": [
    "young adult", "new adult"
  ],
  "Historical": [
    "historical fiction", "prehistoric fiction", "medieval fiction"
  ],
  "Comedy": [
    "comedy", "tragic comedy", "burlesque"
  ],
  "Drama": [
    "tragedy", "melodrama"
  ],
  "Superhero": [
    "superhero fantasy", "cape punk", "heroic noir"
  ],
  "Speculative & Experimental": [
    "xenofiction", "alternative history", "slipstream", "postmodern", "conte", "pulp fiction"
  ],
  "Action & Adventure": [
    "action-adventure", "nautical"
  ]
};

// Creature type categories
const CREATURE_TYPE_CATEGORIES = {
  "Real Animals - Vertebrates": [
    "fish", "mammal", "bird", "amphibian", "reptile", "canine", "feline", 
    "aquatic mammal", "avian", "primate", "rodent", "ungulate", "bovine", 
    "camelid", "caprid", "equine", "pachyderm", "swine", "marsupial"
  ],
  "Real Animals - Invertebrates": [
    "arthropod", "crustacean", "arachnid", "mollusc", "xenarthran"
  ],
  "Specialized Animal Types": [
    "musteloid", "herpestoid", "procyonid", "jackalope"
  ],
  "Fantasy Creatures": [
    "dragon", "unicorn", "griffin", "hypogriff", "pegasus", "phoenix"
  ],
  "Mythological Beings": [
    "fairy", "pixie", "nymph", "siren", "sprite", "dryad", "druid", 
    "valkyrie", "banshee"
  ],
  "Shapeshifters & Lycanthropes": [
    "werewolf", "werehyena", "wendigo", "selkie", "kelpie"
  ],
  "Undead & Supernatural": [
    "vampire", "wraith", "ghoul", "skeleton", "draugr"
  ],
  "Humanoid Races": [
    "elf", "dwarf", "gnome", "goblin", "humanoid"
  ],
  "Giants & Large Beings": [
    "troll", "ogre", "giant", "cyclops", "minotaur"
  ],
  "Hybrid Creatures": [
    "centaur", "mermaid", "faun", "sphinx"
  ],
  "Constructed Beings": [
    "golem", "gargoyle", "elemental"
  ],
  "Cryptids & Legendary": [
    "chupacabra", "yeti", "sasquatch", "kraken", "leviathan"
  ],
  "Serpentine & Reptilian": [
    "serpent", "basilisk", "gorgon", "hydra", "echidna", "sea serpent"
  ],
  "Spirits & Ethereal": [
    "will-o'-wisp", "genie", "gremlin", "demon", "incubus", "succubus", 
    "leprechaun", "boggart", "spriggan"
  ],
  "Prehistoric & Ancient": [
    "dinosaur"
  ],
  "Extraterrestrial": [
    "alien"
  ],
  "Botanical & Nature": [
    "mandrake"
  ],
  "Zodiacal": [
    "capricorn"
  ]
};

const ALL_GENRES = Object.values(GENRE_CATEGORIES).flat();
const ALL_CREATURE_TYPES = Object.values(CREATURE_TYPE_CATEGORIES).flat();

export default function CreatureGenerator() {
  const [generatedCreature, setGeneratedCreature] = useState<Creature | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedCreatureType, setSelectedCreatureType] = useState<string>("");
  const [genreSearchOpen, setGenreSearchOpen] = useState(false);
  const [creatureTypeSearchOpen, setCreatureTypeSearchOpen] = useState(false);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/creatures/generate', {
        genre: selectedGenre && selectedGenre !== "any" ? selectedGenre : undefined,
        creatureType: selectedCreatureType && selectedCreatureType !== "any" ? selectedCreatureType : undefined
      });
      return await res.json() as Creature;
    },
    onSuccess: (creature: Creature) => {
      setGeneratedCreature(creature);
      queryClient.invalidateQueries({ queryKey: ['/api/creatures'] });
    },
    onError: (error) => {
      console.error('Failed to generate creature:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create creature. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (creature: Creature) => {
      const res = await apiRequest('POST', '/api/creatures', creature);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Creature Saved!",
        description: "Your creature has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/creatures'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save creature. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleSave = () => {
    if (generatedCreature) {
      saveMutation.mutate(generatedCreature);
    }
  };

  const handleCopy = () => {
    if (generatedCreature) {
      const creatureText = `Creature: ${generatedCreature.name}

Type: ${generatedCreature.creatureType}
Habitat: ${generatedCreature.habitat}

Physical Description:
${generatedCreature.physicalDescription}

Abilities:
${generatedCreature.abilities.join(', ')}

Behavior:
${generatedCreature.behavior}

Cultural Significance:
${generatedCreature.culturalSignificance}`;

      navigator.clipboard.writeText(creatureText);
      toast({
        title: "Copied to Clipboard!",
        description: "Creature details have been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Creature Generator</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create fascinating creatures for your stories. Generate detailed beings with unique abilities, behaviors, and cultural significance using AI.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Customize Your Creature</CardTitle>
          <CardDescription>
            Select a genre and creature type to generate a more targeted creature for your story.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Genre Selection */}
            <div className="space-y-2">
              <Label htmlFor="genre-select">Genre (Optional)</Label>
              <Popover open={genreSearchOpen} onOpenChange={setGenreSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={genreSearchOpen}
                    className="w-full justify-between"
                    data-testid="select-genre"
                  >
                    {selectedGenre && selectedGenre !== "any" ? selectedGenre : selectedGenre === "any" ? "Any Genre" : "Select a genre..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search genres..." />
                    <CommandList className="max-h-60">
                      <CommandEmpty>No genre found.</CommandEmpty>
                      <CommandItem
                        value="any"
                        onSelect={() => {
                          setSelectedGenre("any");
                          setGenreSearchOpen(false);
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${selectedGenre === "any" ? "opacity-100" : "opacity-0"}`} />
                        Any Genre
                      </CommandItem>
                      {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                        <CommandGroup key={category} heading={category}>
                          {genres.map((genre) => (
                            <CommandItem
                              key={genre}
                              value={genre}
                              onSelect={() => {
                                setSelectedGenre(genre);
                                setGenreSearchOpen(false);
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${selectedGenre === genre ? "opacity-100" : "opacity-0"}`} />
                              {genre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Creature Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="creature-type-select">Creature Type (Optional)</Label>
              <Popover open={creatureTypeSearchOpen} onOpenChange={setCreatureTypeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={creatureTypeSearchOpen}
                    className="w-full justify-between"
                    data-testid="select-creature-type"
                  >
                    {selectedCreatureType && selectedCreatureType !== "any" ? selectedCreatureType : selectedCreatureType === "any" ? "Any Creature Type" : "Select a creature type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search creature types..." />
                    <CommandList className="max-h-60">
                      <CommandEmpty>No creature type found.</CommandEmpty>
                      <CommandItem
                        value="any"
                        onSelect={() => {
                          setSelectedCreatureType("any");
                          setCreatureTypeSearchOpen(false);
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${selectedCreatureType === "any" ? "opacity-100" : "opacity-0"}`} />
                        Any Creature Type
                      </CommandItem>
                      {Object.entries(CREATURE_TYPE_CATEGORIES).map(([category, types]) => (
                        <CommandGroup key={category} heading={category}>
                          {types.map((type) => (
                            <CommandItem
                              key={type}
                              value={type}
                              onSelect={() => {
                                setSelectedCreatureType(type);
                                setCreatureTypeSearchOpen(false);
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${selectedCreatureType === type ? "opacity-100" : "opacity-0"}`} />
                              {type}
                            </CommandItem>
                          ))}
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
          data-testid="button-generate-creature"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Creature...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Creature
            </>
          )}
        </Button>
      </div>

      {generatedCreature && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2" data-testid="text-creature-name">
                  <Rabbit className="h-6 w-6 text-primary" />
                  {generatedCreature.name}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {generatedCreature.physicalDescription}
                </CardDescription>
                <div className="flex gap-2 mt-3">
                  {generatedCreature.genre && (
                    <Badge variant="outline" data-testid="badge-genre">
                      {generatedCreature.genre}
                    </Badge>
                  )}
                  {generatedCreature.creatureType && (
                    <Badge variant="outline" data-testid="badge-creature-type">
                      {generatedCreature.creatureType}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopy}
                  data-testid="button-copy-creature"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  data-testid="button-save-creature"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Basic Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Habitat:</span>
                  <span data-testid="text-creature-habitat">{generatedCreature.habitat}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Type:</span>
                  <span data-testid="text-creature-type">{generatedCreature.creatureType}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Abilities */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Abilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {generatedCreature.abilities.map((ability, index) => (
                  <Badge key={index} variant="secondary" data-testid={`badge-ability-${index}`}>
                    {ability}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Behavior */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Behavior
              </h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-creature-behavior">
                {generatedCreature.behavior}
              </p>
            </div>

            <Separator />

            {/* Cultural Significance */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Cultural Significance
              </h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-creature-cultural-significance">
                {generatedCreature.culturalSignificance}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}