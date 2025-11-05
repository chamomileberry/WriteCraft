import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, BookOpen, Rocket, Users } from "lucide-react";
import { ExperiencedUserTour } from "./ExperiencedUserTour";
import { NewUserTutorial } from "./NewUserTutorial";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function OnboardingWizard({
  isOpen,
  onClose,
  userId,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<
    "welcome" | "experienced-tour" | "new-tutorial"
  >("welcome");
  const { toast } = useToast();

  const handleExperienceSelection = async (
    level: "new_to_worldbuilding" | "experienced_worldbuilder",
  ) => {
    try {
      // Update user preferences with experience level
      await apiRequest("PATCH", "/api/user/preferences", {
        experienceLevel: level,
        onboardingStep: 1,
      });

      // Route to appropriate onboarding flow
      if (level === "experienced_worldbuilder") {
        setStep("experienced-tour");
      } else {
        setStep("new-tutorial");
      }
    } catch (error) {
      console.error("Failed to update experience level:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkipOnboarding = async () => {
    try {
      await apiRequest("PATCH", "/api/user/preferences", {
        onboardingCompleted: true,
        onboardingStep: 999,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onClose();
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      onClose();
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await apiRequest("PATCH", "/api/user/preferences", {
        onboardingCompleted: true,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onClose();

      toast({
        title: "Welcome to WriteCraft!",
        description: "You're all set to start building amazing worlds.",
      });
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      onClose();
    }
  };

  // Show experienced tour or new tutorial if selected
  if (step === "experienced-tour") {
    return (
      <ExperiencedUserTour
        isOpen={isOpen}
        onComplete={handleCompleteOnboarding}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  if (step === "new-tutorial") {
    return (
      <NewUserTutorial
        isOpen={isOpen}
        onComplete={handleCompleteOnboarding}
        onSkip={handleSkipOnboarding}
        userId={userId}
      />
    );
  }

  // Welcome screen
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-3xl"
        data-testid="dialog-onboarding-welcome"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <DialogTitle className="text-2xl">
              Welcome to WriteCraft!
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Your creative writing and worldbuilding companion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-muted-foreground">
            WriteCraft helps you create rich, detailed worlds for your stories
            with AI-powered generators, organizational tools, and writing
            guides. Let's get you started!
          </p>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">
              How would you describe yourself?
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Card
                className="cursor-pointer hover-elevate active-elevate-2 transition-all"
                onClick={() =>
                  handleExperienceSelection("new_to_worldbuilding")
                }
                data-testid="card-experience-new"
              >
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">
                      New to Worldbuilding
                    </CardTitle>
                  </div>
                  <CardDescription>
                    I'm just getting started with creating fictional worlds and
                    need guidance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We'll guide you through creating your first character
                    step-by-step
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover-elevate active-elevate-2 transition-all"
                onClick={() =>
                  handleExperienceSelection("experienced_worldbuilder")
                }
                data-testid="card-experience-experienced"
              >
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">
                      Experienced Worldbuilder
                    </CardTitle>
                  </div>
                  <CardDescription>
                    I've built worlds before and just want a quick tour of the
                    features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Quick overview of the tools and you'll be ready to go
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleSkipOnboarding}
              data-testid="button-skip-onboarding"
            >
              I'll explore on my own
            </Button>
            <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Join thousands of writers building amazing worlds
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
