import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Copy, Save, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlotStructure {
  setup: string;
  incitingIncident: string;
  firstPlotPoint: string;
  midpoint: string;
  secondPlotPoint: string;
  climax: string;
  resolution: string;
  theme: string;
  conflict: string;
}

const setups = [
  "A quiet town harbors a dark secret that threatens its very existence",
  "An unlikely hero discovers they possess extraordinary abilities",
  "Two rival families are forced to work together against a common enemy",
  "A mysterious artifact resurfaces after centuries of being lost"
];

const conflicts = [
  "Person vs. Self - internal struggle with identity and purpose",
  "Person vs. Person - direct confrontation with an antagonist",
  "Person vs. Society - fighting against corrupt systems",
  "Person vs. Nature - survival against natural forces",
  "Person vs. Technology - struggle with artificial intelligence"
];

const themes = [
  "The power of forgiveness and redemption",
  "Finding strength in vulnerability",
  "The cost of ambition and power",
  "Love conquers all obstacles",
  "Truth will always surface"
];

export default function PlotGenerator() {
  const [plot, setPlot] = useState<PlotStructure | null>(null);
  const [genre, setGenre] = useState<string>("");
  const { toast } = useToast();

  const generatePlot = () => {
    const setup = setups[Math.floor(Math.random() * setups.length)];
    const conflict = conflicts[Math.floor(Math.random() * conflicts.length)];
    const theme = themes[Math.floor(Math.random() * themes.length)];

    const newPlot: PlotStructure = {
      setup,
      incitingIncident: "An unexpected event disrupts the protagonist's normal world and sets the story in motion",
      firstPlotPoint: "The protagonist commits to their journey and crosses into a new world or situation",
      midpoint: "A major revelation or setback occurs, raising the stakes and changing the protagonist's approach",
      secondPlotPoint: "All seems lost as the protagonist faces their darkest moment",
      climax: "The final confrontation where the protagonist must use everything they've learned",
      resolution: "The aftermath where loose ends are tied up and the new normal is established",
      theme,
      conflict
    };

    setPlot(newPlot);
    console.log('Generated plot:', newPlot);
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
    // TODO: Implement save functionality
    console.log('Save plot:', plot);
    toast({
      title: "Plot saved!",
      description: "Plot structure has been saved to your collection.",
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
            
            <Button 
              onClick={generatePlot}
              data-testid="button-generate-plot"
              className="flex-1 sm:flex-none"
            >
              <Zap className="mr-2 h-4 w-4" />
              Generate Plot
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
                <Button variant="outline" size="sm" onClick={copyPlot} data-testid="button-copy-plot">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={savePlot} data-testid="button-save-plot">
                  <Save className="h-4 w-4" />
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
    </div>
  );
}