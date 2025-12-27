import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/discover", icon: Search, label: "Discover" },
  { to: "/matches", icon: Heart, label: "Matches" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/profile", icon: User, label: "Profile" },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hide on auth, onboarding, and admin pages
  const hiddenPaths = ["/auth", "/onboarding", "/admin"];
  const shouldHide = hiddenPaths.some((path) => location.pathname.startsWith(path));

  if (shouldHide) return null;

  const handleNavClick = (to: string) => {
    // Redirect to auth if not logged in and trying to access protected routes
    const protectedRoutes = ["/matches", "/chat", "/profile"];
    if (!user && protectedRoutes.includes(to)) {
      navigate("/auth");
      return;
    }
    navigate(to);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

          return (
            <button
              key={item.to}
              onClick={() => handleNavClick(item.to)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-opacity",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
