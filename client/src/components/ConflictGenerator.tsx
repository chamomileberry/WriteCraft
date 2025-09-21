import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Target, AlertTriangle, Users, Copy, Heart, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Conflict } from "@shared/schema";

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
  const [generatedConflict, setGeneratedConflict] = useState<Conflict | null>(null);
  const [conflictType, setConflictType] = useState('any');
  const [genre, setGenre] = useState('any');
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/conflicts/generate', { conflictType, genre });
      return await res.json() as Conflict;
    },
    onSuccess: (conflict: Conflict) => {
      setGeneratedConflict(conflict);
      queryClient.invalidateQueries({ queryKey: ['/api/conflicts'] });
    },
    onError: (error) => {
      console.error('Failed to generate conflict:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create conflict. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (conflict: Conflict) => {
      const res = await apiRequest('POST', '/api/conflicts', conflict);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Conflict Saved!",
        description: "Your conflict has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/conflicts'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save conflict. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleSave = () => {
    if (generatedConflict) {
      saveMutation.mutate(generatedConflict);
    }
  };

  const handleCopy = () => {
    if (generatedConflict) {
      const conflictText = `Conflict: ${generatedConflict.title}

Type: ${generatedConflict.type}
Genre: ${generatedConflict.genre || 'General'}

Description:
${generatedConflict.description}

Stakes:
${generatedConflict.stakes}

Emotional Impact:
${generatedConflict.emotionalImpact}

Obstacles:
${generatedConflict.obstacles.join('\n')}

Potential Resolutions:
${generatedConflict.potentialResolutions.join('\n')}`;

      navigator.clipboard.writeText(conflictText);
      toast({
        title: "Copied to Clipboard!",
        description: "Conflict details have been copied to your clipboard.",
      });
    }
  };

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
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-conflict"
        >
          {generateMutation.isPending ? (
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
                  <Badge variant="outline" className="mr-2">{generatedConflict.type}</Badge>
                  {generatedConflict.genre && (
                    <Badge variant="secondary">{generatedConflict.genre}</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground" data-testid="text-conflict-description">
                {generatedConflict.description}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Stakes
              </h3>
              <p className="text-muted-foreground" data-testid="text-conflict-stakes">
                {generatedConflict.stakes}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Emotional Impact</h3>
              <p className="text-muted-foreground" data-testid="text-conflict-emotional-impact">
                {generatedConflict.emotionalImpact}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Obstacles</h3>
              <div className="space-y-2">
                {generatedConflict.obstacles.map((obstacle: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-obstacle-${index}`}>{obstacle}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Potential Resolutions</h3>
              <div className="space-y-2">
                {generatedConflict.potentialResolutions.map((resolution: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-resolution-${index}`}>{resolution}</span>
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
                data-testid="button-save-conflict"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Save Conflict
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleCopy}
                variant="outline"
                data-testid="button-copy-conflict"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!generatedConflict && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Create Conflict</h3>
            <p className="text-muted-foreground">
              Choose your options above and click generate to create engaging story conflicts
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}