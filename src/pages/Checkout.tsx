import { useState, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle, MessageCircle, Shield, CreditCard, Smartphone,
  Building, Coins, Tag, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCourseById } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseContext } from "@/contexts/PurchaseContext";
import { useCvCoins } from "@/hooks/useCvCoins";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PaymentMethod = "upi" | "paytm" | "netbanking" | "card";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get("course") || "";
  const course = getCourseById(courseId);
  const { user } = useAuth();
  const { isPurchased, addPurchasedIds } = usePurchaseContext();
  const { balance, spendCoins } = useCvCoins();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [useCoins, setUseCoins] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display font-bold text-2xl text-foreground">Course not found</h1>
          <Link to="/courses"><Button className="mt-4">Browse Courses</Button></Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display font-bold text-2xl text-foreground mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">You need to sign in to complete your purchase.</p>
          <Link to="/login"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  const discount = course.originalPrice - course.price;
  const couponDiscount = couponApplied ? Math.floor(course.price * 0.1) : 0;
  const maxCoins = Math.min(balance, Math.floor((course.price - couponDiscount) * 0.5));
  const coinDiscount = useCoins ? maxCoins : 0;
  const total = Math.max(0, course.price - couponDiscount - coinDiscount);

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === "CV10") {
      setCouponApplied(true);
      toast.success("Coupon CV10 applied! 10% off");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === "card") {
      toast.error("Card payments coming soon");
      return;
    }
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    setProcessing(true);
    try {
      // Spend coins if applicable
      if (useCoins && coinDiscount > 0) {
        await spendCoins(coinDiscount, `Discount on ${course.title}`);
      }

      // Record purchase
      const { error } = await supabase.from("purchases").insert({
        user_id: user.id,
        course_id: course.id,
        price_paid: total,
      });

      if (error) throw error;
      addPurchasedIds([course.id]);
      setSuccess(true);
    } catch (e: any) {
      toast.error(e.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ===== SUCCESS STATE =====
  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">Payment Successful!</h1>
              <p className="text-muted-foreground mt-2">You now have access to</p>
              <p className="font-semibold text-foreground mt-1">{course.title}</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Amount paid</p>
              <p className="font-display font-bold text-xl text-foreground">₹{total}</p>
            </div>

            <div className="space-y-3">
              <a href={course.telegramLink} target="_blank" rel="noopener noreferrer" className="block">
                <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  <MessageCircle className="mr-2 h-5 w-5" /> Access Course via Telegram
                </Button>
              </a>
              <Link to="/my-learning" className="block">
                <Button size="lg" variant="outline" className="w-full font-semibold">
                  Go to My Learning
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ===== CHECKOUT FORM =====
  const methods: { id: PaymentMethod; label: string; icon: typeof Smartphone; disabled?: boolean }[] = [
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "paytm", label: "Paytm", icon: Smartphone },
    { id: "netbanking", label: "Net Banking", icon: Building },
    { id: "card", label: "Card (Coming Soon)", icon: CreditCard, disabled: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to={`/course/${course.id}`} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>

        <h1 className="font-display font-bold text-2xl text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT — Order Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-card border border-border rounded-xl p-5 space-y-5 sticky top-20">
              <h2 className="font-display font-bold text-lg text-foreground">Order Summary</h2>

              <div className="flex gap-4">
                <img src={course.thumbnail} alt={course.title} className="w-24 h-16 rounded-lg object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{course.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">by {course.instructor}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Original price</span>
                  <span>₹{course.originalPrice}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-primary">
                    <span>Coupon (CV10)</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                {useCoins && coinDiscount > 0 && (
                  <div className="flex justify-between text-warning">
                    <span>CV Coins ({coinDiscount})</span>
                    <span>-₹{coinDiscount}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2.5 flex justify-between font-display font-bold text-lg text-foreground">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Payment */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            {/* Coupon */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" /> Promo Code
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  disabled={couponApplied}
                  className="bg-background"
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || !coupon.trim()}
                >
                  {couponApplied ? "Applied" : "Apply"}
                </Button>
              </div>
              {couponApplied && <p className="text-xs text-primary mt-2">10% discount applied!</p>}
            </div>

            {/* CV Coins */}
            {balance > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Use CV Coins</p>
                      <p className="text-xs text-muted-foreground">
                        You have {balance} coins (₹{balance}). Max applicable: ₹{maxCoins}
                      </p>
                    </div>
                  </div>
                  <Switch checked={useCoins} onCheckedChange={setUseCoins} />
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-foreground">Payment Method</h3>

              <div className="grid grid-cols-2 gap-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => !m.disabled && setPaymentMethod(m.id)}
                    disabled={m.disabled}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      paymentMethod === m.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : m.disabled
                        ? "border-border bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <m.icon className="h-4 w-4" />
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === "upi" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">UPI ID</label>
                  <Input
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="bg-background"
                  />
                </div>
              )}
              {paymentMethod === "paytm" && (
                <p className="text-sm text-muted-foreground">You will be redirected to Paytm to complete payment.</p>
              )}
              {paymentMethod === "netbanking" && (
                <p className="text-sm text-muted-foreground">You will be redirected to your bank's secure portal.</p>
              )}

              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base shadow-glow"
                onClick={handlePayment}
                disabled={processing || isPurchased(course.id)}
              >
                {processing ? "Processing…" : `Pay ₹${total}`}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Secure payment · 256-bit encryption
              </div>

              <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Refund Policy:</span> Refund available only if course content is broken or description is misleading. Contact support within 30 days of purchase.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
