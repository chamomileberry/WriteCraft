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
import { Card, CardContent } from "@/components/ui/card";
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
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {notebook.imageUrl ? (
                          <img 
                            src={notebook.imageUrl} 
                            alt={notebook.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{notebook.name}</span>
                        {notebook.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {notebook.description}
                          </span>
                        )}
                      </div>
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

      {/* Active Notebook Card */}
      {showActiveInfo && activeNotebook && (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {activeNotebook.imageUrl ? (
                  <img 
                    src={activeNotebook.imageUrl} 
                    alt={activeNotebook.name}
                    className="w-full h-full object-cover"
                    data-testid="img-active-notebook-thumbnail"
                  />
                ) : (
                  <BookOpen className="h-8 w-8 text-muted-foreground" data-testid="icon-active-notebook-fallback" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Working in
                </div>
                <h3 className="font-semibold text-base mb-1 truncate" data-testid="text-active-notebook-name">
                  {activeNotebook.name}
                </h3>
                {activeNotebook.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2" data-testid="text-active-notebook-description">
                    {activeNotebook.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <NotebookManager 
        isOpen={isManagerOpen} 
        onClose={() => setIsManagerOpen(false)} 
      />
    </>
  );
}