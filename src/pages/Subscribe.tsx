import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";

const plans = [
  {
    name: "Monthly",
    price: "₹999",
    period: "/month",
    features: ["Access to all 2000+ courses", "New courses added weekly", "Telegram community access", "Certificate of completion", "Priority support"],
    popular: false,
  },
  {
    name: "Yearly",
    price: "₹7,999",
    period: "/year",
    features: ["Everything in Monthly", "Save 33% vs monthly", "Exclusive bonus content", "1-on-1 mentor sessions", "Early access to new courses", "Free course bundles"],
    popular: true,
  },
];

const Subscribe = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <CategoryBar />
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-3">Premium Membership</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Unlock unlimited access to every course on CourseVerse, including all future updates.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map(plan => (
          <div key={plan.name} className={`bg-card rounded-xl border p-8 space-y-6 relative ${plan.popular ? "border-primary shadow-glow" : "border-border"}`}>
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
            )}
            <div>
              <h3 className="font-display font-bold text-xl text-foreground">{plan.name}</h3>
              <div className="mt-2">
                <span className="font-display font-bold text-4xl text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-3">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow">
              Subscribe Now
            </Button>
          </div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default Subscribe;
