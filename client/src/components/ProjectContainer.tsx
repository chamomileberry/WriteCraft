import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { WorkspaceLayout } from './workspace/WorkspaceLayout';
import { ProjectHeader } from './ProjectHeader';
import { ProjectOutline } from './ProjectOutline';
import { SectionEditor } from './SectionEditor';
import { GeneratorDropdown, GENERATORS } from './GeneratorDropdown';
import { GeneratorModals, GeneratorType } from './GeneratorModals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, ArrowLeft, BookOpen, Moon, Sun, StickyNote, Sparkles, Menu, ChevronDown, Plus, Search, User, Settings, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeGenerator, setActiveGenerator] = useState<GeneratorType>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileGeneratorsExpanded, setIsMobileGeneratorsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
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
  const { addPanel, isPanelOpen, focusPanel, toggleQuickNote, isQuickNoteOpen, findPanel, updatePanel, currentLayout } = useWorkspaceStore();
  
  // Auto-collapse sidebar when multiple reference tabs are present (keep open for single tabs or when empty)
  useEffect(() => {
    const totalReferenceTabs = currentLayout.regions.main.length + currentLayout.regions.split.length;
    if (totalReferenceTabs > 1) {
      setIsSidebarOpen(false);
    }
  }, [currentLayout.regions.main.length, currentLayout.regions.split.length]);

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

  // Writing Assistant functionality
  const openWritingAssistant = () => {
    // Check if there's already an existing writing assistant panel
    const existingPanel = findPanel('writingAssistant', 'writing-assistant');
    
    if (existingPanel) {
      // If it's already docked, focus it
      if (existingPanel.mode === 'docked') {
        focusPanel(existingPanel.id);
        return;
      }
      // If it exists as a tab or floating, convert it to docked mode
      if (existingPanel.mode === 'tabbed' || existingPanel.mode === 'floating') {
        updatePanel(existingPanel.id, { 
          mode: 'docked',
          regionId: 'docked'
        });
        return;
      }
    }
    
    // Create new docked panel if none exists
    addPanel({
      id: `writing-assistant-${Date.now()}`,
      type: 'writingAssistant' as const,
      title: 'Writing Assistant',
      mode: 'docked' as const,
      regionId: 'docked' as const,
      size: { width: 400, height: 600 },
      entityId: 'writing-assistant', // Stable entityId for proper duplicate detection
    });
  };

  // User initials for avatar
  const userInitials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "U" : "U";

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      setLocation('/search');
    }
  };

  // Create new handler
  const handleCreateNew = () => {
    setLocation('/notebook');
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
              <GeneratorDropdown onSelectGenerator={setActiveGenerator} />
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
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Desktop Search Bar */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="input-search-desktop"
                  />
                </div>
              </form>

              {/* Mobile Search Icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearch}
                className="lg:hidden"
                data-testid="button-search-mobile"
                title="Search"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Create Button */}
              <Button
                variant="default"
                size="sm"
                onClick={handleCreateNew}
                className="flex bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-create-new"
              >
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Create</span>
              </Button>
              
              {/* Quick Note Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleQuickNote}
                className={`${isQuickNoteOpen() ? 'bg-primary/10 text-primary' : ''}`}
                data-testid="button-quick-note"
                title="Quick Note"
                aria-label="Quick Note"
              >
                <StickyNote className="h-4 w-4" />
              </Button>
              
              {/* Writing Assistant Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openWritingAssistant}
                className="hover:bg-primary/10 hover:text-primary"
                style={{
                  background: 'linear-gradient(135deg, hsl(270, 75%, 75%) 0%, hsl(255, 69%, 71%) 100%)',
                  color: 'white'
                }}
                data-testid="button-writing-assistant"
                title="Writing Assistant"
                aria-label="Writing Assistant"
              >
                <Sparkles className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* User Profile Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/account')} data-testid="menu-account">
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/import')} data-testid="menu-import">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Import Data</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { window.location.href = '/api/auth/logout'; }} data-testid="menu-logout">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-menu"
                title="Menu"
                aria-label="Menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-4">
              <button 
                onClick={() => {
                  window.location.href = '/notebook';
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-foreground hover:text-primary transition-colors py-2" 
                data-testid="mobile-link-notebook"
              >
                Notebook
              </button>
              <button 
                onClick={() => {
                  window.location.href = '/projects';
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-foreground hover:text-primary transition-colors py-2" 
                data-testid="mobile-link-projects"
              >
                Projects
              </button>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setIsMobileGeneratorsExpanded(!isMobileGeneratorsExpanded)}
                  className="flex items-center justify-between w-full text-left text-foreground hover:text-primary transition-colors py-2" 
                  data-testid="mobile-link-generators"
                >
                  <span>Generators</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMobileGeneratorsExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileGeneratorsExpanded && (
                  <div className="pl-4 space-y-2">
                    {GENERATORS.map((generator) => {
                      const Icon = generator.icon;
                      return (
                        <button
                          key={generator.id}
                          onClick={() => {
                            setActiveGenerator(generator.id);
                            setIsMobileMenuOpen(false);
                            setIsMobileGeneratorsExpanded(false);
                          }}
                          className="flex items-center gap-2 w-full text-left text-sm text-foreground hover:text-primary transition-colors py-2"
                          data-testid={`mobile-${generator.id}`}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{generator.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => {
                  window.location.href = '/guides';
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-foreground hover:text-primary transition-colors py-2" 
                data-testid="mobile-link-guides"
              >
                Guides
              </button>
            </div>
          </div>
        )}

        <GeneratorModals 
          activeGenerator={activeGenerator} 
          onClose={() => setActiveGenerator(null)} 
        />
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
            {/* Left Sidebar - Outline (collapsible) */}
            <div 
              className={cn(
                "border-r flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out relative",
                isSidebarOpen ? "w-64" : "w-0"
              )}
            >
              {isSidebarOpen && (
                <ProjectOutline
                  projectId={projectId}
                  sections={sections}
                  activeSectionId={activeSectionId}
                  onSectionClick={handleSectionClick}
                  onClose={() => setIsSidebarOpen(false)}
                />
              )}
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
                sidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(true)}
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
                  readOnly={(project as any)?.isShared && (project as any)?.sharePermission === 'view'}
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
