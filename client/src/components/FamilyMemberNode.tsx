import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, User } from 'lucide-react';
import type { FamilyTreeMember } from '@shared/schema';

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
}

function FamilyMemberNodeComponent({ data }: NodeProps) {
  const { member, onEdit } = data as unknown as FamilyMemberNodeData;
  
  // Get display name - prefer character data if available
  let displayName = 'Unknown';
  let displayImage: string | null | undefined = member.inlineImageUrl;
  let displayDOB: string | null | undefined = member.inlineDateOfBirth;
  let displayDOD: string | null | undefined = member.inlineDateOfDeath;
  
  if (member.character && member.character.id) {
    // Use character data
    if (member.character.nickname) {
      displayName = member.character.nickname;
    } else {
      const parts = [
        member.character.givenName,
        member.character.middleName,
        member.character.familyName
      ].filter(Boolean);
      if (parts.length > 0) {
        displayName = parts.join(' ');
      }
    }
    displayImage = member.character.imageUrl || displayImage;
    displayDOB = member.character.dateOfBirth || displayDOB;
    displayDOD = member.character.dateOfDeath || displayDOD;
  } else if (member.inlineName) {
    // Use inline data
    displayName = member.inlineName;
  }
  
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'familyMember',
      memberId: member.id
    }));
  };

  return (
    <Card 
      className="p-3 min-w-[200px] hover-elevate cursor-move" 
      data-testid={`node-member-${member.id}`}
      draggable
      onDragStart={handleDragStart}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
        data-testid={`handle-target-${member.id}`}
      />
      
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={displayImage || undefined} />
          <AvatarFallback>
            {initials || <User className="w-6 h-6" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{displayName}</h4>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {displayDOB && (
              <div>b. {displayDOB}</div>
            )}
            {displayDOD && (
              <div>d. {displayDOD}</div>
            )}
          </div>
        </div>
        
        <Button 
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            if (onEdit) {
              onEdit(member);
            }
          }}
          data-testid={`button-edit-member-${member.id}`}
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
        data-testid={`handle-source-${member.id}`}
      />
    </Card>
  );
}

export const FamilyMemberNode = memo(FamilyMemberNodeComponent);
