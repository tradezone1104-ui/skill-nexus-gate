import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Clock,
  BookOpen,
  Heart,
  Crown,
  Eye,
  Play,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { usePurchaseContext } from "@/contexts/PurchaseContext";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { getCourseById, courses, Course } from "@/data/courses";

// Simulated progress data (would come from DB in production)
const getProgress = (courseId: string) => {
  const hash = courseId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return hash % 100;
};

const CourseRow = ({
  course,
  progress,
  badge,
  showResume,
}: {
  course: Course;
  progress?: number;
  badge?: string;
  showResume?: boolean;
}) => (
  <Link
    to={`/course/${course.id}`}
    className="flex gap-4 bg-card rounded-xl border border-border p-3 hover:border-primary/50 hover:shadow-glow transition-all group"
  >
    <div className="w-36 sm:w-44 shrink-0 rounded-lg overflow-hidden aspect-video">
      <img
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
      <div>
        <div className="flex items-start gap-2">
          <h3 className="font-display font-semibold text-foreground text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          {badge && (
            <Badge className="shrink-0 bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold gap-1">
              <Crown className="h-3 w-3" />
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.lessons} lessons
          </span>
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
      {showResume && (
        <div className="mt-2">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1.5 h-8"
          >
            <Play className="h-3.5 w-3.5" /> Resume Learning
          </Button>
        </div>
      )}
    </div>
  </Link>
);

const SectionHeader = ({
  icon: Icon,
  title,
  linkTo,
  linkLabel,
}: {
  icon: React.ElementType;
  title: string;
  linkTo?: string;
  linkLabel?: string;
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="font-display font-bold text-lg text-foreground">{title}</h2>
    </div>
    {linkTo && (
      <Link to={linkTo}>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs">
          {linkLabel || "View All"} <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </Link>
    )}
  </div>
);

const MyLearning = () => {
  const { user, loading: authLoading } = useAuth();
  const { purchasedIds } = usePurchaseContext();
  const { wishlistIds } = useWishlistContext();
  const { isSubscribed } = useSubscription();

  const purchasedCourses = useMemo(
    () => Array.from(purchasedIds).map(getCourseById).filter(Boolean) as Course[],
    [purchasedIds]
  );

  const wishlistCourses = useMemo(
    () => Array.from(wishlistIds).map(getCourseById).filter(Boolean) as Course[],
    [wishlistIds]
  );

  // Simulated "last studied" = first purchased course with highest progress
  const continueCourse = purchasedCourses.length > 0 ? purchasedCourses[0] : null;

  // Simulated recently viewed (random selection from all courses)
  const recentlyViewed = useMemo(() => courses.slice(0, 6), []);

  // Subscription courses (sample if subscribed)
  const subscriptionCourses = useMemo(
    () => (isSubscribed ? courses.slice(50, 58) : []),
    [isSubscribed]
  );

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

  const hasNoCourses = !user || purchasedCourses.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />

      <div className="container max-w-[1000px] mx-auto px-4 py-10 space-y-12">
        {/* Page Header */}
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">My Learning</h1>
          <p className="text-muted-foreground mt-1">Continue your learning journey.</p>
        </div>

        {hasNoCourses ? (
          /* Empty State */
          <div className="bg-card rounded-2xl border border-border p-14 text-center space-y-5">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="font-display font-semibold text-xl text-foreground">
              You haven't started learning yet.
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start learning by purchasing your first course or subscribing to Premium.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/courses">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/subscribe">
                <Button variant="outline">Subscribe</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Section 1 – Continue Learning */}
            {continueCourse && (
              <section>
                <SectionHeader icon={Play} title="Continue Learning" />
                <CourseRow
                  course={continueCourse}
                  progress={getProgress(continueCourse.id)}
                  showResume
                />
              </section>
            )}

            {/* Section 2 – My Courses */}
            <section>
              <SectionHeader
                icon={BookOpen}
                title="My Courses"
                linkTo="/purchase-history"
                linkLabel="Purchase History"
              />
              {purchasedCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchased courses yet.</p>
              ) : (
                <div className="space-y-3">
                  {purchasedCourses.map((course) => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      progress={getProgress(course.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Section 3 – Subscription Courses */}
            {isSubscribed && subscriptionCourses.length > 0 && (
              <section>
                <SectionHeader
                  icon={Crown}
                  title="Subscription Courses"
                  linkTo="/subscribe"
                  linkLabel="Manage"
                />
                <div className="space-y-3">
                  {subscriptionCourses.map((course) => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      badge="Included in Premium"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section 4 – Wishlist Courses */}
            <section>
              <SectionHeader
                icon={Heart}
                title="Wishlist Courses"
                linkTo="/wishlist"
                linkLabel="View All"
              />
              {wishlistCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your wishlist is empty.{" "}
                  <Link to="/courses" className="text-primary hover:underline">
                    Browse courses
                  </Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {wishlistCourses.slice(0, 4).map((course) => (
                    <CourseRow key={course.id} course={course} />
                  ))}
                </div>
              )}
            </section>

            {/* Section 5 – Recently Viewed */}
            <section>
              <SectionHeader icon={Eye} title="Recently Viewed" />
              <div className="space-y-3">
                {recentlyViewed.map((course) => (
                  <CourseRow key={course.id} course={course} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyLearning;
