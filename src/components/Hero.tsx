import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/blossom-logo.jpg";
const Hero = () => {
  return <section className="relative min-h-screen gradient-hero flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blossom-coral rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{
        animationDelay: "2s"
      }} />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-card">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Start Your Love Story Today</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Find Your{" "}
                <span className="gradient-primary bg-clip-text text-primary bg-secondary">
                  Perfect Match
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Discover meaningful connections through authentic profiles and real conversations. Start your love story today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/discover">
                <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-soft hover:shadow-lg transition-smooth group">
                  Start Browsing
                  <Heart className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full border-2 hover:bg-card/50 transition-smooth">
                  Sign Up
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 justify-center lg:justify-start pt-4">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Couples</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">App Rating</div>
              </div>
            </div>
          </div>

          {/* Right content - Logo */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-3xl blur-2xl opacity-30 animate-pulse" />
              <img src={logo} alt="Blossom - Blossom into Love" className="relative w-full max-w-md rounded-3xl shadow-soft transition-smooth hover:scale-105" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;