import { Users, Copy, Gift, ShieldCheck, Star, Coins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const mockStats = [
  { label: "Friends Referred", value: 8, icon: Users },
  { label: "Purchases Made", value: 3, icon: Gift },
  { label: "CV Coins Earned", value: 320, icon: Coins },
];

const mockHistory = [
  { friend: "Rahul S.", course: "Advanced Options Trading", coins: 100, date: "2025-12-15" },
  { friend: "Priya M.", course: "Crypto Masterclass", coins: 120, date: "2025-11-28" },
  { friend: "Amit K.", course: "Risk Management Pro", coins: 100, date: "2025-11-10" },
];

const coinUses = [
  { title: "Course Discounts", desc: "Apply CV Coins to get discounts on any course purchase." },
  { title: "Unlock Courses", desc: "Use enough coins to unlock a course entirely for free." },
  { title: "Special Rewards", desc: "Redeem coins for exclusive platform rewards and perks." },
];

const ReferAFriend = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const username = user?.user_metadata?.full_name?.toLowerCase().replace(/\s+/g, "") || user?.id?.slice(0, 8) || "user";
  const referralLink = `courseverse.com/?ref=${username}`;

  const copyLink = () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      navigate("/login");
      return;
    }
    navigator.clipboard.writeText(`https://${referralLink}`);
    toast({ title: "Link Copied!", description: "Your referral link has been copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <CategoryBar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Refer a Friend</h1>
          <p className="text-muted-foreground text-lg">Invite friends and earn CV Coins.</p>
        </div>

        {/* Reward Explainer */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col md:flex-row items-center gap-6 py-6">
            <div className="bg-primary/10 rounded-full p-4">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Earn 20% CV Coins on Every Purchase</h2>
              <p className="text-muted-foreground">When your friend buys a ₹500 course, you earn <span className="font-bold text-primary">100 CV Coins</span>. Coins are awarded only after a successful purchase.</p>
            </div>
          </CardContent>
        </Card>

        {/* Referral Link */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-lg">Your Referral Link</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm font-mono text-foreground truncate">
                {user ? referralLink : "Log in to get your referral link"}
              </div>
              <Button onClick={copyLink} className="gap-2 rounded-xl shrink-0">
                <Copy className="h-4 w-4" /> Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mockStats.map((s) => (
              <Card key={s.label} className="border-border">
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="bg-primary/10 rounded-full p-3">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Referral History */}
        {user && (
          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Referral History</CardTitle></CardHeader>
            <CardContent>
              {mockHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No referrals yet. Share your link to get started!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Friend Name</TableHead>
                      <TableHead>Course Purchased</TableHead>
                      <TableHead>Coins Earned</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHistory.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{h.friend}</TableCell>
                        <TableCell>{h.course}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1"><Coins className="h-3 w-3" />{h.coins}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{new Date(h.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* CV Coins Usage */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">What Can You Do with CV Coins?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coinUses.map((c) => (
              <Card key={c.title} className="border-border">
                <CardContent className="py-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Anti-cheat note */}
        <Card className="border-border bg-muted/30">
          <CardContent className="flex items-start gap-3 py-5">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Fair Play Policy</p>
              <p className="text-sm text-muted-foreground">CV Coins are awarded only after a referred friend successfully completes a purchase. Self-referrals and fake accounts are not eligible.</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA for guests */}
        {!user && (
          <div className="text-center py-8 space-y-4 bg-primary/5 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground">Sign up to start earning CV Coins</h2>
            <p className="text-muted-foreground">Create a free account and get your unique referral link.</p>
            <Button onClick={() => navigate("/signup")} size="lg" className="gap-2 rounded-xl">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ReferAFriend;
