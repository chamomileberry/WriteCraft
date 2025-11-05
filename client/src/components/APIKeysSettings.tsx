import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Key,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Crown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  monthlyRateLimit: number;
  requestsThisMonth: number;
  lastUsed: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface NewKeyResponse {
  key: string;
  apiKey: ApiKey;
}

export function APIKeysSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tier } = useSubscription();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState<"read" | "write" | "admin">(
    "read",
  );
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showNewKey, setShowNewKey] = useState(true);

  // Check if user has API access (Professional or Team tier)
  const hasApiAccess = tier === "professional" || tier === "team";

  // Fetch API keys
  const { data, isLoading } = useQuery<{ apiKeys: ApiKey[] }>({
    queryKey: ["/api/api-keys"],
    enabled: hasApiAccess,
  });

  const apiKeys = data?.apiKeys || [];

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (data: { name: string; scope: string }) => {
      const response = await apiRequest("POST", "/api/api-keys", data);
      return (await response.json()) as NewKeyResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setNewlyCreatedKey(data.key);
      setNewKeyName("");
      setNewKeyScope("read");
      toast({
        title: "API key created",
        description:
          "Your new API key has been created. Make sure to copy it now!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  // Revoke API key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      return await apiRequest("DELETE", `/api/api-keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "API key revoked",
        description: "The API key has been revoked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive",
      });
    },
  });

  // Rotate API key mutation
  const rotateKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/api-keys/${keyId}/rotate`,
      );
      return (await response.json()) as NewKeyResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setNewlyCreatedKey(data.key);
      setShowNewKey(true);
      toast({
        title: "API key rotated",
        description:
          "Your API key has been rotated. Make sure to copy the new key!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to rotate API key",
        variant: "destructive",
      });
    },
  });

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }
    createKeyMutation.mutate({ name: newKeyName, scope: newKeyScope });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleCloseNewKeyDialog = () => {
    setNewlyCreatedKey(null);
    setShowNewKey(true);
    setCopiedKey(false);
    setCreateDialogOpen(false);
  };

  // Show upgrade prompt for non-Professional users
  if (!hasApiAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Programmatically access your WriteCraft data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Crown className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold mb-2">Professional Feature</h3>
              <p className="text-sm text-muted-foreground mb-4">
                API access is available on Professional and Team plans. Upgrade
                to access the WriteCraft API and integrate your writing workflow
                with external tools.
              </p>
            </div>
            <Button variant="default" data-testid="button-upgrade-api">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Professional
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for programmatic access to your WriteCraft data
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-api-key">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Key
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-create-api-key">
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key to access the WriteCraft API
                    programmatically
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Name</Label>
                    <Input
                      id="key-name"
                      placeholder="Production Server"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      data-testid="input-api-key-name"
                    />
                    <p className="text-xs text-muted-foreground">
                      A descriptive name to identify this API key
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-scope">Permissions</Label>
                    <Select
                      value={newKeyScope}
                      onValueChange={(v) =>
                        setNewKeyScope(v as "read" | "write" | "admin")
                      }
                    >
                      <SelectTrigger
                        id="key-scope"
                        data-testid="select-api-key-scope"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">
                          Read Only - View data
                        </SelectItem>
                        <SelectItem value="write">
                          Read & Write - View and modify data
                        </SelectItem>
                        <SelectItem value="admin">
                          Admin - Full access including deletion
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose the level of access for this API key
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    data-testid="button-cancel-create-key"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateKey}
                    disabled={createKeyMutation.isPending}
                    data-testid="button-confirm-create-key"
                  >
                    {createKeyMutation.isPending ? "Creating..." : "Create Key"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No API keys yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <Card key={key.id} data-testid={`api-key-${key.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4
                            className="font-semibold truncate"
                            data-testid={`text-key-name-${key.id}`}
                          >
                            {key.name}
                          </h4>
                          <Badge
                            variant="secondary"
                            data-testid={`badge-key-scope-${key.id}`}
                          >
                            {key.scope}
                          </Badge>
                        </div>
                        <p
                          className="text-sm text-muted-foreground font-mono mb-2"
                          data-testid={`text-key-prefix-${key.id}`}
                        >
                          {key.prefix}••••••••••••••••••••••••••••••
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span data-testid={`text-key-usage-${key.id}`}>
                            {key.requestsThisMonth.toLocaleString()} /{" "}
                            {key.monthlyRateLimit.toLocaleString()} requests
                            this month
                          </span>
                          {key.lastUsed && (
                            <span data-testid={`text-key-last-used-${key.id}`}>
                              Last used:{" "}
                              {new Date(key.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                          {key.expiresAt && (
                            <span data-testid={`text-key-expires-${key.id}`}>
                              Expires:{" "}
                              {new Date(key.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => rotateKeyMutation.mutate(key.id)}
                          disabled={rotateKeyMutation.isPending}
                          data-testid={`button-rotate-key-${key.id}`}
                          title="Rotate key"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              data-testid={`button-revoke-key-${key.id}`}
                              title="Revoke key"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            data-testid={`dialog-revoke-key-${key.id}`}
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Revoke API Key
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke "{key.name}"?
                                This action cannot be undone and any
                                applications using this key will stop working
                                immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                data-testid={`button-cancel-revoke-${key.id}`}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => revokeKeyMutation.mutate(key.id)}
                                data-testid={`button-confirm-revoke-${key.id}`}
                              >
                                Revoke Key
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Key Created Dialog */}
      {newlyCreatedKey && (
        <Dialog open={!!newlyCreatedKey} onOpenChange={handleCloseNewKeyDialog}>
          <DialogContent data-testid="dialog-new-api-key">
            <DialogHeader>
              <DialogTitle>API Key Created Successfully</DialogTitle>
              <DialogDescription>
                Make sure to copy your API key now. You won't be able to see it
                again!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={
                        showNewKey
                          ? newlyCreatedKey
                          : "•".repeat(newlyCreatedKey.length)
                      }
                      readOnly
                      className="font-mono text-sm pr-10"
                      data-testid="input-new-api-key"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowNewKey(!showNewKey)}
                      data-testid="button-toggle-key-visibility"
                    >
                      {showNewKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleCopyKey(newlyCreatedKey)}
                    data-testid="button-copy-api-key"
                  >
                    {copiedKey ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copiedKey ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Store this key securely. It provides access to your WriteCraft
                  data.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCloseNewKeyDialog}
                data-testid="button-close-new-key-dialog"
              >
                I've Saved My Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
