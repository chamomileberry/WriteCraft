import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCharacterSchema, type UpdateCharacter, type Character } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { contentTypeFormConfigs } from "@/components/forms/ContentTypeFormConfig";
import CharacterEditorWithSidebar from "@/components/forms/CharacterEditorWithSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CharacterEditPageWithSidebar() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch character data
  const { data: character, isLoading } = useQuery({
    queryKey: ['/api/characters', id],
    enabled: !!id,
  });

  // Update character mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCharacter) => {
      const response = await fetch(`/api/characters/${id}`, {
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
    onSuccess: () => {
      toast({
        title: "Character Updated",
        description: "Your character has been successfully updated!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/characters', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', 'null'] });
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

  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Character not found.</p>
          <Button onClick={() => setLocation('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CharacterEditorWithSidebar
      config={contentTypeFormConfigs.character}
      initialData={character}
      onSubmit={onSubmit}
      onGenerate={handleGenerate}
      isLoading={updateMutation.isPending}
      isCreating={false}
    />
  );
}