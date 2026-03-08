import { Coins, Gift, ShoppingCart, Info, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCvCoins } from "@/hooks/useCvCoins";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const earningMethods = [
  {
    icon: Gift,
    title: "Referral Rewards",
    desc: "Earn 20% CV Coins when a referred friend purchases a course. If they buy a ₹500 course, you earn 100 CV Coins!",
  },
];

const rules = [
  "CV Coins cannot be withdrawn as cash.",
  "They can only be used for discounts on courses.",
  "1 CV Coin = ₹1 discount at checkout.",
  "Coins earned from referrals are credited after the referred purchase is confirmed.",
];

const CvCoins = () => {
  const { user } = useAuth();
  const { balance, transactions, loading } = useCvCoins();

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <div className="container mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">CV Coins</h1>
          <p className="text-muted-foreground mt-1">Earn coins and use them for course discounts.</p>
        </div>

        {!user ? (
          <Card className="text-center p-12 space-y-4">
            <Coins className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="font-display font-semibold text-xl text-foreground">
              Sign in to view your CV Coins
            </h2>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="flex items-center gap-6 py-8">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Coins className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Your Balance</p>
                  <p className="text-4xl font-bold text-foreground">
                    {loading ? "…" : balance.toLocaleString()}{" "}
                    <span className="text-lg font-medium text-muted-foreground">CV Coins</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How to Earn */}
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> How to Earn
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {earningMethods.map((m) => (
                  <Card key={m.title} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex gap-4 py-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <m.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{m.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="flex gap-4 py-6">
                    <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Use at Checkout</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Apply your coins during checkout to get instant discounts. 1 Coin = ₹1 off.
                      </p>
                      <Link to="/cart" className="text-primary text-sm font-medium inline-flex items-center gap-1 mt-2 hover:underline">
                        Go to Cart <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-foreground">Coins History</h2>
              {loading ? (
                <p className="text-muted-foreground">Loading…</p>
              ) : transactions.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-muted-foreground">No transactions yet. Start earning by referring friends!</p>
                  <Link to="/refer">
                    <Button variant="outline" className="mt-4">Refer a Friend</Button>
                  </Link>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Coins</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-muted-foreground">{formatDate(tx.created_at)}</TableCell>
                          <TableCell className="font-medium text-foreground">{tx.action}</TableCell>
                          <TableCell className="text-muted-foreground">{tx.description ?? "—"}</TableCell>
                          <TableCell className={`text-right font-semibold ${tx.coins > 0 ? "text-primary" : "text-destructive"}`}>
                            {tx.coins > 0 ? `+${tx.coins}` : tx.coins}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>

            {/* Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-muted-foreground" /> Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {rules.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CvCoins;
