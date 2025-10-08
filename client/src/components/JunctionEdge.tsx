import { memo } from 'react';
import { EdgeProps, BaseEdge } from '@xyflow/react';

function JunctionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
}: EdgeProps) {
  // Create orthogonal path (right angles only)
  let path = '';
  
  // Determine if this is a horizontal (marriage) or vertical (parent-child) edge
  // based on the handle positions
  const isHorizontal = sourcePosition === 'right' || sourcePosition === 'left';
  const isVertical = sourcePosition === 'bottom' || sourcePosition === 'top';
  
  if (isHorizontal) {
    // Marriage edge - pure horizontal line
    path = `M ${sourceX},${sourceY} L ${targetX},${sourceY}`;
  } else if (isVertical) {
    // Parent-child edge - pure vertical line
    path = `M ${sourceX},${sourceY} L ${sourceX},${targetY}`;
  } else {
    // Fallback to straight line
    path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  }
  
  // Calculate label position at midpoint
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return (
    <BaseEdge 
      id={id} 
      path={path} 
      style={style}
    />
  );
}

export const JunctionEdge = memo(JunctionEdgeComponent);
