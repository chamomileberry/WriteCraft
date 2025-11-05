import { useMemo } from "react";
import { useViewport } from "@xyflow/react";
import { parseDateToTimestamp } from "@/lib/timelineUtils";
import type { TimelineEvent } from "@shared/schema";

interface TimelineAxisProps {
  events: TimelineEvent[];
  canvasWidth: number;
  canvasHeight: number;
  axisY: number;
  margin: number;
}

export function TimelineAxis({
  events,
  canvasWidth,
  canvasHeight,
  axisY,
  margin,
}: TimelineAxisProps) {
  const viewport = useViewport();

  const timelineData = useMemo(() => {
    if (!events || events.length === 0) {
      return { sortedEvents: [], positions: new Map(), minTime: 0, maxTime: 1 };
    }

    // Parse and sort events by date
    const eventsWithTime = events.map((event) => ({
      event,
      timestamp: parseDateToTimestamp(event.startDate),
    }));

    const sortedEvents = eventsWithTime.sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    const minTime = sortedEvents[0].timestamp;
    const maxTime = sortedEvents[sortedEvents.length - 1].timestamp;
    const timeRange = maxTime - minTime || 1; // Avoid division by zero

    // Calculate positions for each event (0 to 1 normalized)
    const positions = new Map<string, number>();
    sortedEvents.forEach(({ event, timestamp }) => {
      const normalizedPosition = (timestamp - minTime) / timeRange;
      positions.set(event.id, normalizedPosition);
    });

    return {
      sortedEvents: sortedEvents.map((e) => e.event),
      positions,
      minTime,
      maxTime,
    };
  }, [events]);

  const axisStartX = margin;
  const axisEndX = canvasWidth - margin;
  const axisLength = axisEndX - axisStartX;

  // Apply viewport transform to sync with ReactFlow pan/zoom
  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <svg
        className="absolute"
        style={{
          transform,
          transformOrigin: "0 0",
        }}
        width={canvasWidth}
        height={canvasHeight}
      >
        <defs>
          <marker
            id="timeline-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 8 4, 0 8" fill="#64748b" />
          </marker>
        </defs>

        {/* Main timeline axis */}
        <line
          x1={axisStartX}
          y1={axisY}
          x2={axisEndX}
          y2={axisY}
          stroke="#64748b"
          strokeWidth="3"
          markerEnd="url(#timeline-arrow)"
        />

        {/* Event markers and connectors */}
        {timelineData.sortedEvents.map((event, index) => {
          const position = timelineData.positions.get(event.id) || 0;
          const x = axisStartX + position * axisLength;

          // Alternate events above and below the axis
          const isAbove = index % 2 === 0;
          const eventY = isAbove ? axisY - 180 : axisY + 180;
          const connectorStartY = isAbove ? axisY - 10 : axisY + 10;

          return (
            <g key={event.id}>
              {/* Vertical connector line */}
              <line
                x1={x}
                y1={connectorStartY}
                x2={x}
                y2={eventY}
                stroke="#9333ea"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* Tick mark on axis */}
              <circle
                cx={x}
                cy={axisY}
                r="6"
                fill="#9333ea"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Date label */}
              <text
                x={x}
                y={axisY + (isAbove ? 30 : -20)}
                textAnchor="middle"
                className="fill-muted-foreground text-xs font-medium"
              >
                {event.startDate}
              </text>
            </g>
          );
        })}

        {/* Start label */}
        <text
          x={axisStartX - 40}
          y={axisY + 5}
          textAnchor="end"
          className="fill-muted-foreground text-sm font-medium"
        >
          Past
        </text>

        {/* End label */}
        <text
          x={axisEndX + 50}
          y={axisY + 5}
          textAnchor="start"
          className="fill-muted-foreground text-sm font-medium"
        >
          Future
        </text>
      </svg>
    </div>
  );
}
