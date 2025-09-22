import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Copy, Save, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StoryStructureQuiz from "./StoryStructureQuiz";

interface PlotStructure {
  id?: string;
  setup: string;
  incitingIncident: string;
  firstPlotPoint: string;
  midpoint: string;
  secondPlotPoint: string;
  climax: string;
  resolution: string;
  theme: string;
  conflict: string;
  genre?: string | null;
  storyStructure?: string | null;
  userId?: string | null;
  createdAt?: string;
}

const STORY_STRUCTURES = [
  { value: "three-act", label: "Three-Act Structure" },
  { value: "freytag", label: "Freytag's Pyramid" },
  { value: "hero-journey", label: "The Hero's Journey" },
  { value: "story-circle", label: "The Story Circle" },
  { value: "snowflake", label: "The Snowflake Method" },
  { value: "fichtean", label: "Fichtean Curve" },
  { value: "save-cat", label: "Save the Cat Beat Sheet" },
  { value: "seven-point", label: "Seven-Point Story Structure" }
];

// Removed local data arrays - now using backend API

export default function PlotGenerator() {
  const [plot, setPlot] = useState<PlotStructure | null>(null);
  const [genre, setGenre] = useState<string>("");
  const [storyStructure, setStoryStructure] = useState<string>("");
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generatePlotMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/plots/generate', {
        genre: genre || undefined,
        storyStructure: storyStructure || undefined,
        userId: null // For now, no user authentication
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPlot(data);
      console.log('Generated plot:', data);
    },
    onError: (error) => {
      console.error('Error generating plot:', error);
      toast({
        title: "Error",
        description: "Failed to generate plot. Please try again.",
        variant: "destructive"
      });
    }
  });

  const savePlotMutation = useMutation({
    mutationFn: async () => {
      if (!plot?.id) return;
      
      const response = await apiRequest('POST', '/api/saved-items', {
        userId: 'guest', // For now, using guest user
        itemType: 'plot',
        itemId: plot.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plot saved!",
        description: "Plot structure has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    },
    onError: (error) => {
      console.error('Error saving plot:', error);
      toast({
        title: "Error",
        description: "Failed to save plot. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generatePlot = () => {
    generatePlotMutation.mutate();
  };

  const copyPlot = () => {
    if (!plot) return;
    
    const text = `**Plot Structure**

**Theme:** ${plot.theme}
**Central Conflict:** ${plot.conflict}

**Act I - Setup**
${plot.setup}

**Inciting Incident:** ${plot.incitingIncident}

**First Plot Point:** ${plot.firstPlotPoint}

**Act II - Confrontation**
**Midpoint:** ${plot.midpoint}

**Second Plot Point:** ${plot.secondPlotPoint}

**Act III - Resolution**
**Climax:** ${plot.climax}

**Resolution:** ${plot.resolution}`;
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Plot copied!",
      description: "Plot structure has been copied to your clipboard.",
    });
  };

  const savePlot = () => {
    if (!plot) return;
    savePlotMutation.mutate();
  };

  const handleQuizStructureSelect = (structure: string) => {
    setStoryStructure(structure);
    toast({
      title: "Structure selected!",
      description: `${STORY_STRUCTURES.find(s => s.value === structure)?.label} has been selected for your plot.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Plot Generator
          </CardTitle>
          <CardDescription>
            Generate compelling three-act plot structures with conflict and themes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="sm:w-48" data-testid="select-plot-genre">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="sci-fi">Science Fiction</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                  <SelectItem value="mystery">Mystery</SelectItem>
                  <SelectItem value="thriller">Thriller</SelectItem>
                  <SelectItem value="drama">Drama</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={storyStructure} onValueChange={setStoryStructure}>
                <SelectTrigger className="sm:w-56" data-testid="select-story-structure">
                  <SelectValue placeholder="Select story structure" />
                </SelectTrigger>
                <SelectContent>
                  {STORY_STRUCTURES.map((structure) => (
                    <SelectItem key={structure.value} value={structure.value}>
                      {structure.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={generatePlot}
                disabled={generatePlotMutation.isPending}
                data-testid="button-generate-plot"
                className="flex-1 sm:flex-none"
              >
                {generatePlotMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                {generatePlotMutation.isPending ? 'Generating...' : 'Generate Plot'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowQuiz(true)}
                data-testid="button-structure-quiz"
                className="flex-1 sm:flex-none"
              >
                📝 Find My Structure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {plot && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your Plot Structure</CardTitle>
                <CardDescription>Three-act story framework</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyPlot} data-testid="button-copy-plot">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={savePlot} 
                  disabled={savePlotMutation.isPending || !plot?.id}
                  data-testid="button-save-plot"
                >
                  {savePlotMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-primary">Central Theme</h4>
                <p className="text-muted-foreground">{plot.theme}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-chart-2">Core Conflict</h4>
                <p className="text-muted-foreground">{plot.conflict}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-chart-3">Act I - Setup</h3>
                <div className="space-y-4 pl-4 border-l-2 border-chart-3/20">
                  <div>
                    <h4 className="font-medium mb-2">Opening</h4>
                    <p className="text-muted-foreground">{plot.setup}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Inciting Incident</h4>
                    <p className="text-muted-foreground">{plot.incitingIncident}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">First Plot Point</h4>
                    <p className="text-muted-foreground">{plot.firstPlotPoint}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Act II - Confrontation</h3>
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  <div>
                    <h4 className="font-medium mb-2">Midpoint</h4>
                    <p className="text-muted-foreground">{plot.midpoint}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Second Plot Point</h4>
                    <p className="text-muted-foreground">{plot.secondPlotPoint}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-chart-4">Act III - Resolution</h3>
                <div className="space-y-4 pl-4 border-l-2 border-chart-4/20">
                  <div>
                    <h4 className="font-medium mb-2">Climax</h4>
                    <p className="text-muted-foreground">{plot.climax}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Resolution</h4>
                    <p className="text-muted-foreground">{plot.resolution}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <StoryStructureQuiz
        open={showQuiz}
        onClose={() => setShowQuiz(false)}
        onSelectStructure={handleQuizStructureSelect}
      />
    </div>
  );
}