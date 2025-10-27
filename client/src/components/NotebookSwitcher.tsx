import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookOpen, Settings, Plus, ChevronDown } from "lucide-react";
import { useNotebookStore, type Notebook } from "@/stores/notebookStore";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NotebookManager from "./NotebookManager";

interface NotebookSwitcherProps {
  className?: string;
  showActiveInfo?: boolean;
  showHeader?: boolean;
  isPopoverOpen?: boolean;
  onPopoverOpenChange?: (open: boolean) => void;
}

export default function NotebookSwitcher({ className, showActiveInfo = true, showHeader = false, isPopoverOpen: externalPopoverOpen, onPopoverOpenChange }: NotebookSwitcherProps) {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [internalPopoverOpen, setInternalPopoverOpen] = useState(false);
  const { toast } = useToast();
  
  // Use external control if provided, otherwise use internal state
  const isPopoverOpen = externalPopoverOpen !== undefined ? externalPopoverOpen : internalPopoverOpen;
  const setIsPopoverOpen = onPopoverOpenChange || setInternalPopoverOpen;
  const { 
    activeNotebookId, 
    notebooks, 
    setActiveNotebook, 
    setNotebooks,
    getActiveNotebook 
  } = useNotebookStore();

  // Close popover when manager opens
  const handleOpenManagerWithClose = () => {
    setIsPopoverOpen(false);
    handleOpenManager();
  };

  const handleOpenCreateWithClose = () => {
    setIsPopoverOpen(false);
    handleOpenCreate();
  };

  // Fetch notebooks when component mounts
  const { isLoading } = useQuery({
    queryKey: ['/api/notebooks'],
    queryFn: async () => {
      const response = await apiRequest('/api/notebooks', 'GET');
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

  // Manager mode state and handlers (must be before any conditional returns)
  const [managerMode, setManagerMode] = useState<'manage' | 'create'>('manage');

  const handleOpenManager = () => {
    setManagerMode('manage');
    setIsManagerOpen(true);
  };

  const handleOpenCreate = () => {
    setManagerMode('create');
    setIsManagerOpen(true);
  };

  // Get other notebooks (excluding the active one)
  const otherNotebooks = notebooks.filter(n => n.id !== activeNotebookId);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-end gap-2">
          <div className="animate-pulse bg-muted h-9 w-9 rounded"></div>
          <div className="animate-pulse bg-muted h-9 w-40 rounded"></div>
        </div>
        <div className="animate-pulse bg-muted h-24 w-full rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Header Section */}
        <div className="flex items-center justify-between gap-2">
          {showHeader && (
            <h2 className="text-lg font-semibold" data-testid="text-active-notebook-header">
              Active Notebook
            </h2>
          )}
          <div className={`flex items-center gap-2 ${!showHeader ? 'ml-auto' : ''}`}>
            <Button
              onClick={handleOpenManagerWithClose}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              data-testid="button-manage-notebooks"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleOpenCreateWithClose}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-create-notebook"
            >
              <Plus className="h-4 w-4" />
              Create Notebook
            </Button>
          </div>
        </div>

        {/* Notebook Display Section */}
        {notebooks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No notebooks yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first notebook to start organizing your content
              </p>
              <Button
                onClick={handleOpenCreateWithClose}
                variant="default"
                size="sm"
                data-testid="button-create-first-notebook"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Notebook
              </Button>
            </CardContent>
          </Card>
        ) : showActiveInfo && activeNotebook ? (
          otherNotebooks.length > 0 ? (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={true}>
              <PopoverTrigger asChild>
                <button
                  className="w-full text-left"
                  data-testid="button-open-notebook-switcher"
                  aria-label="Switch notebook"
                >
                  <Card className="hover-elevate transition-all">
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
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate" data-testid="text-active-notebook-name">
                              {activeNotebook.name}
                            </h3>
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
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
      </div>

      <NotebookManager 
        isOpen={isManagerOpen} 
        onClose={() => setIsManagerOpen(false)}
        openInCreateMode={managerMode === 'create'}
      />
    </>
  );
}