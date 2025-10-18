import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Sparkles, 
  BookMarked,
  CheckCircle2,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface NewUserTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  userId: string;
}

interface CharacterData {
  name: string;
  backstory: string;
  personalityTraits: string;
  appearance: string;
}

const tutorialSteps = [
  {
    step: 1,
    title: "Let's Create Your First Character",
    description: "Every great story starts with compelling characters. Let's build one together using AI.",
  },
  {
    step: 2,
    title: "Generating Your Character",
    description: "Our AI is creating a unique character based on your input...",
  },
  {
    step: 3,
    title: "Character Created!",
    description: "Here's your character. You can edit anything you'd like to change.",
  },
  {
    step: 4,
    title: "All Set!",
    description: "Your character has been saved. Let's explore what else you can do.",
  }
];

export function NewUserTutorial({ isOpen, onComplete, onSkip, userId }: NewUserTutorialProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [characterPrompt, setCharacterPrompt] = useState("");
  const [generatedCharacter, setGeneratedCharacter] = useState<CharacterData | null>(null);
  const [notebookId, setNotebookId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const stepData = tutorialSteps.find(s => s.step === currentStep) || tutorialSteps[0];
  const progress = (currentStep / tutorialSteps.length) * 100;

  // Create a default notebook for the tutorial
  const createNotebook = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/notebooks', {
        name: "My First Notebook",
        description: "Created during onboarding",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setNotebookId(data.id);
    },
    onError: (error) => {
      console.error('Failed to create notebook:', error);
      toast({
        title: "Error",
        description: "Failed to set up tutorial. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create notebook on mount if not exists
  useEffect(() => {
    if (!notebookId && isOpen) {
      createNotebook.mutate();
    }
  }, [isOpen]);

  // Generate character mutation
  const generateCharacter = useMutation({
    mutationFn: async (prompt: string) => {
      if (!notebookId) {
        throw new Error("Notebook not ready");
      }
      const response = await apiRequest('POST', '/api/characters/generate', {
        prompt: prompt || "a mysterious traveler with a hidden past",
        genre: "fantasy",
        notebookId: notebookId
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedCharacter({
        name: data.name || "Unknown Traveler",
        backstory: data.backstory || "",
        personalityTraits: Array.isArray(data.personalityTraits) 
          ? data.personalityTraits.join(", ") 
          : data.personalityTraits || "",
        appearance: data.appearance || ""
      });
      setCurrentStep(3);
    },
    onError: (error) => {
      console.error('Failed to generate character:', error);
      toast({
        title: "Error",
        description: "Failed to generate character. Please try again.",
        variant: "destructive",
      });
      setCurrentStep(1);
    }
  });

  // Save character mutation
  const saveCharacter = useMutation({
    mutationFn: async () => {
      if (!generatedCharacter) throw new Error("No character to save");
      
      const response = await apiRequest('POST', '/api/characters', {
        name: generatedCharacter.name,
        backstory: generatedCharacter.backstory,
        personalityTraits: generatedCharacter.personalityTraits.split(",").map(t => t.trim()),
        appearance: generatedCharacter.appearance,
        role: "protagonist",
        age: null,
        gender: null,
        occupation: null,
        skills: [],
        weaknesses: [],
        motivations: [],
        fears: [],
        relationships: [],
        conflictStyle: null,
        characterArc: null,
        notebookId: null,
        projectId: null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      setCurrentStep(4);
      toast({
        title: "Character Saved!",
        description: "Your first character has been created.",
      });
    },
    onError: (error) => {
      console.error('Failed to save character:', error);
      toast({
        title: "Error",
        description: "Failed to save character. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    setCurrentStep(2);
    generateCharacter.mutate(characterPrompt);
  };

  const handleSave = () => {
    saveCharacter.mutate();
  };

  const handleFinish = () => {
    onComplete();
    // Navigate to characters page to show them their creation
    setTimeout(() => setLocation('/characters'), 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" data-testid="dialog-new-tutorial">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {currentStep === 1 && <User className="w-6 h-6 text-primary" />}
            {currentStep === 2 && <Sparkles className="w-6 h-6 text-primary animate-pulse" />}
            {currentStep === 3 && <BookMarked className="w-6 h-6 text-primary" />}
            {currentStep === 4 && <CheckCircle2 className="w-6 h-6 text-primary" />}
            <DialogTitle className="text-xl">{stepData.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {stepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Input */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="character-prompt">Describe your character (optional)</Label>
                <Textarea
                  id="character-prompt"
                  placeholder="e.g., a brave knight from a fallen kingdom, a cunning space pirate, a shy wizard apprentice..."
                  value={characterPrompt}
                  onChange={(e) => setCharacterPrompt(e.target.value)}
                  rows={4}
                  data-testid="input-character-prompt"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank for a surprise character, or describe what you'd like to create
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {currentStep === 2 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Creating your character...</p>
            </div>
          )}

          {/* Step 3: Review Generated Character */}
          {currentStep === 3 && generatedCharacter && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="char-name">Name</Label>
                <Input
                  id="char-name"
                  value={generatedCharacter.name}
                  onChange={(e) => setGeneratedCharacter({
                    ...generatedCharacter,
                    name: e.target.value
                  })}
                  data-testid="input-character-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="char-backstory">Backstory</Label>
                <Textarea
                  id="char-backstory"
                  value={generatedCharacter.backstory}
                  onChange={(e) => setGeneratedCharacter({
                    ...generatedCharacter,
                    backstory: e.target.value
                  })}
                  rows={4}
                  data-testid="input-character-backstory"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="char-traits">Personality Traits</Label>
                <Input
                  id="char-traits"
                  value={generatedCharacter.personalityTraits}
                  onChange={(e) => setGeneratedCharacter({
                    ...generatedCharacter,
                    personalityTraits: e.target.value
                  })}
                  data-testid="input-character-traits"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="char-appearance">Appearance</Label>
                <Textarea
                  id="char-appearance"
                  value={generatedCharacter.appearance}
                  onChange={(e) => setGeneratedCharacter({
                    ...generatedCharacter,
                    appearance: e.target.value
                  })}
                  rows={3}
                  data-testid="input-character-appearance"
                />
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-6 space-y-3">
                <h3 className="font-semibold">What's Next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Your character is saved and you can find it in the Characters page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Try other generators from the top menu to build your world</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Create a Project to organize all your worldbuilding content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Use the Writing Assistant for help with your story</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {tutorialSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={currentStep === 2 || saveCharacter.isPending}
            data-testid="button-skip-tutorial"
          >
            Skip Tutorial
          </Button>
          <div className="flex gap-2 ml-auto">
            {currentStep === 1 && (
              <Button
                onClick={handleGenerate}
                disabled={generateCharacter.isPending}
                data-testid="button-generate-character"
              >
                Create Character <Sparkles className="w-4 h-4 ml-1" />
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                onClick={handleSave}
                disabled={saveCharacter.isPending}
                data-testid="button-save-character"
              >
                {saveCharacter.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Character <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                onClick={handleFinish}
                data-testid="button-finish-tutorial"
              >
                View My Character <CheckCircle2 className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
