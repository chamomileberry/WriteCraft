import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Timeline, TimelineItem, TimelinePoint, TimelineContent, TimelineTime, TimelineTitle, TimelineBody } from 'flowbite-react';
import { HiCalendar, HiClock, HiLocationMarker, HiSparkles } from 'react-icons/hi';
import { Plus, AlignJustify, ArrowDownWideNarrow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { parseDateToTimestamp } from '@/lib/timelineUtils';
import { EventEditDialog } from './EventEditDialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { TimelineEvent, Timeline as TimelineType } from '@shared/schema';

interface TimelineListViewProps {
  timelineId: string;
  notebookId: string;
}

// Get icon for event type
function getEventIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'historical':
      return HiClock;
    case 'battle':
    case 'conflict':
      return HiSparkles;
    case 'location':
    case 'journey':
      return HiLocationMarker;
    default:
      return HiCalendar;
  }
}

export function TimelineListView({ timelineId, notebookId }: TimelineListViewProps) {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  
  // Fetch timeline data to get listViewMode
  const { data: timeline } = useQuery<TimelineType>({
    queryKey: ['/api/timelines', timelineId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/timelines/${timelineId}?notebookId=${notebookId}`);
      return await response.json();
    },
    enabled: !!timelineId && !!notebookId,
  });

  const { data: events, isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ['/api/timeline-events', timelineId, notebookId],
    queryFn: async () => {
      const response = await fetch(`/api/timeline-events?timelineId=${timelineId}&notebookId=${notebookId}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    enabled: !!timelineId && !!notebookId,
  });

  // Toggle listViewMode mutation
  const toggleModeMutation = useMutation({
    mutationFn: async (newMode: 'compact' | 'timescale') => {
      const response = await apiRequest('PATCH', `/api/timelines/${timelineId}`, {
        listViewMode: newMode,
        notebookId
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timelines', timelineId] });
    }
  });

  const isTimescaleMode = timeline?.listViewMode === 'timescale';

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-muted-foreground">Timeline Events</h2>
            <Button onClick={handleAddEvent} data-testid="button-add-event">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground p-8">
          <HiCalendar className="w-16 h-16" />
          <p className="text-lg">No events in this timeline yet</p>
          <p className="text-sm">Click "Add Event" above to get started</p>
        </div>
        
        <EventEditDialog
          open={isEventDialogOpen}
          onOpenChange={(open) => {
            setIsEventDialogOpen(open);
            if (!open) {
              setSelectedEvent(null);
            }
          }}
          event={selectedEvent}
          timelineId={timelineId}
          notebookId={notebookId}
        />
      </>
    );
  }

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => 
    parseDateToTimestamp(a.startDate) - parseDateToTimestamp(b.startDate)
  );

  // Calculate spacing for timescale mode
  const getEventSpacing = (index: number): number => {
    if (!isTimescaleMode || sortedEvents.length < 2) return 0;
    
    if (index === 0) return 0;
    
    const currentTimestamp = parseDateToTimestamp(sortedEvents[index].startDate);
    const previousTimestamp = parseDateToTimestamp(sortedEvents[index - 1].startDate);
    const timeGap = currentTimestamp - previousTimestamp;
    
    // Find min and max gaps for normalization
    const gaps: number[] = [];
    for (let i = 1; i < sortedEvents.length; i++) {
      const curr = parseDateToTimestamp(sortedEvents[i].startDate);
      const prev = parseDateToTimestamp(sortedEvents[i - 1].startDate);
      gaps.push(curr - prev);
    }
    const minGap = Math.min(...gaps);
    const maxGap = Math.max(...gaps);
    
    // Normalize gap to spacing (min 16px, max 200px)
    if (maxGap === minGap) return 16; // All gaps equal
    const normalizedGap = (timeGap - minGap) / (maxGap - minGap);
    return 16 + (normalizedGap * 184); // 16px to 200px range
  };

  return (
    <>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header with Add Event Button and View Mode Toggle */}
        <div className="mb-8 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-muted-foreground">Timeline Events</h2>
            <div className="flex items-center gap-2 border rounded-md p-1">
              <Toggle
                pressed={!isTimescaleMode}
                onPressedChange={() => toggleModeMutation.mutate('compact')}
                size="sm"
                data-testid="toggle-compact-mode"
                title="Compact mode - equal spacing"
              >
                <AlignJustify className="w-4 h-4" />
              </Toggle>
              <Toggle
                pressed={isTimescaleMode}
                onPressedChange={() => toggleModeMutation.mutate('timescale')}
                size="sm"
                data-testid="toggle-timescale-mode"
                title="Timescale mode - proportional spacing"
              >
                <ArrowDownWideNarrow className="w-4 h-4" />
              </Toggle>
            </div>
          </div>
          <Button onClick={handleAddEvent} data-testid="button-add-event">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        <Timeline>
        {sortedEvents.map((event, index) => {
          const EventIcon = getEventIcon(event.eventType || 'general');
          const spacing = getEventSpacing(index);
          
          return (
            <TimelineItem 
              key={event.id} 
              data-testid={`timeline-event-${event.id}`}
              onClick={() => handleEditEvent(event)}
              className="cursor-pointer hover-elevate rounded-lg transition-colors group"
              style={{ marginTop: spacing > 0 ? `${spacing}px` : undefined }}
            >
              <TimelinePoint icon={EventIcon} className="bg-primary/20 dark:bg-primary/30" />
              <TimelineContent className="ml-8">
                <TimelineTime 
                  data-testid={`event-date-${event.id}`}
                  className="text-sm text-muted-foreground dark:text-muted-foreground"
                >
                  {event.startDate}
                  {event.endDate && ` - ${event.endDate}`}
                </TimelineTime>
                <TimelineTitle 
                  data-testid={`event-title-${event.id}`}
                  className="text-lg font-semibold text-foreground dark:text-foreground"
                >
                  {event.title}
                </TimelineTitle>
                {event.description && (
                  <TimelineBody 
                    data-testid={`event-description-${event.id}`}
                    className="text-base text-muted-foreground dark:text-muted-foreground"
                  >
                    {event.description}
                  </TimelineBody>
                )}
                {event.eventType && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {event.eventType}
                    </span>
                  </div>
                )}
                {event.linkedContentId && event.linkedContentType && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Linked to: {event.linkedContentType}
                  </div>
                )}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
      </div>

      {/* Event Edit Dialog */}
      <EventEditDialog
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open);
          if (!open) {
            setSelectedEvent(null);
          }
        }}
        event={selectedEvent}
        timelineId={timelineId}
        notebookId={notebookId}
      />
    </>
  );
}
