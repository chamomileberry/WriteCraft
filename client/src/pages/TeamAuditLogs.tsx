import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FileEdit,
  Trash2,
  Plus,
  Users,
  Settings,
  Shield,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const ACTION_ICONS = {
  create: Plus,
  update: FileEdit,
  delete: Trash2,
  invite: Users,
  remove_member: Users,
  role_change: Shield,
  settings_change: Settings,
};

const ACTION_COLORS = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  invite: "default",
  remove_member: "destructive",
  role_change: "secondary",
  settings_change: "secondary",
} as const;

export default function TeamAuditLogs() {
  const [filters, setFilters] = useState({
    action: "",
    resourceType: "",
    search: "",
  });
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: auditData, isLoading } = useQuery<{
    logs: Array<{
      id: string;
      userId: string | null;
      action: string;
      resourceType: string;
      resourceId: string | null;
      resourceName: string | null;
      changesBefore: any;
      changesAfter: any;
      metadata: any;
      createdAt: string;
      user: { id: string; email: string; name: string | null } | null;
    }>;
    total: number;
    limit: number;
    offset: number;
  }>({
    queryKey: [
      "/api/team/audit-logs",
      {
        ...filters,
        limit,
        offset: page * limit,
      },
    ],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const logs = auditData?.logs || [];
  const total = auditData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({ action: "", resourceType: "", search: "" });
    setPage(0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const formatActionName = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatResourceType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="page-audit-logs"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all actions and changes made by team members
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter audit logs by action type, resource, or search keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select
                value={filters.action}
                onValueChange={(value) => handleFilterChange("action", value)}
              >
                <SelectTrigger data-testid="select-action-filter">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="invite">Invite</SelectItem>
                  <SelectItem value="remove_member">Remove Member</SelectItem>
                  <SelectItem value="role_change">Role Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resource Type</label>
              <Select
                value={filters.resourceType}
                onValueChange={(value) =>
                  handleFilterChange("resourceType", value)
                }
              >
                <SelectTrigger data-testid="select-resource-filter">
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All resources</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="notebook">Notebook</SelectItem>
                  <SelectItem value="character">Character</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by resource name..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>

          {(filters.action || filters.resourceType || filters.search) && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {logs.length} of {total} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No audit logs found matching your filters
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const ActionIcon =
                  ACTION_ICONS[log.action as keyof typeof ACTION_ICONS] ||
                  Clock;
                const actionColor =
                  ACTION_COLORS[log.action as keyof typeof ACTION_COLORS] ||
                  "default";

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover-elevate"
                    data-testid={`audit-log-${log.id}`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                      <ActionIcon className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={actionColor}
                              data-testid={`badge-action-${log.id}`}
                            >
                              {formatActionName(log.action)}
                            </Badge>
                            <Badge variant="outline">
                              {formatResourceType(log.resourceType)}
                            </Badge>
                            {log.resourceName && (
                              <span className="text-sm font-medium">
                                {log.resourceName}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {log.user ? (
                              <span>By {log.user.name || log.user.email}</span>
                            ) : (
                              <span>By system</span>
                            )}
                            {" • "}
                            <span className="flex items-center gap-1 inline-flex">
                              <Clock className="h-3 w-3" />
                              {format(
                                new Date(log.createdAt),
                                "MMM d, yyyy h:mm a",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Show changes if available */}
                      {(log.changesBefore || log.changesAfter) && (
                        <div className="mt-3 p-3 rounded bg-muted/50 text-sm space-y-1">
                          {log.action === "update" &&
                            log.changesBefore &&
                            log.changesAfter && (
                              <div className="space-y-1">
                                {Object.keys(log.changesAfter).map((key) => {
                                  const before = log.changesBefore?.[key];
                                  const after = log.changesAfter?.[key];
                                  if (before !== after) {
                                    return (
                                      <div
                                        key={key}
                                        className="flex items-center gap-2 flex-wrap"
                                      >
                                        <span className="font-medium">
                                          {key}:
                                        </span>
                                        <span className="text-muted-foreground line-through">
                                          {String(before)}
                                        </span>
                                        <span>→</span>
                                        <span>{String(after)}</span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            )}
                          {log.action === "create" && log.changesAfter && (
                            <div className="space-y-1">
                              {Object.entries(log.changesAfter).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="font-medium">{key}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show metadata if available */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            View metadata
                          </summary>
                          <pre className="mt-2 p-2 rounded bg-muted text-xs overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  data-testid="button-next-page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
