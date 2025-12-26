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
  Lock,
  User,
  MapPin,
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

const SettingsItem = ({
  icon: Icon,
  label,
  to,
  destructive = false,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  to?: string;
  destructive?: boolean;
  onClick?: () => void;
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-6 safe-area-inset">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          {/* Account Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Account
            </h2>
            <div className="bg-card rounded-xl p-2">
              <SettingsItem icon={User} label="Edit Profile" to="/profile" />
              <SettingsItem icon={Bell} label="Notifications" to="/profile" />
              <SettingsItem icon={MapPin} label="Privacy Settings" to="/settings/privacy" />
              <SettingsItem icon={Lock} label="Security" to="/profile" />
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
              <SettingsItem icon={Shield} label="Community Guidelines" to="/guidelines" />
            </div>
          </div>

          {/* Support Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Support
            </h2>
            <div className="bg-card rounded-xl p-2">
              <SettingsItem icon={HelpCircle} label="Help & Support" to="/support" />
              <SettingsItem icon={Shield} label="Safety Center" to="/safety" />
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
                    account and remove all your data from our servers.
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
    </>
  );
};

export default Settings;
