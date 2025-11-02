import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MapToolbar, { MapTool } from "@/components/MapToolbar";
import { useState } from "react";  // You might already have this
import Header from "@/components/Header";

export default function MapStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setLocation] = useLocation();

  const [selectedTool, setSelectedTool] = useState<MapTool>("pencil");
  const [zoom, setZoom] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const handleNavigate = (toolId: string) => {
    if (toolId === 'notebook') {
      setLocation('/notebook');
    } else if (toolId === 'projects') {
      setLocation('/projects');
    } else if (toolId === 'generators') {
      setLocation('/generators');
    } else if (toolId === 'guides') {
      setLocation('/guides');
    }
  };

  const handleCreateNew = () => {
    setLocation('/notebook');
  };

  // Handler functions for toolbar actions
  const handleToolChange = (tool: MapTool) => {
    setSelectedTool(tool);
    console.log("Selected tool:", tool);
    // Later we'll add actual drawing logic here
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3)); // Max zoom 300%
    console.log("Zoom in");
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25)); // Min zoom 25%
    console.log("Zoom out");
  };

  const handleUndo = () => {
    console.log("Undo");
    // We'll implement undo logic later
  };

  const handleRedo = () => {
    console.log("Redo");
    // We'll implement redo logic later
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const context = ctx;
      if (!context) return;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      if (!canvas || !ctx) return;
      const context = ctx;

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw a test grid
      context.strokeStyle = "#3b3b3b";
      context.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += 50) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }

      // Horizontal lines
      for (let yPos = 0; yPos < canvas.height; yPos += 50) {
        context.beginPath();
        context.moveTo(0, yPos);
        context.lineTo(canvas.width, yPos);
        context.stroke();
      }

      // Draw a test shape
      context.fillStyle = "#3b3b3b";
      context.fillRect(100, 100, 300, 200);

      // Add some text
      context.fillStyle = "#ffffff";
      context.font = "24px sans-serif";
      context.fillText("Map Studio Canvas", 120, 200);
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Main Navigation Header */}
      <Header onNavigate={handleNavigate} onCreateNew={handleCreateNew} />

      {/* Map Studio Header */} 
      <div className="border-b p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/notebook')}
          data-testid="button-back-to-notebook"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Map Studio</h1>
          <p className="text-sm text-muted-foreground">Create and design your world maps</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <MapToolbar
      selectedTool={selectedTool}
      onToolChange={handleToolChange}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onUndo={handleUndo}
      onRedo={handleRedo}
      canUndo={canUndo}
      canRedo={canRedo}
      />

      {/* Canvas Container */}
      <div className="flex-1 overflow-hidden relative">
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
  );
}
