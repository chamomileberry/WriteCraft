import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, AlertCircle, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface PendingChange {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  changeType: string;
  position: number;
  originalContent?: string;
  proposedContent?: string;
  description?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface PendingChangesProps {
  projectId: string;
  onClose: () => void;
}

export function PendingChanges({ projectId, onClose }: PendingChangesProps) {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ changes: PendingChange[] }>({
    queryKey: ['/api/collaboration/projects', projectId, 'pending-changes'],
    enabled: !!projectId,
  });

  const reviewChangeMutation = useMutation({
    mutationFn: async ({ changeId, action }: { changeId: string; action: 'approve' | 'reject' }) => {
      return await apiRequest("POST", `/api/collaboration/projects/${projectId}/pending-changes/${changeId}/${action}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/projects', projectId, 'pending-changes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/projects', projectId, 'activity'] });
      toast({
        title: variables.action === 'approve' ? "Change approved" : "Change rejected",
        description: `The suggested change has been ${variables.action === 'approve' ? 'approved' : 'rejected'}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process change",
        variant: "destructive",
      });
    },
  });

  const getUserInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'insert':
        return 'Addition';
      case 'delete':
        return 'Deletion';
      case 'replace':
        return 'Replacement';
      case 'format':
        return 'Formatting';
      default:
        return type;
    }
  };

  const getChangeTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'insert':
        return 'default';
      case 'delete':
        return 'destructive';
      case 'replace':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col" data-testid="pending-changes-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Pending Changes</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-pending-changes"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse rounded-lg border p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-16 bg-muted rounded mb-2" />
                <div className="h-8 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : data?.changes && data.changes.length > 0 ? (
          <div className="space-y-4">
            {data.changes.map(change => (
              <div
                key={change.id}
                className="rounded-lg border border-border p-4"
                data-testid={`pending-change-${change.id}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={change.userAvatar} alt={change.userName} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(change.userName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{change.userName}</span>
                      <Badge variant={getChangeTypeBadgeVariant(change.changeType)} className="text-xs">
                        {getChangeTypeLabel(change.changeType)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(change.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {change.description && (
                  <p className="text-sm text-muted-foreground mb-3">{change.description}</p>
                )}

                <div className="space-y-2 mb-3">
                  {change.originalContent && (
                    <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm">
                      <span className="text-xs text-destructive font-medium">Original:</span>
                      <p className="mt-1 line-clamp-2">{change.originalContent}</p>
                    </div>
                  )}

                  {change.proposedContent && (
                    <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Proposed:</span>
                      <p className="mt-1 line-clamp-2">{change.proposedContent}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => reviewChangeMutation.mutate({ changeId: change.id, action: 'approve' })}
                    disabled={reviewChangeMutation.isPending}
                    data-testid={`button-approve-${change.id}`}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => reviewChangeMutation.mutate({ changeId: change.id, action: 'reject' })}
                    disabled={reviewChangeMutation.isPending}
                    data-testid={`button-reject-${change.id}`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="font-medium">No pending changes</p>
            <p className="text-sm mt-2">
              Suggested changes from collaborators will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Changes from users with Comment permission
        </p>
      </div>
    </div>
  );
}
