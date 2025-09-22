import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shuffle, Copy, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

// Removed local data arrays - now using backend API

// Genre categories with comprehensive list
const GENRE_CATEGORIES = {
  "General Fiction": ["fiction", "drama", "literary fiction", "political fiction", "musical fiction", "sports fiction", "suspense fiction"],
  "Science Fiction": ["science fiction", "cyberpunk", "dystopian", "post-apocalyptic", "steampunk", "dieselpunk", "nanopunk", "solarpunk", "atompunk", "clockpunk", "postcyberpunk", "utopian", "comedy sci-fi", "feminist sci-fi", "gothic sci-fi", "climate fiction", "parallel world sci-fi", "libertarian sci-fi", "mecha sci-fi", "military sci-fi", "social sci-fi", "anthropological sci-fi", "space opera", "space western", "subterranean sci-fi", "tech noir", "alien invasion", "scientific romance", "dying earth", "quantum fiction"],
  "Fantasy": ["fantasy", "contemporary fantasy", "cozy fantasy", "dark fantasy", "high fantasy", "fantasy comedy", "gothic fantasy", "historical fantasy", "low fantasy", "mythpunk", "mythic fantasy", "mythopoeia", "magic realism", "romantic fantasy", "science fantasy", "supernatural fantasy", "heroic fantasy", "portal fantasy", "medieval fantasy", "prehistoric fantasy"],
  "Horror": ["horror", "comedy horror", "gothic horror", "zombie horror", "dark romanticism", "cosmic horror", "werewolf fiction", "vampire literature", "psychological horror", "techno-horror", "apocalyptic", "zombie apocalypse", "monster literature", "weird fiction"],
  "Mystery & Crime": ["mystery", "crime fiction", "detective", "historical mystery", "noir", "cozy mystery", "legal thriller", "caper", "spy fiction"],
  "Thriller": ["thriller", "psychological thriller", "techno-thriller", "political thriller"],
  "Romance": ["romance", "paranormal romance", "contemporary romance", "medical romance", "thriller romance", "historical romance", "inspirational romance", "romantic suspense", "western romance", "young adult romance", "chivalric romance"],
  "Western": ["western", "horror western", "science fiction western", "weird western", "fantasy western"],
  "Young Adult & New Adult": ["young adult", "new adult"],
  "Historical": ["historical fiction", "prehistoric fiction", "medieval fiction"],
  "Comedy": ["comedy", "tragic comedy", "burlesque"],
  "Drama": ["tragedy", "melodrama"],
  "Superhero": ["superhero fantasy", "cape punk", "heroic noir"],
  "Speculative & Experimental": ["xenofiction", "alternative history", "slipstream", "postmodern", "conte", "pulp fiction"],
  "Action & Adventure": ["action-adventure", "nautical"]
};

const GENDER_IDENTITIES = [
  "male", "female", "non-binary", "agender", "bigender", "genderfluid", 
  "genderqueer", "transgender", "intersex", "pangender", "demigender", 
  "androgynous", "omnigender", "polygender"
];

export default function CharacterGenerator() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [genre, setGenre] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateCharacterMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/characters/generate', {
        genre: genre || undefined,
        gender: gender || undefined,
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
        userId: 'guest', // For now, using guest user
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
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
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
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="sm:w-48" data-testid="select-genre">
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent className="h-60">
                {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                  <div key={category}>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">{category}</div>
                    {genres.map((genreOption) => (
                      <SelectItem key={genreOption} value={genreOption}>
                        {genreOption.charAt(0).toUpperCase() + genreOption.slice(1)}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>

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
                    <Save className="h-4 w-4" />
                  )}
                </Button>
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