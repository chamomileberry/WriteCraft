import { memo } from 'react';
import { EdgeProps, getBezierPath, BaseEdge } from '@xyflow/react';
import type { FamilyTreeRelationship } from '@shared/schema';

export interface FamilyRelationshipEdgeData {
  relationship: FamilyTreeRelationship;
  notebookId: string;
  treeId: string;
}

function FamilyRelationshipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { relationship } = (data || {}) as unknown as FamilyRelationshipEdgeData;
  const label = relationship.relationshipType === 'custom' 
    ? relationship.customLabel 
    : relationship.relationshipType;

  // Style based on relationship type
  const getEdgeStyle = () => {
    switch (relationship.relationshipType) {
      case 'marriage':
        return { stroke: 'hsl(var(--primary))', strokeWidth: 2 };
      case 'parent':
      case 'child':
        return { stroke: 'hsl(var(--foreground))', strokeWidth: 2 };
      case 'sibling':
        return { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5, strokeDasharray: '5,5' };
      case 'adoption':
        return { stroke: 'hsl(var(--secondary))', strokeWidth: 2, strokeDasharray: '10,5' };
      default:
        return { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 };
    }
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={getEdgeStyle()} />
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

export const FamilyRelationshipEdge = memo(FamilyRelationshipEdgeComponent);
