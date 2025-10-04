import { Editor, BubbleMenu } from '@tiptap/react';
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

  if (!editor) return null;

  return (
    <>
      {/* TipTap BubbleMenu - automatically positions near selection */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ 
          duration: 100,
          placement: 'top',
          animation: 'shift-away',
        }}
        shouldShow={({ editor, from, to }) => {
          // Only show when text is selected (not empty selection)
          if (from === to) return false;

          // Hide if there's already a pending AI suggestion
          const pluginState = aiSuggestionPluginKey.getState(editor.state);
          if (pluginState && pluginState.suggestions.some(s => s.status === 'pending')) {
            return false;
          }

          return true;
        }}
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
      </BubbleMenu>

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