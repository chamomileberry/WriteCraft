import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, AlertCircle, List, Layers, Moon, Sun } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { TimelineCanvas } from '@/components/TimelineCanvas';
import { TimelineListView } from '@/components/TimelineListView';
import type { Timeline } from '@shared/schema';

export default function TimelineViewPage() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && systemDark);
    
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  // Extract notebookId from query parameters using window.location.search
  // Note: wouter's location doesn't include query params, so we use window.location
  const searchParams = new URLSearchParams(window.location.search);
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
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 items-center text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded-md">{timeline.timelineType}</span>
            <span className="px-2 py-1 bg-muted rounded-md">{timeline.timeScale}</span>
            {timeline.scope && (
              <span className="px-2 py-1 bg-muted rounded-md">{timeline.scope}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* View Toggle and Content */}
      <Tabs defaultValue="list" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList data-testid="timeline-view-tabs">
            <TabsTrigger value="list" className="gap-2" data-testid="tab-list-view">
              <List className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="canvas" className="gap-2" data-testid="tab-canvas-view">
              <Layers className="w-4 h-4" />
              Canvas View
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="list" className="flex-1 overflow-auto mt-0">
          <TimelineListView timelineId={id!} notebookId={notebookId} />
        </TabsContent>
        
        <TabsContent value="canvas" className="flex-1 overflow-hidden mt-0">
          <TimelineCanvas timelineId={id!} notebookId={notebookId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
