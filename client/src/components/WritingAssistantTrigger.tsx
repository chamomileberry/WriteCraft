import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export default function WritingAssistantTrigger() {
  const [isHovered, setIsHovered] = useState(false);
  const { addPanel } = useWorkspaceStore();

  const handleClick = () => {
    addPanel({
      id: `writing-assistant-${Date.now()}`,
      type: 'writingAssistant',
      title: 'Writing Assistant',
      mode: 'floating',
      regionId: 'floating',
      position: { x: window.innerWidth - 450, y: 100 },
      size: { width: 400, height: 600 },
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg
              bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
              border-0 transition-all duration-300 hover:scale-110 hover:shadow-xl
              ${isHovered ? 'animate-pulse' : ''}
            `}
            data-testid="button-writing-assistant-trigger"
          >
            <Sparkles className={`w-6 h-6 text-white transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <p className="font-medium">Writing Assistant</p>
          <p className="text-xs opacity-90">AI-powered writing help</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}