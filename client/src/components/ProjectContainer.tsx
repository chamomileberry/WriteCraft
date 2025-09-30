import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { WorkspaceLayout } from './workspace/WorkspaceLayout';
import { ProjectHeader } from './ProjectHeader';
import { ProjectOutline } from './ProjectOutline';
import { SectionEditor } from './SectionEditor';
import { Loader2 } from 'lucide-react';
import type { ProjectSectionWithChildren, Project } from '@shared/schema';

interface ProjectContainerProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectContainer({ projectId, onBack }: ProjectContainerProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: ['/api/projects', projectId],
  });

  // Fetch project sections (tree structure)
  const { data: sections = [], isLoading: isLoadingSections } = useQuery<ProjectSectionWithChildren[]>({
    queryKey: ['/api/projects', projectId, 'sections'],
  });

  // Fetch active section content
  const { data: activeSection, isLoading: isLoadingSection } = useQuery({
    queryKey: ['/api/projects', projectId, 'sections', activeSectionId],
    queryFn: async () => {
      if (!activeSectionId) return null;
      const response = await apiRequest('GET', `/api/projects/${projectId}/sections/${activeSectionId}`);
      return response.json();
    },
    enabled: !!activeSectionId,
  });

  // Auto-select first page when sections load
  useEffect(() => {
    if (!activeSectionId && sections.length > 0) {
      // Find first page (not folder)
      const findFirstPage = (sectionList: ProjectSectionWithChildren[]): ProjectSectionWithChildren | null => {
        for (const section of sectionList) {
          if (section.type === 'page') {
            return section;
          }
          if (section.children && section.children.length > 0) {
            const childPage = findFirstPage(section.children);
            if (childPage) return childPage;
          }
        }
        return null;
      };
      
      const firstPage = findFirstPage(sections);
      if (firstPage) {
        setActiveSectionId(firstPage.id);
      }
    }
  }, [sections, activeSectionId]);

  // Handle section navigation
  const handleSectionClick = (section: ProjectSectionWithChildren) => {
    // Can't navigate to folders, only pages
    if (section.type === 'folder') {
      return;
    }

    // If clicking the same section, do nothing
    if (section.id === activeSectionId) {
      return;
    }

    // Navigate to new section
    setActiveSectionId(section.id);
  };

  // Title editing handlers
  const handleTitleClick = () => {
    if (project) {
      setTitleInput(project.title);
      setIsEditingTitle(true);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitleInput(value);
  };

  const updateProjectMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest('PUT', `/api/projects/${projectId}`, { title });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      toast({
        title: 'Updated',
        description: 'Project title has been updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update project title.',
        variant: 'destructive',
      });
    },
  });

  const handleTitleSave = () => {
    if (titleInput.trim() && titleInput !== project?.title) {
      updateProjectMutation.mutate(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setTitleInput('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleManualSave = () => {
    // Manual save is handled by SectionEditor auto-save
    toast({
      title: 'Saved',
      description: 'All changes have been saved.',
    });
  };

  // Loading state
  if (isLoadingProject || isLoadingSections) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="loader-project">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Determine what to show in main content area
  const showEmptyState = !activeSectionId || activeSection?.type === 'folder';
  const showEditor = activeSectionId && activeSection?.type === 'page';

  return (
    <WorkspaceLayout>
      <div className="flex h-full bg-background">
        {/* Left Sidebar - Outline */}
        <div className="w-64 border-r flex-shrink-0 overflow-hidden" data-testid="container-outline">
          <ProjectOutline
            projectId={projectId}
            sections={sections}
            activeSectionId={activeSectionId}
            onSectionClick={handleSectionClick}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <ProjectHeader
            project={project}
            breadcrumb={breadcrumb}
            onBack={onBack}
          />

          {/* Editor or Empty State */}
          {showEditor ? (
            <SectionEditor
              projectId={projectId}
              section={activeSection}
            />
          ) : showEmptyState ? (
            <div className="flex-1 flex items-center justify-center text-center p-8" data-testid="container-empty-state">
              <div>
                <h3 className="text-lg font-semibold mb-2">No page selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select a page from the outline to start writing, or create a new page.
                </p>
              </div>
            </div>
          ) : isLoadingSection ? (
            <div className="flex-1 flex items-center justify-center" data-testid="loader-section">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
