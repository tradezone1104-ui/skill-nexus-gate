import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Plus, 
  Search, 
  History,
  TrendingUp,
  Settings as SettingsIcon,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCvCoins() {
  const { toast } = useToast();
  const [balances, setBalances] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [manageCoins, setManageCoins] = useState<string>("");
  const [manageDescription, setManageDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, tRes, pRes, rRes] = await Promise.all([
        supabase.from("cv_coin_balances").select("*").order("balance", { ascending: false }),
        supabase.from("cv_coin_transactions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("referrals" as any).select("*")
      ]);

      setBalances(bRes.data || []);
      setTransactions(tRes.data || []);
      setReferrals(rRes.data || []);
      
      const map: Record<string, any> = {};
      (pRes.data || []).forEach((p: any) => { map[p.id] = p; });
      setProfiles(map);
    } catch (error) {
      console.error("Error loading CV Coins data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dashboard Stats
  const stats = useMemo(() => {
    const totalDistributed = transactions
      .filter(t => t.action === "credit")
      .reduce((acc, t) => acc + t.coins, 0);
    
    const totalRedeemed = transactions
      .filter(t => t.action === "debit")
      .reduce((acc, t) => acc + Math.abs(t.coins), 0);
    
    const usersWithCoins = balances.filter(b => b.balance > 0).length;

    // Referral stats
    const totalReferrals = referrals.length;
    const topReferrers = [...balances]
      .sort((a, b) => (b.balance || 0) - (a.balance || 0))
      .slice(0, 5);

    return {
      totalDistributed,
      totalRedeemed,
      usersWithCoins,
      totalReferrals,
      topReferrers
    };
  }, [balances, transactions, referrals]);

  const filteredBalances = useMemo(() => {
    return balances.filter(b => {
      const user = profiles[b.user_id];
      const searchStr = `${user?.full_name || ""} ${user?.email || ""}`.toLowerCase();
      return searchStr.includes(search.toLowerCase());
    });
  }, [balances, profiles, search]);

  const handleManageCoins = async () => {
    if (!selectedUserId || !manageCoins || !manageDescription) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields to manage coins.",
        variant: "destructive"
      });
      return;
    }

    const coinsAmount = parseInt(manageCoins);
    if (isNaN(coinsAmount)) return;

    setIsSubmitting(true);
    try {
      const action = coinsAmount > 0 ? "credit" : "debit";
      
      // 1. Update balance (using upsert logic for safety)
      const currentBalanceObj = balances.find(b => b.user_id === selectedUserId);
      const currentBalance = currentBalanceObj ? currentBalanceObj.balance : 0;
      const newBalance = currentBalance + coinsAmount;

      const { error: balanceError } = await supabase
        .from("cv_coin_balances")
        .upsert({
          user_id: selectedUserId,
          balance: newBalance,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

      if (balanceError) throw balanceError;

      // 2. Insert transaction
      const { error: transError } = await supabase
        .from("cv_coin_transactions")
        .insert({
          user_id: selectedUserId,
          coins: coinsAmount,
          action: action,
          description: manageDescription,
          created_at: new Date().toISOString()
        });

      if (transError) throw transError;

      toast({
        title: "Success",
        description: `Successfully ${coinsAmount > 0 ? "credited" : "debited"} ${Math.abs(coinsAmount)} coins.`,
      });

      setIsManageModalOpen(false);
      setSelectedUserId("");
      setManageCoins("");
      setManageDescription("");
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update coins",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20 min-h-[400px] items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 pb-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 font-inter">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            CV Coins Management
          </h1>
          <p className="text-[13px] text-muted-foreground opacity-70">Monitor distribution, transactions, and user rewards.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsManageModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-6 rounded-xl shadow-glow transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Manage Coins
          </Button>
          <Button variant="outline" size="icon" onClick={loadData} className="rounded-xl border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05]">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Top Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Coins Distributed", value: stats.totalDistributed.toLocaleString(), icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Coins Redeemed", value: stats.totalRedeemed.toLocaleString(), icon: ArrowDownRight, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Users with Coins", value: stats.usersWithCoins, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Referrals", value: stats.totalReferrals, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/[0.02] backdrop-blur-md border-white/[0.05] rounded-[16px] transition-all duration-300 group hover:translate-y-[-2px] hover:shadow-lg hover:border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest opacity-50 border-white/10 font-bold">Realtime</Badge>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-[13px] font-medium text-muted-foreground opacity-70 uppercase tracking-wider">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Balances Table */}
        <Card className="lg:col-span-2 bg-white/[0.02] backdrop-blur-md border-white/[0.05] rounded-[20px] overflow-hidden border">
          <CardHeader className="p-6 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-[16px] font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  User Coin Balances
                </CardTitle>
                <CardDescription className="text-[12px]">Current coin holdings across all active users.</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-70" />
                <Input 
                  placeholder="Search user..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-background/30 border-white/[0.05] rounded-xl text-xs" 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.05] hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold opacity-50 pl-6">User</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold opacity-50">Balance</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold opacity-50">Last Activity</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold opacity-50 pr-6 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBalances.map((b) => {
                    const user = profiles[b.user_id];
                    return (
                      <TableRow key={b.id} className="border-white/[0.05] group transition-colors hover:bg-white/[0.02]">
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[12px] font-bold text-primary">
                              {user?.full_name?.[0] || "?"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-foreground leading-none mb-1">{user?.full_name || "Unknown User"}</span>
                              <span className="text-[11px] text-muted-foreground opacity-60 leading-none">{user?.email || "No email"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Coins className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-bold text-foreground">{b.balance.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[12px] text-muted-foreground opacity-70">
                            {new Date(b.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedUserId(b.user_id);
                              setIsManageModalOpen(true);
                            }}
                            className="h-8 rounded-lg text-[11px] font-bold hover:bg-primary/10 hover:text-primary"
                          >
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredBalances.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <Search className="h-8 w-8 mb-2" />
                          <p className="text-sm font-medium">No users found matching your search</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Referrers & Settings */}
        <div className="space-y-6">
          <Card className="bg-white/[0.02] backdrop-blur-md border-white/[0.05] rounded-[20px] overflow-hidden border">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[16px] font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                Top Referrers
              </CardTitle>
              <CardDescription className="text-[12px]">Users who earned most from referrals.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-4">
              {stats.topReferrers.map((referrer, i) => {
                const user = profiles[referrer.user_id];
                return (
                  <div key={referrer.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="text-[11px] font-bold opacity-30 w-4">{i + 1}</div>
                      <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-[12px] font-bold text-amber-500">
                        {user?.full_name?.[0] || "?"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground leading-none mb-1 group-hover:text-amber-500 transition-colors">{user?.full_name || "Unknown"}</span>
                        <span className="text-[10px] text-muted-foreground opacity-60 leading-none">Referrer</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-foreground">{referrer.balance}</span>
                      <span className="text-[10px] text-emerald-500 font-medium">Coins</span>
                    </div>
                  </div>
                );
              })}
              {stats.topReferrers.length === 0 && (
                <div className="py-10 text-center opacity-40 text-xs">No referral data yet</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] backdrop-blur-md border-white/[0.05] rounded-[20px] overflow-hidden border">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[16px] font-semibold flex items-center gap-2">
                <SettingsIcon className="h-4 w-4 text-blue-500" />
                Coin Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-foreground">Exchange Rate</span>
                  <span className="text-[10px] text-muted-foreground">Used for manual calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-[11px] px-2 py-0.5 rounded-lg border-none">10 Coins = ₹1</Badge>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground opacity-60 leading-relaxed italic">
                * Note: This is currently a visual indicator. Automatic conversion logic uses this 10:1 ratio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction History Section */}
      <Card className="bg-white/[0.02] backdrop-blur-md border-white/[0.05] rounded-[20px] overflow-hidden border mt-8">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-[16px] font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-[12px]">The last 100 coin movements across the platform.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-[12px] opacity-70 hover:opacity-100 flex items-center gap-2">
              View All History <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.05] hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold opacity-50 pl-6">User</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold opacity-50">Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold opacity-50">Coins</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold opacity-50">Description</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold opacity-50 pr-6 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => {
                  const user = profiles[t.user_id];
                  const isCredit = t.action === "credit";
                  return (
                    <TableRow key={t.id} className="border-white/[0.05] group transition-colors hover:bg-white/[0.02]">
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground leading-none mb-1">{user?.full_name || "Unknown"}</span>
                          <span className="text-[11px] text-muted-foreground opacity-60 leading-none">{user?.email || "No email"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`rounded-lg text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-none shadow-none ${
                            isCredit ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {t.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1.5 font-bold text-sm ${isCredit ? "text-emerald-500" : "text-rose-500"}`}>
                          {isCredit ? "+" : ""}{t.coins}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[12px] text-muted-foreground opacity-80 line-clamp-1 max-w-[300px]">{t.description || "—"}</span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <span className="text-[12px] text-muted-foreground opacity-50">
                          {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center opacity-40 text-sm italic">No transactions recorded yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MANAGE COINS MODAL */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.05] rounded-[24px] max-w-[420px] font-inter p-0 overflow-hidden border">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Manage User Coins
              </DialogTitle>
              <DialogDescription className="text-muted-foreground pt-1">
                Credit or debit coins manually to a user's wallet.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-background/30 border-white/[0.05] rounded-xl h-11 focus:ring-primary/20">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/[0.05] max-h-[250px]">
                  {Object.values(profiles).map((p: any) => (
                    <SelectItem key={p.id} value={p.id} className="text-sm">
                      {p.full_name || p.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Coins Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="e.g. 500 or -200"
                  value={manageCoins}
                  onChange={(e) => setManageCoins(e.target.value)}
                  className="bg-background/30 border-white/[0.05] rounded-xl h-11 focus:ring-primary/20 pl-4 pr-12 font-bold"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Coins className="h-4 w-4 text-primary opacity-50" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground opacity-50 pl-1">Use positive for Credit, negative for Debit.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Description / Reason</label>
              <Input
                placeholder="Reason for adjustment..."
                value={manageDescription}
                onChange={(e) => setManageDescription(e.target.value)}
                className="bg-background/30 border-white/[0.05] rounded-xl h-11 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="p-6 bg-white/[0.02] border-t border-white/[0.05] flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsManageModalOpen(false)}
              className="flex-1 h-11 rounded-xl font-bold border-white/[0.05] hover:bg-white/[0.05]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleManageCoins}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-glow"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
