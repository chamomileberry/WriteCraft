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

// Icon types with emoji/unicode representations
export type IconType = 'city' | 'castle' | 'mountain' | 'forest' | 'village' | 'port' | 'cave' | 'tower' | 'ruins';

const ICON_SYMBOLS: Record<IconType, string> = {
  city: '🏛️',
  castle: '🏰',
  mountain: '⛰️',
  forest: '🌲',
  village: '🏘️',
  port: '⚓',
  cave: '🕳️',
  tower: '🗼',
  ruins: '🏚️',
};

// Layer data structures
interface MapIcon {
  id: string;
  type: IconType;
  x: number;
  y: number;
  name: string;
  linkedContentId?: string;
}

interface MapLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
}

interface MapBorder {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
  closed: boolean;
}

interface LayerVisibility {
  terrain: boolean;
  icons: boolean;
  labels: boolean;
  borders: boolean;
}

interface HistoryState {
  imageData: ImageData;
  icons: MapIcon[];
  labels: MapLabel[];
  borders: MapBorder[];
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

  // Layer data
  const [icons, setIcons] = useState<MapIcon[]>([]);
  const [labels, setLabels] = useState<MapLabel[]>([]);
  const [borders, setBorders] = useState<MapBorder[]>([]);
  const [currentBorder, setCurrentBorder] = useState<{ x: number; y: number }[]>([]);

