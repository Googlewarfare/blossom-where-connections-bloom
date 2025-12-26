import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Heart } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Silent log for analytics - no console.error in production
    if (process.env.NODE_ENV === "development") {
      console.warn("404: Route not found:", location.pathname);
    }
  }, [location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 safe-area-inset">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <Heart className="w-8 h-8 text-primary fill-current" />
          <span className="text-xl font-bold">Blossom</span>
        </div>

        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-8xl font-bold text-muted-foreground/20">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary/40" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Looks like this page has blossomed elsewhere. Let's get you back on
          track to finding your perfect match.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleGoBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button onClick={() => navigate("/")} className="gap-2">
            <Home className="w-4 h-4" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
