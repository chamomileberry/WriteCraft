import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2, Minimize2, Maximize2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { aiSuggestionPluginKey, type AISuggestion } from '@/lib/ai-suggestions-plugin';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AIBubbleMenuProps {
  editor: Editor | null;
}

type AIAction = 'improve' | 'shorten' | 'expand' | 'fix' | 'ask';

export default function AIBubbleMenu({ editor }: AIBubbleMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<AIAction | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTextForAsk, setSelectedTextForAsk] = useState('');
  const [askSuggestionPosition, setAskSuggestionPosition] = useState({ from: 0, to: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { view, state } = editor;
      const { from, to } = state.selection;
      
      // Check if we have an active suggestion to position near
      const pluginState = aiSuggestionPluginKey.getState(state);
      
      // Helper function to calculate menu position from coords
      const calculatePosition = (startCoords: { top: number; bottom: number; left: number }, endCoords: { top: number; bottom: number; left: number }) => {
        // Get the editor DOM element and its container
        const editorElement = view.dom;
        const editorRect = editorElement.getBoundingClientRect();
        
        // Calculate menu position (above the selection/suggestion)
        // The coords are already viewport-relative, so we use them directly
        let menuTop = startCoords.top - 60;
        let menuLeft = (startCoords.left + endCoords.left) / 2 - 200;
        
        // Viewport clamping to keep menu visible
        const menuWidth = 400;
        const menuHeight = 50; // Approximate height of menu
        
        // Clamp horizontal position within viewport
        menuLeft = Math.max(10, Math.min(menuLeft, window.innerWidth - menuWidth - 10));
        
        // Flip to below selection if too close to top of viewport
        if (startCoords.top < 70) {
          menuTop = endCoords.bottom + 10;
        }
        
        // If menu would go below viewport, flip back to top
        if (menuTop + menuHeight > window.innerHeight) {
          menuTop = startCoords.top - 60;
        }
        
        // Final clamp to ensure menu stays in viewport
        menuTop = Math.max(10, Math.min(menuTop, window.innerHeight - menuHeight - 10));
        
        return { top: menuTop, left: menuLeft };
      };
      
      // If there's an active suggestion, position near it instead of selection
      if (pluginState && pluginState.suggestions.length > 0) {
        const activeSuggestion = pluginState.suggestions[pluginState.suggestions.length - 1];
        if (activeSuggestion.status === 'pending') {
          const suggestionFrom = activeSuggestion.deleteRange.from;
          const suggestionTo = activeSuggestion.deleteRange.to;
          
          const start = view.coordsAtPos(suggestionFrom);
          const end = view.coordsAtPos(suggestionTo);
          
          if (!start || !end) {
            setIsVisible(false);
            return;
          }
          
          const pos = calculatePosition(start, end);
          setPosition(pos);
          setIsVisible(true);
          return;
        }
      }

      // Default behavior: hide menu if no text is selected
      if (from === to) {
        setIsVisible(false);
        return;
      }

      // Get the coordinates of the selection
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      
      if (!start || !end) {
        setIsVisible(false);
        return;
      }
      
      const pos = calculatePosition(start, end);
      setPosition(pos);
      setIsVisible(true);
    };

    // Update menu on selection change
    const handleSelectionUpdate = () => {
      updateMenu();
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('update', handleSelectionUpdate);

    // Update menu position on scroll
    const editorElement = editor.view.dom.closest('.ProseMirror')?.parentElement;
    const handleScroll = () => {
      updateMenu();
    };

    if (editorElement) {
      editorElement.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('update', handleSelectionUpdate);
      if (editorElement) {
        editorElement.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [editor]);

  const handleAIAction = async (action: AIAction) => {
    if (!editor) return;
    const { view, state } = editor;
    const { from, to } = state.selection;

    if (from === to) return; // No text selected

    const selectedText = state.doc.textBetween(from, to, '');
    const suggestionPosition = { from, to };

    // For 'ask' action, show the custom prompt dialog
    if (action === 'ask') {
      setSelectedTextForAsk(selectedText);
      setAskSuggestionPosition(suggestionPosition);
      setShowAskDialog(true);
      setIsVisible(false); // Hide the bubble menu
      return;
    }

    setIsLoading(true);
    setCurrentAction(action);

    try {
      // Call AI API
      const response = await apiRequest('POST', '/api/ai/improve-text', {
        text: selectedText,
        action: action
      });

      const { suggestedText } = await response.json();

      // Create suggestion
      const suggestion: AISuggestion = {
        id: 'suggestion-' + Date.now(),
        type: action === 'fix' ? 'grammar' : action === 'shorten' ? 'conciseness' : 'style',
        deleteRange: { 
          from: suggestionPosition.from, 
          to: suggestionPosition.to 
        },
        originalText: selectedText,
        suggestedText: suggestedText,
        status: 'pending',
        timestamp: Date.now()
      };

      // Add suggestion to plugin state
      const tr = view.state.tr;
      tr.setMeta(aiSuggestionPluginKey, suggestion);
      view.dispatch(tr);

      // Hide menu after action
      setIsVisible(false);

    } catch (error) {
      console.error('AI action failed:', error);
      toast({
        title: "AI Action Failed",
        description: error instanceof Error ? error.message : "Failed to process text with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const handleCustomPromptSubmit = async () => {
    if (!customPrompt.trim() || !editor) return;

    const { view } = editor;
    
    setIsLoading(true);

    try {
      // Call AI API with custom prompt
      const response = await apiRequest('POST', '/api/ai/improve-text', {
        text: selectedTextForAsk,
        action: 'ask',
        customPrompt: customPrompt
      });

      const { suggestedText } = await response.json();

      // Create suggestion
      const suggestion: AISuggestion = {
        id: 'suggestion-' + Date.now(),
        type: 'style',
        deleteRange: { 
          from: askSuggestionPosition.from, 
          to: askSuggestionPosition.to 
        },
        originalText: selectedTextForAsk,
        suggestedText: suggestedText,
        status: 'pending',
        timestamp: Date.now()
      };

      // Add suggestion to plugin state
      const tr = view.state.tr;
      tr.setMeta(aiSuggestionPluginKey, suggestion);
      view.dispatch(tr);

      // Close dialog and reset
      setShowAskDialog(false);
      setCustomPrompt('');

    } catch (error) {
      console.error('Custom AI prompt failed:', error);
      toast({
        title: "AI Action Failed",
        description: error instanceof Error ? error.message : "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!editor) return null;

  return (
    <>
      {/* Bubble Menu */}
      {isVisible && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 1000,
          }}
          className="ai-bubble-menu"
        >
          <Card className="flex items-center gap-1 p-1 shadow-lg border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAIAction('improve')}
              disabled={isLoading}
              data-testid="ai-improve-btn"
              className="gap-1.5 h-8"
            >
              {isLoading && currentAction === 'improve' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Improve
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAIAction('shorten')}
              disabled={isLoading}
              data-testid="ai-shorten-btn"
              className="gap-1.5 h-8"
            >
              {isLoading && currentAction === 'shorten' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" />
              )}
              Shorten
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAIAction('expand')}
              disabled={isLoading}
              data-testid="ai-expand-btn"
              className="gap-1.5 h-8"
            >
              {isLoading && currentAction === 'expand' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
              Expand
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAIAction('fix')}
              disabled={isLoading}
              data-testid="ai-fix-btn"
              className="gap-1.5 h-8"
            >
              {isLoading && currentAction === 'fix' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Fix
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAIAction('ask')}
              disabled={isLoading}
              data-testid="ai-ask-btn"
              className="gap-1.5 h-8"
            >
              {isLoading && currentAction === 'ask' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              Ask AI
            </Button>
          </Card>
        </div>
      )}

      {/* Custom Prompt Dialog */}
      <Dialog open={showAskDialog} onOpenChange={(open) => {
        setShowAskDialog(open);
        if (!open) {
          setCustomPrompt(''); // Clear prompt when dialog closes
        }
      }}>
        <DialogContent data-testid="ai-ask-dialog">
          <DialogHeader>
            <DialogTitle>Ask AI</DialogTitle>
            <DialogDescription>
              Tell the AI what you want to do with the selected text. For example: "Make this more formal" or "Simplify this for a younger audience"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Selected text:</p>
              <p className="text-sm line-clamp-3">{selectedTextForAsk}</p>
            </div>
            
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="What would you like the AI to do?"
              className="min-h-[100px]"
              data-testid="ai-custom-prompt-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleCustomPromptSubmit();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAskDialog(false);
                setCustomPrompt('');
              }}
              disabled={isLoading}
              data-testid="ai-ask-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomPromptSubmit}
              disabled={isLoading || !customPrompt.trim()}
              data-testid="ai-ask-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
