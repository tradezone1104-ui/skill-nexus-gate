import { Link } from "react-router-dom";
import { Star, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/data/courses";

const CourseCard = ({ course }: { course: Course }) => {
  const discount = Math.round((1 - course.price / course.originalPrice) * 100);

  return (
    <Link to={`/course/${course.id}`} className="group block">
      <div className="rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-glow hover:-translate-y-1">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
              {discount}% OFF
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground text-xs">
              {course.level}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
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

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-foreground">₹{course.price}</span>
              <span className="text-sm text-muted-foreground line-through">₹{course.originalPrice}</span>
            </div>
            <span className="text-xs text-muted-foreground">{course.instructor}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
