import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface ActiveSubscription {
  product_id: string;
  subscription_end: string;
  subscription_id: string;
}

interface SubscriptionStatus {
  subscribed: boolean;
  subscriptions: ActiveSubscription[];
}

// Premium feature product IDs
export const PREMIUM_FEATURES = {
  UNLIMITED_SUPER_LIKES: "prod_TWguag6wQXdfSB",
  READ_RECEIPTS: "prod_TWgzMdfHydGfMG",
  BLOSSOM_PREMIUM: "prod_TfCzZZYDeHQlyp",
  INTENTIONAL_MEMBERSHIP: "prod_ThcAlr6eJNzYh0",
} as const;

// Premium price IDs for checkout
export const PREMIUM_PRICE_ID = "price_1ShsZ5D2qFqWAuNmmh2UjMgz";
export const INTENTIONAL_MEMBERSHIP_PRICE_ID = "price_1SkCwTD2qFqWAuNmu8XaPFLH";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  subscriptionStatus: null,
  checkSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);

  const checkSubscription = async () => {
    try {
      // Get fresh session to avoid using stale tokens
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        setSubscriptionStatus(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "check-subscription",
        {
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        },
      );
      
      if (error) {
        const status = (error as any)?.context?.status ?? (error as any)?.status;

        // Treat auth failures as non-fatal (user may have signed out / session not ready).
        if (status === 401) {
          setSubscriptionStatus(null);
          return;
        }

        console.error("Error checking subscription:", error);
        return;
      }

      setSubscriptionStatus(data);
    } catch {
      // Subscription check should never take down the app.
      return;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Check subscription on auth change
      if (session) {
        checkSubscription();
      } else {
        setSubscriptionStatus(null);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Check subscription on initial load
      if (session) {
        checkSubscription();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Periodic subscription check (every 60 seconds)
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [session]);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, subscriptionStatus, checkSubscription }}
    >
      {children}
    </AuthContext.Provider>
  );
};
