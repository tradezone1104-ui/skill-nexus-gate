import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Crown,
  BookOpen,
  TrendingUp,
  BarChart3,
  LineChart,
  Cpu,
  Bitcoin,
  Bot,
  Sparkles,
  Zap,
  MessageCircle,
  RefreshCw,
  GraduationCap,
  Star,
  ChevronDown,
  ChevronUp,
  Shield } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
"@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
"@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";

const categories = [
{ name: "Trading", icon: TrendingUp },
{ name: "Options & Futures", icon: BarChart3 },
{ name: "Investing", icon: LineChart },
{ name: "Technical Analysis", icon: BarChart3 },
{ name: "Price Action / SMC", icon: TrendingUp },
{ name: "Indicators & Trading Tools", icon: Cpu },
{ name: "Crypto & Forex", icon: Bitcoin },
{ name: "Algo Trading", icon: Bot },
{ name: "AI Tools", icon: Sparkles },
{ name: "Digital Skills", icon: BookOpen }];


const benefits = [
{ icon: BookOpen, label: "2000+ Courses" },
{ icon: MessageCircle, label: "Instant Telegram Access" },
{ icon: RefreshCw, label: "Weekly New Course Updates" },
{ icon: GraduationCap, label: "Beginner to Advanced Content" },
{ icon: Zap, label: "Massive Learning Value" }];


const testimonials = [
{ text: "This platform helped me learn trading faster.", author: "Rahul M." },
{ text: "Best value for money. Access to everything for one price!", author: "Priya S." },
{ text: "New courses every week keep me ahead of the market.", author: "Amit K." }];


const faqs = [
{
  q: "Do I get access to all courses?",
  a: "Yes. Premium members can access all available courses on CourseVerse."
},
{
  q: "Will new courses be added?",
  a: "Yes. New courses are added regularly and are automatically included in your subscription at no extra cost."
},
{
  q: "Can I cancel anytime?",
  a: "Yes. Monthly subscriptions can be cancelled anytime. Yearly subscriptions are valid for the full year."
},
{
  q: "How do I access courses after subscribing?",
  a: "Once subscribed, all courses will show an 'Included in Premium' label. Just click to start learning instantly."
}];


const comparisonRows = [
{ feature: "Courses Access", individual: "Single course", premium: "2000+ courses" },
{ feature: "Price per course", individual: "₹499+", premium: "Included" },
{ feature: "New course updates", individual: "Pay again", premium: "Free updates" },
{ feature: "Total learning value", individual: "₹2,00,00,000+", premium: "Included" }];


