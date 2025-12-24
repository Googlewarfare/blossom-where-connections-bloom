import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Menu, X, User, LogOut, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/blossom-logo.jpg";

const navLinks = [
  { to: "/discover", label: "Discover" },
  { to: "/matches", label: "Matches" },
  { to: "/events", label: "Events" },
  { to: "/success-stories", label: "Success Stories" },
  { to: "/safety", label: "Safety" },
  { to: "/premium", label: "Premium", icon: Sparkles },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src={logo} 
            alt="Blossom" 
            className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition-transform"
          />
          <span className="text-xl font-bold hidden sm:inline-block">
            Blossom
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              activeClassName="text-primary bg-primary/10"
            >
              <span className="flex items-center gap-1.5">
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="gap-2"
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
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center gap-2 pb-6 border-b border-border">
                <img 
                  src={logo} 
                  alt="Blossom" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-xl font-bold">Blossom</span>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-1 py-6 flex-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                    activeClassName="text-primary bg-primary/10"
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              {/* Mobile Auth */}
              <div className="pt-6 border-t border-border space-y-3">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        navigate("/profile");
                        setIsOpen(false);
                      }}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-muted-foreground"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full gap-2">
                        <Heart className="w-4 h-4" />
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
    </header>
  );
};

export default Navbar;
