import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CoinTransaction {
  id: string;
  action: string;
  coins: number;
  description: string | null;
  created_at: string;
}

export function useCvCoins() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!user) { setBalance(0); return; }
    const { data } = await supabase
      .from("cv_coin_balances")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    setBalance(data?.balance ?? 0);
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) { setTransactions([]); return; }
    const { data } = await supabase
      .from("cv_coin_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setTransactions((data as CoinTransaction[]) ?? []);
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setLoading(false);
  }, [fetchBalance, fetchTransactions]);

  useEffect(() => { refresh(); }, [refresh]);

  const spendCoins = useCallback(async (amount: number, description: string) => {
    if (!user || amount <= 0 || amount > balance) return false;
    // Update balance
    const { error: balErr } = await supabase
      .from("cv_coin_balances")
      .update({ balance: balance - amount, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (balErr) return false;
    // Record transaction
    await supabase.from("cv_coin_transactions").insert({
      user_id: user.id,
      action: "Discount Applied",
      coins: -amount,
      description,
    });
    await refresh();
    return true;
  }, [user, balance, refresh]);

  return { balance, transactions, loading, refresh, spendCoins };
}
