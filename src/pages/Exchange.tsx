import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";

const Exchange = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <CategoryBar />
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <ArrowLeftRight className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-3">Exchange Courses</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Trade your purchased courses with other users. Exchange what you've learned for something new.</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-8 max-w-xl mx-auto text-center space-y-4">
        <p className="text-muted-foreground">Log in to view your courses available for exchange and browse offers from other users.</p>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow">
          Sign In to Exchange
        </Button>
      </div>
    </div>
    <Footer />
  </div>
);

export default Exchange;
