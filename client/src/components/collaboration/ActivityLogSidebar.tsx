import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { 
  Clock, 
  Edit, 
  MessageSquare, 
  History, 
  Share2, 
  Shield,
  ChevronRight 
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  activityType: string;
  description: string;
  metadata?: any;
  createdAt: string;
}

interface ActivityLogSidebarProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityLogSidebar({ projectId, open, onOpenChange }: ActivityLogSidebarProps) {
  const { data, isLoading } = useQuery<{ activities: ActivityItem[] }>({
    queryKey: ['/api/collaboration/projects', projectId, 'activity'],
    enabled: open && !!projectId,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'edit':
        return <Edit className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'version':
        return <History className="h-4 w-4" />;
      case 'shared':
        return <Share2 className="h-4 w-4" />;
      case 'permission_changed':
        return <Shield className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getUserInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96" data-testid="activity-log-sidebar">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Log
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data?.activities && data.activities.length > 0 ? (
            <div className="space-y-4">
              {data.activities.map(activity => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 group"
                  data-testid={`activity-item-${activity.id}`}
                >
                  <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(activity.userName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{activity.userName}</span>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {getActivityIcon(activity.activityType)}
                          <span className="text-xs">{activity.activityType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-foreground mt-1">
                      {activity.description}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-activity-details-${activity.id}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mb-4 opacity-50" />
              <p>No activity yet</p>
              <p className="text-sm mt-2">
                Activity will appear here as you and others work on this project
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
