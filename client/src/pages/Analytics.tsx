import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const COLORS = ['#8b5cf6', '#06b6d4', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/subscription/analytics', timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/subscription/analytics?days=${timeRange}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });

  // Fetch forecast data
  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ['/api/subscription/forecast'],
  }) as { data: any; isLoading: boolean };

  const isLoading = analyticsLoading || forecastLoading;

  // Format daily data for charts
  const dailyChartData = analytics?.dailySummaries?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    operations: day.totalOperations || 0,
    cost: (day.totalCostCents || 0) / 100,
  })) || [];

  // Format feature breakdown for pie chart
  const featureChartData = analytics?.featureBreakdown?.map((item: any) => ({
    name: item.feature.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: item.count,
    cost: item.costCents / 100,
  })) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Usage Analytics</h1>
        <p className="text-muted-foreground">
          Track your AI usage, costs, and get insights to optimize your subscription.
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={timeRange === '7' ? 'default' : 'outline'}
          onClick={() => setTimeRange('7')}
          data-testid="button-range-7"
        >
          Last 7 Days
        </Button>
        <Button
          variant={timeRange === '30' ? 'default' : 'outline'}
          onClick={() => setTimeRange('30')}
          data-testid="button-range-30"
        >
          Last 30 Days
        </Button>
        <Button
          variant={timeRange === '90' ? 'default' : 'outline'}
          onClick={() => setTimeRange('90')}
          data-testid="button-range-90"
        >
          Last 90 Days
        </Button>
      </div>

      {/* Forecast & Recommendation */}
      {forecast?.recommendation && (
        <Alert data-testid="alert-recommendation">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Usage Insight</AlertTitle>
          <AlertDescription>{forecast?.recommendation}</AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-operations">
                {analytics?.totals?.operations?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {timeRange} day period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-cost">
                {formatCurrency((analytics?.totals?.costCents || 0) / 100)}
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated API cost
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-daily">
                {(forecast as any)?.averageDailyUsage || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Generations per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize" data-testid="text-current-tier">
                {analytics?.subscription?.tier || 'Free'}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.subscription?.limits?.aiGenerationsPerDay 
                  ? `${analytics.subscription.limits.aiGenerationsPerDay}/day limit`
                  : 'Unlimited'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage" data-testid="tab-usage">Usage Over Time</TabsTrigger>
          <TabsTrigger value="breakdown" data-testid="tab-breakdown">Feature Breakdown</TabsTrigger>
          <TabsTrigger value="cost" data-testid="tab-cost">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Generations Over Time</CardTitle>
              <CardDescription>
                Daily AI generation usage for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="operations" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Generations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Feature</CardTitle>
                <CardDescription>
                  Distribution of AI generations across features
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={featureChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {featureChartData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Counts</CardTitle>
                <CardDescription>
                  Number of generations per feature type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Over Time</CardTitle>
              <CardDescription>
                Estimated API costs for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
