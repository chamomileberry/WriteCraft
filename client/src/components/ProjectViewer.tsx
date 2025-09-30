import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Edit, 
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectSectionWithChildren } from '@shared/schema';

interface ProjectViewerProps {
  projectId: string;
  onBack: () => void;
  onEdit: () => void;
}

interface FlatSection {
  section: ProjectSectionWithChildren;
  depth: number;
}

export function ProjectViewer({ projectId, onBack, onEdit }: ProjectViewerProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['/api/projects', projectId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${projectId}`);
      return response.json();
    },
    enabled: !!projectId,
  });

  // Fetch project sections
  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ['/api/projects', projectId, 'sections'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${projectId}/sections`);
      return response.json();
    },
    enabled: !!projectId,
  });

  // Fetch selected section content
  const { data: selectedSection } = useQuery({
    queryKey: ['/api/projects', projectId, 'sections', selectedSectionId],
    queryFn: async () => {
      if (!selectedSectionId) return null;
      const response = await apiRequest('GET', `/api/projects/${projectId}/sections/${selectedSectionId}`);
      return response.json();
    },
    enabled: !!selectedSectionId,
  });

  // Auto-select first page when sections load
  useEffect(() => {
    if (!selectedSectionId && sections.length > 0) {
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
        setSelectedSectionId(firstPage.id);
      }
    }
  }, [sections, selectedSectionId]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSectionClick = (section: ProjectSectionWithChildren) => {
    if (section.type === 'page') {
      setSelectedSectionId(section.id);
    }
  };

  // Get breadcrumb for selected section
  const getBreadcrumb = (): string[] => {
    if (!selectedSectionId || !sections) return [];
    
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
    
    return findPath(sections, selectedSectionId) || [];
  };

  const breadcrumb = getBreadcrumb();

  // Get visible sections based on expanded state
  const getVisibleSections = (sectionList: ProjectSectionWithChildren[], depth = 0): FlatSection[] => {
    const result: FlatSection[] = [];
    
    for (const section of sectionList) {
      result.push({ section, depth });
      
      if (section.type === 'folder' && expandedIds.has(section.id) && section.children && section.children.length > 0) {
        result.push(...getVisibleSections(section.children, depth + 1));
      }
    }
    
    return result;
  };

  const visibleSections = getVisibleSections(sections);

  // Calculate total word count
  const getTotalWords = (sectionList: ProjectSectionWithChildren[]): number => {
    let total = 0;
    for (const section of sectionList) {
      if (section.type === 'page' && section.content) {
        const text = section.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        total += text.split(' ').filter(w => w.length > 0).length;
      }
      if (section.children && section.children.length > 0) {
        total += getTotalWords(section.children);
      }
    }
    return total;
  };

  const totalWords = getTotalWords(sections);

  if (isLoadingProject || isLoadingSections) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Outline */}
      <div className="w-64 border-r flex-shrink-0 overflow-hidden flex flex-col">
        {/* Outline Header */}
        <div className="p-2 border-b">
          <h3 className="text-sm font-semibold">Outline</h3>
        </div>

        {/* Outline Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {sections.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">
                This project has no content yet.
              </p>
            </div>
          ) : (
            visibleSections.map(({ section, depth }) => {
              const isExpanded = expandedIds.has(section.id);
              const isSelected = section.id === selectedSectionId;

              return (
                <div
                  key={section.id}
                  className={cn(
                    'flex items-center gap-1 py-1.5 px-2 rounded-md hover:bg-accent cursor-pointer transition-colors',
                    isSelected && 'bg-accent',
                  )}
                  style={{ paddingLeft: `${depth * 16 + 8}px` }}
                  onClick={() => handleSectionClick(section)}
                  data-testid={`viewer-section-${section.id}`}
                >
                  {/* Expand/collapse button */}
                  {section.type === 'folder' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(section.id);
                      }}
                      className="p-0.5 hover:bg-accent-foreground/10 rounded"
                      data-testid={`viewer-toggle-${section.id}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  
                  {section.type === 'page' && <div className="w-5" />}

                  {/* Icon */}
                  {section.type === 'folder' ? (
                    isExpanded ? (
                      <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}

                  {/* Title */}
                  <span className="flex-1 text-sm truncate">
                    {section.title}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Back button and breadcrumb */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back-to-list">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-2 min-w-0 text-sm">
                {/* Project title */}
                <span className="font-semibold truncate" data-testid="text-viewer-project-title">
                  {project?.title || 'Untitled Project'}
                </span>

                {/* Breadcrumb trail */}
                {breadcrumb.length > 0 && (
                  <>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {breadcrumb.map((crumb, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className={index === breadcrumb.length - 1 ? 'font-medium' : 'text-muted-foreground'}>
                          {crumb}
                        </span>
                        {index < breadcrumb.length - 1 && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Right: Word count and edit button */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Word count */}
              <div className="text-sm text-muted-foreground" data-testid="text-viewer-word-count">
                {totalWords.toLocaleString()} words
              </div>

              {/* Edit button */}
              <Button onClick={onEdit} data-testid="button-start-editing">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="flex-1 overflow-auto">
          {selectedSection ? (
            <div className="max-w-4xl mx-auto p-8">
              {/* Section title */}
              <h1 className="text-3xl font-bold mb-6">{selectedSection.title}</h1>
              
              {/* Section content */}
              <div 
                className="prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground/80"
                dangerouslySetInnerHTML={{ __html: selectedSection.content || '<p class="text-muted-foreground italic">This section has no content yet.</p>' }}
                data-testid="viewer-content"
              />
            </div>
          ) : sections.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Empty Project</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This project has no content yet.
                </p>
                <Button onClick={onEdit} data-testid="button-start-editing-empty">
                  <Edit className="h-4 w-4 mr-2" />
                  Start Editing
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">No page selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select a page from the outline to view its content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
