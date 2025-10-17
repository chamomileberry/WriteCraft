import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/Header";
import { Loader2, Plus, Pencil, Trash2, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

type DiscountType = 'percentage' | 'fixed';
type DiscountDuration = 'once' | 'repeating' | 'forever';
type SubscriptionTier = 'professional' | 'team';

interface DiscountCode {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number;
  applicableTiers: SubscriptionTier[];
  maxUses: number | null;
  usageCount: number;
  maxUsesPerUser: number;
  duration: DiscountDuration;
  durationInMonths: number | null;
  startsAt: string;
  expiresAt: string | null;
  active: boolean;
  stripeCouponId: string | null;
  createdAt: string;
}

interface DiscountFormData {
  code: string;
  name: string;
  type: DiscountType;
  value: string;
  applicableTiers: SubscriptionTier[];
  maxUses: string;
  maxUsesPerUser: string;
  duration: DiscountDuration;
  durationInMonths: string;
  startsAt: string;
  expiresAt: string;
  active: boolean;
}

export default function DiscountCodesAdmin() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<{ id: string; code: string } | null>(null);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState<DiscountFormData>({
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    applicableTiers: ['professional', 'team'],
    maxUses: '',
    maxUsesPerUser: '1',
    duration: 'once',
    durationInMonths: '',
    startsAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    active: true,
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  // Fetch all discount codes
  const { data: discountCodes = [], isLoading: codesLoading } = useQuery<DiscountCode[]>({
    queryKey: ['/api/admin/discount-codes'],
    enabled: !!user && user.isAdmin === true,
  });

  // Create discount code mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/discount-codes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({
        title: "Discount code created",
        description: "The discount code has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create discount code.",
        variant: "destructive",
      });
    },
  });

  // Update discount code mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/discount-codes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({
        title: "Discount code updated",
        description: "The discount code has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingCode(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update discount code.",
        variant: "destructive",
      });
    },
  });

  // Delete discount code mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/discount-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({
        title: "Discount code deleted",
        description: "The discount code has been deleted successfully.",
      });
      setDeleteDialogData(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete discount code.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'percentage',
      value: '',
      applicableTiers: ['professional', 'team'],
      maxUses: '',
      maxUsesPerUser: '1',
      duration: 'once',
      durationInMonths: '',
      startsAt: new Date().toISOString().split('T')[0],
      expiresAt: '',
      active: true,
    });
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      name: code.name,
      type: code.type,
      value: code.value.toString(),
      applicableTiers: code.applicableTiers,
      maxUses: code.maxUses?.toString() || '',
      maxUsesPerUser: code.maxUsesPerUser.toString(),
      duration: code.duration,
      durationInMonths: code.durationInMonths?.toString() || '',
      startsAt: format(new Date(code.startsAt), 'yyyy-MM-dd'),
      expiresAt: code.expiresAt ? format(new Date(code.expiresAt), 'yyyy-MM-dd') : '',
      active: code.active,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      code: formData.code.toUpperCase().trim(),
      name: formData.name.trim(),
      type: formData.type,
      value: parseFloat(formData.value),
      applicableTiers: formData.applicableTiers,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      maxUsesPerUser: parseInt(formData.maxUsesPerUser),
      duration: formData.duration,
      durationInMonths: formData.durationInMonths ? parseInt(formData.durationInMonths) : null,
      startsAt: new Date(formData.startsAt).toISOString(),
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      active: formData.active,
    };

    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: "Discount code copied to clipboard.",
    });
  };

  const toggleTier = (tier: SubscriptionTier) => {
    setFormData(prev => ({
      ...prev,
      applicableTiers: prev.applicableTiers.includes(tier)
        ? prev.applicableTiers.filter(t => t !== tier)
        : [...prev.applicableTiers, tier]
    }));
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  const isFormValid = 
    formData.code.trim().length >= 3 &&
    formData.name.trim().length > 0 &&
    formData.value &&
    parseFloat(formData.value) > 0 &&
    (formData.type !== 'percentage' || parseFloat(formData.value) <= 100) &&
    formData.applicableTiers.length > 0 &&
    formData.maxUsesPerUser &&
    parseInt(formData.maxUsesPerUser) > 0 &&
    (formData.duration !== 'repeating' || (formData.durationInMonths && parseInt(formData.durationInMonths) > 0));

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Discount Codes</h1>
            <p className="text-muted-foreground mt-1">
              Manage promotional discount codes for subscriptions
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            data-testid="button-create-discount"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Code
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Discount Codes</CardTitle>
            <CardDescription>
              {discountCodes.length} code{discountCodes.length !== 1 ? 's' : ''} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {codesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : discountCodes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No discount codes yet. Create your first one!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Tiers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discountCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono font-semibold">
                          <div className="flex items-center gap-2">
                            {code.code}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleCopyCode(code.code)}
                              data-testid={`button-copy-${code.code}`}
                            >
                              {copiedCode === code.code ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{code.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {code.type === 'percentage' ? 'Percentage' : 'Fixed'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}
                        </TableCell>
                        <TableCell>
                          {code.usageCount}
                          {code.maxUses && ` / ${code.maxUses}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {code.applicableTiers.map(tier => (
                              <Badge key={tier} variant="secondary" className="text-xs">
                                {tier === 'professional' ? 'Pro' : 'Team'}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {code.active ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(code)}
                              data-testid={`button-edit-${code.code}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteDialogData({ id: code.id, code: code.code })}
                              data-testid={`button-delete-${code.code}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingCode(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCode ? 'Edit Discount Code' : 'Create Discount Code'}
            </DialogTitle>
            <DialogDescription>
              {editingCode ? 'Update the discount code details' : 'Create a new discount code for subscriptions'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  placeholder="SUMMER2024"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  data-testid="input-discount-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Summer Sale 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-discount-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: DiscountType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger data-testid="select-discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">
                  {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *
                </Label>
                <Input
                  id="value"
                  type="number"
                  min="1"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  placeholder={formData.type === 'percentage' ? '25' : '10'}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  data-testid="input-discount-value"
                />
              </div>
            </div>

            {formData.type === 'percentage' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value: DiscountDuration) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger data-testid="select-discount-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="repeating">Repeating</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.duration === 'repeating' && (
                  <div className="space-y-2">
                    <Label htmlFor="durationInMonths">Duration (months) *</Label>
                    <Input
                      id="durationInMonths"
                      type="number"
                      min="1"
                      max="36"
                      placeholder="3"
                      value={formData.durationInMonths}
                      onChange={(e) => setFormData({ ...formData, durationInMonths: e.target.value })}
                      data-testid="input-duration-months"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Applicable Tiers *</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tier-professional"
                    checked={formData.applicableTiers.includes('professional')}
                    onCheckedChange={() => toggleTier('professional')}
                    data-testid="checkbox-tier-professional"
                  />
                  <Label htmlFor="tier-professional" className="font-normal cursor-pointer">
                    Professional
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tier-team"
                    checked={formData.applicableTiers.includes('team')}
                    onCheckedChange={() => toggleTier('team')}
                    data-testid="checkbox-tier-team"
                  />
                  <Label htmlFor="tier-team" className="font-normal cursor-pointer">
                    Team
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Total Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="0"
                  placeholder="Leave empty for unlimited"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  data-testid="input-max-uses"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUsesPerUser">Max Uses Per User *</Label>
                <Input
                  id="maxUsesPerUser"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                  data-testid="input-max-uses-per-user"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Start Date *</Label>
                <Input
                  id="startsAt"
                  type="date"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  data-testid="input-expiry-date"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                data-testid="switch-active"
              />
              <Label htmlFor="active" className="font-normal cursor-pointer">
                Active (available for use)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setEditingCode(null);
                resetForm();
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-discount"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingCode ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogData} onOpenChange={() => setDeleteDialogData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discount Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the discount code "{deleteDialogData?.code}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogData && deleteMutation.mutate(deleteDialogData.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
