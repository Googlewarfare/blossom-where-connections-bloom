import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Menu, User, LogOut, Sparkles, Crown, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "@/components/NavLink";
import { NotificationCenter } from "@/components/NotificationCenter";
import logo from "@/assets/blossom-logo.jpg";

const navLinks = [
  { to: "/discover", label: "Discover" },
  { to: "/matches", label: "Matches" },
  { to: "/events", label: "Events" },
  { to: "/success-stories", label: "Success Stories" },
  { to: "/safety", label: "Safety" },
  { to: "/premium", label: "Premium", icon: Crown, premium: true },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminOrMod, setIsAdminOrMod] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdminOrMod(false);
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      setIsAdminOrMod(roles?.some(r => r.role === "admin" || r.role === "moderator") || false);
    };

    checkAdminRole();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass safe-area-top">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src={logo}
              alt="Blossom"
              className="relative w-10 h-10 rounded-full object-cover ring-2 ring-border/50 group-hover:ring-primary/50 transition-all group-hover:scale-105"
            />
          </div>
          <span className="text-xl font-bold hidden sm:inline-block font-display tracking-tight">
            Blossom
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-lg hover:bg-muted/50 relative group ${
                link.premium ? "text-blossom-gold hover:text-blossom-gold" : ""
              }`}
              activeClassName="text-primary bg-primary/10"
            >
              <span className="flex items-center gap-1.5">
                {link.icon && (
                  <link.icon
                    className={`w-4 h-4 ${
                      link.premium ? "animate-pulse-soft" : ""
                    }`}
                  />
                )}
                {link.label}
              </span>
              {/* Hover underline */}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all duration-300 rounded-full" />
            </NavLink>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user && <NotificationCenter />}
          {user ? (
            <>
              {isAdminOrMod && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="gap-2 hover:bg-primary/10 text-primary"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="gap-2 hover:bg-primary/10"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="premium" size="sm" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 lg:hidden">
          {user && <NotificationCenter />}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center gap-3 p-6 border-b border-border bg-gradient-to-br from-muted/30 to-transparent">
                  <img
                    src={logo}
                    alt="Blossom"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                  />
                  <div>
                    <span className="text-xl font-bold font-display">
                      Blossom
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Find your perfect match
                    </p>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto scrollbar-thin">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all ${
                        link.premium
                          ? "text-blossom-gold hover:text-blossom-gold bg-blossom-gold/5"
                          : ""
                      }`}
                      activeClassName="text-primary bg-primary/10"
                    >
                      {link.icon && <link.icon className="w-5 h-5" />}
                      {link.label}
                      {link.premium && (
                        <Sparkles className="w-4 h-4 ml-auto animate-pulse-soft" />
                      )}
                    </NavLink>
                  ))}
                </nav>

                {/* Mobile Auth */}
                <div className="p-4 border-t border-border space-y-3 bg-gradient-to-t from-muted/20 to-transparent">
                  {user ? (
                    <>
                      {isAdminOrMod && (
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-3 h-12 text-primary border-primary/20"
                          onClick={() => {
                            navigate("/admin");
                            setIsOpen(false);
                          }}
                        >
                          <Shield className="w-5 h-5" />
                          Admin Dashboard
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-12"
                        onClick={() => {
                          navigate("/profile");
                          setIsOpen(false);
                        }}
                      >
                        <User className="w-5 h-5" />
                        My Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full h-12">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="premium" className="w-full h-12 gap-2">
                          <Heart className="w-5 h-5" />
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
