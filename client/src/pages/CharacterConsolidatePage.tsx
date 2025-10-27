import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useNotebookStore } from "@/stores/notebookStore";
import { useAuth } from "@/hooks/useAuth";
import { type Character } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, AlertCircle, User, FileText, Image as ImageIcon, Trash2, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IssuesData {
  missingFamilyName: Character[];
  missingDescription: Character[];
  missingImage: Character[];
  stats: {
    missingFamilyNameCount: number;
    missingDescriptionCount: number;
    missingImageCount: number;
    totalIssues: number;
  };
}

interface DuplicatesData {
  duplicateGroups: Character[][];
  stats: {
    totalGroups: number;
    totalCharacters: number;
  };
}

type IssueType = 'familyName' | 'description' | 'imageUrl';

export default function CharacterConsolidatePage() {
  const [, setLocation] = useLocation();
  const { activeNotebookId } = useNotebookStore();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Fix Modal state
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [issueType, setIssueType] = useState<IssueType | null>(null);
  const [fixValue, setFixValue] = useState('');
  
  // Delete All confirmation state
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  // Fetch issues
  const { data: issuesData, isLoading: issuesLoading } = useQuery<IssuesData>({
    queryKey: [`/api/admin/characters/issues?notebookId=${activeNotebookId}`, activeNotebookId],
    enabled: !!activeNotebookId && !!user && !authLoading,
  });

  // Fetch duplicates
  const { data: duplicatesData, isLoading: duplicatesLoading } = useQuery<DuplicatesData>({
    queryKey: [`/api/admin/characters/duplicates?notebookId=${activeNotebookId}`, activeNotebookId],
    enabled: !!activeNotebookId && !!user && !authLoading,
  });

  // Update character mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Character> }) => {
      const response = await apiRequest(`/api/characters/${id}?notebookId=${activeNotebookId}`, 'PATCH', updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Character Updated",
        description: "The character has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/characters/issues?notebookId=${activeNotebookId}`, activeNotebookId] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/characters/duplicates?notebookId=${activeNotebookId}`, activeNotebookId] });
      queryClient.invalidateQueries({ queryKey: ['/api/characters', activeNotebookId] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', user?.id, activeNotebookId] });
      setSelectedCharacter(null);
      setFixValue('');
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update character. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete character mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/characters/${id}?notebookId=${activeNotebookId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Character Deleted",
        description: "The character has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/characters/duplicates?notebookId=${activeNotebookId}`, activeNotebookId] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/characters/issues?notebookId=${activeNotebookId}`, activeNotebookId] });
      queryClient.invalidateQueries({ queryKey: ['/api/characters', activeNotebookId] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', user?.id, activeNotebookId] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete character. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete all characters with issues mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/admin/characters/bulk-delete-issues?notebookId=${activeNotebookId}`, 'DELETE');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Characters Deleted",
        description: `Successfully deleted ${data.deletedCount} character${data.deletedCount !== 1 ? 's' : ''} with data issues.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/characters/issues?notebookId=${activeNotebookId}`, activeNotebookId] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/characters/duplicates?notebookId=${activeNotebookId}`, activeNotebookId] });
      queryClient.invalidateQueries({ queryKey: ['/api/characters', activeNotebookId] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', user?.id, activeNotebookId] });
      setShowDeleteAllDialog(false);
    },
    onError: () => {
      toast({
        title: "Bulk Delete Failed",
        description: "Failed to delete characters. Please try again.",
        variant: "destructive",
      });
      setShowDeleteAllDialog(false);
    },
  });

  const handleQuickFix = (character: Character, type: IssueType) => {
    setSelectedCharacter(character);
    setIssueType(type);
    
    const initialValue = 
      type === 'familyName' ? (character.familyName || '') :
      type === 'description' ? (character.description || '') :
      type === 'imageUrl' ? (character.imageUrl || '') :
      '';
    
    setFixValue(initialValue);
  };

  const handleSaveFix = () => {
    if (!selectedCharacter || !issueType || !fixValue.trim()) return;

    const updates: Partial<Character> = {
      [issueType]: fixValue.trim()
    };

    updateMutation.mutate({ id: selectedCharacter.id, updates });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
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

  const CharacterCard = ({ character, issueType }: { character: Character; issueType?: IssueType }) => (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={character.imageUrl || undefined} />
            <AvatarFallback>
              {character.givenName?.[0] || character.familyName?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {character.givenName || 'Unnamed'} {character.familyName || ''}
            </h3>
            {character.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {character.description}
              </p>
            )}
          </div>
          {issueType && (
            <Button
              size="sm"
              onClick={() => handleQuickFix(character, issueType)}
              data-testid={`button-quick-fix-${character.id}`}
            >
              <Check className="h-4 w-4 mr-1" />
              Quick Fix
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!activeNotebookId) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onSearch={(q) => setSearchQuery(q)}
          searchQuery={searchQuery}
          onNavigate={handleNavigate}
          onCreateNew={() => {}}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a notebook first to view character consolidation options.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={(q) => setSearchQuery(q)}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        onCreateNew={() => {}}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/notebook')}
          className="mb-6"
          data-testid="button-back-to-notebook"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notebook
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Character Data Consolidation</h1>
          <p className="text-muted-foreground">
            Fix incomplete character data and identify potential duplicates
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Missing Family Names</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-missing-family-name">
                {issuesData?.stats.missingFamilyNameCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">characters need family names</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Missing Descriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-missing-description">
                {issuesData?.stats.missingDescriptionCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">characters need descriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Potential Duplicates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-duplicate-groups">
                {duplicatesData?.stats.totalGroups || 0}
              </div>
              <p className="text-xs text-muted-foreground">duplicate groups found</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="issues" data-testid="tab-issues">
              Data Issues
              {issuesData && issuesData.stats.totalIssues > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {issuesData.stats.totalIssues}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="duplicates" data-testid="tab-duplicates">
              Potential Duplicates
              {duplicatesData && duplicatesData.stats.totalGroups > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {duplicatesData.stats.totalGroups}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="mt-6 space-y-6">
            {issuesLoading ? (
              <div>Loading issues...</div>
            ) : (
              <>
                {/* Delete All Button */}
                {issuesData && issuesData.stats.totalIssues > 0 && (
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteAllDialog(true)}
                      disabled={bulkDeleteMutation.isPending}
                      data-testid="button-delete-all-issues"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All ({issuesData.stats.totalIssues})
                    </Button>
                  </div>
                )}

                {/* Missing Family Names */}
                {issuesData && issuesData.missingFamilyName.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-xl font-semibold">Missing Family Names</h2>
                      <Badge>{issuesData.missingFamilyName.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {issuesData.missingFamilyName.map((character) => (
                        <CharacterCard 
                          key={character.id} 
                          character={character} 
                          issueType="familyName"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Descriptions */}
                {issuesData && issuesData.missingDescription.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-xl font-semibold">Missing Descriptions</h2>
                      <Badge>{issuesData.missingDescription.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {issuesData.missingDescription.map((character) => (
                        <CharacterCard 
                          key={character.id} 
                          character={character} 
                          issueType="description"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Images */}
                {issuesData && issuesData.missingImage.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-xl font-semibold">Missing Images</h2>
                      <Badge>{issuesData.missingImage.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {issuesData.missingImage.map((character) => (
                        <CharacterCard 
                          key={character.id} 
                          character={character} 
                          issueType="imageUrl"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {issuesData && issuesData.stats.totalIssues === 0 && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      No data issues found! All characters have complete information.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="duplicates" className="mt-6 space-y-6">
            {duplicatesLoading ? (
              <div>Loading duplicates...</div>
            ) : (
              <>
                {duplicatesData && duplicatesData.duplicateGroups.length > 0 ? (
                  duplicatesData.duplicateGroups.map((group, groupIndex) => (
                    <Card key={groupIndex}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Potential Duplicates: "{group[0]?.givenName}"
                          <Badge variant="secondary">{group.length} characters</Badge>
                        </CardTitle>
                        <CardDescription>
                          These characters have the same given name. Review and delete duplicates if needed.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {group.map((character) => (
                          <Card key={character.id} className="hover-elevate">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={character.imageUrl || undefined} />
                                  <AvatarFallback>
                                    {character.givenName?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold">
                                    {character.givenName || 'Unnamed'} {character.familyName || ''}
                                  </h3>
                                  {character.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                      {character.description}
                                    </p>
                                  )}
                                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                                    {character.importSource && (
                                      <Badge variant="outline" className="text-xs">
                                        Source: {character.importSource}
                                      </Badge>
                                    )}
                                    <span>Created: {new Date(character.createdAt || '').toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setLocation(`/editor/character/${character.id}?notebookId=${activeNotebookId}`)}
                                    data-testid={`button-view-${character.id}`}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(character.id)}
                                    data-testid={`button-delete-${character.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      No potential duplicates found! All character names are unique.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Fix Dialog */}
      <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
        <DialogContent data-testid="dialog-quick-fix">
          <DialogHeader>
            <DialogTitle>Quick Fix - {selectedCharacter?.givenName || 'Character'}</DialogTitle>
            <DialogDescription>
              {issueType === 'familyName' && 'Add a family name for this character'}
              {issueType === 'description' && 'Add a description for this character'}
              {issueType === 'imageUrl' && 'Add an image URL for this character'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fix-value">
                {issueType === 'familyName' && 'Family Name'}
                {issueType === 'description' && 'Description'}
                {issueType === 'imageUrl' && 'Image URL'}
              </Label>
              {issueType === 'description' ? (
                <Textarea
                  id="fix-value"
                  value={fixValue}
                  onChange={(e) => setFixValue(e.target.value)}
                  placeholder="Enter character description..."
                  rows={4}
                  data-testid="input-fix-value"
                />
              ) : (
                <Input
                  id="fix-value"
                  value={fixValue}
                  onChange={(e) => setFixValue(e.target.value)}
                  placeholder={
                    issueType === 'familyName' ? 'Enter family name...' : 
                    issueType === 'imageUrl' ? 'Enter image URL...' : ''
                  }
                  data-testid="input-fix-value"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedCharacter(null)}
              data-testid="button-cancel-fix"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFix}
              disabled={!fixValue.trim() || updateMutation.isPending}
              data-testid="button-save-fix"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent data-testid="dialog-delete-all-confirmation">
          <DialogHeader>
            <DialogTitle>Delete All Characters with Issues?</DialogTitle>
            <DialogDescription>
              This will permanently delete all {issuesData?.stats.totalIssues || 0} character{issuesData?.stats.totalIssues !== 1 ? 's' : ''} that have missing family names, descriptions, or images.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This will delete:
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  {issuesData && issuesData.stats.missingFamilyNameCount > 0 && (
                    <li>{issuesData.stats.missingFamilyNameCount} character{issuesData.stats.missingFamilyNameCount !== 1 ? 's' : ''} with missing family names</li>
                  )}
                  {issuesData && issuesData.stats.missingDescriptionCount > 0 && (
                    <li>{issuesData.stats.missingDescriptionCount} character{issuesData.stats.missingDescriptionCount !== 1 ? 's' : ''} with missing descriptions</li>
                  )}
                  {issuesData && issuesData.stats.missingImageCount > 0 && (
                    <li>{issuesData.stats.missingImageCount} character{issuesData.stats.missingImageCount !== 1 ? 's' : ''} with missing images</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteAllDialog(false)}
              disabled={bulkDeleteMutation.isPending}
              data-testid="button-cancel-delete-all"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => bulkDeleteMutation.mutate()}
              disabled={bulkDeleteMutation.isPending}
              data-testid="button-confirm-delete-all"
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
