import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Palette, Clock, Edit2, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Canvas } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

export default function CanvasesListPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [canvasToDelete, setCanvasToDelete] = useState<string | null>(null);
  
  // Fetch all canvases for the user
  const { data: canvases, isLoading } = useQuery({
    queryKey: ['/api/canvases'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/canvases',);
      if (!response.ok) throw new Error('Failed to load canvases');
      return response.json() as Promise<Canvas[]>;
    },
  });

  // Delete canvas mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/canvases/${id}`, 'DELETE');
      if (!response.ok) throw new Error('Failed to delete canvas');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvases'] });
      toast({
        title: 'Canvas deleted',
        description: 'Your canvas has been deleted successfully.',
      });
      setCanvasToDelete(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete canvas. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateNew = () => {
    setLocation('/canvas/new');
  };

  const handleEditCanvas = (id: string) => {
    setLocation(`/canvas/${id}`);
  };

  const handleDeleteCanvas = (id: string) => {
    setCanvasToDelete(id);
  };

  const confirmDelete = () => {
    if (canvasToDelete) {
      deleteMutation.mutate(canvasToDelete);
    }
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
                  className="hover-elevate transition-all"
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {canvas.updatedAt
                          ? formatDistanceToNow(new Date(canvas.updatedAt), { addSuffix: true })
                          : 'Never'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => handleEditCanvas(canvas.id)}
                        data-testid={`button-edit-canvas-${canvas.id}`}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteCanvas(canvas.id)}
                        data-testid={`button-delete-canvas-${canvas.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!canvasToDelete} onOpenChange={(open) => !open && setCanvasToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Canvas</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this canvas? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
