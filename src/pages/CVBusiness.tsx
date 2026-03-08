import { useState, useEffect } from "react";
import { ArrowRight, DollarSign, TrendingUp, BookOpen, BarChart3, Briefcase, Share2, CheckCircle2, Clock, XCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { num: "01", icon: Briefcase, title: "Apply to Become a Reseller", desc: "Submit your application and tell us how you'll promote courses." },
  { num: "02", icon: Share2, title: "Get Approved & Share Links", desc: "Once approved, access your dashboard and unique referral links." },
  { num: "03", icon: DollarSign, title: "Earn Commissions", desc: "Earn commission every time someone purchases through your link." },
];

const benefits = [
  { icon: DollarSign, title: "Earn Passive Income", desc: "Generate revenue while you sleep with recurring referral sales." },
  { icon: BookOpen, title: "Promote High-Quality Courses", desc: "Share 2,000+ premium courses your audience will love." },
  { icon: BarChart3, title: "Access Marketing Materials", desc: "Get banners, copy, and assets to boost your conversions." },
  { icon: TrendingUp, title: "Track Sales & Earnings", desc: "Real-time dashboard to monitor clicks, sales, and payouts." },
];

const promotionChannels = [
  { id: "telegram", label: "Telegram" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "other", label: "Other" },
];

type AppStatus = "none" | "pending" | "approved" | "rejected";

const CVBusiness = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [appStatus, setAppStatus] = useState<AppStatus>("none");
  const [adminNote, setAdminNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [strategy, setStrategy] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setFullName(profile?.full_name || user.user_metadata?.full_name || "");
    setEmail(user.email || "");

    const fetchApplication = async () => {
      const { data } = await supabase
        .from("reseller_applications")
        .select("status, admin_note")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setAppStatus(data.status as AppStatus);
        setAdminNote(data.admin_note);
      }
      setLoading(false);
    };
    fetchApplication();
  }, [user, profile]);

  const toggleChannel = (id: string) => {
    setChannels((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!fullName.trim() || !email.trim() || channels.length === 0) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reseller_applications").insert({
      user_id: user.id,
      full_name: fullName.trim(),
      email: email.trim(),
      promotion_channels: channels,
      promotion_strategy: strategy.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already applied", description: "You have already submitted a reseller application." });
        setAppStatus("pending");
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      return;
    }
    setAppStatus("pending");
    setShowForm(false);
    toast({ title: "Application Submitted!", description: "We'll review your application and get back to you soon." });
  };

  const handleApplyClick = () => {
    if (!user) { navigate("/login"); return; }
    if (appStatus === "approved") { navigate("/reseller-dashboard"); return; }
    setShowForm(true);
  };

  // Approved → go to dashboard
  if (!loading && user && appStatus === "approved") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <CategoryBar />
        <div className="container mx-auto px-4 py-20 text-center max-w-lg">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">You're an Approved Reseller!</h1>
          <p className="text-muted-foreground mb-6">Your application has been approved. Access your full reseller dashboard below.</p>
          <Button size="lg" onClick={() => navigate("/reseller-dashboard")} className="gap-2 rounded-xl">
            Open Dashboard <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Status display for pending/rejected
  const StatusBanner = () => {
    if (appStatus === "pending") {
      return (
        <Card className="border-yellow-500/30 bg-yellow-500/5 mb-10">
          <CardContent className="flex items-start gap-4 p-6">
            <Clock className="h-8 w-8 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground text-lg">Application Submitted</h3>
              <p className="text-muted-foreground text-sm mt-1">Your reseller application has been submitted.</p>
              <p className="text-sm mt-2 font-medium text-yellow-600">Status: Waiting for admin approval</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    if (appStatus === "rejected") {
      return (
        <Card className="border-destructive/30 bg-destructive/5 mb-10">
          <CardContent className="flex items-start gap-4 p-6">
            <XCircle className="h-8 w-8 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground text-lg">Application Not Approved</h3>
              <p className="text-muted-foreground text-sm mt-1">Your reseller application was not approved.</p>
              {adminNote && <p className="text-sm text-muted-foreground mt-2 italic">Note: {adminNote}</p>}
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
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
            Earn with CourseVerse
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Promote premium courses, earn commissions for every sale, and build your education business.
          </p>
          {appStatus === "none" && (
            <Button size="lg" onClick={handleApplyClick} className="gap-2 rounded-xl h-12 px-8 text-base font-semibold shadow-glow">
              Apply to Become a Reseller <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {!loading && user && <StatusBanner />}

        {/* Application Form */}
        {showForm && appStatus === "none" && (
          <Card className="border-border mb-10 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Reseller Application</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" maxLength={100} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" maxLength={255} required />
                </div>
                <div className="space-y-2">
                  <Label>Where will you promote CourseVerse courses? *</Label>
                  <div className="flex flex-wrap gap-3">
                    {promotionChannels.map((ch) => (
                      <label key={ch.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={channels.includes(ch.id)} onCheckedChange={() => toggleChannel(ch.id)} />
                        <span className="text-sm text-foreground">{ch.label}</span>
                      </label>
                    ))}
                  </div>
                  {channels.length === 0 && <p className="text-xs text-muted-foreground">Select at least one channel</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="strategy">Promotion Strategy (optional)</Label>
                  <Textarea id="strategy" value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="Briefly describe how you plan to promote courses..." rows={3} maxLength={500} />
                </div>
                <Button type="submit" disabled={submitting} className="gap-2 rounded-xl w-full">
                  {submitting ? "Submitting..." : <><Send className="h-4 w-4" /> Submit Application</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

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
      {appStatus === "none" && (
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4">Ready to Start Earning?</h2>
            <p className="text-muted-foreground mb-8">Join hundreds of resellers already building their education business with CourseVerse.</p>
            <Button size="lg" onClick={handleApplyClick} className="gap-2 rounded-xl h-12 px-8 text-base font-semibold shadow-glow">
              Apply Now <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default CVBusiness;
