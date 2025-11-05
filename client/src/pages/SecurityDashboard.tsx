import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Shield,
  Ban,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

interface SecurityOverview {
  totalUnacknowledgedAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  blockedIpsCount: number;
  recentAttemptsCount: number;
  attackTypesBreakdown: Record<string, number>;
}

interface SecurityAlert {
  id: string;
  alertType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  details: any;
  acknowledged: boolean;
  createdAt: string;
}

interface IntrusionAttempt {
  id: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  attackType: string;
  endpoint?: string;
  payload?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  blocked: boolean;
  createdAt: string;
}

interface BlockedIp {
  id: string;
  ipAddress: string;
  reason: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  blockedAt: string;
  expiresAt?: string;
  isActive: boolean;
  autoBlocked: boolean;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-500 hover-elevate";
    case "HIGH":
      return "bg-orange-500 hover-elevate";
    case "MEDIUM":
      return "bg-yellow-500 hover-elevate";
    case "LOW":
      return "bg-blue-500 hover-elevate";
    default:
      return "bg-gray-500 hover-elevate";
  }
};

const getAttackTypeLabel = (type: string) => {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function SecurityDashboard() {
  const { toast } = useToast();
  const [blockIpAddress, setBlockIpAddress] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockSeverity, setBlockSeverity] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  >("MEDIUM");
  const [blockDuration, setBlockDuration] = useState("60");

  // Fetch security overview
  const { data: overview, isLoading: overviewLoading } =
    useQuery<SecurityOverview>({
      queryKey: ["/api/security/overview"],
    });

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery<SecurityAlert[]>({
    queryKey: ["/api/security/alerts"],
  });

  // Fetch intrusion attempts
  const { data: attempts, isLoading: attemptsLoading } = useQuery<
    IntrusionAttempt[]
  >({
    queryKey: ["/api/security/intrusion-attempts"],
  });

  // Fetch blocked IPs
  const { data: blockedIps, isLoading: blockedIpsLoading } = useQuery<
    BlockedIp[]
  >({
    queryKey: ["/api/security/blocked-ips"],
  });

  // Acknowledge alert mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest("POST", `/api/security/alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/overview"] });
      toast({
        title: "Alert Acknowledged",
        description: "Security alert has been acknowledged",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      });
    },
  });

  // Block IP mutation
  const blockIpMutation = useMutation({
    mutationFn: async (data: {
      ipAddress: string;
      reason: string;
      severity: string;
      durationMinutes?: number;
    }) => {
      return apiRequest("POST", "/api/security/block-ip", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/security/blocked-ips"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/security/overview"] });
      setBlockIpAddress("");
      setBlockReason("");
      setBlockSeverity("MEDIUM");
      setBlockDuration("60");
      toast({
        title: "IP Blocked",
        description: "IP address has been blocked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to block IP address",
        variant: "destructive",
      });
    },
  });

  // Unblock IP mutation
  const unblockIpMutation = useMutation({
    mutationFn: async (ipAddress: string) => {
      return apiRequest("POST", "/api/security/unblock-ip", { ipAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/security/blocked-ips"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/security/overview"] });
      toast({
        title: "IP Unblocked",
        description: "IP address has been unblocked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unblock IP address",
        variant: "destructive",
      });
    },
  });

  const handleBlockIp = () => {
    if (!blockIpAddress || !blockReason) {
      toast({
        title: "Validation Error",
        description: "Please provide IP address and reason",
        variant: "destructive",
      });
      return;
    }

    blockIpMutation.mutate({
      ipAddress: blockIpAddress,
      reason: blockReason,
      severity: blockSeverity,
      durationMinutes: blockDuration ? parseInt(blockDuration) : undefined,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage security threats
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card data-testid="card-total-alerts">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Unacknowledged Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalUnacknowledgedAlerts || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-critical-alerts">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {overview?.criticalAlerts || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-high-alerts">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {overview?.highAlerts || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-blocked-ips">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.blockedIpsCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-attempts">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Recent Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.recentAttemptsCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="attempts" data-testid="tab-attempts">
            <Activity className="h-4 w-4 mr-2" />
            Intrusion Attempts
          </TabsTrigger>
          <TabsTrigger value="blocked" data-testid="tab-blocked-ips">
            <Ban className="h-4 w-4 mr-2" />
            Blocked IPs
          </TabsTrigger>
          <TabsTrigger value="block" data-testid="tab-block-ip">
            <Shield className="h-4 w-4 mr-2" />
            Block IP
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Review and acknowledge security alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading alerts...
                </div>
              ) : !alerts || alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No alerts found
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`alert-${alert.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">
                          {getAttackTypeLabel(alert.alertType)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="font-medium">{alert.message}</p>
                      {alert.details && (
                        <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                          {JSON.stringify(alert.details, null, 2)}
                        </pre>
                      )}
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isPending}
                        data-testid={`button-acknowledge-${alert.id}`}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intrusion Attempts Tab */}
        <TabsContent value="attempts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intrusion Attempts</CardTitle>
              <CardDescription>
                Recent security threats detected by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attemptsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading attempts...
                  </div>
                ) : !attempts || attempts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No intrusion attempts found
                  </div>
                ) : (
                  attempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-3 border rounded-lg hover-elevate"
                      data-testid={`attempt-${attempt.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(attempt.severity)}>
                            {attempt.severity}
                          </Badge>
                          <Badge variant="outline">
                            {getAttackTypeLabel(attempt.attackType)}
                          </Badge>
                          {attempt.blocked && (
                            <Badge className="bg-red-500 hover-elevate">
                              <XCircle className="h-3 w-3 mr-1" />
                              Blocked
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(attempt.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="mt-2 text-sm space-y-1">
                        <div>
                          <span className="font-medium">IP:</span>{" "}
                          {attempt.ipAddress}
                        </div>
                        {attempt.endpoint && (
                          <div>
                            <span className="font-medium">Endpoint:</span>{" "}
                            {attempt.endpoint}
                          </div>
                        )}
                        {attempt.userAgent && (
                          <div className="text-muted-foreground truncate">
                            {attempt.userAgent}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked IPs Tab */}
        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked IP Addresses</CardTitle>
              <CardDescription>
                Currently blocked IPs and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blockedIpsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading blocked IPs...
                  </div>
                ) : !blockedIps || blockedIps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No blocked IPs found
                  </div>
                ) : (
                  blockedIps.map((block) => (
                    <div
                      key={block.id}
                      className="p-4 border rounded-lg hover-elevate"
                      data-testid={`blocked-ip-${block.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-bold text-lg">
                              {block.ipAddress}
                            </span>
                            <Badge className={getSeverityColor(block.severity)}>
                              {block.severity}
                            </Badge>
                            {block.autoBlocked && (
                              <Badge variant="outline">Auto-blocked</Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{block.reason}</p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>
                              Blocked:{" "}
                              {formatDistanceToNow(new Date(block.blockedAt), {
                                addSuffix: true,
                              })}
                            </div>
                            {block.expiresAt && (
                              <div>
                                Expires:{" "}
                                {formatDistanceToNow(
                                  new Date(block.expiresAt),
                                  { addSuffix: true },
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            unblockIpMutation.mutate(block.ipAddress)
                          }
                          disabled={unblockIpMutation.isPending}
                          data-testid={`button-unblock-${block.id}`}
                        >
                          Unblock
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Block IP Tab */}
        <TabsContent value="block" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Block IP Address</CardTitle>
              <CardDescription>
                Manually block an IP address from accessing the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip-address">IP Address</Label>
                <Input
                  id="ip-address"
                  placeholder="192.168.1.1"
                  value={blockIpAddress}
                  onChange={(e) => setBlockIpAddress(e.target.value)}
                  data-testid="input-block-ip"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="Why is this IP being blocked?"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  data-testid="input-block-reason"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={blockSeverity}
                    onValueChange={(value: any) => setBlockSeverity(value)}
                  >
                    <SelectTrigger
                      id="severity"
                      data-testid="select-block-severity"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(e.target.value)}
                    data-testid="input-block-duration"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for permanent block
                  </p>
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleBlockIp}
                disabled={blockIpMutation.isPending}
                className="w-full"
                data-testid="button-submit-block"
              >
                <Ban className="h-4 w-4 mr-2" />
                Block IP Address
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
