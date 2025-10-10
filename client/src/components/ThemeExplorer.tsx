import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, HelpCircle, Target, BookOpen, Copy, Heart, Loader2, Sparkles } from "lucide-react";
import type { Theme } from "@shared/schema";
import { useGenerator } from "@/hooks/useGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";

const genres = [
  { value: 'any', label: 'Any Genre' },
  { value: 'literary', label: 'Literary Fiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'sci-fi', label: 'Science Fiction' },
  { value: 'historical', label: 'Historical Fiction' },
  { value: 'contemporary', label: 'Contemporary Fiction' }
];

export default function ThemeExplorer() {
  const [genre, setGenre] = useState('any');
  const { user } = useAuth();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before exploring themes.'
  });

  const generator = useGenerator<Theme>({
    generateEndpoint: '/api/themes/generate',
    getGenerateParams: () => ({ genre, notebookId }),
    itemTypeName: 'theme',
    userId: user?.id ?? undefined,
    notebookId: notebookId ?? undefined,
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (theme) => `Theme: ${theme.title}

Genre: ${theme.genre || 'General'}

Description:
${theme.description}

Core Message:
${theme.coreMessage}

Symbolic Elements:
${theme.symbolicElements.join('\n')}

Key Questions:
${theme.questions.join('\n')}

Related Conflicts:
${theme.conflicts.join('\n')}

Literary Examples:
${theme.examples.join('\n')}`,
    invalidateOnSave: [['/api/saved-items']],
  });

  const generatedTheme = generator.result;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Theme Explorer</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover and develop meaningful themes for your narrative. Generate deep thematic elements that resonate with readers.
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generation Options</CardTitle>
          <CardDescription>
            Choose your preferred genre for thematic exploration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <label className="block text-sm font-medium mb-2">Genre</label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger data-testid="select-theme-genre">
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
        </CardContent>
      </Card>

      <div className="flex justify-center mb-8">
        <Button 
          onClick={generator.generate}
          disabled={generator.isGenerating}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-theme"
        >
          {generator.isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Exploring Themes...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Explore Themes
            </>
          )}
        </Button>
      </div>

      {generatedTheme && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2" data-testid="text-theme-title">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  {generatedTheme.title}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {generatedTheme.genre && (
                    <Badge variant="secondary">{generatedTheme.genre}</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground" data-testid="text-theme-description">
                {generatedTheme.description}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Core Message
              </h3>
              <p className="text-muted-foreground" data-testid="text-theme-core-message">
                {generatedTheme.coreMessage}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Symbolic Elements</h3>
              <div className="grid gap-2">
                {generatedTheme.symbolicElements.map((element: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-symbolic-element-${index}`}>{element}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Key Questions to Explore
              </h3>
              <div className="space-y-2">
                {generatedTheme.questions.map((question: string, index: number) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <p data-testid={`text-question-${index}`} className="italic">"{question}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Related Conflicts</h3>
              <div className="space-y-2">
                {generatedTheme.conflicts.map((conflict: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-conflict-${index}`}>{conflict}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Literary Examples
              </h3>
              <div className="space-y-2">
                {generatedTheme.examples.map((example: string, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p data-testid={`text-example-${index}`} className="text-sm text-muted-foreground">{example}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={generator.saveToCollection}
                disabled={generator.isSaving}
                variant="default"
                data-testid="button-save-theme"
              >
                {generator.isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Save Theme
                  </>
                )}
              </Button>
              
              <Button 
                onClick={generator.copyToClipboard}
                variant="outline"
                data-testid="button-copy-theme"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!generatedTheme && (
        <Card className="text-center py-12">
          <CardContent>
            <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Explore Themes</h3>
            <p className="text-muted-foreground">
              Choose your genre and click generate to discover meaningful themes for your story
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}