import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Users, Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { CollaborationState } from '@/hooks/useCollaboration';

interface CollaborationIndicatorProps {
  state: CollaborationState;
}

export function CollaborationIndicator({ state }: CollaborationIndicatorProps) {
  const { activeUsers, connectionStatus } = state;

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'connected':
        return <Wifi className="h-3 w-3" />;
      case 'disconnected':
      case 'error':
        return <WifiOff className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (connectionStatus === 'disconnected') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Connection status indicator */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="gap-1.5 px-2 py-1"
            data-testid="badge-connection-status"
          >
            <span className={`h-2 w-2 rounded-full ${getConnectionColor()}`} />
            {getConnectionIcon()}
            <span className="text-xs">
              {connectionStatus === 'connected' && 'Live'}
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'error' && 'Error'}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Real-time collaboration {connectionStatus}</p>
        </TooltipContent>
      </Tooltip>

      {/* Active users */}
      {activeUsers.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="flex items-center gap-1"
              data-testid="div-active-collaborators"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 3).map((user) => (
                  <Avatar 
                    key={user.id} 
                    className="h-6 w-6 border-2 border-background"
                    data-testid={`avatar-user-${user.id}`}
                  >
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {activeUsers.length > 3 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                    +{activeUsers.length - 3}
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold text-sm">Currently editing:</p>
              {activeUsers.map((user) => (
                <p key={user.id} className="text-xs">
                  {user.firstName} {user.lastName} ({user.email})
                </p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
