import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, AlertCircle, Save, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import type { Canvas } from '@shared/schema';

interface ExcalidrawElement {
  id: string;
  type: string;
  [key: string]: any;
}

interface ExcalidrawAppState {
  [key: string]: any;
}

export default function CanvasPage() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState('Untitled Canvas');
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch canvas data if editing existing canvas
  const { data: canvas, isLoading, error } = useQuery({
    queryKey: ['/api/canvases', id],
    queryFn: async () => {
      if (!id || id === 'new') return null;
      const response = await apiRequest('GET', `/api/canvases/${id}`);
      if (!response.ok) throw new Error('Failed to load canvas');
      return response.json() as Promise<Canvas>;
    },
    enabled: !!id && id !== 'new',
  });

  // Update title when canvas data loads
  useEffect(() => {
    if (canvas) {
      setTitle(canvas.name);
    }
  }, [canvas]);

  // Create canvas mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; data: string }) => {
      const response = await apiRequest('POST', '/api/canvases', data);
      if (!response.ok) throw new Error('Failed to create canvas');
      return response.json();
    },
    onSuccess: (newCanvas) => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvases'] });
      setLocation(`/canvas/${newCanvas.id}`);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      toast({
        title: 'Canvas created',
        description: 'Your canvas has been created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create canvas. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update canvas mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; data: string }) => {
      if (!id || id === 'new') throw new Error('Canvas ID is required');
      const response = await apiRequest('PUT', `/api/canvases/${id}`, data);
      if (!response.ok) throw new Error('Failed to update canvas');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvases', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/canvases'] });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save canvas. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Auto-save functionality
  const saveCanvas = useCallback(() => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    
    const canvasDataObj = {
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        gridSize: appState.gridSize,
      },
    };

    const canvasDataString = JSON.stringify(canvasDataObj);

    if (id === 'new') {
      createMutation.mutate({ name: title, data: canvasDataString });
    } else {
      updateMutation.mutate({ name: title, data: canvasDataString });
    }
  }, [excalidrawAPI, id, title, createMutation, updateMutation]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      saveCanvas();
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, saveCanvas]);

  // Handle Excalidraw changes
  const handleChange = useCallback((elements: readonly ExcalidrawElement[], appState: ExcalidrawAppState) => {
    setHasUnsavedChanges(true);
  }, []);

  // Manual save handler
  const handleSave = () => {
    saveCanvas();
    toast({
      title: 'Saving...',
      description: 'Your canvas is being saved.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header onNavigate={(view) => setLocation(`/?view=${view}`)} />
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-64 mb-2" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error && id !== 'new') {
    return (
      <div className="flex flex-col h-screen">
        <Header onNavigate={(view) => setLocation(`/?view=${view}`)} />
        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-lg text-muted-foreground">Failed to load canvas</p>
          <p className="text-sm text-muted-foreground">{error?.message || 'Unknown error'}</p>
          <Button onClick={() => setLocation('/')} data-testid="button-go-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Main Navigation Header */}
      <Header onNavigate={(view) => setLocation(`/?view=${view}`)} />
      
      {/* Canvas Header */}
      <div className="border-b p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/')}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasUnsavedChanges(true);
          }}
          className="flex-1 text-2xl font-bold border-0 p-0 focus-visible:ring-0"
          placeholder="Canvas title..."
          data-testid="input-canvas-title"
        />
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600">Unsaved changes</span>
          )}
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="button-save"
          >
            {(createMutation.isPending || updateMutation.isPending) ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Excalidraw Canvas */}
      <div className="flex-1" style={{ height: 'calc(100vh - 8rem)' }}>
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{
            elements: (canvas?.data ? JSON.parse(canvas.data).elements : []) || [],
            appState: (canvas?.data ? JSON.parse(canvas.data).appState : {}) || {},
          }}
          onChange={handleChange}
          theme="light"
        />
      </div>
    </div>
  );
}
