import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function AdminCvCoins() {
  const [balances, setBalances] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [bRes, tRes, pRes] = await Promise.all([
        supabase.from("cv_coin_balances").select("*").order("balance", { ascending: false }),
        supabase.from("cv_coin_transactions").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      setBalances(bRes.data || []);
      setTransactions(tRes.data || []);
      const map: Record<string, any> = {};
      (pRes.data || []).forEach((p: any) => { map[p.id] = p; });
      setProfiles(map);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">CV Coins</h1>

      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader><CardTitle className="text-lg">User Balances</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155]">
                <TableHead>User</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.map((b) => {
                const user = profiles[b.user_id];
                return (
                  <TableRow key={b.id} className="border-[#334155]">
                    <TableCell className="text-sm">{user?.email || user?.full_name || "—"}</TableCell>
                    <TableCell className="font-bold text-primary">{b.balance}</TableCell>
                    <TableCell className="text-sm">{new Date(b.updated_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
              {balances.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No balances</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader><CardTitle className="text-lg">Recent Transactions</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155]">
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const user = profiles[t.user_id];
                return (
                  <TableRow key={t.id} className="border-[#334155]">
                    <TableCell className="text-sm">{user?.email || user?.full_name || "—"}</TableCell>
                    <TableCell className="text-sm">{t.action}</TableCell>
                    <TableCell className={t.coins > 0 ? "text-green-400" : "text-red-400"}>{t.coins > 0 ? "+" : ""}{t.coins}</TableCell>
                    <TableCell className="text-sm">{t.description || "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
              {transactions.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No transactions</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
