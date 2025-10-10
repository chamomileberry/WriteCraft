import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Palette, Eye, Ear, Sun, Cloud, Copy, Heart, Loader2 } from "lucide-react";
import { useGenerateMutation, useSaveMutation } from "@/hooks/useApiMutation";
import { useToast } from "@/hooks/use-toast";
import { useNotebookStore } from "@/stores/notebookStore";
import { GeneratorLayout } from "@/components/GeneratorLayout";
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Mood, Notebook } from "@shared/schema";

export default function MoodPalette() {
  const [generatedMood, setGeneratedMood] = useState<Mood | null>(null);
  const { toast } = useToast();
  const { notebooks, setNotebooks, setActiveNotebook, activeNotebookId } = useNotebookStore();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before generating moods.'
  });

  const generateMutation = useGenerateMutation<Mood>('/api/moods/generate', {
    errorMessage: "Unable to create mood palette. Please try again.",
    onSuccess: (mood: Mood) => {
      setGeneratedMood(mood);
    },
    invalidateQueries: ['/api/moods'],
  });

  const saveMutation = useSaveMutation<any, Mood>('/api/moods', {
    successMessage: "Your mood palette has been saved to your collection.",
    errorMessage: "Unable to save mood palette. Please try again.",
    invalidateQueries: ['/api/moods'],
  });

  const handleGenerate = () => {
    if (!validateNotebook()) return;
    generateMutation.mutate({ notebookId: activeNotebookId });
  };

  const handleSave = () => {
    if (generatedMood) {
      saveMutation.mutate(generatedMood);
    }
  };

  const handleCopy = () => {
    if (generatedMood) {
      const moodText = `Mood Palette: ${generatedMood.name}

Emotional Tone:
${generatedMood.emotionalTone}

Description:
${generatedMood.description}

Sensory Details:
${generatedMood.sensoryDetails.join('\n')}

Color Associations:
${generatedMood.colorAssociations.join('\n')}

Weather Elements:
${generatedMood.weatherElements.join('\n')}

Lighting Effects:
${generatedMood.lightingEffects.join('\n')}

Soundscape:
${generatedMood.soundscape.join('\n')}`;

      navigator.clipboard.writeText(moodText);
      toast({
        title: "Copied to Clipboard!",
        description: "Mood palette details have been copied to your clipboard.",
      });
    }
  };

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Mood Palette</h1>
        <p className="text-muted-foreground">
          Set the perfect tone and atmosphere for your scenes
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Mood Palette</CardTitle>
          <CardDescription>
            Create evocative sensory details to immerse your readers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratorLayout
            onGenerate={handleGenerate}
            generateButtonText="Generate Mood Palette"
            isGenerating={generateMutation.isPending}
            generateButtonTestId="button-generate-mood"
            notebookControls={
              <GeneratorNotebookControls
                onQuickCreate={() => quickCreateMutation.mutate()}
                quickCreateLabel="Create Notebook"
                quickCreateTestId="button-quick-create-notebook"
              />
            }
          >
            <p className="text-sm text-muted-foreground">Click generate to create a mood palette with evocative sensory details.</p>
          </GeneratorLayout>
        </CardContent>
      </Card>

      {generatedMood && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2" data-testid="text-mood-name">
                  <Palette className="h-6 w-6 text-primary" />
                  {generatedMood.name}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  <Badge variant="outline">{generatedMood.emotionalTone}</Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground" data-testid="text-mood-description">
                {generatedMood.description}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Sensory Details
              </h3>
              <div className="space-y-2">
                {generatedMood.sensoryDetails.map((detail: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-sensory-detail-${index}`}>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Color Associations</h3>
              <div className="flex flex-wrap gap-2">
                {generatedMood.colorAssociations.map((color: string, index: number) => (
                  <Badge key={index} variant="secondary" data-testid={`badge-color-${index}`}>
                    {color}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Weather Elements
              </h3>
              <div className="space-y-2">
                {generatedMood.weatherElements.map((element: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-weather-element-${index}`}>{element}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Lighting Effects
              </h3>
              <div className="space-y-2">
                {generatedMood.lightingEffects.map((effect: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-lighting-effect-${index}`}>{effect}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Ear className="h-5 w-5" />
                Soundscape
              </h3>
              <div className="space-y-2">
                {generatedMood.soundscape.map((sound: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-soundscape-${index}`}>{sound}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave}
                disabled={saveMutation.isPending}
                variant="default"
                data-testid="button-save-mood"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Save Mood
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleCopy}
                variant="outline"
                data-testid="button-copy-mood"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!generatedMood && (
        <Card className="text-center py-12">
          <CardContent>
            <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Create Atmosphere</h3>
            <p className="text-muted-foreground">
              Click generate to create an evocative mood palette for your scene
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
