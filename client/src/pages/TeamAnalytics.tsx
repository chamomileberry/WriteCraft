import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, 
  Sparkles, 
  DollarSign, 
  Activity,
  TrendingUp,
  Calendar,
  Crown,
  Shield,
  Edit,
  Eye
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  editor: Edit,
  viewer: Eye,
};

export default function TeamAnalytics() {
  const [timeRange, setTimeRange] = useState('30');

  const { data: analytics, isLoading } = useQuery<{
    summary: {
      memberCount: number;
      totalAIOperations: number;
      totalAICost: number;
      totalTokens: number;
      dateRange: { start: string; end: string; days: number };
    };
    usageByOperation: Array<{
      operationType: string;
      count: number;
      costDollars: number;
    }>;
    dailyUsage: Array<{
      date: string;
      operations: number;
      tokens: number;
      costDollars: number;
    }>;
    memberActivity: Array<{
      userId: string;
      name: string;
      role: string;
      aiOperations: number;
      activities: number;
      joinedAt: string;
    }>;
  }>({
    queryKey: ['/api/team/analytics', { days: timeRange }],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading || !analytics) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { summary, usageByOperation, dailyUsage, memberActivity } = analytics;

  // Calculate top operations
  const topOperations = [...usageByOperation]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Format operation types for display
  const formatOperationType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate team growth trend
  const avgDailyOperations = dailyUsage.length > 0 
    ? dailyUsage.reduce((sum, day) => sum + day.operations, 0) / dailyUsage.length 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-team-analytics">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your team's AI usage and collaboration
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]" data-testid="select-time-range">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-team-members">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.memberCount}</div>
            <p className="text-xs text-muted-foreground">
              Active collaborators
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-ai-operations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">AI Operations</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalAIOperations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(avgDailyOperations)} avg/day
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cost">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalAICost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last {summary.dateRange.days} days
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-tokens-used">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(summary.totalTokens / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">
              Input + output
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage" data-testid="tab-usage-trends">
            Usage Trends
          </TabsTrigger>
          <TabsTrigger value="operations" data-testid="tab-operations">
            Operations
          </TabsTrigger>
          <TabsTrigger value="members" data-testid="tab-members">
            Team Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily AI Usage</CardTitle>
              <CardDescription>
                Track your team's AI operation volume over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [value.toLocaleString(), 'Operations']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="operations" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="AI Operations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Cost</CardTitle>
              <CardDescription>
                Monitor your team's AI spending trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`$${Number(value).toFixed(2)}`, 'Cost']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="costDollars" 
                    fill="hsl(var(--secondary))"
                    name="Cost (USD)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top AI Operations</CardTitle>
                <CardDescription>
                  Most frequently used AI features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topOperations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => formatOperationType(entry.operationType)}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {topOperations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Count']}
                      labelFormatter={(label) => formatOperationType(label)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operations Breakdown</CardTitle>
                <CardDescription>
                  All AI operations with usage counts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usageByOperation.map((op, index) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                      <span className="text-sm flex-1 truncate">
                        {formatOperationType(op.operationType)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" data-testid={`badge-operation-count-${index}`}>
                          {op.count.toLocaleString()}
                        </Badge>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          ${op.costDollars.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Member Activity</CardTitle>
              <CardDescription>
                Individual contribution and AI usage metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberActivity.map((member) => {
                  const RoleIcon = ROLE_ICONS[member.role as keyof typeof ROLE_ICONS] || Eye;
                  return (
                    <div 
                      key={member.userId} 
                      className="flex items-center justify-between p-4 rounded-lg border gap-4"
                      data-testid={`member-activity-${member.userId}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <RoleIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.aiOperations}</p>
                          <p className="text-xs text-muted-foreground">AI ops</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.activities}</p>
                          <p className="text-xs text-muted-foreground">Actions</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
