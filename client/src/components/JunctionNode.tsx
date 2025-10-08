import { memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';

function JunctionNodeComponent({ }: NodeProps) {
  return (
    <div 
      style={{ 
        width: 8, 
        height: 8, 
        borderRadius: '50%',
        background: 'hsl(var(--foreground))',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top"
        style={{ opacity: 0 }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        style={{ opacity: 0 }}
      />
    </div>
  );
}

export const JunctionNode = memo(JunctionNodeComponent);
