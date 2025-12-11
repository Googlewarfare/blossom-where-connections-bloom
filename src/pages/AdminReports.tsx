import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  User,
} from "lucide-react";

type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";
type ReportCategory = "fake_profile" | "inappropriate_photos" | "harassment" | "spam" | "scam" | "underage" | "other";

interface Report {
  id: string;
  reporter_id: string | null;
  reported_user_id: string;
  category: ReportCategory;
  description: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter?: { full_name: string | null };
  reported_user?: { full_name: string | null; photo_url?: string };
}

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  fake_profile: "Fake Profile",
  inappropriate_photos: "Inappropriate Photos",
  harassment: "Harassment",
  spam: "Spam",
  scam: "Scam/Fraud",
  underage: "Underage User",
  other: "Other",
};

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500", icon: <Clock className="h-3 w-3" /> },
  reviewing: { label: "Reviewing", color: "bg-blue-500/10 text-blue-500", icon: <Eye className="h-3 w-3" /> },
  resolved: { label: "Resolved", color: "bg-green-500/10 text-green-500", icon: <CheckCircle className="h-3 w-3" /> },
  dismissed: { label: "Dismissed", color: "bg-muted text-muted-foreground", icon: <XCircle className="h-3 w-3" /> },
};

export default function AdminReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<ReportStatus>("pending");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    checkAccessAndFetchReports();
  }, [user]);

  const checkAccessAndFetchReports = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has admin or moderator role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdminOrMod = roles?.some(r => r.role === "admin" || r.role === "moderator");
      setHasAccess(!!isAdminOrMod);

      if (isAdminOrMod) {
        await fetchReports();
      }
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const { data: reportsData, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile info for reporters and reported users
      const reporterIds = [...new Set(reportsData?.map(r => r.reporter_id).filter(Boolean) || [])];
      const reportedIds = [...new Set(reportsData?.map(r => r.reported_user_id) || [])];
      const allUserIds = [...new Set([...reporterIds, ...reportedIds])];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", allUserIds);

      const { data: photos } = await supabase
        .from("profile_photos")
        .select("user_id, photo_url")
        .in("user_id", reportedIds)
        .eq("is_primary", true);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const photoMap = new Map(photos?.map(p => [p.user_id, p.photo_url]) || []);

      const enrichedReports = reportsData?.map(report => ({
        ...report,
        reporter: report.reporter_id ? profileMap.get(report.reporter_id) : undefined,
        reported_user: {
          full_name: profileMap.get(report.reported_user_id)?.full_name,
          photo_url: photoMap.get(report.reported_user_id),
        },
      })) || [];

      setReports(enrichedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    }
  };

  const handleUpdateReport = async () => {
    if (!selectedReport || !user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: newStatus,
          admin_notes: adminNotes.trim() || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedReport.id);

      if (error) throw error;

      toast.success("Report updated successfully");
      setSelectedReport(null);
      await fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report");
    } finally {
      setIsUpdating(false);
    }
  };

  const openReportDialog = (report: Report) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || "");
    setNewStatus(report.status);
  };

  const filteredReports = reports.filter(r => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

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
              You don't have permission to access the reports panel.
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Trust & Safety Reports
            </h1>
            <p className="text-muted-foreground">Review and manage user reports</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
              <Badge variant="secondary" className="ml-1">
                {reports.filter(r => r.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reviewing">
              <Eye className="h-4 w-4 mr-2" />
              Reviewing
            </TabsTrigger>
            <TabsTrigger value="resolved">
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolved
            </TabsTrigger>
            <TabsTrigger value="dismissed">
              <XCircle className="h-4 w-4 mr-2" />
              Dismissed
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No reports found</p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={report.reported_user?.photo_url} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {report.reported_user?.full_name || "Unknown User"}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {CATEGORY_LABELS[report.category]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Reported by: {report.reporter?.full_name || "Anonymous"}
                          </p>
                          {report.description && (
                            <p className="text-sm mt-2 line-clamp-2">{report.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString("en-US", {
                              dateStyle: "medium",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={STATUS_CONFIG[report.status].color}>
                          {STATUS_CONFIG[report.status].icon}
                          <span className="ml-1">{STATUS_CONFIG[report.status].label}</span>
                        </Badge>
                        <Button size="sm" onClick={() => openReportDialog(report)}>
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Report</DialogTitle>
              <DialogDescription>
                Update the status and add notes for this report
              </DialogDescription>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedReport.reported_user?.photo_url} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {selectedReport.reported_user?.full_name || "Unknown User"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Category: </span>
                    {CATEGORY_LABELS[selectedReport.category]}
                  </div>
                  {selectedReport.description && (
                    <p className="text-sm">{selectedReport.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ReportStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedReport(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateReport} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Report"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
