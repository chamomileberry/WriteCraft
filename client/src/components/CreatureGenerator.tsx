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
import { GENRE_CATEGORIES, CREATURE_TYPE_CATEGORIES } from "../../../server/genres";

// Now using backend data - imported from server/genres.ts

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
      const res = await apiRequest('POST', '/api/saved-items', {
        userId: null,
        itemType: 'creature',
        itemId: creature.id
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Creature Saved!",
        description: "Creature has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    },
    onError: (error) => {
      console.error('Failed to save creature:', error);
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
      const creatureText = `**${generatedCreature.name}**
      
**Type:** ${generatedCreature.creatureType}
**Size:** ${generatedCreature.size}
**Habitat:** ${generatedCreature.habitat}
**Temperament:** ${generatedCreature.temperament}

**Physical Description:**
${generatedCreature.physicalDescription}

**Behavior:**
${generatedCreature.behavior}

**Abilities:**
${generatedCreature.abilities.join(', ')}

**Weaknesses:**
${generatedCreature.weaknesses.join(', ')}`;

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
        <h1 className="text-4xl font-serif font-bold mb-4">Creature Generator</h1>
        <p className="text-muted-foreground text-lg">
          Create fantastical beasts and creatures for your stories
        </p>
      </div>

      {/* Generation Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rabbit className="h-5 w-5 text-primary" />
            Generate Creature
          </CardTitle>
          <CardDescription>
            Customize your creature by selecting preferences below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Genre Selection */}
          <div className="space-y-2">
            <Label>Genre (Optional)</Label>
            <Popover open={genreSearchOpen} onOpenChange={setGenreSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={genreSearchOpen}
                  className="w-full justify-between"
                  data-testid="button-genre-select"
                >
                  {selectedGenre ? selectedGenre : "Any Genre"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search genres..." data-testid="input-genre-search" />
                  <CommandList>
                    <CommandEmpty>No genre found.</CommandEmpty>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setSelectedGenre("");
                        setGenreSearchOpen(false);
                      }}
                      data-testid="option-any-genre"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${selectedGenre === "" ? "opacity-100" : "opacity-0"}`}
                      />
                      Any Genre
                    </CommandItem>
                    {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                      <CommandGroup key={category} heading={category}>
                        {genres.map((genre) => (
                          <CommandItem
                            key={genre}
                            value={genre}
                            onSelect={(currentValue) => {
                              setSelectedGenre(currentValue === selectedGenre ? "" : currentValue);
                              setGenreSearchOpen(false);
                            }}
                            data-testid={`option-genre-${genre}`}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedGenre === genre ? "opacity-100" : "opacity-0"}`}
                            />
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
            <Label>Creature Type (Optional)</Label>
            <Popover open={creatureTypeSearchOpen} onOpenChange={setCreatureTypeSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={creatureTypeSearchOpen}
                  className="w-full justify-between"
                  data-testid="button-creature-type-select"
                >
                  {selectedCreatureType ? selectedCreatureType : "Any Creature Type"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search creature types..." data-testid="input-creature-type-search" />
                  <CommandList>
                    <CommandEmpty>No creature type found.</CommandEmpty>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setSelectedCreatureType("");
                        setCreatureTypeSearchOpen(false);
                      }}
                      data-testid="option-any-creature-type"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${selectedCreatureType === "" ? "opacity-100" : "opacity-0"}`}
                      />
                      Any Creature Type
                    </CommandItem>
                    {Object.entries(CREATURE_TYPE_CATEGORIES).map(([category, types]) => (
                      <CommandGroup key={category} heading={category}>
                        {types.map((type) => (
                          <CommandItem
                            key={type}
                            value={type}
                            onSelect={(currentValue) => {
                              setSelectedCreatureType(currentValue === selectedCreatureType ? "" : currentValue);
                              setCreatureTypeSearchOpen(false);
                            }}
                            data-testid={`option-creature-type-${type}`}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedCreatureType === type ? "opacity-100" : "opacity-0"}`}
                            />
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

          <Button 
            onClick={handleGenerate} 
            disabled={generateMutation.isPending} 
            className="w-full" 
            size="lg"
            data-testid="button-generate-creature"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Creature
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Creature Display */}
      {generatedCreature && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Eye className="h-6 w-6 text-primary" />
                  {generatedCreature.name}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {generatedCreature.creatureType} • {generatedCreature.habitat}
                </CardDescription>
                <div className="flex gap-2 mt-3">
                  {generatedCreature.genre && (
                    <Badge variant="outline" data-testid="badge-genre">{generatedCreature.genre}</Badge>
                  )}
                  <Badge variant="secondary" data-testid="badge-size">{generatedCreature.size}</Badge>
                  <Badge variant="secondary" data-testid="badge-temperament">{generatedCreature.temperament}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  data-testid="button-copy-creature"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  data-testid="button-save-creature"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Habitat
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-habitat">
                  {generatedCreature.habitat}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Brain className="h-4 w-4 text-muted-foreground" />
                  Temperament
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-temperament">
                  {generatedCreature.temperament}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Size
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-size">
                  {generatedCreature.size}
                </p>
              </div>
            </div>

            <Separator />

            {/* Physical Description */}
            <div className="space-y-3">
              <h3 className="font-semibold">Physical Description</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-physical-description">
                {generatedCreature.physicalDescription}
              </p>
            </div>

            <Separator />

            {/* Behavior */}
            <div className="space-y-3">
              <h3 className="font-semibold">Behavior</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-behavior">
                {generatedCreature.behavior}
              </p>
            </div>

            <Separator />

            {/* Abilities and Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Abilities
                </h3>
                <div className="flex flex-wrap gap-2" data-testid="list-abilities">
                  {generatedCreature.abilities.map((ability, index) => (
                    <Badge key={index} variant="secondary">
                      {ability}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Weaknesses</h3>
                <div className="flex flex-wrap gap-2" data-testid="list-weaknesses">
                  {generatedCreature.weaknesses.map((weakness, index) => (
                    <Badge key={index} variant="outline">
                      {weakness}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}