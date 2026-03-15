import { useState, useEffect, useMemo } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { getCourseById } from "@/data/courses";
import { supabase } from "@/integrations/supabase/client";

const isUUID = (str: string) => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const Wishlist = () => {
  const { wishlistIds, loading } = useWishlistContext();
  const fetchSupabaseCourses = async (uuids: string[]) => {
    if (uuids.length === 0) return [];
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .in("id", uuids);
    if (error) {
      console.error("[Wishlist] Supabase fetch error:", error);
      return [];
    }
    return data || [];
  };

  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setLoadingCourses(true);
      const uuids = Array.from(wishlistIds).filter(isUUID);
      const data = await fetchSupabaseCourses(uuids);
      setDbCourses(data);
      setLoadingCourses(false);
    };
    if (wishlistIds.size > 0) {
      loadDetails();
    } else {
      setDbCourses([]);
    }
  }, [wishlistIds]);

  const allCourses = useMemo(() => {
    const dummyIds = Array.from(wishlistIds).filter(id => !isUUID(id));
    const dummies = dummyIds.map(getCourseById).filter(Boolean);
    
    // Map database courses to match the Course interface expected by CourseCard
    const mappedDbCourses = dbCourses.map(c => ({
      id: c.id,
      title: c.title,
      description: c.short_description || c.description,
      longDescription: c.description,
      price: c.price || 0,
      originalPrice: c.original_price || c.price || 0,
      category: c.category,
      subcategory: c.subcategory || "",
      instructor: c.instructor_name || "Instructor",
      rating: c.rating || 4.5,
      students: c.total_students || 0,
      duration: c.duration_hours ? `${c.duration_hours}h` : "0h",
      lessons: c.total_lectures || 0,
      level: c.level || "Beginner",
      thumbnail: c.thumbnail_url || "",
      tags: c.tags || [],
      telegramLink: c.telegram_link || ""
    }));

    return [...dummies, ...mappedDbCourses];
  }, [wishlistIds, dbCourses]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl text-foreground mb-8">My Wishlist</h1>

        {loading || loadingCourses ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : allCourses.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center space-y-4">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="font-display font-semibold text-xl text-foreground">Your wishlist is empty</h2>
            <p className="text-muted-foreground">Browse courses and tap the heart icon to save them here.</p>
            <Link to="/courses">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allCourses.map((course) => (
              <CourseCard key={course.id} course={course as any} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
