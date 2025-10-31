import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Share2, X, Search, Users } from "lucide-react";

interface ShareDialogProps {
  resourceType: "notebook" | "project" | "guide";
  resourceId: string;
  resourceName?: string;
  ownerId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ShareData {
  id: string;
  userId: string;
  ownerId: string;
  permission: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

interface UserSearchResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export function ShareDialog({ 
  resourceType, 
  resourceId, 
  resourceName,
  ownerId, 
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: ShareDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPermission, setSelectedPermission] = useState<"view" | "comment" | "edit">("view");
  const { toast } = useToast();

  const { data: shares = [], isLoading: sharesLoading } = useQuery<ShareData[]>({
    queryKey: ["/api/shares", resourceType, resourceId],
    queryFn: async () => {
      const params = new URLSearchParams({
        resourceType,
        resourceId,
      });
      return await fetch(`/api/shares?${params}`).then(r => r.json());
    },
    enabled: open,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<UserSearchResult[]>({
    queryKey: ["/api/auth/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const params = new URLSearchParams({ q: searchQuery });
      return await fetch(`/api/auth/users/search?${params}`).then(r => r.json());
    },
    enabled: open && searchQuery.length >= 2,
  });

  const createShareMutation = useMutation({
    mutationFn: async (data: { userId: string; permission: string }) => {
      return await apiRequest("POST", `/api/shares`, {
        resourceType,
        resourceId,
        userId: data.userId,
        ownerId,
        permission: data.permission,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shares", resourceType, resourceId] });
      setSearchQuery("");
      setSelectedUserId("");
      setSelectedPermission("view");
      toast({
        title: "Success",
        description: "Resource shared successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to share resource",
        variant: "destructive",
      });
    },
  });

  const deleteShareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      return await apiRequest("DELETE", `/api/shares/${shareId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shares", resourceType, resourceId] });
      toast({
        title: "Success",
        description: "Access removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove access",
        variant: "destructive",
      });
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async (data: { shareId: string; permission: string }) => {
      return await apiRequest("PATCH", `/api/shares/${data.shareId}/permission`, {
        permission: data.permission,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shares", resourceType, resourceId] });
      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update permission",
        variant: "destructive",
      });
    },
  });

  const handleShare = (userId?: string) => {
    const userIdToShare = userId || selectedUserId;
    
    if (!userIdToShare || !selectedPermission) {
      toast({
        title: "Error",
        description: "Please select a user and permission level",
        variant: "destructive",
      });
      return;
    }

    createShareMutation.mutate({
      userId: userIdToShare,
      permission: selectedPermission,
    });
  };

  const getUserInitials = (user: { firstName: string | null; lastName: string | null; email: string }) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getUserName = (user: { firstName: string | null; lastName: string | null; email: string }) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-share">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share {resourceType}</DialogTitle>
          <DialogDescription>
            Give others access to view, comment on, or edit this {resourceType}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Add people</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-user-search"
                />
              </div>
              <Select value={selectedPermission} onValueChange={(v) => setSelectedPermission(v as any)}>
                <SelectTrigger className="w-32" data-testid="select-permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchQuery.length >= 2 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {usersLoading ? (
                  <div className="p-3 text-sm text-muted-foreground">Searching...</div>
                ) : users.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No users found</div>
                ) : (
                  users
                    .filter(u => u.id !== ownerId && !shares.some(s => s.userId === u.id))
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleShare(user.id)}
                        className="w-full flex items-center gap-3 p-2 hover-elevate active-elevate-2"
                        data-testid={`user-option-${user.id}`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.profileImageUrl || undefined} />
                          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{getUserName(user)}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </button>
                    ))
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>People with access</span>
            </div>
            
            {sharesLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : shares.length === 0 ? (
              <div className="text-sm text-muted-foreground">No collaborators yet</div>
            ) : (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center gap-3 p-2 rounded-md border"
                    data-testid={`share-${share.id}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={share.user.profileImageUrl || undefined} />
                      <AvatarFallback>{getUserInitials(share.user)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{getUserName(share.user)}</div>
                      <div className="text-xs text-muted-foreground">{share.user.email}</div>
                    </div>
                    <Select
                      value={share.permission}
                      onValueChange={(v) => updatePermissionMutation.mutate({ shareId: share.id, permission: v })}
                    >
                      <SelectTrigger className="w-28" data-testid={`select-permission-${share.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="comment">Comment</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteShareMutation.mutate(share.id)}
                      data-testid={`button-remove-${share.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
