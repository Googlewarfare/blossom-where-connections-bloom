import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Shield,
  Search,
  Loader2,
  FileText,
  User,
  Ban,
  AlertTriangle,
  Edit,
  Eye,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_data: Json | null;
  new_data: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_profile?: { full_name: string | null };
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  profile_update: { label: "Profile Updated", icon: <Edit className="h-3 w-3" />, color: "bg-blue-500/10 text-blue-500" },
  user_blocked: { label: "User Blocked", icon: <Ban className="h-3 w-3" />, color: "bg-red-500/10 text-red-500" },
  user_unblocked: { label: "User Unblocked", icon: <User className="h-3 w-3" />, color: "bg-green-500/10 text-green-500" },
  report_submitted: { label: "Report Submitted", icon: <AlertTriangle className="h-3 w-3" />, color: "bg-yellow-500/10 text-yellow-500" },
  report_status_changed: { label: "Report Updated", icon: <FileText className="h-3 w-3" />, color: "bg-purple-500/10 text-purple-500" },
  login: { label: "Login", icon: <User className="h-3 w-3" />, color: "bg-green-500/10 text-green-500" },
  logout: { label: "Logout", icon: <User className="h-3 w-3" />, color: "bg-muted text-muted-foreground" },
};

const ITEMS_PER_PAGE = 20;

export default function AdminAuditLogs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    checkAccess();
  }, [user]);

  useEffect(() => {
    if (hasAccess) {
      fetchLogs();
    }
  }, [hasAccess, page, actionFilter, tableFilter, dateFrom, dateTo]);

  const checkAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdmin = roles?.some(r => r.role === "admin");
      setHasAccess(!!isAdmin);
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      if (!hasAccess) setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      if (tableFilter !== "all") {
        query = query.eq("table_name", tableFilter);
      }

      if (dateFrom) {
        query = query.gte("created_at", new Date(dateFrom).toISOString());
      }

      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endDate.toISOString());
      }

      const { data: logsData, error, count } = await query;

      if (error) throw error;

      // Fetch user profiles for the logs
      const userIds = [...new Set(logsData?.map(l => l.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enrichedLogs = logsData?.map(log => ({
        ...log,
        user_profile: profileMap.get(log.user_id),
      })) || [];

      // Apply search filter client-side (for user names)
      let filteredLogs = enrichedLogs;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredLogs = enrichedLogs.filter(log =>
          log.user_profile?.full_name?.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.table_name?.toLowerCase().includes(query) ||
          log.record_id?.toLowerCase().includes(query)
        );
      }

      setLogs(filteredLogs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchLogs();
  };

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || {
      label: action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      icon: <FileText className="h-3 w-3" />,
      color: "bg-muted text-muted-foreground",
    };
  };

  const formatJsonData = (data: Json | null): string => {
    if (!data) return "—";
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading && !hasAccess) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              Only administrators can access audit logs.
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
      <div className="w-full max-w-6xl mx-auto py-8 px-4 box-border">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Audit Logs
            </h1>
            <p className="text-muted-foreground">
              Track sensitive actions across the platform
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Search by user, action, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Action Type</Label>
                <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="profile_update">Profile Updates</SelectItem>
                    <SelectItem value="user_blocked">User Blocked</SelectItem>
                    <SelectItem value="user_unblocked">User Unblocked</SelectItem>
                    <SelectItem value="report_submitted">Report Submitted</SelectItem>
                    <SelectItem value="report_status_changed">Report Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                />
              </div>

              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "log entry" : "log entries"} found
          </p>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>

        {/* Logs list */}
        <div className="space-y-3">
          {logs.length === 0 && !loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No audit logs found</p>
              </CardContent>
            </Card>
          ) : (
            logs.map((log) => {
              const config = getActionConfig(log.action);
              return (
                <Card
                  key={log.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-2 rounded-full ${config.color}`}>
                          {config.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">
                              {log.user_profile?.full_name || "Unknown User"}
                            </span>
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            {log.table_name && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {log.table_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(log.created_at), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(log.created_at), "h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Log Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Log Details
              </DialogTitle>
            </DialogHeader>

            {selectedLog && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 pr-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">User</Label>
                      <p className="font-medium">
                        {selectedLog.user_profile?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedLog.user_id}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Action</Label>
                      <Badge className={getActionConfig(selectedLog.action).color}>
                        {getActionConfig(selectedLog.action).label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Table</Label>
                      <p className="font-mono text-sm">
                        {selectedLog.table_name || "—"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Record ID</Label>
                      <p className="font-mono text-sm truncate">
                        {selectedLog.record_id || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Timestamp</Label>
                      <p className="text-sm">
                        {format(new Date(selectedLog.created_at), "PPpp")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">IP Address</Label>
                      <p className="font-mono text-sm">
                        {selectedLog.ip_address || "—"}
                      </p>
                    </div>
                  </div>

                  {selectedLog.old_data && (
                    <div>
                      <Label className="text-muted-foreground">Previous Data</Label>
                      <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                        {formatJsonData(selectedLog.old_data)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.new_data && (
                    <div>
                      <Label className="text-muted-foreground">New Data</Label>
                      <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                        {formatJsonData(selectedLog.new_data)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.user_agent && (
                    <div>
                      <Label className="text-muted-foreground">User Agent</Label>
                      <p className="text-xs text-muted-foreground break-all">
                        {selectedLog.user_agent}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
