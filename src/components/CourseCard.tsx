import { Link } from "react-router-dom";
import { Star, Users, Clock, ShoppingCart, Heart, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { useCartContext } from "@/contexts/CartContext";
import { usePurchaseContext } from "@/contexts/PurchaseContext";
import type { Course } from "@/data/courses";

const CourseCard = ({ course }: { course: Course }) => {
  const { isWishlisted, toggleWishlist } = useWishlistContext();
  const { isInCart, addToCart } = useCartContext();
  const { isPurchased } = usePurchaseContext();
  const discount = Math.round((1 - course.price / course.originalPrice) * 100);

  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-glow hover:-translate-y-1 flex flex-col">
      <Link to={`/course/${course.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {isPurchased(course.id) ? (
              <Badge className="bg-emerald-600 text-primary-foreground text-xs font-semibold gap-1">
                <CheckCircle className="h-3 w-3" /> Purchased
              </Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
                {discount}% OFF
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground text-xs">
              {course.level}
            </Badge>
          </div>
        </div>
      </Link>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <Link to={`/course/${course.id}`}>
          <h3 className="font-display font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.students.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-foreground">₹{course.price}</span>
              <span className="text-sm text-muted-foreground line-through">₹{course.originalPrice}</span>
            </div>
            <span className="text-xs text-muted-foreground">{course.instructor}</span>
          </div>

          {isPurchased(course.id) ? (
            <div className="flex items-center gap-2">
              <Link to={`/course/${course.id}`} className="flex-1">
                <Button size="sm" className="w-full bg-emerald-600 text-primary-foreground hover:bg-emerald-700 text-xs gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" /> View Course
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleWishlist(course.id)}
                className={`border-border hover:border-primary ${isWishlisted(course.id) ? "text-destructive border-destructive/50" : "text-muted-foreground hover:text-primary"}`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted(course.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => addToCart(course.id)}
                disabled={isInCart(course.id)}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1.5"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {isInCart(course.id) ? "In Cart" : "Add to Cart"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleWishlist(course.id)}
                className={`border-border hover:border-primary ${isWishlisted(course.id) ? "text-destructive border-destructive/50" : "text-muted-foreground hover:text-primary"}`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted(course.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
