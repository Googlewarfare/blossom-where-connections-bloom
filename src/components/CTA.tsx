import { Button } from "@/components/ui/button";
import { Heart, Download } from "lucide-react";

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
              Ready to Find Your Match?
            </h2>
            
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of singles who have found love through Blossom. Download the app today and start your journey to finding meaningful connections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-smooth group"
              >
                <Download className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Download App
              </Button>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 transition-smooth"
              >
                Create Account
              </Button>
            </div>
            
            <div className="pt-6 flex items-center justify-center gap-2 text-sm opacity-80">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/40 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-white/40 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-white/40 border-2 border-white" />
              </div>
              <span>Join 50,000+ happy users</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
