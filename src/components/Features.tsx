import { Heart, Shield, MessageCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Heart,
    title: "Smart Matching",
    description: "Our AI-powered algorithm learns your preferences to find compatible matches that truly resonate with you.",
    color: "text-primary",
  },
  {
    icon: Shield,
    title: "Safe & Verified",
    description: "Every profile is verified with multiple security checks to ensure authentic connections and peace of mind.",
    color: "text-secondary",
  },
  {
    icon: MessageCircle,
    title: "Meaningful Conversations",
    description: "Start conversations with thoughtful prompts designed to help you connect on a deeper level.",
    color: "text-primary",
  },
  {
    icon: Sparkles,
    title: "Unique Experiences",
    description: "Discover virtual date ideas and activities to make every interaction special and memorable.",
    color: "text-secondary",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold">
            Why Choose <span className="gradient-primary bg-clip-text text-transparent">Blossom</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We've built features that help you find genuine connections and nurture meaningful relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="p-8 border-2 hover:border-primary/50 transition-smooth shadow-card hover:shadow-soft group cursor-pointer bg-card/50 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} p-3 rounded-2xl bg-muted/50 group-hover:scale-110 transition-smooth`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
