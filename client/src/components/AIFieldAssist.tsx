import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Loader2, Wand2, Minimize2, Maximize2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AIFieldAssistProps {
  fieldName: string;
  fieldLabel: string;
  currentValue: string;
  characterContext: Record<string, any>;
  onGenerated: (newValue: string) => void;
}

type AIAction = 'generate' | 'improve' | 'expand' | 'custom';

export default function AIFieldAssist({
  fieldName,
  fieldLabel,
  currentValue,
  characterContext,
  onGenerated
}: AIFieldAssistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const { toast } = useToast();

  const handleAction = async (action: AIAction) => {
    setSelectedAction(action);

    // For custom action, show the prompt input
    if (action === 'custom') {
      return;
    }

    await executeAIAction(action, '');
  };

  const handleCustomSubmit = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a custom prompt.",
        variant: "destructive",
      });
      return;
    }

    await executeAIAction('custom', customPrompt);
  };

  const executeAIAction = async (action: AIAction, prompt: string) => {
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/ai/generate-field', {
        fieldName,
        fieldLabel,
        action,
        customPrompt: prompt,
        currentValue,
        characterContext,
      });

      const { generatedText } = await response.json();

      // Update the field with generated content
      onGenerated(generatedText);

      toast({
        title: "Content Generated",
        description: `Successfully ${action === 'generate' ? 'generated' : action === 'improve' ? 'improved' : 'expanded'} ${fieldLabel.toLowerCase()}.`,
      });

      // Close dialog
      setIsOpen(false);
      setSelectedAction(null);
      setCustomPrompt('');
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasContent = currentValue && currentValue.trim().length > 0;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setIsOpen(true)}
            data-testid={`button-ai-assist-${fieldName}`}
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>AI Assist</TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI Assist: {fieldLabel}</DialogTitle>
            <DialogDescription>
              {hasContent 
                ? 'Choose how to improve this field using AI'
                : 'Generate content for this field using AI'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedAction === 'custom' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Custom Instruction</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="E.g., Make it more dramatic, Add more details about their childhood, etc."
                  className="mt-2"
                  rows={4}
                  data-testid="textarea-custom-prompt"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAction(null);
                    setCustomPrompt('');
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleCustomSubmit}
                  disabled={isLoading}
                  data-testid="button-submit-custom"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-2">
              {!hasContent && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('generate')}
                  disabled={isLoading}
                  data-testid="button-generate"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isLoading && selectedAction === 'generate' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    `Generate ${fieldLabel}`
                  )}
                </Button>
              )}

              {hasContent && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAction('improve')}
                    disabled={isLoading}
                    data-testid="button-improve"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isLoading && selectedAction === 'improve' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Improving...
                      </>
                    ) : (
                      'Improve'
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAction('expand')}
                    disabled={isLoading}
                    data-testid="button-expand"
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    {isLoading && selectedAction === 'expand' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Expanding...
                      </>
                    ) : (
                      'Expand (add more detail)'
                    )}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAction('custom')}
                disabled={isLoading}
                data-testid="button-custom"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Custom Instruction
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
