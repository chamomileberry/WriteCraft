import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export default function WritingAssistantTrigger() {
  const [isHovered, setIsHovered] = useState(false);
  const { addPanel } = useWorkspaceStore();

  const handleClick = () => {
    // Calculate safe position within viewport
    const panelWidth = 400;
    const panelHeight = 600;
    const safeX = Math.max(20, Math.min(window.innerWidth - panelWidth - 20, window.innerWidth - 450));
    const safeY = Math.max(20, Math.min(window.innerHeight - panelHeight - 20, 100));
    
    addPanel({
      id: `writing-assistant-${Date.now()}`,
      type: 'writingAssistant',
      title: 'Writing Assistant',
      mode: 'floating',
      regionId: 'floating',
      position: { x: safeX, y: safeY },
      size: { width: panelWidth, height: panelHeight },
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