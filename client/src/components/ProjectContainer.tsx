import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { WorkspaceLayout } from './workspace/WorkspaceLayout';
import { ProjectHeader } from './ProjectHeader';
import { ProjectOutline } from './ProjectOutline';
import { SectionEditor } from './SectionEditor';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, BookOpen, Moon, Sun } from 'lucide-react';
import type { ProjectSectionWithChildren } from '@shared/schema';

interface ProjectContainerProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectContainer({ projectId, onBack }: ProjectContainerProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  
  // Theme toggle state - must be at top level before any conditional returns
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme === 'dark' || (!savedTheme && systemDark);
    }
    return false;
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sectionEditorRef = useRef<{ saveContent: () => Promise<void> } | null>(null);
  const { addPanel, isPanelOpen, focusPanel } = useWorkspaceStore();

  // Project rename mutation
  const renameProjectMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      await apiRequest('PUT', `/api/projects/${projectId}`, { title: newTitle });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      toast({
        title: 'Project renamed',
        description: 'Your project title has been updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Could not update project title.',
        variant: 'destructive',
      });
    },
  });

  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['/api/projects', projectId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${projectId}`);
      return response.json();
    },
    enabled: !!projectId,
  });

  // Fetch project sections (tree structure)
  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ['/api/projects', projectId, 'sections'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${projectId}/sections`);
      return response.json();
    },
    enabled: !!projectId,
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

  // Handle section navigation with unsaved changes check
  const handleSectionClick = async (section: ProjectSectionWithChildren) => {
    // If clicking the same section, do nothing
    if (section.id === activeSectionId) {
      return;
    }

    // If there are unsaved changes, save first
    if (hasUnsavedChanges && sectionEditorRef.current) {
      try {
        await sectionEditorRef.current.saveContent();
        setHasUnsavedChanges(false);
      } catch (error) {
        toast({
          title: 'Save failed',
          description: 'Could not save changes. Please try again.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Navigate to new section (folders will show empty state, pages will show editor)
    setActiveSectionId(section.id);
  };

  // Handle manual save
  const handleManualSave = async () => {
    if (sectionEditorRef.current) {
      try {
        await sectionEditorRef.current.saveContent();
      } catch (error) {
        toast({
          title: 'Save failed',
          description: 'Could not save changes. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Get breadcrumb path for current section
  const getBreadcrumb = (): string[] => {
    if (!activeSectionId || !sections) return [];
    
    const findPath = (
      sectionList: ProjectSectionWithChildren[], 
      targetId: string, 
      path: string[] = []
    ): string[] | null => {
      for (const section of sectionList) {
        const currentPath = [...path, section.title];
        
        if (section.id === targetId) {
          return currentPath;
        }
        
        if (section.children && section.children.length > 0) {
          const childPath = findPath(section.children, targetId, currentPath);
          if (childPath) return childPath;
        }
      }
      return null;
    };
    
    return findPath(sections, activeSectionId) || [];
  };

  const breadcrumb = getBreadcrumb();

  // Loading state
  if (isLoadingProject || isLoadingSections) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Determine what to show in main content area
  const showEmptyState = !activeSectionId || activeSection?.type === 'folder';
  const showEditor = activeSectionId && activeSection?.type === 'page';

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Global Navigation Header */}
      <div className="border-b bg-background flex-shrink-0">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              data-testid="button-logo-home"
            >
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-serif font-bold text-foreground">WriteCraft</h1>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => window.location.href = '/generators'}
                className="text-foreground hover:text-primary transition-colors" 
                data-testid="link-generators"
              >
                Generators
              </button>
              <button 
                onClick={() => window.location.href = '/guides'}
                className="text-foreground hover:text-primary transition-colors" 
                data-testid="link-guides"
              >
                Guides
              </button>
              <button 
                onClick={() => window.location.href = '/notebook'}
                className="text-foreground hover:text-primary transition-colors" 
                data-testid="link-notebook"
              >
                Notebook
              </button>
              <button 
                onClick={() => window.location.href = '/projects'}
                className="text-foreground hover:text-primary transition-colors" 
                data-testid="link-projects"
              >
                Projects
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Layout with Tabs */}
      <div className="flex-1 min-h-0">
        <WorkspaceLayout
          projectInfo={{
            id: projectId,
            title: project?.title || 'Untitled Project',
            onRename: (newTitle) => renameProjectMutation.mutate(newTitle),
          }}
        >
          <div className="flex h-full bg-background">
            {/* Left Sidebar - Outline only */}
            <div className="w-64 border-r flex-shrink-0 overflow-hidden">
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
                wordCount={wordCount}
                saveStatus={saveStatus}
                lastSaveTime={lastSaveTime}
                onBack={onBack}
                onManualSave={handleManualSave}
                isSaving={saveStatus === 'saving'}
              />

              {/* Editor or Empty State */}
              {showEditor ? (
                <SectionEditor
                  ref={sectionEditorRef}
                  projectId={projectId}
                  section={activeSection}
                  onContentChange={(changes) => {
                    setHasUnsavedChanges(changes);
                    if (!changes) {
                      setSaveStatus('saved');
                    }
                  }}
                  onSaveStatusChange={setSaveStatus}
                  onLastSaveTimeChange={setLastSaveTime}
                  onWordCountChange={setWordCount}
                />
              ) : showEmptyState ? (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No page selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a page from the outline to start writing, or create a new page.
                    </p>
                  </div>
                </div>
              ) : isLoadingSection ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : null}
            </div>
          </div>
        </WorkspaceLayout>
      </div>
    </div>
  );
}
