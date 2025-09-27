import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, Edit, Calendar, FileText, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useWorkspaceStore, type PanelDescriptor } from "@/stores/workspaceStore";

interface Manuscript {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  wordCount: number;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function ManuscriptPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch manuscripts
  const { data: manuscripts = [], isLoading } = useQuery({
    queryKey: ['/api/manuscripts'],
    enabled: true,
  });

  // Search manuscripts
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['/api/manuscripts/search', searchQuery],
    queryFn: async () => {
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(`/api/manuscripts/search?q=${encodedQuery}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Create new manuscript mutation
  const createManuscriptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/manuscripts', {
        title: 'Untitled Manuscript',
        content: '',
        status: 'draft',
        tags: []
      });
      return response.json() as Promise<Manuscript>;
    },
    onSuccess: (newManuscript: Manuscript) => {
      queryClient.invalidateQueries({ queryKey: ['/api/manuscripts'] });
      // Redirect to the editor for the new manuscript
      navigate(`/manuscripts/${newManuscript.id}/edit`);
    }
  });

  // Delete manuscript mutation
  const deleteManuscriptMutation = useMutation({
    mutationFn: async (manuscriptId: string) => {
      const response = await apiRequest('DELETE', `/api/manuscripts/${manuscriptId}`);
      return response;
    },
    onSuccess: (_, manuscriptId) => {
      // Clean up workspace panels related to the deleted manuscript
      const { currentLayout, removePanel } = useWorkspaceStore.getState();
      
      // Remove all panels related to this manuscript
      const panelsToRemove = currentLayout.panels.filter((panel: PanelDescriptor) => 
        panel.entityId === manuscriptId || 
        (panel.type === 'manuscript' && panel.entityId === manuscriptId)
      );
      
      panelsToRemove.forEach(panel => removePanel(panel.id));
      
      // Invalidate queries to refresh the manuscripts list
      queryClient.invalidateQueries({ queryKey: ['/api/manuscripts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
    }
  });

  const displayedManuscripts: Manuscript[] = searchQuery.trim() ? searchResults as Manuscript[] : manuscripts as Manuscript[];

  const handleCreateNew = () => {
    createManuscriptMutation.mutate();
  };

  const handleDelete = (manuscriptId: string, manuscriptTitle: string) => {
    if (confirm(`Are you sure you want to delete "${manuscriptTitle}"? This action cannot be undone.`)) {
      deleteManuscriptMutation.mutate(manuscriptId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Manuscripts</h1>
              <p className="text-muted-foreground">Your writing projects and documents</p>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateNew}
            disabled={createManuscriptMutation.isPending}
            data-testid="button-create-manuscript"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Manuscript
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search manuscripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-manuscripts"
            />
          </div>
        </div>

        {/* Loading state */}
        {(isLoading || isSearching) && (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Loading manuscripts...</div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isSearching && displayedManuscripts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No manuscripts found' : 'No manuscripts yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No manuscripts match "${searchQuery}"`
                : 'Create your first manuscript to get started'
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNew} disabled={createManuscriptMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Manuscript
              </Button>
            )}
          </div>
        )}

        {/* Manuscripts grid */}
        {!isLoading && !isSearching && displayedManuscripts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedManuscripts.map((manuscript: Manuscript) => (
              <Card key={manuscript.id} className="hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {manuscript.title}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(manuscript.status)}
                    >
                      {manuscript.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {manuscript.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {manuscript.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      {manuscript.wordCount || 0} words
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(manuscript.updatedAt)}
                    </div>
                  </div>

                  {manuscript.tags && manuscript.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {manuscript.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {manuscript.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{manuscript.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Link href={`/manuscripts/${manuscript.id}/edit`} className="flex-1">
                      <Button size="sm" className="w-full" data-testid={`button-edit-manuscript-${manuscript.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(manuscript.id, manuscript.title)}
                      disabled={deleteManuscriptMutation.isPending}
                      data-testid={`button-delete-manuscript-${manuscript.id}`}
                      title="Delete manuscript"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}