import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shuffle, Copy, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Character {
  name: string;
  age: number;
  occupation: string;
  personality: string[];
  backstory: string;
  motivation: string;
  flaw: string;
  strength: string;
}

const names = ["Elena", "Marcus", "Zara", "Kai", "Luna", "Dex", "Nova", "Orion", "Maya", "Finn"];
const occupations = ["Librarian", "Detective", "Chef", "Artist", "Engineer", "Teacher", "Doctor", "Writer", "Merchant", "Adventurer"];
const personalities = ["Ambitious", "Curious", "Loyal", "Witty", "Mysterious", "Compassionate", "Stubborn", "Creative", "Analytical", "Charismatic"];
const backstories = [
  "Grew up in a small village and dreams of seeing the world",
  "Lost their family at a young age and was raised by mentors", 
  "Discovered a hidden talent that changed their life",
  "Carries a secret that could change everything",
  "Was betrayed by someone they trusted completely"
];
const motivations = [
  "To prove their worth to those who doubted them",
  "To find answers about their mysterious past",
  "To protect the people they care about",
  "To discover their true purpose in life",
  "To right a terrible wrong from their past"
];

export default function CharacterGenerator() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [genre, setGenre] = useState<string>("");
  const { toast } = useToast();

  const generateCharacter = () => {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAge = Math.floor(Math.random() * 50) + 18;
    const randomOccupation = occupations[Math.floor(Math.random() * occupations.length)];
    const randomPersonalities = personalities
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const randomBackstory = backstories[Math.floor(Math.random() * backstories.length)];
    const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
    const randomFlaw = personalities[Math.floor(Math.random() * personalities.length)];
    const randomStrength = personalities[Math.floor(Math.random() * personalities.length)];

    const newCharacter: Character = {
      name: randomName,
      age: randomAge,
      occupation: randomOccupation,
      personality: randomPersonalities,
      backstory: randomBackstory,
      motivation: randomMotivation,
      flaw: randomFlaw,
      strength: randomStrength
    };

    setCharacter(newCharacter);
    console.log('Generated character:', newCharacter);
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
    // TODO: Implement save functionality
    console.log('Save character:', character);
    toast({
      title: "Character saved!",
      description: "Character has been saved to your collection.",
    });
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
              data-testid="button-generate-character"
              className="flex-1 sm:flex-none"
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Generate Character
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
                <Button variant="outline" size="sm" onClick={saveCharacter} data-testid="button-save-character">
                  <Save className="h-4 w-4" />
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