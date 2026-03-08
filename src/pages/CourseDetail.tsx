import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, Users, Clock, BookOpen, CheckCircle, MessageCircle, Heart,
  ShoppingCart, Play, ChevronDown, ChevronUp, Globe, Calendar, Award,
  Shield, Lock, Timer, Gift, Share2, Crown, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbSeparator, BreadcrumbPage
} from "@/components/ui/breadcrumb";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import CourseReviews from "@/components/CourseReviews";
import CategoryBar from "@/components/CategoryBar";
import { getCourseById, getCoursesByCategory, courses } from "@/data/courses";
import { categoryGroups } from "@/data/categoryData";
import { useCartContext } from "@/contexts/CartContext";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { usePurchaseContext } from "@/contexts/PurchaseContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

/* ── Scroll-reveal hook ── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.unobserve(el); } },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, className: visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5", style: { transition: "opacity 0.5s ease, transform 0.5s ease" } };
}

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reveal = useScrollReveal();
  return (
    <div ref={reveal.ref} className={`${reveal.className} ${className}`} style={reveal.style}>
      {children}
    </div>
  );
}

// Generate deterministic fake course sections from course data
function generateSections(course: ReturnType<typeof getCourseById>) {
  if (!course) return [];
  const sectionCount = Math.max(4, Math.min(12, Math.floor(course.lessons / 8)));
  const sections = [];
  let lessonCounter = 1;
  const lessonsPerSection = Math.ceil(course.lessons / sectionCount);

  for (let i = 0; i < sectionCount; i++) {
    const lectureCount = i === sectionCount - 1
      ? course.lessons - lessonCounter + 1
      : lessonsPerSection;
    const lectures = [];
    for (let j = 0; j < lectureCount && lessonCounter <= course.lessons; j++) {
      lectures.push({
        title: `Lesson ${lessonCounter}: ${getTopicName(course.subcategory, lessonCounter)}`,
        duration: `${Math.floor(Math.random() * 15) + 3}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        preview: j === 0 && i === 0,
      });
      lessonCounter++;
    }
    sections.push({
      title: getSectionName(course.subcategory, i),
      lectures,
      duration: `${Math.floor(Math.random() * 50) + 20}m`,
    });
  }
  return sections;
}

function getSectionName(sub: string, idx: number) {
  const names = [
    "Getting Started & Fundamentals",
    "Core Concepts Deep Dive",
    "Practical Application & Setup",
    "Advanced Strategies",
    "Risk Management Techniques",
    "Real-World Case Studies",
    "Live Market Analysis",
    "Building Your System",
    "Optimization & Fine-Tuning",
    "Psychology & Discipline",
    "Portfolio Integration",
    "Final Project & Next Steps",
  ];
  return names[idx % names.length];
}

function getTopicName(sub: string, idx: number) {
  const topics = [
    "Introduction & Overview", "Key Terminology", "Setting Up Your Workspace",
    "Understanding the Basics", "First Practical Exercise", "Common Mistakes to Avoid",
    "Intermediate Techniques", "Pattern Recognition", "Building Confidence",
    "Advanced Analysis", "Strategy Development", "Backtesting Your Approach",
    "Real-Time Practice", "Managing Risk", "Position Sizing",
    "Psychological Aspects", "Journaling & Review", "Community Q&A",
    "Putting It All Together", "Next Steps & Resources",
  ];
  return topics[(idx - 1) % topics.length];
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const course = getCourseById(id || "");
  const { addToCart, isInCart } = useCartContext();
  const { toggleWishlist, isWishlisted } = useWishlistContext();
  const { isPurchased } = usePurchaseContext();
  const { isSubscribed } = useSubscription();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = thumbnailRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [course?.id]);

  const sections = useMemo(() => generateSections(course), [course?.id]);

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
  const moreFromInstructor = courses.filter(c => c.instructor === course.instructor && c.id !== course.id).slice(0, 4);
  const purchased = isPurchased(course.id);
  const hasAccess = purchased || isSubscribed;
  const wishlisted = isWishlisted(course.id);
  const inCart = isInCart(course.id);

  const catGroup = categoryGroups.find(g => g.id === course.category);
  const catName = catGroup?.name || course.category;
  const subCat = catGroup?.subcategories.find(s => s.id === course.subcategory);
  const subName = subCat?.name || course.subcategory;

  const daysLeft = (parseInt(course.id.replace("course-", ""), 10) % 5) + 1;
  const totalLectures = sections.reduce((s, sec) => s + sec.lectures.length, 0);

  const learningPoints = [
    `Master the fundamentals of ${course.title.toLowerCase()}`,
    "Build real-world trading strategies from scratch",
    "Understand risk management and position sizing",
    "Read and analyze market charts with confidence",
    "Develop a disciplined trading psychology",
    "Apply advanced techniques used by professionals",
    "Create your own personalized trading system",
    "Access exclusive community resources and support",
  ];

  const requirements = [
    "No prior experience required — we start from the basics",
    "A computer or mobile device with internet access",
    "A demo or real trading/demat account (guidance provided)",
    "Willingness to practice and learn consistently",
  ];

  const updateMonth = ["January", "February", "March"][(parseInt(course.id.replace("course-", ""), 10)) % 3];

  const handleBuyNow = () => {
    navigate(`/checkout?course=${course.id}`);
  };

  const handleToggleExpandAll = () => {
    if (expandAll) {
      setOpenSections([]);
    } else {
      setOpenSections(sections.map((_, i) => `section-${i}`));
    }
    setExpandAll(!expandAll);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />

      {/* Dark hero header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6 lg:py-10">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/courses" className="text-muted-foreground hover:text-foreground text-xs">Courses</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/courses?category=${course.category}`} className="text-muted-foreground hover:text-foreground text-xs">{catName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/courses?category=${course.category}&sub=${course.subcategory}`} className="text-muted-foreground hover:text-foreground text-xs">{subName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">{course.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="lg:max-w-[65%]">
            <h1 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-3">{course.title}</h1>
            <p className="text-muted-foreground text-sm md:text-base mb-4 leading-relaxed line-clamp-2">{course.description}</p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {course.rating >= 4.5 && (
                <Badge className="bg-warning/20 text-warning border-warning/30 text-xs font-semibold">Bestseller</Badge>
              )}
              {course.rating >= 4.0 && course.rating < 4.5 && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-semibold">Top Rated</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
              <span className="text-warning font-bold">{course.rating}</span>
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(course.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-muted-foreground">({(course.students * 0.3).toFixed(0)} ratings)</span>
              <span className="text-muted-foreground">{course.students.toLocaleString()} students</span>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              Created by <Link to={`/courses?q=${course.instructor}`} className="text-secondary hover:underline">{course.instructor}</Link>
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Last updated {updateMonth} 2026</span>
              <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> English / Hindi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ===== LEFT SIDE ===== */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you will learn */}
            <RevealSection>
              <div className="border border-border rounded-lg p-6">
                <h2 className="font-display font-bold text-xl text-foreground mb-4">What you'll learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {learningPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* Course Content */}
            <RevealSection>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">Course Content</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sections.length} sections · {totalLectures} lectures · {course.duration} total length
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleToggleExpandAll} className="text-secondary text-xs hover:text-secondary/80">
                  {expandAll ? "Collapse all" : "Expand all sections"}
                </Button>
              </div>

              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
                className="border border-border rounded-lg overflow-hidden"
              >
                {sections.map((section, i) => (
                  <AccordionItem key={i} value={`section-${i}`} className="border-b border-border last:border-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                      <div className="flex items-center justify-between w-full pr-2">
                        <span className="text-sm font-semibold text-foreground text-left">{section.title}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {section.lectures.length} lectures · {section.duration}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      {section.lectures.map((lec, j) => (
                        <div key={j} className="flex items-center justify-between px-6 py-2.5 border-t border-border/50 hover:bg-muted/20">
                          <div className="flex items-center gap-2">
                            {hasAccess || lec.preview ? (
                              <Play className="h-3.5 w-3.5 text-primary shrink-0" />
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                            )}
                            <span className="text-sm text-muted-foreground">{lec.title}</span>
                            {lec.preview && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Preview</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground">{lec.duration}</span>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </RevealSection>

            {/* Requirements */}
            <RevealSection>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">Requirements</h2>
              <ul className="space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-foreground mt-1">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </RevealSection>

            {/* Description */}
            <RevealSection>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">Description</h2>
              <div className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-line ${!showFullDesc ? "line-clamp-6" : ""}`}>
                {course.longDescription}
                {"\n\nThis course is regularly updated with new content and real market examples. Join thousands of students who have transformed their trading careers with this comprehensive program. Whether you're a complete beginner or an experienced trader looking to refine your edge, this course provides actionable insights you can apply immediately.\n\nYou'll also get access to our exclusive Telegram community where you can discuss strategies, share trade setups, and learn from fellow students and mentors."}
              </div>
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-secondary hover:underline text-sm font-medium mt-2 flex items-center gap-1"
              >
                {showFullDesc ? "Show less" : "Show more"}
                {showFullDesc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </RevealSection>

            {/* Instructor */}
            <RevealSection>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">Instructor</h2>
              <Link to={`/courses?q=${course.instructor}`} className="text-secondary hover:underline font-semibold text-lg">
                {course.instructor}
              </Link>
              <p className="text-xs text-muted-foreground mt-1">Professional Trader & Educator</p>

              <div className="flex items-start gap-4 mt-4">
                <div className="h-20 w-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold shrink-0">
                  {course.instructor.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-warning" /> {course.rating} Instructor Rating</span>
                    <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> {Math.floor(course.students * 0.3)} Reviews</span>
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {(course.students * 3).toLocaleString()} Students</span>
                    <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {Math.floor(Math.random() * 12) + 3} Courses</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {course.instructor} is a seasoned market professional with over 8 years of experience in financial markets. Known for a practical, no-nonsense teaching style that breaks down complex concepts into actionable steps.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Reviews */}
            <RevealSection>
              <CourseReviews courseId={course.id} />
            </RevealSection>
          </div>

          {/* ===== RIGHT SIDE — STICKY PURCHASE CARD ===== */}
          <div className="hidden lg:block lg:col-span-1">
            <div ref={thumbnailRef} className="h-0" />

            <div
              className="sticky top-20"
              style={{ transition: "box-shadow 0.3s ease" }}
            >
              <div className={`bg-card rounded-xl border border-border overflow-hidden transition-shadow duration-300 ${isSticky ? "shadow-lg" : "shadow-card"}`}>
                {/* Thumbnail — hides when sticky */}
                <div
                  className="overflow-hidden transition-all duration-400 ease-in-out"
                  style={{
                    maxHeight: isSticky ? 0 : 300,
                    opacity: isSticky ? 0 : 1,
                    transition: "max-height 0.4s ease, opacity 0.3s ease",
                  }}
                >
                  <div className="aspect-video relative">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-background/80 flex items-center justify-center">
                        <Play className="h-6 w-6 text-foreground ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {hasAccess ? (
                    /* ── Owned / Subscribed state ── */
                    <div className="space-y-3">
                      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                        <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="font-semibold text-foreground">{purchased ? "You own this course" : "Included in Premium"}</p>
                        <p className="text-xs text-muted-foreground mt-1">Access via Telegram below</p>
                      </div>
                      <a href={course.telegramLink} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="w-full bg-info text-foreground hover:bg-info/90 font-semibold">
                          <MessageCircle className="mr-2 h-5 w-5" /> Join Telegram Channel
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <>
                      {/* ── 1. SUBSCRIPTION BANNER ── */}
                      <div className="space-y-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                          <Crown className="h-3.5 w-3.5 text-warning" />
                          <span>This course is included in Premium</span>
                        </div>
                        <p className="font-display font-bold text-base text-foreground leading-tight">
                          Subscribe to CourseVerse Premium
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Get this course plus 2000+ top courses
                        </p>
                        <Button
                          size="lg"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                          onClick={() => navigate("/subscription-checkout")}
                        >
                          Start Subscription
                        </Button>
                        <p className="text-xs text-muted-foreground">Starting at ₹333/month</p>
                        <p className="text-[11px] text-muted-foreground/70">Cancel anytime</p>
                      </div>

                      {/* ── 2. OR DIVIDER ── */}
                      <div className="flex items-center gap-3">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground font-medium">or</span>
                        <Separator className="flex-1" />
                      </div>

                      {/* ── 3. INDIVIDUAL PURCHASE ── */}
                      <div className="space-y-3">
                        {/* Price */}
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-display font-bold text-3xl text-foreground">₹{course.price}</span>
                            <span className="text-base text-muted-foreground line-through">₹{course.originalPrice}</span>
                            <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">{discount}% off</Badge>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5 text-warning text-xs font-medium">
                            <Timer className="h-3.5 w-3.5" />
                            <span>{daysLeft} day{daysLeft > 1 ? "s" : ""} left at this price!</span>
                          </div>
                        </div>

                        {/* Add to Cart + Wishlist row */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => addToCart(course.id)}
                            size="lg"
                            variant="outline"
                            className="flex-1 font-semibold"
                            disabled={inCart}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {inCart ? "In Cart" : "Add to Cart"}
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            className="px-3"
                            onClick={() => toggleWishlist(course.id)}
                          >
                            <Heart className={`h-5 w-5 ${wishlisted ? "fill-destructive text-destructive" : ""}`} />
                          </Button>
                        </div>

                        {/* Buy Now */}
                        <Button
                          onClick={handleBuyNow}
                          size="lg"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow"
                        >
                          Buy Now — ₹{course.price}
                        </Button>

                        {/* Guarantee texts */}
                        <div className="text-center space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">7-day refund only if any issue found</p>
                          <p className="text-[11px] text-muted-foreground">Full Lifetime Access</p>
                        </div>
                      </div>

                      {/* ── 4. BOTTOM LINKS ── */}
                      <Separator />
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <button className="text-foreground hover:underline transition-all">Share</button>
                        <span className="text-border">|</span>
                        <button className="text-foreground hover:underline transition-all">Gift this Course</button>
                        <span className="text-border">|</span>
                        <button className="text-foreground hover:underline transition-all">Apply Coupon</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More from Instructor */}
        {moreFromInstructor.length > 0 && (
          <RevealSection className="mt-16">
            <h2 className="font-display font-bold text-2xl text-foreground mb-6">More from {course.instructor}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto">
              {moreFromInstructor.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </RevealSection>
        )}

        {/* Related */}
        {related.length > 0 && (
          <RevealSection className="mt-16">
            <h2 className="font-display font-bold text-2xl text-foreground mb-6">Students also bought</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </RevealSection>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      {!hasAccess && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-50 flex items-center gap-3 shadow-card">
          <div className="shrink-0">
            <span className="font-display font-bold text-lg text-foreground">₹{course.price}</span>
            <span className="text-xs text-muted-foreground line-through ml-1.5">₹{course.originalPrice}</span>
          </div>
          <Button onClick={handleBuyNow} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Buy Now
          </Button>
          <Button variant="outline" size="icon" onClick={() => addToCart(course.id)} disabled={inCart}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CourseDetail;
