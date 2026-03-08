import { ArrowRight, Link2, DollarSign, TrendingUp, BookOpen, BarChart3, Briefcase, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const steps = [
  { num: "01", icon: Briefcase, title: "Join the Reseller Program", desc: "Sign up and get instant access to your reseller dashboard." },
  { num: "02", icon: Share2, title: "Share Your Referral Link", desc: "Share your unique referral link with your audience and network." },
  { num: "03", icon: DollarSign, title: "Earn Commissions", desc: "Earn commission every time someone purchases through your link." },
];

const benefits = [
  { icon: DollarSign, title: "Earn Passive Income", desc: "Generate revenue while you sleep with recurring referral sales." },
  { icon: BookOpen, title: "Promote High-Quality Courses", desc: "Share 2,000+ premium courses your audience will love." },
  { icon: BarChart3, title: "Access Marketing Materials", desc: "Get banners, copy, and assets to boost your conversions." },
  { icon: TrendingUp, title: "Track Sales & Earnings", desc: "Real-time dashboard to monitor clicks, sales, and payouts." },
];

const CVBusiness = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/reseller-dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">CV Business</span>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 tracking-tight">
            Become a CourseVerse Reseller
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Promote premium courses and earn commissions for every sale. Start your education business today.
          </p>
          <Button size="lg" onClick={handleJoin} className="gap-2 rounded-xl h-12 px-8 text-base font-semibold shadow-glow">
            Join CV Business <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative text-center space-y-4">
                <span className="text-5xl font-bold text-primary/15 absolute -top-2 left-1/2 -translate-x-1/2 select-none">{step.num}</span>
                <div className="relative z-10 mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mt-6">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">Tiered Commission Structure</h2>
          <p className="text-muted-foreground mb-10">Sell more, earn more. Unlock higher commission rates as you grow.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { tier: "Starter", range: "1–5 sales", rate: "15%", example: "₹75", highlight: false },
              { tier: "Growing Seller", range: "6–10 sales", rate: "20%", example: "₹100", highlight: false },
              { tier: "Pro Seller", range: "10+ sales", rate: "30%", example: "₹150", highlight: true },
            ].map((t) => (
              <Card key={t.tier} className={`border-border ${t.highlight ? "ring-2 ring-primary/30 border-primary/30" : ""}`}>
                <CardContent className="p-6 text-center space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.tier}</p>
                  <p className="text-4xl font-bold text-primary">{t.rate}</p>
                  <p className="text-sm text-muted-foreground">{t.range}/month</p>
                  <div className="pt-2 border-t border-border mt-3">
                    <p className="text-xs text-muted-foreground">On a ₹499 course</p>
                    <p className="text-lg font-bold text-foreground">Earn {t.example}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6">Sales count resets monthly — compete again each month!</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground text-center mb-12">Why Join CV Business?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <Card key={b.title} className="border-border bg-card hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4">Ready to Start Earning?</h2>
          <p className="text-muted-foreground mb-8">Join hundreds of resellers already building their education business with CourseVerse.</p>
          <Button size="lg" onClick={handleJoin} className="gap-2 rounded-xl h-12 px-8 text-base font-semibold shadow-glow">
            Start Earning Now <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CVBusiness;
