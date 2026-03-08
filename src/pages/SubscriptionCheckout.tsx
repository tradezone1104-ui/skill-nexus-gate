import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock, Crown, CreditCard, Smartphone, Building2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

const plans = [
  {
    id: "yearly" as const,
    label: "Yearly Access",
    price: "₹333/mo",
    badge: "Save ₹2,012",
    detail: "₹3,999 billed yearly",
    summaryLabel: "Yearly access",
    summaryPrice: "₹3,999/year",
    total: "₹3,999/year",
  },
  {
    id: "monthly" as const,
    label: "Monthly Access",
    price: "₹499/mo",
    badge: null,
    detail: "billed monthly",
    summaryLabel: "Monthly access",
    summaryPrice: "₹499/month",
    total: "₹499/month",
  },
];

const benefits = [
  "Access to 2000+ trading courses",
  "New courses added regularly",
  "Beginner to advanced content",
];

type PaymentMethod = "upi" | "cards" | "netbanking" | "wallets";

const SubscriptionCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");

  const plan = plans.find((p) => p.id === selectedPlan)!;

  const handleStartSubscription = () => {
    navigate("/payment-success");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="font-display font-bold text-xl text-foreground">
            Course<span className="text-primary">Verse</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-8">
          Subscribe to CourseVerse Premium
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            {/* Unlock Banner */}
            <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Unlock unlimited access to 2000+ trading courses with CourseVerse Premium today!
                </p>
              </div>
              <Badge className="bg-primary/15 text-primary border-0 shrink-0">Included</Badge>
            </div>

            {/* Plan Selection */}
            <div>
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">Select Plan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative text-left rounded-xl border-2 p-5 transition-all ${
                      selectedPlan === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedPlan === p.id ? "border-primary" : "border-muted-foreground/40"
                        }`}
                      >
                        {selectedPlan === p.id && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{p.label}</p>
                        <p className="font-display font-bold text-xl text-foreground">{p.price}</p>
                        {p.badge && (
                          <Badge className="bg-primary/15 text-primary border-0 text-xs">
                            {p.badge}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">{p.detail}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            {/* Payment Method */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg text-foreground">Payment Method</h2>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Secure and encrypted 🔒
                </span>
              </div>
              <div className="space-y-3">
                {([
                  { id: "upi" as PaymentMethod, label: "UPI", icon: Smartphone },
                  { id: "cards" as PaymentMethod, label: "Cards", icon: CreditCard, extra: "Visa · Mastercard · RuPay" },
                  { id: "netbanking" as PaymentMethod, label: "Net Banking", icon: Building2 },
                  { id: "wallets" as PaymentMethod, label: "Mobile Wallets", icon: Wallet },
                ]).map((m) => (
                  <div key={m.id}>
                    <button
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 transition-all text-left ${
                        paymentMethod === m.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          paymentMethod === m.id ? "border-primary" : "border-muted-foreground/40"
                        }`}
                      >
                        {paymentMethod === m.id && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <m.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{m.label}</p>
                        {m.extra && <p className="text-xs text-muted-foreground">{m.extra}</p>}
                      </div>
                    </button>
                    {paymentMethod === "upi" && m.id === "upi" && (
                      <div className="mt-3 pl-11">
                        <Input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="Enter your UPI ID"
                          className="bg-card border-border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:w-[360px] shrink-0">
            <div className="lg:sticky lg:top-8 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <h2 className="font-display font-semibold text-lg text-foreground">Summary</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{plan.summaryLabel}</span>
                    <span className="text-foreground font-medium">{plan.summaryPrice}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-display font-bold text-foreground">{plan.total}</span>
                  </div>
                </div>

                {!showCoupon ? (
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground"
                    onClick={() => setShowCoupon(true)}
                  >
                    Apply Coupon
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter coupon code"
                      className="bg-background border-border"
                    />
                    <Button variant="outline" className="shrink-0 border-border">
                      Apply
                    </Button>
                  </div>
                )}

                <div className="space-y-3 text-xs text-muted-foreground">
                  <p>Cancel anytime by visiting the Subscriptions page in your account.</p>
                  <p>
                    Your subscription will begin today. Cancel anytime before renewal to avoid future
                    charges.
                  </p>
                </div>

                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base"
                  onClick={handleStartSubscription}
                >
                  <Lock className="h-4 w-4 mr-1" /> Start Subscription
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionCheckout;
