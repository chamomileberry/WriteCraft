import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FEATURES } from '@/lib/features-config';

interface MentionHoverCardProps {
  contentType: string;
  contentId: string;
  children: React.ReactNode;
}

interface ContentPreview {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
}

export default function MentionHoverCard({ contentType, contentId, children }: MentionHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // For features, get data from client-side config instead of fetching
  const featurePreview = useMemo((): ContentPreview | null => {
    if (contentType === 'feature') {
      const feature = FEATURES.find(f => f.id === contentId);
      if (feature) {
        return {
          id: feature.id,
          type: 'Feature',
          title: feature.title,
          subtitle: feature.category,
          description: feature.description,
        };
      }
    }
    return null;
  }, [contentType, contentId]);

  const { data: preview, isLoading, error } = useQuery<ContentPreview>({
    queryKey: ['/api/content/preview', contentType, contentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/content/preview?type=${encodeURIComponent(contentType)}&id=${encodeURIComponent(contentId)}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch preview');
      }
      return response.json();
    },
    enabled: isOpen && contentType !== 'feature', // Only fetch when hover card is opened and not a feature
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Use feature preview if available, otherwise use fetched preview
  const displayPreview = featurePreview || preview;

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen} openDelay={300}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80" 
        style={{ zIndex: 9999 }}
        side="top" 
        align="start"
        data-testid="mention-hover-card"
      >
        {isLoading && !featurePreview && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {error && !featurePreview && (
          <div className="text-sm text-muted-foreground p-2">
            Failed to load preview
          </div>
        )}

        {displayPreview && !isLoading && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {displayPreview.imageUrl ? (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={displayPreview.imageUrl} alt={displayPreview.title} />
                  <AvatarFallback>
                    {displayPreview.title.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {displayPreview.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {displayPreview.type}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold truncate">
                  {displayPreview.title}
                </h4>
                {displayPreview.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {displayPreview.subtitle}
                  </p>
                )}
              </div>
            </div>

            {displayPreview.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {displayPreview.description}
              </p>
            )}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
