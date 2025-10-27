import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Separator } from "@/components/ui/separator";
import { Zap, Copy, RefreshCw, Heart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GENRE_CATEGORIES } from "@shared/genres";
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";
import { useAuth } from "@/hooks/useAuth";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";

interface WritingPrompt {
  id?: string;
  text: string;
  genre: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Story Starter' | 'Character Focus' | 'Dialogue' | 'Setting' | 'Conflict';
  wordCount: string;
  tags: string[];
  userId?: string | null;
  createdAt?: string;
}

const PROMPT_TYPE_CATEGORIES = {
  "Prompt Types": ['Story Starter', 'Character Focus', 'Dialogue', 'Setting', 'Conflict']
};

export default function WritingPrompts() {
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const [genre, setGenre] = useState<string>("");
  const [promptType, setPromptType] = useState<string>("");
  const [savedPrompts, setSavedPrompts] = useState<WritingPrompt[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before generating prompts.'
  });

  const generatePromptMutation = useMutation({
    mutationFn: async () => {
      const validationError = validateNotebook();
      if (validationError) {
        throw new Error(validationError);
      }
      
      const response = await apiRequest('POST', '/api/prompts/generate', {
        genre: (genre && genre !== 'any') ? genre : undefined,
        type: (promptType && promptType !== 'any') ? promptType : undefined,
        userId: user?.id,
        notebookId
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentPrompt(data);
      console.log('Generated prompt:', data);
    },
    onError: (error) => {
      console.error('Error generating prompt:', error);
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive"
      });
    }
  });

  const savePromptMutation = useMutation({
    mutationFn: async () => {
      if (!currentPrompt?.id) return;
      
      const response = await apiRequest('POST', '/api/saved-items', {
        userId: user?.id,
        itemType: 'prompt',
        itemId: currentPrompt.id,
        itemData: currentPrompt,
        notebookId
      });
      return response.json();
    },
    onSuccess: () => {
      if (currentPrompt) {
        setSavedPrompts(prev => {
          const updated = [currentPrompt, ...prev].slice(0, 10);
          return updated;
        });
      }
      
      toast({
        title: "Prompt saved!",
        description: "Writing prompt has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    },
    onError: (error) => {
      console.error('Error saving prompt:', error);
      toast({
        title: "Error",
        description: "Failed to save prompt. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    generatePromptMutation.mutate();
  };

  const copyPrompt = () => {
    if (!currentPrompt) return;
    
    const text = `**Writing Prompt** (${currentPrompt.genre} - ${currentPrompt.type})

${currentPrompt.text}

**Target Length:** ${currentPrompt.wordCount}
**Difficulty:** ${currentPrompt.difficulty}`;
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Prompt copied!",
      description: "Writing prompt has been copied to your clipboard.",
    });
  };

  const savePrompt = () => {
    if (!currentPrompt) return;
    savePromptMutation.mutate();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-chart-4/10 text-chart-4';
      case 'Medium': return 'bg-chart-3/10 text-chart-3';
      case 'Hard': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted';
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Story Starter': 'bg-primary/10 text-primary',
      'Character Focus': 'bg-chart-2/10 text-chart-2',
      'Dialogue': 'bg-chart-3/10 text-chart-3',
      'Setting': 'bg-chart-4/10 text-chart-4',
      'Conflict': 'bg-destructive/10 text-destructive'
    };
    return colors[type as keyof typeof colors] || 'bg-muted';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Writing Prompt Generator</CardTitle>
          <CardDescription>
            Get inspired with creative writing prompts tailored to your preferred genre and style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratorNotebookControls />
          
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <SearchableSelect
                value={genre}
                onValueChange={setGenre}
                categorizedOptions={GENRE_CATEGORIES}
                placeholder="Any Genre"
                searchPlaceholder="Search genres..."
                emptyText="No genre found."
                testId="select-prompt-genre"
                allowEmpty={true}
                emptyLabel="Any Genre"
                formatLabel={(value) => value}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prompt Type</label>
              <SearchableSelect
                value={promptType}
                onValueChange={setPromptType}
                categorizedOptions={PROMPT_TYPE_CATEGORIES}
                placeholder="Any Type"
                searchPlaceholder="Search prompt types..."
                emptyText="No type found."
                testId="select-prompt-type"
                allowEmpty={true}
                emptyLabel="Any Type"
                formatLabel={(value) => value}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleGenerate}
              disabled={generatePromptMutation.isPending}
              data-testid="button-generate-prompt"
            >
              {generatePromptMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Prompt"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentPrompt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getDifficultyColor(currentPrompt.difficulty)}>
                  {currentPrompt.difficulty}
                </Badge>
                <Badge className={getTypeColor(currentPrompt.type)}>
                  {currentPrompt.type}
                </Badge>
                <Badge variant="outline">
                  {currentPrompt.genre}
                </Badge>
                <Badge variant="outline">
                  {currentPrompt.wordCount}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerate}
                  disabled={generatePromptMutation.isPending}
                  data-testid="button-refresh-prompt"
                >
                  {generatePromptMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={copyPrompt} data-testid="button-copy-prompt">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={savePrompt}
                  disabled={savePromptMutation.isPending || !currentPrompt?.id}
                  data-testid="button-save-prompt"
                >
                  {savePromptMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 p-6 rounded-lg border-l-4 border-primary">
                <p className="text-lg leading-relaxed">{currentPrompt.text}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {currentPrompt.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {savedPrompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saved Prompts</CardTitle>
            <CardDescription>Your recently saved writing prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedPrompts.slice(0, 3).map((prompt, index) => (
                <div key={prompt.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(prompt.difficulty)} variant="outline">
                        {prompt.difficulty}
                      </Badge>
                      <Badge variant="outline">{prompt.genre}</Badge>
                      <Badge variant="outline">{prompt.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {prompt.text}
                    </p>
                  </div>
                </div>
              ))}
              {savedPrompts.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" data-testid="button-view-all-saved">
                    View all {savedPrompts.length} saved prompts
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
