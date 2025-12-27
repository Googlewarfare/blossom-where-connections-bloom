import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackgroundCheckRequest from "@/components/BackgroundCheckRequest";
import DateCheckin from "@/components/DateCheckin";

const Safety = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="w-full max-w-2xl mx-auto py-8 px-4 box-border">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Safety Center
            </h1>
            <p className="text-muted-foreground">
              Tools to help keep you safe while dating
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <BackgroundCheckRequest />
          <DateCheckin />

          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you ever feel unsafe, please contact local emergency services
              immediately.
            </p>
            <Button variant="destructive" size="lg">
              Emergency Resources
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;
