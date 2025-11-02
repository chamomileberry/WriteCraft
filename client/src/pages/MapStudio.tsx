import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MapToolbar, { MapTool } from "@/components/MapToolbar";
import Header from "@/components/Header";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Terrain color palette
const TERRAIN_COLORS: Record<string, string> = {
  land: "#8B7355",      // Brown land
  grass: "#6B8E23",     // Olive green
  forest: "#228B22",    // Forest green
  mountain: "#696969",  // Dark gray
  water: "#4682B4",     // Steel blue
  deepWater: "#191970", // Midnight blue
  sand: "#F4A460",      // Sandy brown
  snow: "#FFFAFA",      // Snow white
};

interface HistoryState {
  imageData: ImageData;
}

export default function MapStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setLocation] = useLocation();

  const [selectedTool, setSelectedTool] = useState<MapTool>("pencil");
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState(TERRAIN_COLORS.land);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Undo/Redo history
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

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

    // Auto-select appropriate colors for terrain tools
    if (tool === 'mountain') {
      setBrushColor(TERRAIN_COLORS.mountain);
    } else if (tool === 'forest') {
      setBrushColor(TERRAIN_COLORS.forest);
    } else if (tool === 'water') {
      setBrushColor(TERRAIN_COLORS.water);
    } else if (tool === 'pencil') {
      setBrushColor(TERRAIN_COLORS.land);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3)); // Max zoom 300%
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25)); // Min zoom 25%
  };

  const saveToHistory = () => {
    const canvas = offscreenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ imageData });

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }

    setHistory(newHistory);
  };

  const handleUndo = () => {
    if (!canUndo) return;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);

    const canvas = offscreenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = history[newIndex];
    ctx.putImageData(state.imageData, 0, 0);
    redraw();
  };

  const handleRedo = () => {
    if (!canRedo) return;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);

    const canvas = offscreenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = history[newIndex];
    ctx.putImageData(state.imageData, 0, 0);
    redraw();
  };

  // Initialize offscreen canvas for drawing operations
  useEffect(() => {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 2000;
    offscreenCanvas.height = 2000;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (offscreenCtx) {
      // Fill with ocean blue background
      offscreenCtx.fillStyle = TERRAIN_COLORS.deepWater;
      offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      offscreenCanvasRef.current = offscreenCanvas;

      // Save initial state to history
      const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      setHistory([{ imageData }]);
      setHistoryIndex(0);
    }
  }, []);

  // Redraw the canvas
  const redraw = () => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!canvas || !offscreenCanvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw the offscreen canvas content
    ctx.drawImage(offscreenCanvas, 0, 0);

    ctx.restore();
  };

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redraw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [zoom, pan]);

  // Redraw when zoom or pan changes
  useEffect(() => {
    redraw();
  }, [zoom, pan]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setSelectedTool('select');
            break;
          case 'h':
            setSelectedTool('pan');
            break;
          case 'p':
            setSelectedTool('pencil');
            setBrushColor(TERRAIN_COLORS.land);
            break;
          case 'e':
            setSelectedTool('eraser');
            break;
          case 'm':
            setSelectedTool('mountain');
            setBrushColor(TERRAIN_COLORS.mountain);
            break;
          case 'f':
            setSelectedTool('forest');
            setBrushColor(TERRAIN_COLORS.forest);
            break;
          case 'w':
            setSelectedTool('water');
            setBrushColor(TERRAIN_COLORS.water);
            break;
          case '+':
          case '=':
            handleZoomIn();
            break;
          case '-':
          case '_':
            handleZoomOut();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Get mouse position relative to canvas with zoom and pan
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  // Draw a brush stroke between two points
  const drawBrushStroke = (x1: number, y1: number, x2: number, y2: number) => {
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!offscreenCanvas) return;

    const ctx = offscreenCanvas.getContext("2d");
    if (!ctx) return;

    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.max(1, Math.floor(distance / (brushSize / 4)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;

      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);

      if (selectedTool === 'eraser') {
        // Eraser reveals the background
        ctx.fillStyle = TERRAIN_COLORS.deepWater;
      } else {
        ctx.fillStyle = brushColor;
      }

      ctx.fill();
    }

    redraw();
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'pan') {
      setIsPanning(true);
      setLastPoint({ x: e.clientX, y: e.clientY });
    } else if (selectedTool === 'pencil' || selectedTool === 'eraser' ||
               selectedTool === 'mountain' || selectedTool === 'forest' ||
               selectedTool === 'water') {
      setIsDrawing(true);
      const pos = getMousePos(e);
      setLastPoint(pos);
      drawBrushStroke(pos.x, pos.y, pos.x, pos.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && lastPoint) {
      const dx = e.clientX - lastPoint.x;
      const dy = e.clientY - lastPoint.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPoint({ x: e.clientX, y: e.clientY });
    } else if (isDrawing && lastPoint) {
      const pos = getMousePos(e);
      drawBrushStroke(lastPoint.x, lastPoint.y, pos.x, pos.y);
      setLastPoint(pos);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      saveToHistory();
    }
    setIsDrawing(false);
    setIsPanning(false);
    setLastPoint(null);
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      saveToHistory();
    }
    setIsDrawing(false);
    setIsPanning(false);
    setLastPoint(null);
  };

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

      {/* Brush Controls Panel */}
      <div className="border-b p-4 bg-muted/30">
        <div className="max-w-4xl mx-auto flex items-center gap-8">
          {/* Brush Size */}
          <div className="flex items-center gap-4 flex-1">
            <Label htmlFor="brush-size" className="whitespace-nowrap">
              Brush Size: {brushSize}px
            </Label>
            <Slider
              id="brush-size"
              min={5}
              max={100}
              step={5}
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              className="flex-1"
            />
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-2">
            <Label>Terrain Colors:</Label>
            <div className="flex gap-1">
              {Object.entries(TERRAIN_COLORS).map(([name, color]) => (
                <button
                  key={name}
                  onClick={() => setBrushColor(color)}
                  className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                    brushColor === color ? 'border-primary ring-2 ring-primary' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  title={name}
                  data-testid={`color-${name}`}
                />
              ))}
            </div>
          </div>

          {/* Zoom Display */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-hidden relative bg-muted/10">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ cursor: selectedTool === 'pan' ? 'grab' : isPanning ? 'grabbing' : 'crosshair' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

        {/* Instructions Overlay */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold mb-2">Quick Tips:</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Select a tool and draw to create terrain</li>
            <li>• Use Pan tool or middle mouse to move around</li>
            <li>• Adjust brush size for detailed or broad strokes</li>
            <li>• Pick terrain colors for different land types</li>
            <li>• Use Ctrl+Z / Ctrl+Y for undo/redo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
