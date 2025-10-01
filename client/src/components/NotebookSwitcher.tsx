import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookOpen, Settings, Plus } from "lucide-react";
import { useNotebookStore, type Notebook } from "@/stores/notebookStore";
import { apiRequest } from "@/lib/queryClient";
import NotebookManager from "./NotebookManager";

interface NotebookSwitcherProps {
  className?: string;
  showActiveInfo?: boolean;
}

export default function NotebookSwitcher({ className, showActiveInfo = true }: NotebookSwitcherProps) {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const { 
    activeNotebookId, 
    notebooks, 
    setActiveNotebook, 
    setNotebooks,
    getActiveNotebook 
  } = useNotebookStore();

  // Fetch notebooks when component mounts
  const { isLoading } = useQuery({
    queryKey: ['/api/notebooks'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notebooks');
      const fetchedNotebooks = await response.json() as Notebook[];
      setNotebooks(fetchedNotebooks);
      
      // If no active notebook is set but we have notebooks, set the first one as active
      if (!activeNotebookId && fetchedNotebooks.length > 0) {
        setActiveNotebook(fetchedNotebooks[0].id);
      }
      
      return fetchedNotebooks;
    }
  });

  const activeNotebook = getActiveNotebook();

  const handleNotebookChange = (notebookId: string) => {
    setActiveNotebook(notebookId);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse bg-muted h-9 w-48 rounded"></div>
        <div className="animate-pulse bg-muted h-9 w-9 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          
          {notebooks.length === 0 ? (
            <Button
              onClick={() => setIsManagerOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-create-first-notebook"
            >
              <Plus className="h-4 w-4" />
              Create First Notebook
            </Button>
          ) : (
            <Select
              value={activeNotebookId || ""}
              onValueChange={handleNotebookChange}
            >
              <SelectTrigger 
                className="flex-1 min-w-[200px]"
                data-testid="select-active-notebook"
              >
                <SelectValue 
                  placeholder="Select a notebook..." 
                  className="truncate"
                />
              </SelectTrigger>
              <SelectContent>
                {notebooks.map((notebook) => (
                  <SelectItem 
                    key={notebook.id} 
                    value={notebook.id}
                    data-testid={`select-notebook-${notebook.id}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{notebook.name}</span>
                      {notebook.description && (
                        <span className="text-xs text-muted-foreground truncate">
                          {notebook.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          onClick={() => setIsManagerOpen(true)}
          variant="outline"
          size="sm"
          className="flex-shrink-0"
          data-testid="button-manage-notebooks"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Active Notebook Info */}
      {showActiveInfo && activeNotebook && (
        <div className="text-sm text-muted-foreground">
          Working in: <span className="font-medium">{activeNotebook.name}</span>
          {activeNotebook.description && (
            <span className="ml-2 text-xs">— {activeNotebook.description}</span>
          )}
        </div>
      )}

      <NotebookManager 
        isOpen={isManagerOpen} 
        onClose={() => setIsManagerOpen(false)} 
      />
    </>
  );
}