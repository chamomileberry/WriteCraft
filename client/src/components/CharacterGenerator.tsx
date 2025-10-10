import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Separator } from "@/components/ui/separator";
import { Shuffle, Copy, Heart, Loader2, Edit } from "lucide-react";
import { GENRE_CATEGORIES, GENDER_IDENTITIES, ETHNICITY_CATEGORIES } from "@shared/genres";
import { type Character, type Notebook } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useGenerator } from "@/hooks/useGenerator";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useNotebookStore } from "@/stores/notebookStore";
import { useToast } from "@/hooks/use-toast";

export default function CharacterGenerator() {
  const [genre, setGenre] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [ethnicity, setEthnicity] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before generating characters.'
  });
  const { notebooks, setNotebooks, setActiveNotebook } = useNotebookStore();

  const generator = useGenerator<Character>({
    generateEndpoint: '/api/characters/generate',
    getGenerateParams: () => ({
      genre: genre || undefined,
      gender: gender || undefined,
      ethnicity: ethnicity || undefined,
      userId: null,
      notebookId
    }),
    itemTypeName: 'character',
    userId: user?.id ?? undefined,
    notebookId: notebookId ?? undefined,
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (character) => {
      const fullName = [character.givenName, character.familyName].filter(Boolean).join(' ') || 'Unnamed Character';
      return `**${fullName}** (Age: ${character.age})
**Occupation:** ${character.occupation}
**Personality:** ${character.personality?.join(', ') || 'None specified'}
**Backstory:** ${character.backstory}
**Motivation:** ${character.motivation}
**Strength:** ${character.strength}
**Flaw:** ${character.flaw}`;
    },
    prepareSavePayload: (character) => ({
      userId: user?.id ?? undefined,
      itemType: 'character',
      itemId: character.id,
      notebookId,
      itemData: {
        givenName: character.givenName || '',
        familyName: character.familyName || '',
        age: character.age,
        occupation: character.occupation,
        personality: character.personality,
        backstory: character.backstory,
        motivation: character.motivation,
        flaw: character.flaw,
        strength: character.strength,
        gender: character.gender
      }
    }),
    invalidateOnSave: [['/api/saved-items', user?.id ?? undefined]],
    onGenerateSuccess: (data) => {
      console.log('Generated character:', data);
    },
  });

  const character = generator.result;

  // Quick create mutation
  const quickCreateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/notebooks', {
        name: 'Untitled Notebook',
        description: ''
      });
      const data = await response.json();
      return data as Notebook;
    },
    onSuccess: (newNotebook: Notebook) => {
      setNotebooks([...notebooks, newNotebook]);
      setActiveNotebook(newNotebook.id);
      toast({
        title: "Notebook Created",
        description: "Your new notebook is ready to use.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create notebook. Please try again.",
        variant: "destructive",
      });
    },
  });

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
          <GeneratorNotebookControls
            onQuickCreate={() => quickCreateMutation.mutate()}
            quickCreateLabel="Create Notebook"
            quickCreateTestId="button-quick-create-notebook"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchableSelect
              value={genre}
              onValueChange={setGenre}
              categorizedOptions={GENRE_CATEGORIES}
              placeholder="Select genre..."
              searchPlaceholder="Search genres..."
              emptyText="No genre found."
              className="sm:w-48 justify-between"
              testId="select-genre"
            />

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

            <SearchableSelect
              value={ethnicity}
              onValueChange={setEthnicity}
              categorizedOptions={ETHNICITY_CATEGORIES}
              placeholder="Select ethnicity..."
              searchPlaceholder="Search ethnicities..."
              emptyText="No ethnicity found."
              className="sm:w-48 justify-between"
              testId="select-ethnicity"
              formatLabel={(value) => value}
            />
            
            <Button 
              onClick={generator.generate}
              disabled={generator.isGenerating}
              data-testid="button-generate-character"
              className="flex-1 sm:flex-none"
            >
              {generator.isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shuffle className="mr-2 h-4 w-4" />
              )}
              {generator.isGenerating ? 'Generating...' : 'Generate Character'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {character && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {[character.givenName, character.familyName].filter(Boolean).join(' ') || 'Unnamed Character'}
                </CardTitle>
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
                <Button variant="outline" size="sm" onClick={generator.copyToClipboard} data-testid="button-copy-character">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.saveToCollection} 
                  disabled={generator.isSaving || !character?.id}
                  data-testid="button-save-character"
                >
                  {generator.isSaving ? (
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
                {character.personality?.map((trait, index) => (
                  <Badge key={index} variant="secondary">{trait}</Badge>
                )) || <span className="text-muted-foreground">No personality traits specified</span>}
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
