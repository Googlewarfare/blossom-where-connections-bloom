import { Heart, Users, Shield, Clock, MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const principles = [
  {
    icon: Clock,
    title: "Slow is meaningful",
    description: "Real connections take time. We limit active conversations so you can be fully present.",
  },
  {
    icon: MessageCircle,
    title: "Communication over convenience",
    description: "No silent disappearances. When you're done, close with kindness.",
  },
  {
    icon: Shield,
    title: "Safety as foundation",
    description: "Trust indicators, verification, and tools that empower — not alarm.",
  },
  {
    icon: Users,
    title: "Quality over quantity",
    description: "Fewer matches means deeper connections. We're not optimizing for dopamine.",
  },
];

export function Manifesto() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Our Philosophy</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 font-display">
            Why Blossom Exists
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We believe love grows when people slow down, show up, and act with care. 
            If a feature increases speed, volume, or emotional detachment — it doesn't belong here.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <principle.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{principle.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 glass px-6 py-4 rounded-2xl">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <p className="text-sm font-medium">
              Blossom isn't for everyone — and that's intentional.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}