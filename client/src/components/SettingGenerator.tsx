import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Label } from "@/components/ui/label";
import { Map, MapPin, Clock, Users, Copy, Heart, Loader2, Sparkles, Cloud } from "lucide-react";
import type { Setting, Notebook } from "@shared/schema";
import { GENRE_CATEGORIES, SETTING_TYPE_CATEGORIES } from "@shared/genres";
import { useGenerator } from "@/hooks/useGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useNotebookStore } from "@/stores/notebookStore";
import { useToast } from "@/hooks/use-toast";

export default function SettingGenerator() {
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedSettingType, setSelectedSettingType] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: 'Please create or select a notebook before generating settings.'
  });
  const { notebooks, setNotebooks, setActiveNotebook } = useNotebookStore();

  const generator = useGenerator<Setting>({
    generateEndpoint: '/api/settings/generate',
    getGenerateParams: () => ({
      genre: selectedGenre && selectedGenre !== "any" ? selectedGenre : undefined,
      settingType: selectedSettingType && selectedSettingType !== "any" ? selectedSettingType : undefined,
      notebookId
    }),
    itemTypeName: 'setting',
    userId: user?.id ?? undefined,
    notebookId: notebookId ?? undefined,
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (setting) => `**${setting.name}**
      
**Location:** ${setting.location}
**Time Period:** ${setting.timePeriod}
**Population:** ${setting.population}
**Climate:** ${setting.climate}

**Description:**
${setting.description}

**Atmosphere:**
${setting.atmosphere}

**Cultural Elements:**
${setting.culturalElements.join(', ')}

**Notable Features:**
${setting.notableFeatures.join(', ')}`,
    invalidateOnSave: [['/api/saved-items']],
  });

  const generatedSetting = generator.result;

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
        <h1 className="text-4xl font-serif font-bold mb-4">Setting Generator</h1>
        <p className="text-muted-foreground text-lg">
          Create immersive worlds and locations for your stories
        </p>
      </div>

      {/* Generation Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Generate Setting
          </CardTitle>
          <CardDescription>
            Customize your setting by selecting preferences below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GeneratorNotebookControls
            onQuickCreate={() => quickCreateMutation.mutate()}
          />
          
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

          {/* Setting Type Selection */}
          <div className="space-y-2">
            <Label>Setting Type (Optional)</Label>
            <SearchableSelect
              value={selectedSettingType}
              onValueChange={setSelectedSettingType}
              categorizedOptions={SETTING_TYPE_CATEGORIES}
              placeholder="Any Setting Type"
              searchPlaceholder="Search setting types..."
              emptyText="No setting type found."
              className="w-full justify-between"
              testId="button-setting-type-select"
              allowEmpty={true}
              emptyLabel="Any Setting Type"
              formatLabel={(value) => value}
            />
          </div>

          <Button 
            onClick={generator.generate}
            disabled={generator.isGenerating}
            className="w-full"
            size="lg"
            data-testid="button-generate-setting"
          >
            {generator.isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Setting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Setting
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Setting Display */}
      {generatedSetting && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{generatedSetting.name}</CardTitle>
                <CardDescription className="text-base">
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {generatedSetting.location}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {generatedSetting.timePeriod}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {generatedSetting.population}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Cloud className="h-3 w-3" />
                      {generatedSetting.climate}
                    </Badge>
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.copyToClipboard}
                  data-testid="button-copy-setting"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.saveToCollection}
                  disabled={generator.isSaving || !generatedSetting?.id}
                  data-testid="button-save-setting"
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
              <p className="text-muted-foreground leading-relaxed">
                {generatedSetting.description}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 text-lg">Atmosphere</h4>
              <p className="text-muted-foreground leading-relaxed">
                {generatedSetting.atmosphere}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">Cultural Elements</h4>
              <div className="flex flex-wrap gap-2">
                {generatedSetting.culturalElements.map((element, idx) => (
                  <Badge key={idx} variant="secondary">
                    {element}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">Notable Features</h4>
              <div className="flex flex-wrap gap-2">
                {generatedSetting.notableFeatures.map((feature, idx) => (
                  <Badge key={idx} variant="outline">
                    {feature}
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
