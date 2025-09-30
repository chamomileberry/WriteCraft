import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import type { Project } from '@shared/schema';

interface ProjectHeaderProps {
  project?: Project;
  breadcrumb: string[];
  wordCount: number;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  lastSaveTime: Date | null;
  onBack: () => void;
  onManualSave: () => void;
  isSaving: boolean;
}

export function ProjectHeader({
  project,
  breadcrumb,
  wordCount,
  saveStatus,
  lastSaveTime,
  onBack,
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
            <h1 className="text-xl font-semibold" data-testid="text-project-title">
              {project?.title || 'Untitled Project'}
            </h1>
            {breadcrumb.length > 0 && (
              <p className="text-sm text-muted-foreground" data-testid="text-breadcrumb">
                {breadcrumb.join(' / ')}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span data-testid="text-word-count-header">
              {wordCount.toLocaleString()} words
            </span>
            <span data-testid="text-save-status">
              {getSaveStatusText()}
            </span>
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={onManualSave}
            disabled={isSaving || saveStatus === 'saved'}
            data-testid="button-manual-save"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
