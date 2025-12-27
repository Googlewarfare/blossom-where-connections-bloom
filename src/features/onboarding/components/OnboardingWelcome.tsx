import { motion } from "framer-motion";
import { Heart, Users, Shield, Sparkles } from "lucide-react";

export function OnboardingWelcome() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
        >
          <Heart className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold">
          Welcome to{" "}
          <span className="text-gradient">Blossom</span>
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          This isn't just another dating app. Blossom is designed for people who want 
          <span className="text-foreground font-medium"> real, authentic connections</span>—without 
          the games, the ghosting, or the burnout.
        </p>
      </div>

      <div className="grid gap-4">
        {[
          {
            icon: Users,
            title: "Fewer matches, deeper connections",
            description: "We limit active conversations so you can focus on who matters.",
          },
          {
            icon: Shield,
            title: "Safety & respect first",
            description: "No silent disappearing. We encourage thoughtful communication.",
          },
          {
            icon: Sparkles,
            title: "Intentionality over dopamine",
            description: "Built for people who show up—not swipe addicts.",
          },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border/50"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Ready to build something real? Let's get started.
      </p>
    </motion.div>
  );
}
