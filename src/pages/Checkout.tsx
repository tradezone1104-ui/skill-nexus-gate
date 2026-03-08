import { useState, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle, MessageCircle, Shield, CreditCard, Smartphone,
  Building, Coins, Tag, X, Lock, Wallet, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { getCourseById } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseContext } from "@/contexts/PurchaseContext";
import { useCvCoins } from "@/hooks/useCvCoins";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

const BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Bank of Baroda", "Punjab National Bank"];

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
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [useCoins, setUseCoins] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground">Course not found</h1>
          <Link to="/courses"><Button className="mt-4">Browse Courses</Button></Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">You need to sign in to complete your purchase.</p>
          <Link to="/login"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  const discount = course.originalPrice - course.price;
  const discountPercent = Math.round((discount / course.originalPrice) * 100);
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
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID");
      return;
    }
    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        toast.error("Please fill all card details");
        return;
      }
    }
    if (paymentMethod === "netbanking" && !selectedBank) {
      toast.error("Please select a bank");
      return;
    }
    if (paymentMethod === "wallet" && !mobileNumber) {
      toast.error("Please enter your mobile number");
      return;
    }

    setProcessing(true);
    try {
      if (useCoins && coinDiscount > 0) {
        await spendCoins(coinDiscount, `Discount on ${course.title}`);
      }
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">Payment Successful!</h1>
              <p className="text-muted-foreground mt-2">You now have access to</p>
            </div>

            <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
              <img src={course.thumbnail} alt={course.title} className="w-16 h-11 rounded object-cover shrink-0" />
              <p className="font-semibold text-foreground text-sm text-left line-clamp-2">{course.title}</p>
            </div>

            <div className="space-y-3">
              <a href={course.telegramLink} target="_blank" rel="noopener noreferrer" className="block">
                <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  <MessageCircle className="mr-2 h-5 w-5" /> Access Course on Telegram
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
      </div>
    );
  }

  // ===== CHECKOUT LAYOUT =====
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-6xl">
          <Link to="/" className="font-display font-bold text-lg text-foreground">
            Course<span className="text-primary">Verse</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="font-display font-bold text-3xl text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — Payment + Order Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg text-foreground">Payment method</h2>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Secure and encrypted 🔒
                </span>
              </div>

              <div className="space-y-3">
                {/* UPI */}
                <PaymentOption
                  selected={paymentMethod === "upi"}
                  onClick={() => setPaymentMethod("upi")}
                  label="UPI"
                  description="Google Pay, PhonePe, Paytm UPI"
                  icon={<Smartphone className="h-5 w-5" />}
                >
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Enter your UPI ID"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="bg-background"
                    />
                    <Button variant="outline" size="sm" className="shrink-0">
                      Verify
                    </Button>
                  </div>
                </PaymentOption>

                {/* Cards */}
                <PaymentOption
                  selected={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                  label="Cards"
                  description="Visa, Mastercard, RuPay"
                  icon={<CreditCard className="h-5 w-5" />}
                >
                  <div className="space-y-3 mt-3">
                    <Input
                      placeholder="Card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-background"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="bg-background"
                      />
                      <Input
                        placeholder="CVV"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="bg-background"
                        type="password"
                      />
                    </div>
                    <Input
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </PaymentOption>

                {/* Net Banking */}
                <PaymentOption
                  selected={paymentMethod === "netbanking"}
                  onClick={() => setPaymentMethod("netbanking")}
                  label="Net Banking"
                  description="All major banks supported"
                  icon={<Building className="h-5 w-5" />}
                >
                  <div className="mt-3 relative">
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground appearance-none cursor-pointer"
                    >
                      <option value="">Select your bank</option>
                      {BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </PaymentOption>

                {/* Mobile Wallets */}
                <PaymentOption
                  selected={paymentMethod === "wallet"}
                  onClick={() => setPaymentMethod("wallet")}
                  label="Mobile Wallets"
                  description="Paytm, PhonePe"
                  icon={<Wallet className="h-5 w-5" />}
                >
                  <div className="mt-3">
                    <Input
                      placeholder="Enter mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </PaymentOption>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-display font-bold text-lg text-foreground mb-4">
                Order details <span className="text-muted-foreground font-normal text-sm">(1 course)</span>
              </h2>
              <div className="flex gap-4 items-start">
                <img src={course.thumbnail} alt={course.title} className="w-28 h-[4.5rem] rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{course.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">by {course.instructor}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-foreground">₹{course.price}</p>
                  <p className="text-xs text-muted-foreground line-through">₹{course.originalPrice}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Order Summary (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Coupon Code */}
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-sm font-semibold text-foreground mb-3">Have a coupon?</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={coupon}
                    onChange={(e) => {
                      setCoupon(e.target.value);
                      if (!couponApplied) setCouponError(false);
                    }}
                    disabled={couponApplied}
                    className="bg-background text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={handleApplyCoupon}
                    disabled={couponApplied || !coupon.trim()}
                  >
                    {couponApplied ? "Applied" : "Apply"}
                  </Button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-primary mt-2">Coupon applied! You saved ₹{couponDiscount}</p>
                )}
                {couponError && (
                  <p className="text-xs text-destructive mt-2">Invalid coupon code</p>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <h2 className="font-display font-bold text-lg text-foreground">Order Summary</h2>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Original Price</span>
                    <span>₹{course.originalPrice}</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>Discount ({discountPercent}% Off)</span>
                    <span>-₹{discount}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-primary">
                      <span>Coupon (CV10)</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  {useCoins && coinDiscount > 0 && (
                    <div className="flex justify-between text-[hsl(var(--warning))]">
                      <span>CV Coins ({coinDiscount})</span>
                      <span>-₹{coinDiscount}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-display font-bold text-xl text-foreground">
                  <span>Total (1 course)</span>
                  <span>₹{total}</span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  By completing your purchase, you agree to our{" "}
                  <span className="underline cursor-pointer">Terms of Use</span>
                </p>

                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base"
                  onClick={handlePayment}
                  disabled={processing || isPurchased(course.id)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {processing ? "Processing…" : "Proceed"}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center">
                  7-day refund only if any issue found
                </p>

                {/* CV Coins */}
                {balance > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <Coins className="h-4 w-4 text-[hsl(var(--warning))]" /> Use CV Coins
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {balance} coins available · Max ₹{maxCoins} off
                        </p>
                      </div>
                      <Switch checked={useCoins} onCheckedChange={setUseCoins} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Payment Option Component ── */
function PaymentOption({
  selected,
  onClick,
  label,
  description,
  icon,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`border rounded-xl p-4 cursor-pointer transition-all ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/40"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? "border-primary" : "border-muted-foreground/40"
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {selected && <div className="ml-7">{children}</div>}
    </div>
  );
}

export default Checkout;
