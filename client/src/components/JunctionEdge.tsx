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
    // Marriage edge - pure horizontal line connecting source to target
    // All junction handles are now at the same Y (center), so use targetY
    const lineY = targetY;
    path = `M ${sourceX},${lineY} L ${targetX},${lineY}`;
  } else if (isVertical) {
    // Parent-child edge - vertical down from junction, then over to child
    // All junction handles are at center Y, so sourceY is already correct
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
