import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Users,
  BarChart3,
} from "lucide-react";

interface DashboardStats {
  pendingReports: number;
  pendingVerifications: number;
  recentAuditLogs: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    pendingReports: 0,
    pendingVerifications: 0,
    recentAuditLogs: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    checkAccessAndFetchStats();
  }, [user]);

  const checkAccessAndFetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasAdminRole = roles?.some(r => r.role === "admin");
      const isAdminOrMod = roles?.some(r => r.role === "admin" || r.role === "moderator");
      
      setHasAccess(!!isAdminOrMod);
      setIsAdmin(!!hasAdminRole);

      if (isAdminOrMod) {
        await fetchStats(!!hasAdminRole);
      }
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (isAdminUser: boolean) => {
    try {
      // Fetch pending reports count
      const { count: pendingReports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Fetch pending verifications count
      const { count: pendingVerifications } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending");

      // Fetch recent audit logs (last 24 hours) - admin only
      let recentAuditLogs = 0;
      if (isAdminUser) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { count } = await supabase
          .from("audit_logs")
          .select("*", { count: "exact", head: true })
          .gte("created_at", yesterday.toISOString());
        
        recentAuditLogs = count || 0;
      }

      // Fetch total users count
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setStats({
        pendingReports: pendingReports || 0,
        pendingVerifications: pendingVerifications || 0,
        recentAuditLogs,
        totalUsers: totalUsers || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminSections = [
    {
      title: "Trust & Safety Reports",
      description: "Review and manage user reports for policy violations",
      icon: <AlertTriangle className="h-8 w-8" />,
      href: "/admin/reports",
      stat: stats.pendingReports,
      statLabel: "pending",
      statColor: stats.pendingReports > 0 ? "bg-yellow-500" : "bg-green-500",
      available: true,
    },
    {
      title: "Profile Verification",
      description: "Verify user profiles and review submitted photos",
      icon: <CheckCircle className="h-8 w-8" />,
      href: "/admin/verification",
      stat: stats.pendingVerifications,
      statLabel: "pending",
      statColor: stats.pendingVerifications > 0 ? "bg-yellow-500" : "bg-green-500",
      available: true,
    },
    {
      title: "Audit Logs",
      description: "Track sensitive actions and security events",
      icon: <FileText className="h-8 w-8" />,
      href: "/admin/audit-logs",
      stat: stats.recentAuditLogs,
      statLabel: "last 24h",
      statColor: "bg-blue-500",
      available: isAdmin,
      adminOnly: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage reports, verifications, and platform security
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingReports}</p>
                  <p className="text-xs text-muted-foreground">Pending Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                  <p className="text-xs text-muted-foreground">Pending Verifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isAdmin && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.recentAuditLogs}</p>
                    <p className="text-xs text-muted-foreground">Logs (24h)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.filter(s => s.available).map((section) => (
            <Card
              key={section.href}
              className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/20"
              onClick={() => navigate(section.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {section.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {section.adminOnly && (
                      <Badge variant="outline" className="text-xs">
                        Admin Only
                      </Badge>
                    )}
                    {section.stat > 0 && (
                      <Badge className={`${section.statColor} text-white`}>
                        {section.stat} {section.statLabel}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="mt-4 group-hover:text-primary transition-colors">
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/5">
                  Open
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back to app */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to App
          </Button>
        </div>
      </div>
    </div>
  );
}
