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

export default function ProjectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

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

  const { addPanel } = useWorkspaceStore();

  const openProjectInWorkspace = (project: Project) => {
    const panelDescriptor: PanelDescriptor = {
      id: `project-${project.id}`,
      type: 'project',
      title: project.title,
      subtitle: `${project.status} • ${project.wordCount} words`,
      icon: 'FileText',
      data: project,
      regionId: 'main'
    };
    
    addPanel(panelDescriptor);
    navigate('/');
  };

  const displayedProjects = searchQuery.trim().length > 0 ? searchResults : projects;

  const handleNewProject = () => {
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

  return (
    <div className="min-h-screen bg-background">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayedProjects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery.trim().length > 0 ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery.trim().length > 0 
                ? 'Try a different search term or create a new project'
                : 'Create your first project to start writing'
              }
            </p>
            {searchQuery.trim().length === 0 && (
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
                onClick={() => openProjectInWorkspace(project)}
                data-testid={`card-project-${project.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        data-testid={`button-edit-project-${project.id}`}
                      >
                        <Link href={`/projects/${project.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        data-testid={`button-delete-project-${project.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
    </div>
  );
}