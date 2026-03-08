import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, TrendingUp, Users, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import HeroSlider from "@/components/HeroSlider";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses, getFeaturedCourses, getCourseById } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlistContext } from "@/contexts/WishlistContext";

const stats = [
  { icon: BookOpen, value: "2,000+", label: "Courses" },
  { icon: Users, value: "1M+", label: "Students" },
  { icon: TrendingUp, value: "95%", label: "Success Rate" },
];

const Index = () => {
  const { user, profile } = useAuth();
  const { wishlistIds } = useWishlistContext();
  const featured = getFeaturedCourses();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Learner";

  const continueLearning = courses.slice(0, 4);
  const recommended = courses.slice(8, 16);
  const wishlistCourses = Array.from(wishlistIds).map(getCourseById).filter(Boolean).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <HeroSlider />

      {/* Logged-in welcome banner */}
      {user && (
        <section className="bg-card border-b border-border">
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            <h2 className="font-display font-bold text-2xl text-foreground">
              Welcome back, {displayName} 👋
            </h2>
            <p className="text-muted-foreground mt-1">Pick up where you left off or discover something new.</p>
          </div>
        </section>
      )}

      {/* Continue Learning - only for logged in users */}
      {user && (
        <section className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold text-xl text-foreground">Continue Learning</h2>
            </div>
            <Link to="/my-learning">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {continueLearning.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Stats - guest only */}
      {!user && (
        <section className="container mx-auto px-4 py-10">
          <div className="flex justify-center gap-8 md:gap-16">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended / All Courses */}
      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
              {user ? "Recommended for You" : "All Courses"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {user ? "Courses picked based on your interests" : "Top-rated courses hand-picked for you"}
            </p>
          </div>
          <Link to="/courses">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              {user ? "Explore" : "View All"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(user ? recommended : featured).map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Wishlist preview - logged in only */}
      {user && wishlistCourses.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold text-xl text-foreground">Your Wishlist</h2>
            </div>
            <Link to="/wishlist">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistCourses.map(course => (
              <CourseCard key={course!.id} course={course!} />
            ))}
          </div>
        </section>
      )}

      {/* CTA - guest only */}
      {!user && (
        <section className="container mx-auto px-4 py-10">
          <div className="rounded-2xl bg-card-gradient border border-border p-8 md:p-16 text-center shadow-glow">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of students who are already mastering the markets and building wealth.
            </p>
            <Link to="/courses">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 shadow-glow">
                Browse All Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
