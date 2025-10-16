import { memo } from 'react';
import { NodeProps } from '@xyflow/react';

export interface SwimLaneNodeData {
  category: string;
  width: number;
  height: number;
  isEven: boolean;
}

export const SwimLaneNode = memo(({ data }: NodeProps) => {
  const { category, width, height, isEven } = data as unknown as SwimLaneNodeData;
  
  return (
    <div
      className={`border-b ${isEven ? 'bg-muted/10' : 'bg-transparent'}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderColor: 'hsl(var(--border) / 0.3)',
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <div className="absolute left-2 top-2 px-2 py-1 bg-card rounded-md border text-xs font-medium text-muted-foreground capitalize pointer-events-none">
        {category}
      </div>
    </div>
  );
});

SwimLaneNode.displayName = 'SwimLaneNode';
