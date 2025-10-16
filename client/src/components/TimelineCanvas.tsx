import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { parseDateToTimestamp } from '@/lib/timelineUtils';
import type { Timeline, TimelineEvent, TimelineRelationship } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Grid3X3, Maximize2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TimelineEventNode, TimelineEventNodeData } from './TimelineEventNode';
import { TimelineRelationshipEdge, TimelineRelationshipEdgeData } from './TimelineRelationshipEdge';
import { EventEditDialog } from './EventEditDialog';
import { TimelineAxis } from './TimelineAxis';
import { getLayoutedElements } from '@/lib/dagre-layout';

interface TimelineCanvasProps {
  timelineId: string;
  notebookId: string;
}

function TimelineCanvasInner({ timelineId, notebookId }: TimelineCanvasProps) {
  const { toast } = useToast();
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isAutoLayout, setIsAutoLayout] = useState(true);
  const [previousEventCount, setPreviousEventCount] = useState(0);

  // Canvas dimensions for timeline calculations
  const CANVAS_WIDTH = 3000;
  const CANVAS_HEIGHT = 1000;
  const AXIS_Y = CANVAS_HEIGHT / 2;
  const MARGIN = 100;


  // Define custom node and edge types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      timelineEvent: TimelineEventNode,
    }),
    []
  );

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      timelineRelationship: TimelineRelationshipEdge,
    }),
    []
  );

  // Fetch timeline data
  const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['/api/timelines', timelineId, notebookId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/timelines/${timelineId}?notebookId=${notebookId}`);
      return response.json();
    },
    enabled: !!timelineId && !!notebookId,
  });

  // Fetch timeline events
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/timeline-events', timelineId, notebookId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/timeline-events?timelineId=${timelineId}&notebookId=${notebookId}`);
      return response.json();
    },
    enabled: !!timelineId && !!notebookId,
  });

  // Fetch timeline relationships
  const { data: relationships, isLoading: isLoadingRelationships } = useQuery({
    queryKey: ['/api/timeline-relationships', timelineId, notebookId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/timeline-relationships?timelineId=${timelineId}&notebookId=${notebookId}`);
      return response.json();
    },
    enabled: !!timelineId && !!notebookId,
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest('DELETE', `/api/timeline-events/${eventId}?timelineId=${timelineId}&notebookId=${notebookId}`);
      if (!response.ok) throw new Error('Failed to delete event');
      // 204 No Content - don't parse JSON
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-events', timelineId, notebookId] });
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    },
  });

  // Create relationship mutation
  const createRelationshipMutation = useMutation({
    mutationFn: async (data: { fromEventId: string; toEventId: string; relationshipType: string }) => {
      const response = await apiRequest('POST', '/api/timeline-relationships', {
        timelineId,
        notebookId,
        ...data,
      });
      if (!response.ok) throw new Error('Failed to create relationship');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-relationships', timelineId, notebookId] });
      toast({
        title: 'Success',
        description: 'Relationship created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create relationship',
        variant: 'destructive',
      });
    },
  });

  // Save node positions mutation
  const savePositionMutation = useMutation({
    mutationFn: async (positions: { id: string; x: number; y: number }[]) => {
      const updates = positions.map(async ({ id, x, y }) => {
        const response = await apiRequest('PATCH', `/api/timeline-events/${id}`, {
          timelineId,
          notebookId,
          positionX: x,
          positionY: y,
        });
        if (!response.ok) throw new Error(`Failed to save position for event ${id}`);
        return response.json();
      });
      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-events', timelineId, notebookId] });
    },
  });

  // Handlers - DEFINED BEFORE useEffects that use them
  const handleEditEvent = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  }, []);

  const handleDeleteEvent = useCallback((event: TimelineEvent) => {
    if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
      deleteEventMutation.mutate(event.id);
    }
  }, []);

  const handleAddRelationship = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    // TODO: Open relationship dialog
    toast({
      title: 'Coming Soon',
      description: 'Relationship creation dialog is being built',
    });
  }, [toast]);

  // Convert events to nodes - position them chronologically on timeline
  useEffect(() => {
    if (!events || events.length === 0) {
      setNodes([]);
      return;
    }

    // Parse and sort events by date
    const eventsWithTime = events.map((event: TimelineEvent) => ({
      event,
      timestamp: parseDateToTimestamp(event.startDate),
    }));

    const sortedEvents = eventsWithTime.sort((a: { event: TimelineEvent; timestamp: number }, b: { event: TimelineEvent; timestamp: number }) => a.timestamp - b.timestamp);
    
    const minTime = sortedEvents[0].timestamp;
    const maxTime = sortedEvents[sortedEvents.length - 1].timestamp;
    const timeRange = maxTime - minTime || 1;

    const axisLength = CANVAS_WIDTH - (2 * MARGIN);

    const newNodes = sortedEvents.map(({ event }: { event: TimelineEvent }, index: number) => {
      // Check if position is manually saved
      const hasManualPosition = event.positionX !== null && event.positionX !== undefined && !isAutoLayout;
      
      if (hasManualPosition) {
        return {
          id: event.id,
          type: 'timelineEvent',
          position: {
            x: event.positionX!,
            y: event.positionY ?? AXIS_Y,
          },
          data: {
            event,
            notebookId,
            timelineId,
            onEdit: handleEditEvent,
            onDelete: handleDeleteEvent,
            onAddRelationship: handleAddRelationship,
          } as TimelineEventNodeData,
        };
      }

      // Calculate chronological position on timeline
      const normalizedPosition = (parseDateToTimestamp(event.startDate) - minTime) / timeRange;
      const x = MARGIN + (normalizedPosition * axisLength);
      
      // Alternate above and below the axis
      const isAbove = index % 2 === 0;
      const y = isAbove ? AXIS_Y - 180 : AXIS_Y + 180;

      return {
        id: event.id,
        type: 'timelineEvent',
        position: { x, y },
        data: {
          event,
          notebookId,
          timelineId,
          onEdit: handleEditEvent,
          onDelete: handleDeleteEvent,
          onAddRelationship: handleAddRelationship,
        } as TimelineEventNodeData,
      };
    }) as Node[];

    setNodes(newNodes);
  }, [events, notebookId, timelineId, isAutoLayout, handleEditEvent, handleDeleteEvent, handleAddRelationship]);

  // Convert relationships to edges
  useEffect(() => {
    if (!relationships || !events) return;

    const newEdges = relationships.map((rel: TimelineRelationship) => ({
      id: rel.id,
      source: rel.fromEventId,
      target: rel.toEventId,
      type: 'timelineRelationship',
      data: {
        relationship: rel,
        notebookId,
        timelineId,
      } as TimelineRelationshipEdgeData,
    })) as Edge[];

    setEdges(newEdges);
  }, [relationships, events, notebookId, timelineId]);

  // Handle connection creation
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        // Default to "related" relationship type
        createRelationshipMutation.mutate({
          fromEventId: connection.source,
          toEventId: connection.target,
          relationshipType: 'related',
        });
      }
    },
    [createRelationshipMutation]
  );

  // Auto-layout - arrange events chronologically on timeline
  const handleAutoLayout = useCallback(() => {
    if (!events || events.length === 0) return;

    // Parse and sort events by date
    const eventsWithTime = events.map((event: TimelineEvent) => ({
      event,
      timestamp: parseDateToTimestamp(event.startDate),
    }));

    const sortedEvents = eventsWithTime.sort((a: { event: TimelineEvent; timestamp: number }, b: { event: TimelineEvent; timestamp: number }) => a.timestamp - b.timestamp);
    
    const minTime = sortedEvents[0].timestamp;
    const maxTime = sortedEvents[sortedEvents.length - 1].timestamp;
    const timeRange = maxTime - minTime || 1;
    const axisLength = CANVAS_WIDTH - (2 * MARGIN);

    const layoutedNodes = sortedEvents.map(({ event }: { event: TimelineEvent }, index: number) => {
      const normalizedPosition = (parseDateToTimestamp(event.startDate) - minTime) / timeRange;
      const x = MARGIN + (normalizedPosition * axisLength);
      const isAbove = index % 2 === 0;
      const y = isAbove ? AXIS_Y - 180 : AXIS_Y + 180;

      return {
        id: event.id,
        type: 'timelineEvent',
        position: { x, y },
        data: nodes.find(n => n.id === event.id)?.data,
      };
    });

    setNodes(layoutedNodes as Node[]);
    
    // Save positions to database
    const positions = layoutedNodes.map((node: Node) => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
    }));
    savePositionMutation.mutate(positions);
    
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 0);
    setIsAutoLayout(true);
  }, [events, nodes, fitView, setNodes, savePositionMutation]);

  // Auto-layout only when new events are added (not on every events change)
  useEffect(() => {
    if (!events) return;
    
    const currentEventCount = events.length;
    
    // Only run auto-layout when:
    // 1. Event count increased (new event added)
    // 2. We have nodes to layout
    // 3. Auto-layout is enabled
    if (currentEventCount > previousEventCount && nodes.length > 0 && isAutoLayout) {
      handleAutoLayout();
    }
    
    setPreviousEventCount(currentEventCount);
  }, [events?.length]);

  const isLoading = isLoadingTimeline || isLoadingEvents || isLoadingRelationships;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Timeline not found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Timeline axis visualization layer */}
      {events && events.length > 0 && (
        <TimelineAxis 
          events={events} 
          canvasWidth={CANVAS_WIDTH} 
          canvasHeight={CANVAS_HEIGHT}
          axisY={AXIS_Y}
          margin={MARGIN}
        />
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={(event, node) => {
          // Save position after drag
          savePositionMutation.mutate([{
            id: node.id,
            x: node.position.x,
            y: node.position.y,
          }]);
          setIsAutoLayout(false);
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'timelineRelationship',
        }}
      >
        <Background color="#94a3b8" gap={16} />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        
        <Panel position="top-left" className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAutoLayout}
            data-testid="button-auto-layout"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Auto Layout
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fitView({ padding: 0.2, duration: 300 })}
            data-testid="button-fit-view"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Fit View
          </Button>
        </Panel>

        <Panel position="top-right" className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              setSelectedEvent(null);
              setIsEventDialogOpen(true);
            }}
            data-testid="button-add-event"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </Panel>
      </ReactFlow>

      <EventEditDialog
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open);
          if (!open) setSelectedEvent(null);
        }}
        timelineId={timelineId}
        notebookId={notebookId}
        event={selectedEvent}
      />
    </div>
  );
}

export function TimelineCanvas(props: TimelineCanvasProps) {
  return (
    <ReactFlowProvider>
      <TimelineCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
