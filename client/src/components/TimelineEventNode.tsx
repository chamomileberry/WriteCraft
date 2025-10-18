import { memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Edit, 
  Trash2, 
  Plus,
  Calendar,
  Sparkles,
  Swords,
  MapPin,
  BookOpen,
  Flag,
  Users,
  Zap,
  Star,
  AlertCircle
} from 'lucide-react';
import type { TimelineEvent, Character } from '@shared/schema';

export interface TimelineEventNodeData {
  event: TimelineEvent;
  notebookId: string;
  timelineId: string;
  characters?: Character[]; // Characters involved in this event
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (event: TimelineEvent) => void;
  onAddRelationship?: (event: TimelineEvent) => void;
}

// Map event types to icons
const eventTypeIcons: Record<string, any> = {
  battle: Swords,
  discovery: Sparkles,
  birth: Star,
  death: AlertCircle,
  meeting: Users,
  political: Flag,
  cultural: BookOpen,
  location: MapPin,
  other: Zap,
};

// Map importance to visual indicators
const importanceColors: Record<string, string> = {
  major: 'border-l-4 border-l-primary',
  moderate: 'border-l-2 border-l-secondary',
  minor: 'border-l border-l-muted-foreground',
};

function TimelineEventNodeComponent({ data }: NodeProps) {
  const { event, characters = [], onEdit, onDelete, onAddRelationship } = data as unknown as TimelineEventNodeData;
  
  // Get the appropriate icon for event type
  const EventIcon = eventTypeIcons[event.eventType?.toLowerCase() || 'other'] || Zap;
  
  // Get importance styling
  const importanceClass = importanceColors[event.importance || 'moderate'];
  
  // Format dates
  const formatDate = (date: string | null) => {
    if (!date) return '';
    return date;
  };

  const dateDisplay = event.endDate 
    ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
    : formatDate(event.startDate);
  
  // Display up to 3 character avatars, with +N indicator for more
  const maxAvatars = 3;
  const displayCharacters = characters.slice(0, maxAvatars);
  const remainingCount = characters.length - maxAvatars;

  return (
    <>
      <Card 
        className={`p-3 w-[220px] min-h-[140px] hover-elevate cursor-move flex flex-col ${importanceClass}`}
        data-testid={`node-event-${event.id}`}
      >
        <div className="flex flex-col gap-2 flex-1">
          {/* Header with icon and title */}
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
              <EventIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight line-clamp-2">{event.title}</h4>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{dateDisplay}</span>
          </div>

          {/* Character Avatars */}
          {characters.length > 0 && (
            <div className="flex items-center gap-1" data-testid={`characters-${event.id}`}>
              {displayCharacters.map((character) => {
                const initials = character.givenName && character.familyName
                  ? `${character.givenName[0]}${character.familyName[0]}`
                  : character.givenName?.[0] || character.familyName?.[0] || '?';
                const fullName = `${character.givenName || ''} ${character.familyName || ''}`.trim();
                
                return (
                  <Tooltip key={character.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-6 w-6 border-2 border-background" data-testid={`avatar-${character.id}`}>
                        <AvatarImage src={character.imageUrl || undefined} />
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {fullName}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {remainingCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                      +{remainingCount}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {remainingCount} more character{remainingCount > 1 ? 's' : ''}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Description (if exists) */}
          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Badges for category and linked content */}
          <div className="flex flex-wrap gap-1 mt-auto">
            {event.category && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {event.category}
              </Badge>
            )}
            {event.linkedContentType && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {event.linkedContentType}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-1 w-full justify-center mt-2 pt-2 border-t">
          <Button 
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddRelationship) {
                onAddRelationship(event);
              }
            }}
            data-testid={`button-add-relationship-${event.id}`}
            className="h-7 w-7"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button 
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) {
                onEdit(event);
              }
            }}
            data-testid={`button-edit-event-${event.id}`}
            className="h-7 w-7"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button 
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(event);
              }
            }}
            data-testid={`button-delete-event-${event.id}`}
            className="h-7 w-7"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
      
      {/* Handles for React Flow connections */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        style={{ opacity: 0 }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        style={{ opacity: 0 }}
      />
      <Handle 
        type="source" 
        position={Position.Top} 
        id="top"
        style={{ opacity: 0 }}
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="bottom"
        style={{ opacity: 0 }}
      />
    </>
  );
}

export const TimelineEventNode = memo(TimelineEventNodeComponent);
