import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PartyPopper, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const insertSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const plan = searchParams.get('plan') || localStorage.getItem('selectedPlan') || 'monthly';
        const isYearly = plan === 'yearly';
        const planName = isYearly ? "Yearly" : "Monthly";
        
        // Check existing subscriptions safely
        const { data: existing } = await (supabase as any)
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .in("status", ["active", "cancelled"])
          .order("created_at", { ascending: false });

        let remainingDays = 0;
        let existingId = null;

        if (existing && existing.length > 0) {
          const currentSub = existing[0];
          existingId = currentSub.id;
          
          if (currentSub.end_date) {
            const endDate = new Date(currentSub.end_date);
            const now = new Date();
            if (endDate > now) {
              const diffTime = Math.abs(endDate.getTime() - now.getTime());
              remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
          }
        }
        
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + (isYearly ? 365 : 30) + remainingDays);
        
        let supaError = null;

        if (existingId) {
          const { error } = await (supabase as any)
            .from("subscriptions")
            .update({
              plan_name: planName,
              start_date: new Date().toISOString(),
              end_date: newEndDate.toISOString(),
              status: "active"
            })
            .eq("id", existingId);
          supaError = error;
        } else {
          const { error } = await (supabase as any)
            .from("subscriptions")
            .insert({
              user_id: user.id,
              course_id: null,
              plan_name: planName,
              start_date: new Date().toISOString(),
              end_date: newEndDate.toISOString(),
              status: "active"
            });
          supaError = error;
        }
        
        if (supaError) {
          console.error("Subscription insert error:", supaError);
        } else {
          // ALSO insert into subscription_history
          const amount = isYearly ? 3999 : 499;
          try {
            await (supabase as any)
              .from("subscription_history")
              .insert({
                user_id: user.id,
                plan_name: planName,
                action: "subscribed",
                days_changed: (isYearly ? 365 : 30) + remainingDays,
                amount: amount,
                created_at: new Date().toISOString()
              });
          } catch (histError) {
            console.error("History tracking failed:", histError);
          }

          console.log("Subscription created successfully");
          localStorage.removeItem('selectedPlan');
        }
      } catch (err) {
        console.error("Subscription flow failed:", err);
      }
    };

    insertSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <PartyPopper className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display font-extrabold text-3xl text-foreground">
          🎉 Subscription Activated!
        </h1>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-primary" /> Welcome to CourseVerse Premium
          </p>
          <p className="text-muted-foreground">You now have access to 2000+ courses</p>
        </div>
        <Button
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 px-8 text-base"
          onClick={() => navigate("/my-learning")}
        >
          Go to My Learning
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
