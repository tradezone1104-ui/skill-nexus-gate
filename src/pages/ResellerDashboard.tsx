import { Copy, DollarSign, TrendingUp, Clock, Wallet, Trophy, ExternalLink, Zap, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

const tiers = [
  { name: "Starter", minSales: 1, maxSales: 5, rate: 15 },
  { name: "Growing Seller", minSales: 6, maxSales: 10, rate: 20 },
  { name: "Pro Seller", minSales: 11, maxSales: Infinity, rate: 30 },
];

function getTier(sales: number) {
  if (sales >= 11) return { ...tiers[2], next: null, salesToNext: 0 };
  if (sales >= 6) return { ...tiers[1], next: tiers[2], salesToNext: 11 - sales };
  if (sales >= 1) return { ...tiers[0], next: tiers[1], salesToNext: 6 - sales };
  return { name: "None", rate: 0, minSales: 0, maxSales: 0, next: tiers[0], salesToNext: 1 };
}

const stats = [
  { label: "Total Sales", value: "25", icon: TrendingUp, color: "text-primary" },
  { label: "Total Earnings", value: "₹3,750", icon: DollarSign, color: "text-primary" },
  { label: "Pending Commission", value: "₹500", icon: Clock, color: "text-yellow-500" },
  { label: "Withdrawable Balance", value: "₹3,250", icon: Wallet, color: "text-green-500" },
];

const salesHistory = [
  { customer: "Rahul Sharma", course: "Price Action Mastery", price: "₹499", commission: "₹150", date: "12 Mar" },
  { customer: "Sneha Verma", course: "Full Stack Web Dev", price: "₹999", commission: "₹300", date: "10 Mar" },
  { customer: "Aman Gupta", course: "UI/UX Design Pro", price: "₹699", commission: "₹210", date: "8 Mar" },
  { customer: "Priya Singh", course: "Python for Data Science", price: "₹599", commission: "₹180", date: "5 Mar" },
  { customer: "Vikram Reddy", course: "Digital Marketing A-Z", price: "₹399", commission: "₹120", date: "2 Mar" },
];

const leaderboard = [
  { id: "#A7F2", earnings: "₹48,500", rank: 1 },
  { id: "#K91X", earnings: "₹36,200", rank: 2 },
  { id: "#P44Q", earnings: "₹28,900", rank: 3 },
  { id: "#D83M", earnings: "₹19,400", rank: 4 },
  { id: "#W56R", earnings: "₹14,100", rank: 5 },
];

const ResellerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [withdrawMethod, setWithdrawMethod] = useState("upi");
  const [approved, setApproved] = useState<boolean | null>(null);
  const monthlySales = 7;
  const currentTier = useMemo(() => getTier(monthlySales), [monthlySales]);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/login"); return; }
    if (!user) return;

    const checkApproval = async () => {
      const { data } = await supabase
        .from("reseller_applications")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (!data || data.status !== "approved") {
        setApproved(false);
      } else {
        setApproved(true);
      }
    };
    checkApproval();
  }, [user, authLoading, navigate]);

  const referralLink = `courseverse.com/?ref=${user?.user_metadata?.full_name?.toLowerCase().replace(/\s+/g, "") || user?.id?.slice(0, 8) || "user"}`;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${referralLink}`);
    toast({ title: "Link Copied!", description: "Your referral link has been copied to clipboard." });
  };

  const handleWithdraw = () => {
    toast({ title: "Withdrawal Coming Soon", description: "Payouts will be enabled once payment integration is live." });
  };

  if (authLoading || approved === null) return null;

  // Not approved — redirect to CV Business
  if (!approved) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <CategoryBar />
        <div className="container mx-auto px-4 py-20 text-center max-w-lg">
          <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">You need an approved reseller application to access the dashboard.</p>
          <Button onClick={() => navigate("/cv-business")} className="gap-2 rounded-xl">
            Apply to Become a Reseller
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />

      <div className="container mx-auto px-4 py-10 max-w-6xl space-y-10">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground tracking-tight">Reseller Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your sales and earnings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Commission Tier */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Commission Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current Tier:</span>
                  <Badge variant={currentTier.rate === 30 ? "default" : "secondary"} className="text-xs">
                    {currentTier.name}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-primary">{currentTier.rate}% Commission</p>
              </div>
              <div className="sm:ml-auto text-sm text-muted-foreground">
                Sales This Month: <span className="font-bold text-foreground">{monthlySales}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>15%</span><span>20%</span><span>30%</span>
              </div>
              <Progress value={Math.min((monthlySales / 11) * 100, 100)} className="h-2.5" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{monthlySales} / {currentTier.next ? currentTier.next.minSales : "∞"} sales</span>
                {currentTier.next ? (
                  <span className="text-primary font-medium">{currentTier.salesToNext} more sale{currentTier.salesToNext !== 1 ? "s" : ""} to unlock {currentTier.next.rate}%</span>
                ) : (
                  <span className="text-primary font-medium">Max tier reached 🎉</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Link */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground font-mono truncate flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                {referralLink}
              </div>
              <Button onClick={copyLink} className="gap-2 rounded-xl shrink-0">
                <Copy className="h-4 w-4" /> Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales History + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-foreground">Sales History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesHistory.map((sale, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{sale.customer}</TableCell>
                        <TableCell>{sale.course}</TableCell>
                        <TableCell className="text-right">{sale.price}</TableCell>
                        <TableCell className="text-right text-primary font-semibold">{sale.commission}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{sale.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Top Resellers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.map((r) => (
                <div key={r.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${r.rank <= 3 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {r.rank}
                    </span>
                    <span className="text-sm font-medium text-foreground">Seller {r.id}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{r.earnings}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Withdraw */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">Withdraw Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Minimum withdrawal amount: <span className="font-semibold text-foreground">₹500</span>
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
              <div className="space-y-1.5 flex-1 max-w-xs">
                <label className="text-sm font-medium text-foreground">Withdraw Method</label>
                <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="paytm">Paytm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleWithdraw} className="gap-2 rounded-xl">
                <Wallet className="h-4 w-4" /> Withdraw Earnings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ResellerDashboard;
