import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import CategoryCard from "@/components/CategoryCard";
import { categories, getFeaturedCourses } from "@/data/courses";

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

      {/* Hero */}
      <section className="bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(174 72% 50% / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(190 80% 45% / 0.1) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight">
              Master the <span className="text-gradient">Markets</span> & Build Your{" "}
              <span className="text-gradient">Wealth</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Access 2,000+ premium courses on trading, investing, stock market analysis, and business strategy from top industry experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/courses">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 shadow-glow">
                  Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/courses?category=trading">
                <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
                  Start Trading
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center gap-8 md:gap-16 mt-16">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">Browse Categories</h2>
            <p className="text-muted-foreground mt-1">Find the perfect course for your goals</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <CategoryCard key={cat.id} {...cat} />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">Featured Courses</h2>
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
      <section className="container mx-auto px-4 py-16">
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
