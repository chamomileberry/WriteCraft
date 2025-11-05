import { memo } from "react";
import {
  EdgeProps,
  getSmoothStepPath,
  getStraightPath,
  BaseEdge,
} from "@xyflow/react";
import type { FamilyTreeRelationship } from "@shared/schema";

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
}: EdgeProps) {
  const { relationship } = (data ||
    {}) as unknown as FamilyRelationshipEdgeData;

  // Use straight path for marriage, smooth step for others
  const isMarriage = relationship?.relationshipType === "marriage";
  const pathFn = isMarriage ? getStraightPath : getSmoothStepPath;

  const [edgePath, labelX, labelY] = pathFn({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const label =
    relationship.relationshipType === "custom"
      ? relationship.customLabel
      : relationship.relationshipType;

  // Style based on relationship type
  const getEdgeStyle = () => {
    switch (relationship.relationshipType) {
      case "marriage":
        return { stroke: "hsl(var(--primary))", strokeWidth: 2 };
      case "parent":
      case "child":
        return { stroke: "hsl(var(--foreground))", strokeWidth: 2 };
      case "sibling":
        return {
          stroke: "hsl(var(--muted-foreground))",
          strokeWidth: 1.5,
          strokeDasharray: "5,5",
        };
      case "adoption":
        return {
          stroke: "hsl(var(--secondary))",
          strokeWidth: 2,
          strokeDasharray: "10,5",
        };
      case "stepParent":
        return {
          stroke: "hsl(var(--muted-foreground))",
          strokeWidth: 2,
          strokeDasharray: "8,4",
        };
      case "grandparent":
        return {
          stroke: "hsl(var(--foreground))",
          strokeWidth: 1.5,
          strokeDasharray: "3,3",
        };
      case "cousin":
        return {
          stroke: "hsl(var(--muted-foreground))",
          strokeWidth: 1,
          strokeDasharray: "5,5",
        };
      default:
        return { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 };
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
            pointerEvents: "none",
            userSelect: "none",
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
