import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, Edit, Calendar, FileText, Trash2, Share2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useWorkspaceStore, type PanelDescriptor } from "@/stores/workspaceStore";
import { ProjectViewer } from "@/components/ProjectViewer";
import { ProjectContainer } from "@/components/ProjectContainer";
import Header from "@/components/Header";
import ContentTypeModal from "@/components/ContentTypeModal";
import { getMappingById } from "@shared/contentTypes";
import { ShareDialog } from "@/components/ShareDialog";
import { LimitExceededDialog } from "@/components/LimitExceededDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { CardGridSkeleton } from "@/components/skeletons";

interface Project {
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

type ViewMode = 'list' | 'view' | 'edit';

export default function ProjectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [sharingProject, setSharingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'owned' | 'shared'>('owned');
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { checkLimit, gracePeriodExpired, gracePeriodDaysRemaining } = useSubscription();

  // Header handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNavigate = (toolId: string) => {
    if (toolId === 'notebook') {
      navigate('/notebook');
    } else if (toolId === 'projects') {
      // Already on projects page
      return;
    } else {
      navigate('/');
    }
  };

  const handleCreateNew = () => {
    setIsContentModalOpen(true);
  };

  const handleSelectContentType = (contentType: string, notebookId?: string) => {
    setIsContentModalOpen(false);
    const mapping = getMappingById(contentType);
    if (mapping) {
      const url = notebookId 
        ? `/editor/${mapping.urlSegment}/new?notebookId=${notebookId}`
        : `/editor/${mapping.urlSegment}/new`;
      navigate(url);
    } else {
      navigate('/notebook');
    }
  };

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects'],
    enabled: true,
  });

  // Search projects
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['/api/projects/search', searchQuery],
    queryFn: async () => {
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(`/api/projects/search?q=${encodedQuery}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Create new project mutation
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/projects', {
        title: 'Untitled Project',
        content: '',
        status: 'draft',
        tags: []
      });
      return response.json() as Promise<Project>;
    },
    onSuccess: (newProject: Project) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      // Redirect to the editor for the new project
      navigate(`/projects/${newProject.id}/edit`);
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest('DELETE', `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    }
  });

  // Handle clicking a project card (not the edit button) - goes to view mode
  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode('view');
  };

  // Handle clicking the edit button on a project card - goes straight to edit mode
  const handleProjectEdit = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode('edit');
  };

  // Handle clicking "Edit Project" button in viewer
  const handleStartEditing = () => {
    setViewMode('edit');
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedProjectId(null);
    setViewMode('list');
  };

  // Filter projects based on active tab
  const ownedProjects = (projects as Project[]).filter((p: Project) => !(p as any).isShared);
  const sharedProjects = (projects as Project[]).filter((p: Project) => (p as any).isShared);
  const filteredByTab = activeTab === 'owned' ? ownedProjects : sharedProjects;
  
  // Apply tab filter to search results too
  const filteredSearchResults = (searchResults as Project[]).filter((p: Project) => 
    activeTab === 'owned' ? !(p as any).isShared : (p as any).isShared
  );
  
  const displayedProjects = searchQuery.trim().length > 0 ? filteredSearchResults : filteredByTab;

  const handleNewProject = async () => {
    // Check if user can create a project
    const limitCheck = await checkLimit('create_project');
    
    // Block ONLY if not allowed AND not in grace period
    if (!limitCheck.allowed && !limitCheck.inGracePeriod) {
      setShowLimitDialog(true);
      return;
    }
    
    // Show toast warning if in grace period but still allow creation
    if (limitCheck.inGracePeriod && limitCheck.gracePeriodWarning) {
      toast({
        title: "Grace Period Active",
        description: limitCheck.gracePeriodWarning,
        duration: 5000,
      });
    }
    
    createProjectMutation.mutate();
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  // Render view/edit modes
  if (viewMode === 'view' && selectedProjectId) {
    return (
      <div className="h-screen">
        <ProjectViewer
          projectId={selectedProjectId}
          onBack={handleBack}
          onEdit={handleStartEditing}
        />
      </div>
    );
  }

  if (viewMode === 'edit' && selectedProjectId) {
    return (
      <div className="h-screen">
        <ProjectContainer
          projectId={selectedProjectId}
          onBack={handleBack}
        />
      </div>
    );
  }

  // Default list view
  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        onCreateNew={handleCreateNew}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-projects-title">Projects</h1>
              <p className="text-muted-foreground mt-2">Your creative writing projects and stories</p>
            </div>
            <Button 
              onClick={handleNewProject} 
              disabled={createProjectMutation.isPending}
              data-testid="button-new-project"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createProjectMutation.isPending ? 'Creating...' : 'New Project'}
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={activeTab === 'owned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('owned')}
              data-testid="button-tab-owned-projects"
            >
              My Projects ({ownedProjects.length})
            </Button>
            <Button
              variant={activeTab === 'shared' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('shared')}
              data-testid="button-tab-shared-projects"
            >
              Shared with Me ({sharedProjects.length})
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-projects"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : displayedProjects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery.trim().length > 0 
                ? 'No projects found' 
                : activeTab === 'owned' ? 'No projects yet' : 'No shared projects'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery.trim().length > 0 
                ? 'Try a different search term or create a new project'
                : activeTab === 'owned' 
                  ? 'Create your first project to start writing'
                  : 'No projects have been shared with you yet'
              }
            </p>
            {searchQuery.trim().length === 0 && activeTab === 'owned' && (
              <Button onClick={handleNewProject} data-testid="button-create-first-project">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProjects.map((project: Project) => (
              <Card 
                key={project.id} 
                className="hover-elevate cursor-pointer transition-colors group"
                onClick={() => handleProjectClick(project.id)}
                data-testid={`card-project-${project.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors flex-1">
                          {project.title}
                        </CardTitle>
                        <div className="flex gap-1 shrink-0">
                          {(project as any).isShared && (
                            <Badge variant="secondary" data-testid={`badge-shared-project-${project.id}`} className="text-xs">
                              Shared
                            </Badge>
                          )}
                          {(project as any).isShared && (project as any).sharePermission === 'view' && (
                            <Badge variant="outline" data-testid={`badge-readonly-project-${project.id}`} className="text-xs">
                              Read-Only
                            </Badge>
                          )}
                        </div>
                      </div>
                      {(project as any).isShared && (project as any).sharedBy && (
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <span>Shared by {(project as any).sharedBy.firstName || (project as any).sharedBy.email}</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {(project as any).sharePermission}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Share button only for owned projects */}
                      {!(project as any).isShared && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setSharingProject(project);
                          }}
                          data-testid={`button-share-project-${project.id}`}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Edit/Delete buttons only for owned projects or edit permission */}
                      {(!(project as any).isShared || (project as any).sharePermission === 'edit') && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleProjectEdit(project.id);
                            }}
                            data-testid={`button-edit-project-${project.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* Delete button only for owned projects */}
                          {!(project as any).isShared && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteProject(e, project.id)}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              data-testid={`button-delete-project-${project.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span data-testid={`text-wordcount-${project.id}`}>{project.wordCount} words</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-3" data-testid={`text-excerpt-${project.id}`}>
                      {project.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(project.status)}
                        data-testid={`badge-status-${project.id}`}
                      >
                        {project.status}
                      </Badge>
                      {project.tags && project.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs" data-testid={`badge-tag-${project.id}-${index}`}>
                          {tag}
                        </Badge>
                      ))}
                      {project.tags && project.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <ContentTypeModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSelectType={handleSelectContentType}
      />
      
      {/* Share Dialog */}
      {sharingProject && (
        <ShareDialog
          open={!!sharingProject}
          onOpenChange={(open) => !open && setSharingProject(null)}
          resourceType="project"
          resourceId={sharingProject.id}
          resourceName={sharingProject.title}
          ownerId={sharingProject.userId}
        />
      )}
      
      {/* Limit Exceeded Dialog */}
      <LimitExceededDialog
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
        limitType="projects"
        gracePeriodExpired={gracePeriodExpired}
        daysRemaining={gracePeriodDaysRemaining}
      />
    </div>
  );
}