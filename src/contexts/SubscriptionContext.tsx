import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription {
  plan: "monthly" | "yearly";
  status: string;
  start_date: string;
  expiry_date: string;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isSubscribed: boolean;
  loading: boolean;
  subscribe: (plan: "monthly" | "yearly") => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isSubscribed: false,
  loading: true,
  subscribe: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()
      .then(({ data }) => {
        if (data && new Date(data.expiry_date) > new Date()) {
          setSubscription(data as Subscription);
        } else {
          setSubscription(null);
        }
        setLoading(false);
      });
  }, [user]);

  const isSubscribed = !!subscription;

  const subscribe = async (plan: "monthly" | "yearly") => {
    if (!user) return;
    const now = new Date();
    const expiry = new Date(now);
    if (plan === "monthly") expiry.setMonth(expiry.getMonth() + 1);
    else expiry.setFullYear(expiry.getFullYear() + 1);

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan,
          status: "active",
          start_date: now.toISOString(),
          expiry_date: expiry.toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .maybeSingle();

    if (!error && data) {
      setSubscription(data as Subscription);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, isSubscribed, loading, subscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
