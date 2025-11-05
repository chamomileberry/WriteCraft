import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Copy, Save, Zap, Loader2, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StoryStructureQuiz from "./StoryStructureQuiz";
import { GENRE_CATEGORIES } from "@shared/genres";
import { useGenerator } from "@/hooks/useGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { PolishButton } from "@/components/PolishButton";

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

const STORY_STRUCTURE_CATEGORIES = {
  "Story Structures": [
    "three-act",
    "freytag",
    "hero-journey",
    "story-circle",
    "snowflake",
    "fichtean",
    "save-cat",
    "seven-point",
  ],
};

const STORY_STRUCTURE_LABELS: Record<string, string> = {
  "three-act": "Three-Act Structure",
  freytag: "Freytag's Pyramid",
  "hero-journey": "The Hero's Journey",
  "story-circle": "The Story Circle",
  snowflake: "The Snowflake Method",
  fichtean: "Fichtean Curve",
  "save-cat": "Save the Cat Beat Sheet",
  "seven-point": "Seven-Point Story Structure",
};

export default function PlotGenerator() {
  const [genre, setGenre] = useState<string>("");
  const [storyStructure, setStoryStructure] = useState<string>("");
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage: "Please create or select a notebook before generating plots.",
  });

  const generator = useGenerator<PlotStructure>({
    generateEndpoint: "/api/plots/generate",
    getGenerateParams: () => ({
      genre: genre || undefined,
      storyStructure: storyStructure || undefined,
      userId: null,
      notebookId,
    }),
    itemTypeName: "plot",
    userId: user?.id ?? undefined,
    notebookId: notebookId ?? undefined,
    validateBeforeGenerate: validateNotebook,
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
    invalidateOnSave: [["/api/saved-items"]],
    onGenerateSuccess: (data) => {
      console.log("Generated plot:", data);
    },
  });

  const plot = generator.result;

  const handleQuizStructureSelect = (structure: string) => {
    setStoryStructure(structure);
    toast({
      title: "Structure selected!",
      description: `${STORY_STRUCTURE_LABELS[structure]} has been selected for your plot.`,
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
                Generate compelling three-act plot structures with conflict and
                themes
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
          <GeneratorNotebookControls />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchableSelect
                value={genre}
                onValueChange={setGenre}
                categorizedOptions={GENRE_CATEGORIES}
                placeholder="Select genre..."
                searchPlaceholder="Search genres..."
                emptyText="No genre found."
                className="sm:w-48 justify-between"
                testId="select-plot-genre"
                allowEmpty={true}
                emptyLabel="Any Genre"
                formatLabel={(value) =>
                  value.charAt(0).toUpperCase() + value.slice(1)
                }
              />

              <SearchableSelect
                value={storyStructure}
                onValueChange={setStoryStructure}
                categorizedOptions={STORY_STRUCTURE_CATEGORIES}
                placeholder="Select story structure"
                searchPlaceholder="Search structures..."
                emptyText="No structure found."
                className="sm:w-56 justify-between"
                testId="select-story-structure"
                allowEmpty={true}
                emptyLabel="Any Structure"
                formatLabel={(value) => STORY_STRUCTURE_LABELS[value] || value}
              />
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
              {generator.isGenerating ? "Generating..." : "Generate Plot"}
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
                <PolishButton
                  content={plot.theme}
                  contentType="plot"
                  onPolished={(polished) => {
                    generator.setResult({
                      ...plot,
                      theme: polished,
                    });
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generator.copyToClipboard}
                  data-testid="button-copy-plot"
                >
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
                <h4 className="font-semibold mb-2 text-primary">
                  Central Theme
                </h4>
                <p className="text-muted-foreground">{plot.theme}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-chart-2">
                  Core Conflict
                </h4>
                <p className="text-muted-foreground">{plot.conflict}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-chart-3">
                  Act I - Setup
                </h3>
                <div className="space-y-4 pl-4 border-l-2 border-chart-3/20">
                  <div>
                    <h4 className="font-medium mb-2">Opening</h4>
                    <p className="text-muted-foreground">{plot.setup}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Inciting Incident</h4>
                    <p className="text-muted-foreground">
                      {plot.incitingIncident}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">First Plot Point</h4>
                    <p className="text-muted-foreground">
                      {plot.firstPlotPoint}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">
                  Act II - Confrontation
                </h3>
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  <div>
                    <h4 className="font-medium mb-2">Midpoint</h4>
                    <p className="text-muted-foreground">{plot.midpoint}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Second Plot Point</h4>
                    <p className="text-muted-foreground">
                      {plot.secondPlotPoint}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-chart-4">
                  Act III - Resolution
                </h3>
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

      {/* Upgrade Prompt */}
      <UpgradePrompt
        open={generator.showUpgradePrompt}
        onOpenChange={generator.setShowUpgradePrompt}
        title="AI Generation Limit Reached"
        description="You've reached your daily AI generation limit. Upgrade to a paid plan for unlimited plot generation."
        feature="AI plot generations"
      />
    </div>
  );
}
