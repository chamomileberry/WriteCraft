import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Palette, Eye, Ear, Sun, Cloud, Copy, Heart, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Mood } from "@shared/schema";

export default function MoodPalette() {
  const [generatedMood, setGeneratedMood] = useState<Mood | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/moods/generate');
      return await res.json() as Mood;
    },
    onSuccess: (mood: Mood) => {
      setGeneratedMood(mood);
      queryClient.invalidateQueries({ queryKey: ['/api/moods'] });
    },
    onError: (error) => {
      console.error('Failed to generate mood:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create mood palette. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (mood: Mood) => {
      const res = await apiRequest('POST', '/api/moods', mood);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Mood Saved!",
        description: "Your mood palette has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/moods'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save mood palette. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Mood Palette</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Set the perfect tone and atmosphere for your scenes. Generate evocative sensory details to immerse your readers.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <Button 
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-mood"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Mood...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Mood Palette
            </>
          )}
        </Button>
      </div>

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
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-sound-${index}`}>{sound}</span>
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
                    Save Mood Palette
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
              Click generate to create a rich mood palette for your scene
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}