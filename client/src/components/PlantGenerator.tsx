import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Leaf, Copy, Save, Shuffle, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { GENRE_CATEGORIES } from "@shared/genres";
import NotebookSwitcher from "./NotebookSwitcher";
import { useGenerator } from "@/hooks/useGenerator";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";

interface Plant {
  id?: string;
  name: string;
  scientificName: string;
  type: string;
  description: string;
  characteristics: string[];
  habitat: string;
  careInstructions: string;
  bloomingSeason: string;
  hardinessZone: string;
  genre?: string | null;
  userId?: string | null;
  createdAt?: string;
}

const PLANT_TYPES = [
  "annual", "perennial", "aquatic plant", "bamboo", "bulb", "cactus", "succulent", 
  "climber", "conifer", "fern", "fruit", "herb", "houseplant", "orchid", 
  "ornamental grass", "palm", "rose", "shrub", "bush", "tree", "flower", 
  "fungi", "vegetable", "nut", "seed", "creeper", "moss", "flowering plant", 
  "gymnosperm", "angiosperm", "legume", "spice", "grass", "heather", "hedge", 
  "alpine", "carnivorous", "lichen"
];

export default function PlantGenerator() {
  const [genre, setGenre] = useState<string>("");
  const [plantType, setPlantType] = useState<string>("");
  const [genreOpen, setGenreOpen] = useState<boolean>(false);
  const [plantTypeOpen, setPlantTypeOpen] = useState<boolean>(false);
  const [genreSearch, setGenreSearch] = useState<string>("");
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before generating plants.'
  });

  const generator = useGenerator<Plant>({
    generateEndpoint: '/api/plants/generate',
    getGenerateParams: () => ({
      genre: (genre && genre !== 'any') ? genre : undefined,
      type: (plantType && plantType !== 'any') ? plantType : undefined,
      notebookId: notebookId || undefined
    }),
    itemTypeName: 'plant',
    userId: 'demo-user',
    notebookId: notebookId || undefined,
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (plant) => `**${plant.name}**
Scientific Name: ${plant.scientificName}
Type: ${capitalizeWords(plant.type)}

${plant.description}

Characteristics: ${plant.characteristics.join(', ')}

Habitat: ${plant.habitat}

Care Instructions:
${plant.careInstructions}

Blooming Season: ${plant.bloomingSeason}
Hardiness Zone: ${plant.hardinessZone}`,
    invalidateOnSave: [['/api/saved-items']],
  });

  const currentPlant = generator.result;

  const capitalizeWords = (str: string): string => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredGenreCategories = Object.entries(GENRE_CATEGORIES).reduce((acc, [category, genres]) => {
    const filteredGenres = genres.filter(g => 
      g.toLowerCase().includes(genreSearch.toLowerCase())
    );
    if (filteredGenres.length > 0) {
      acc[category] = filteredGenres;
    }
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Plant Generator</h1>
          <p className="text-muted-foreground mt-1">Create unique plants and flora for your world</p>
        </div>
        <NotebookSwitcher />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Generate Plant
          </CardTitle>
          <CardDescription>
            Create fantastical or realistic plants for your world
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Popover open={genreOpen} onOpenChange={setGenreOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={genreOpen}
                  className="sm:w-48 justify-between"
                  data-testid="select-genre"
                >
                  {genre ? capitalizeWords(genre) : "Select genre..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search genres..." 
                    value={genreSearch}
                    onValueChange={setGenreSearch}
                  />
                  <CommandList className="max-h-60">
                    <CommandEmpty>No genre found.</CommandEmpty>
                    {Object.entries(filteredGenreCategories).map(([category, genres]) => (
                      <CommandGroup key={category} heading={category}>
                        {genres.map((genreOption) => (
                          <CommandItem
                            key={genreOption}
                            value={genreOption}
                            onSelect={() => {
                              setGenre(genreOption);
                              setGenreOpen(false);
                              setGenreSearch("");
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${genre === genreOption ? "opacity-100" : "opacity-0"}`} />
                            {capitalizeWords(genreOption)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover open={plantTypeOpen} onOpenChange={setPlantTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={plantTypeOpen}
                  className="sm:w-48 justify-between"
                  data-testid="select-plant-type"
                >
                  {plantType ? capitalizeWords(plantType) : "Select type..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandInput placeholder="Search types..." />
                  <CommandList className="max-h-60">
                    <CommandEmpty>No type found.</CommandEmpty>
                    <CommandGroup>
                      {PLANT_TYPES.map((type) => (
                        <CommandItem
                          key={type}
                          value={type}
                          onSelect={() => {
                            setPlantType(type);
                            setPlantTypeOpen(false);
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${plantType === type ? "opacity-100" : "opacity-0"}`} />
                          {capitalizeWords(type)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button 
              onClick={generator.generate}
              disabled={generator.isGenerating}
              data-testid="button-generate-plant"
              className="flex-1 sm:flex-none"
            >
              {generator.isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shuffle className="mr-2 h-4 w-4" />
              )}
              {generator.isGenerating ? 'Generating...' : 'Generate Plant'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentPlant && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{currentPlant.name}</CardTitle>
                <CardDescription className="text-base mt-1">
                  <em>{currentPlant.scientificName}</em> • {capitalizeWords(currentPlant.type)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={generator.copyToClipboard}
                        data-testid="button-copy-plant"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy to clipboard</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={generator.saveToCollection}
                        disabled={generator.isSaving || !currentPlant?.id || !notebookId}
                        data-testid="button-save-plant"
                      >
                        {generator.isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save to notebook</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{currentPlant.description}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Characteristics</h4>
              <div className="flex flex-wrap gap-2">
                {currentPlant.characteristics.map((char, idx) => (
                  <Badge key={idx} variant="secondary">{char}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Habitat</h4>
                <p className="text-muted-foreground">{currentPlant.habitat}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Blooming Season</h4>
                <p className="text-muted-foreground">{currentPlant.bloomingSeason}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Care Instructions</h4>
              <p className="text-muted-foreground">{currentPlant.careInstructions}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Hardiness Zone</h4>
              <p className="text-muted-foreground">{currentPlant.hardinessZone}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
