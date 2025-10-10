import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Label } from "@/components/ui/label";
import { Rabbit, MapPin, Eye, Zap, Heart, Copy, Loader2, Sparkles, Brain, Globe } from "lucide-react";
import type { Creature } from "@shared/schema";
import { GENRE_CATEGORIES, CREATURE_TYPE_CATEGORIES } from "@shared/genres";
import { useGenerator } from "@/hooks/useGenerator";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { useAuth } from "@/hooks/useAuth";

export default function CreatureGenerator() {
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedCreatureType, setSelectedCreatureType] = useState<string>("");
  const { user } = useAuth();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before generating creatures.'
  });

  const generator = useGenerator<Creature>({
    generateEndpoint: '/api/creatures/generate',
    getGenerateParams: () => ({
      genre: selectedGenre && selectedGenre !== "any" ? selectedGenre : undefined,
      creatureType: selectedCreatureType && selectedCreatureType !== "any" ? selectedCreatureType : undefined,
      notebookId: notebookId || undefined
    }),
    itemTypeName: 'creature',
    userId: user?.id,
    notebookId: notebookId || undefined,
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (creature) => `**${creature.name}**
      
**Type:** ${creature.creatureType}
**Habitat:** ${creature.habitat}

**Physical Description:**
${creature.physicalDescription}

**Behavior:**
${creature.behavior}

**Abilities:**
${creature.abilities.join(', ')}

**Cultural Significance:**
${creature.culturalSignificance}`,
    invalidateOnSave: [['/api/saved-items']],
  });

  const generatedCreature = generator.result;

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
            onClick={generator.generate} 
            disabled={generator.isGenerating} 
            className="w-full" 
            size="lg"
            data-testid="button-generate-creature"
          >
            {generator.isGenerating ? (
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="gap-1">
                      <Globe className="h-3 w-3" />
                      {generatedCreature.creatureType}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {generatedCreature.habitat}
                    </Badge>
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.copyToClipboard}
                  data-testid="button-copy-creature"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.saveToCollection}
                  disabled={generator.isSaving || !generatedCreature?.id}
                  data-testid="button-save-creature"
                >
                  {generator.isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 text-lg flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Physical Description
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {generatedCreature.physicalDescription}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 text-lg flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Behavior
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {generatedCreature.behavior}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Abilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedCreature.abilities.map((ability, idx) => (
                  <Badge key={idx} variant="secondary">
                    {ability}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 text-lg">Cultural Significance</h4>
              <p className="text-muted-foreground leading-relaxed">
                {generatedCreature.culturalSignificance}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
