import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  MapPin,
  Lightbulb,
  Plus,
  Edit,
  type LucideIcon,
} from "lucide-react";

interface EntityActionCardProps {
  entity: {
    type: "character" | "location" | "plotPoint";
    name: string;
    confidence: number;
    details: any;
  };
  onCreateNew: () => void;
  onUpdateExisting?: () => void;
  existingEntity?: any;
}

// Map entity types to icons and colors
const entityConfig: Record<
  string,
  { icon: LucideIcon; label: string; color: string }
> = {
  character: {
    icon: User,
    label: "Character",
    color: "text-blue-600",
  },
  location: {
    icon: MapPin,
    label: "Location",
    color: "text-green-600",
  },
  plotPoint: {
    icon: Lightbulb,
    label: "Plot Point",
    color: "text-purple-600",
  },
};

export default function EntityActionCard({
  entity,
  onCreateNew,
  onUpdateExisting,
  existingEntity,
}: EntityActionCardProps) {
  const config = entityConfig[entity.type];
  const Icon = config.icon;

  // Only show entities with high confidence
  if (entity.confidence < 0.75) {
    return null;
  }

  // Get a brief preview of the entity details
  const getPreview = () => {
    if (entity.type === "character") {
      const parts = [];
      if (entity.details.species) parts.push(entity.details.species);
      if (entity.details.occupation) parts.push(entity.details.occupation);
      if (entity.details.personality) {
        const personalityPreview = entity.details.personality.split(".")[0];
        parts.push(personalityPreview);
      }
      return parts.slice(0, 2).join(" • ");
    } else if (entity.type === "location") {
      return (
        entity.details.description?.split(".")[0] ||
        "Location details extracted"
      );
    } else {
      return (
        entity.details.description?.split(".")[0] ||
        "Plot point details extracted"
      );
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-background border rounded-lg hover-elevate">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${config.color}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm">{entity.name}</h4>
          <Badge variant="secondary" className="text-xs">
            {config.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {Math.round(entity.confidence * 100)}% match
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {getPreview()}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={onCreateNew}
                className="h-7 text-xs"
                data-testid={`create-entity-${entity.type}-${entity.name}`}
              >
                <Plus className="w-3 h-3 mr-1" />
                Create {config.label}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Create a new {config.label.toLowerCase()} with extracted details
              </p>
            </TooltipContent>
          </Tooltip>

          {existingEntity && onUpdateExisting && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUpdateExisting}
                  className="h-7 text-xs"
                  data-testid={`update-entity-${entity.type}-${entity.name}`}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Update Existing
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Update the existing {config.label.toLowerCase()}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
