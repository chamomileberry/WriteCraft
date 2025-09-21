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
  genre?: string | null;
  userId?: string | null;
  createdAt?: string;
}

// Removed local data arrays - now using backend API

export default function CharacterGenerator() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [genre, setGenre] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateCharacterMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/characters/generate', {
        genre: genre || undefined,
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
              <SelectContent>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="sci-fi">Science Fiction</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="thriller">Thriller</SelectItem>
                <SelectItem value="contemporary">Contemporary</SelectItem>
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
                <CardDescription>Age {character.age} • {character.occupation}</CardDescription>
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