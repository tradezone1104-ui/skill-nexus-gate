import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Users, Clock, BookOpen, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import CourseReviews from "@/components/CourseReviews";
import CategoryBar from "@/components/CategoryBar";
import { getCourseById, getCoursesByCategory } from "@/data/courses";
import { useState } from "react";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const course = getCourseById(id || "");
  const [purchased, setPurchased] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display font-bold text-2xl text-foreground">Course not found</h1>
          <Link to="/courses"><Button className="mt-4">Browse Courses</Button></Link>
        </div>
      </div>
    );
  }

  const discount = Math.round((1 - course.price / course.originalPrice) * 100);
  const related = getCoursesByCategory(course.category).filter(c => c.id !== course.id).slice(0, 4);

  const handleBuy = () => {
    // In production, this would trigger Stripe payment
    setPurchased(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />

      <div className="container mx-auto px-4 py-8">
        <Link to="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-xl overflow-hidden aspect-video">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-primary/20 text-primary border-primary/30">{course.category.replace("-", " ")}</Badge>
                <Badge variant="secondary">{course.level}</Badge>
              </div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">{course.title}</h1>
              <p className="text-muted-foreground">by <span className="text-foreground font-medium">{course.instructor}</span></p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-warning text-warning" /> {course.rating} rating</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.students.toLocaleString()} students</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</span>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-display font-bold text-xl text-foreground">About This Course</h2>
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed">{course.longDescription}</div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-display font-bold text-xl text-foreground">What's Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Full lifetime access", "Certificate of completion", `${course.lessons} video lessons`, `${course.duration} of content`, "Downloadable resources", "Telegram community access"].map(item => (
                  <div key={item} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <CourseReviews courseId={course.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-6 space-y-6 shadow-card">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-display font-bold text-3xl text-foreground">₹{course.price}</span>
                  <span className="text-lg text-muted-foreground line-through">₹{course.originalPrice}</span>
                </div>
                <Badge className="bg-destructive/20 text-destructive border-destructive/30">{discount}% OFF — Limited Time</Badge>
              </div>

              {!purchased ? (
                <Button
                  onClick={handleBuy}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow"
                >
                  Buy Now — ₹{course.price}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold text-foreground">Purchase Successful!</p>
                    <p className="text-sm text-muted-foreground mt-1">Access your course via the Telegram link below</p>
                  </div>
                  <a href={course.telegramLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full bg-info text-foreground hover:bg-info/90 font-semibold">
                      <MessageCircle className="mr-2 h-5 w-5" /> Join Telegram Channel
                    </Button>
                  </a>
                </div>
              )}

              <div className="text-xs text-muted-foreground text-center">30-day money-back guarantee</div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display font-bold text-2xl text-foreground mb-6">Related Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
