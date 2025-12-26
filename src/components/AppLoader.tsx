import { Heart } from "lucide-react";

interface AppLoaderProps {
  message?: string;
}

const AppLoader = ({ message = "Loading..." }: AppLoaderProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blossom-50 to-background">
      {/* Animated Logo */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blossom-400 flex items-center justify-center animate-pulse">
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>
        
        {/* Pulsing rings */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
        <div 
          className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" 
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Brand name */}
      <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
        Blossom
      </h1>
      
      {/* Loading message */}
      <p className="text-muted-foreground text-sm">{message}</p>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60"
            style={{
              animation: "bounce 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
};

export default AppLoader;
