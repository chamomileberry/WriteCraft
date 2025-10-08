import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Copy, Save, Zap, Loader2, HelpCircle, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StoryStructureQuiz from "./StoryStructureQuiz";
import { GENRE_CATEGORIES } from "@shared/genres";
import { useGenerator } from "@/hooks/useGenerator";

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

export default function PlotGenerator() {
  const [genre, setGenre] = useState<string>("");
  const [genreSearchOpen, setGenreSearchOpen] = useState(false);
  const [storyStructure, setStoryStructure] = useState<string>("");
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const { toast } = useToast();

  const generator = useGenerator<PlotStructure>({
    generateEndpoint: '/api/plots/generate',
    getGenerateParams: () => ({
      genre: genre || undefined,
      storyStructure: storyStructure || undefined,
      userId: null
    }),
    itemTypeName: 'plot',
    userId: 'guest',
    formatForClipboard: (plot) => `**Plot Structure**

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

**Resolution:** ${plot.resolution}`,
    invalidateOnSave: [['/api/saved-items']],
    onGenerateSuccess: (data) => {
      console.log('Generated plot:', data);
    },
  });

  const plot = generator.result;

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Plot Generator
              </CardTitle>
              <CardDescription>
                Generate compelling three-act plot structures with conflict and themes
              </CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowQuiz(true)}
              data-testid="button-structure-quiz"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Find My Structure
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Popover open={genreSearchOpen} onOpenChange={setGenreSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={genreSearchOpen}
                    className="sm:w-48 justify-between"
                    data-testid="select-plot-genre"
                  >
                    {genre ? genre.charAt(0).toUpperCase() + genre.slice(1) : "Select genre..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search genres..." />
                    <CommandList className="max-h-60">
                      <CommandEmpty>No genre found.</CommandEmpty>
                      {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                        <CommandGroup key={category} heading={category}>
                          {genres.map((genreOption) => (
                            <CommandItem
                              key={genreOption}
                              value={genreOption}
                              onSelect={() => {
                                setGenre(genreOption);
                                setGenreSearchOpen(false);
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${genre === genreOption ? "opacity-100" : "opacity-0"}`} />
                              {genreOption.charAt(0).toUpperCase() + genreOption.slice(1)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
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
            
            <Button 
              onClick={generator.generate}
              disabled={generator.isGenerating}
              data-testid="button-generate-plot"
              className="w-full sm:w-auto"
            >
              {generator.isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {generator.isGenerating ? 'Generating...' : 'Generate Plot'}
            </Button>
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
                <Button variant="outline" size="sm" onClick={generator.copyToClipboard} data-testid="button-copy-plot">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.saveToCollection} 
                  disabled={generator.isSaving || !plot?.id}
                  data-testid="button-save-plot"
                >
                  {generator.isSaving ? (
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
