import { Button } from "@/components/ui/button";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/blossom-logo.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen gradient-hero flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blossom-coral rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-blossom-lavender rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float"
          style={{ animationDelay: "4s" }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] [background-size:40px_40px] opacity-30" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full group hover-scale-sm cursor-default">
              <Sparkles className="w-4 h-4 text-primary animate-pulse-soft" />
              <span className="text-sm font-medium bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                Start Your Love Story Today
              </span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] font-display">
                Find Your{" "}
                <span className="text-gradient relative">
                  Perfect Match
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 10C50 2 150 2 298 10"
                      stroke="url(#underline-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="underline-gradient"
                        x1="0"
                        y1="0"
                        x2="300"
                        y2="0"
                      >
                        <stop stopColor="hsl(var(--primary))" />
                        <stop offset="1" stopColor="hsl(var(--accent))" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover meaningful connections through authentic profiles and
                real conversations. Your love story begins here.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/discover">
                <Button
                  variant="premium"
                  size="xl"
                  className="group w-full sm:w-auto"
                >
                  Start Browsing
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  variant="glass"
                  size="xl"
                  className="w-full sm:w-auto"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Sign Up Free
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 justify-center lg:justify-start pt-6">
              <div className="text-center lg:text-left group">
                <div className="text-4xl font-bold text-gradient font-display group-hover:scale-105 transition-transform">
                  50K+
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Happy Couples
                </div>
              </div>
              <div className="w-px h-14 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="text-center lg:text-left group">
                <div className="text-4xl font-bold text-gradient font-display group-hover:scale-105 transition-transform flex items-center gap-1">
                  4.8
                  <span className="text-blossom-gold">★</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  App Rating
                </div>
              </div>
              <div className="w-px h-14 bg-gradient-to-b from-transparent via-border to-transparent hidden sm:block" />
              <div className="text-center lg:text-left group hidden sm:block">
                <div className="text-4xl font-bold text-gradient font-display group-hover:scale-105 transition-transform">
                  100%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Verified Profiles
                </div>
              </div>
            </div>
          </div>

          {/* Right content - Logo */}
          <div
            className="flex-1 flex items-center justify-center animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-accent/30 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
              {/* Animated ring */}
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-primary to-accent opacity-20 group-hover:opacity-40 transition-opacity animate-spin-slow" />
              <img
                src={logo}
                alt="Blossom - Blossom into Love"
                className="relative w-full max-w-md rounded-3xl shadow-elevated transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-glow"
              />
              {/* Floating hearts */}
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-card shadow-card flex items-center justify-center animate-bounce-soft">
                <Heart className="w-6 h-6 text-primary fill-primary" />
              </div>
              <div
                className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center animate-bounce-soft"
                style={{ animationDelay: "0.5s" }}
              >
                <Sparkles className="w-5 h-5 text-blossom-gold" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;