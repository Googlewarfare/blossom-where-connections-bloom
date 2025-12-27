import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Shield,
  Users,
  Sparkles,
  Target,
  Eye,
  Zap,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Heart,
    title: "Authenticity",
    description:
      "We believe real connections start with real people. Every profile on Blossom is verified to ensure genuine interactions.",
    color: "text-rose-500",
  },
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Your security is our priority. From background checks to date check-ins, we've built features to keep you safe.",
    color: "text-emerald-500",
  },
  {
    icon: Users,
    title: "Inclusivity",
    description:
      "Love knows no boundaries. We welcome everyone and celebrate diversity in all its beautiful forms.",
    color: "text-blue-500",
  },
  {
    icon: Sparkles,
    title: "Meaningful Matches",
    description:
      "Our smart compatibility algorithm goes beyond surface-level to connect people who truly click.",
    color: "text-amber-500",
  },
];

const howItWorks = [
  {
    step: "01",
    icon: Users,
    title: "Create Your Profile",
    description:
      "Sign up and build your authentic profile with photos, interests, and what you're looking for in a partner.",
  },
  {
    step: "02",
    icon: Eye,
    title: "Discover Matches",
    description:
      "Browse through curated profiles based on your preferences and our compatibility algorithm.",
  },
  {
    step: "03",
    icon: MessageCircle,
    title: "Connect & Chat",
    description:
      "When you both like each other, start a conversation. Use our icebreaker questions to break the ice!",
  },
  {
    step: "04",
    icon: Heart,
    title: "Meet & Blossom",
    description:
      "Take your connection offline. Use our date check-in feature for added safety on your first dates.",
  },
];

const stats = [
  { value: "50K+", label: "Happy Couples" },
  { value: "2M+", label: "Active Users" },
  { value: "4.8★", label: "App Rating" },
  { value: "150+", label: "Countries" },
];

const About = () => {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="w-full max-w-4xl mx-auto text-center relative z-10 px-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            About Blossom
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Where Real Love <span className="text-primary">Blossoms</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            We started Blossom with a simple belief: everyone deserves to find
            genuine love. Our mission is to create meaningful connections
            through authenticity, safety, and smart technology.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="w-full max-w-7xl mx-auto px-4 box-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="w-full max-w-6xl mx-auto px-4 box-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 text-primary mb-4">
                <Target className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Our Mission
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Creating Connections That Last a Lifetime
              </h2>
              <p className="text-muted-foreground mb-6">
                In a world of fleeting swipes and superficial matches, Blossom
                stands apart. We've built a platform that prioritizes depth over
                breadth, quality over quantity, and real compatibility over
                algorithms that keep you swiping.
              </p>
              <p className="text-muted-foreground mb-8">
                Our team of relationship experts, psychologists, and engineers
                work together to create an experience that truly understands
                what makes a relationship work. From our detailed compatibility
                scoring to our unique daily questions, every feature is designed
                to help you find someone who gets you.
              </p>
              <Link to="/discover">
                <Button size="lg" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Start Your Journey
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((value) => (
                <Card
                  key={value.title}
                  className="border-border/50 hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <value.icon className={`w-8 h-8 ${value.color} mb-4`} />
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="w-full max-w-5xl mx-auto px-4 box-border">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Blossom Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Finding love shouldn't be complicated. Here's how Blossom makes it
              simple.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-background rounded-2xl p-6 border border-border h-full">
                  <div className="text-6xl font-bold text-primary/10 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="w-full max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Person?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of singles who've found their perfect match on
            Blossom. Your love story is waiting to begin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2 px-8">
                <Heart className="w-5 h-5" />
                Create Free Account
              </Button>
            </Link>
            <Link to="/success-stories">
              <Button variant="outline" size="lg" className="px-8">
                Read Success Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
