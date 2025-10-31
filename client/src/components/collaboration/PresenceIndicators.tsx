import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users } from "lucide-react";

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
}

interface PresenceIndicatorsProps {
  activeUsers: ActiveUser[];
  currentUserId: string;
}

export function PresenceIndicators({ activeUsers, currentUserId }: PresenceIndicatorsProps) {
  // Filter out current user
  const otherUsers = activeUsers.filter(user => user.id !== currentUserId);

  if (otherUsers.length === 0) {
    return null;
  }

  // Assign colors to users based on their ID
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
    <div className="flex items-center gap-2" data-testid="presence-indicators">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{otherUsers.length + 1} editing</span>
      </div>
      
      <div className="flex items-center -space-x-2">
        {otherUsers.slice(0, 5).map(user => {
          const colorClass = getUserColor(user.id);
          return (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div 
                  className={`relative ring-2 ring-background rounded-full ${colorClass}`}
                  data-testid={`presence-avatar-${user.id}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl} alt={getUserName(user)} />
                    <AvatarFallback className="text-xs bg-transparent text-white">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getUserName(user)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {otherUsers.length > 5 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted ring-2 ring-background text-xs text-muted-foreground">
                +{otherUsers.length - 5}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {otherUsers.slice(5).map(user => (
                  <p key={user.id}>{getUserName(user)}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
