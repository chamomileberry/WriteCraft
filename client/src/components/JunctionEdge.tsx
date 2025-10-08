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
  const isHorizontal = sourcePosition === 'right' || sourcePosition === 'left';
  const isVertical = sourcePosition === 'bottom' || sourcePosition === 'top';
  
  if (isHorizontal) {
    // Marriage edge - pure horizontal line at source Y level
    path = `M ${sourceX},${sourceY} L ${targetX},${sourceY}`;
  } else if (isVertical) {
    // Parent-child edge - vertical down, then horizontal to target
    // This creates the proper T-junction: straight down from junction, then over to child
    const midY = (sourceY + targetY) / 2;
    path = `M ${sourceX},${sourceY} L ${sourceX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`;
  } else {
    // Fallback to straight line
    path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  }

  return (
    <BaseEdge 
      id={id} 
      path={path} 
      style={style}
    />
  );
}

export const JunctionEdge = memo(JunctionEdgeComponent);
