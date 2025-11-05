import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  AlertTriangle,
  Users,
  Copy,
  Heart,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { Conflict } from "@shared/schema";
import { useGenerator } from "@/hooks/useGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { PolishButton } from "@/components/PolishButton";

const CONFLICT_TYPE_CATEGORIES = {
  "Conflict Types": [
    "any",
    "internal",
    "external",
    "interpersonal",
    "societal",
  ],
};

const CONFLICT_TYPE_LABELS: Record<string, string> = {
  any: "Any Type",
  internal: "Internal Conflict",
  external: "External Conflict",
  interpersonal: "Interpersonal Conflict",
  societal: "Societal Conflict",
};

const GENRE_CATEGORIES = {
  Genres: ["any", "fantasy", "romance", "thriller", "drama", "sci-fi"],
};

const GENRE_LABELS: Record<string, string> = {
  any: "Any Genre",
  fantasy: "Fantasy",
  romance: "Romance",
  thriller: "Thriller",
  drama: "Drama",
  "sci-fi": "Science Fiction",
};

export default function ConflictGenerator() {
  const [conflictType, setConflictType] = useState("any");
  const [genre, setGenre] = useState("any");
  const { user } = useAuth();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage:
      "Please create or select a notebook before generating conflicts.",
  });

  const generator = useGenerator<Conflict>({
    generateEndpoint: "/api/conflicts/generate",
    getGenerateParams: () => ({ conflictType, genre, notebookId }),
    itemTypeName: "conflict",
    userId: user?.id ?? undefined,
    notebookId: notebookId ?? undefined,
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (conflict) => `Conflict: ${conflict.title}

Type: ${conflict.type}
Genre: ${conflict.genre || "General"}

Description:
${conflict.description}

Stakes:
${conflict.stakes}

Emotional Impact:
${conflict.emotionalImpact}

Obstacles:
${conflict.obstacles.join("\n")}

Potential Resolutions:
${conflict.potentialResolutions.join("\n")}`,
    invalidateOnSave: [["/api/saved-items"]],
  });

  const generatedConflict = generator.result;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Conflict Generator
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create engaging conflicts and obstacles for your story. Generate
          compelling tension that drives your narrative forward.
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
          <GeneratorNotebookControls />

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Conflict Type
              </label>
              <SearchableSelect
                value={conflictType}
                onValueChange={setConflictType}
                categorizedOptions={CONFLICT_TYPE_CATEGORIES}
                placeholder="Any Type"
                searchPlaceholder="Search types..."
                emptyText="No type found."
                testId="select-conflict-type"
                formatLabel={(value) => CONFLICT_TYPE_LABELS[value] || value}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <SearchableSelect
                value={genre}
                onValueChange={setGenre}
                categorizedOptions={GENRE_CATEGORIES}
                placeholder="Any Genre"
                searchPlaceholder="Search genres..."
                emptyText="No genre found."
                testId="select-genre"
                formatLabel={(value) => GENRE_LABELS[value] || value}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mb-8">
        <Button
          onClick={generator.generate}
          disabled={generator.isGenerating}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-conflict"
        >
          {generator.isGenerating ? (
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
                <CardTitle
                  className="text-2xl flex items-center gap-2"
                  data-testid="text-conflict-title"
                >
                  <Target className="h-6 w-6 text-primary" />
                  {generatedConflict.title}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{generatedConflict.type}</Badge>
                    {generatedConflict.genre && (
                      <Badge variant="secondary">
                        {generatedConflict.genre}
                      </Badge>
                    )}
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <PolishButton
                  content={generatedConflict.description}
                  contentType="conflict"
                  onPolished={(polished) => {
                    generator.setResult({
                      ...generatedConflict,
                      description: polished,
                    });
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generator.copyToClipboard}
                  data-testid="button-copy-conflict"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generator.saveToCollection}
                  disabled={generator.isSaving || !generatedConflict?.id}
                  data-testid="button-save-conflict"
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
              <p
                className="text-muted-foreground leading-relaxed"
                data-testid="text-conflict-description"
              >
                {generatedConflict.description}
              </p>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Stakes
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {generatedConflict.stakes}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-chart-3" />
                  Emotional Impact
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {generatedConflict.emotionalImpact}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">Obstacles</h4>
              <ul className="space-y-2">
                {generatedConflict.obstacles.map((obstacle, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span className="text-muted-foreground flex-1">
                      {obstacle}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">
                Potential Resolutions
              </h4>
              <ul className="space-y-2">
                {generatedConflict.potentialResolutions.map(
                  (resolution, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-chart-4 mt-1.5">→</span>
                      <span className="text-muted-foreground flex-1">
                        {resolution}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt */}
      <UpgradePrompt
        open={generator.showUpgradePrompt}
        onOpenChange={generator.setShowUpgradePrompt}
        title="AI Generation Limit Reached"
        description="You've reached your daily AI generation limit. Upgrade to a paid plan for unlimited conflict generation."
        feature="AI conflict generations"
      />
    </div>
  );
}
