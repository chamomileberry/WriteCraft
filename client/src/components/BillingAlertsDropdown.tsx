import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface BillingAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  stripeInvoiceId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
}

const severityConfig = {
  low: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  medium: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950' },
  high: { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950' },
  critical: { icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export function BillingAlertsDropdown() {
  const { data: alertsData } = useQuery<{ alerts: BillingAlert[] }>({
    queryKey: ['/api/billing-alerts'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ['/api/billing-alerts/unread-count'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest('PATCH', `/api/billing-alerts/${alertId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing-alerts/unread-count'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest('PATCH', `/api/billing-alerts/${alertId}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing-alerts/unread-count'] });
    },
  });

  const alerts = alertsData?.alerts || [];
  const unreadCount = countData?.count || 0;
  const activeAlerts = alerts.filter(a => a.status !== 'dismissed' && a.status !== 'resolved');

  const getSeverityIcon = (severity: string) => {
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium;
    const Icon = config.icon;
    return <Icon className={cn('h-4 w-4', config.color)} />;
  };

  const getSeverityBgColor = (severity: string) => {
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium;
    return config.bgColor;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          data-testid="button-billing-alerts"
          aria-label="Billing alerts"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              data-testid="badge-unread-count"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto" data-testid="dropdown-billing-alerts">
        <div className="p-4">
          <h3 className="font-semibold mb-3">Billing Alerts</h3>
          
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active alerts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    getSeverityBgColor(alert.severity),
                    alert.status === 'unread' ? 'border-primary' : 'border-border'
                  )}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm" data-testid={`text-alert-title-${alert.id}`}>
                            {alert.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1" data-testid={`text-alert-message-${alert.id}`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mt-1 -mr-1"
                          onClick={() => dismissMutation.mutate(alert.id)}
                          data-testid={`button-dismiss-${alert.id}`}
                          aria-label="Dismiss alert"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {alert.status === 'unread' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 mt-2 text-xs hover:underline"
                          onClick={() => markAsReadMutation.mutate(alert.id)}
                          data-testid={`button-mark-read-${alert.id}`}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
