import { memo } from 'react';
import { EdgeProps, getSmoothStepPath, BaseEdge } from '@xyflow/react';
import type { TimelineRelationship } from '@shared/schema';

export interface TimelineRelationshipEdgeData {
  relationship: TimelineRelationship;
  notebookId: string;
  timelineId: string;
}

function TimelineRelationshipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const { relationship } = (data || {}) as unknown as TimelineRelationshipEdgeData;
  
  // Use smooth step path for all timeline relationships
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = relationship?.relationshipType || '';

  // Style based on relationship type
  const getEdgeStyle = () => {
    switch (relationship?.relationshipType) {
      case 'causes':
        return { 
          stroke: 'hsl(var(--primary))', 
          strokeWidth: 2,
          strokeDasharray: '0'
        };
      case 'precedes':
        return { 
          stroke: 'hsl(var(--foreground))', 
          strokeWidth: 1.5,
          strokeDasharray: '0'
        };
      case 'concurrent':
        return { 
          stroke: 'hsl(var(--secondary))', 
          strokeWidth: 1.5,
          strokeDasharray: '5,5'
        };
      case 'related':
        return { 
          stroke: 'hsl(var(--muted-foreground))', 
          strokeWidth: 1,
          strokeDasharray: '3,3'
        };
      default:
        return { 
          stroke: 'hsl(var(--muted-foreground))', 
          strokeWidth: 1
        };
    }
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={getEdgeStyle()} />
      {label && (
        <text
          x={labelX}
          y={labelY}
          className="fill-foreground text-xs"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <tspan
            fill="hsl(var(--background))"
            stroke="hsl(var(--background))"
            strokeWidth="3"
          >
            {label}
          </tspan>
          <tspan fill="hsl(var(--foreground))">{label}</tspan>
        </text>
      )}
    </>
  );
}

export const TimelineRelationshipEdge = memo(TimelineRelationshipEdgeComponent);
