import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Leaf, Copy, Save, Shuffle, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GENRE_CATEGORIES } from "../../../server/genres";
import { useNotebookStore } from "@/stores/notebookStore";
import NotebookSwitcher from "./NotebookSwitcher";

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

// Now using backend data - imported from server/genres.ts
const ALL_GENRES = Object.values(GENRE_CATEGORIES).flat();

// Plant types from user's comprehensive list
const PLANT_TYPES = [
  "annual", "perennial", "aquatic plant", "bamboo", "bulb", "cactus", "succulent", 
  "climber", "conifer", "fern", "fruit", "herb", "houseplant", "orchid", 
  "ornamental grass", "palm", "rose", "shrub", "bush", "tree", "flower", 
  "fungi", "vegetable", "nut", "seed", "creeper", "moss", "flowering plant", 
  "gymnosperm", "angiosperm", "legume", "spice", "grass", "heather", "hedge", 
  "alpine", "carnivorous", "lichen"
];

export default function PlantGenerator() {
  const [currentPlant, setCurrentPlant] = useState<Plant | null>(null);
  const [genre, setGenre] = useState<string>("");
  const [plantType, setPlantType] = useState<string>("");
  const [genreOpen, setGenreOpen] = useState<boolean>(false);
  const [plantTypeOpen, setPlantTypeOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeNotebookId } = useNotebookStore();

  const generatePlantMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/plants/generate', {
        genre: (genre && genre !== 'any') ? genre : undefined,
        type: (plantType && plantType !== 'any') ? plantType : undefined,
        notebookId: activeNotebookId
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentPlant(data);
      console.log('Generated plant:', data);
      toast({
        title: "Plant generated!",
        description: "Your plant has been created and saved to your notebook.",
      });
      // Invalidate saved items to refresh the notebook
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    },
    onError: (error) => {
      console.error('Error generating plant:', error);
      toast({
        title: "Error",
        description: "Failed to generate plant. Please try again.",
        variant: "destructive"
      });
    }
  });

  const savePlantMutation = useMutation({
    mutationFn: async () => {
      if (!currentPlant?.id || !activeNotebookId) return;
      
      const response = await apiRequest('POST', '/api/saved-items', {
        userId: 'demo-user',
        notebookId: activeNotebookId,
        itemType: 'plant',
        itemId: currentPlant.id,
        itemData: currentPlant
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plant saved!",
        description: "Plant has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    },
    onError: (error) => {
      console.error('Error saving plant:', error);
      toast({
        title: "Error",
        description: "Failed to save plant. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generatePlant = () => {
    generatePlantMutation.mutate();
  };

  const copyPlant = () => {
    if (!currentPlant) return;
    
    const text = `**${currentPlant.name}** (${currentPlant.scientificName})
Type: ${currentPlant.type}

${currentPlant.description}

**Characteristics:** ${currentPlant.characteristics.join(', ')}
**Habitat:** ${currentPlant.habitat}
**Care Instructions:** ${currentPlant.careInstructions}
**Blooming Season:** ${currentPlant.bloomingSeason}
**Hardiness Zone:** ${currentPlant.hardinessZone}`;
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Plant copied!",
      description: "Plant information has been copied to your clipboard.",
    });
  };

  const savePlant = () => {
    if (!currentPlant) return;
    savePlantMutation.mutate();
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'annual': 'bg-chart-2/10 text-chart-2',
      'perennial': 'bg-chart-3/10 text-chart-3',
      'tree': 'bg-chart-4/10 text-chart-4',
      'shrub': 'bg-primary/10 text-primary',
      'herb': 'bg-secondary/10 text-secondary',
      'flower': 'bg-accent/10 text-accent',
    };
    return colors[type as keyof typeof colors] || 'bg-muted/10 text-muted-foreground';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Plant Generator
          </CardTitle>
          <CardDescription>
            Generate detailed plant descriptions for your stories with botanical accuracy and creative flair
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="pb-4 border-b">
            <NotebookSwitcher />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Popover open={genreOpen} onOpenChange={setGenreOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={genreOpen}
                  className="w-full justify-between"
                  data-testid="select-plant-genre"
                >
                  {genre
                    ? ALL_GENRES.find((g) => g === genre) || genre
                    : "Any genre"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search genres..." />
                  <CommandList>
                    <CommandEmpty>No genre found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setGenre("");
                          setGenreOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${genre === "" ? "opacity-100" : "opacity-0"}`}
                        />
                        Any Genre
                      </CommandItem>
                      {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {category}
                          </div>
                          {genres.map((genreOption) => (
                            <CommandItem
                              key={genreOption}
                              value={genreOption}
                              onSelect={(currentValue) => {
                                setGenre(currentValue === genre ? "" : currentValue);
                                setGenreOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${genre === genreOption ? "opacity-100" : "opacity-0"}`}
                              />
                              {genreOption}
                            </CommandItem>
                          ))}
                        </div>
                      ))}
                    </CommandGroup>
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
                  className="w-full justify-between"
                  data-testid="select-plant-type"
                >
                  {plantType
                    ? PLANT_TYPES.find((t) => t === plantType) || plantType
                    : "Any plant type"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search plant types..." />
                  <CommandList>
                    <CommandEmpty>No plant type found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setPlantType("");
                          setPlantTypeOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${plantType === "" ? "opacity-100" : "opacity-0"}`}
                        />
                        Any Plant Type
                      </CommandItem>
                      {PLANT_TYPES.map((typeOption) => (
                        <CommandItem
                          key={typeOption}
                          value={typeOption}
                          onSelect={(currentValue) => {
                            setPlantType(currentValue === plantType ? "" : currentValue);
                            setPlantTypeOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${plantType === typeOption ? "opacity-100" : "opacity-0"}`}
                          />
                          {typeOption}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={generatePlant}
              disabled={generatePlantMutation.isPending}
              data-testid="button-generate-plant"
              className="w-full"
            >
              {generatePlantMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shuffle className="mr-2 h-4 w-4" />
              )}
              {generatePlantMutation.isPending ? 'Generating...' : 'Generate Plant'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentPlant && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-semibold">{currentPlant.name}</h3>
                <p className="text-sm italic text-muted-foreground">{currentPlant.scientificName}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getTypeColor(currentPlant.type)}>
                    {currentPlant.type}
                  </Badge>
                  {currentPlant.genre && (
                    <Badge variant="outline">
                      {currentPlant.genre}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generatePlant}
                  disabled={generatePlantMutation.isPending}
                  data-testid="button-refresh-plant"
                >
                  {generatePlantMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shuffle className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={copyPlant} data-testid="button-copy-plant">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={savePlant}
                  disabled={savePlantMutation.isPending || !currentPlant?.id}
                  data-testid="button-save-plant"
                >
                  {savePlantMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-muted/30 p-6 rounded-lg border-l-4 border-primary">
                <p className="text-base leading-relaxed">{currentPlant.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                      Characteristics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentPlant.characteristics.map((char, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                      Habitat
                    </h4>
                    <p className="text-sm">{currentPlant.habitat}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                      Care Instructions
                    </h4>
                    <p className="text-sm">{currentPlant.careInstructions}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                        Blooming Season
                      </h4>
                      <p className="text-sm">{currentPlant.bloomingSeason}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                        Hardiness Zone
                      </h4>
                      <p className="text-sm">{currentPlant.hardinessZone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}