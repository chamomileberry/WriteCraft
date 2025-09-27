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
      entityId: 'writing-assistant', // Stable entityId for proper duplicate detection
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
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              width: '3.5rem',
              height: '3.5rem',
              zIndex: 50,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(270, 75%, 75%) 0%, hsl(255, 69%, 71%) 100%)',
              color: 'white',
              border: 'none'
            }}
            className={`
              shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl
              hover:bg-primary/90
              ${isHovered ? 'animate-pulse' : ''}
            `}
            data-testid="button-writing-assistant-trigger"
          >
            <Sparkles className={`w-6 h-6 text-primary-foreground transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-primary text-primary-foreground border-0">
          <p className="font-medium">Writing Assistant</p>
          <p className="text-xs opacity-90">AI-powered writing help</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}