import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Square,
  Circle,
  Type,
  Mountain,
  Trees,
  Waves,
  Home,
  Eraser,
  Hand,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
} from "lucide-react";

export type MapTool =
  | "select"
  | "pan"
  | "pencil"
  | "rectangle"
  | "circle"
  | "text"
  | "mountain"
  | "forest"
  | "water"
  | "settlement"
  | "eraser";

interface MapToolbarProps {
  selectedTool: MapTool;
  onToolChange: (tool: MapTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function MapToolbar({
  selectedTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: MapToolbarProps) {
  const ToolButton = ({ 
    tool, 
    icon: Icon, 
    label 
  }: { 
    tool: MapTool; 
    icon: React.ElementType; 
    label: string 
  }) => (
    <Button
      variant={selectedTool === tool ? "default" : "outline"}
      size="sm"
      onClick={() => onToolChange(tool)}
      title={label}
      data-testid={`tool-${tool}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="flex items-center gap-2 p-2 bg-background border-b">
      {/* Basic Tools */}
      <div className="flex gap-1">
        <ToolButton tool="select" icon={Hand} label="Select/Move (V)" />
        <ToolButton tool="pan" icon={Hand} label="Pan (H)" />
        <ToolButton tool="pencil" icon={Pencil} label="Draw (P)" />
        <ToolButton tool="eraser" icon={Eraser} label="Eraser (E)" />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Shape Tools */}
      <div className="flex gap-1">
        <ToolButton tool="rectangle" icon={Square} label="Rectangle (R)" />
        <ToolButton tool="circle" icon={Circle} label="Circle (C)" />
        <ToolButton tool="text" icon={Type} label="Text (T)" />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Terrain Tools */}
      <div className="flex gap-1">
        <ToolButton tool="mountain" icon={Mountain} label="Mountains (M)" />
        <ToolButton tool="forest" icon={Trees} label="Forest (F)" />
        <ToolButton tool="water" icon={Waves} label="Water (W)" />
        <ToolButton tool="settlement" icon={Home} label="Settlement (S)" />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* View Controls */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          title="Zoom In (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* History Controls */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}