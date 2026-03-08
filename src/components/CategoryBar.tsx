import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categoryGroups } from "@/data/categoryData";

const CategoryBar = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (catId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredCategory(catId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHoveredCategory(null), 150);
  };

  const handleSubbarEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const scroll = (dir: "left" | "right") => {
    barRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const activeCat = categoryGroups.find((c) => c.id === hoveredCategory);

  return (
    <div className="relative z-40" onMouseLeave={handleMouseLeave}>
      {/* Main category bar */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 relative">
          <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 p-1 rounded-r border-r border-border text-muted-foreground hover:text-foreground lg:hidden">
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={barRef} className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 px-6 lg:px-0 lg:justify-center">
            {categoryGroups.map((cat) => (
              <div
                key={cat.id}
                onMouseEnter={() => handleMouseEnter(cat.id)}
                className="relative"
              >
                <Link
                  to={`/courses?category=${cat.id}`}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${hoveredCategory === cat.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </div>

          <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 p-1 rounded-l border-l border-border text-muted-foreground hover:text-foreground lg:hidden">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal subcategory bar */}
      {activeCat && (
        <div
          onMouseEnter={handleSubbarEnter}
          className="border-b border-border bg-background animate-fade-in"
          style={{ padding: "10px 20px" }}
        >
          <div className="container mx-auto px-4 flex items-center gap-4 overflow-x-auto scrollbar-hide">
            {activeCat.subcategories.map((sub) => (
              <Link
                key={sub.id}
                to={`/courses?category=${activeCat.id}&sub=${sub.id}`}
                className="text-sm whitespace-nowrap text-muted-foreground hover:text-primary transition-colors py-1"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBar;
