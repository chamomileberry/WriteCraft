import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Predefined colors for user indicators
const USER_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-teal-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-cyan-500",
];

interface ActiveUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  color?: string;
}

interface ActiveUsersSidebarProps {
  projectId: string;
  currentUserId: string;
  onClose: () => void;
}

export function ActiveUsersSidebar({ projectId, currentUserId, onClose }: ActiveUsersSidebarProps) {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    // Mock WebSocket connection for active users
    // In a real implementation, this would connect to the collaboration WebSocket
    const mockUsers: ActiveUser[] = [];
    
    // Add current user
    if (user && user.id) {
      mockUsers.push({
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
      });
    }

    setActiveUsers(mockUsers);
    setIsConnecting(false);

    return () => {
      // Cleanup WebSocket connection
    };
  }, [projectId, user]);

  const getUserColor = (userId: string) => {
    const index = Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % USER_COLORS.length;
    return USER_COLORS[index];
  };

  const getUserName = (user: ActiveUser) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  const getUserInitials = (user: ActiveUser) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  return (
    <div className="h-full flex flex-col bg-background border-l" data-testid="active-users-sidebar">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Users ({activeUsers.length})
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-users">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isConnecting ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeUsers.length > 0 ? (
          <div className="space-y-3">
            {activeUsers.map(activeUser => {
              const colorClass = getUserColor(activeUser.id);
              const isCurrentUser = activeUser.id === currentUserId;
              
              return (
                <div 
                  key={activeUser.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`user-item-${activeUser.id}`}
                >
                  <div className={`relative ring-2 ring-background rounded-full ${colorClass}`}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={activeUser.profileImageUrl} alt={getUserName(activeUser)} />
                      <AvatarFallback className="text-sm bg-transparent text-white">
                        {getUserInitials(activeUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {getUserName(activeUser)}
                      {isCurrentUser && <span className="text-muted-foreground ml-2">(You)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{activeUser.email}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No other users currently editing</p>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Real-time collaboration powered by Y.js CRDT
        </p>
      </div>
    </div>
  );
}
