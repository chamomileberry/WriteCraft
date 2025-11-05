import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, MapPin, Lightbulb, Check, X } from "lucide-react";

interface EntityPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: {
    type: "character" | "location" | "plotPoint";
    name: string;
    confidence: number;
    details: any;
  } | null;
  onConfirm: (editedDetails: any) => void;
  onCancel: () => void;
}

export default function EntityPreviewDialog({
  open,
  onOpenChange,
  entity,
  onConfirm,
  onCancel,
}: EntityPreviewDialogProps) {
  const [editedDetails, setEditedDetails] = useState<any>(
    entity?.details || {},
  );

  // Update edited details when entity changes - use useEffect to avoid render loop
  useEffect(() => {
    if (entity?.details) {
      setEditedDetails(entity.details);
    }
  }, [entity]);

  if (!entity) return null;

  const handleConfirm = () => {
    onConfirm(editedDetails);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const iconMap = {
    character: User,
    location: MapPin,
    plotPoint: Lightbulb,
  };

  const Icon = iconMap[entity.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                Create{" "}
                {entity.type === "character"
                  ? "Character"
                  : entity.type === "location"
                    ? "Location"
                    : "Plot Point"}
              </DialogTitle>
              <DialogDescription>
                Review and edit the details extracted from your conversation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {/* Character-specific fields */}
            {entity.type === "character" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="givenName">Given Name</Label>
                    <Input
                      id="givenName"
                      value={editedDetails.givenName || ""}
                      onChange={(e) =>
                        setEditedDetails({
                          ...editedDetails,
                          givenName: e.target.value,
                        })
                      }
                      placeholder="First name"
                      data-testid="input-given-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyName">Family Name</Label>
                    <Input
                      id="familyName"
                      value={editedDetails.familyName || ""}
                      onChange={(e) =>
                        setEditedDetails({
                          ...editedDetails,
                          familyName: e.target.value,
                        })
                      }
                      placeholder="Last name"
                      data-testid="input-family-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="species">Species</Label>
                    <Input
                      id="species"
                      value={editedDetails.species || ""}
                      onChange={(e) =>
                        setEditedDetails({
                          ...editedDetails,
                          species: e.target.value,
                        })
                      }
                      placeholder="Human, Elf, etc."
                      data-testid="input-species"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      value={editedDetails.age || ""}
                      onChange={(e) =>
                        setEditedDetails({
                          ...editedDetails,
                          age: e.target.value,
                        })
                      }
                      placeholder="Age or age range"
                      data-testid="input-age"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={editedDetails.occupation || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        occupation: e.target.value,
                      })
                    }
                    placeholder="What they do"
                    data-testid="input-occupation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="physicalDescription">
                    Physical Description
                  </Label>
                  <Textarea
                    id="physicalDescription"
                    value={editedDetails.physicalDescription || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        physicalDescription: e.target.value,
                      })
                    }
                    placeholder="Appearance details..."
                    rows={3}
                    data-testid="input-physical-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personality">Personality</Label>
                  <Textarea
                    id="personality"
                    value={editedDetails.personality || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        personality: e.target.value,
                      })
                    }
                    placeholder="Personality traits..."
                    rows={3}
                    data-testid="input-personality"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backstory">Backstory</Label>
                  <Textarea
                    id="backstory"
                    value={editedDetails.backstory || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        backstory: e.target.value,
                      })
                    }
                    placeholder="Character's history..."
                    rows={4}
                    data-testid="input-backstory"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivations">Motivations</Label>
                  <Textarea
                    id="motivations"
                    value={editedDetails.motivations || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        motivations: e.target.value,
                      })
                    }
                    placeholder="What drives them..."
                    rows={3}
                    data-testid="input-motivations"
                  />
                </div>

                {editedDetails.abilities && (
                  <div className="space-y-2">
                    <Label htmlFor="abilities">Abilities</Label>
                    <Textarea
                      id="abilities"
                      value={editedDetails.abilities || ""}
                      onChange={(e) =>
                        setEditedDetails({
                          ...editedDetails,
                          abilities: e.target.value,
                        })
                      }
                      placeholder="Special skills or powers..."
                      rows={3}
                      data-testid="input-abilities"
                    />
                  </div>
                )}
              </>
            )}

            {/* Location-specific fields */}
            {entity.type === "location" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    value={editedDetails.name || entity.name}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        name: e.target.value,
                      })
                    }
                    placeholder="Name of the location"
                    data-testid="input-location-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedDetails.description || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe this location..."
                    rows={5}
                    data-testid="input-location-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="atmosphere">Atmosphere</Label>
                  <Textarea
                    id="atmosphere"
                    value={editedDetails.atmosphere || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        atmosphere: e.target.value,
                      })
                    }
                    placeholder="Mood and feeling of this place..."
                    rows={3}
                    data-testid="input-atmosphere"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="significance">Significance</Label>
                  <Textarea
                    id="significance"
                    value={editedDetails.significance || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        significance: e.target.value,
                      })
                    }
                    placeholder="Why is this location important?"
                    rows={3}
                    data-testid="input-significance"
                  />
                </div>
              </>
            )}

            {/* Plot Point-specific fields */}
            {entity.type === "plotPoint" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Plot Point Name</Label>
                  <Input
                    id="name"
                    value={editedDetails.name || entity.name}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        name: e.target.value,
                      })
                    }
                    placeholder="Name of the plot point"
                    data-testid="input-plot-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedDetails.description || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        description: e.target.value,
                      })
                    }
                    placeholder="What happens in this plot point..."
                    rows={5}
                    data-testid="input-plot-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="significance">Significance</Label>
                  <Textarea
                    id="significance"
                    value={editedDetails.significance || ""}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        significance: e.target.value,
                      })
                    }
                    placeholder="Impact on the story..."
                    rows={3}
                    data-testid="input-plot-significance"
                  />
                </div>
              </>
            )}

            {/* Confidence badge */}
            <div className="pt-2">
              <Badge variant="secondary" className="text-xs">
                Extracted with {Math.round(entity.confidence * 100)}% confidence
              </Badge>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-entity"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleConfirm} data-testid="button-confirm-entity">
            <Check className="w-4 h-4 mr-2" />
            Create{" "}
            {entity.type === "character"
              ? "Character"
              : entity.type === "location"
                ? "Location"
                : "Plot Point"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
