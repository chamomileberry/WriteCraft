import { memo } from "react";
import { NodeProps, Handle, Position } from "@xyflow/react";

function JunctionNodeComponent({}: NodeProps) {
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "hsl(var(--foreground))",
        position: "relative",
      }}
    >
      {/* Marriage line passes through horizontally - handles at vertical center */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ opacity: 0, top: "50%", transform: "translateY(-50%)" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={{ opacity: 0, top: "50%", transform: "translateY(-50%)" }}
      />
      {/* Child line extends downward - also at vertical center for alignment */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          opacity: 0,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

export const JunctionNode = memo(JunctionNodeComponent);
