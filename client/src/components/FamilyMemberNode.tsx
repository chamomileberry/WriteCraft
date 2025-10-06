import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, User } from 'lucide-react';
import type { FamilyTreeMember } from '@shared/schema';

export interface FamilyMemberNodeData {
  member: FamilyTreeMember;
  notebookId: string;
  treeId: string;
}

function FamilyMemberNodeComponent({ data }: NodeProps) {
  const { member } = data as unknown as FamilyMemberNodeData;
  const displayName = member.inlineName || 'Unknown';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="p-3 min-w-[200px] hover-elevate" data-testid={`node-member-${member.id}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
        data-testid={`handle-target-${member.id}`}
      />
      
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={member.inlineImageUrl || undefined} />
          <AvatarFallback>
            {initials || <User className="w-6 h-6" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{displayName}</h4>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {member.inlineDateOfBirth && (
              <div>b. {member.inlineDateOfBirth}</div>
            )}
            {member.inlineDateOfDeath && (
              <div>d. {member.inlineDateOfDeath}</div>
            )}
          </div>
        </div>
        
        <Button 
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open edit dialog
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
