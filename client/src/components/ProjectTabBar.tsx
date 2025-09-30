import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FileText, User, Search, List, StickyNote, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import type { PanelDescriptor } from '@/stores/workspaceStore';

interface ProjectTabBarProps {
  projectId: string;
  projectTitle: string;
}

const iconMap: Record<string, any> = {
  User,
  Search,
  List,
  StickyNote,
  Sparkles,
  FileText,
};

export function ProjectTabBar({ projectId, projectTitle }: ProjectTabBarProps) {
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editTitle, setEditTitle] = useState(projectTitle);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { 
    getTabsInRegion, 
    removePanel, 
    setActiveTab,
    currentLayout 
  } = useWorkspaceStore();
  
  const tabs = getTabsInRegion('main');
  const activeTabId = currentLayout.activeTabId;

  const updateProjectMutation = useMutation({
    mutationFn: async (title: string) => {
      await apiRequest('PUT', `/api/projects/${projectId}`, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      setIsEditingProject(false);
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

  const handleStartEdit = () => {
    setIsEditingProject(true);
    setEditTitle(projectTitle);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== projectTitle) {
      updateProjectMutation.mutate(editTitle.trim());
    } else {
      setIsEditingProject(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProject(false);
    setEditTitle(projectTitle);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removePanel(tabId);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId, 'main');
  };

  const getIconForTab = (tab: PanelDescriptor) => {
    const panelType = tab.type;
    const iconName = useWorkspaceStore.getState().panelRegistry[panelType]?.icon || 'FileText';
    const IconComponent = iconMap[iconName] || FileText;
    return <IconComponent className="h-3.5 w-3.5" />;
  };

  return (
    <div className="flex items-center gap-0.5 p-1.5 border-b bg-muted/30 overflow-x-auto">
      {/* Project Tab - Always first and cannot be closed */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors min-w-fit cursor-pointer',
          !activeTabId ? 'bg-background shadow-sm' : 'hover-elevate'
        )}
        onClick={!activeTabId && !isEditingProject ? handleStartEdit : () => {
          // Clear active tab to show project outline
          if (activeTabId) {
            setActiveTab('', 'main');
          }
        }}
        data-testid="tab-project"
      >
        <FileText className="h-3.5 w-3.5 flex-shrink-0" />
        {isEditingProject && !activeTabId ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            onBlur={handleSaveTitle}
            className="h-6 text-sm px-1 min-w-[120px]"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            data-testid="input-edit-project-title"
          />
        ) : (
          <span className="truncate max-w-[150px]" data-testid="text-project-title">
            {projectTitle}
          </span>
        )}
      </div>

      {/* Additional Reference Tabs */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors min-w-fit cursor-pointer group',
            activeTabId === tab.id ? 'bg-background shadow-sm' : 'hover-elevate'
          )}
          onClick={() => handleTabClick(tab.id)}
          data-testid={`tab-${tab.id}`}
        >
          {getIconForTab(tab)}
          <span className="truncate max-w-[120px]">{tab.title}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 ml-1"
            onClick={(e) => handleCloseTab(tab.id, e)}
            data-testid={`button-close-tab-${tab.id}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
