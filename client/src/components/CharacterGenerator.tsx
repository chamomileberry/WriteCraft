import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Shuffle, Copy, Heart, Loader2, Check, ChevronsUpDown, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GENRE_CATEGORIES, GENDER_IDENTITIES, ETHNICITY_CATEGORIES } from "../../../server/genres";

interface Character {
  id?: string;
  name: string;
  age: number;
  occupation: string;
  personality: string[];
  backstory: string;
  motivation: string;
  flaw: string;
  strength: string;
  gender?: string | null;
  genre?: string | null;
  userId?: string | null;
  createdAt?: string;
}

// Now using backend data - imported from server/genres.ts

export default function CharacterGenerator() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [genre, setGenre] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [ethnicity, setEthnicity] = useState<string>("");
  const [genreSearchOpen, setGenreSearchOpen] = useState(false);
  const [ethnicitySearchOpen, setEthnicitySearchOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateCharacterMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/characters/generate', {
        genre: genre || undefined,
        gender: gender || undefined,
        ethnicity: ethnicity || undefined,
        userId: null // For now, no user authentication
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCharacter(data);
      console.log('Generated character:', data);
    },
    onError: (error) => {
      console.error('Error generating character:', error);
      toast({
        title: "Error",
        description: "Failed to generate character. Please try again.",
        variant: "destructive"
      });
    }
  });

  const saveCharacterMutation = useMutation({
    mutationFn: async () => {
      if (!character?.id) return;
      
      const response = await apiRequest('POST', '/api/saved-items', {
        userId: null, // Use null for guest users (no authentication)
        itemType: 'character',
        itemId: character.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Character saved!",
        description: "Character has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', 'guest'] });
    },
    onError: (error) => {
      console.error('Error saving character:', error);
      toast({
        title: "Error",
        description: "Failed to save character. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generateCharacter = () => {
    generateCharacterMutation.mutate();
  };

  const copyCharacter = () => {
    if (!character) return;
    
    const text = `**${character.name}** (Age: ${character.age})
**Occupation:** ${character.occupation}
**Personality:** ${character.personality.join(', ')}
**Backstory:** ${character.backstory}
**Motivation:** ${character.motivation}
**Strength:** ${character.strength}
**Flaw:** ${character.flaw}`;
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Character copied!",
      description: "Character details have been copied to your clipboard.",
    });
  };

  const saveCharacter = () => {
    if (!character) return;
    saveCharacterMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-primary" />
            Character Generator
          </CardTitle>
          <CardDescription>
            Create unique, detailed characters with rich backstories and motivations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Popover open={genreSearchOpen} onOpenChange={setGenreSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={genreSearchOpen}
                  className="sm:w-48 justify-between"
                  data-testid="select-genre"
                >
                  {genre ? genre.charAt(0).toUpperCase() + genre.slice(1) : "Select genre..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search genres..." />
                  <CommandList className="max-h-60">
                    <CommandEmpty>No genre found.</CommandEmpty>
                    {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                      <CommandGroup key={category} heading={category}>
                        {genres.map((genreOption) => (
                          <CommandItem
                            key={genreOption}
                            value={genreOption}
                            onSelect={() => {
                              setGenre(genreOption);
                              setGenreSearchOpen(false);
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${genre === genreOption ? "opacity-100" : "opacity-0"}`} />
                            {genreOption.charAt(0).toUpperCase() + genreOption.slice(1)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="sm:w-48" data-testid="select-gender">
                <SelectValue placeholder="Select gender identity" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_IDENTITIES.map((genderOption) => (
                  <SelectItem key={genderOption} value={genderOption}>
                    {genderOption.charAt(0).toUpperCase() + genderOption.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={ethnicitySearchOpen} onOpenChange={setEthnicitySearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={ethnicitySearchOpen}
                  className="sm:w-48 justify-between"
                  data-testid="select-ethnicity"
                >
                  {ethnicity ? ethnicity : "Select ethnicity..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search ethnicities..." />
                  <CommandList className="max-h-60">
                    <CommandEmpty>No ethnicity found.</CommandEmpty>
                    {Object.entries(ETHNICITY_CATEGORIES).map(([category, ethnicities]) => (
                      <CommandGroup key={category} heading={category}>
                        {ethnicities.map((ethnicityOption) => (
                          <CommandItem
                            key={ethnicityOption}
                            value={ethnicityOption}
                            onSelect={() => {
                              setEthnicity(ethnicityOption);
                              setEthnicitySearchOpen(false);
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${ethnicity === ethnicityOption ? "opacity-100" : "opacity-0"}`} />
                            {ethnicityOption}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={generateCharacter}
              disabled={generateCharacterMutation.isPending}
              data-testid="button-generate-character"
              className="flex-1 sm:flex-none"
            >
              {generateCharacterMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shuffle className="mr-2 h-4 w-4" />
              )}
              {generateCharacterMutation.isPending ? 'Generating...' : 'Generate Character'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {character && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{character.name}</CardTitle>
                <CardDescription>
                  Age {character.age} • {character.occupation}
                  {character.gender && (
                    <span className="ml-2 text-xs px-2 py-1 bg-secondary rounded-full">
                      {character.gender.charAt(0).toUpperCase() + character.gender.slice(1)}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyCharacter} data-testid="button-copy-character">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={saveCharacter} 
                  disabled={saveCharacterMutation.isPending || !character?.id}
                  data-testid="button-save-character"
                >
                  {saveCharacterMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                </Button>
                {character?.id && (
                  <Button variant="outline" size="sm" asChild data-testid="button-edit-character">
                    <Link href={`/characters/${character.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Personality Traits</h4>
              <div className="flex flex-wrap gap-2">
                {character.personality.map((trait, index) => (
                  <Badge key={index} variant="secondary">{trait}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Backstory</h4>
              <p className="text-muted-foreground">{character.backstory}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Core Motivation</h4>
              <p className="text-muted-foreground">{character.motivation}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-chart-4">Greatest Strength</h4>
                <p className="text-muted-foreground">{character.strength}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-destructive">Fatal Flaw</h4>
                <p className="text-muted-foreground">{character.flaw}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}