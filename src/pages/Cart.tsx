import { ShoppingCart, Trash2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { useCartContext } from "@/contexts/CartContext";
import { usePurchaseContext } from "@/contexts/PurchaseContext";
import { useCvCoins } from "@/hooks/useCvCoins";
import { getCourseById } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

const isUUID = (str: string) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const Cart = () => {
  const { cartIds, loading, removeFromCart } = useCartContext();
  const { isPurchased, addPurchasedIds } = usePurchaseContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const { balance, spendCoins } = useCvCoins();
  const [coinsToUse, setCoinsToUse] = useState(0);

  const fetchSupabaseCourses = async (uuids: string[]) => {
    if (uuids.length === 0) return [];
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .in("id", uuids);
    if (error) {
      console.error("[Cart] Supabase fetch error:", error);
      return [];
    }
    return data || [];
  };

  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setLoadingCourses(true);
      const uuids = Array.from(cartIds).filter(isUUID);
      const data = await fetchSupabaseCourses(uuids);
      setDbCourses(data);
      setLoadingCourses(false);
    };
    if (cartIds.size > 0) {
      loadDetails();
    } else {
      setDbCourses([]);
    }
  }, [cartIds]);

  const allCourses = useMemo(() => {
    const dummyIds = Array.from(cartIds).filter(id => !isUUID(id));
    const dummies = dummyIds.map(getCourseById).filter(Boolean);
    
    // Combine dummy details with Supabase details
    const combined = [...dummies, ...dbCourses].filter(c => !isPurchased(c.id));
    return combined;
  }, [cartIds, dbCourses, isPurchased]);

  const totalPrice = allCourses.reduce((sum, c) => sum + (Number(c?.price) || 0), 0);
  const totalOriginal = allCourses.reduce((sum, c) => sum + (Number(c?.original_price || c?.originalPrice) || 0), 0);
  const totalSavings = totalOriginal - totalPrice;
  const maxCoins = Math.min(balance, totalPrice);
  const finalPrice = totalPrice - coinsToUse;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl text-foreground mb-8">Shopping Cart</h1>

        {loading || loadingCourses ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : allCourses.length === 0 ? (
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
              {allCourses.map((course) => (
                <div
                  key={course!.id}
                  className="bg-card rounded-xl border border-border p-4 flex gap-4 items-start"
                >
                  <Link to={`/course/${course!.id}`} className="shrink-0">
                    <img
                      src={course!.thumbnail_url || course!.thumbnail}
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
                    <p className="text-xs text-muted-foreground mt-1">by {course!.instructor_name || course!.instructor}</p>
                    <p className="text-xs text-muted-foreground">{course!.duration_hours ? `${course!.duration_hours}h` : course!.duration} · {course!.total_lectures || course!.lessons} lessons</p>
                  </div>
                  <div className="text-right shrink-0 space-y-2">
                    <div>
                      <p className="font-display font-bold text-foreground">₹{course!.price}</p>
                      <p className="text-xs text-muted-foreground line-through">₹{course!.original_price || course!.originalPrice}</p>
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
                    <span>Subtotal ({allCourses.length} {allCourses.length === 1 ? "course" : "courses"})</span>
                    <span>₹{totalOriginal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-primary font-medium">
                    <span>Discount</span>
                    <span>-₹{totalSavings.toLocaleString()}</span>
                  </div>

                  {/* CV Coins Section */}
                  {user && balance > 0 && (
                    <div className="border-t border-border pt-3 space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="text-xs">You have <strong className="text-foreground">{balance}</strong> CV Coins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={maxCoins}
                          value={coinsToUse || ""}
                          onChange={(e) => {
                            const v = Math.min(Math.max(0, Number(e.target.value)), maxCoins);
                            setCoinsToUse(v);
                          }}
                          placeholder="Coins to use"
                          className="h-8 text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 h-8 text-xs"
                          onClick={() => setCoinsToUse(maxCoins)}
                        >
                          Use Max
                        </Button>
                      </div>
                      {coinsToUse > 0 && (
                        <div className="flex justify-between text-primary font-medium">
                          <span>CV Coins ({coinsToUse})</span>
                          <span>-₹{coinsToUse.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-border pt-2 flex justify-between text-foreground font-bold text-lg">
                    <span>Total</span>
                    <span>₹{finalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => {
                    if (!user) { navigate("/login"); return; }
                    navigate("/checkout");
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Proceed to Checkout
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
