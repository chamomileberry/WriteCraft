import { Button } from "@/components/ui/button";
import { Plus, Book } from "lucide-react";
import NotebookSwitcher from "@/components/NotebookSwitcher";
import { Badge } from "@/components/ui/badge";
import { useNotebookStore } from "@/stores/notebookStore";

interface GeneratorNotebookControlsProps {
  onQuickCreate: () => void;
  quickCreateLabel?: string;
  quickCreateTestId?: string;
}

export function GeneratorNotebookControls({
  onQuickCreate,
  quickCreateLabel = "Create Notebook",
  quickCreateTestId = "button-quick-create-notebook",
}: GeneratorNotebookControlsProps) {
  const { getActiveNotebook } = useNotebookStore();
  const activeNotebook = getActiveNotebook();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <NotebookSwitcher />
      
      <Button
        size="sm"
        variant="outline"
        onClick={onQuickCreate}
        data-testid={quickCreateTestId}
      >
        <Plus className="h-4 w-4 mr-2" />
        {quickCreateLabel}
      </Button>

      {activeNotebook && (
        <Badge variant="secondary" className="flex items-center gap-1.5">
          <Book className="h-3 w-3" />
          <span className="text-xs">Active: {activeNotebook.name}</span>
        </Badge>
      )}
    </div>
  );
}
