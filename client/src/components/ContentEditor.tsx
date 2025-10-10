import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, Edit, ArrowLeft, FileText, Database, Wand2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useNotebookStore } from "@/stores/notebookStore";
import { getMappingById } from "@shared/contentTypes";
import DynamicContentForm from "@/components/forms/DynamicContentForm";
import CharacterEditorWithSidebar from "@/components/forms/CharacterEditorWithSidebar";
import ArticleEditor from "@/components/ArticleEditor";
import { FamilyTreeEditor } from "@/components/FamilyTreeEditor";
import { getContentTypeConfig } from "@/configs/content-types";
import type { ContentTypeFormConfig } from "@/components/forms/types";

interface ContentEditorProps {
  contentType: string;
  contentId: string;
  onBack: () => void;
}

export default function ContentEditor({ contentType, contentId, onBack }: ContentEditorProps) {
  const [isEditing, setIsEditing] = useState(contentId === 'new'); // Start editing if creating new content
  const [viewMode, setViewMode] = useState<'structured' | 'article'>('structured'); // Mode switching
  const [formConfig, setFormConfig] = useState<ContentTypeFormConfig | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { activeNotebookId } = useNotebookStore();

  // Auto-create family trees and timelines when creating new ones to bypass the form
  useEffect(() => {
    async function autoCreateContent() {
      // Handle family tree auto-creation
      if ((contentType === 'familyTree' || contentType === 'familytree') && contentId === 'new') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlNotebookId = urlParams.get('notebookId');
        const notebookId = urlNotebookId || activeNotebookId;
        
        if (!notebookId) {
          toast({
            title: "No Notebook Selected",
            description: "Please select a notebook before creating a family tree.",
            variant: "destructive"
          });
          onBack();
          return;
        }
        
        try {
          const response = await apiRequest('POST', '/api/family-trees', {
            name: 'Untitled Family Tree',
            description: '',
            notebookId
          });
          
          const result = await response.json();
          
          if (result?.id) {
            // Navigate to the newly created tree editor using correct URL segment
            const mapping = getMappingById('familyTree');
            const urlSegment = mapping?.urlSegment || 'family-trees';
            setLocation(`/editor/${urlSegment}/${result.id}?notebookId=${notebookId}`);
          }
        } catch (error) {
          console.error('Error creating family tree:', error);
          toast({
            title: "Error",
            description: "Failed to create family tree. Please try again.",
            variant: "destructive"
          });
          onBack();
        }
      }
      
      // Handle timeline auto-creation and redirect to canvas view
      if (contentType === 'timeline' && contentId === 'new') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlNotebookId = urlParams.get('notebookId');
        const notebookId = urlNotebookId || activeNotebookId;
        
        if (!notebookId) {
          toast({
            title: "No Notebook Selected",
            description: "Please select a notebook before creating a timeline.",
            variant: "destructive"
          });
          onBack();
          return;
        }
        
        try {
          const timestamp = new Date().toLocaleDateString();
          const response = await apiRequest('POST', '/api/timelines', {
            name: `New Timeline ${timestamp}`,
            description: 'A timeline for tracking events',
            timelineType: 'Character',
            timeScale: 'Years',
            notebookId
          });
          
          const result = await response.json();
          
          if (result?.id) {
            // Navigate directly to canvas view
            setLocation(`/timelines/${result.id}?notebookId=${notebookId}`);
            toast({
              title: "Timeline Created",
              description: "Your timeline is ready. Start adding events!",
            });
          }
        } catch (error) {
          console.error('Error creating timeline:', error);
          toast({
            title: "Error",
            description: "Failed to create timeline. Please try again.",
            variant: "destructive"
          });
          onBack();
        }
      }
    }
    
    autoCreateContent();
  }, [contentType, contentId, activeNotebookId, toast, onBack, setLocation]);

  // Load content type configuration
  useEffect(() => {
    async function loadConfig() {
      const config = await getContentTypeConfig(contentType);
      setFormConfig(config);
    }
    loadConfig();
  }, [contentType]);
  
  // Get the content type mapping
  const mapping = getMappingById(contentType);
  const apiBase = mapping?.apiBase || `/api/${contentType}`;
  const isCreating = contentId === 'new';
  const currentItemId = contentId;

  // Fetch the content data (only if not creating new content)
  const { data: contentData, isLoading, error } = useQuery({
    queryKey: [apiBase, currentItemId, activeNotebookId],
    queryFn: async () => {
      if (isCreating) return null; // Don't fetch for new content
      
      // Get notebookId from URL query parameters, fallback to active notebook
      const urlParams = new URLSearchParams(window.location.search);
      const urlNotebookId = urlParams.get('notebookId');
      const notebookId = urlNotebookId || activeNotebookId;
      
      if (!notebookId) {
        throw new Error('No notebook selected. Cannot fetch content.');
      }
      
      const response = await apiRequest('GET', `${apiBase}/${currentItemId}?notebookId=${notebookId}`);
      return response.json();
    },
    enabled: !isCreating && !!activeNotebookId, // Only run query if not creating new content and notebook is selected
  });

  // Debug logging (after contentData is declared)
  console.log('ContentEditor Debug:', {
    contentType,
    contentId,
    isCreating,
    hasContentData: !!contentData,
    isLoading,
    error: !!error
  });

  // Generate article from structured data mutation
  const generateArticleMutation = useMutation({
    mutationFn: async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlNotebookId = urlParams.get('notebookId');
      const notebookId = urlNotebookId || activeNotebookId;
      
      if (!notebookId) {
        throw new Error('No notebook selected. Cannot generate article.');
      }
      
      const response = await apiRequest('POST', `${apiBase}/${currentItemId}/generate-article?notebookId=${notebookId}`);
      return response.json();
    },
    onSuccess: (updatedContent) => {
      // Optimistically update the cache with new articleContent immediately
      queryClient.setQueryData([apiBase, currentItemId, activeNotebookId], updatedContent);
      
      // Now switch to article mode - the tab will be enabled because articleContent exists
      setViewMode('article');
      
      toast({
        title: 'Article generated',
        description: 'Article has been generated from your structured data.',
      });
    },
    onError: (error: any) => {
      console.error('Error generating article:', error);
      toast({
        title: 'Error generating article',
        description: 'Failed to generate article. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Compute isCreating dynamically within the mutation
      const isMutationCreating = contentId === 'new';
      console.log('Save mutation starting:', { isMutationCreating, apiBase, data });
      
      if (isMutationCreating) {
        // Create new content - get notebookId from URL or active notebook
        const urlParams = new URLSearchParams(window.location.search);
        const urlNotebookId = urlParams.get('notebookId');
        const notebookId = urlNotebookId || activeNotebookId;
        
        if (!notebookId) {
          throw new Error('No notebook selected. Cannot create content.');
        }
        
        // Include notebookId in the request payload
        const createData = { ...data, notebookId };
        
        console.log('Making POST request to:', apiBase, 'with data:', createData);
        const response = await apiRequest('POST', apiBase, createData);
        console.log('POST response status:', response.status, 'ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('POST response parsed:', result);
        return result;
      } else {
        // Update existing content - get notebookId from URL or active notebook
        const urlParams = new URLSearchParams(window.location.search);
        const urlNotebookId = urlParams.get('notebookId');
        const notebookId = urlNotebookId || activeNotebookId;
        
        if (!notebookId) {
          throw new Error('No notebook selected. Cannot update content.');
        }
        
        console.log('Making PATCH request to:', `${apiBase}/${currentItemId}`, 'with data:', data, 'notebookId:', notebookId);
        const response = await apiRequest('PATCH', `${apiBase}/${currentItemId}?notebookId=${notebookId}`, data);
        console.log('PATCH response status:', response.status, 'ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('PUT response parsed:', result);
        return result;
      }
    },
    onSuccess: async (result) => {
      // Compute isCreating dynamically within the success handler
      const wasCreating = contentId === 'new';
      
      toast({
        title: wasCreating ? "Content created" : "Content updated",
        description: wasCreating ? "Your new content has been created successfully." : "Your changes have been saved successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      // Invalidate all saved-items queries for this user (covers all notebooks)
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', 'demo-user'], exact: false });
      
      if (wasCreating && result?.id) {
        // Get notebookId from URL query parameters, fallback to active notebook
        const urlParams = new URLSearchParams(window.location.search);
        const urlNotebookId = urlParams.get('notebookId');
        const notebookId = urlNotebookId || activeNotebookId;
        
        if (!notebookId) {
          toast({
            title: "Warning",
            description: "Content created but could not be saved to collection. Please select a notebook.",
            variant: "destructive"
          });
          setLocation('/notebook');
          return;
        }
        
        // Automatically save the newly created item to saved-items
        try {
          const saveResponse = await apiRequest('POST', '/api/saved-items', {
            userId: 'demo-user', // Use demo-user for consistency with authentication
            itemType: contentType,
            itemId: result.id,
            itemData: result, // Include the complete data from the successful creation
            notebookId: notebookId // Include notebookId from URL or active notebook
          });
          
          if (saveResponse.ok) {
            console.log('Successfully saved item to saved-items:', { contentType, itemId: result.id, notebookId });
          } else if (saveResponse.status === 409) {
            // Item already exists in this notebook (duplicate), which is fine
            console.log('Item already exists in saved-items (409), skipping:', { contentType, itemId: result.id });
          } else {
            throw new Error(`Failed to save item: ${saveResponse.status}`);
          }
        } catch (error) {
          console.error('Failed to save item to saved-items:', error);
          // Don't show error to user as the main content was created successfully
        }
        
        // Navigate back to notebook to see the saved item
        setLocation('/notebook');
      } else if (!wasCreating && result?.id) {
        // Update existing item - also update the saved-items itemData
        try {
          // Get notebookId from URL query parameters, fallback to active notebook
          const urlParams = new URLSearchParams(window.location.search);
          const urlNotebookId = urlParams.get('notebookId');
          const notebookId = urlNotebookId || activeNotebookId;
          
          if (notebookId) {
            // Update the saved-items record with the latest data
            const savedItemsResponse = await apiRequest('GET', `/api/saved-items/demo-user?notebookId=${notebookId}`);
            const savedItems = await savedItemsResponse.json();
            
            // Find the saved item that matches this content
            const savedItem = savedItems.find((item: any) => item.itemId === result.id && item.itemType === contentType);
            
            if (savedItem) {
              // Update the itemData with the latest content
              await apiRequest('PATCH', `/api/saved-items/${savedItem.id}`, {
                itemData: result
              });
              console.log('Successfully updated saved-items itemData:', { savedItemId: savedItem.id, itemId: result.id });
              
              // Invalidate saved-items cache so the notebook view shows updated data
              queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
            }
          }
        } catch (error) {
          console.error('Failed to update saved-items itemData:', error);
          // Don't show error to user as the main content was updated successfully
        }
        
        queryClient.invalidateQueries({ queryKey: [apiBase, currentItemId] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: isCreating ? "Failed to create content. Please try again." : "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  });



  // Handle dynamic form submission
  const handleFormSubmit = (data: any) => {
    // Get notebookId from URL query parameters, fallback to active notebook if creating new content
    const urlParams = new URLSearchParams(window.location.search);
    const urlNotebookId = urlParams.get('notebookId');
    const notebookId = urlNotebookId || activeNotebookId;
    
    // Block creation if no notebook is selected
    if (isCreating && !notebookId) {
      toast({
        title: "No Notebook Selected",
        description: "Please create or select a notebook before creating new content.",
        variant: "destructive"
      });
      return;
    }
    
    // Include notebookId in the data if we're creating new content
    const submitData = isCreating && notebookId 
      ? { ...data, notebookId } 
      : data;
    
    console.log('ContentEditor - handleFormSubmit:', { isCreating, notebookId, originalData: data, submitData });
    saveMutation.mutate(submitData);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Render field for generic fallback form (display-only)
  const renderField = (key: string, value: any) => {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
      return null; // Skip system fields
    }

    const displayValue = Array.isArray(value) ? value.join(', ') : value?.toString() || '';

    if (key.includes('description') || key.includes('backstory') || key.includes('content')) {
      // Long text fields
      return (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </label>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {displayValue}
          </p>
        </div>
      );
    } else if (Array.isArray(value)) {
      // Array fields
      return (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </label>
          <div className="flex flex-wrap gap-1">
            {value.map((item: any, index: number) => (
              <Badge key={index} variant="secondary">{item}</Badge>
            ))}
          </div>
        </div>
      );
    } else {
      // Regular text fields
      return (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </label>
          <p className="text-sm text-muted-foreground">
            {displayValue}
          </p>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || (!contentData && !isCreating)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load content. Please try again.</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const contentName = isCreating ? `New ${contentType}` : (contentData?.name || contentData?.title || `${contentType} ${contentId}`);

  // Render family tree fullscreen without header
  if (contentType === 'familyTree' || contentType === 'familytree') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlNotebookId = urlParams.get('notebookId');
    const notebookId = urlNotebookId || activeNotebookId || '';
    
    // Show loading state while creating new tree
    if (contentId === 'new') {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Creating family tree...</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full h-screen" key={contentId}>
        <FamilyTreeEditor
          treeId={contentId}
          notebookId={notebookId}
          onBack={onBack}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} data-testid="button-back-to-notebook">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notebook
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold">
              {isEditing ? 'Edit' : 'View'} {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </h1>
            <p className="text-muted-foreground">{contentName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && !isCreating ? (
            <>
              <Button 
                onClick={() => setIsEditing(true)} 
                disabled={!formConfig}
                data-testid="button-start-editing"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              {/* Generate Article button - only show if we don't have article content yet */}
              {viewMode === 'structured' && !contentData?.articleContent && (
                <Button 
                  onClick={() => generateArticleMutation.mutate()}
                  disabled={generateArticleMutation.isPending}
                  variant="outline"
                  data-testid="button-generate-article"
                >
                  {generateArticleMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Article
                </Button>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>

      {/* Mode Switching Tabs - only show when not editing and not creating */}
      {!isEditing && !isCreating && (
        <div className="mb-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'structured' | 'article')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="structured" data-testid="tab-structured-view">
                <Database className="mr-2 h-4 w-4" />
                Structured Data
              </TabsTrigger>
              <TabsTrigger value="article" disabled={!contentData?.articleContent} data-testid="tab-article-view">
                <FileText className="mr-2 h-4 w-4" />
                Article View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Content Rendering - Mode-based */}
      {(() => {
        // Article Mode - show ArticleEditor
        if (viewMode === 'article' && !isEditing && !isCreating) {
          return (
            <ArticleEditor
              contentType={contentType}
              contentId={contentId}
              initialContent={contentData?.articleContent || ''}
              title={`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Article`}
              onContentChange={(content) => {
                // Handle content changes if needed
                console.log('Article content changed:', content.length, 'characters');
              }}
              onSave={(content) => {
                // Handle save completion if needed
                console.log('Article saved:', content.length, 'characters');
              }}
            />
          );
        }
        
        // Structured Mode - existing form logic
        if (formConfig && (isEditing || isCreating)) {
          // Use character sidebar editor for characters specifically
          if (contentType === 'character') {
            return (
              <CharacterEditorWithSidebar
                config={formConfig}
                initialData={contentData}
                onSubmit={handleFormSubmit}
                isLoading={saveMutation.isPending}
                isCreating={isCreating}
              />
            );
          }
          
          // Use dynamic comprehensive form for other content types (hides header save button)
          return (
            <DynamicContentForm
              config={formConfig}
              initialData={contentData}
              onSubmit={handleFormSubmit}
              isLoading={saveMutation.isPending}
              isCreating={isCreating}
            />
          );
        } else {
          // Fallback to generic form (for non-configured types) or structured view mode
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-primary" />
                  Content Details
                </CardTitle>
                <CardDescription>
                  View the details of this content item. {!formConfig && 'This content type is read-only.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(contentData || {}).map(([key, value]) => renderField(key, value))}
              </CardContent>
            </Card>
          );
        }
      })()}
    </div>
  );
}