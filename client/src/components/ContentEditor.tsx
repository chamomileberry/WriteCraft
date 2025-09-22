import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Edit, ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getMappingById } from "@shared/contentTypes";
import { useLocation } from "wouter";
import LocationForm from "@/components/forms/LocationForm";
import CreatureForm from "@/components/forms/CreatureForm";

interface ContentEditorProps {
  contentType: string;
  contentId: string;
  onBack: () => void;
}

export default function ContentEditor({ contentType, contentId, onBack }: ContentEditorProps) {
  const [editingData, setEditingData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get the content type mapping
  const mapping = getMappingById(contentType);
  const apiBase = mapping?.apiBase || `/api/${contentType}`;

  // Fetch the content data
  const { data: contentData, isLoading, error } = useQuery({
    queryKey: [apiBase, contentId],
    queryFn: async () => {
      const response = await apiRequest('GET', `${apiBase}/${contentId}`);
      return response.json();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `${apiBase}/${contentId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content updated",
        description: "Your changes have been saved successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      queryClient.invalidateQueries({ queryKey: [apiBase, contentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Initialize editing data when content loads
  useEffect(() => {
    if (contentData) {
      setEditingData(contentData);
    }
  }, [contentData]);

  const handleSave = () => {
    updateMutation.mutate(editingData);
  };

  // Handle type-specific form submission
  const handleFormSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    setEditingData(contentData);
    setIsEditing(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditingData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Get field type and render appropriate input
  const renderField = (key: string, value: any) => {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
      return null; // Skip system fields
    }

    const isEditable = isEditing;
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

  if (error || !contentData) {
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

  const contentName = contentData.name || contentData.title || `${contentType} ${contentId}`;

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
              <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-editing">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={updateMutation.isPending}
                data-testid="button-save-changes"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

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
          {Object.entries(contentData).map(([key, value]) => renderField(key, value))}
        </CardContent>
      </Card>
    </div>
  );
}