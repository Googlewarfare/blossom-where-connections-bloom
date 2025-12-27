import { Heart, Shield, MessageCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Clock,
    title: "3 Conversations Max",
    description:
      "Be fully present. We limit active conversations so you can focus on quality, not quantity.",
    color: "text-primary",
  },
  {
    icon: Shield,
    title: "Safe & Verified",
    description:
      "Trust signals, verification badges, and tools that empower you to feel secure.",
    color: "text-secondary",
  },
  {
    icon: MessageCircle,
    title: "No Ghosting Culture",
    description:
      "End conversations with care. Thoughtful closures matter here.",
    color: "text-primary",
  },
  {
    icon: Heart,
    title: "Intentional Onboarding",
    description:
      "We ask the right questions upfront to help you attract the right people.",
    color: "text-secondary",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold">
            How{" "}
            <span className="gradient-primary bg-clip-text text-primary-foreground">
              Blossom
            </span>{" "}
            is Different
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We've intentionally removed features that destroy healthy relationships.
            What remains is designed for people who show up.
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
                  <div
                    className={`${feature.color} p-3 rounded-2xl bg-muted/50 group-hover:scale-110 transition-smooth`}
                  >
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
