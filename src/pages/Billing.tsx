import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  CreditCard, Repeat, Wallet, History, MessageSquare, Crown, AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Billing = () => {
  const { user } = useAuth();
  const { isSubscribed, subscription, reactivate } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<"monthly" | "yearly">("yearly");
  const [cancelReason, setCancelReason] = useState("too_expensive");
  const [otherReason, setOtherReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const formattedEndDate = subscription?.end_date 
    ? new Date(subscription.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
    : "Lifetime Access";

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    
    try {
      if (!subscription) throw new Error("No active subscription found.");

      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", (subscription as any).id);

      if (error) throw error;

      // History Tracking
      try {
        await (supabase as any)
          .from("subscription_history")
          .insert({
            user_id: user.id,
            plan_name: (subscription as any).plan_name,
            action: "cancelled",
            days_changed: 0,
            amount: null,
            created_at: new Date().toISOString()
          });
      } catch (histError) {
        console.error("History tracking failed:", histError);
      }

      toast({
        title: "Subscription Cancelled",
        description: `Your access will end on ${formattedEndDate}.`,
      });
      
      setIsCancelModalOpen(false);
      setTimeout(() => window.location.reload(), 1500); // Refresh to naturally resync context states
    } catch (err: any) {
      toast({
        title: "Cancellation Failed",
        description: err.message || "Could not process request.",
        variant: "destructive",
      });
      setIsCancelling(false);
    }
  };

  // Safe checks
  const planName = (subscription as any)?.plan_name || 'Free';
  const isYearly = planName.toLowerCase() === 'yearly';
  const amount = isYearly ? "₹3999/year" : (planName.toLowerCase() === 'monthly' ? "₹499/month" : "—");

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20 mt-16">
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground text-base">Manage your active plans, payment methods, and billing history.</p>
        </div>

        <div className="grid gap-8">
          {/* CURRENT PLAN */}
          <Card className="border-border bg-card shadow-sm transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Repeat className="w-5 h-5 text-primary" /> Current Plan
              </CardTitle>
              <CardDescription>Your active membership details</CardDescription>
            </CardHeader>
            <CardContent>
              {isSubscribed ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-background/50 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                    <div className="pl-2">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-foreground capitalize">{planName} Plan</h3>
                        <Badge className={subscription?.status === 'cancelled' ? "bg-destructive/10 text-destructive border border-destructive/20 shadow-none" : "bg-primary/20 text-primary border border-primary/20 shadow-none"}>
                          {subscription?.status === 'cancelled' ? "Cancelled" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{amount}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Next billing date</p>
                      <p className="font-semibold text-foreground">
                        {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Lifetime Access'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {subscription?.status === 'cancelled' ? (
                      <Button onClick={async () => {
                         await reactivate();
                         toast({ title: "Welcome back!", description: "Your CourseVerse Premium has been completely reactivated." });
                      }} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm transition-all h-11">
                        Reactivate Premium
                      </Button>
                    ) : (
                      <>
                        <Button onClick={() => setIsChangePlanModalOpen(true)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm transition-all h-11">
                          Change Plan
                        </Button>
                        <Button onClick={() => setIsCancelModalOpen(true)} variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 font-semibold transition-all h-11">
                          Cancel Subscription
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-background/30 rounded-xl border border-dashed border-border/60">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-xl mb-2">No active subscription</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">Unlock 2,000+ premium courses and exclusive communities starting at ₹333/month.</p>
                  <Button onClick={() => navigate("/subscribe")} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold transition-all">
                    View Premium Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PAYMENT METHOD */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-card rounded flex items-center justify-center border border-border">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">UPI / Razorpay</p>
                    <p className="text-xs text-muted-foreground">Default primary method</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 font-semibold">Update</Button>
              </div>
            </CardContent>
          </Card>

          {/* BILLING HISTORY */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <History className="w-5 h-5 text-primary" /> Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSubscribed ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
                    <div>
                      <p className="font-medium text-foreground capitalize">{planName} Subscription</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{amount.split('/')[0]}</p>
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-none mt-1 font-semibold">Paid</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center italic">No recent transactions found.</p>
              )}
            </CardContent>
          </Card>
          
          {/* SUPPORT */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-border bg-card shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">Need help with billing?</p>
                <p className="text-sm text-muted-foreground mt-0.5">Our support team is available 24/7 to assist you.</p>
              </div>
            </div>
            <Button onClick={() => navigate("/contact")} variant="outline" className="border-border bg-background hover:bg-accent shrink-0 font-semibold transition-all h-10 px-6">
              Contact Support
            </Button>
          </div>

        </div>
      </div>

      {/* CANCELLATION MODAL */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-foreground">
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-1 pb-2">
              Your access will continue until <span className="font-semibold text-foreground">{formattedEndDate}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Please tell us why you are cancelling:</Label>
              <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="space-y-2">
                <div className="flex items-center space-x-2 border border-border/50 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="too_expensive" id="r1" />
                  <Label htmlFor="r1" className="flex-1 cursor-pointer">Too expensive</Label>
                </div>
                <div className="flex items-center space-x-2 border border-border/50 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="not_using" id="r2" />
                  <Label htmlFor="r2" className="flex-1 cursor-pointer">Not using enough</Label>
                </div>
                <div className="flex items-center space-x-2 border border-border/50 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="better_alternative" id="r3" />
                  <Label htmlFor="r3" className="flex-1 cursor-pointer">Found better alternative</Label>
                </div>
                <div className="flex items-center space-x-2 border border-border/50 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="technical_issues" id="r4" />
                  <Label htmlFor="r4" className="flex-1 cursor-pointer">Technical issues</Label>
                </div>
                <div className="flex items-center space-x-2 border border-border/50 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="other" id="r5" />
                  <Label htmlFor="r5" className="flex-1 cursor-pointer">Other</Label>
                </div>
              </RadioGroup>
              
              {cancelReason === "other" && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                  <Input 
                    placeholder="Tell us more..." 
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-xl space-y-2 mt-4 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm text-foreground">Refund Policy</h4>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
                <li>No refund will be issued immediately upon cancellation.</li>
                <li>Access remains active until your current billing period ends.</li>
                <li>Refunds are only issued within 7 days of purchase for valid technical issues.</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" disabled={isCancelling} onClick={() => setIsCancelModalOpen(false)} className="sm:flex-1 border-border font-semibold">
              Keep Subscription
            </Button>
            <Button variant="destructive" disabled={isCancelling} onClick={handleConfirmCancel} className="sm:flex-1 font-semibold border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20">
              {isCancelling ? "Processing..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CHANGE PLAN MODAL */}
      <Dialog open={isChangePlanModalOpen} onOpenChange={setIsChangePlanModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-foreground">
              Confirm Plan Change
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-3 pb-2 text-base leading-relaxed">
              Changing your plan will start a new subscription immediately.<br/><br/>
              <span className="text-foreground font-semibold">Any remaining days from your current plan will be directly added to your new plan.</span><br/><br/>
              You will be charged full price for the new plan at checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 mt-2">
            <Label className="text-foreground font-semibold">Select your new plan:</Label>
            <RadioGroup value={newPlan} onValueChange={(v: any) => setNewPlan(v)} className="space-y-2">
              <div className="flex items-center space-x-2 border border-border/50 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="monthly" id="plan-monthly" />
                <Label htmlFor="plan-monthly" className="flex-1 cursor-pointer font-medium">Monthly Access (₹499/mo)</Label>
              </div>
              <div className="flex items-center space-x-2 border border-border/50 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="yearly" id="plan-yearly" />
                <Label htmlFor="plan-yearly" className="flex-1 cursor-pointer font-medium">Yearly Access (₹3999/year)</Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsChangePlanModalOpen(false)} className="sm:flex-1 border-border font-semibold">
              Cancel
            </Button>
            <Button onClick={() => navigate(`/subscription-checkout?plan=${newPlan}`)} className="sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm transition-all h-11">
              Continue to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Billing;
