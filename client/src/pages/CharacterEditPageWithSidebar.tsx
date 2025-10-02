import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type UpdateCharacter, type Character } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { characterConfig } from "@/components/forms/content-types";
import CharacterEditorWithSidebar from "@/components/forms/CharacterEditorWithSidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNotebookStore } from "@/stores/notebookStore";
import { useState } from "react";

export default function CharacterEditPageWithSidebar() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeNotebookId } = useNotebookStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Extract notebookId from query parameters, fallback to active notebook
  const urlParams = new URLSearchParams(window.location.search);
  const queryNotebookId = urlParams.get('notebookId');
  const notebookId = queryNotebookId || activeNotebookId;

  // Fetch character data - include notebookId in query parameters
  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: ['/api/characters', id, notebookId],
    queryFn: async () => {
      if (!notebookId) {
        throw new Error('No active notebook selected. Please create or select a notebook first.');
      }
      const response = await apiRequest('GET', `/api/characters/${id}?notebookId=${notebookId}`);
      return response.json();
    },
    enabled: !!id && !!notebookId,
  });

  // Update character mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCharacter) => {
      if (!notebookId) {
        throw new Error('No notebook ID available for update');
      }
      const response = await fetch(`/api/characters/${id}?notebookId=${notebookId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update character');
      }
      return response.json();
    },
    onSuccess: async (updatedCharacter) => {
      // Automatically save character to collection when edited
      try {
        await apiRequest('POST', '/api/saved-items', {
          userId: 'demo-user', // Use demo-user for consistency
          itemType: 'character',
          itemId: id,
          notebookId: notebookId
        });
      } catch (error) {
        // Ignore error if already saved (duplicate key error is expected)
        console.log('Character may already be saved to collection');
      }
      
      toast({
        title: "Character Updated",
        description: "Your character has been successfully updated and saved to your collection!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/characters', id] });
      // Invalidate all saved-items queries for this user (covers all notebooks)
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', 'demo-user'], exact: false });
    },
    onError: (error) => {
      console.error('Error updating character:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update character. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Clean payload: remove empty/unchanged fields to avoid overwriting stored data
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => {
        // Remove empty strings and undefined values
        if (value === "" || value === undefined) return false;
        
        // Remove empty arrays to prevent overwriting stored arrays
        if (Array.isArray(value) && value.length === 0) return false;
        
        // Keep all other valid values
        return true;
      })
    ) as UpdateCharacter;
    
    updateMutation.mutate(cleanedData);
  };

  const handleGenerate = () => {
    // AI generation functionality can be added here
    toast({
      title: "AI Generation",
      description: "AI character generation coming soon!",
    });
  };

  const handleNavigate = (toolId: string) => {
    if (toolId === 'notebook') {
      setLocation('/notebook');
    } else if (toolId === 'projects') {
      setLocation('/projects');
    } else if (toolId === 'generators') {
      setLocation('/generators');
    } else if (toolId === 'guides') {
      setLocation('/guides');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateNew = () => {
    setLocation('/notebook');
  };

  // Handle missing notebook gracefully
  if (!notebookId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No active notebook selected. Please create or select a notebook first.</p>
          <Button onClick={() => setLocation('/notebook')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Notebooks
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading character...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Failed to load character.'}</p>
          <Button onClick={() => setLocation('/notebook')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notebook
          </Button>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Character not found.</p>
          <Button onClick={() => setLocation('/notebook')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notebook
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation Header */}
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        onCreateNew={handleCreateNew}
      />
      
      {/* Sub-header with Back Navigation */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/notebook')}
              data-testid="button-back-to-notebook"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Notebook
            </Button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">
                Edit Character
                {character && (
                  <span className="ml-2 text-muted-foreground font-normal">
                    {[character?.givenName, character?.familyName].filter(Boolean).join(' ') || 'Untitled Character'}
                  </span>
                )}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Character Editor */}
      <CharacterEditorWithSidebar
        config={characterConfig}
        initialData={character}
        onSubmit={onSubmit}
        onGenerate={handleGenerate}
        isLoading={updateMutation.isPending}
        isCreating={false}
      />
    </div>
  );
}