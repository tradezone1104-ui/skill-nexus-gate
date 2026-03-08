import { ShoppingCart, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { useCartContext } from "@/contexts/CartContext";
import { getCourseById } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const Cart = () => {
  const { cartIds, loading, removeFromCart } = useCartContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const courses = Array.from(cartIds)
    .map(getCourseById)
    .filter(Boolean);

  const totalPrice = courses.reduce((sum, c) => sum + (c?.price ?? 0), 0);
  const totalOriginal = courses.reduce((sum, c) => sum + (c?.originalPrice ?? 0), 0);
  const totalSavings = totalOriginal - totalPrice;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl text-foreground mb-8">Shopping Cart</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : courses.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="font-display font-semibold text-xl text-foreground">Your cart is empty</h2>
            <p className="text-muted-foreground">Browse courses and click "Add to Cart" to get started.</p>
            <Link to="/courses">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {courses.map((course) => (
                <div
                  key={course!.id}
                  className="bg-card rounded-xl border border-border p-4 flex gap-4 items-start"
                >
                  <Link to={`/course/${course!.id}`} className="shrink-0">
                    <img
                      src={course!.thumbnail}
                      alt={course!.title}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/course/${course!.id}`}>
                      <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                        {course!.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">by {course!.instructor}</p>
                    <p className="text-xs text-muted-foreground">{course!.duration} · {course!.lessons} lessons</p>
                  </div>
                  <div className="text-right shrink-0 space-y-2">
                    <div>
                      <p className="font-display font-bold text-foreground">₹{course!.price}</p>
                      <p className="text-xs text-muted-foreground line-through">₹{course!.originalPrice}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(course!.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
                <h2 className="font-display font-bold text-lg text-foreground">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({courses.length} {courses.length === 1 ? "course" : "courses"})</span>
                    <span>₹{totalOriginal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-primary font-medium">
                    <span>Discount</span>
                    <span>-₹{totalSavings.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-foreground font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  disabled={checkingOut}
                  onClick={async () => {
                    if (!user) { navigate("/login"); return; }
                    setCheckingOut(true);
                    try {
                      const rows = courses.map((c) => ({
                        user_id: user.id,
                        course_id: c!.id,
                        price_paid: c!.price,
                      }));
                      const { error } = await supabase.from("purchases").insert(rows);
                      if (error) throw error;
                      // Clear cart after purchase
                      for (const c of courses) await removeFromCart(c!.id);
                      toast.success("Purchase complete! 🎉");
                      navigate("/purchase-history");
                    } catch (e: any) {
                      toast.error(e.message || "Checkout failed");
                    } finally {
                      setCheckingOut(false);
                    }
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  {checkingOut ? "Processing…" : "Proceed to Checkout"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">30-day money-back guarantee</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
