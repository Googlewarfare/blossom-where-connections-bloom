import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart, MessageCircle, Shield, Clock, Sparkles } from "lucide-react";

interface TrustSignal {
  id: string;
  label: string;
  icon: typeof Heart;
  color: string;
}

interface UserTrustSignals {
  profile_completeness: number;
  shows_up_consistently: boolean;
  communicates_with_care: boolean;
  community_trusted: boolean;
  verified_identity: boolean;
  thoughtful_closer: boolean;
}

interface TrustSignalsProps {
  userId: string;
  variant?: "badges" | "compact" | "inline";
  maxSignals?: number;
}

const SIGNAL_CONFIG: Record<string, TrustSignal> = {
  shows_up_consistently: {
    id: "shows_up_consistently",
    label: "Shows up consistently",
    icon: Clock,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  communicates_with_care: {
    id: "communicates_with_care",
    label: "Communicates thoughtfully",
    icon: MessageCircle,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  community_trusted: {
    id: "community_trusted",
    label: "Valued by others",
    icon: Heart,
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  verified_identity: {
    id: "verified_identity",
    label: "Verified and trusted",
    icon: Shield,
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  thoughtful_closer: {
    id: "thoughtful_closer",
    label: "Closes with kindness",
    icon: Sparkles,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
};

export function TrustSignals({ userId, variant = "badges", maxSignals = 3 }: TrustSignalsProps) {
  const [signals, setSignals] = useState<UserTrustSignals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const { data } = await supabase
          .from("user_trust_signals")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        setSignals(data);
      } catch (error) {
        console.error("Error fetching trust signals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [userId]);

  if (loading || !signals) return null;

  // Get active signals
  const activeSignals = Object.entries(SIGNAL_CONFIG).filter(([key]) => {
    return signals[key as keyof UserTrustSignals] === true;
  }).slice(0, maxSignals);

  if (activeSignals.length === 0) return null;

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {activeSignals.map(([key, config]) => (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <config.icon className="w-3 h-3 text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{config.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        {activeSignals.map(([key, config]) => (
          <config.icon key={key} className="w-3.5 h-3.5 text-primary/70" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {activeSignals.map(([key, config]) => (
        <Badge
          key={key}
          variant="outline"
          className={`text-xs font-normal ${config.color}`}
        >
          <config.icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      ))}
    </div>
  );
}
