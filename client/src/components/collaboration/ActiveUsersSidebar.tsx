import { useState, useEffect } from "react";
import { X, Users, UserPlus, Mail, Shield, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface ActiveUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface ShareData {
  id: string;
  userId: string;
  ownerId: string;
  permission: "view" | "comment" | "edit";
  resourceType: string;
  resourceId: string;
  createdAt: string;
  user: ActiveUser;
}

interface ActiveUsersSidebarProps {
  projectId: string;
  currentUserId: string;
  onClose: () => void;
}

export function ActiveUsersSidebar({
  projectId,
  currentUserId,
  onClose,
}: ActiveUsersSidebarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<
    "view" | "comment" | "edit"
  >("comment");
  const [isInviting, setIsInviting] = useState(false);

  // Fetch project shares
  const { data: shares = [], isLoading } = useQuery<ShareData[]>({
    queryKey: ["/api/shares", projectId],
    queryFn: async () => {
      const response = await fetch(
        `/api/shares?resourceType=project&resourceId=${projectId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch shares");
      return response.json();
    },
  });

  // Check if current user is the owner
  const isOwner =
    shares.length > 0 ? shares[0]?.ownerId === currentUserId : true;

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // First, search for the user by email
      const searchResponse = await fetch(
        `/api/users/search?email=${encodeURIComponent(inviteEmail)}`,
      );

      if (!searchResponse.ok) {
        if (searchResponse.status === 404) {
          toast({
            title: "User not found",
            description:
              "No user exists with this email address. They need to sign up first.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to search for user");
      }

      const foundUser = await searchResponse.json();

      // Create the share
      await apiRequest("POST", "/api/shares", {
        resourceType: "project",
        resourceId: projectId,
        userId: foundUser.id,
        ownerId: currentUserId,
        permission: invitePermission,
      });

      // Invalidate and refetch shares
      queryClient.invalidateQueries({ queryKey: ["/api/shares", projectId] });

      toast({
        title: "User invited",
        description: `${foundUser.email} has been granted ${invitePermission} access.`,
      });

      setInviteEmail("");
      setShowInviteForm(false);
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Failed to invite user",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handlePermissionChange = async (
    shareId: string,
    newPermission: "view" | "comment" | "edit",
  ) => {
    try {
      await apiRequest("PATCH", `/api/shares/${shareId}/permission`, {
        permission: newPermission,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/shares", projectId] });

      toast({
        title: "Permission updated",
        description: `User permission changed to ${newPermission}.`,
      });
    } catch (error) {
      console.error("Error updating permission:", error);
      toast({
        title: "Failed to update permission",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRemoveUser = async (shareId: string, userEmail: string) => {
    try {
      await apiRequest("DELETE", `/api/shares/${shareId}`);

      queryClient.invalidateQueries({ queryKey: ["/api/shares", projectId] });

      toast({
        title: "User removed",
        description: `${userEmail} no longer has access to this project.`,
      });
    } catch (error) {
      console.error("Error removing user:", error);
      toast({
        title: "Failed to remove user",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (
    user:
      | ActiveUser
      | { email: string; firstName?: string | null; lastName?: string | null },
  ) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case "view":
        return "Can View";
      case "comment":
        return "Can Comment";
      case "edit":
        return "Can Edit";
      default:
        return permission;
    }
  };

  const getPermissionDescription = (permission: string) => {
    switch (permission) {
      case "view":
        return "Can only read the content";
      case "comment":
        return "Can suggest changes for review";
      case "edit":
        return "Can edit directly without approval";
      default:
        return "";
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Collaboration</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-users-sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Owner Section */}
        {user && user.email && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">
                Project Owner
              </Label>
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>
                  {getUserInitials({
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                  })}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                Owner
              </div>
            </div>
          </div>
        )}

        {/* Shared Users Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">
              Shared With ({shares.length})
            </Label>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInviteForm(!showInviteForm)}
                data-testid="button-invite-user"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Invite
              </Button>
            )}
          </div>

          {/* Invite Form */}
          {showInviteForm && isOwner && (
            <form
              onSubmit={handleInviteUser}
              className="p-4 rounded-lg border border-border bg-muted/30 space-y-3"
            >
              <div className="space-y-2">
                <Label htmlFor="invite-email" className="text-sm">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-9"
                    data-testid="input-invite-email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-permission" className="text-sm">
                  Permission Level
                </Label>
                <Select
                  value={invitePermission}
                  onValueChange={(value: any) => setInvitePermission(value)}
                >
                  <SelectTrigger
                    id="invite-permission"
                    data-testid="select-invite-permission"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">
                      <div>
                        <div className="font-medium">Can View</div>
                        <div className="text-xs text-muted-foreground">
                          Read-only access
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="comment">
                      <div>
                        <div className="font-medium">Can Comment</div>
                        <div className="text-xs text-muted-foreground">
                          Suggest changes for approval
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div>
                        <div className="font-medium">Can Edit</div>
                        <div className="text-xs text-muted-foreground">
                          Edit directly without approval
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isInviting}
                  data-testid="button-send-invite"
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {isInviting ? "Inviting..." : "Send Invite"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteEmail("");
                  }}
                  data-testid="button-cancel-invite"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Shared Users List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Loading shared users...
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No users shared yet
              </div>
            ) : (
              shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover-elevate"
                  data-testid={`share-item-${share.user.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={share.user.profileImageUrl} />
                    <AvatarFallback>
                      {getUserInitials(share.user)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {share.user.firstName || share.user.lastName
                        ? `${share.user.firstName || ""} ${share.user.lastName || ""}`.trim()
                        : share.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {share.user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <>
                        <Select
                          value={share.permission}
                          onValueChange={(value: any) =>
                            handlePermissionChange(share.id, value)
                          }
                        >
                          <SelectTrigger
                            className="h-8 w-32"
                            data-testid={`select-permission-${share.user.id}`}
                          >
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
                          onClick={() =>
                            handleRemoveUser(share.id, share.user.email)
                          }
                          data-testid={`button-remove-${share.user.id}`}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <div className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                        {getPermissionLabel(share.permission)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Permission Info */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <h3 className="text-sm font-medium">Permission Levels</h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">View:</span>{" "}
              Read-only access
            </div>
            <div>
              <span className="font-medium text-foreground">Comment:</span>{" "}
              Suggest changes that require your approval
            </div>
            <div>
              <span className="font-medium text-foreground">Edit:</span> Make
              changes directly without approval
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Real-time collaboration powered by Y.js CRDT
        </p>
      </div>
    </div>
  );
}
