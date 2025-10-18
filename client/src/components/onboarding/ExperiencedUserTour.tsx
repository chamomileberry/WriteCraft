import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  BookText, 
  FolderTree, 
  Palette, 
  MessageSquare,
  ArrowRight,
  Check
} from "lucide-react";

interface ExperiencedUserTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps = [
  {
    title: "AI-Powered Generators",
    icon: Sparkles,
    description: "Create characters, worlds, plots, and more with AI assistance. Access 40+ specialized generators from the top menu.",
    features: [
      "Character & World Builders",
      "Plot & Conflict Generators",
      "Writing Prompts & Ideas",
      "Magic Systems & Cultures"
    ]
  },
  {
    title: "Writing Guides & Assistant",
    icon: BookText,
    description: "Access comprehensive writing guides and get real-time AI assistance while you write.",
    features: [
      "Expert Writing Guides",
      "Conversational AI Assistant",
      "Context-Aware Suggestions",
      "Literary Examples & Tips"
    ]
  },
  {
    title: "Organize with Projects",
    icon: FolderTree,
    description: "Keep everything organized with Projects and Notebooks. Link related content and track your worldbuilding.",
    features: [
      "Hierarchical Projects",
      "Rich Text Notebooks",
      "Timeline & Family Trees",
      "Cross-Reference Content"
    ]
  },
  {
    title: "Visual Canvas",
    icon: Palette,
    description: "Create visual diagrams, character relationship maps, and story structures on an infinite canvas.",
    features: [
      "Story Diagrams & Mind Maps",
      "Character Relationship Graphs",
      "Plot Structure Visualization",
      "Link to Projects"
    ]
  }
];

export function ExperiencedUserTour({ isOpen, onComplete, onSkip }: ExperiencedUserTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const step = tourSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl" 
        data-testid="dialog-experienced-tour"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-6 h-6 text-primary" />
            <DialogTitle className="text-xl">{step.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ul className="space-y-3">
            {step.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={onSkip}
            data-testid="button-skip-tour"
          >
            Skip Tour
          </Button>
          <div className="flex gap-2 ml-auto">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                data-testid="button-tour-previous"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              data-testid="button-tour-next"
            >
              {currentStep < tourSteps.length - 1 ? (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Get Started <Check className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
