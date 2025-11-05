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
import { GeneratorNotebookControls } from "@/components/GeneratorNotebookControls";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Leaf, Copy, Save, Shuffle, Loader2 } from "lucide-react";
import { GENRE_CATEGORIES } from "@shared/genres";
import { useGenerator } from "@/hooks/useGenerator";
import { useRequireNotebook } from "@/hooks/useRequireNotebook";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { PolishButton } from "@/components/PolishButton";

interface Plant {
  id?: string;
  name: string;
  scientificName: string;
  type: string;
  description: string;
  characteristics: string[];
  habitat: string;
  careInstructions: string;
  bloomingSeason: string;
  hardinessZone: string;
  genre?: string | null;
  userId?: string | null;
  createdAt?: string;
}

const PLANT_TYPE_CATEGORIES = {
  "Basic Types": [
    "annual",
    "perennial",
    "bulb",
    "tree",
    "shrub",
    "bush",
    "flower",
    "herb",
    "vegetable",
    "fruit",
  ],
  Specialized: [
    "aquatic plant",
    "bamboo",
    "cactus",
    "succulent",
    "climber",
    "conifer",
    "fern",
    "houseplant",
    "orchid",
    "ornamental grass",
    "palm",
    "rose",
  ],
  Advanced: [
    "fungi",
    "nut",
    "seed",
    "creeper",
    "moss",
    "flowering plant",
    "gymnosperm",
    "angiosperm",
    "legume",
    "spice",
    "grass",
    "heather",
    "hedge",
    "alpine",
    "carnivorous",
    "lichen",
  ],
};

export default function PlantGenerator() {
  const [genre, setGenre] = useState<string>("");
  const [plantType, setPlantType] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  const { notebookId, validateNotebook } = useRequireNotebook({
    errorMessage:
      "Please create or select a notebook before generating plants.",
  });

  const generator = useGenerator<Plant>({
    generateEndpoint: "/api/plants/generate",
    getGenerateParams: () => ({
      genre: genre && genre !== "any" ? genre : undefined,
      type: plantType && plantType !== "any" ? plantType : undefined,
      notebookId: notebookId || undefined,
    }),
    itemTypeName: "plant",
    userId: "demo-user",
    notebookId: notebookId || undefined,
    validateBeforeGenerate: validateNotebook,
    formatForClipboard: (plant) => `**${plant.name}**
Scientific Name: ${plant.scientificName}
Type: ${capitalizeWords(plant.type)}

${plant.description}

Characteristics: ${plant.characteristics.join(", ")}

Habitat: ${plant.habitat}

Care Instructions:
${plant.careInstructions}

Blooming Season: ${plant.bloomingSeason}
Hardiness Zone: ${plant.hardinessZone}`,
    invalidateOnSave: [["/api/saved-items"]],
  });

  const currentPlant = generator.result;

  const capitalizeWords = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plant Generator</CardTitle>
          <CardDescription>
            Create unique plants and flora for your world
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratorNotebookControls />

          <div className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Genre (Optional)
                </label>
                <SearchableSelect
                  value={genre}
                  onValueChange={setGenre}
                  categorizedOptions={GENRE_CATEGORIES}
                  placeholder="Any genre..."
                  searchPlaceholder="Search genres..."
                  emptyText="No genre found."
                  testId="select-genre"
                  allowEmpty={true}
                  emptyLabel="Any Genre"
                  formatLabel={(value) => capitalizeWords(value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Plant Type (Optional)
                </label>
                <SearchableSelect
                  value={plantType}
                  onValueChange={setPlantType}
                  categorizedOptions={PLANT_TYPE_CATEGORIES}
                  placeholder="Any type..."
                  searchPlaceholder="Search plant types..."
                  emptyText="No plant type found."
                  testId="select-plant-type"
                  allowEmpty={true}
                  emptyLabel="Any Type"
                  formatLabel={(value) => capitalizeWords(value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={generator.generate}
              disabled={generator.isGenerating}
              data-testid="button-generate-plant"
            >
              {generator.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Plant"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentPlant && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{currentPlant.name}</CardTitle>
                <CardDescription className="text-base mt-1">
                  <em>{currentPlant.scientificName}</em> •{" "}
                  {capitalizeWords(currentPlant.type)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <PolishButton
                  content={currentPlant.description}
                  contentType="plant"
                  onPolished={(polished) => {
                    generator.setResult({
                      ...currentPlant,
                      description: polished,
                    });
                  }}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generator.copyToClipboard}
                        data-testid="button-copy-plant"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy to clipboard</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generator.saveToCollection}
                        disabled={
                          generator.isSaving || !currentPlant?.id || !notebookId
                        }
                        data-testid="button-save-plant"
                      >
                        {generator.isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save to notebook</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">
                {currentPlant.description}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Characteristics</h4>
              <div className="flex flex-wrap gap-2">
                {currentPlant.characteristics.map((char, idx) => (
                  <Badge key={idx} variant="secondary">
                    {char}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Habitat</h4>
                <p className="text-muted-foreground">{currentPlant.habitat}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Blooming Season</h4>
                <p className="text-muted-foreground">
                  {currentPlant.bloomingSeason}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Care Instructions</h4>
              <p className="text-muted-foreground">
                {currentPlant.careInstructions}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Hardiness Zone</h4>
              <p className="text-muted-foreground">
                {currentPlant.hardinessZone}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt */}
      <UpgradePrompt
        open={generator.showUpgradePrompt}
        onOpenChange={generator.setShowUpgradePrompt}
        title="AI Generation Limit Reached"
        description="You've reached your daily AI generation limit. Upgrade to a paid plan for unlimited plant generation."
        feature="AI plant generations"
      />
    </div>
  );
}
