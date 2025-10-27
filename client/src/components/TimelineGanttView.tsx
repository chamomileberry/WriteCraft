import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, GripVertical } from 'lucide-react';
import { parseDateToTimestamp } from '@/lib/timelineUtils';
import { EventEditDialog } from '@/components/EventEditDialog';
import type { TimelineEvent } from '@shared/schema';

interface TimelineGanttViewProps {
  timelineId: string;
  notebookId: string;
}

interface GanttRow {
  category: string;
  events: TimelineEvent[];
  color: string;
}

export function TimelineGanttView({ timelineId, notebookId }: TimelineGanttViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch timeline events
  const { data: events = [], isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ['/api/timeline-events', timelineId],
    queryFn: async () => {
      const response = await apiRequest(`/api/timeline-events?timelineId=${timelineId}&notebookId=${notebookId}`, 'GET');
      return response.json();
    }
  });

  // Group events by category into rows
  const ganttRows: GanttRow[] = useMemo(() => {
    const categoryMap = new Map<string, TimelineEvent[]>();
    const categoryColors = new Map<string, string>();

    events.forEach(event => {
      const category = event.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
        // Use event color if available, otherwise assign default
        categoryColors.set(category, event.color || `hsl(${Math.random() * 360}, 70%, 60%)`);
      }
      categoryMap.get(category)!.push(event);
    });

    return Array.from(categoryMap.entries()).map(([category, categoryEvents]) => ({
      category,
      events: categoryEvents.sort((a, b) => {
        const aDate = parseDateToTimestamp(a.startDate);
        const bDate = parseDateToTimestamp(b.startDate);
        return aDate - bDate;
      }),
      color: categoryColors.get(category)!
    }));
  }, [events]);

  // Calculate timeline range
  const timelineRange = useMemo(() => {
    if (events.length === 0) {
      return { min: 0, max: 100, span: 100 };
    }

    let min = Infinity;
    let max = -Infinity;

    events.forEach(event => {
      const start = parseDateToTimestamp(event.startDate);
      min = Math.min(min, start);
      max = Math.max(max, start);

      if (event.endDate) {
        const end = parseDateToTimestamp(event.endDate);
        max = Math.max(max, end);
      }
    });

    // Add 5% padding on each side
    const span = max - min;
    const padding = span * 0.05;
    
    // Handle case where all events have same date (span = 0)
    // Use a minimal span to prevent division by zero
    const finalSpan = span === 0 ? 100 : span + (padding * 2);
    
    return {
      min: span === 0 ? min - 50 : min - padding,
      max: span === 0 ? max + 50 : max + padding,
      span: finalSpan
    };
  }, [events]);

  // Calculate position for event on timeline (0-100%)
  const getEventPosition = (event: TimelineEvent) => {
    const start = parseDateToTimestamp(event.startDate);
    const left = ((start - timelineRange.min) / timelineRange.span) * 100;

    let width = 2; // Default width for point events
    if (event.endDate) {
      const end = parseDateToTimestamp(event.endDate);
      width = ((end - start) / timelineRange.span) * 100;
      width = Math.max(width, 2); // Minimum 2% width
    }

    // Guard against NaN values
    const safeLeft = isNaN(left) ? 0 : left;
    const safeWidth = isNaN(width) ? 2 : width;

    return { left: `${safeLeft}%`, width: `${safeWidth}%` };
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsEditDialogOpen(true);
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12">
        <p className="text-muted-foreground mb-4">No events yet. Create your first event to see the Gantt chart.</p>
        <Button onClick={handleCreateEvent} data-testid="button-create-first-event">
          <Plus className="w-4 h-4 mr-2" />
          Create First Event
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Add Event button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Gantt Chart View</h3>
        <Button onClick={handleCreateEvent} size="sm" data-testid="button-add-event">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-[800px] space-y-4">
          {ganttRows.map((row, idx) => (
            <div key={row.category} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="gap-1"
                  style={{ borderColor: row.color }}
                >
                  <GripVertical className="w-3 h-3" />
                  {row.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {row.events.length} {row.events.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Track/Row */}
              <div className="relative h-16 bg-muted/30 rounded-md border">
                {/* Event Bars */}
                {row.events.map(event => {
                  const position = getEventPosition(event);
                  const hasEndDate = !!event.endDate;

                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEditEvent(event)}
                      className="absolute top-1/2 -translate-y-1/2 h-10 rounded px-2 flex items-center justify-center text-xs font-medium transition-all hover-elevate active-elevate-2"
                      style={{
                        left: position.left,
                        width: position.width,
                        backgroundColor: event.color || row.color,
                        minWidth: hasEndDate ? '50px' : '8px'
                      }}
                      title={`${event.title} - ${event.startDate}${event.endDate ? ` to ${event.endDate}` : ''}`}
                      data-testid={`event-bar-${event.id}`}
                    >
                      <span className="truncate text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {event.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <EventEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        timelineId={timelineId}
        notebookId={notebookId}
        event={selectedEvent}
      />
    </div>
  );
}
