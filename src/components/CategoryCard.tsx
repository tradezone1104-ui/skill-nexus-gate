import { Link } from "react-router-dom";

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const CategoryCard = ({ id, name, icon, count }: CategoryCardProps) => (
  <Link
    to={`/courses?category=${id}`}
    className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1"
  >
    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
    <span className="font-display font-semibold text-foreground">{name}</span>
    <span className="text-sm text-muted-foreground">{count}+ Courses</span>
  </Link>
);

export default CategoryCard;
