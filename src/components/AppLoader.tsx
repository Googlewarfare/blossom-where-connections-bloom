import { Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AppLoaderProps {
  message?: string;
  showProgress?: boolean;
}

const AppLoader = ({ message = "Finding your spark...", showProgress = false }: AppLoaderProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blossom-50 via-background to-blossom-50/30 overflow-hidden relative">
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-blossom-300/10 blur-3xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            style={{
              left: `${15 + (i * 15)}%`,
              top: `${20 + (i * 10)}%`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div 
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Animated Logo */}
        <div className="relative mb-8">
          {/* Outer glow ring */}
          <motion.div
            className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-blossom-400/20 to-primary/20 blur-xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/40"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blossom-400/30"
            animate={{ scale: [1, 2], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
          />
          
          {/* Main logo circle */}
          <motion.div 
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-blossom-400 to-primary flex items-center justify-center shadow-lg shadow-primary/30"
            animate={{ 
              boxShadow: [
                "0 10px 40px -10px hsl(var(--primary) / 0.3)",
                "0 10px 60px -10px hsl(var(--primary) / 0.5)",
                "0 10px 40px -10px hsl(var(--primary) / 0.3)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-12 h-12 text-white fill-white drop-shadow-sm" />
            </motion.div>
          </motion.div>

          {/* Floating sparkles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                y: [-10, -30, -10],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeInOut",
              }}
              style={{
                top: `${10 + i * 15}%`,
                left: i === 1 ? '85%' : `${i * 30}%`,
              }}
            >
              <Sparkles className="w-4 h-4 text-blossom-400" />
            </motion.div>
          ))}
        </div>

        {/* Brand name with gradient */}
        <motion.h1 
          className="text-3xl font-display font-bold bg-gradient-to-r from-primary via-blossom-500 to-primary bg-clip-text text-transparent mb-3"
          animate={{ 
            backgroundPosition: ["0%", "100%", "0%"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% auto" }}
        >
          Blossom
        </motion.h1>
        
        {/* Loading message */}
        <motion.p 
          className="text-muted-foreground text-sm font-medium"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>

        {/* Elegant loading indicator */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-blossom-400"
              animate={{
                y: [0, -12, 0],
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Optional progress bar */}
        {showProgress && (
          <motion.div 
            className="mt-8 w-48 h-1 bg-muted rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-blossom-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AppLoader;
