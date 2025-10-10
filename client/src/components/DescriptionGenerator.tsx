import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { FileText, Copy, Heart, Loader2, Sparkles } from "lucide-react";
import type { Description } from "@shared/schema";
import { GENRE_CATEGORIES } from "@shared/genres";
import { useGenerator } from "@/hooks/useGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";

const DESCRIPTION_TYPE_CATEGORIES = {
  "Equipment & Gear": [
    'armour',
    'weapon',
    'clothing',
    'uniform',
    'wand',
    'item',
    'material'
  ],
  "Medical & Health": [
    'disease',
    'illness',
    'condition',
    'ailment',
    'poison',
    'potion',
    'mental_health'
  ],
  "Environment & Atmosphere": [
    'atmospheric',
    'climate',
    'weather',
    'storm'
  ],
  "Culture & Society": [
    'holiday',
    'tradition',
    'ritual',
    'religion',
    'society',
    'law'
  ],
  "Combat & Skills": [
    'martial_art',
    'spell'
  ],
  "Emotional & Psychological": [
    'dying',
    'pain',
    'tragedy',
    'trauma',
    'hysteria'
  ],
  "Mystical & Prophetic": [
    'prophecy'
  ],
  "Food & Consumables": [
    'food',
    'drink'
  ],
  "Literature & Media": [
    'book'
  ]
};

const DESCRIPTION_TYPE_LABELS: Record<string, string> = {
  'armour': 'Armour Description',
  'weapon': 'Weapon Description',
  'clothing': 'Clothing Description',
  'uniform': 'Uniform Description',
  'wand': 'Wand Description',
  'item': 'Item Description',
  'material': 'Material Description',
  'disease': 'Disease Description',
  'illness': 'Illness Description',
  'condition': 'Condition Description',
  'ailment': 'Ailment Description',
  'poison': 'Poison Description',
  'potion': 'Potion Description',
  'mental_health': 'Mental Health Description',
  'atmospheric': 'Atmospheric Description',
  'climate': 'Climate Description',
  'weather': 'Weather Description',
  'storm': 'Storm Description',
  'holiday': 'Holiday Description',
  'tradition': 'Tradition Description',
  'ritual': 'Ritual Description',
  'religion': 'Religion Description',
  'society': 'Society Description',
  'law': 'Law Description',
  'martial_art': 'Martial Art Description',
  'spell': 'Spell Description',
  'dying': 'Dying Description',
  'pain': 'Pain Description',
  'tragedy': 'Tragedy Description',
  'trauma': 'Trauma Description',
  'hysteria': 'Hysteria Description',
  'prophecy': 'Prophecy Description',
  'food': 'Food Description',
  'drink': 'Drink Description',
  'book': 'Book Description'
};

export default function DescriptionGenerator() {
  const [descriptionType, setDescriptionType] = useState('armour');
  const [genre, setGenre] = useState('');
  const { user } = useAuth();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before generating descriptions.'
  });

  const generator = useGenerator<Description>({
    generateEndpoint: '/api/descriptions/generate',
    getGenerateParams: () => ({ 
      descriptionType, 
      genre: genre || undefined,
      notebookId
    }),
    itemTypeName: 'description',
    userId: user?.id ?? undefined,
    notebookId: notebookId ?? undefined,
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (desc) => `**${desc.title}**

Type: ${desc.descriptionType}
Genre: ${desc.genre || 'General'}

${desc.content}

Tags: ${desc.tags.join(', ')}`,
    invalidateOnSave: [['/api/saved-items']],
  });

  const generatedDescription = generator.result;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4">Description Generator</h1>
        <p className="text-muted-foreground text-lg">
          Create vivid and detailed descriptions for your world
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Description
          </CardTitle>
          <CardDescription>
            Select a type and genre to generate a detailed description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GeneratorNotebookControls />
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description Type</label>
              <SearchableSelect
                value={descriptionType}
                onValueChange={setDescriptionType}
                categorizedOptions={DESCRIPTION_TYPE_CATEGORIES}
                placeholder="Select description type"
                searchPlaceholder="Search types..."
                emptyText="No type found."
                className="w-full justify-between"
                testId="button-description-type-select"
                formatLabel={(value) => DESCRIPTION_TYPE_LABELS[value] || value}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Genre (Optional)</label>
              <SearchableSelect
                value={genre}
                onValueChange={setGenre}
                categorizedOptions={GENRE_CATEGORIES}
                placeholder="Any genre"
                searchPlaceholder="Search genres..."
                emptyText="No genre found."
                className="w-full justify-between"
                testId="button-genre-select"
                allowEmpty={true}
                emptyLabel="Any genre"
                formatLabel={(value) => value}
              />
            </div>
          </div>

          <Button 
            onClick={generator.generate}
            disabled={generator.isGenerating}
            className="w-full"
            size="lg"
            data-testid="button-generate-description"
          >
            {generator.isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Description
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedDescription && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl" data-testid="text-description-title">
                  {generatedDescription.title}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{generatedDescription.descriptionType}</Badge>
                    {generatedDescription.genre && (
                      <Badge variant="secondary">{generatedDescription.genre}</Badge>
                    )}
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.copyToClipboard}
                  data-testid="button-copy-description"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.saveToCollection}
                  disabled={generator.isSaving || !generatedDescription?.id}
                  data-testid="button-save-description"
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
              <h4 className="font-semibold mb-2 text-lg">Content</h4>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-description-content">
                {generatedDescription.content}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {generatedDescription.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
