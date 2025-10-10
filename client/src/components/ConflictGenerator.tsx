import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Target, AlertTriangle, Users, Copy, Heart, Loader2, Sparkles } from "lucide-react";
import type { Conflict } from "@shared/schema";
import { useGenerator } from "@/hooks/useGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";

const conflictTypes = [
  { value: 'internal', label: 'Internal Conflict' },
  { value: 'external', label: 'External Conflict' },
  { value: 'interpersonal', label: 'Interpersonal Conflict' },
  { value: 'societal', label: 'Societal Conflict' }
];

const genres = [
  { value: 'any', label: 'Any Genre' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'drama', label: 'Drama' },
  { value: 'sci-fi', label: 'Science Fiction' }
];

export default function ConflictGenerator() {
  const [conflictType, setConflictType] = useState('any');
  const [genre, setGenre] = useState('any');
  const { user } = useAuth();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before generating conflicts.'
  });

  const generator = useGenerator<Conflict>({
    generateEndpoint: '/api/conflicts/generate',
    getGenerateParams: () => ({ conflictType, genre, notebookId }),
    itemTypeName: 'conflict',
    userId: user?.id ?? undefined,
    notebookId: notebookId ?? undefined,
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (conflict) => `Conflict: ${conflict.title}

Type: ${conflict.type}
Genre: ${conflict.genre || 'General'}

Description:
${conflict.description}

Stakes:
${conflict.stakes}

Emotional Impact:
${conflict.emotionalImpact}

Obstacles:
${conflict.obstacles.join('\n')}

Potential Resolutions:
${conflict.potentialResolutions.join('\n')}`,
    invalidateOnSave: [['/api/saved-items']],
  });

  const generatedConflict = generator.result;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Conflict Generator</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create engaging conflicts and obstacles for your story. Generate compelling tension that drives your narrative forward.
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generation Options</CardTitle>
          <CardDescription>
            Customize your conflict generation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Conflict Type</label>
              <Select value={conflictType} onValueChange={setConflictType}>
                <SelectTrigger data-testid="select-conflict-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Type</SelectItem>
                  {conflictTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger data-testid="select-genre">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre.value} value={genre.value}>
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mb-8">
        <Button 
          onClick={generator.generate}
          disabled={generator.isGenerating}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-conflict"
        >
          {generator.isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Conflict...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Conflict
            </>
          )}
        </Button>
      </div>

      {generatedConflict && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2" data-testid="text-conflict-title">
                  <Target className="h-6 w-6 text-primary" />
                  {generatedConflict.title}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{generatedConflict.type}</Badge>
                    {generatedConflict.genre && (
                      <Badge variant="secondary">{generatedConflict.genre}</Badge>
                    )}
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.copyToClipboard}
                  data-testid="button-copy-conflict"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.saveToCollection}
                  disabled={generator.isSaving || !generatedConflict?.id}
                  data-testid="button-save-conflict"
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
              <h4 className="font-semibold mb-2 text-lg">Description</h4>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-conflict-description">
                {generatedConflict.description}
              </p>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Stakes
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {generatedConflict.stakes}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-chart-3" />
                  Emotional Impact
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {generatedConflict.emotionalImpact}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">Obstacles</h4>
              <ul className="space-y-2">
                {generatedConflict.obstacles.map((obstacle, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span className="text-muted-foreground flex-1">{obstacle}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">Potential Resolutions</h4>
              <ul className="space-y-2">
                {generatedConflict.potentialResolutions.map((resolution, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-chart-4 mt-1.5">→</span>
                    <span className="text-muted-foreground flex-1">{resolution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
