import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, Edit, ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useNotebookStore } from "@/stores/notebookStore";
import { getMappingById } from "@shared/contentTypes";
import DynamicContentForm from "@/components/forms/DynamicContentForm";
import CharacterEditorWithSidebar from "@/components/forms/CharacterEditorWithSidebar";
import { getContentTypeConfig } from "@/configs/content-types";
import type { ContentTypeFormConfig } from "@/components/forms/types";

interface ContentEditorProps {
  contentType: string;
  contentId: string;
  onBack: () => void;
}

export default function ContentEditor({ contentType, contentId, onBack }: ContentEditorProps) {
  const [editingData, setEditingData] = useState<any>({}); // For generic fallback form only
  const [isEditing, setIsEditing] = useState(contentId === 'new'); // Start editing if creating new content
  const [formConfig, setFormConfig] = useState<ContentTypeFormConfig | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { activeNotebookId } = useNotebookStore();

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
        
        console.log('Making PUT request to:', `${apiBase}/${currentItemId}`, 'with data:', data, 'notebookId:', notebookId);
        const response = await apiRequest('PUT', `${apiBase}/${currentItemId}?notebookId=${notebookId}`, data);
        console.log('PUT response status:', response.status, 'ok:', response.ok);
        
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
          await apiRequest('POST', '/api/saved-items', {
            userId: 'demo-user', // Use demo-user for consistency with authentication
            itemType: contentType,
            itemId: result.id,
            itemData: result, // Include the complete data from the successful creation
            notebookId: notebookId // Include notebookId from URL or active notebook
          });
          console.log('Successfully saved item to saved-items:', { contentType, itemId: result.id, notebookId });
        } catch (error) {
          console.error('Failed to save item to saved-items:', error);
          // Don't show error to user as the main content was created successfully
        }
        
        // Navigate back to notebook to see the saved item
        setLocation('/notebook');
      } else {
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

  // Initialize editing data when content loads (for generic fallback form only)
  useEffect(() => {
    if (contentData) {
      setEditingData(contentData);
    }
  }, [contentData]);

  // Handle generic fallback form submission
  const handleSave = () => {
    saveMutation.mutate(editingData);
  };

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
    if (!formConfig) {
      // Reset fallback form data
      setEditingData(contentData);
    }
    setIsEditing(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditingData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Render field for generic fallback form (editable when no formConfig and in editing mode)
  const renderField = (key: string, value: any) => {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
      return null; // Skip system fields
    }

    const isEditable = isEditing && !formConfig; // Only editable in generic fallback form
    const displayValue = Array.isArray(value) ? value.join(', ') : value?.toString() || '';

    if (key.includes('description') || key.includes('backstory') || key.includes('content')) {
      // Long text fields
      return (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </label>
          {isEditable ? (
            <Textarea
              value={editingData[key] || ''}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              className="min-h-[100px]"
              data-testid={`input-edit-${key}`}
            />
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {displayValue}
            </p>
          )}
        </div>
      );
    } else if (Array.isArray(value)) {
      // Array fields
      return (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </label>
          {isEditable ? (
            <Input
              value={Array.isArray(editingData[key]) ? editingData[key].join(', ') : editingData[key] || ''}
              onChange={(e) => handleFieldChange(key, e.target.value.split(',').map((s: string) => s.trim()))}
              placeholder="Separate items with commas"
              data-testid={`input-edit-${key}`}
            />
          ) : (
            <div className="flex flex-wrap gap-1">
              {value.map((item: any, index: number) => (
                <Badge key={index} variant="secondary">{item}</Badge>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Regular text fields
      return (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </label>
          {isEditable ? (
            <Input
              value={editingData[key] || ''}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              data-testid={`input-edit-${key}`}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {displayValue}
            </p>
          )}
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
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} data-testid="button-start-editing">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              {/* Only show header save buttons for generic fallback forms, not dynamic forms */}
              {!formConfig && (
                <>
                  <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-editing">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saveMutation.isPending}
                    data-testid="button-save-changes"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isCreating ? 'Create' : 'Save Changes'}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dynamic Form System or Generic Fallback */}
      {(() => {
        
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
          // Fallback to generic form (for non-configured types)
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-primary" />
                  Content Details
                </CardTitle>
                <CardDescription>
                  {isEditing ? 'Edit the fields below to update this content.' : 'View the details of this content item.'}
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