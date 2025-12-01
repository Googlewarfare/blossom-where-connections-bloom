import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, TrendingUp } from "lucide-react";

interface CompletionStats {
  field: string;
  completed: number;
  total: number;
  percentage: number;
}

export default function Analytics() {
  const [stats, setStats] = useState<CompletionStats[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, count } = await supabase
        .from("profiles")
        .select("*", { count: "exact" });

      if (!profiles) return;

      setTotalUsers(count || 0);

      // Count photos per user
      const { data: photoCounts } = await supabase
        .from("profile_photos")
        .select("user_id");

      const usersWithPhotos = new Set(photoCounts?.map(p => p.user_id) || []);

      // Count preferences
      const { data: preferences } = await supabase
        .from("preferences")
        .select("user_id, interested_in");

      const usersWithPreferences = preferences?.filter(
        p => p.interested_in && p.interested_in.length > 0
      ).length || 0;

      // Calculate completion stats for each field
      const completionStats: CompletionStats[] = [
        {
          field: "Age",
          completed: profiles.filter(p => p.age).length,
          total: profiles.length,
          percentage: 0,
        },
        {
          field: "Gender",
          completed: profiles.filter(p => p.gender).length,
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
          completed: profiles.filter(p => p.bio && p.bio.length > 10).length,
          total: profiles.length,
          percentage: 0,
        },
        {
          field: "Occupation",
          completed: profiles.filter(p => p.occupation).length,
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

      // Calculate percentages
      completionStats.forEach(stat => {
        stat.percentage = stat.total > 0 
          ? Math.round((stat.completed / stat.total) * 100) 
          : 0;
      });

      // Sort by percentage (lowest first to highlight most skipped)
      completionStats.sort((a, b) => a.percentage - b.percentage);

      setStats(completionStats);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "hsl(var(--primary))";
    if (percentage >= 60) return "hsl(var(--accent))";
    return "hsl(var(--destructive))";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Profile Completion Analytics</h1>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Field Completion Rates
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Fields are sorted by completion rate (lowest first) to highlight commonly skipped information
          </p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="field" 
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}% (${props.payload.completed}/${props.payload.total} users)`,
                    "Completion Rate"
                  ]}
                />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Detailed Statistics
          </h2>
          <div className="space-y-3">
            {stats.map((stat) => (
              <div
                key={stat.field}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium text-foreground">{stat.field}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.completed} of {stat.total} users completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: getBarColor(stat.percentage) }}>
                    {stat.percentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.total - stat.completed} skipped
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
