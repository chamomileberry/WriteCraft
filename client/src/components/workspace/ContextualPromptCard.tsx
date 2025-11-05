import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Lightbulb,
  MessageCircle,
  Map,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";

interface ContextualPromptCardProps {
  topic: string;
  confidence: number;
  reason?: string;
  onSelect: () => void;
  isActive?: boolean;
}

// Map topics to icons and prompt text
const topicConfig: Record<
  string,
  { icon: LucideIcon; label: string; prompt: string; description: string }
> = {
  plot: {
    icon: Map,
    label: "Analyze Plot",
    prompt:
      "Analyze the plot structure and check for potential plot holes or inconsistencies",
    description: "Check for plot holes and pacing issues",
  },
  character: {
    icon: Users,
    label: "Develop Character",
    prompt:
      "Help me develop this character further with backstory, motivations, and personality details",
    description: "Expand character depth and backstory",
  },
  dialogue: {
    icon: MessageCircle,
    label: "Improve Dialogue",
    prompt: "Review and suggest improvements for the dialogue we discussed",
    description: "Enhance dialogue quality and flow",
  },
  setting: {
    icon: Map,
    label: "Expand Setting",
    prompt:
      "Help me develop this setting with more sensory details and world-building",
    description: "Add depth to locations and atmosphere",
  },
  worldbuilding: {
    icon: Sparkles,
    label: "Build World",
    prompt:
      "Suggest world-building details and elements to make this world feel more alive",
    description: "Enhance world consistency and depth",
  },
  pacing: {
    icon: Wand2,
    label: "Check Pacing",
    prompt:
      "Analyze the pacing and suggest areas where it might be too slow or too fast",
    description: "Review story rhythm and flow",
  },
  theme: {
    icon: Lightbulb,
    label: "Explore Theme",
    prompt: "Help me explore and deepen the thematic elements we discussed",
    description: "Strengthen thematic resonance",
  },
  conflict: {
    icon: Sparkles,
    label: "Heighten Conflict",
    prompt:
      "Suggest ways to increase tension and raise the stakes in this conflict",
    description: "Intensify dramatic tension",
  },
  prose: {
    icon: FileText,
    label: "Polish Prose",
    prompt:
      "Review the prose style and suggest improvements for clarity and impact",
    description: "Refine writing style and clarity",
  },
  grammar: {
    icon: CheckCircle,
    label: "Check Grammar",
    prompt: "Proofread for grammar, spelling, and punctuation issues",
    description: "Fix grammar and spelling errors",
  },
};

export default function ContextualPromptCard({
  topic,
  confidence,
  reason,
  onSelect,
  isActive = false,
}: ContextualPromptCardProps) {
  const config = topicConfig[topic] || {
    icon: HelpCircle,
    label: "Explore Topic",
    prompt: `Help me explore this topic further`,
    description: "Get AI assistance",
  };

  const Icon = config.icon;

  // Only show prompts with confidence > 0.65
  if (confidence < 0.65) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={onSelect}
          className={`h-auto py-2 px-3 flex items-start gap-2 hover-elevate ${
            isActive ? "bg-accent" : ""
          }`}
          data-testid={`contextual-prompt-${topic}`}
        >
          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium">{config.label}</div>
            <div className="text-xs text-muted-foreground truncate">
              {config.description}
            </div>
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs font-medium mb-1">{config.label}</p>
        <p className="text-xs text-muted-foreground">
          {reason || config.description}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Confidence: {Math.round(confidence * 100)}%
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
