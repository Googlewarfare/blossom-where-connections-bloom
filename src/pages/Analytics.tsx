import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CompletionStats {
  field: string;
  completed: number;
  total: number;
  percentage: number;
}

interface DailyMetric {
  date: string;
  value: number;
}

interface OverviewMetrics {
  totalUsers: number;
  totalMatches: number;
  totalMessages: number;
  totalPageViews: number;
  newUsersToday: number;
  newMatchesToday: number;
  activeUsersToday: number;
  userGrowth: number;
}

export default function Analytics() {
  const [stats, setStats] = useState<CompletionStats[]>([]);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [userGrowth, setUserGrowth] = useState<DailyMetric[]>([]);
  const [matchesGrowth, setMatchesGrowth] = useState<DailyMetric[]>([]);
  const [pageViewsData, setPageViewsData] = useState<
    { path: string; views: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAnalytics();

    // Subscribe to real-time page_views updates
    const channel = supabase
      .channel("analytics-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "page_views",
        },
        () => {
          // Refresh page views and overview when new page view is recorded
          fetchPageViewsData();
          fetchOverviewMetrics();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      await Promise.all([
        fetchProfileCompletion(),
        fetchOverviewMetrics(),
        fetchGrowthData(),
        fetchPageViewsData(),
      ]);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileCompletion = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    if (!profiles) return;

    const { data: photoCounts } = await supabase
      .from("profile_photos")
      .select("user_id");
    const usersWithPhotos = new Set(photoCounts?.map((p) => p.user_id) || []);

    const { data: preferences } = await supabase
      .from("preferences")
      .select("user_id, interested_in");
    const usersWithPreferences =
      preferences?.filter((p) => p.interested_in && p.interested_in.length > 0)
        .length || 0;

    const completionStats: CompletionStats[] = [
      {
        field: "Age",
        completed: profiles.filter((p) => p.age).length,
        total: profiles.length,
        percentage: 0,
      },
      {
        field: "Gender",
        completed: profiles.filter((p) => p.gender).length,
        total: profiles.length,
        percentage: 0,
      },
      {
        field: "Photos",
        completed: usersWithPhotos.size,
        total: profiles.length,
        percentage: 0,
      },
      {
        field: "Bio",
        completed: profiles.filter((p) => p.bio && p.bio.length > 10).length,
        total: profiles.length,
        percentage: 0,
      },
      {
        field: "Occupation",
        completed: profiles.filter((p) => p.occupation).length,
        total: profiles.length,
        percentage: 0,
      },
      {
        field: "Preferences",
        completed: usersWithPreferences,
        total: profiles.length,
        percentage: 0,
      },
    ];

    completionStats.forEach((stat) => {
      stat.percentage =
        stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
    });

    completionStats.sort((a, b) => a.percentage - b.percentage);
    setStats(completionStats);
  };

  const fetchOverviewMetrics = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      { count: totalUsers },
      { count: totalMatches },
      { count: totalMessages },
      { count: totalPageViews },
      { count: newUsersToday },
      { count: newMatchesToday },
      { count: newUsersYesterday },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString())
        .lt("created_at", today.toISOString()),
    ]);

    const { data: activeUsers } = await supabase
      .from("page_views")
      .select("user_id")
      .gte("created_at", today.toISOString())
      .not("user_id", "is", null);

    const uniqueActiveUsers = new Set(activeUsers?.map((a) => a.user_id) || []);

    const userGrowth =
      newUsersYesterday && newUsersYesterday > 0
        ? Math.round(
            (((newUsersToday || 0) - newUsersYesterday) / newUsersYesterday) *
              100,
          )
        : newUsersToday || 0 > 0
          ? 100
          : 0;

    setOverview({
      totalUsers: totalUsers || 0,
      totalMatches: totalMatches || 0,
      totalMessages: totalMessages || 0,
      totalPageViews: totalPageViews || 0,
      newUsersToday: newUsersToday || 0,
      newMatchesToday: newMatchesToday || 0,
      activeUsersToday: uniqueActiveUsers.size,
      userGrowth,
    });
  };

  const fetchGrowthData = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    const { data: matches } = await supabase
      .from("matches")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    // Aggregate by date
    const usersByDate: Record<string, number> = {};
    const matchesByDate: Record<string, number> = {};

    profiles?.forEach((p) => {
      const date = new Date(p.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      usersByDate[date] = (usersByDate[date] || 0) + 1;
    });

    matches?.forEach((m) => {
      const date = new Date(m.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      matchesByDate[date] = (matchesByDate[date] || 0) + 1;
    });

    setUserGrowth(
      Object.entries(usersByDate).map(([date, value]) => ({ date, value })),
    );
    setMatchesGrowth(
      Object.entries(matchesByDate).map(([date, value]) => ({ date, value })),
    );
  };

  const fetchPageViewsData = async () => {
    const { data } = await supabase
      .from("page_views")
      .select("path")
      .not("path", "like", "event:%");

    if (!data) return;

    const pathCounts: Record<string, number> = {};
    data.forEach((pv) => {
      pathCounts[pv.path] = (pathCounts[pv.path] || 0) + 1;
    });

    const sortedPaths = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, views]) => ({
        path:
          path === "/"
            ? "Home"
            : path.replace("/", "").charAt(0).toUpperCase() + path.slice(2),
        views,
      }));

    setPageViewsData(sortedPaths);
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "hsl(var(--primary))";
    if (percentage >= 60) return "hsl(var(--accent))";
    return "hsl(var(--destructive))";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner
            size="xl"
            variant="heart"
            label="Loading analytics..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor your app's performance and user engagement
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <Card variant="gradient" className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold font-display">
                    {overview?.totalUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {overview?.userGrowth && overview.userGrowth >= 0 ? (
                      <ArrowUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-destructive" />
                    )}
                    <span
                      className={`text-sm ${overview?.userGrowth && overview.userGrowth >= 0 ? "text-emerald-500" : "text-destructive"}`}
                    >
                      {overview?.userGrowth}% today
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Matches</p>
                  <p className="text-3xl font-bold font-display">
                    {overview?.totalMatches.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    +{overview?.newMatchesToday} today
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blossom-coral/20">
                  <Heart className="h-6 w-6 text-blossom-coral" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Messages Sent</p>
                  <p className="text-3xl font-bold font-display">
                    {overview?.totalMessages.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Across all chats
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Today</p>
                  <p className="text-3xl font-bold font-display">
                    {overview?.activeUsersToday.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {overview?.totalPageViews.toLocaleString()} page views
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-500/10">
                  <Activity className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="overview"
          className="animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <TabsList className="glass">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    New Users (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userGrowth}>
                        <defs>
                          <linearGradient
                            id="userGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="url(#userGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Matches Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-blossom-coral" />
                    New Matches (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={matchesGrowth}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--accent))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page Views */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Top Pages by Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pageViewsData} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        dataKey="path"
                        type="category"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="views"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion Rates</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fields sorted by completion rate to highlight commonly skipped
                  information
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="field"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        label={{
                          value: "Completion %",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(
                          value: number,
                          name: string,
                          props: { payload: CompletionStats },
                        ) => [
                          `${value}% (${props.payload.completed}/${props.payload.total} users)`,
                          "Completion Rate",
                        ]}
                      />
                      <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                        {stats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getBarColor(entry.percentage)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.field}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{stat.field}</p>
                        <p className="text-sm text-muted-foreground">
                          {stat.completed} of {stat.total} users completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-2xl font-bold"
                          style={{ color: getBarColor(stat.percentage) }}
                        >
                          {stat.percentage}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stat.total - stat.completed} skipped
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="glass">
                <CardContent className="p-6 text-center">
                  <Eye className="h-10 w-10 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-bold font-display">
                    {overview?.totalPageViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Page Views
                  </p>
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-10 w-10 text-blossom-coral mx-auto mb-3" />
                  <p className="text-3xl font-bold font-display">
                    {overview?.newUsersToday}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    New Users Today
                  </p>
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardContent className="p-6 text-center">
                  <Activity className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-3xl font-bold font-display">
                    {overview?.activeUsersToday}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Active Users Today
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
