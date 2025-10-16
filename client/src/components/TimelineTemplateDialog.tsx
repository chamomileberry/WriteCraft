import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Swords, User, BookMarked, Layers, List, BarChart3 } from 'lucide-react';

interface TimelineTemplate {
  id: string;
  name: string;
  description: string;
  timelineType: string;
  timeScale: string;
  defaultView: 'list' | 'canvas' | 'gantt';
  icon: React.ComponentType<{ className?: string }>;
  suggested: string;
  exampleUse: string;
}

const timelineTemplates: TimelineTemplate[] = [
  {
    id: 'world-history',
    name: 'World History',
    description: 'Track civilizations and major events across ages',
    timelineType: 'World',
    timeScale: 'Centuries',
    defaultView: 'list',
    icon: BookOpen,
    suggested: 'Best for tracking civilizations over millennia',
    exampleUse: 'Rise and fall of empires, technological eras, major world events'
  },
  {
    id: 'campaign-sessions',
    name: 'Campaign Sessions',
    description: 'Plan and track RPG campaign events',
    timelineType: 'Campaign',
    timeScale: 'Days',
    defaultView: 'gantt',
    icon: Swords,
    suggested: 'Best for RPG session tracking (5-15 sessions)',
    exampleUse: 'Session planning, quest progression, in-game calendar'
  },
  {
    id: 'character-biography',
    name: 'Character Biography',
    description: 'Chronicle a character\'s life journey',
    timelineType: 'Character',
    timeScale: 'Years',
    defaultView: 'list',
    icon: User,
    suggested: 'Best for individual character lifespans',
    exampleUse: 'Life milestones, character development, personal history'
  },
  {
    id: 'plot-structure',
    name: 'Plot Structure',
    description: 'Map out story arcs and parallel plotlines',
    timelineType: 'Plot',
    timeScale: 'Chapters',
    defaultView: 'gantt',
    icon: BookMarked,
    suggested: 'Best for comparing multiple story arcs',
    exampleUse: 'Story beats, character arc intersections, subplot timing'
  }
];

interface TimelineTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TimelineTemplate) => void;
  onCancel?: () => void;
}

export function TimelineTemplateDialog({ open, onClose, onSelectTemplate, onCancel }: TimelineTemplateDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TimelineTemplate | null>(null);

  const handleClose = () => {
    setSelectedTemplate(null);
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'list': return List;
      case 'canvas': return Layers;
      case 'gantt': return BarChart3;
      default: return List;
    }
  };

  const getViewLabel = (view: string) => {
    switch (view) {
      case 'list': return 'List View';
      case 'canvas': return 'Canvas View';
      case 'gantt': return 'Gantt View';
      default: return view;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Timeline Type</DialogTitle>
          <DialogDescription>
            Select a template optimized for your specific use case. Each template uses the best view and time scale for its purpose.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {timelineTemplates.map((template) => {
            const Icon = template.icon;
            const ViewIcon = getViewIcon(template.defaultView);
            const isSelected = selectedTemplate?.id === template.id;

            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover-elevate active-elevate-2 ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
                data-testid={`template-${template.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <ViewIcon className="w-3 h-3" />
                      {getViewLabel(template.defaultView)}
                    </Badge>
                    <Badge variant="outline">
                      {template.timeScale}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Best for:</strong> {template.suggested}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Examples:</strong> {template.exampleUse}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-template">
            Cancel
          </Button>
          <Button
            onClick={() => selectedTemplate && onSelectTemplate(selectedTemplate)}
            disabled={!selectedTemplate}
            data-testid="button-create-timeline"
          >
            Create Timeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
