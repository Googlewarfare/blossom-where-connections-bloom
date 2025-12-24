import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
} as const;

// Premium price ID for checkout
export const PREMIUM_PRICE_ID = "price_1ShsZ5D2qFqWAuNmmh2UjMgz";

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
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  const checkSubscription = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check subscription on auth change
        if (session) {
          checkSubscription();
        } else {
          setSubscriptionStatus(null);
        }
      }
    );

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
    <AuthContext.Provider value={{ user, session, loading, subscriptionStatus, checkSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};
