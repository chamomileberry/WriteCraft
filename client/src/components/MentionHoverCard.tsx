import { useState } from 'react';
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
    enabled: isOpen, // Only fetch when hover card is opened
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen} openDelay={300}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80" 
        side="top" 
        align="start"
        data-testid="mention-hover-card"
      >
        {isLoading && (
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

        {error && (
          <div className="text-sm text-muted-foreground p-2">
            Failed to load preview
          </div>
        )}

        {preview && !isLoading && !error && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {preview.imageUrl ? (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={preview.imageUrl} alt={preview.title} />
                  <AvatarFallback>
                    {preview.title.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {preview.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {preview.type}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold truncate">
                  {preview.title}
                </h4>
                {preview.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {preview.subtitle}
                  </p>
                )}
              </div>
            </div>

            {preview.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {preview.description}
              </p>
            )}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
