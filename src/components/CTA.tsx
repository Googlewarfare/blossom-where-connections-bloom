import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-20 px-4 gradient-hero">
      <div className="container mx-auto max-w-4xl">
        <div className="relative rounded-3xl overflow-hidden shadow-soft">
          {/* Gradient background */}
          <div className="absolute inset-0 gradient-primary opacity-95" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 text-center space-y-6 text-primary-foreground">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <Heart className="w-8 h-8 fill-current" />
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold">
              Ready to Date Differently?
            </h2>

            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Blossom is for people tired of swipe culture. 
              If you want to build something real, you're in the right place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-smooth group"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/success-stories">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 transition-smooth"
                >
                  Read Success Stories
                </Button>
              </Link>
            </div>

            <div className="pt-6 text-sm opacity-80">
              <p>No swiping. No games. Just real people looking for real love.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
