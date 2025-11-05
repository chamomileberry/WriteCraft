import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type UpdateCharacter, type Character } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { characterConfig } from "@/components/forms/content-types";
import CharacterEditorWithSidebar from "@/components/forms/CharacterEditorWithSidebar";
import ArticleEditor from "@/components/ArticleEditor";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Database, FileText } from "lucide-react";
import { useNotebookStore } from "@/stores/notebookStore";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useState, useEffect } from "react";

export default function CharacterEditPageWithSidebar() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeNotebookId } = useNotebookStore();
  const { user } = useAuth();
  const { updateEditorContext, clearEditorContext } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"structured" | "article">(
    "structured",
  );

  // Extract notebookId from query parameters, fallback to active notebook
  const urlParams = new URLSearchParams(window.location.search);
  const queryNotebookId = urlParams.get("notebookId");
  const notebookId = queryNotebookId || activeNotebookId;

  // Fetch character data - include notebookId in query parameters
  const {
    data: character,
    isLoading,
    error,
  } = useQuery<Character>({
    queryKey: ["/api/characters", id, notebookId],
    queryFn: async () => {
      if (!notebookId) {
        throw new Error(
          "No active notebook selected. Please create or select a notebook first.",
        );
      }
      const response = await apiRequest(
        "GET",
        `/api/characters/${id}?notebookId=${notebookId}`,
      );
      return response.json();
    },
    enabled: !!id && !!notebookId,
  });

  // Update character mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCharacter) => {
      if (!notebookId) {
        throw new Error("No notebook ID available for update");
      }
      const response = await apiRequest(
        "PATCH",
        `/api/characters/${id}?notebookId=${notebookId}`,
        data,
      );
      return response.json();
    },
    onSuccess: async (updatedCharacter) => {
      // Automatically save character to collection when edited
      if (user?.id) {
        try {
          await apiRequest("POST", "/api/saved-items", {
            userId: user.id,
            itemType: "character",
            itemId: id,
            notebookId: notebookId,
          });
        } catch (error) {
          // Ignore error if already saved (duplicate key error is expected)
          console.log("Character may already be saved to collection");
        }
      }

      toast({
        title: "Character Updated",
        description:
          "Your character has been successfully updated and saved to your collection!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/characters", id] });
      // Invalidate saved-items with proper query key structure to refresh notebook view
      if (user?.id && notebookId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/saved-items", user.id, notebookId],
        });
      }
      // Also invalidate general saved-items queries as fallback
      queryClient.invalidateQueries({ queryKey: ["/api/saved-items"] });
    },
    onError: (error) => {
      console.error("Error updating character:", error);
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
      }),
    ) as UpdateCharacter;

    updateMutation.mutate(cleanedData);
  };

  // Generate article mutation
  const generateArticleMutation = useMutation({
    mutationFn: async () => {
      if (!notebookId) {
        throw new Error("No notebook ID available");
      }
      const response = await apiRequest(
        "POST",
        `/api/characters/${id}/generate-article?notebookId=${notebookId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to generate article");
      }
      return response.json();
    },
    onSuccess: (updatedCharacter) => {
      // Update cache with new article content
      queryClient.setQueryData(
        ["/api/characters", id, notebookId],
        updatedCharacter,
      );

      // Switch to article view to show the generated article
      setViewMode("article");

      toast({
        title: "Article Generated",
        description: "Character article has been generated successfully!",
      });
    },
    onError: (error) => {
      console.error("Error generating article:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    generateArticleMutation.mutate();
  };

  const handleNavigate = (toolId: string) => {
    if (toolId === "notebook") {
      setLocation("/notebook");
    } else if (toolId === "projects") {
      setLocation("/projects");
    } else if (toolId === "generators") {
      setLocation("/generators");
    } else if (toolId === "guides") {
      setLocation("/guides");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateNew = () => {
    setLocation("/notebook");
  };

  // Update editor context for AI Writing Assistant when character loads
  useEffect(() => {
    if (character && notebookId) {
      const characterName =
        [character.givenName, character.familyName].filter(Boolean).join(" ") ||
        "Character";
      updateEditorContext({
        type: "character",
        entityId: id,
        notebookId: notebookId,
        title: characterName,
        content: "", // Characters don't have long-form content, but we pass notebook context
        htmlContent: "",
      });
    }
    return () => {
      clearEditorContext();
    };
  }, [character, notebookId, id, updateEditorContext, clearEditorContext]);

  // Handle missing notebook gracefully
  if (!notebookId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            No active notebook selected. Please create or select a notebook
            first.
          </p>
          <Button onClick={() => setLocation("/notebook")} variant="outline">
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
          <p className="text-muted-foreground mb-4">
            {error instanceof Error
              ? error.message
              : "Failed to load character."}
          </p>
          <Button onClick={() => setLocation("/notebook")} variant="outline">
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
          <Button onClick={() => setLocation("/notebook")} variant="outline">
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
              onClick={() => setLocation("/notebook")}
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
                    {[character?.givenName, character?.familyName]
                      .filter(Boolean)
                      .join(" ") || "Untitled Character"}
                  </span>
                )}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4">
          <Tabs
            value={viewMode}
            onValueChange={(value) =>
              setViewMode(value as "structured" | "article")
            }
            className="w-full"
          >
            <TabsList className="h-10 bg-transparent border-0 rounded-none p-0">
              <TabsTrigger
                value="structured"
                data-testid="tab-structured-view"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Database className="mr-2 h-4 w-4" />
                Edit Character
              </TabsTrigger>
              <TabsTrigger
                value="article"
                disabled={!character?.articleContent}
                data-testid="tab-article-view"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <FileText className="mr-2 h-4 w-4" />
                Article View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "structured" ? (
        <CharacterEditorWithSidebar
          config={characterConfig}
          initialData={character}
          onSubmit={onSubmit}
          onGenerate={handleGenerate}
          isLoading={updateMutation.isPending}
          isCreating={false}
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <ArticleEditor
            contentType="character"
            contentId={id || ""}
            initialContent={character?.articleContent || ""}
            title="Character Article"
            onContentChange={(content) => {
              console.log(
                "Article content changed:",
                content.length,
                "characters",
              );
            }}
            onSave={(content) => {
              console.log("Article saved:", content.length, "characters");
            }}
          />
        </div>
      )}
    </div>
  );
}
