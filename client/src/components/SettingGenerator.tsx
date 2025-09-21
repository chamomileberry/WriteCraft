import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Map, MapPin, Clock, Users, Copy, Heart, Loader2, Sparkles } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Setting } from "@shared/schema";

export default function SettingGenerator() {
  const [generatedSetting, setGeneratedSetting] = useState<Setting | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/settings/generate');
      return await res.json() as Setting;
    },
    onSuccess: (setting: Setting) => {
      setGeneratedSetting(setting);
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      console.error('Failed to generate setting:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create setting. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (setting: Setting) => {
      const res = await apiRequest('POST', '/api/settings', setting);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Setting Saved!",
        description: "Your setting has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save setting. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleSave = () => {
    if (generatedSetting) {
      saveMutation.mutate(generatedSetting);
    }
  };

  const handleCopy = () => {
    if (generatedSetting) {
      const settingText = `Setting: ${generatedSetting.name}

Location: ${generatedSetting.location}
Time Period: ${generatedSetting.timePeriod}
Population: ${generatedSetting.population}
Climate: ${generatedSetting.climate}

Description:
${generatedSetting.description}

Atmosphere:
${generatedSetting.atmosphere}

Cultural Elements:
${generatedSetting.culturalElements.join(', ')}

Notable Features:
${generatedSetting.notableFeatures.join(', ')}`;

      navigator.clipboard.writeText(settingText);
      toast({
        title: "Copied to Clipboard!",
        description: "Setting details have been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Setting Generator</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create immersive worlds and locations for your stories. Generate detailed settings with atmosphere, culture, and unique features.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <Button 
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-setting"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Setting...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Setting
            </>
          )}
        </Button>
      </div>

      {generatedSetting && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2" data-testid="text-setting-name">
                  <Map className="h-6 w-6 text-primary" />
                  {generatedSetting.name}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {generatedSetting.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Basic Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Location:</span>
                  <span data-testid="text-setting-location">{generatedSetting.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Time Period:</span>
                  <span data-testid="text-setting-time-period">{generatedSetting.timePeriod}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Population:</span>
                  <span data-testid="text-setting-population">{generatedSetting.population}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Climate:</span>
                  <span data-testid="text-setting-climate">{generatedSetting.climate}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Atmosphere */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Atmosphere</h3>
              <p className="text-muted-foreground" data-testid="text-setting-atmosphere">
                {generatedSetting.atmosphere}
              </p>
            </div>

            <Separator />

            {/* Cultural Elements */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Cultural Elements</h3>
              <div className="flex flex-wrap gap-2">
                {generatedSetting.culturalElements.map((element: string, index: number) => (
                  <Badge key={index} variant="secondary" data-testid={`badge-cultural-element-${index}`}>
                    {element}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notable Features */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Notable Features</h3>
              <div className="space-y-2">
                {generatedSetting.notableFeatures.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-notable-feature-${index}`}>{feature}</span>
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
                data-testid="button-save-setting"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Save Setting
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleCopy}
                variant="outline"
                data-testid="button-copy-setting"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!generatedSetting && (
        <Card className="text-center py-12">
          <CardContent>
            <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Create a Setting</h3>
            <p className="text-muted-foreground">
              Click the generate button to create a detailed world for your story
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}