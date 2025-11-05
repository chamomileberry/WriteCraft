import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Heart, Baby, UserPlus } from "lucide-react";
import type { FamilyTreeMember } from "@shared/schema";

export type RelationshipType = "parent" | "spouse" | "child" | "sibling";

type MemberWithCharacter = FamilyTreeMember & {
  character?: {
    id: string;
    givenName: string | null;
    familyName: string | null;
    middleName: string | null;
    nickname: string | null;
  } | null;
};

interface AddRelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberWithCharacter | null;
  onSelectRelationshipType: (type: RelationshipType) => void;
}

export function AddRelationshipDialog({
  open,
  onOpenChange,
  member,
  onSelectRelationshipType,
}: AddRelationshipDialogProps) {
  if (!member) return null;

  const relationshipOptions = [
    {
      type: "parent" as RelationshipType,
      label: "Add Parent",
      description: "Add a parent (will be positioned above)",
      icon: Users,
    },
    {
      type: "spouse" as RelationshipType,
      label: "Add Spouse",
      description: "Add a spouse or partner (positioned beside)",
      icon: Heart,
    },
    {
      type: "child" as RelationshipType,
      label: "Add Child",
      description: "Add a child (will be positioned below)",
      icon: Baby,
    },
    {
      type: "sibling" as RelationshipType,
      label: "Add Sibling",
      description: "Add a sibling (positioned on same level)",
      icon: UserPlus,
    },
  ];

  const getMemberDisplayName = () => {
    if (member.character) {
      const parts = [
        member.character.givenName,
        member.character.middleName,
        member.character.familyName,
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(" ");
      if (member.character.nickname) return member.character.nickname;
    }
    return member.inlineName || "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="dialog-add-relationship"
      >
        <DialogHeader>
          <DialogTitle>Add Relationship</DialogTitle>
          <DialogDescription>
            Add a family member related to {getMemberDisplayName()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {relationshipOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.type}
                variant="outline"
                className="h-auto flex-col items-start p-4 hover-elevate"
                onClick={() => {
                  onSelectRelationshipType(option.type);
                }}
                data-testid={`button-relationship-${option.type}`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
