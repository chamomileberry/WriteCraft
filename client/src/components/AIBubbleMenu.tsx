import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { view, state } = editor;
      const { from, to } = state.selection;

      // Hide menu if no text is selected
      if (from === to) {
        setIsVisible(false);
        return;
      }

      // Get the coordinates of the selection
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      
      // Calculate menu position (above the selection)
      let menuTop = start.top - 60; // Position above selection
      let menuLeft = (start.left + end.left) / 2 - 200; // Center horizontally

      // Viewport clamping to keep menu visible
      const menuWidth = 400;
      const menuHeight = 50;
      
      // Clamp horizontal position
      menuLeft = Math.max(10, Math.min(menuLeft, window.innerWidth - menuWidth - 10));
      
      // Flip to below selection if too close to top
      if (menuTop < 10) {
        menuTop = end.bottom + 10;
      }
      
      // Ensure menu doesn't go below viewport
      if (menuTop + menuHeight > window.innerHeight - 10) {
        menuTop = window.innerHeight - menuHeight - 10;
      }

      setPosition({ top: menuTop, left: menuLeft });
      setIsVisible(true);
    };

    // Update menu on selection change
    const handleSelectionUpdate = () => {
      setTimeout(updateMenu, 10);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('update', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('update', handleSelectionUpdate);
    };
  }, [editor]);

  if (!editor || !isVisible) return null;

  const handleAIAction = async (action: AIAction) => {
    const { view, state } = editor;
    const { from, to } = state.selection;

    if (from === to) return; // No text selected

    const selectedText = state.doc.textBetween(from, to, '');
    const suggestionPosition = { from, to };

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

  return (
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
  );
}
