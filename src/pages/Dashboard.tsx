import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Heart, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { useAuth } from "@/contexts/AuthContext";
import { courses } from "@/data/courses";

const Dashboard = () => {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Learner";

  // Mock sections using existing course data
  const continueLearning = courses.slice(0, 4);
  const recommended = courses.slice(8, 16);
  const trending = courses.slice(16, 24);
  const wishlist = courses.slice(24, 28);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Welcome section */}
      <section className="border-b border-border bg-card">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <h1 className="font-display font-bold text-3xl text-foreground">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-muted-foreground mt-2">Pick up where you left off or discover something new.</p>
        </div>
      </section>

      {/* Continue Learning */}
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

      {/* Recommended */}
      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-display font-bold text-xl text-foreground">Recommended for You</h2>
          </div>
          <Link to="/courses">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              Explore <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommended.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-display font-bold text-xl text-foreground">Trending Courses</h2>
          </div>
          <Link to="/courses">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Wishlist preview */}
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
          {wishlist.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
