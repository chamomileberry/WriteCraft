import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookOpen, Settings, Plus, ChevronDown } from "lucide-react";
import { useNotebookStore, type Notebook } from "@/stores/notebookStore";
import { apiRequest } from "@/lib/queryClient";
import NotebookManager from "./NotebookManager";

interface NotebookSwitcherProps {
  className?: string;
  showActiveInfo?: boolean;
}

export default function NotebookSwitcher({ className, showActiveInfo = true }: NotebookSwitcherProps) {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
    setIsPopoverOpen(false);
  };

  // Get other notebooks (excluding the active one)
  const otherNotebooks = notebooks.filter(n => n.id !== activeNotebookId);

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
        ) : showActiveInfo && activeNotebook ? (
          otherNotebooks.length > 0 ? (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex-1 text-left w-full"
                  data-testid="button-open-notebook-switcher"
                  aria-label="Switch notebook"
                >
                  <Card 
                    className="overflow-hidden hover-elevate transition-all"
                  >
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
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">
                              Active Notebook
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2" align="start">
                <div className="space-y-1">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Switch to:
                  </div>
                  {otherNotebooks.map((notebook) => (
                    <button
                      key={notebook.id}
                      onClick={() => handleNotebookChange(notebook.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover-elevate transition-all text-left"
                      data-testid={`button-switch-notebook-${notebook.id}`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                        {notebook.imageUrl ? (
                          <img 
                            src={notebook.imageUrl} 
                            alt={notebook.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{notebook.name}</div>
                        {notebook.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {notebook.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Card className="flex-1 overflow-hidden">
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
                      Active Notebook
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
          )
        ) : null}

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

      <NotebookManager 
        isOpen={isManagerOpen} 
        onClose={() => setIsManagerOpen(false)} 
      />
    </>
  );
}