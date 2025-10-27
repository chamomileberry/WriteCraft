import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, LogOut, User, Download } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { MFASettings } from "@/components/MFASettings";
import { BillingSettings } from "@/components/BillingSettings";
import { PauseResumeSubscription } from "@/components/PauseResumeSubscription";
import { PaymentMethods } from "@/components/PaymentMethods";
import { InvoiceHistory } from "@/components/InvoiceHistory";
import { APIKeysSettings } from "@/components/APIKeysSettings";
import { AIPreferencesSettings } from "@/components/AIPreferencesSettings";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { BookOpen, Trash2 } from "lucide-react";
import { AccountDeletionDialog } from "@/components/AccountDeletionDialog";

export default function AccountSettings() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAccountDeletion, setShowAccountDeletion] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state with user prop changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setProfileImageUrl(user.profileImageUrl || "");
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; profileImageUrl?: string }) => {
      // Fetch CSRF token first
      const csrfResponse = await fetch('/api/auth/csrf-token', {
        credentials: 'include',
      });
      const { csrfToken } = await csrfResponse.json();
      
      // Make the update request with CSRF token
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
      
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate({ firstName, lastName, profileImageUrl });
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setProfileImageUrl(user?.profileImageUrl || "");
    setIsEditing(false);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleRestartOnboarding = async () => {
    try {
      await apiRequest('PATCH', '/api/user/preferences', {
        onboardingCompleted: false,
        onboardingStep: 0
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
      setShowOnboarding(true);
      toast({
        title: "Onboarding restarted",
        description: "The onboarding wizard will guide you through the platform features.",
      });
    } catch (error) {
      console.error('Failed to restart onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to restart onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/export/user-data', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `writecraft-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: "Your data has been downloaded to your device.",
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiRequest(`/api/users/${user?.id}`, 'DELETE', {});
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted. You will be logged out.',
      });

      // Log out after a short delay
      setTimeout(() => {
        window.location.href = '/api/auth/logout';
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      });
      setIsDeleting(false);
      setShowAccountDeletion(false);
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <MFASettings />

          {/* API Keys */}
          <APIKeysSettings />

          {/* AI Preferences */}
          <AIPreferencesSettings />

          {/* Onboarding */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding</CardTitle>
              <CardDescription>
                Take a guided tour of WriteCraft's features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Want a refresher on how to use WriteCraft? Restart the onboarding wizard to learn about our tools, generators, and organizational features.
              </p>
              <Button onClick={handleRestartOnboarding} data-testid="button-restart-onboarding">
                <BookOpen className="w-4 h-4 mr-2" />
                Restart Onboarding Tour
              </Button>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>
                Download all your WriteCraft data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Export all your characters, plots, projects, notebooks, guides, timelines, and other content as a JSON file. This includes all data across all your notebooks.
              </p>
              <Button 
                onClick={handleExportData} 
                disabled={isExporting}
                data-testid="button-export-data"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Billing & Subscription */}
          <BillingSettings />

          {/* Pause/Resume Subscription */}
          <PauseResumeSubscription />

          {/* Payment Methods */}
          <PaymentMethods />

          {/* Invoice History */}
          <InvoiceHistory />

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileImageUrl || user.profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <ImageUpload
                    value={profileImageUrl}
                    onChange={setProfileImageUrl}
                    accept="image/jpeg,image/png,image/webp"
                    maxFileSize={5}
                    disabled={updateProfileMutation.isPending}
                    className="max-w-md"
                    visibility="public"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a photo to personalize your profile. Max size: 5MB
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    data-testid="input-email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed as it's linked to your authentication provider
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account and session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone - Account Deletion */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
                <li>All characters, locations, and plot points</li>
                <li>All projects and timelines</li>
                <li>All notes and notebooks</li>
                <li>AI conversation history</li>
                <li>Active subscription (if any)</li>
              </ul>
              <Button
                variant="destructive"
                onClick={() => setShowAccountDeletion(true)}
                data-testid="button-delete-account"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          userId={user.id}
        />
      )}

      <AccountDeletionDialog
        open={showAccountDeletion}
        onOpenChange={setShowAccountDeletion}
        onConfirm={handleDeleteAccount}
        isPending={isDeleting}
        onExportData={handleExportData}
      />
    </div>
  );
}
