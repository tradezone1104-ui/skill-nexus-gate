import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const isUUID = (str: string) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const LOCAL_STORAGE_KEY = "cv_wishlist_dummy_ids";

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Helper to get dummy IDs from localStorage
  const getLocalDummyIds = (): string[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  // Helper to save dummy IDs to localStorage
  const saveLocalDummyIds = (ids: string[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
  };

  const fetchWishlist = useCallback(async () => {
    setLoading(true);

    // 1. Get dummy IDs from local storage
    const localIds = getLocalDummyIds();
    const combinedIds = new Set<string>(localIds);

    // 2. If logged in, get real IDs from Supabase
    if (user) {
      const { data, error } = await supabase
        .from("wishlist")
        .select("course_id")
        .eq("user_id", user.id);

      if (!error && data) {
        data.forEach((r: { course_id: string }) => {
          if (isUUID(r.course_id)) {
            combinedIds.add(r.course_id);
          }
        });
      } else if (error) {
        console.error("[useWishlist] fetch error:", error);
      }
    }

    setWishlistIds(combinedIds);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(
    async (courseId: string) => {
      const isInWishlist = wishlistIds.has(courseId);

      // Case A: Dummy Course (Non-UUID)
      if (!isUUID(courseId)) {
        const localIds = getLocalDummyIds();
        let updated: string[];
        if (isInWishlist) {
          updated = localIds.filter(id => id !== courseId);
          toast({ title: "Removed", description: "Example course removed from your wishlist." });
        } else {
          updated = [...localIds, courseId];
          toast({ title: "Added", description: "Example course saved to your wishlist (local storage)." });
        }
        saveLocalDummyIds(updated);
        setWishlistIds(new Set(updated));
        return;
      }

      // Case B: Real Course (UUID) - Requires Login
      if (!user) {
        toast({ title: "Please log in", description: "Sign in to save real courses to your wishlist.", variant: "destructive" });
        return;
      }

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
          console.error("[useWishlist] remove error:", error);
          // Revert
          setWishlistIds((prev) => new Set(prev).add(courseId));
          toast({ title: "Error", description: "Could not remove from wishlist.", variant: "destructive" });
        } else {
          toast({ title: "Removed", description: "Course removed from your wishlist." });
        }
      } else {
        const { error } = await supabase
          .from("wishlist")
          .upsert(
            { user_id: user.id, course_id: courseId },
            { onConflict: "user_id,course_id" }
          );

        if (error) {
          console.error("[useWishlist] Error adding to wishlist:", error);
          // Revert
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(courseId);
            return next;
          });
          toast({ title: "Error", description: error.message || "Could not add to wishlist.", variant: "destructive" });
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
