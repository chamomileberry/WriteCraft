import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface ProjectHeaderProps {
  project?: {
    title?: string;
  };
  wordCount: number;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  lastSaveTime: Date | null;
  isEditingTitle: boolean;
  titleInput: string;
  onBack: () => void;
  onTitleClick: () => void;
  onTitleChange: (value: string) => void;
  onTitleSave: () => void;
  onTitleCancel: () => void;
  onTitleKeyDown: (e: React.KeyboardEvent) => void;
  onManualSave: () => void;
  isSaving: boolean;
}

export function ProjectHeader({
  project,
  wordCount,
  saveStatus,
  lastSaveTime,
  isEditingTitle,
  titleInput,
  onBack,
  onTitleClick,
  onTitleChange,
  onTitleSave,
  onTitleCancel,
  onTitleKeyDown,
  onManualSave,
  isSaving,
}: ProjectHeaderProps) {
  const getSaveStatusText = () => {
    if (saveStatus === 'saving') return 'Saving...';
    if (saveStatus === 'saved' && lastSaveTime) {
      const timeAgo = Math.floor((Date.now() - lastSaveTime.getTime()) / 1000);
      if (timeAgo < 60) return `Saved ${timeAgo}s ago`;
      if (timeAgo < 3600) return `Saved ${Math.floor(timeAgo / 60)}m ago`;
      return `Saved ${Math.floor(timeAgo / 3600)}h ago`;
    }
    if (saveStatus === 'unsaved') return 'Unsaved changes';
    return 'All changes saved';
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            data-testid="button-back" 
            title="Back to Projects"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            {isEditingTitle ? (
              <Input
                value={titleInput}
                onChange={(e) => onTitleChange(e.target.value)}
                onKeyDown={onTitleKeyDown}
                onBlur={onTitleSave}
                className="text-xl font-semibold h-8 px-2 -ml-2"
                data-testid="input-project-title"
                autoFocus
                placeholder="Project title..."
              />
            ) : (
              <h1 
                className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
                onClick={onTitleClick}
                data-testid="text-project-title"
              >
                {project?.title || 'Untitled Project'}
              </h1>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {wordCount} words
          </div>
          <div className="text-sm text-muted-foreground">
            {getSaveStatusText()}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onManualSave}
              disabled={isSaving || saveStatus === 'saving'}
              data-testid="button-manual-save"
            >
              {isSaving || saveStatus === 'saving' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}