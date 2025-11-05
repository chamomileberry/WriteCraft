import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Edit,
  MessageSquare,
  History,
  Share2,
  Shield,
  X,
} from "lucide-react";
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
  onClose: () => void;
}

export function ActivityLogSidebar({
  projectId,
  onClose,
}: ActivityLogSidebarProps) {
  const { data, isLoading } = useQuery<{ activities: ActivityItem[] }>({
    queryKey: ["/api/collaboration/projects", projectId, "activity"],
    enabled: !!projectId,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "edit":
        return <Edit className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "version":
        return <History className="h-4 w-4" />;
      case "shared":
        return <Share2 className="h-4 w-4" />;
      case "permission_changed":
        return <Shield className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getUserInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col"
      data-testid="activity-log-sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Activity Log</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-activity"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
            {data.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover-elevate"
                data-testid={`activity-item-${activity.id}`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={activity.userAvatar}
                    alt={activity.userName}
                  />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(activity.userName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {activity.userName}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getActivityIcon(activity.activityType)}
                        <span className="text-xs capitalize">
                          {activity.activityType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-foreground mt-1">
                    {activity.description}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-50" />
            <p className="font-medium">No activity yet</p>
            <p className="text-sm mt-2">
              Activity will appear here as you and others work on this project
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Real-time activity updates every 10 seconds
        </p>
      </div>
    </div>
  );
}
