import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2, Minimize2, Maximize2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
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
  const { toast } = useToast();

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
        shouldShow={({ from, to }) => {
          return from !== to && !hasActiveSuggestion();
        }}
        options={{
          placement: 'top',
          offset: 8,
        }}
      >
        <Card className="flex items-center gap-1 p-1 shadow-lg border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAIAction('improve')}
            disabled={isLoading}
            data-testid="button-ai-improve"
          >
            {isLoading && currentAction === 'improve' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span className="ml-1">Improve</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAIAction('shorten')}
            disabled={isLoading}
            data-testid="button-ai-shorten"
          >
            {isLoading && currentAction === 'shorten' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
            <span className="ml-1">Shorten</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAIAction('expand')}
            disabled={isLoading}
            data-testid="button-ai-expand"
          >
            {isLoading && currentAction === 'expand' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
            <span className="ml-1">Expand</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAIAction('fix')}
            disabled={isLoading}
            data-testid="button-ai-fix"
          >
            {isLoading && currentAction === 'fix' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span className="ml-1">Fix Grammar</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAIAction('ask')}
            disabled={isLoading}
            data-testid="button-ai-ask"
          >
            <Sparkles className="w-4 h-4" />
            <span className="ml-1">Ask AI</span>
          </Button>
        </Card>
      </BubbleMenu>

      {/* AI Suggestion Popup - shows when there's an active suggestion */}
      {activeSuggestion && (
        <BubbleMenu
          editor={editor}
          pluginKey="aiSuggestionPopup"
          shouldShow={() => !!hasActiveSuggestion()}
          options={{
            placement: 'bottom',
            offset: 8,
          }}
        >
          <Card className="max-w-md p-4 shadow-xl border">
            <div className="space-y-3">
              {/* Type badge */}
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                <Sparkles className="w-3 h-3" />
                {activeSuggestion.type.charAt(0).toUpperCase() + activeSuggestion.type.slice(1)} Suggestion
              </div>

              {/* Original text */}
              <div className="p-2 bg-gray-50 rounded text-sm text-gray-600 max-h-20 overflow-auto">
                {activeSuggestion.originalText}
              </div>

              {/* Arrow */}
              <div className="text-center text-purple-600">↓</div>

              {/* Suggested text */}
              <div className="p-2 bg-purple-50 rounded text-sm text-purple-700 font-medium max-h-20 overflow-auto">
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
        </BubbleMenu>
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