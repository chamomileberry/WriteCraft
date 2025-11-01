import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

export default function MapStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setLocation] = useLocation();

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
      <Header onNavigate={(view) => setLocation(`/?view=${view}`)} />

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