  // Layer visibility
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    terrain: true,
    icons: true,
    labels: true,
    borders: true,
  });

  // Selected icon type for placement
  const [selectedIconType, setSelectedIconType] = useState<IconType>('city');

  // Selected item for editing
  const [selectedItem, setSelectedItem] = useState<{ type: 'icon' | 'label' | 'border', id: string } | null>(null);

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
    newHistory.push({
      imageData,
      icons: [...icons],
      labels: [...labels],
      borders: [...borders],
    });

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
    setIcons(state.icons);
    setLabels(state.labels);
    setBorders(state.borders);
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
    setIcons(state.icons);
    setLabels(state.labels);
    setBorders(state.borders);
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
      setHistory([{
        imageData,
        icons: [],
        labels: [],
        borders: [],
      }]);
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

    // Layer 1: Terrain (from offscreen canvas)
    if (layerVisibility.terrain) {
      ctx.drawImage(offscreenCanvas, 0, 0);
    }

    // Layer 2: Borders
    if (layerVisibility.borders) {
      borders.forEach(border => {
        if (border.points.length < 2) return;

        ctx.strokeStyle = border.color;
        ctx.lineWidth = border.lineWidth;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(border.points[0].x, border.points[0].y);

        for (let i = 1; i < border.points.length; i++) {
          ctx.lineTo(border.points[i].x, border.points[i].y);
        }

        if (border.closed && border.points.length > 2) {
          ctx.closePath();
        }

        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw current border being drawn
      if (currentBorder.length > 0) {
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(currentBorder[0].x, currentBorder[0].y);

        for (let i = 1; i < currentBorder.length; i++) {
          ctx.lineTo(currentBorder[i].x, currentBorder[i].y);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Draw points
        currentBorder.forEach(point => {
          ctx.fillStyle = '#FF6B6B';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    // Layer 3: Icons
    if (layerVisibility.icons) {
      icons.forEach(icon => {
        const symbol = ICON_SYMBOLS[icon.type];
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow for visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(symbol, icon.x, icon.y);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw name below icon if it exists
        if (icon.name) {
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeText(icon.name, icon.x, icon.y + 25);
          ctx.fillText(icon.name, icon.x, icon.y + 25);
        }

        // Highlight selected icon
        if (selectedItem?.type === 'icon' && selectedItem.id === icon.id) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(icon.x, icon.y, 20, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }

    // Layer 4: Labels
    if (layerVisibility.labels) {
      labels.forEach(label => {
        ctx.font = `${label.fontWeight} ${label.fontSize}px Arial`;
        ctx.fillStyle = label.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Outline for readability
        ctx.strokeText(label.text, label.x, label.y);
        ctx.fillText(label.text, label.x, label.y);

        // Highlight selected label
        if (selectedItem?.type === 'label' && selectedItem.id === label.id) {
          const metrics = ctx.measureText(label.text);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            label.x - metrics.width / 2 - 5,
            label.y - label.fontSize / 2 - 5,
            metrics.width + 10,
            label.fontSize + 10
          );
        }
      });
    }

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

  // Redraw when zoom, pan, or any layer changes
  useEffect(() => {
    redraw();
  }, [zoom, pan, icons, labels, borders, currentBorder, layerVisibility, selectedItem]);

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
          case 'i':
            setSelectedTool('icon');
            break;
          case 'l':
            setSelectedTool('label');
            break;
          case 'b':
            setSelectedTool('border');
            break;
          case '+':
          case '=':
            handleZoomIn();
            break;
          case '-':
          case '_':
            handleZoomOut();
            break;
          case 'enter':
            // Complete border
            if (currentBorder.length > 2) {
              const borderName = prompt('Enter name for this border/region:') || 'Unnamed Region';
              const newBorder: MapBorder = {
                id: `border-${Date.now()}`,
                name: borderName,
                points: [...currentBorder],
                color: '#FF6B6B',
                lineWidth: 3,
                closed: true,
              };
              setBorders(prev => [...prev, newBorder]);
              setCurrentBorder([]);
              saveToHistory();
            }
            break;
          case 'escape':
            // Cancel current border
            setCurrentBorder([]);
            setSelectedItem(null);
            break;
          case 'delete':
          case 'backspace':
            // Delete selected item
            if (selectedItem) {
              if (selectedItem.type === 'icon') {
                setIcons(prev => prev.filter(i => i.id !== selectedItem.id));
              } else if (selectedItem.type === 'label') {
                setLabels(prev => prev.filter(l => l.id !== selectedItem.id));
              } else if (selectedItem.type === 'border') {
                setBorders(prev => prev.filter(b => b.id !== selectedItem.id));
              }
              setSelectedItem(null);
              saveToHistory();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, currentBorder, selectedItem]);

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
    const pos = getMousePos(e);

    if (selectedTool === 'pan') {
      setIsPanning(true);
      setLastPoint({ x: e.clientX, y: e.clientY });
    } else if (selectedTool === 'pencil' || selectedTool === 'eraser' ||
               selectedTool === 'mountain' || selectedTool === 'forest' ||
               selectedTool === 'water') {
      setIsDrawing(true);
      setLastPoint(pos);
      drawBrushStroke(pos.x, pos.y, pos.x, pos.y);
    } else if (selectedTool === 'icon') {
      // Place an icon
      const iconName = prompt('Enter name for this location (optional):');
      const newIcon: MapIcon = {
        id: `icon-${Date.now()}`,
        type: selectedIconType,
        x: pos.x,
        y: pos.y,
        name: iconName || '',
      };
      setIcons(prev => [...prev, newIcon]);
      saveToHistory();
    } else if (selectedTool === 'label') {
      // Create a label
      const labelText = prompt('Enter label text:');
      if (labelText) {
        const newLabel: MapLabel = {
          id: `label-${Date.now()}`,
          text: labelText,
          x: pos.x,
          y: pos.y,
          fontSize: 24,
          color: '#FFFFFF',
          fontWeight: 'bold',
        };
        setLabels(prev => [...prev, newLabel]);
        saveToHistory();
      }
    } else if (selectedTool === 'border') {
      // Add point to current border
      setCurrentBorder(prev => [...prev, pos]);
    } else if (selectedTool === 'select') {
      // Check if clicking on an icon
      const clickedIcon = icons.find(icon => {
        const distance = Math.sqrt((icon.x - pos.x) ** 2 + (icon.y - pos.y) ** 2);
        return distance < 20; // 20px click radius
      });

      if (clickedIcon) {
        setSelectedItem({ type: 'icon', id: clickedIcon.id });
        return;
      }

      // Check if clicking on a label
      const clickedLabel = labels.find(label => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return false;
        ctx.font = `${label.fontWeight} ${label.fontSize}px Arial`;
        const metrics = ctx.measureText(label.text);
        const halfWidth = metrics.width / 2;
        const halfHeight = label.fontSize / 2;

        return pos.x >= label.x - halfWidth &&
               pos.x <= label.x + halfWidth &&
               pos.y >= label.y - halfHeight &&
               pos.y <= label.y + halfHeight;
      });

      if (clickedLabel) {
        setSelectedItem({ type: 'label', id: clickedLabel.id });
        return;
      }

      // Clear selection if nothing clicked
      setSelectedItem(null);
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

        {/* Icon Library Panel - shown when icon tool is selected */}
        {selectedTool === 'icon' && (
          <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <h3 className="font-semibold mb-3">Select Icon Type:</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ICON_SYMBOLS).map(([type, symbol]) => (
                <button
                  key={type}
                  onClick={() => setSelectedIconType(type as IconType)}
                  className={`p-3 rounded border-2 transition-all hover:scale-105 flex flex-col items-center gap-1 ${
                    selectedIconType === type ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  title={type}
                >
                  <span className="text-2xl">{symbol}</span>
                  <span className="text-xs capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layer Controls Panel - always visible on the right */}
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg min-w-[200px]">
          <h3 className="font-semibold mb-3">Layers</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
              <input
                type="checkbox"
                checked={layerVisibility.terrain}
                onChange={(e) => setLayerVisibility(prev => ({ ...prev, terrain: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Terrain</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
              <input
                type="checkbox"
                checked={layerVisibility.borders}
                onChange={(e) => setLayerVisibility(prev => ({ ...prev, borders: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Borders ({borders.length})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
              <input
                type="checkbox"
                checked={layerVisibility.icons}
                onChange={(e) => setLayerVisibility(prev => ({ ...prev, icons: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Icons ({icons.length})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
              <input
                type="checkbox"
                checked={layerVisibility.labels}
                onChange={(e) => setLayerVisibility(prev => ({ ...prev, labels: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Labels ({labels.length})</span>
            </label>
          </div>

          {/* Active Tool Info */}
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">Active Tool</h4>
            <p className="text-sm font-medium capitalize">{selectedTool.replace('-', ' ')}</p>
            {selectedTool === 'border' && currentBorder.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {currentBorder.length} points • Press Enter to finish
              </p>
            )}
          </div>
        </div>

        {/* Instructions Overlay */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold mb-2">Quick Tips:</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <kbd className="px-1 bg-muted rounded">P</kbd> Pencil • <kbd className="px-1 bg-muted rounded">M</kbd> Mountain • <kbd className="px-1 bg-muted rounded">F</kbd> Forest • <kbd className="px-1 bg-muted rounded">W</kbd> Water</li>
            <li>• <kbd className="px-1 bg-muted rounded">I</kbd> Place Icon • <kbd className="px-1 bg-muted rounded">L</kbd> Add Label • <kbd className="px-1 bg-muted rounded">B</kbd> Draw Border</li>
            <li>• <kbd className="px-1 bg-muted rounded">V</kbd> Select • <kbd className="px-1 bg-muted rounded">H</kbd> Pan • <kbd className="px-1 bg-muted rounded">E</kbd> Eraser</li>
            <li>• <kbd className="px-1 bg-muted rounded">Ctrl+Z</kbd> Undo • <kbd className="px-1 bg-muted rounded">Del</kbd> Delete selected</li>
            <li>• Border tool: Click to add points, <kbd className="px-1 bg-muted rounded">Enter</kbd> to finish</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