const Subscribe = () => {
  const { user } = useAuth();
  const { isSubscribed, subscribe } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (isSubscribed) {
      toast({ title: "Already subscribed", description: "You already have an active premium subscription." });
      return;
    }
    navigate("/subscription-checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--secondary)) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Crown className="h-4 w-4" /> Premium Membership
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-foreground mb-4 leading-tight">
            CourseVerse Premium
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Unlock 2000+ Premium Courses With One Subscription
          </p>
          <p className="text-primary font-bold text-xl md:text-2xl mb-8">Total course value worth ₹2,00,00,000+

          </p>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-lg px-10 h-14 font-bold"
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
            
            Start Learning Now
          </Button>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-24 container mx-auto px-4">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-center text-foreground mb-12">
          Choose a plan that works for you
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-[880px] mx-auto">
          {/* Premium - Left Card */}
          <div className="flex-1 max-w-[420px] mx-auto md:mx-0 rounded-2xl border-2 border-primary p-8 flex flex-col relative bg-card" style={{ boxShadow: "0 12px 32px hsl(var(--primary) / 0.12)" }}>
            <div className="absolute -top-0.5 left-0 right-0 h-1.5 rounded-t-2xl bg-primary" />
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-semibold px-4 py-1 text-xs">
              Best Value
            </Badge>
            <div className="space-y-3 mt-2">
              <h3 className="font-display font-bold text-xl text-foreground">CourseVerse Premium</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-medium text-muted-foreground">₹</span>
                <span className="font-display font-bold text-[40px] leading-none tracking-tight text-foreground" style={{ letterSpacing: "-0.5px" }}>333</span>
                <span className="text-muted-foreground text-sm ml-1">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">Billed monthly or annually. Cancel anytime.</p>
            </div>
            <ul className="space-y-3 flex-1 mt-6">
              {["Access to 2000+ trading courses", "New courses added regularly", "Beginner to advanced content", "Cancel anytime", "Priority support"].map((f) =>
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {f}
                </li>
              )}
            </ul>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 rounded-[10px] mt-6 text-base"
              onClick={() => handleSubscribe()}
              disabled={loading === "monthly" || isSubscribed}>
              {isSubscribed ? "Already Subscribed" : loading === "monthly" ? "Processing..." : "Start Subscription"}
            </Button>
          </div>

          {/* Individual Courses - Right Card */}
          <div className="flex-1 max-w-[420px] mx-auto md:mx-0 rounded-2xl border border-border p-8 flex flex-col bg-card" style={{ boxShadow: "0 4px 16px hsl(var(--muted) / 0.15)" }}>
            <div className="space-y-3">
              <h3 className="font-display font-bold text-xl text-foreground">Individual Courses</h3>
              <p className="text-sm text-muted-foreground">Learn anything</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-medium text-muted-foreground">₹</span>
                <span className="font-display font-bold text-[40px] leading-none tracking-tight text-foreground" style={{ letterSpacing: "-0.5px" }}>99 – 1,999</span>
              </div>
              <p className="text-sm text-muted-foreground">One time purchase</p>
            </div>
            <ul className="space-y-3 flex-1 mt-6">
              {["2000+ trading courses available", "Pay as you go"].map((f) =>
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {f}
                </li>
              )}
            </ul>
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-accent font-semibold h-12 rounded-[10px] mt-6 text-base"
              onClick={() => navigate("/courses")}>
              Browse Courses
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl text-center text-foreground mb-10">
            Why Premium Is Better
          </h2>
          <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-bold text-foreground">Feature</TableHead>
                  <TableHead className="font-bold text-foreground text-center">Buying Individually</TableHead>
                  <TableHead className="font-bold text-primary text-center">CourseVerse Premium</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row) =>
                <TableRow key={row.feature}>
                    <TableCell className="font-medium text-foreground">{row.feature}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{row.individual}</TableCell>
                    <TableCell className="text-center font-semibold text-primary">{row.premium}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <h2 className="font-display font-bold text-3xl text-center text-foreground mb-4">
          What You Will Learn
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
          Explore our diverse course library across these categories
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {categories.map((cat) =>
          <div
            key={cat.name}
            className="flex flex-col items-center gap-3 p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all text-center">
            
              <cat.icon className="h-7 w-7 text-primary" />
              <span className="text-sm font-semibold text-foreground">{cat.name}</span>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl text-center text-foreground mb-12">
            Premium Benefits
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {benefits.map((b) =>
            <div key={b.label} className="flex flex-col items-center gap-3 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <b.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{b.label}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 md:py-24 container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 text-primary font-bold text-lg mb-8">
          <Shield className="h-5 w-5" /> Trusted by Learners
        </div>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">1000+ Traders Already Joined CourseVerse Premium

        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          {testimonials.map((t, i) =>
          <div key={i} className="bg-card rounded-2xl border border-border p-6 text-left space-y-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) =>
              <Star key={j} className="h-4 w-4 fill-warning text-warning" />
              )}
              </div>
              <p className="text-sm text-foreground italic">"{t.text}"</p>
              <p className="text-xs font-semibold text-muted-foreground">— {t.author}</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display font-bold text-3xl text-center text-foreground mb-10">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) =>
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-5">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4">
          <Crown className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-8">
            Start Learning With CourseVerse Premium
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 font-bold h-14 px-8 text-base"
              onClick={() => handleSubscribe()}
              disabled={!!loading || isSubscribed}>
              
              Get Monthly Plan — ₹499
            </Button>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-bold h-14 px-8 text-base"
              onClick={() => handleSubscribe("yearly")}
              disabled={!!loading || isSubscribed}>
              
              Get Yearly Plan — ₹3,999
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>);

};

export default Subscribe;