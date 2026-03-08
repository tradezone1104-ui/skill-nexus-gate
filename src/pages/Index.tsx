import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, TrendingUp, Users, Clock, Flame, Star as StarIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import HeroSlider from "@/components/HeroSlider";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses, getFeaturedCourses, getCourseById } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseContext } from "@/contexts/PurchaseContext";
import { useMemo } from "react";

const SectionHeader = ({
  title,
  icon,
  linkTo,
  linkText,
}: {
  title: string;
  icon?: React.ReactNode;
  linkTo: string;
  linkText: string;
}) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">{title}</h2>
    </div>
    <Link to={linkTo}>
      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
        {linkText} <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </Link>
  </div>
);

const CourseScrollGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:grid-cols-2">
    {children}
  </div>
);

const Index = () => {
  const { user } = useAuth();
  const { purchasedIds } = usePurchaseContext();

  // Continue Learning – purchased courses with mock progress
  const purchasedCourses = useMemo(() => {
    return Array.from(purchasedIds)
      .map(getCourseById)
      .filter(Boolean)
      .slice(0, 4);
  }, [purchasedIds]);

  // Latest courses – last 8 generated (newest)
  const latestCourses = useMemo(() => [...courses].reverse().slice(0, 8), []);

  // Top selling – sort by student count desc
  const topSelling = useMemo(
    () => [...courses].sort((a, b) => b.students - a.students).slice(0, 8),
    []
  );

  // Recommended – middle range courses (different from latest/top)
  const recommended = useMemo(() => courses.slice(100, 108), []);

  // Featured
  const featured = useMemo(() => getFeaturedCourses().slice(0, 8), []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <HeroSlider />

      {/* SECTION 1 – Continue Learning (purchased only) */}
      {user && purchasedCourses.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-10">
          <SectionHeader
            title="Continue Learning"
            icon={<Clock className="h-5 w-5 text-primary" />}
            linkTo="/my-learning"
            linkText="View All"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {purchasedCourses.map((course) => {
              const mockProgress = Math.floor(Math.random() * 80) + 10;
              return (
                <div
                  key={course!.id}
                  className="rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-glow hover:-translate-y-1 flex flex-col"
                >
                  <Link to={`/course/${course!.id}`} className="block">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={course!.thumbnail}
                        alt={course!.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <Link to={`/course/${course!.id}`}>
                      <h3 className="font-display font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {course!.title}
                      </h3>
                    </Link>
                    <div className="space-y-1.5 mt-auto">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{mockProgress}% complete</span>
                      </div>
                      <Progress value={mockProgress} className="h-2" />
                    </div>
                    <Link to={`/course/${course!.id}`} className="mt-2">
                      <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                        Resume
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 2 – Latest Courses */}
      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <SectionHeader
          title="Latest Courses"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          linkTo="/courses"
          linkText="View All Courses"
        />
        <CourseScrollGrid>
          {latestCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </CourseScrollGrid>
      </section>

      {/* SECTION 3 – Top Selling Courses */}
      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <SectionHeader
          title="Top Selling Courses 🔥"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          linkTo="/courses"
          linkText="View All Courses"
        />
        <CourseScrollGrid>
          {topSelling.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </CourseScrollGrid>
      </section>

      {/* SECTION 4 – Recommended For You (logged in only) */}
      {user && (
        <section className="max-w-[1200px] mx-auto px-6 py-10">
          <SectionHeader
            title="Recommended For You"
            icon={<Users className="h-5 w-5 text-primary" />}
            linkTo="/courses"
          linkText="View All Courses"
        />
        <CourseScrollGrid>
          {recommended.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </CourseScrollGrid>
        </section>
      )}

      {/* SECTION 5 – Featured Courses */}
      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <SectionHeader
          title="Featured Courses ⭐"
          icon={<StarIcon className="h-5 w-5 text-primary" />}
          linkTo="/courses"
          linkText="View All Courses"
        />
        <CourseScrollGrid>
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </CourseScrollGrid>
      </section>

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
