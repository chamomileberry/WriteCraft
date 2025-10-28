import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  Settings as SettingsIcon,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Edit,
  Eye,
  MessageSquare,
  BarChart3,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import Header from '@/components/Header';
import { useLocation } from 'wouter';

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  status: string;
  createdAt: string;
  inviter: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface TeamActivity {
  id: string;
  activityType: string;
  resourceType: string | null;
  resourceId: string | null;
  resourceName: string | null;
  metadata: any;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export default function TeamManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [canEdit, setCanEdit] = useState(true);
  const [canComment, setCanComment] = useState(true);
  const [canInvite, setCanInvite] = useState(false);

  // Fetch team members
  const { data: members = [], isLoading: loadingMembers } = useQuery<TeamMember[]>({
    queryKey: ['/api/team/members'],
  });

  // Fetch pending invitations
  const { data: invitations = [], isLoading: loadingInvitations } = useQuery<TeamInvitation[]>({
    queryKey: ['/api/team/invitations'],
  });

  // Fetch team activity
  const { data: activity = [], isLoading: loadingActivity } = useQuery<TeamActivity[]>({
    queryKey: ['/api/team/activity'],
  });

  // Fetch team usage
  const { data: usageData } = useQuery<{ usage: number }>({
    queryKey: ['/api/team/usage'],
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: 'admin' | 'member'; canEdit: boolean; canComment: boolean; canInvite: boolean }) => {
      return await apiRequest('POST', '/api/team/invite', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team/invitations'] });
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${inviteEmail}`,
      });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      setCanEdit(true);
      setCanComment(true);
      setCanInvite(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('DELETE', `/api/team/members/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team/activity'] });
      toast({
        title: 'Member removed',
        description: 'The team member has been removed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
    },
  });

  // Update member role mutation
  const updateMemberMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string; canEdit: boolean; canComment: boolean; canInvite: boolean }) => {
      return await apiRequest('PATCH', `/api/team/members/${data.userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team/activity'] });
      toast({
        title: 'Member updated',
        description: 'Member role and permissions updated successfully',
      });
      setEditMemberDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update member',
        variant: 'destructive',
      });
    },
  });

  // Revoke invitation mutation
  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return await apiRequest('DELETE', `/api/team/invitations/${invitationId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team/invitations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team/activity'] });
      toast({
        title: 'Invitation revoked',
        description: 'The invitation has been revoked successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke invitation',
        variant: 'destructive',
      });
    },
  });

  const handleInviteMember = () => {
    if (!inviteEmail) return;
    
    inviteMutation.mutate({
      email: inviteEmail,
      role: inviteRole,
      canEdit,
      canComment,
      canInvite,
    });
  };

  const handleUpdateMember = () => {
    if (!selectedMember) return;
    
    updateMemberMutation.mutate({
      userId: selectedMember.userId,
      role: inviteRole,
      canEdit,
      canComment,
      canInvite,
    });
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setInviteRole(member.role as 'admin' | 'member');
    setCanEdit(member.canEdit);
    setCanComment(member.canComment);
    setCanInvite(member.canInvite);
    setEditMemberDialogOpen(true);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined':
        return <UserPlus className="h-4 w-4" />;
      case 'member_removed':
        return <Trash2 className="h-4 w-4" />;
      case 'role_changed':
        return <Shield className="h-4 w-4" />;
      case 'member_invited':
        return <Mail className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityMessage = (activity: TeamActivity) => {
    const userName = activity.user.firstName || activity.user.email;
    
    switch (activity.activityType) {
      case 'member_joined':
        return `${userName} joined the team`;
      case 'member_removed':
        return `${userName} removed a team member`;
      case 'role_changed':
        return `${userName} changed a member's role`;
      case 'member_invited':
        return `${userName} invited ${activity.metadata?.email} to the team`;
      case 'invitation_revoked':
        return `${userName} revoked an invitation`;
      case 'content_created':
        return `${userName} created ${activity.resourceType}: ${activity.resourceName}`;
      case 'content_edited':
        return `${userName} edited ${activity.resourceType}: ${activity.resourceName}`;
      default:
        return `${userName} performed an action`;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (view: string) => {
    if (view === 'notebook') {
      setLocation('/notebook');
    } else if (view === 'projects') {
      setLocation('/projects');
    } else if (view === 'generators') {
      setLocation('/generators');
    } else if (view === 'guides') {
      setLocation('/guides');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Team Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your team members, invitations, and collaboration settings
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/team/analytics')}
                data-testid="button-view-analytics"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/team/audit-logs')}
                data-testid="button-view-audit-logs"
              >
                <FileText className="h-4 w-4 mr-2" />
                Audit Logs
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members" data-testid="tab-members">
              <Users className="h-4 w-4 mr-2" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="invitations" data-testid="tab-invitations">
              <Mail className="h-4 w-4 mr-2" />
              Invitations ({invitations.length})
            </TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">
              <Clock className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage roles and permissions for your team</CardDescription>
                  </div>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-invite-member">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join your team
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="teammate@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            data-testid="input-invite-email"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)}>
                            <SelectTrigger id="role" data-testid="select-invite-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label>Permissions</Label>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Edit className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Can edit content</span>
                            </div>
                            <Switch checked={canEdit} onCheckedChange={setCanEdit} data-testid="switch-can-edit" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Can comment</span>
                            </div>
                            <Switch checked={canComment} onCheckedChange={setCanComment} data-testid="switch-can-comment" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Can invite members</span>
                            </div>
                            <Switch checked={canInvite} onCheckedChange={setCanInvite} data-testid="switch-can-invite" />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleInviteMember}
                          disabled={!inviteEmail || inviteMutation.isPending}
                          data-testid="button-send-invitation"
                        >
                          {inviteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Send Invitation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No team members yet. Invite someone to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => {
                      const initials = `${member.user.firstName?.[0] || ''}${member.user.lastName?.[0] || ''}`.toUpperCase() || member.user.email[0].toUpperCase();
                      
                      return (
                        <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={member.user.profileImageUrl || undefined} />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {member.user.firstName && member.user.lastName 
                                  ? `${member.user.firstName} ${member.user.lastName}`
                                  : member.user.email
                                }
                              </div>
                              <div className="text-sm text-muted-foreground">{member.user.email}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                  {member.role}
                                </Badge>
                                {member.canEdit && <Badge variant="outline"><Edit className="h-3 w-3 mr-1" />Edit</Badge>}
                                {member.canComment && <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1" />Comment</Badge>}
                                {member.canInvite && <Badge variant="outline"><UserPlus className="h-3 w-3 mr-1" />Invite</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(member)}
                              data-testid={`button-edit-member-${member.userId}`}
                            >
                              <SettingsIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to remove this member?')) {
                                  removeMemberMutation.mutate(member.userId);
                                }
                              }}
                              disabled={removeMemberMutation.isPending}
                              data-testid={`button-remove-member-${member.userId}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Usage Card */}
            {usageData && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Usage</CardTitle>
                  <CardDescription>Combined AI generation usage for all team members today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {usageData.usage} <span className="text-base font-normal text-muted-foreground">generations</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Manage invitations sent to potential team members</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingInvitations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending invitations
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{invitation.email}</div>
                            <div className="text-sm text-muted-foreground">
                              Invited {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{invitation.role}</Badge>
                              {invitation.canEdit && <Badge variant="outline"><Edit className="h-3 w-3 mr-1" />Edit</Badge>}
                              {invitation.canComment && <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1" />Comment</Badge>}
                              {invitation.canInvite && <Badge variant="outline"><UserPlus className="h-3 w-3 mr-1" />Invite</Badge>}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to revoke this invitation?')) {
                              revokeInvitationMutation.mutate(invitation.id);
                            }
                          }}
                          disabled={revokeInvitationMutation.isPending}
                          data-testid={`button-revoke-invitation-${invitation.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Activity Feed</CardTitle>
                <CardDescription>Recent actions by team members</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingActivity ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.map((item) => {
                      const initials = `${item.user.firstName?.[0] || ''}${item.user.lastName?.[0] || ''}`.toUpperCase() || item.user.email[0].toUpperCase();
                      
                      return (
                        <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.user.profileImageUrl || undefined} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getActivityIcon(item.activityType)}
                              <span className="text-sm">{getActivityMessage(item)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={editMemberDialogOpen} onOpenChange={setEditMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update role and permissions for this team member
            </DialogDescription>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Avatar>
                  <AvatarImage src={selectedMember.user.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {`${selectedMember.user.firstName?.[0] || ''}${selectedMember.user.lastName?.[0] || ''}`.toUpperCase() || selectedMember.user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedMember.user.firstName && selectedMember.user.lastName 
                      ? `${selectedMember.user.firstName} ${selectedMember.user.lastName}`
                      : selectedMember.user.email
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">{selectedMember.user.email}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)}>
                  <SelectTrigger id="edit-role" data-testid="select-edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Can edit content</span>
                  </div>
                  <Switch checked={canEdit} onCheckedChange={setCanEdit} data-testid="switch-edit-can-edit" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Can comment</span>
                  </div>
                  <Switch checked={canComment} onCheckedChange={setCanComment} data-testid="switch-edit-can-comment" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Can invite members</span>
                  </div>
                  <Switch checked={canInvite} onCheckedChange={setCanInvite} data-testid="switch-edit-can-invite" />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={handleUpdateMember}
              disabled={updateMemberMutation.isPending}
              data-testid="button-update-member"
            >
              {updateMemberMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
