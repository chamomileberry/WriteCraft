import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { TimelineCanvas } from '@/components/TimelineCanvas';
import type { Timeline } from '@shared/schema';

export default function TimelineViewPage() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();

  // Extract notebookId from query parameters using wouter's location
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const notebookId = searchParams.get('notebookId');

  // Fetch timeline data
  const { data: timeline, isLoading, error } = useQuery({
    queryKey: ['/api/timelines', id, notebookId],
    queryFn: async () => {
      if (!notebookId) {
        throw new Error('No notebook selected');
      }
      const response = await apiRequest('GET', `/api/timelines/${id}?notebookId=${notebookId}`);
      if (!response.ok) throw new Error('Failed to load timeline');
      return response.json() as Promise<Timeline>;
    },
    enabled: !!id && !!notebookId,
  });

  if (!notebookId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-8">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">No notebook selected</p>
        <Button onClick={() => setLocation('/')} data-testid="button-go-home">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-8">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg text-muted-foreground">Failed to load timeline</p>
        <p className="text-sm text-muted-foreground">{error?.message || 'Unknown error'}</p>
        <Button onClick={() => setLocation('/')} data-testid="button-go-home">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation(`/?notebook=${notebookId}`)}
          data-testid="button-back-to-notebook"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{timeline.name}</h1>
          <p className="text-sm text-muted-foreground">{timeline.description}</p>
        </div>
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded-md">{timeline.timelineType}</span>
          <span className="px-2 py-1 bg-muted rounded-md">{timeline.timeScale}</span>
          {timeline.scope && (
            <span className="px-2 py-1 bg-muted rounded-md">{timeline.scope}</span>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <TimelineCanvas timelineId={id!} notebookId={notebookId} />
      </div>
    </div>
  );
}
