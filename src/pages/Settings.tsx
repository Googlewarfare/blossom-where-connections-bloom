import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ChevronRight,
  Shield,
  FileText,
  HelpCircle,
  Trash2,
  LogOut,
  Bell,
  MapPin,
  User,
  Pause,
  Play,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PauseModeDialog } from "@/components/PauseModeDialog";
import { usePauseMode } from "@/hooks/use-pause-mode";

const SettingsItem = ({
  icon: Icon,
  label,
  to,
  destructive = false,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  to?: string;
  destructive?: boolean;
  onClick?: () => void;
  badge?: string;
}) => {
  const content = (
    <div
      className={`flex items-center justify-between py-4 px-1 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors ${
        destructive ? "text-destructive" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
        {badge && (
          <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {to && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
};

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const { isPaused, refresh: refreshPauseStatus } = usePauseMode();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Even if server signout fails, clear local session
    }
    // Always navigate to auth page
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real app, you'd call an edge function to properly delete user data
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Account deletion requested. You will receive a confirmation email.");
      navigate("/");
    } catch (error) {
      toast.error("Failed to process account deletion request");
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings - Blossom</title>
        <meta name="description" content="Manage your Blossom account settings, privacy, and preferences." />
      </Helmet>

      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
        <div className="w-full max-w-lg mx-auto px-4 py-6 box-border">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          {/* Pause Mode Banner */}
          {isPaused && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Pause className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Dating is paused
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    You're hidden from discovery
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPauseDialog(true)}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
              </div>
            </div>
          )}

          {/* Account Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Account
            </h2>
            <div className="bg-card rounded-xl p-2">
              <SettingsItem icon={User} label="Edit Profile" to="/profile" />
              <SettingsItem icon={Bell} label="Notifications" to="/profile" />
              <SettingsItem icon={MapPin} label="Privacy Settings" to="/settings/privacy" />
              <SettingsItem icon={Shield} label="Security Dashboard" to="/settings/security" />
              <SettingsItem
                icon={isPaused ? Play : Pause}
                label={isPaused ? "Resume Dating" : "Pause Dating"}
                onClick={() => setShowPauseDialog(true)}
                badge={isPaused ? "Paused" : undefined}
              />
            </div>
          </div>

          {/* Legal Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Legal
            </h2>
            <div className="bg-card rounded-xl p-2">
              <SettingsItem icon={Shield} label="Privacy Policy" to="/privacy" />
              <SettingsItem icon={FileText} label="Terms of Service" to="/terms" />
              <SettingsItem icon={Shield} label="Safety Disclaimer" to="/safety" />
              <SettingsItem icon={FileText} label="Community Guidelines" to="/community-guidelines" />
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Support
            </h2>
            <div className="bg-card rounded-xl p-2">
              <SettingsItem icon={HelpCircle} label="Help & Support" to="/support" />
              <SettingsItem icon={Shield} label="Safety Center" to="/safety-center" />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Danger Zone */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive border-destructive/50 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers, as described
                    in our Terms of Service.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Blossom Dating v1.0.0
          </p>
        </div>
      </div>

      <PauseModeDialog
        open={showPauseDialog}
        onOpenChange={setShowPauseDialog}
        onStatusChange={refreshPauseStatus}
      />
    </>
  );
};

export default Settings;
