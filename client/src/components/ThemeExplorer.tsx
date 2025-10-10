import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, HelpCircle, Target, BookOpen, Copy, Heart, Loader2 } from "lucide-react";
import type { Theme, Notebook } from "@shared/schema";
import { useGenerator } from "@/hooks/useGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useNotebookStore } from "@/stores/notebookStore";
import { useToast } from "@/hooks/use-toast";

const GENRE_CATEGORIES = {
  "Fiction": ['literary', 'fantasy', 'romance', 'thriller', 'sci-fi', 'historical', 'contemporary']
};

export default function ThemeExplorer() {
  const [genre, setGenre] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before exploring themes.'
  });
  const { notebooks, setNotebooks, setActiveNotebook } = useNotebookStore();

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
          <CardTitle>Theme Explorer</CardTitle>
          <CardDescription>
            Discover and develop meaningful themes for your narrative
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratorNotebookControls
            onQuickCreate={() => quickCreateMutation.mutate()}
          />
          
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2">Genre (Optional)</label>
              <SearchableSelect
                value={genre}
                onValueChange={setGenre}
                categorizedOptions={GENRE_CATEGORIES}
                placeholder="Any Genre"
                searchPlaceholder="Search genres..."
                emptyText="No genre found."
                testId="select-theme-genre"
                allowEmpty={true}
                emptyLabel="Any Genre"
                formatLabel={(value) => value}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={generator.generate}
              disabled={generator.isGenerating}
              data-testid="button-generate-theme"
            >
              {generator.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Explore Themes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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

    </div>
  );
}
