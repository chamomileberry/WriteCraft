import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Zap, Copy, Save, RefreshCw, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WritingPrompt {
  id: string;
  text: string;
  genre: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Story Starter' | 'Character Focus' | 'Dialogue' | 'Setting' | 'Conflict';
  wordCount: string;
  tags: string[];
}

// TODO: Replace with real prompt data
const promptTemplates = {
  fantasy: [
    "A young apprentice discovers their magic teacher has been secretly...",
    "In a world where dragons are extinct, someone finds a living egg...",
    "The kingdom's most powerful wizard loses their magic on the day they need it most..."
  ],
  'sci-fi': [
    "Earth receives a message from space, but it's from humans who left centuries ago...",
    "A time traveler keeps trying to prevent a disaster, but each attempt makes it worse...",
    "The last human on Earth discovers they're not alone after all..."
  ],
  romance: [
    "Two rival coffee shop owners are forced to work together when their buildings merge...",
    "A wedding planner falls in love with someone who's sworn off marriage...",
    "Love letters meant for someone else keep appearing in your mailbox..."
  ],
  mystery: [
    "A detective realizes the serial killer they're hunting is someone they know...",
    "Everyone in town claims to have an alibi for the same exact time...",
    "A murder victim keeps leaving clues from beyond the grave..."
  ],
  thriller: [
    "You wake up in a room with no memory and a countdown timer showing 24 hours...",
    "Your identical twin, who died years ago, appears at your door...",
    "Every night at midnight, you receive a call from your own phone number..."
  ],
  contemporary: [
    "A social media influencer discovers their entire online life has been fabricated...",
    "Two strangers get stuck in an elevator and realize they've ruined each other's lives...",
    "A person inherits a house and finds diary entries that predict their future..."
  ]
};

const promptTypes = ['Story Starter', 'Character Focus', 'Dialogue', 'Setting', 'Conflict'];
const difficulties = ['Easy', 'Medium', 'Hard'];
const wordCounts = ['500-1000 words', '1000-2500 words', '2500-5000 words', '5000+ words'];

export default function WritingPrompts() {
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const [genre, setGenre] = useState<string>("");
  const [promptType, setPromptType] = useState<string>("");
  const [savedPrompts, setSavedPrompts] = useState<WritingPrompt[]>([]);
  const { toast } = useToast();

  const generatePrompt = () => {
    const selectedGenre = (genre && genre !== 'any') ? genre : Object.keys(promptTemplates)[Math.floor(Math.random() * Object.keys(promptTemplates).length)];
    const templates = promptTemplates[selectedGenre as keyof typeof promptTemplates];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    const newPrompt: WritingPrompt = {
      id: Date.now().toString(),
      text: randomTemplate,
      genre: selectedGenre,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)] as 'Easy' | 'Medium' | 'Hard',
      type: ((promptType && promptType !== 'any') ? promptType : promptTypes[Math.floor(Math.random() * promptTypes.length)]) as WritingPrompt['type'],
      wordCount: wordCounts[Math.floor(Math.random() * wordCounts.length)],
      tags: [selectedGenre, 'creative writing', 'inspiration']
    };

    setCurrentPrompt(newPrompt);
    console.log('Generated prompt:', newPrompt);
  };

  const copyPrompt = () => {
    if (!currentPrompt) return;
    
    const text = `**Writing Prompt** (${currentPrompt.genre} - ${currentPrompt.type})

${currentPrompt.text}

**Target Length:** ${currentPrompt.wordCount}
**Difficulty:** ${currentPrompt.difficulty}`;
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Prompt copied!",
      description: "Writing prompt has been copied to your clipboard.",
    });
  };

  const savePrompt = () => {
    if (!currentPrompt) return;
    
    setSavedPrompts(prev => {
      const updated = [currentPrompt, ...prev].slice(0, 10); // Keep last 10
      return updated;
    });
    
    console.log('Save prompt:', currentPrompt);
    toast({
      title: "Prompt saved!",
      description: "Writing prompt has been saved to your collection.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-chart-4/10 text-chart-4';
      case 'Medium': return 'bg-chart-3/10 text-chart-3';
      case 'Hard': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted';
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Story Starter': 'bg-primary/10 text-primary',
      'Character Focus': 'bg-chart-2/10 text-chart-2',
      'Dialogue': 'bg-chart-3/10 text-chart-3',
      'Setting': 'bg-chart-4/10 text-chart-4',
      'Conflict': 'bg-destructive/10 text-destructive'
    };
    return colors[type as keyof typeof colors] || 'bg-muted';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Writing Prompt Generator
          </CardTitle>
          <CardDescription>
            Get inspired with creative writing prompts tailored to your preferred genre and style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger data-testid="select-prompt-genre">
                <SelectValue placeholder="Any genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Genre</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="sci-fi">Science Fiction</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="thriller">Thriller</SelectItem>
                <SelectItem value="contemporary">Contemporary</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={promptType} onValueChange={setPromptType}>
              <SelectTrigger data-testid="select-prompt-type">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                {promptTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={generatePrompt}
              data-testid="button-generate-prompt"
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              Generate Prompt
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentPrompt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getDifficultyColor(currentPrompt.difficulty)}>
                  {currentPrompt.difficulty}
                </Badge>
                <Badge className={getTypeColor(currentPrompt.type)}>
                  {currentPrompt.type}
                </Badge>
                <Badge variant="outline">
                  {currentPrompt.genre}
                </Badge>
                <Badge variant="outline">
                  {currentPrompt.wordCount}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generatePrompt} data-testid="button-refresh-prompt">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={copyPrompt} data-testid="button-copy-prompt">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={savePrompt} data-testid="button-save-prompt">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 p-6 rounded-lg border-l-4 border-primary">
                <p className="text-lg leading-relaxed">{currentPrompt.text}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {currentPrompt.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {savedPrompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saved Prompts</CardTitle>
            <CardDescription>Your recently saved writing prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedPrompts.slice(0, 3).map((prompt, index) => (
                <div key={prompt.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(prompt.difficulty)} variant="outline">
                        {prompt.difficulty}
                      </Badge>
                      <Badge variant="outline">{prompt.genre}</Badge>
                      <Badge variant="outline">{prompt.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {prompt.text}
                    </p>
                  </div>
                </div>
              ))}
              {savedPrompts.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" data-testid="button-view-all-saved">
                    View all {savedPrompts.length} saved prompts
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}