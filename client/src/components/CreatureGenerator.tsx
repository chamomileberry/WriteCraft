import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Label } from "@/components/ui/label";
import { Rabbit, MapPin, Eye, Zap, Heart, Copy, Loader2, Sparkles, Brain, Globe } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNotebookStore } from "@/stores/notebookStore";
import type { Creature } from "@shared/schema";
import { GENRE_CATEGORIES, CREATURE_TYPE_CATEGORIES } from "@shared/genres";

// Now using backend data - imported from shared/genres.ts

export default function CreatureGenerator() {
  const [generatedCreature, setGeneratedCreature] = useState<Creature | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedCreatureType, setSelectedCreatureType] = useState<string>("");
  const { toast } = useToast();
  const { activeNotebookId } = useNotebookStore();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/creatures/generate', {
        genre: selectedGenre && selectedGenre !== "any" ? selectedGenre : undefined,
        creatureType: selectedCreatureType && selectedCreatureType !== "any" ? selectedCreatureType : undefined,
        notebookId: activeNotebookId || null
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
        userId: 'guest', // Use guest user for consistency 
        itemType: 'creature',
        itemId: creature.id,
        itemData: creature // Include the complete creature data
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
    if (!activeNotebookId) {
      toast({
        title: "No Notebook Selected",
        description: "Please create or select a notebook before generating creatures.",
        variant: "destructive"
      });
      return;
    }
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
**Habitat:** ${generatedCreature.habitat}

**Physical Description:**
${generatedCreature.physicalDescription}

**Behavior:**
${generatedCreature.behavior}

**Abilities:**
${generatedCreature.abilities.join(', ')}

**Cultural Significance:**
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
            <SearchableSelect
              value={selectedGenre}
              onValueChange={setSelectedGenre}
              categorizedOptions={GENRE_CATEGORIES}
              placeholder="Any Genre"
              searchPlaceholder="Search genres..."
              emptyText="No genre found."
              className="w-full justify-between"
              testId="button-genre-select"
              allowEmpty={true}
              emptyLabel="Any Genre"
              formatLabel={(value) => value}
            />
          </div>

          {/* Creature Type Selection */}
          <div className="space-y-2">
            <Label>Creature Type (Optional)</Label>
            <SearchableSelect
              value={selectedCreatureType}
              onValueChange={setSelectedCreatureType}
              categorizedOptions={CREATURE_TYPE_CATEGORIES}
              placeholder="Any Creature Type"
              searchPlaceholder="Search creature types..."
              emptyText="No creature type found."
              className="w-full justify-between"
              testId="button-creature-type-select"
              allowEmpty={true}
              emptyLabel="Any Creature Type"
              formatLabel={(value) => value}
            />
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
                  <Badge variant="secondary" data-testid="badge-type">{generatedCreature.creatureType}</Badge>
                  <Badge variant="secondary" data-testid="badge-habitat">{generatedCreature.habitat}</Badge>
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
                  {generatedCreature.behavior}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Size
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-size">
                  {generatedCreature.creatureType}
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

            {/* Abilities and Cultural Significance */}
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
                <h3 className="font-semibold">Cultural Significance</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-cultural-significance">
                  {generatedCreature.culturalSignificance}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}