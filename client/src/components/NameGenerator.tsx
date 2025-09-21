import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, User, MapPin, Crown, Copy, Heart, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedName } from "@shared/schema";

const nameTypes = [
  { value: 'character', label: 'Character Names' },
  { value: 'place', label: 'Place Names' },
  { value: 'fantasy', label: 'Fantasy Names' },
  { value: 'royal', label: 'Royal/Noble Names' },
  { value: 'clan', label: 'Clan/Family Names' }
];

const cultures = [
  { value: 'any', label: 'Any Culture' },
  { value: 'english', label: 'English' },
  { value: 'celtic', label: 'Celtic' },
  { value: 'norse', label: 'Norse' },
  { value: 'latin', label: 'Latin' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'elvish', label: 'Elvish' },
  { value: 'dwarven', label: 'Dwarven' }
];

export default function NameGenerator() {
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [nameType, setNameType] = useState('character');
  const [culture, setCulture] = useState('any');
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/names/generate', { nameType, culture });
      return await res.json() as GeneratedName[];
    },
    onSuccess: (names: GeneratedName[]) => {
      setGeneratedNames(names);
      queryClient.invalidateQueries({ queryKey: ['/api/names'] });
    },
    onError: (error) => {
      console.error('Failed to generate names:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create names. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (names: GeneratedName[]) => {
      const res = await apiRequest('POST', '/api/names', { names, nameType, culture });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Names Saved!",
        description: "Your names have been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/names'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save names. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleSave = () => {
    if (generatedNames.length > 0) {
      saveMutation.mutate(generatedNames);
    }
  };

  const handleCopy = () => {
    if (generatedNames.length > 0) {
      const nameText = `Generated ${nameTypes.find(t => t.value === nameType)?.label} (${cultures.find(c => c.value === culture)?.label}):\n\n${generatedNames.map(name => `${name.name}${name.meaning ? ` - ${name.meaning}` : ''}`).join('\n')}`;

      navigator.clipboard.writeText(nameText);
      toast({
        title: "Copied to Clipboard!",
        description: "Names have been copied to your clipboard.",
      });
    }
  };

  const getNameTypeIcon = () => {
    switch (nameType) {
      case 'character': return User;
      case 'place': return MapPin;
      case 'royal': return Crown;
      default: return FileText;
    }
  };

  const NameIcon = getNameTypeIcon();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Name Generator</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find perfect names for characters, places, and fantasy elements. Generate culturally appropriate names with meanings.
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generation Options</CardTitle>
          <CardDescription>
            Customize your name generation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name Type</label>
              <Select value={nameType} onValueChange={setNameType}>
                <SelectTrigger data-testid="select-name-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nameTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cultural Style</label>
              <Select value={culture} onValueChange={setCulture}>
                <SelectTrigger data-testid="select-culture">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cultures.map(culture => (
                    <SelectItem key={culture.value} value={culture.value}>
                      {culture.label}
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
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-names"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Names...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Names
            </>
          )}
        </Button>
      </div>

      {generatedNames.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <NameIcon className="h-6 w-6 text-primary" />
                  Generated {nameTypes.find(t => t.value === nameType)?.label}
                </CardTitle>
                <CardDescription className="mt-2">
                  {cultures.find(c => c.value === culture)?.label} style names
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {generatedNames.map((name, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold" data-testid={`text-name-${index}`}>
                        {name.name}
                      </h3>
                      {name.meaning && (
                        <p className="text-muted-foreground mt-1" data-testid={`text-meaning-${index}`}>
                          Meaning: {name.meaning}
                        </p>
                      )}
                      {name.origin && (
                        <Badge variant="secondary" className="mt-2">
                          {name.origin}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(name.name);
                        toast({
                          title: "Copied!",
                          description: `"${name.name}" copied to clipboard.`,
                        });
                      }}
                      data-testid={`button-copy-name-${index}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave}
                disabled={saveMutation.isPending}
                variant="default"
                data-testid="button-save-names"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Save All Names
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleCopy}
                variant="outline"
                data-testid="button-copy-all-names"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>

              <Button 
                onClick={handleGenerate}
                variant="outline"
                disabled={generateMutation.isPending}
                data-testid="button-regenerate-names"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedNames.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Generate Names</h3>
            <p className="text-muted-foreground">
              Choose your options above and click generate to create perfect names for your story
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}