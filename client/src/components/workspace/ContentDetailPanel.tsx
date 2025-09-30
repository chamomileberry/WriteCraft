import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { CONTENT_TYPE_MAPPINGS, getMappingById } from '@shared/contentTypes';

interface ContentDetailPanelProps {
  contentType: string;
  entityId: string;
  panelId: string;
  notebookId?: string;
}

export function ContentDetailPanel({ contentType, entityId, panelId, notebookId }: ContentDetailPanelProps) {
  const mapping = getMappingById(contentType);

  if (!mapping) {
    return (
      <div className="h-full p-4 bg-background overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Unknown content type: {contentType}</p>
        </div>
      </div>
    );
  }

  const { data: content, isLoading, error } = useQuery({
    queryKey: [mapping.apiBase, entityId, notebookId || 'default'],
    queryFn: async () => {
      const url = notebookId 
        ? `${mapping.apiBase}/${entityId}?notebookId=${notebookId}`
        : `${mapping.apiBase}/${entityId}`;
      
      const response = await fetch(url, {
        headers: {
          'X-User-Id': 'demo-user'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${mapping.name}`);
      }
      
      return response.json();
    },
    enabled: !!entityId
  });

  if (isLoading) {
    return (
      <div className="h-full p-4 bg-background overflow-y-auto">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-4 bg-background overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-2">Failed to load {mapping.name}</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-full p-4 bg-background overflow-y-auto flex items-center justify-center">
        <p className="text-muted-foreground">Content not found</p>
      </div>
    );
  }

  // Extract display values based on mapping - supports nested paths like 'core.name'
  const getDisplayValue = (fieldPath: string) => {
    const parts = fieldPath.split('.');
    let value: any = content;
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return '';
      }
    }
    return value || '';
  };

  const title = getDisplayValue(mapping.displayFields.title);
  const subtitle = mapping.displayFields.subtitle ? getDisplayValue(mapping.displayFields.subtitle) : null;
  const description = mapping.displayFields.description ? getDisplayValue(mapping.displayFields.description) : null;
  const badges = mapping.displayFields.badges 
    ? mapping.displayFields.badges.map(badge => getDisplayValue(badge)).filter(Boolean)
    : [];

  // Get all fields to display - including arrays
  const allFields = Object.entries(content).filter(([key, value]) => {
    return key !== 'id' && 
           key !== 'userId' && 
           key !== 'createdAt' && 
           key !== 'notebookId' &&
           value !== null && 
           value !== '';
  });

  return (
    <div className="h-full p-4 bg-background overflow-y-auto">
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{title || 'Untitled'}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              window.open(`/editor/${mapping.urlSegment}/${entityId}`, '_blank');
            }}
            data-testid="button-view-full-content"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Content
          </Button>
        </div>
        
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">All Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allFields.map(([key, value]) => {
                let displayValue = '';
                
                if (typeof value === 'boolean') {
                  displayValue = value ? 'Yes' : 'No';
                } else if (Array.isArray(value)) {
                  if (value.length === 0) {
                    displayValue = 'None';
                  } else if (typeof value[0] === 'object') {
                    // Array of objects - show as list
                    displayValue = value.map((item, idx) => 
                      typeof item === 'object' ? JSON.stringify(item) : String(item)
                    ).join(', ');
                  } else {
                    // Array of primitives - show as comma-separated list
                    displayValue = value.join(', ');
                  }
                } else {
                  displayValue = String(value);
                }
                
                return (
                  <div key={key} className="text-sm">
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>{' '}
                    <span className="text-muted-foreground">
                      {displayValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
