import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Sparkles, Wand2, Minimize2, Maximize2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTextForAsk, setSelectedTextForAsk] = useState('');
  const [askSuggestionPosition, setAskSuggestionPosition] = useState({ from: 0, to: 0 });
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const { toast } = useToast();

  // Update popup position when suggestion becomes active
  useEffect(() => {
    if (!editor) {
      setPopupPosition(null);
      return;
    }

    // Throttle function to limit update frequency
    let rafId: number | null = null;
    const throttledUpdate = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          // Always clear rafId first to allow future updates
          rafId = null;
          
          const pluginState = aiSuggestionPluginKey.getState(editor.state);
          if (!pluginState || pluginState.suggestions.length === 0) {
            setPopupPosition(null);
            return;
          }

          const activeSuggestion = pluginState.suggestions.find((s: AISuggestion) => s.status === 'pending');
          if (!activeSuggestion) {
            setPopupPosition(null);
            return;
          }

          const { view } = editor;
          const { from, to } = activeSuggestion.deleteRange;
          
          // Get coordinates at the end of the suggestion
          const coords = view.coordsAtPos(to);
          
          // Position below the highlighted text
          setPopupPosition({
            top: coords.bottom + 8,
            left: coords.left
          });
        });
      }
    };

    // Initial position update
    throttledUpdate();

    // Listen to editor updates (transactions) - use throttled version
    const handleEditorUpdate = () => {
      throttledUpdate();
    };
    editor.on('update', handleEditorUpdate);

    // Update position on scroll/resize - throttled
    window.addEventListener('scroll', throttledUpdate, true);
    window.addEventListener('resize', throttledUpdate);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      editor.off('update', handleEditorUpdate);
      window.removeEventListener('scroll', throttledUpdate, true);
      window.removeEventListener('resize', throttledUpdate);
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

  // Check if there's an active suggestion
  const hasActiveSuggestion = () => {
    if (!editor) return false;
    const pluginState = aiSuggestionPluginKey.getState(editor.state);
    return pluginState && pluginState.suggestions.some((s: AISuggestion) => s.status === 'pending');
  };

  // Handle accepting a suggestion
  const handleAcceptSuggestion = () => {
    if (!editor) return;
    const pluginState = aiSuggestionPluginKey.getState(editor.state);
    if (!pluginState || pluginState.suggestions.length === 0) return;

    const activeSuggestion = pluginState.suggestions.find((s: AISuggestion) => s.status === 'pending');
    if (!activeSuggestion) return;

    const tr = editor.state.tr;
    tr.replaceRangeWith(
      activeSuggestion.deleteRange.from,
      activeSuggestion.deleteRange.to,
      editor.state.schema.text(activeSuggestion.suggestedText)
    );
    
    // Remove the suggestion from state
    const updatedSuggestions = pluginState.suggestions.filter((s: AISuggestion) => s.id !== activeSuggestion.id);
    tr.setMeta('updateSuggestions', updatedSuggestions);
    editor.view.dispatch(tr);
  };

  // Handle dismissing a suggestion
  const handleDismissSuggestion = () => {
    if (!editor) return;
    const pluginState = aiSuggestionPluginKey.getState(editor.state);
    if (!pluginState || pluginState.suggestions.length === 0) return;

    const activeSuggestion = pluginState.suggestions.find((s: AISuggestion) => s.status === 'pending');
    if (!activeSuggestion) return;

    const tr = editor.state.tr;
    const updatedSuggestions = pluginState.suggestions.filter((s: AISuggestion) => s.id !== activeSuggestion.id);
    tr.setMeta('updateSuggestions', updatedSuggestions);
    editor.view.dispatch(tr);
  };

  // Get active suggestion details
  const getActiveSuggestion = () => {
    if (!editor) return null;
    const pluginState = aiSuggestionPluginKey.getState(editor.state);
    if (!pluginState || pluginState.suggestions.length === 0) return null;
    return pluginState.suggestions.find((s: AISuggestion) => s.status === 'pending');
  };

  if (!editor) return null;

  const activeSuggestion = getActiveSuggestion();

  return (
    <>
      {/* AI Action Menu - shows when text is selected and no suggestion is active */}
      <BubbleMenu
        editor={editor}
        pluginKey="aiActionMenu"
        shouldShow={({ from, to, view }) => {
          // Don't show if no text selected or if there's an active suggestion
          if (from === to || hasActiveSuggestion()) return false;
          
          // Get the coordinates of the selection to check if it's near the top
          const coords = view.coordsAtPos(from);
          
          // If selection is within 300px of viewport top, don't show this menu
          // (it would appear behind the sticky header)
          return coords.top > 300;
        }}
        options={{
          placement: 'top',
          offset: 8,
        }}
      >
        <Card className="flex items-center gap-1 p-1 shadow-lg border" style={{ zIndex: 99999 }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAIAction('improve')}
                disabled={isLoading}
                data-testid="button-ai-improve"
              >
                {isLoading && currentAction === 'improve' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Improve</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAIAction('shorten')}
                disabled={isLoading}
                data-testid="button-ai-shorten"
              >
                {isLoading && currentAction === 'shorten' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Shorten</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAIAction('expand')}
                disabled={isLoading}
                data-testid="button-ai-expand"
              >
                {isLoading && currentAction === 'expand' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Expand</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAIAction('fix')}
                disabled={isLoading}
                data-testid="button-ai-fix"
              >
                {isLoading && currentAction === 'fix' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fix Grammar</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAIAction('ask')}
                disabled={isLoading}
                data-testid="button-ai-ask"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ask AI</TooltipContent>
          </Tooltip>
        </Card>
      </BubbleMenu>

      {/* AI Suggestion Popup - custom positioned near highlighted text */}
      {activeSuggestion && popupPosition && (
        <div
          className="fixed"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            zIndex: 99999
          }}
        >
          <Card className="max-w-md p-4 shadow-xl border">
            <div className="space-y-3">
              {/* Type badge */}
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                <Sparkles className="w-3 h-3" />
                {activeSuggestion.type.charAt(0).toUpperCase() + activeSuggestion.type.slice(1)} Suggestion
              </div>

              {/* Suggested text */}
              <div className="p-3 bg-purple-50 rounded text-sm text-purple-700 font-medium max-h-32 overflow-auto">
                {activeSuggestion.suggestedText}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismissSuggestion}
                  className="flex-1"
                  data-testid="button-ai-dismiss"
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptSuggestion}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  data-testid="button-ai-accept"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Ask AI Dialog */}
      <Dialog open={showAskDialog} onOpenChange={setShowAskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask AI to Edit Text</DialogTitle>
            <DialogDescription>
              Describe how you want the selected text to be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Selected text:</p>
              <p className="text-sm mt-1">{selectedTextForAsk}</p>
            </div>
            <Textarea
              placeholder="e.g., Make it more formal, Add more detail, Convert to bullet points..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomPromptSubmit} disabled={!customPrompt.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Apply Edit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}