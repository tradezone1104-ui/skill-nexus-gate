import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist")
      .select("course_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setWishlistIds(new Set(data.map((r: { course_id: string }) => r.course_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(
    async (courseId: string) => {
      if (!user) {
        toast({ title: "Please log in", description: "Sign in to save courses to your wishlist.", variant: "destructive" });
        return;
      }

      const isInWishlist = wishlistIds.has(courseId);

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isInWishlist) next.delete(courseId);
        else next.add(courseId);
        return next;
      });

      if (isInWishlist) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("course_id", courseId);

        if (error) {
          // Revert
          setWishlistIds((prev) => new Set(prev).add(courseId));
          toast({ title: "Error", description: "Could not remove from wishlist.", variant: "destructive" });
        } else {
          toast({ title: "Removed", description: "Course removed from your wishlist." });
        }
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ user_id: user.id, course_id: courseId });

        if (error) {
          // Revert
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(courseId);
            return next;
          });
          toast({ title: "Error", description: "Could not add to wishlist.", variant: "destructive" });
        } else {
          toast({ title: "Added", description: "Course saved to your wishlist." });
        }
      }
    },
    [user, wishlistIds],
  );

  const isWishlisted = useCallback((courseId: string) => wishlistIds.has(courseId), [wishlistIds]);

  return { wishlistIds, loading, toggleWishlist, isWishlisted, refetch: fetchWishlist };
}
