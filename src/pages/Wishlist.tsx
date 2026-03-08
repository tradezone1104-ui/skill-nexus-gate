import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { getCourseById } from "@/data/courses";

const Wishlist = () => {
  const { wishlistIds, loading } = useWishlistContext();
  const courses = Array.from(wishlistIds)
    .map(getCourseById)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl text-foreground mb-8">My Wishlist</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : courses.length === 0 ? (
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
            {courses.map((course) => (
              <CourseCard key={course!.id} course={course!} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
