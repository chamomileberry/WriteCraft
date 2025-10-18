import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Palette, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { apiRequest } from '@/lib/queryClient';
import type { Canvas } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

export default function CanvasesListPage() {
  const [location, setLocation] = useLocation();
  
  // Fetch all canvases for the user
  const { data: canvases, isLoading } = useQuery({
    queryKey: ['/api/canvases'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/canvases');
      if (!response.ok) throw new Error('Failed to load canvases');
      return response.json() as Promise<Canvas[]>;
    },
  });

  const handleCreateNew = () => {
    setLocation('/canvas/new');
  };

  const handleOpenCanvas = (id: string) => {
    setLocation(`/canvas/${id}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onNavigate={(view) => setLocation(`/?view=${view}`)} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Canvas</h1>
              <p className="text-muted-foreground mt-2">
                Create visual diagrams, character maps, and story structures
              </p>
            </div>
            <Button onClick={handleCreateNew} data-testid="button-create-canvas">
              <Plus className="w-4 h-4 mr-2" />
              New Canvas
            </Button>
          </div>

          {/* Canvases Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : canvases && canvases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {canvases.map((canvas) => (
                <Card
                  key={canvas.id}
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => handleOpenCanvas(canvas.id)}
                  data-testid={`canvas-card-${canvas.id}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      {canvas.name}
                    </CardTitle>
                    {canvas.description && (
                      <CardDescription>{canvas.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {canvas.updatedAt
                          ? formatDistanceToNow(new Date(canvas.updatedAt), { addSuffix: true })
                          : 'Never'}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCanvas(canvas.id);
                      }}
                    >
                      Open Canvas
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Palette className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No canvases yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first canvas to start visualizing your story elements, character relationships, and plot structures.
              </p>
              <Button onClick={handleCreateNew} size="lg" data-testid="button-create-first-canvas">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Canvas
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
