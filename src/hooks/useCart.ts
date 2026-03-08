import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useCart() {
  const { user } = useAuth();
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartIds(new Set());
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("cart")
      .select("course_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setCartIds(new Set(data.map((r: { course_id: string }) => r.course_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (courseId: string) => {
      if (!user) {
        toast({ title: "Please log in", description: "Sign in to add courses to your cart.", variant: "destructive" });
        return;
      }
      if (cartIds.has(courseId)) return;

      setCartIds((prev) => new Set(prev).add(courseId));

      const { error } = await supabase
        .from("cart")
        .insert({ user_id: user.id, course_id: courseId });

      if (error) {
        setCartIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
        toast({ title: "Error", description: "Could not add to cart.", variant: "destructive" });
      } else {
        toast({ title: "Added to cart", description: "Course added to your cart." });
      }
    },
    [user, cartIds],
  );

  const removeFromCart = useCallback(
    async (courseId: string) => {
      if (!user) return;

      setCartIds((prev) => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });

      const { error } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (error) {
        setCartIds((prev) => new Set(prev).add(courseId));
        toast({ title: "Error", description: "Could not remove from cart.", variant: "destructive" });
      } else {
        toast({ title: "Removed", description: "Course removed from your cart." });
      }
    },
    [user],
  );

  const isInCart = useCallback((courseId: string) => cartIds.has(courseId), [cartIds]);

  const cartCount = cartIds.size;

  return { cartIds, cartCount, loading, addToCart, removeFromCart, isInCart, refetch: fetchCart };
}
