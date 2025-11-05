import { Book } from "lucide-react";
import NotebookSwitcher from "@/components/NotebookSwitcher";
import { Badge } from "@/components/ui/badge";
import { useNotebookStore } from "@/stores/notebookStore";

export function GeneratorNotebookControls() {
  const { getActiveNotebook } = useNotebookStore();
  const activeNotebook = getActiveNotebook();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <NotebookSwitcher />

      {activeNotebook && (
        <Badge variant="secondary" className="flex items-center gap-1.5">
          <Book className="h-3 w-3" />
          <span className="text-xs">Active: {activeNotebook.name}</span>
        </Badge>
      )}
    </div>
  );
}
