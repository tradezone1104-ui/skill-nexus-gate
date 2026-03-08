import { TrendingUp, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";

const CVBusiness = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <CategoryBar />
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-3">CV Business – Reseller Program</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Earn by reselling premium courses to your network. Start your education business today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[
          { icon: DollarSign, title: "Earn Commissions", desc: "Get up to 40% commission on every course you sell through your referral link." },
          { icon: Users, title: "Build Your Network", desc: "Share courses with your audience and grow your own education business." },
          { icon: TrendingUp, title: "Track Performance", desc: "Access a dashboard to track sales, earnings, and payouts in real-time." },
        ].map(item => (
          <div key={item.title} className="bg-card rounded-xl border border-border p-6 text-center space-y-3">
            <item.icon className="h-10 w-10 text-primary mx-auto" />
            <h3 className="font-display font-bold text-lg text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 shadow-glow">
          Join CV Business
        </Button>
      </div>
    </div>
    <Footer />
  </div>
);

export default CVBusiness;
