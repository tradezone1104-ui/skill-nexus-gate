import { GraduationCap, Clock, BookOpen, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { usePurchaseContext } from "@/contexts/PurchaseContext";
import { useAuth } from "@/contexts/AuthContext";
import { getCourseById } from "@/data/courses";
import { Progress } from "@/components/ui/progress";

const MyLearning = () => {
  const { user, loading: authLoading } = useAuth();
  const { purchasedIds } = usePurchaseContext();

  const courses = Array.from(purchasedIds)
    .map(getCourseById)
    .filter(Boolean);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <CategoryBar />
        <div className="container mx-auto px-4 py-12">
          <p className="text-muted-foreground">Loading…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl text-foreground">My Learning</h1>
          {courses.length > 0 && (
            <Link to="/purchase-history">
              <Button variant="outline" size="sm">Purchase History</Button>
            </Link>
          )}
        </div>

        {!user || courses.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center space-y-4">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="font-display font-semibold text-xl text-foreground">No courses yet</h2>
            <p className="text-muted-foreground">Start learning by purchasing your first course or subscribing to Premium.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/courses">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Courses</Button>
              </Link>
              <Link to="/subscribe">
                <Button variant="outline">Subscribe</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              // Simulated progress (could be stored in DB later)
              const progress = Math.floor(Math.random() * 30);
              return (
                <div key={course!.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-glow flex flex-col">
                  <Link to={`/course/${course!.id}`} className="block">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={course!.thumbnail}
                        alt={course!.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <div className="p-4 flex-1 flex flex-col space-y-3">
                    <Link to={`/course/${course!.id}`}>
                      <h3 className="font-display font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {course!.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground">{course!.instructor}</p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course!.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course!.lessons} lessons
                      </span>
                    </div>

                    <div className="mt-auto pt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{progress}% complete</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />

                      <div className="flex gap-2 pt-1">
                        <Link to={`/course/${course!.id}`} className="flex-1">
                          <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" /> Continue
                          </Button>
                        </Link>
                        {course!.telegramLink && (
                          <a href={course!.telegramLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                              <MessageCircle className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyLearning;
