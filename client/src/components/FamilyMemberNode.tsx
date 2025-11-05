import { memo } from "react";
import { NodeProps, Handle, Position } from "@xyflow/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, User, Plus, Trash2 } from "lucide-react";
import type { FamilyTreeMember } from "@shared/schema";

export interface FamilyMemberNodeData {
  member: FamilyTreeMember & {
    character?: {
      id: string;
      givenName: string | null;
      familyName: string | null;
      middleName: string | null;
      nickname: string | null;
      imageUrl: string | null;
      dateOfBirth: string | null;
      dateOfDeath: string | null;
    } | null;
  };
  notebookId: string;
  treeId: string;
  onEdit?: (member: FamilyTreeMember) => void;
  onAddRelationship?: (member: FamilyTreeMember) => void;
  onRemoveMember?: (member: FamilyTreeMember) => void;
}

function FamilyMemberNodeComponent({ data }: NodeProps) {
  const { member, onEdit, onAddRelationship, onRemoveMember } =
    data as unknown as FamilyMemberNodeData;

  // Get display name - prefer character data if available
  let displayName = "Unknown";
  let displayImage: string | null | undefined = member.inlineImageUrl;
  let displayDOB: string | null | undefined = member.inlineDateOfBirth;
  let displayDOD: string | null | undefined = member.inlineDateOfDeath;

  if (member.character && member.character.id) {
    // Use character data - prefer full name, fallback to nickname
    const parts = [
      member.character.givenName,
      member.character.middleName,
      member.character.familyName,
    ].filter(Boolean);
    if (parts.length > 0) {
      displayName = parts.join(" ");
    } else if (member.character.nickname) {
      // Fallback to nickname if no full name parts available
      displayName = member.character.nickname;
    }
    displayImage = member.character.imageUrl || displayImage;
    displayDOB = member.character.dateOfBirth || displayDOB;
    displayDOD = member.character.dateOfDeath || displayDOD;
  } else if (member.inlineName) {
    // Use inline data
    displayName = member.inlineName;
  }

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "familyMember",
        memberId: member.id,
      }),
    );
  };

  return (
    <>
      <Card
        className="p-3 w-[160px] min-h-[220px] hover-elevate cursor-move flex flex-col"
        data-testid={`node-member-${member.id}`}
        draggable
        onDragStart={handleDragStart}
      >
        <div className="flex flex-col items-center gap-2 flex-1">
          <Avatar className="w-20 h-20 rounded-2xl">
            <AvatarImage
              src={displayImage || undefined}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl">
              {initials || <User className="w-10 h-10" />}
            </AvatarFallback>
          </Avatar>

          <div className="w-full text-center space-y-1 flex-1 flex flex-col justify-center">
            <h4 className="font-medium text-sm leading-tight">{displayName}</h4>
            <div className="text-xs text-muted-foreground">
              {displayDOB && displayDOD ? (
                <div>
                  {displayDOB} - {displayDOD}
                </div>
              ) : displayDOB ? (
                <div>{displayDOB}</div>
              ) : displayDOD ? (
                <div>d. {displayDOD}</div>
              ) : (
                <div className="h-4"></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1 w-full justify-center mt-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddRelationship) {
                onAddRelationship(member);
              }
            }}
            data-testid={`button-add-relationship-${member.id}`}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) {
                onEdit(member);
              }
            }}
            data-testid={`button-edit-member-${member.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (onRemoveMember) {
                onRemoveMember(member);
              }
            }}
            data-testid={`button-remove-member-${member.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Invisible handles for React Flow connections */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      {/* Also add target handles for bidirectional connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
    </>
  );
}

export const FamilyMemberNode = memo(FamilyMemberNodeComponent);
