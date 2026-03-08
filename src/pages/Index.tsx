import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import HeroSlider from "@/components/HeroSlider";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { getFeaturedCourses } from "@/data/courses";

const stats = [
  { icon: BookOpen, value: "2,000+", label: "Courses" },
  { icon: Users, value: "1M+", label: "Students" },
  { icon: TrendingUp, value: "95%", label: "Success Rate" },
];

const Index = () => {
  const featured = getFeaturedCourses();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <div className="pt-6">
        <HeroSlider />
      </div>

      {/* Stats */}
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

      {/* All Courses */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">All Courses</h2>
            <p className="text-muted-foreground mt-1">Top-rated courses hand-picked for you</p>
          </div>
          <Link to="/courses">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* CTA */}
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

      <Footer />
    </div>
  );
};

export default Index;
