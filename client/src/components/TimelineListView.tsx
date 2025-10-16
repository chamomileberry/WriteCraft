import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Timeline, TimelineItem, TimelinePoint, TimelineContent, TimelineTime, TimelineTitle, TimelineBody } from 'flowbite-react';
import { HiCalendar, HiClock, HiLocationMarker, HiSparkles } from 'react-icons/hi';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { parseDateToTimestamp } from '@/lib/timelineUtils';
import { EventEditDialog } from './EventEditDialog';
import type { TimelineEvent } from '@shared/schema';

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
  
  const { data: events, isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ['/api/timeline-events', timelineId, notebookId],
    queryFn: async () => {
      const response = await fetch(`/api/timeline-events?timelineId=${timelineId}&notebookId=${notebookId}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    enabled: !!timelineId && !!notebookId,
  });

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
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground p-8">
        <HiCalendar className="w-16 h-16" />
        <p className="text-lg">No events in this timeline yet</p>
        <p className="text-sm">Create events using the canvas view or add them directly</p>
      </div>
    );
  }

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => 
    parseDateToTimestamp(a.startDate) - parseDateToTimestamp(b.startDate)
  );

  return (
    <>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Add Event Button */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-muted-foreground">Timeline Events</h2>
          <Button onClick={handleAddEvent} data-testid="button-add-event">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        <Timeline>
        {sortedEvents.map((event) => {
          const EventIcon = getEventIcon(event.eventType || 'general');
          
          return (
            <TimelineItem 
              key={event.id} 
              data-testid={`timeline-event-${event.id}`}
              onClick={() => handleEditEvent(event)}
              className="cursor-pointer hover-elevate rounded-lg transition-colors"
            >
              <TimelinePoint icon={EventIcon} />
              <TimelineContent>
                <TimelineTime data-testid={`event-date-${event.id}`}>
                  {event.startDate}
                  {event.endDate && ` - ${event.endDate}`}
                </TimelineTime>
                <TimelineTitle data-testid={`event-title-${event.id}`}>
                  {event.title}
                </TimelineTitle>
                {event.description && (
                  <TimelineBody data-testid={`event-description-${event.id}`}>
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
